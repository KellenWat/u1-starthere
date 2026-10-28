# M2 validation evidence

Local acceptance checks passed on 2026-10-28. GitHub Actions run pending.
M3 has not started. The owner's interactive scrolling decision-path direction
is recorded in README Decisions and DESIGN.md for M3.

## Scope and acceptance

- Home `/`, catalog `/catalog/`, startup track `/start/`, and 38 direct
  `/item/{id}/` detail routes exist as ordinary static files.
- Home and catalog render from JSON. Item HTML is generated from that same
  JSON using shared escaped views, then committed. No deployment build needed.
- Catalog controls filter by category, cost, difficulty and earliest phase,
  plus text. Combined filters, zero results, clearing, unknown prices and
  URL/reload persistence were exercised in the browser.
- At a 390 × 844 viewport, completed the full 31-step track through visible
  controls: nine required steps completed and 22 optional steps skipped.
  The completion message correctly distinguished completed and skipped work.
  This tests the UI, not actual printer setup or firmware behavior.
- Checked a box using the keyboard, followed an item link and returned,
  reloaded, and verified retained progress. Tested reset, Escape cancellation,
  optional-step changes and the Continue button's focus on the next summary.
- Verified no horizontal overflow on home, catalog and track at 390 px,
  catalog/track at 320 px, and home/catalog at 1280 px. Reviewed desktop home
  and phone track/catalog screenshots. Browser console reported no errors.
- Direct item pages contain costs, prerequisites, warnings, creator credits,
  source notes and explicit untested-firmware status without client rendering.
- No framework, runtime dependencies, accounts, analytics, external fonts,
  cookies, or storage beyond track progress. Only local site assets/data load.

## Actual local command output summaries

`node scripts/render.mjs --check`

```text
PASS generated pages match JSON and template: 41 HTML pages (38 item details).
```

`node --test tests/*.test.mjs`

```text
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 444.5395
```

`.venv\Scripts\python scripts/validate.py`

```text
PASS data/items.json: 38 records (JSON Schema 2020-12)
PASS data/fixes.json: 12 records (JSON Schema 2020-12)
PASS data/phases.json: 7 records (JSON Schema 2020-12)
PASS cross-document references, prerequisite DAG, gate providers, conflicts, track order, attribution and URLs
PASS total JavaScript: 30235 / 200000 bytes
Validation passed: 3 data files; 0 errors.
```

`.venv\Scripts\python -m unittest discover -s tests -v`

```text
----------------------------------------------------------------------
Ran 25 tests in 3.236s

OK
```

The additional Python test checks internal links and local assets across the
committed output. A local traversal verified 594 such targets. Node tests
cover catalog combinations, stable ordering, variable-price handling, progress
sanitization and completion, project-prefix links, and safe text rendering.

## Repairs and limits

- The previous local server was not running. Restarted the plain static
  server, confirmed HTTP 200, and retried the browser flow successfully.
- Fixed a reset-dialog edge case: each opening now starts with a cancel
  result, so Escape cannot reuse an earlier reset decision. Retested the
  reset-then-check-then-Escape sequence; the new check remained intact.
- JavaScript budget validation now includes `.mjs`, including test/authoring
  code, instead of accidentally counting only `.js`.
- Contract 1.1.0 adds the optional-step flag. Content prices, creator credits
  and verification claims are unchanged.
- Tests use Chromium viewport sizes; no physical phone or Mobile Safari test
  is claimed. M5 still owns the full accessibility and freshness polish pass.
- Source/creator gaps from M1 remain visible in the UI. Planner, fixes search,
  embed and submission assets are deferred to their specified milestones.
- No Pages deployment yet; serve the committed site using the README command.
