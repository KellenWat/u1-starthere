# M3 validation evidence

Local acceptance checks passed on 2026-10-28; GitHub Actions result pending.
M4 has not started. This milestone includes the owner's scrolling decision
path and their later Apple/macOS-inspired theme request across the site.

## Acceptance and coverage

All five required personas pass against the actual curated data:

| Persona | Verified outcome |
| --- | --- |
| ABS-curious, no enclosure, $150 | Official cover before the ABS-dependent step; no heater without cooling |
| $0, PLA material group | Only free steps; firmware follows clean-stock burn-in when firmware comfort permits it |
| Noise-sensitive living room, soldering OK | Riser and mainboard/PSU cooling present; heater absent for this material answer |
| Dryer feeder selected | Dryer before feed setup; visible RFID-loss warning and optional OpenSpool tags outside totals until added |
| Already on Paxx12 | Firmware install absent; Spoolman and notification options are setting-type steps |

Additional tests cover $50/$0 enclosure fallbacks, active-heater dependencies,
ownership, optional purchases, material restrictions, integer-cent budgets,
quotes, conflicts, invalid/canonical share state, record-order independence,
missing IDs, dependency cycles, recalibration follow-up order, output escaping
and full Markdown/print guidance. A 192-combination input sample checks all
dependencies, budgets, unique item outcomes and nonempty reason chips.

## Actual local command output summaries

`node --test tests/*.test.mjs`

```text
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 422.873
```

`.venv\Scripts\python scripts/validate.py`

```text
PASS data/items.json: 38 records (JSON Schema 2020-12)
PASS data/fixes.json: 12 records (JSON Schema 2020-12)
PASS data/phases.json: 7 records (JSON Schema 2020-12)
PASS cross-document references, prerequisite DAG, gate providers, conflicts, track order, attribution and URLs
PASS total JavaScript: 83421 / 200000 bytes
Validation passed: 3 data files; 0 errors.
```

`.venv\Scripts\python -m unittest discover -s tests -v`

```text
----------------------------------------------------------------------
Ran 27 tests in 6.070s

OK
```

`node scripts/render.mjs --check`

```text
PASS generated pages match JSON and template: 42 HTML pages (38 item details).
```

## Browser verification

- Walked the seven-question path at 390 × 844 with keyboard progression and
  explicit skips. Rejected a third selected concern with a visible message.
- ABS/fumes/$150 selected the $149 cover before the ABS preparation step.
  Every numbered step exposed reason chips; running cost and time were shown.
- Changed the earlier budget to $50: DIY lid selected at $20; official cover
  remained visibly budget-deferred. Reloading the encoded URL restored it.
- Copy-share and copy-Markdown actions both reported success. The print view
  included shopping and print queues, guidance and the cover's budget reason.
- Marking the lid fitted removed its cost while retaining the ABS step.
  Restarted twice to verify clean defaults and a single result section.
- Dry-feed showed the RFID warning. Adding optional tags changed $159 to
  $172; removing the request returned the total to $159.
- Invalid encoded state showed a notice and recovered to defaults. Keyboard
  skip-to-content focused main without destroying the shared answers.
- Recalibration followed the selected riser and lid before the ABS step.
- At 1280 px, reviewed the macOS-inspired controls/sidebar and checked that
  the active question remained below the frosted toolbar. At 320 px, planner,
  print preview and catalog had no horizontal overflow. The same stylesheet
  themes the home, catalog, track and pre-rendered item pages.

## Repairs and limitations

- The local server was not running; started it and verified `/plan/` HTTP 200
  before retrying the browser flow.
- Added explicit follow-up precedence to the data so recalibration does not
  precede selected configuration changes. It never forces a purchase; a
  budget-deferred change cannot block an otherwise free follow-up.
- Planner mounts abort their previous delegated listener on restart. The
  keyboard skip link preserves the URL-hash answers rather than replacing them.
- New icon URL avoids a stale cached icon; the original icon remains for old
  cached pages. No Apple fonts or artwork are redistributed.
- Browser checks use Chromium viewport sizes, not physical iPhone/macOS
  devices. Native print output was inspected through the site's print view;
  no physical printer was invoked.
- Planner state is URL-only. No accounts, analytics, cookies, additional
  browser storage, runtime dependencies or backend were introduced.
- Creator/source-review gaps and untested firmware status remain explicit.
  Price data and verification dates were not advanced by metadata/theme edits.
- No Pages deployment yet. Public cross-device sharing requires hosting the
  committed static files; localhost links are for this machine's preview.
- M4 fixes search, M5 embed/freshness/full polish and M6 submission assets
  remain deferred in the required milestone order.
