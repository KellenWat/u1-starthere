# U1 StartHere

A community startup track, explainable upgrade planner and symptom finder for
Snapmaker U1 owners. Static files for GitHub Pages; no framework or site build.

Code and schemas: [MIT](LICENSE). Curated data: [CC BY 4.0](data/LICENSE.md),
with creator attribution embedded in every data document and record. Linked
projects keep their own licenses. This is an unofficial community project.

## Milestone status

**M1 complete: local validation and GitHub Actions pass.**
Imported 38 items, 12 fixes and phases 0–6. The schemas, offline validator and
CI workflow pass locally and on GitHub. [Successful Actions run #2](https://github.com/KellenWat/u1-starthere/actions/runs/40779468443)
validated all three data files and passed all 24 tests for `a133ce3`.

**M2 complete: phone-flow acceptance and GitHub Actions pass.** Home,
filterable catalog, 38 pre-rendered item pages and the checkable startup track
are ready. Phone-sized browser testing completed the full track, including
optional skips, persistence, item links and reset. [Actions run #4 passed](https://github.com/KellenWat/u1-starthere/actions/runs/40782192085)
with all three JSON files, 25 Python tests, 11 JavaScript tests and all 41
generated pages checked. [M2 validation evidence](M2_VALIDATION.md) records
the phone/desktop checks and limits. M3–M6 have not started.

M1 acceptance evidence:

| Criterion | Evidence |
| --- | --- |
| Separate project/repo scaffold | This directory, [GitHub repository](https://github.com/KellenWat/u1-starthere), licenses, `.nojekyll`, `.gitignore` |
| JSON Schemas and seed import | Three data documents; item, fix, phase and shared schemas in `schemas/` |
| npm-less validation locally | `python scripts/validate.py`: all three documents and relationship checks pass |
| Validation in Actions | [Run #2 passed](https://github.com/KellenWat/u1-starthere/actions/runs/40779468443): the same validator and 24 tests on Ubuntu/Python 3.11; workflow also supports PRs and manual dispatch |
| DATA.md written | [Data contract and contribution procedure](DATA.md) |

## Validate locally

Python 3.11+ is needed for data checks and Node 22+ for authoring/JavaScript
checks. No npm installation is required. From this directory (Windows):

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
.venv\Scripts\python scripts/validate.py
.venv\Scripts\python -m unittest discover -s tests -v
node --test tests/*.test.mjs
node scripts/render.mjs --check
```

On macOS/Linux use `.venv/bin/python` for the Python commands. CI installs
the same requirements into its disposable runner and uses `python` directly.
The format extras are required: validation fails explicitly if the URI checker
is unavailable, rather than silently skipping source URL format validation.

Node 22+ is needed for authoring and JavaScript tests, with no npm install.
The JSON Schema validator resolves only local schemas and does not fetch
third-party links. Scheduled external link/staleness checks belong to M5.
The suites cover seed integrity, page links, catalog filters, saved progress,
project-prefix routing and escaped content. Planner persona tests arrive with
M3; symptom search-ranking tests arrive with M4.

## Local preview

From this directory, serve the committed site directly:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ for home, `/start/` for the track or `/catalog/`
for the catalog. Trailing slashes work with plain static servers and GitHub
Pages. Item pages have real `/item/{id}/index.html` files, so direct links
work without a server router. No site build or runtime dependency is needed.

After editing JSON content or `templates/page.html`, run
`node scripts/render.mjs` and commit its generated files. CI checks that they
match the JSON. The optional authoring script is not a deployment build step.

## Decisions

1. **Specification priority:** the supplied `u1-starthere-brief.md` governs
   product behavior. `snapmaker-u1-first-week-checklist.md` supplies seed facts,
   sequence and historical prices. Both were read completely before code was
   written. Neither original document is copied into this repository.
2. **Recommended architecture:** vanilla HTML/CSS/JS, one small CSS file, no
   framework, no deployment build step, no backend, no accounts, no analytics,
   no cookies. Future track progress uses localStorage only. JavaScript must
   total less than 200,000 bytes; the M1 validator enforces that limit.
3. **Recommended item routes:** M2 will use checked-in, pre-rendered item HTML
   from a small optional generator. Regeneration is an authoring operation;
   GitHub Pages serves the committed files without a build. JSON remains the
   sole authored source for item content. M2 implements this using a small
   Node script and shared view helpers, without dependencies or npm.
4. **Recommended name and appearance:** `u1-starthere`; clean, mobile-first,
   visually compatible with the printer ecosystem and clearly unofficial.
   No domain, fund submission or Pages hosting has been configured yet.
5. **Versioned data:** all three JSON files use a `version`, `license`,
   `imported_at`, `attribution` envelope plus `items`, `fixes` or `phases`.
   The brief's record fields and phase ordering remain intact inside it.
   This reconciles its array examples with the explicit versioned API goal.
6. **Prices:** preserve the checklist's 2026-10-26 figures. Exact estimates
   stay estimates in `cost_note`; ranges use their upper bound (paver $8,
   LEDs $18, cooling $40, SAMLA $20). Space Pi uses Creality's listed $159;
   its $149/$158.99/$179 alternatives remain in the note. Liber uses the
   $99 four-pack; the $34.99 single price remains in the note. Variable
   expansion costs are `null`, never zero. Free model prices exclude
   filament, power and optional purchased hardware, which are disclosed.
7. **Spares arithmetic:** brushes/pads $3.99 + two wipers at $3.99 each +
   screw set $4.99 = $16.96; with a $64.99 head this is $81.95 before
   shipping/tax. Keep those line prices rather than the checklist's ~$78
   combined estimate. Do not reproduce its approximate week-one totals as
   computed plan totals. LED, paver and small parts range totals $53–61,
   another reason to calculate future plan totals from selected records.
8. **Verification honesty:** `last_verified` is 2026-10-28 as required for
   import, but every record also says `imported-not-tested` or
   `source-reviewed-not-tested`. `verified_firmware` is `null` throughout.
   No printer tests or firmware compatibility tests were performed. Future
   badges must say imported/source reviewed, firmware not tested; never
   imply firmware verification from the import date alone. Firmware minimum
   requirements imported from the checklist remain requirements to check,
   not proof of compatibility. Newer integration details seen during source
   review do not replace the seed prices or claim tested support.
9. **Attribution:** use named creators where supplied or confirmed on their
   own pages. A `null` creator plus `credit_status: pending` and an explicit
   note preserves unresolved attribution without inventing a handle. A
   manufacturer or retailer homepage is a disclosed fallback, not an exact
   product/model link. Original third-party files are never rehosted, and
   affiliate/tracking query parameters are rejected by validation.
10. **Seed extensions:** split firmware integrations into individual setting
    records for the already-on-Paxx12 persona. Split multiACE and Sidecar to
    credit their different creators. Add an explicit enclosure-gated ABS/ASA
    preparation step so a passive enclosure can unlock an ABS plan without
    implying an active heater is necessary. Full Spectrum and three
    brief-only fixes are explicitly identified as brief imports.
11. **Planner data, not an engine yet:** `requires` holds item prerequisites;
    `gates` grants capabilities; `conditions.required_gates` requests them.
    Enclosure alternatives and hardware expansion routes have symmetric
    conflicts. `optional_related_items` never imposes a purchase. Numeric
    score weights, gate choice tie breaks, ownership mapping, and unknown
    cost handling will be documented and tested when M3 is authorized; no
    planner is implemented during M1.
12. **Time and difficulty:** all `time_minutes` and difficulty values are
    editorial planning estimates, not measured benchmarks. Print duration
    and setup time depend on the chosen part and profile. Nozzle and bed
    temperature settings are not treated as verified printer defaults.
13. **Safety and support:** cards use plain-English rewrites with explicit
    stop conditions and official support links. Unverified recovery advice
    stays conditional on the current official procedure. Driver-temperature
    anecdotes do not establish safe processor temperatures. A closed lid or
    filtering mode is not an air-quality certification. OpenSpool cannot
    identify a tag that remains out of reader range in a distant dryer.
14. **Scope:** owner-specific price-match deadlines, local used-item alerts,
    supplied-document instructions to download firmware/models, and private
    travel details are not website features or instructions to this agent.
    Do not ship downloads, campaigns, personal deadlines or a code decoder.
15. **Hosting:** the requested GitHub Pages workflow takes priority over a
    plugin-hosted Site. No Sites registration or deployment is performed.
    Created the public `KellenWat/u1-starthere` repository to support the
    intended $0 GitHub Pages deployment, and configured it as `origin`.
    No website has been deployed yet. The connector lacks repository
    creation, so creation used the signed-in GitHub browser; pushes use Git.
    Actions run #1 failed before tests because pip caching looked for the
    default requirements filename. Set `cache-dependency-path` to
    `requirements-dev.txt`; the new run #2 passed validation and all 24 tests.
16. **What’s next interface (owner direction):** M3 will use an interactive,
    scrolling decision path that branches toward relevant community options
    and original creator pages. Show one skippable question at a time, retain
    earlier answers, and allow backtracking/changes. Use normal scrolling and
    keyboard controls. Keep the brief's deterministic ordering, prerequisites,
    conflicts, reason chips and visible budget deferrals. This changes the
    intake presentation, not the planner rules. No M3 engine is built in M2.
17. **Honest M2 navigation:** until the planner exists, the home page's second
    action opens the working catalog rather than a dead planner link. It
    previews the future decision path in plain language. Symptom search stays
    in M4; M2 links owners to official U1 support without a fake search field.
18. **Optional track choices:** contract 1.1.0 adds `steps[].optional` (default
    false) to phases. Purchases and modifications can be explicitly skipped.
    The nine required steps cover preparation, inspection, stock tests and a
    firmware decision; staying stock is valid. Twenty-two optional steps can
    be completed or skipped. Checks do not verify actual printer behavior.
19. **Progress and filters:** track-only localStorage, under a versioned key;
    the UI distinguishes completed from skipped steps and permits reset with
    an accessible confirmation dialog. Filter state uses the URL query.
    No cookies, remote fonts, analytics, storage for other purposes, or
    automatic network calls to creator pages are introduced.
20. **M2 visual direction:** a white/cool-gray field guide with blue controls,
    local system fonts, a four-toolhead mark, and large checklist labels.
    Tested at 320 px and 390 px phone widths and a 1280 px desktop viewport.
    See [DESIGN.md](DESIGN.md) for tokens and rationale. M5 still owns the full
    accessibility/freshness polish pass; these are the M2 usability checks.

## Source review and remaining content work

Source pages were reviewed on 2026-10-28 for Paxx12, its RFID/Spoolman/heater
documentation, tonsofbuns' VFA report, the Liber manufacturer listing,
Dragon2203's converter, decay71's multiACE, dcan999's Sidecar preview, and
ratdoux's Full Spectrum repository. Per-record sources link directly to those
pages. Review means documentation review, not reproduced hardware behavior.

Deferred source gaps are explicit in the data:

- Printables riser and SAMLA URLs could not be fetched; the PTFE example's
  MakerWorld fetch was blocked. Supplied URLs are preserved; designer handles
  need confirmation.
- Exact TPU holder, tool-holder/spool-adapter, LED and small-parts products
  were not supplied. Their model/manufacturer credits need resolution.
- BIQU PopCap, PopStatus and PopStation Mini retain a manufacturer homepage
  fallback pending exact product URLs. Generic support-index links on fixes
  are labeled as such and do not substantiate symptom-specific claims.
- Homing-center, grease/calibration and cover-mode fixes come from the brief;
  the pogo reminder example and code also require symptom-specific review.
  These must not be presented as independently verified repairs.
- Sidecar's source currently describes a development preview, not a ready
  installation. Preserve that warning in future catalog and planner output.

## Next milestones

Stop after the M2 handoff. Once its acceptance checks pass, the next stage is
M3: the scrolling decision path and planner plus five golden personas;
M4 symptom search plus all 12 ranking fixtures; M5 embed, freshness and
accessibility; M6 submission assets only after all earlier acceptance checks.
