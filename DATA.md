# U1 StartHere data contract (1.0.0)

The canonical authored content is `data/items.json`, `data/fixes.json` and
`data/phases.json`. Consumers must render records from these files; catalog
titles, prices, compatibility claims and verification dates must not become
hand-maintained copies in application code. Paths are relative to the GitHub
Pages project root, so a deployment under `/u1-starthere/` remains supported.

M1 defines and validates the contract. UI, planner, search, embed and freshness
behavior are implemented in later milestones, in that order.

## Envelope and reuse

Every file is an object with these required properties:

| Key | Meaning |
| --- | --- |
| `version` | Contract version, currently `1.0.0`; not a firmware version |
| `license` | `CC-BY-4.0` for original curated content |
| `imported_at` | ISO date of the seed import |
| `attribution` | Curator, license URL, supplied-source titles/authorship and reuse notice |
| `items`, `fixes` or `phases` | The corresponding array of records |

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

Example relationship in the actual seed: `panda-breath-heater` requires
`mainboard-psu-cooling` and requests the `enclosed` and `chamber-heat-safe`
capabilities. Cooling grants `chamber-heat-safe`; mutually exclusive cover
routes grant `enclosed`. The planner must insert prerequisites and resolve
alternative gates before presenting a usable order. Do not confuse an
existing enclosure with proof that active heating is safe.

M3 must keep budget deferrals and conflict reasons visible, prevent orphaned
dependents when prerequisites are deferred, and show unknown-price items
separately rather than treating them as free. Relevance weights and stable
final tie breaks will be specified with that engine and its golden fixtures.

## Fix records

`id`, `title`, `symptoms`, `likely_cause`, `steps`, `stop_if`, `related_items`,
`codes`, `source` and `last_verified` follow the brief. In v1, `symptoms`
contains at least three owner-style phrasings; `steps` is an ordered array.
`related_items` references item IDs. `codes` holds optional keyword strings,
never a general error-code decoder.

Additional fields are `severity` (`info`, `caution`, `stop`),
`verified_firmware` (nullable), `support_url` (official support), and
`provenance`. Preserve stop conditions, severity and evidence limitations in
the later fix UI. A suspected cause is not a diagnosis.

At M4 the first phrase in each card's `symptoms` will be one of the 12 seed
ranking checks; additional phrases can be included as regression cases. No
search-ranking acceptance claim is made at M1.

## Track records

The `phases` array is strictly ordered from phase 0 to 6:
prep, unbox, stock burn-in, first mods, firmware, tuning, expansion.

Each record contains `phase`, `name`, `goal`, and ordered `steps`. A step is
`{ "id": "stable-step-slug", "text": "Original guidance", "item_id": null }`;
use a catalog ID instead of `null` when the step has a related item.
Step IDs are globally unique and intended as stable localStorage progress
keys in M2. Item phase is its earliest stage; the track can refer to it later.
Expansion is an optional post-week-one phase, not a claim that chamber-heating
or soldering belongs in the first week. The firmware phase explicitly permits
staying stock; integration steps are conditional on the firmware decision.

## Attribution and verification

`source` requires `creator` (name or `null`), `url` (HTTPS), `kind`
(`docs`, `model`, `product`, `forum`, `repository`, `collection`, `homepage`),
`credit_status` (`named` or `pending`) and an explanatory `note`.
Null names always require pending credit. A platform homepage is a disclosed
unresolved source, never a claim that the platform created the model.

`provenance.seed` is `checklist` or `brief`. Its `section` and `note` explain
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
