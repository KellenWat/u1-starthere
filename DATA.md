# U1 StartHere data contract (1.6.0)

The canonical authored content is `data/items.json`, `data/fixes.json` and
`data/phases.json`, plus the routing-only `data/journey.json`. Consumers must render records from these files; catalog
titles, prices, compatibility claims and verification dates must not become
hand-maintained copies in application code. Paths are relative to the GitHub
Pages project root, so a deployment under `/u1-starthere/` remains supported.

M1 defined and validated the contract. M2 adds the catalog, pre-rendered detail
pages and startup track. M3 adds the scrolling decision path and deterministic
planner. M4 adds symptom search and the owner's interconnected route map;
embed and freshness follow in M5.

## Envelope and reuse

Every file is an object with these required properties:

| Key | Meaning |
| --- | --- |
| `version` | Contract version, currently `1.4.0`; not a firmware version |
| `license` | `CC-BY-4.0` for original curated content |
| `imported_at` | ISO date of the seed import |
| `attribution` | Curator, license URL, supplied-source titles/authorship and reuse notice |
| `items`, `fixes`, `phases` or `nodes` | The corresponding array of records; journey also declares its `start` node |

Preserve `attribution` and individual source credits when reusing or adapting
the dataset. Attribute U1 StartHere contributors, link to CC BY 4.0, and state
changes. Creator links and original project licenses remain applicable. The
license does not grant rights to the linked works. The owner's supplied
documents name no author, so the envelope records that fact instead of
guessing an identity or publishing a local personal path.

IDs use stable lowercase hyphenated slugs. Do not rename an ID without a
migration plan for incoming links, track progress and saved plans. Unknown
fields are rejected by the v1 schemas; contract changes need an intentional
schema/version update. No fields contain HTML; consumers should use text
rendering rather than injecting data as markup.

## Item records

| Field | Type and interpretation |
| --- | --- |
| `id`, `title`, `summary` | Stable slug, display name, original plain-English summary |
| `category` | `setup`, `printed-mod`, `purchase`, `firmware`, `slicer`, `enclosure`, `cooling`, `filament-system`, `multi-color`, `maintenance` |
| `type` | `print`, `buy`, `install`, `setting`, `habit` |
| `cost_usd` | Nonnegative number, or `null` for unknown/variable; zero never means an unknown price |
| `cost_note` | Estimate, quantity, optional extras and original alternatives; excludes tax/shipping unless stated |
| `price_checked_at` | Historical price date; `null` for free or unpriced items |
| `time_minutes`, `difficulty` | Nonnegative editorial estimate; difficulty 1–5 |
| `phase` | Earliest sensible stage, integer 0–6 |
| `requires` | Mandatory item IDs that precede this item; a directed acyclic graph |
| `conflicts` | Incompatible alternative item IDs; symmetric; never substitutes for a prerequisite |
| `gates` | Capability names this item unlocks, e.g. `enclosed` |
| `conditions` | Structured eligibility, prerequisites and warning inputs below |
| `materials_relevance` | One or more of `all`, `pla`, `petg`, `tpu`, `abs`, `asa`, `pa`, `cf-gf`, `five-plus-colors` |
| `reversible` | Whether the change can ordinarily be undone; not a warranty promise |
| `warranty_risk` | `none`, `gray`, or `void-risk`; preserve a visible warning when non-none |
| `source` | Credited creator and their outbound source page, described below |
| `last_verified`, `verified_firmware` | Import/review date and nullable actually-tested firmware; see verification policy |
| `tags` | Additional search/display slugs |
| `bothers` | Matches `noise`, `fumes`, `reliability`, `speed-flow`, `color-count`, `dry-filament` |
| `locations` | Relevance boosts: `living-space`, `office`, `garage-workshop` |
| `warnings` | Plain-text warnings that must remain visible in later item/plan views |
| `optional_related_items` | Optional accessories/remedies; never automatic required purchases |
| `provenance` | Seed document ID, section, verification status and limitations |
| `done_for_stages` | Optional stage answers that imply this specific item is done; never used to assume stock burn-in |
| `done_for_enclosures` | Optional exact enclosure answers that imply this route is already fitted |

`conditions` is an object; all its keys are optional:

