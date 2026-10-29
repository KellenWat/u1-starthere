import copy
from datetime import date
from io import BytesIO
import sys
from pathlib import Path
import unittest
from urllib.error import HTTPError, URLError
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from freshness import collect, check_url, public_url, sync_issue, MARKER, markdown
from validate import load_documents


class Response:
    status = 200
    def __enter__(self): return self
    def __exit__(self, *args): pass


class Opener:
    def __init__(self, codes): self.codes, self.methods = iter(codes), []
    def open(self, request, timeout):
        self.methods.append(request.method)
        code = next(self.codes)
        if code >= 400: raise HTTPError(request.full_url, code, 'test', {}, BytesIO())
        return Response()


class FreshnessTests(unittest.TestCase):
    def test_forty_five_days_and_nested_sources(self):
        docs = load_documents()
        urls, stale, pending = collect(docs, date(2026, 12, 12))
        self.assertEqual(stale, [])
        urls, stale, pending = collect(docs, date(2026, 12, 14))
        self.assertTrue(any(row['record'].startswith('phases/') for row in stale))
        self.assertIn('items/ptfe-support-guides', pending)
        self.assertTrue(any('/comments/1vfvl3d/' in url for url in urls))
        self.assertTrue(any('/automatic_loading' in url for url in urls))

    def test_head_fallback_and_bot_challenges(self):
        opener = Opener([405, 200])
        self.assertEqual(check_url('https://example.org/model', opener)['state'], 'ok')
        self.assertEqual(opener.methods, ['HEAD', 'GET'])
        for code, expected in [(404, 'broken'), (410, 'broken'), (403, 'review'), (429, 'review'), (503, 'review')]:
            opener = Opener([code])
            self.assertEqual(check_url('https://example.org/model', opener)['state'], expected)
            self.assertEqual(opener.methods, ['HEAD'])

    def test_public_https_only(self):
        for url in ['http://example.org/', 'https://localhost/', 'https://127.0.0.1/', 'https://10.0.0.1/', 'https://user:pass@example.org/', 'https://printer.local/']:
            self.assertFalse(public_url(url), url)
        self.assertTrue(public_url('https://example.org/model'))

    def test_network_failure_is_manual_review(self):
        class Failed:
            def open(self, *args, **kwargs): raise URLError('secret internal text')
        result = check_url('https://example.org/', Failed())
        self.assertEqual(result['state'], 'review')
        self.assertNotIn('secret', result['detail'])

    def test_issue_created_once_then_bot_issue_updated_and_resolved(self):
        result = {'checked_at': '2026-10-29', 'overdue': [], 'pending_credit': ['items/example'], 'links': []}
        calls, existing = [], []
        def api(method, path, payload=None):
            calls.append((method, path, payload))
            if method == 'GET': return existing
            return {'number': 4, 'html_url': 'https://example.org/issue'}
        sync_issue(result, api, 'owner/repo')
        self.assertEqual(calls[-1][0], 'POST')
        existing.append({'number': 4, 'body': MARKER, 'user': {'type': 'Bot'}})
        sync_issue(result, api, 'owner/repo')
        self.assertEqual(calls[-1][0], 'PATCH')
        self.assertIn(MARKER, calls[-1][2]['body'])
        result['pending_credit'] = []
        sync_issue(result, api, 'owner/repo')
        self.assertEqual(calls[-1][2], {'state': 'closed'})

    def test_user_issue_never_edited_and_records_never_rewritten(self):
        result = {'checked_at': '2026-10-29', 'overdue': [], 'pending_credit': ['items/example'], 'links': []}
        original = copy.deepcopy(result)
        calls = []
        def api(method, path, payload=None):
            calls.append(method)
            return [{'number': 9, 'body': MARKER, 'user': {'type': 'User'}}] if method == 'GET' else {}
        sync_issue(result, api, 'owner/repo')
        self.assertEqual(calls, ['GET', 'POST'])
        self.assertEqual(original, result)
        self.assertIn('Do not update last_verified automatically', markdown(result))


if __name__ == '__main__': unittest.main()
