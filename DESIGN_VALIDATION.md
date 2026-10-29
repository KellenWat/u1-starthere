# Design refinement — 2026-10-29

## Result and scope

Retained the owner's minimal Apple/macOS direction while simplifying hierarchy:

- White canvas, compact header, native type, lighter heading weights, quieter
  panels and consistent controls. The diagram carries the primary emphasis.
- Homepage now offers four working entrances into the same journey graph.
  Choice labels/descriptions, startup phases and catalog records render from
  the JSON data. Removed the redundant second planner promotion.
- Catalog search/category/cost/platform remain visible. Difficulty and stage
  use a native disclosure with an active count; shared URLs open it when used.
  Phone category controls span the full row to fit long names.
- Fixes use a divided list. Associated codes stay visible in collapsed rows;
  opening a row shows the cause, stop conditions and ordered checks in a
  quieter reading surface. Source notes remain available.
- Track stages use one horizontally scrollable row. Item sources, software
  requirements, planner reasons, warnings and budget deferrals retain their
  existing content and behavior.
- Restored nonempty journey routes focus/scroll the active node. The initial
  root node accounts for the header/toolbar; subsequent nodes stay full-height.

No curated data, prices, dates, prerequisites or code associations changed.
No remote assets, runtime dependencies, storage or backend were added. M5/M6
remain deferred. See README Decisions 41–43 and DESIGN.md for the reviewed plan.

## Verification completed

- Desktop homepage inspected at 1280×900 before and after the first pass.
- Phone homepage inspected at 390×844: four routes fit without horizontal
  overflow; header measured approximately 105 px. Following Something isn't
  working reached the shared symptom question, then the toolhead question and
  pogo-contact guide with the four associated codes visible.
- Catalog category/platform filters worked at 390 px: Software + iOS returned
  three records. The difficulty disclosure opened with Enter and its control
  changed the selected filter. No horizontal overflow was observed.
- Those observations informed the second pass: active-node positioning,
  full-width phone category, active extra-filter count and stronger field borders.
- A new route test verifies every homepage entrance restores its authored
  destination under a GitHub Pages project prefix. All existing planner/search
  tests still pass. Python checks cover source links, seed/reference integrity
  and validator rejection cases. Regenerated all 68 committed HTML pages.

Actual local output summary:

```text
ℹ tests 85
ℹ pass 85
ℹ fail 0
PASS total JavaScript: 129859 / 200000 bytes
Validation passed: 4 data files; 0 errors.
Ran 40 tests in 14.484s
OK
PASS generated pages match JSON and template: 68 HTML pages (63 item details).
```

`git diff --check` passed. CSS has balanced braces and one root token declaration.
The current browser viewport override was reset after testing.

## Remaining visual check

The final localhost refresh was rejected by automatic approval review because
the selected review model was at capacity. This was a review-service failure,
not a finding that the site was unsafe. No alternate browser or indirect access
was used to bypass the gate. Final browser verification of the second-pass
adjustments, reset/restored filters, and the updated track/item layouts remains
pending. No final screenshots are claimed; first-pass views were inspected in
the chat before the interruption. The automated checks above passed afterward.

## Repository handoff

Implementation commit: `340773375dd6fb15e9abe565ec6d94857cb02b77`.
The attempted `git push origin main` was also rejected by automatic approval
review because its selected model was at capacity. The push was not executed;
GitHub CI has not run for this revision. The local commit is ready to push
after review-service availability is restored. No alternate publishing path
was used to bypass the rejection.

## Files changed

- `assets/home-view.mjs` (new), `assets/app.mjs`, `assets/fix-ui.mjs`,
  `assets/journey-ui.mjs`, `assets/site.css`.
- `templates/page.html`, `scripts/render.mjs`, all 68 generated HTML pages.
- `tests/journey.test.mjs`, `README.md`, `DESIGN.md`, this report.

## Local preview

From this project folder:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`, `/catalog/`, `/fixes/`, `/start/` or `/plan/`.
The agent-owned review server is stopped at handoff. GitHub Pages activation
is separate work; this change updates the static repository.

## Follow-up review: 2026-10-29

Browser review became available again during the owner-journey audit. Resumed
the interrupted checks: Software + iOS gave three records; the difficulty
disclosure worked with Enter, showed its active count, and restored the filter
after reload; clearing filters restored all 63 items. The related stock-baseline
detail page and updated startup track were inspected. The homepage was captured
again at the normal desktop viewport. No browser console errors were observed.

The audit also caught a real nested-summary layout bug on phones and inadequate
multiline prerequisite-link hit areas. Both were corrected, then the guide was
checked at 390 and 320 px with no horizontal overflow. Deep links and keyboard
focus now open the requested guide. Progress was checked through reload and
restored to its initial unchecked state. See USER_JOURNEY_AUDIT.md for the full
review, actual test output and evidence limits. The earlier blocked attempts
above remain a historical record; this follow-up completes their visual checks.
