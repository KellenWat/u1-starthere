# New-owner journey audit

Reviewed 2026-10-29. Method: expert cognitive walkthrough using simulated owner
states, official documentation review, real browser interaction and automated
route/data tests. No participants were recruited and no physical printer was
operated. Findings describe this site, not the completeness of the U1's supplied
paper manual.

## What an owner should take away

“I know the next action for my current situation, what success looks like, and
where to get help if it fails.” For a new owner, that means a successful first
print on the stock machine. Exploring community modifications comes afterward.
The site should never require a beginner to understand the whole ecosystem
before loading a spool.

The original track bundled assembly, updates and calibration into one checkbox,
then asked for test prints. It omitted the bridge: preparing a usable file,
physically loading material, confirming it reached the nozzle, matching the job
to the loaded heads, and transferring/starting the job. The user's example was
a real gap in the site's information sequence.

## Findings and changes

| Priority | Owner question / obstacle | Change and evidence |
| --- | --- | --- |
| P0 | “It says print, but I haven't loaded filament.” | Added `load-first-filament`, reachable from both setup and filament-problem routes. Loading includes preparation, nozzle loading, success and recovery checks. |
| P0 | “The feeder light is white. Am I ready?” | Distinguish preloaded from the touchscreen's Loaded state; require the needed heads to finish loading. Source: official automatic-loading guide. |
| P1 | “What file, and how does it reach the printer?” | Added `prepare-first-file` and `start-first-print`: conditional local demo, official model/slicing route, matching U1 presets, LAN setup, upload versus upload-and-start. |
| P1 | “I assembled it. Which setup task is next?” | Separate assembly and initialization, preserve the old calibration ID, and route directly to its guide instead of the top of the checklist. |
| P1 | “My spool has no automatic name. Is something broken?” | Ask about RFID after ruling out dryer routing. Offer manual material/color entry and an already-loaded instruction, rather than assuming feed failure. |
| P1 | “How do I know it worked? Can I walk away?” | Every new guide has Done when and If you get stuck. Separate mapping/plate checks, starting, first-layer observation and cooling. |
| P1 | “Must I buy all these upgrades first?” | First-print and stock-baseline milestones use required checks only, with one next unchecked action. Optional modifications remain optional. |
| P1 | Phone guide text wrapped one word per line; prerequisite links sometimes missed taps. | Limit phase-summary CSS to direct children. Give prerequisite links block hit areas and focus the opened guide summary. Verified at 390 and 320 px. |

## Walkthrough: just unboxed, what next?

1. Follow the official illustrated assembly guide; finish first-start setup and
   calibration. If assembly is already complete, open the initialization check.
2. Choose a compatible local demo if one exists, or prepare a simple model with
   the U1/nozzle/material profile in Snapmaker Orca. The official first-layer
   test page supplies a model link; this site does not rehost it.
3. Load the material needed by that job. The loading guide links the illustrated
   feeder/head instructions, explains preloading versus nozzle loading, includes
   manual material/color entry for an untagged spool, and asks for Loaded status.
   Loading and file preparation can be done in either order.
4. Check the installed plate, clear workspace and job-to-head/material mapping.
5. Start the local file, or use the documented Orca LAN transfer path. Uploading
   alone and uploading-and-printing are distinct actions.
6. Watch the first layer. Pause/cancel on an obvious failed attachment or repeated
   alert and use the linked official troubleshooting/support route.
7. Allow cooling and remove the part using the official guide. Then finish the
   individual-head and four-color baseline checks before considering changes.

Each first-use guide has a visible official walkthrough link, a short original
procedure, an observable completion check and a recovery route. These are not
substitutes for the illustrated manual or printer prompts.

## Evidence and scope

The data contract is 1.5.0: 63 catalog records, 16 fix cards, 37 explicit error
codes, seven phases with 38 steps (16 required, 22 optional), eight guided steps,
and 48 connected journey nodes. Existing IDs and version-1 saved progress are
preserved; new checks cannot silently inherit a completed state.

