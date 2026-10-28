# M1 validation evidence

Run locally on 2026-10-28 with Python 3.11 in the project-local `.venv`, and
successfully in GitHub Actions on Ubuntu/Python 3.11. No website runtime or
npm installation is required. The repository is
[KellenWat/u1-starthere](https://github.com/KellenWat/u1-starthere).
All M1 acceptance criteria pass. M2 has not started.

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

## GitHub Actions evidence

[Run #2](https://github.com/KellenWat/u1-starthere/actions/runs/40779468443)
on commit `a133ce397edf53a1d151840105e36875c4178e08` completed successfully.
The `data` job installed development requirements, validated all three JSON
documents, and passed the same 24 tests. Actual output from that job:

```text
PASS data/items.json: 38 records (JSON Schema 2020-12)
PASS data/fixes.json: 12 records (JSON Schema 2020-12)
PASS data/phases.json: 7 records (JSON Schema 2020-12)
PASS cross-document references, prerequisite DAG, gate providers, conflicts, track order, attribution and URLs
PASS total JavaScript: 0 / 200000 bytes
Validation passed: 3 data files; 0 errors.

Ran 24 tests in 1.289s

OK
```

## Repair and retry

The initial installed jsonschema package lacked its optional URI format
checker. The requirements now include `jsonschema[format-nongpl]==4.26.0`,
and the validator refuses to run if that checker is absent. Installed the
requirements into `.venv` after the restricted-network attempt failed, then
retried the full validator and test suite successfully. Added regressions for
malformed URI rejection and a missing checker. No global Python environment
was modified.

After GitHub sign-in, created the repository and pushed M1. Actions run #1
failed in `setup-python` before tests because its pip-cache defaults only
searched for `requirements.txt` or `pyproject.toml`. Set
`cache-dependency-path: requirements-dev.txt`, reran the local checks
successfully, and pushed the fix. Run #2 then passed every step, including the
previously failed setup step and both required validation commands.

## Verification limits

- No Pages deployment or website UI test yet; the repository and Actions are live.
- This milestone has data and development tools only; M2 pages are not built.
- Documentation review is distinguished from hardware/firmware verification.
  Every record's `verified_firmware` is null.
- Source gaps, blocked model-page fetches and pending designer credits are
  recorded in the data and README. Schema validity does not resolve them.
- Planner golden personas belong to M3; symptom ranking checks belong to M4.
  No later-milestone acceptance claims are made by these 24 data tests.