| Key | Meaning |
| --- | --- |
| `min_stock_days` | Minimum stock-days waiting condition; burn-in must also be clean |
| `firmware_min` | Imported minimum-version requirement, not tested compatibility |
| `requires_firmware` | Currently only `paxx12`; an integration condition |
| `soldering` | If true, exclude when soldering comfort is absent |
| `required_gates` | Capability slugs the plan must satisfy through an existing or inserted provider |
| `excluded_materials` | Materials unsuitable for the route; not a relevance penalty |
| `matching_hotends` | Show the matching-head requirement and current-guide warning |
| `materials_any` | Material-specific eligibility: at least one of these materials must match |
| `interests_any` | This optional route is a candidate when a listed concern matches; explicit requests or prerequisites can also add it |
| `on_request` | Optional accessory/remedy, outside the numbered plan and totals until requested or required |
| `after_selected` | Follow-up precedence after any referenced configuration change present in the candidate graph; never forces that purchase |

Example relationship in the actual seed: `panda-breath-heater` requires
`mainboard-psu-cooling` and requests the `enclosed` and `chamber-heat-safe`
capabilities. Cooling grants `chamber-heat-safe`; mutually exclusive cover
routes grant `enclosed`. The planner must insert prerequisites and resolve
alternative gates before presenting a usable order. Do not confuse an
existing enclosure with proof that active heating is safe.

M3 keeps budget deferrals and conflict reasons visible, prevents a dependent
from entering the usable plan when its prerequisite is deferred, and lists
unknown-price items separately. [PLANNER.md](PLANNER.md) specifies scoring,
ownership defaults, capability insertion, deterministic ties and the bounded
cheaper-route retry. Five golden personas and invariant tests run in CI.

Contract 1.2.0 adds the ownership and trigger/precedence metadata above. It
encodes the supplied checklist's optional accessories and purchase triggers;
these are editorial planning rules, not independently verified compatibility
claims. Prices, creator credits and verification dates did not change.

## Software metadata (1.3.0)

Catalog records can include a `software` object with:

| Key | Meaning |
| --- | --- |
| `kind` | plugin, firmware-feature, companion-app, integration, hardware-integration or advanced-config |
| `status` | documented, experimental, beta, proof-of-concept or unmaintained; documented is not a test/certification |
| `platforms` | Data-derived platform tags; display/filter values, not inferred cross-platform compatibility |
| `firmware`, `accounts`, `hardware`, `project_license` | Plain-language requirements and upstream-license notes |
| `setup_steps` | Ordered original outline; actual installation remains in the creator guide |
| `docs` | Credited `{label, url, creator}` links to HTTPS creator/integration pages |

New sources use `provenance.seed: community-docs` with source-reviewed-not-tested
status and null verified firmware. Existing seed attribution is retained;
individual records credit the community authors. New guides are optional
requests. Price `null` remains a quote, including platform-dependent software
costs. The source's license applies to its files; CC BY covers our curated text.

`resources` journey nodes contain a title, help, `item_ids`, and an optional
return `next`. Resource references, documentation URLs, schemas and reachability
are checked in CI. `/plan/?item=stable-item-id` starts an explicit planner request
and normalizes it into the existing version-1 hash format. No IDs were renamed.

## Fix records

`id`, `title`, `symptoms`, `likely_cause`, `steps`, `stop_if`, `related_items`,
`codes`, `source` and `last_verified` follow the brief. In v1, `symptoms`
contains at least three owner-style phrasings; `steps` is an ordered array.
`related_items` references item IDs. `codes` holds explicit complete identifiers
in `0000-0000-0000-0000` form. Empty arrays are valid for symptom-only cards.
Contract 1.4.0 adds `code_evidence`, required exactly when codes are present:
`reviewed_at` (same date as `last_verified`), `status`
(`source-reviewed-not-tested`), an explanatory `note`, and `sources`
(one or more credited source objects). Duplicate codes across cards are invalid.
Code evidence URLs receive the same tracking/file/credit checks as item sources.

Additional fields are `severity` (`info`, `caution`, `stop`),
`verified_firmware` (nullable), `support_url` (official support), and
`provenance`. Preserve stop conditions, severity and evidence limitations in
the later fix UI. A suspected cause is not a diagnosis.

