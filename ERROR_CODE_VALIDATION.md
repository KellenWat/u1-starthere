# Error-code lookup handoff — 2026-10-29

## Follow-up: show numbers beside each fix

The owner requested visible code numbers. Results now list every associated
code beneath the title, including when the fix is collapsed. Journey cards
also list their codes directly; only source/review notes remain expandable.
This supersedes the initial collapsed-number layout described below.

Changed `assets/fix-view.mjs`, `assets/fix-ui.mjs`, `assets/site.css`, the
existing fix-view assertions in `tests/fix-search.test.mjs`, and README
Decision 40. Browser review confirmed visible numbers on collapsed cards,
keyboard expansion and no horizontal overflow at 390 px and 320 px, including
the 15-code group. Number text is explicitly 13.12 px for phone readability.
No data associations changed. Local verification: 84 JS tests passed, four
data files validated, all 68 generated pages matched, and diff checks passed.

Preview using the same local command below; the review server is stopped
at handoff.

## Completed and verified

- Added 37 complete code mappings across eight families, four new fix cards
  (16 total), and four shared journey destinations (43 nodes). The original
  12 seed search fixtures and five golden planner personas continue to pass.
- Checked associations against Snapmaker's official table and the specific
  procedure articles listed in [coverage](ERROR_CODE_COVERAGE.md). Seven procedure pages
  and the reference table returned HTTP 200; the
  homing article and community discussion were also read through the web reader.
- Corrected the brief's `…0045` example from a maintenance reminder to a distinct
  pogo-contact fault. Kept `…0037` as the maintenance notice. Preserved named
  community attribution and conflicting homing outcomes in the JSON itself.
- Exact search accepts spaces, Unicode hyphens, compact digits and code-plus-text.
  Partial, unknown and multiple distinct identifiers never use fuzzy numeric
  matching. Nine independent code fixtures pin the expected cards; tests also
  exercise every stored identifier and input variant in reversed data order.
- Contract 1.4.0 requires review evidence on coded cards. Negative validation
  tests cover missing evidence, duplicate mappings, malformed codes, review
  status/date and tracking links. No code, date or repair facts are hardcoded
  in HTML or rendering JS.
- Browser checks: correct `…0045` and `…0037` destinations; unknown `…0046` and
  partial-code empty states; original prime-tower search; code evidence opens
  with Enter; code links reopen the correct result. The new pogo card is
  reachable through the connected journey and its shared hash.
- Responsive review: 320×740, 390×844 and 1280×900. No horizontal overflow at
  either phone width. Stop conditions precede checks; long identifier/evidence
  lists are collapsed below the checks. Browser console reported no errors.
  Local HTTP preview returned 200. Screenshots were saved outside the repo.

## Files created/changed

- Data: `data/fixes.json`, `data/journey.json`; envelope versions in
  `data/items.json` and `data/phases.json`.
- Contract: four document schemas, `scripts/validate.py`, `DATA.md`.
- UI/search: `assets/fix-search.mjs`, `assets/fix-view.mjs`, `assets/fix-ui.mjs`,
  `assets/app.mjs`, `assets/site.css`; fix-page description in
  `scripts/render.mjs` and regenerated `fixes/index.html`.
- Tests: `tests/fix-search.test.mjs`, `tests/journey.test.mjs`,
  `tests/test_data.py`, `tests/fixtures/error-codes.json`.
- Documentation: `README.md` Decisions 36–39, `ERROR_CODE_COVERAGE.md`, this report.

## Actual local output summary

```text
PASS data/items.json: 63 records (JSON Schema 2020-12)
PASS data/fixes.json: 16 records (JSON Schema 2020-12)
PASS data/phases.json: 7 records (JSON Schema 2020-12)
PASS data/journey.json: 43 records (JSON Schema 2020-12)
PASS total JavaScript: 127925 / 200000 bytes
Validation passed: 4 data files; 0 errors.
Ran 40 tests in 11.368s
OK
ℹ tests 84
ℹ pass 84
ℹ fail 0
PASS generated pages match JSON and template: 68 HTML pages (63 item details).
```

`git diff --check` passed. The existing GitHub validation workflow runs the
schemas, Python checks, JS tests and generated-page check on push.

## Preview locally

From the `u1-starthere` folder, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/fixes/?q=0002-0523-0001-0045`.
The preview server used for this review is stopped at handoff.

## Assumptions and deferred work

The latest owner request extends the brief's original keyword-only code scope.
Coverage is deliberately limited to explicit source-backed associations for
the existing community/checklist fault families. It is not an exhaustive code
directory or a reproduced repair. Firmware verification remains null. No
firmware, documents, G-code or models are rehosted. No printer control, accounts,
tracking or new browser storage was added. M5/M6 and public Pages activation
remain separate work.
