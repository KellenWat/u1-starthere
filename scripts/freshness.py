"""Weekly source review queue. Link checks never certify content or change review dates."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
import ipaddress
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from validate import load_documents, validate_documents

MARKER = '<!-- u1-starthere-freshness:v1 -->'
TITLE = '[Freshness] Source review queue'


def public_url(url):
    parsed = urlsplit(url)
    host = parsed.hostname or ''
    if parsed.scheme != 'https' or not host or parsed.username or parsed.password:
        return False
    if host in ('localhost',) or host.endswith(('.local', '.localhost')):
        return False
    try:
        return ipaddress.ip_address(host).is_global
    except ValueError:
        return '.' in host


class PublicRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not public_url(newurl):
            raise URLError('Redirect needs manual review')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def collect(documents, today):
    urls, overdue, pending = {}, [], []

    def walk(value, location):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == 'url' and isinstance(child, str) and child.startswith('https://'):
                    urls.setdefault(child, []).append(location)
                else:
                    walk(child, location + '/' + key)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, location + '/' + str(index))

    for kind in ('items', 'fixes'):
        for record in documents[kind][kind]:
            key = kind + '/' + record['id']
            walk(record, key)
            age = (today - date.fromisoformat(record['last_verified'])).days
            if age > 45:
                overdue.append({'record': key, 'last_verified': record['last_verified'], 'age_days': age})
            if record['source']['credit_status'] == 'pending':
                pending.append(key)
    for phase in documents['phases']['phases']:
        for step in phase['steps']:
            guide = step.get('guidance')
            if guide:
                key = 'phases/' + step['id']
                walk(guide, key)
                age = (today - date.fromisoformat(guide['last_verified'])).days
                if age > 45:
                    overdue.append({'record': key, 'last_verified': guide['last_verified'], 'age_days': age})
    return urls, overdue, pending


def check_url(url, opener=None, timeout=8):
    if not public_url(url):
        return {'url': url, 'state': 'review', 'detail': 'Not a public HTTPS page'}
    opener = opener or build_opener(PublicRedirects())
    for method in ('HEAD', 'GET'):
        try:
            headers = {'User-Agent': 'U1-StartHere-LinkCheck/1.0 (+https://github.com/KellenWat/u1-starthere)'}
            if method == 'GET':
                headers['Range'] = 'bytes=0-0'
            with opener.open(Request(url, method=method, headers=headers), timeout=timeout) as response:
                code = response.status
                return {'url': url, 'state': 'ok' if 200 <= code < 400 else 'review', 'detail': 'HTTP ' + str(code)}
        except HTTPError as error:
            if method == 'HEAD' and error.code in (405, 501):
                continue
            state = 'broken' if error.code in (404, 410) else 'review'
            return {'url': url, 'state': state, 'detail': 'HTTP ' + str(error.code)}
        except (URLError, TimeoutError, OSError) as error:
            return {'url': url, 'state': 'review', 'detail': type(error).__name__ + ': request could not be completed'}
    raise AssertionError('Unreachable request state')


def report(documents, today, checker=check_url):
    urls, overdue, pending = collect(documents, today)
    with ThreadPoolExecutor(max_workers=6) as pool:
        links = list(pool.map(checker, sorted(urls)))
    for link in links:
        link['records'] = sorted(set(urls[link['url']]))
    return {'checked_at': today.isoformat(), 'overdue': overdue, 'pending_credit': pending, 'links': links}


def markdown(result):
    lines = [MARKER, '# Source review queue', '', 'Checked ' + result['checked_at'] + ' (UTC).',
             'A successful HTTP response does not verify instructions, compatibility or safety.',
             'Blocked, rate-limited, temporary and network responses need manual review; only HTTP 404/410 is labeled broken.', '',
             '## Older than 45 days']
    lines.extend('- ' + row['record'] + ': ' + row['last_verified'] + ' (' + str(row['age_days']) + ' days)' for row in result['overdue'])
    if not result['overdue']:
        lines.append('None.')
    lines.extend(['', '## Links needing attention'])
    attention = [row for row in result['links'] if row['state'] != 'ok']
    for row in attention:
        lines.extend(['- ' + row['state'].upper() + ': ' + row['url'] + ' — ' + row['detail'],
                      '  Records: ' + ', '.join(row['records'])])
    if not attention:
        lines.append('None.')
    lines.extend(['', '## Creator credit still pending', *('- ' + key for key in result['pending_credit']), '',
                  'Do not update last_verified automatically. Read the primary source, preserve credit, and make a reviewed data change.',
                  'Do not treat a bot challenge as a removed model or replace its creator URL with a mirror.'])
    return '\n'.join(lines) + '\n'


def sync_issue(result, api, repository):
    """Maintain one bot-owned issue; user-created issues are never changed."""
    existing, page = None, 1
    while True:
        issues = api('GET', '/repos/' + repository + '/issues?state=open&per_page=100&page=' + str(page))
        for issue in issues:
            if issue.get('user', {}).get('type') == 'Bot' and MARKER in (issue.get('body') or ''):
                existing = issue
        if len(issues) < 100:
            break
        page += 1
    needs_review = bool(result['overdue'] or result['pending_credit'] or any(row['state'] != 'ok' for row in result['links']))
    if needs_review:
        body = markdown(result)
        if len(body) > 60000:
            body = body[:59000] + '\n\nReport truncated; download the complete workflow artifact.\n'
        if existing:
            return api('PATCH', '/repos/' + repository + '/issues/' + str(existing['number']), {'title': TITLE, 'body': body})
        return api('POST', '/repos/' + repository + '/issues', {'title': TITLE, 'body': body})
    if existing:
        return api('PATCH', '/repos/' + repository + '/issues/' + str(existing['number']), {'state': 'closed'})


def github_api(method, path, payload=None):
    token = os.environ['GITHUB_TOKEN']
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
               'User-Agent': 'U1-StartHere-Freshness', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json'}
    body = json.dumps(payload).encode() if payload is not None else None
    with build_opener().open(Request('https://api.github.com' + path, data=body, headers=headers, method=method), timeout=30) as response:
        return json.load(response)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', default='.reports')
    parser.add_argument('--publish', action='store_true', help='Maintain the bot review issue using GITHUB_TOKEN')
    args = parser.parse_args()
    documents = load_documents()
    errors = validate_documents(documents)
    if errors:
        raise SystemExit('Data validation failed; run scripts/validate.py before link checking.')
    result = report(documents, datetime.now(timezone.utc).date())
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    (output / 'freshness.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    (output / 'freshness.md').write_text(markdown(result), encoding='utf-8')
    counts = {state: sum(row['state'] == state for row in result['links']) for state in ('ok', 'broken', 'review')}
    print('Freshness:', len(result['links']), 'URLs;', counts, ';', len(result['overdue']), 'overdue reviews;', len(result['pending_credit']), 'pending credits.')
    if args.publish:
        issue = sync_issue(result, github_api, os.environ['GITHUB_REPOSITORY'])
        print('Review queue:', issue['html_url'] if issue else 'No issue needed.')


if __name__ == '__main__':
    main()