M4's 12 fixtures in `tests/fixtures/fix-search.json` preserve the original seed
rankings. All additional authored symptom phrases are also tested.
Search normalizes Unicode/case/punctuation and removes common stopwords.
Exact phrases outrank partial matches; otherwise score by coverage, title
matches and inverse term frequency. Less than 30% query-token coverage is not
a match. Stable ID breaks ties.

Code-shaped input follows a separate exact-match path. Spaces, ordinary/Unicode
hyphens and a compact 16-digit form normalize to the complete identifier; a code
may be pasted with explanatory text. Partial, malformed, multiple distinct or
unknown codes never fall back to keyword scoring. Query links use `/fixes/?q=`.
The UI offers the official reference for unmapped codes. No wildcard expansion,
severity inference, printer commands or generalized decoder is implemented.
`tests/fixtures/error-codes.json` pins representative source-to-card mappings;
all 37 identifiers and supported input variants are exercised in tests.

## Connected journey records

`journey.json` uses the same version/license/attribution envelope, with `start`
and a `nodes` array. Node IDs are unique. Question nodes have `title`, `help`
and `choices`; each choice has a unique local `id`, `label`, target `next`,
optional `description`, and optional `set` effects for stage/materials/concerns.
Fix nodes reference `fix_id` and a follow-up `next`; their content is rendered
from fixes.json. Terminal kinds are `plan`, `track`, `search` and `support`.
No fix instructions or item facts are copied into routing metadata.

Resource groups may also reference printed modifications. The view derives
software filters only for groups whose records all contain software metadata;
printed-part groups show creator model links, costs, prerequisites and fit
warnings from items.json. Optional printed track steps do not enter readiness
milestones.

Contract 1.6.0 adds optional item `community_evidence`, an array of common
credited source objects. These link the owner report or creator announcement
separately from the model page. Evidence URLs get the same public-page,
tracking and direct-file checks as primary sources. Discussion review does
not verify the latest model files, fit, temperatures or filtration performance.
Unknown designer handles remain null with pending credit, visibly labeled.

The validator checks all four schemas, targets, unique choices, fix references
and reachability. Shared nodes and return edges are intentional. Navigation
truncates to an earlier node instead of looping, replaying only retained
choices so abandoned assumptions disappear. `#journey=` encodes a version-1
choice-ID array, capped at 40 choices and 6,000 import characters. Unknown
choices, repetitions and unsupported versions fall back with a notice.
Planner output continues to use the original `#plan=` state format.
`/fixes/?q=...` shares a search; `?card=stable-fix-id` opens a particular guide.

## Track records

The `phases` array is strictly ordered from phase 0 to 6:
prep, unbox, stock burn-in, first mods, firmware, tuning, expansion.

Each record contains `phase`, `name`, `goal`, and ordered `steps`. A step is
`{ "id": "stable-step-slug", "text": "Original guidance", "item_id": null }`;
use a catalog ID instead of `null` when the step has a related item.
Step IDs are globally unique and intended as stable localStorage progress
keys. `optional` is an optional boolean added in 1.1.0; absent means false.
The M2 track permits skipping only explicitly optional steps. Each step's
saved state is `done`, `skipped`, or absent. Mandatory setup and stock tests
cannot be skipped, while choosing to remain stock is a valid firmware decision.
Item phase is its earliest stage; the track can refer to it later.
Expansion is an optional post-week-one phase, not a claim that chamber-heating
or soldering belongs in the first week. The firmware phase explicitly permits
staying stock; integration steps are conditional on the firmware decision.

Contract 1.5.0 adds `requires_steps` and optional `guidance` to track steps.
Prerequisites must reference earlier steps; required checks cannot depend on
optional changes. Guidance contains ordered original `actions`, `done_when`,
`if_stuck`, credited `sources`, `last_verified` and
`verification_status: source-reviewed-not-tested`. Review dates and URLs are
validated. Eight assembly/first-print steps currently have this fuller guide.

Top-level `milestones` contain stable IDs, titles, `step_ids` and `complete_text`.
Readiness counts completed checks and their transitive prerequisites, excluding
optional work. Only the first unfinished milestone offers a next action. This
is owner-recorded progress, not telemetry or a physical readiness guarantee.
Existing version-1 progress and step IDs remain valid; new checks start unchecked.

