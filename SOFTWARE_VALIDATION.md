# Software documentation and second-iteration validation

This owner-requested post-M4 pass fills the previously identified software
documentation gaps, then reviews the website and applies a second refinement.
M5 embed/freshness/About work and M6 remain deferred.

## What changed

- 25 new catalog guides, six existing entries classified with software metadata:
  63 catalog items, including 31 software/integration entries.
- Eight connected resource groups and 39 journey nodes. Explore, Improve and
  the installed-firmware branch converge on the same software choices.
- Contract 1.3.0 adds optional software metadata and resource-node references.
  Existing item IDs and version-1 plan/journey links remain compatible.
- Generated detail pages contain original setup outlines, requirements,
  credited documentation links and explicit source/test limitations.
- New guides remain optional. Explicit requests obey existing firmware,
  stock-test and budget rules. Unknown service/hardware/platform costs are
  quoted. The original seed purchase prices were not changed.

## Requested review and second iteration

The first review at 1280×900 and 390×844 found overly tall comparison cards
and no direct platform filtering. The first inventory card was 806 px tall on
the phone. The second pass moved full requirements/cost notes into native
expandable sections while retaining visible type/status/platform badges.
That card is now 496 px tall, about 38% shorter.

Resource groups have a Runs on filter. The catalog also has a Software &
integrations category and platform filter, with URL restoration. Source caveats
stay visible, including unmaintained, experimental and proof-of-concept labels.
SpoolLink's cost is variable because iOS setup can require a paid developer
account. This is documented as a cost caveat, not represented as a free setup.

## Browser verification

Chromium desktop, 390×844 and 320×740 phone viewports:

- Explore → Software → Track my filament shows seven relevant resources.
  iOS narrows that set to SpoolLink and SpoolKid, with a live result count.
- Read the guide opens a pre-rendered item page with three setup steps,
  credited documentation and visible Beta status for SpoolKid.
- Plan this option carries the selected item into the version-1 URL hash.
  With no firmware comfort, a $0 standalone SpoolKid plan contains the app
  without installing firmware. Its guide separately explains U1 tag-reading
  firmware requirements.
- Catalog Software + Android returns six items, restores after reload, and
  has no horizontal overflow at 320 px. Status badges appear on catalog cards.
- Searching Home Assistant returns its integration with Unmaintained status
  visible in both the catalog and full guide; creator credit is preserved.
- Native details, labeled selects, ordinary scrolling and keyboard controls
  are retained. These are viewport simulations, not physical-device tests.

## Automated verification

72 JavaScript tests cover the five golden planner personas, every seed symptom,
new guide completeness/reachability, opt-in behavior, firmware prerequisites,
unknown-cost quotes, source escaping, status visibility and platform filtering.
34 Python tests cover four JSON Schemas, relationship integrity, outbound links,
new resource references and rejection cases. All 68 committed HTML pages match
their JSON/template inputs, and local page/asset links resolve.

No plugin was installed, no printer behavior was tested, and no firmware
compatibility certification was added. Creator-source limitations and
non-exhaustive coverage are recorded in SOFTWARE_COVERAGE.md. No new runtime
dependency, backend, analytics, account, cookie or browser storage was added.

## Local preview

From this repository run `python -m http.server 8000 --bind 127.0.0.1`.
Open `/plan/` → Explore → Software & integrations, or
`/catalog/?category=software`. Full guides are static `/item/{id}/` pages.
