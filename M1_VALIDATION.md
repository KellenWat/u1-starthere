# M1 validation evidence

Run locally on 2026-10-28 with Python 3.11 in the project-local `.venv`.
No website runtime or npm installation is required. GitHub Actions has not
been run: the local repository has no remote and Chrome's GitHub session is
signed out. M1 is locally ready, but its Actions acceptance gate is pending.

## Actual validator output

Command: `.venv\Scripts\python scripts/validate.py`

```text
PASS data/items.json: 38 records (JSON Schema 2020-12)
PASS data/fixes.json: 12 records (JSON Schema 2020-12)
PASS data/phases.json: 7 records (JSON Schema 2020-12)
PASS cross-document references, prerequisite DAG, gate providers, conflicts, track order, attribution and URLs
PASS total JavaScript: 0 / 200000 bytes
Validation passed: 3 data files; 0 errors.
```

## Actual test output summary

Command: `.venv\Scripts\python -m unittest discover -s tests -v`

```text
----------------------------------------------------------------------
Ran 24 tests in 1.233s

OK
```

The suite covers seed item/fix presence, historical prices, required safety
relationships, RFID warning/remedy data, setting-type integration records,
attribution, and validator rejection of malformed records and relationships.

## Repair and retry

The initial installed jsonschema package lacked its optional URI format
checker. The requirements now include `jsonschema[format-nongpl]==4.26.0`,
and the validator refuses to run if that checker is absent. Installed the
requirements into `.venv` after the restricted-network attempt failed, then
retried the full validator and test suite successfully. Added regressions for
malformed URI rejection and a missing checker. No global Python environment
was modified.

## Verification limits

- No Actions run, GitHub publication, Pages deployment or browser UI test yet.
- This milestone has data and development tools only; M2 pages are not built.
- Documentation review is distinguished from hardware/firmware verification.
  Every record's `verified_firmware` is null.
- Source gaps, blocked model-page fetches and pending designer credits are
  recorded in the data and README. Schema validity does not resolve them.
- Planner golden personas belong to M3; symptom ranking checks belong to M4.
  No later-milestone acceptance claims are made by these 24 data tests.