A journey `track` node may reference a `step_id`; CI checks the destination.
`/start/#step-STABLE-ID` opens its phase and guidance, moves keyboard focus to
the guide summary and scrolls it into view. Routing metadata can distinguish
first loading from editing an already-loaded spool without duplicating the
canonical procedure. All printer instructions remain in phases.json.

## Attribution and verification

`source` requires `creator` (name or `null`), `url` (HTTPS), `kind`
(`docs`, `model`, `product`, `forum`, `repository`, `collection`, `homepage`),
`credit_status` (`named` or `pending`) and an explanatory `note`.
Null names always require pending credit. A platform homepage is a disclosed
unresolved source, never a claim that the platform created the model.

`provenance.seed` is `checklist`, `brief` or `community-docs`. Its `section` and `note` explain
where the facts came from and what is still unknown. A source index or vendor
homepage is not evidence for a specific repair just because it responds.

At import, `last_verified` must be the 2026-10-28 import date requested in the
brief. To prevent false compatibility claims, M1 permits only these statuses:

- `imported-not-tested`: seed facts imported without independently reproduced
  hardware or firmware behavior.
- `source-reviewed-not-tested`: a relevant creator/manufacturer document was
  read; behavior still was not reproduced on hardware.

Both require `verified_firmware: null`. A future schema extension for actual
firmware verification must define its evidence and update the status enum
before accepting a claimed tested version. M5's badges must distinguish the
import/review date from actual firmware testing. A successful link check must
never advance a verification date on its own. Prices retain their own date.

## Validation and contribution procedure

1. Update the canonical JSON and keep original creator links and attribution.
2. Rewrite summaries and fix steps in your own words. Record limitations,
   quantities, estimates and stop conditions. Do not copy third-party files.
3. Add prerequisite IDs, symmetric alternatives and gates where relevant;
   update track/related-item references if IDs change.
4. Run `python scripts/validate.py` and
   `python -m unittest discover -s tests -v`. CI runs exactly these checks.
5. Review the diff for source quality and factual safety. Schema validity
   does not prove a fix is correct or a modification is safe.

Validation uses Draft 2020-12 with date/URI format checks and a local resource
registry. Additional checks reject duplicate IDs, dangling references,
prerequisite cycles, backward phase prerequisites, asymmetric conflicts,
unprovided gates, invalid track order/IDs, impossible dates, untested firmware
claims, and affiliate/tracking links or direct model/firmware/document files.
Tests mutate valid input to prove rejection paths run. The validator does
not contact external sites, execute a planner, or perform symptom search.

## Authoring and M2 consumers

Run `node scripts/render.mjs` after editing item data, phases or the page
template, then commit the generated HTML. It uses `assets/view.mjs`, the same
escaped view helpers used by the live catalog. This authoring operation needs
Node 22+ without npm or dependencies; serving/deployment needs neither.

`node scripts/render.mjs --check` fails when a generated page is missing,
stale, or orphaned. CI also runs `node --test tests/*.test.mjs` for catalog
filtering, project-prefix links, safe text rendering and progress behavior.
Python tests check that committed page links and local assets resolve inside
the site root. The JavaScript budget includes `.js` and `.mjs`, including
authoring and test modules, for a conservative total.

Browser storage uses only `u1-starthere.track.v1` with
`{ "version": 1, "steps": { "stable-step-id": "done" } }`. It stores no
other preferences, identity or telemetry. Invalid, old or unknown step state
is ignored; unavailable storage falls back to progress for the current visit.
Catalog filter choices live in the URL query string, not browser storage.

Planner links use `#plan=` plus a URI-encoded JSON object with `v: 1`, the seven
answer keys, and `owned`/`selected` ID arrays. State is whitelisted, canonical,
bounded to 12,000 encoded characters on import, and never stored in
localStorage. Unknown IDs and unsupported values are ignored; invalid versions
or malformed links show a notice and use defaults. The same inputs and data
produce the same plan; future data updates may change prices and results.

Markdown and print exports retain ordered steps, reason chips, warnings,
source credits, separate shopping/print queues, budget deferrals, exclusions
and unknown-price items. Optional related items remain outside totals until
added explicitly. A local-preview link works on that machine; sharing with
other owners requires serving these same static files at the public site URL.
