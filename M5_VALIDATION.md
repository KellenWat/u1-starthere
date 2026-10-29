# M5 — Embed, freshness and public-beta polish

## Acceptance evidence

| Criterion | Verification |
| --- | --- |
| Embeddable item cards and documentation | `embed.js`, `/embed/`, stable data URLs and DATA.md. Real browser rendered the stock-baseline card with correct creator/source/license links. Four embed tests cover project-prefix URLs, one credential-free fetch, failures, escaping and replacement. |
| Weekly/on-demand source monitoring | `.github/workflows/freshness.yml` validates all four documents, checks nested source URLs, saves JSON/Markdown reports and maintains one bot-owned review issue. Six offline tests cover date boundaries, HTTP classification, fallback, private literal URLs and issue ownership/lifecycle. |
| Honest badges | Item and fix views render review metadata from JSON. Runtime badges flag reviews older than 45 whole UTC days. Firmware testing stays separate; three tests cover boundaries, invalid dates, escaping and stable generated HTML. |
| About/methodology/credit/privacy | `/about/` explains evidence limits, creator rights, no affiliates, historical prices, privacy and public GitHub feedback. |
| Mobile and keyboard pass | 390 px embed/decision/planner checks showed no horizontal overflow. Native dialog opened with Enter, closed with Escape and restored focus. Keyboard choices reached the ABS/no-enclosure/basic-comfort/$150 plan: $149 planned, 11 steps and 11 reason lists. Focus landed on the result heading. |
| Beta feedback preparation | Homepage feedback link, public GitHub templates and BETA_TESTING.md. Actual participant recruitment and physical U1 validation remain future owner work; none is claimed. |
| Static public deployment | Test-gated Pages job uploads committed files directly. No site build, runtime dependency, paid domain, backend, accounts or analytics added. Live publication evidence follows below. |

Browser review caught duplicate planner page headings/restart controls and an
announcement of the default plan before it was shown. Both were repaired; the
restored plan has one visible H1 and one restart action. A complete keyboard
intake was rerun after the repair. Dialog keyboard/focus and the embed's visible
credit/source links were also inspected.

Core sampled text contrast against its actual palette: ink/white 16.10:1,
secondary text/white 6.03:1, primary blue/white 4.70:1, links/white 5.22:1, and
review-due text/background 7.26:1. This is a bounded browser/contrast review,
not a screen-reader certification or participant usability study.

## Live source check

Actual output from the read-only local check on 2026-10-29:

```text
Freshness: 83 URLs; {'ok': 51, 'broken': 0, 'review': 32} ; 0 overdue reviews; 8 pending credits.
```

HTTP success does not verify the content. A blocked/rate-limited/network result
is not a removed model. Reports remain outside Git; the Actions run saves its
own complete report. No record dates, prices or compatibility facts changed.

## Local test output

```text
ℹ tests 107
ℹ pass 107
ℹ fail 0
PASS total JavaScript: 157696 / 200000 bytes
Ran 55 tests in 19.747s
OK
PASS generated pages match JSON and template: 79 HTML pages (72 item details).
```

GitHub run evidence is recorded at publication.

## Publication verification

Repository visibility was confirmed public before this change. GitHub Pages
was disabled. The owner's request authorizes enabling the public site and
updating the repository. Publication and workflow-run results are pending at
this local-preparation commit; they will be recorded after the live checks.

## Files created/changed

- New: `embed.js`, `assets/freshness.mjs`, `content/about.html`,
  `content/embed.html`, generated About/embed pages, `scripts/freshness.py`,
  weekly workflow, feedback templates, embed/freshness tests, BETA_TESTING.md.
- Updated: shared item/fix/resource views, app/home/journey/planner UI, CSS,
  HTML template, optional renderer, validation/deployment workflow, generated
  pages, README, DATA, DESIGN, `.gitignore`, one fix-status wording assertion.
- The JSON catalog and planner rules are unchanged.

## Preview and deferred work

From this repository: `python -m http.server 8000 --bind 127.0.0.1`, then open
`http://127.0.0.1:8000/`. About/feedback is `/about/`; embed/data docs `/embed/`.
The agent-owned preview is stopped at handoff. Remaining work is real-owner
walkthroughs, source/creator resolution and M6 competition submission assets.
