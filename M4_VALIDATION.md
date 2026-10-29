# M4 validation: fixes and connected community guide

M3's prerequisite acceptance passed before this work: all five golden personas
and Actions run #9 at `3e9d310`. M4 adds the owner's interconnected decision
map and modern visual refinement alongside the required symptom search.
M5 and M6 remain deferred.

## Acceptance criteria

| Criterion | Verification |
| --- | --- |
| Keyword symptom search | `/fixes/`, home search and shared query links; deterministic normalized scoring with no library |
| Every seed phrase returns its card first | Twelve explicit fixtures in `tests/fixtures/fix-search.json`, plus all 36 authored symptom phrases |
| Fix cards and related items | Ordered checks, prominent stop conditions, severity, creator links, source limitations, review dates, untested firmware status, official support and item links |
| Connected questions and direct fixes | Thirty JSON-authored nodes; clear symptoms open cards, ambiguous ones ask a clarifier, no match offers another route/search/support |
| M3 remains valid | Five golden personas, dependency/conflict/budget invariants, URL sharing and exports remain tested |

## Automated checks

The complete suite has 63 JavaScript tests and 31 Python tests. The four data
documents pass JSON Schema validation, including journey target/fix references,
unique choice IDs and reachability. All 43 committed HTML pages match the
generator. Every local asset/page link is checked, including `/fixes/`.
The JavaScript budget counts runtime, authoring and test modules together.

New cases cover unknown searches, punctuation/case, data-order independence,
escaping unsafe text/links, all seed rankings, preserved fix-step order,
shared questions, clarifier outcomes, helped/still-happening routes, cycle
truncation, removal of abandoned route effects, route-link validation and
conditional planner intake.

## Browser checks

Chromium desktop and 390×844 / 320×740 phone viewports:

- Problem → print quality → prime tower opens its guide immediately, focuses
  the new screen and shows stop conditions before checks. No planner intake.
- Still happening offers another route; revisiting symptoms truncates the
  previous route. Filament identification asks about dryer feed; No opens an
  honest unmatched route, not a fabricated diagnosis. Reload restores it.
- Explore → five-plus colors asks only stage, comfort and budget. Results
  show reason chips and editable defaults for the unasked enclosure/location.
- The resulting plan's share link copies successfully and reload opens the
  result. View full map exposes all 30 nodes. Connection navigation transfers
  focus; Escape closes the dialog and returns focus to its opening button.
- The map highlights the active/visited route. Individual guide links open
  `/fixes/?card=...`. A successful fix follow-up returns to improvements.
- Plan related improvements opens the planner with an explicit related-item
  request, preserving prerequisite checks. Print view, return from print view,
  Markdown copy and keyboard skip-to-content work after planner transitions.
- Search opens the prime-tower card first for its phrase, RFID opens the
  dryer identification card, and an unrelated query shows the empty state.
- Four navigation links, connected choices, fix cards and the map have no
  horizontal page overflow at either phone width. Enter and Space activate
  choices. Smooth scrolling respects reduced motion in the implementation.

These are browser viewport simulations, not tests on physical phones or a
printer. No repair was reproduced, no firmware compatibility was verified,
and no data verification dates or prices were advanced. Cards retain their
imported/source-reviewed caveats. No accounts, backend, analytics, cookies,
new storage, dependencies or hosted third-party files were added.

## Preview and decisions

From the repository folder, run `python -m http.server 8000 --bind 127.0.0.1`,
then open `http://127.0.0.1:8000/plan/` or `/fixes/`. No build is required.
README decisions 28–31 explain the new routing document, conditional intake,
source limitations and deterministic search. The full embed, weekly freshness,
About page and accessibility polish remain M5 work.