Five new owner-route fixtures exercise assembled initialization, first loading,
first loading entered as a problem, file preparation, and a non-RFID spool.
Additional tests cover prerequisite ordering, readiness, optional-work exclusion,
old progress, guide content and escaped output. Existing five golden planner
personas and all 12 seed symptom #1 rankings remain part of the passing suite.

Real browser review covered:

- Homepage to first-loading guide, and the non-RFID identification branch.
- Direct step links opening the right phase and guide, prerequisite navigation
  back to initialization, and Next check navigation through file/loading steps.
- A loading check saved through reload, then unchecked to restore initial state.
- Phone layouts at 390×844 and 320×740 with no horizontal page overflow.
- Catalog Software + iOS filters, keyboard disclosure, restored active filters
  and clearing back to all 63 records (the interrupted design review resumed).

Actual local output summary:

```text
ℹ tests 95
ℹ pass 95
ℹ fail 0
PASS total JavaScript: 139862 / 200000 bytes
Validation passed: 4 data files; 0 errors.
Ran 47 tests in 18.963s
OK
PASS generated pages match JSON and template: 68 HTML pages (63 item details).
```

All 68 generated HTML pages are checked against the template/data. CI repeats
schemas, validation, Python/JavaScript tests and generated-page checks.

## Source review

All source credits and review dates are stored with the guide data. Sources
reviewed on 2026-10-29 are by Snapmaker:

- [U1 official guide index / setup](https://wiki.snapmaker.com/en/snapmaker_u1).
- [Automatic loading](https://wiki.snapmaker.com/en/snapmaker_u1/automatic_loading).
- [Manual loading](https://wiki.snapmaker.com/en/snapmaker_u1/manual_loading).
- [Automatic loading failure](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/u1_auto_loading_failure).
- [Snapmaker Orca quick start](https://wiki.snapmaker.com/en/snapmaker_orca/qsg).
- [Printing and material mapping](https://wiki.snapmaker.com/en/snapmaker_u1/printing_guides/multi-color_printing_guide).
- [First-layer checks and official test model](https://wiki.snapmaker.com/en/snapmaker_u1/troubleshooting/first_layer_printing_troubleshooting_guide).

Documentation discrepancies are deliberately scoped: the dedicated loading
guide directs flexible material to manual loading, so beginner automatic
instructions stay with PLA/PETG. Generic Orca export text mentions SD media;
the site teaches the documented LAN path instead of guessing a U1 offline
transfer procedure. Advanced first-layer adjustments remain in the official
troubleshooting source rather than becoming beginner tuning instructions.

## Remaining user research and follow-up

- P2: the decision tree hands off to a track guide with Open this check. Test
  whether beginners understand that handoff and the return path; inline guide
  rendering is a possible later improvement, not yet validated.
- P2: eight setup/first-print steps have full guides; later tuning/expansion
  remains a checklist with credited catalog links, not a complete training course.
- Run a moderated first-use session with real new owners: ask them to locate
  the correct feeder/head using the official illustration, load an untagged
  spool, prepare a file and explain Loaded versus preloaded in their own words.
  Record wrong turns, requests for help and whether the completion criteria are
  understood. Do not treat our own browser walkthrough as that evidence.
- Firmware labels and source pages may change. Records explicitly say source
  reviewed, not printer tested. M5 freshness/embed and M6 submission work remain
  outside this audit.

## Files changed and local preview

Data/schemas for all four documents, `assets/app.mjs`, `assets/journey-ui.mjs`,
`assets/track-view.mjs` (new), `assets/site.css`, `scripts/validate.py`, owner-route
fixtures/tests, existing journey/Python tests, generated stock-baseline detail,
README, DATA, DESIGN and this audit. No runtime dependencies or storage added.

From the repository folder:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/start/#step-load-first-filament` for the loading guide,
or `/plan/` for the connected decision tree. The agent-owned server is stopped
at handoff. GitHub Pages deployment has not been activated.
