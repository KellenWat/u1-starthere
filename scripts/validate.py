"""Offline JSON Schema + cross-document checks. No npm or network required."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
import sys
from urllib.parse import parse_qsl, urlsplit

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
KINDS = ("items", "fixes", "phases")


def load_documents(root: Path = ROOT) -> dict:
    return {kind: json.loads((root / "data" / f"{kind}.json").read_text(encoding="utf-8"))
            for kind in KINDS}


def validate_documents(documents: dict, root: Path = ROOT) -> list[str]:
    """Return useful errors, including invalid references that Schema cannot express."""
    if "uri" not in FormatChecker.checkers:
        raise ValueError("URI format dependency missing; install requirements-dev.txt (including format extras)")
    errors = []
    registry = Registry()
    schemas = {}
    for path in sorted((root / "schemas").glob("*.schema.json")):
        schema = json.loads(path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        schemas[path.stem.removesuffix(".schema")] = schema
        registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))

    for kind in KINDS:
        validator = Draft202012Validator(schemas[kind], registry=registry,
                                        format_checker=FormatChecker())
        for error in sorted(validator.iter_errors(documents[kind]), key=lambda e: str(e.path)):
            location = "/".join(map(str, error.absolute_path)) or "(root)"
            errors.append(f"{kind}.json/{location}: {error.message}")
    if errors:
        return errors  # Shape must be valid before relationships can be inspected.

    items, fixes, phases = (documents[kind][kind] for kind in KINDS)
    item_map = {item["id"]: item for item in items}
    phase_ids = [phase["phase"] for phase in phases]
    if phase_ids != list(range(7)):
        errors.append("phases.json: phases must appear once each, in order 0 through 6")

    for kind, records in (("items", items), ("fixes", fixes)):
        ids = [record["id"] for record in records]
        if len(set(ids)) != len(ids):
            errors.append(f"{kind}.json: duplicate record IDs")
        for record in records:
            key = record["id"]
            for field in ("last_verified", "price_checked_at"):
                value = record.get(field)
                if value and date.fromisoformat(value) > date.today():
                    errors.append(f"{key}: {field} cannot be a future date")
            if record["last_verified"] < documents[kind]["imported_at"]:
                errors.append(f"{key}: last_verified predates import")
            if record["source"]["creator"] is None and record["source"]["credit_status"] != "pending":
                errors.append(f"{key}: unknown creator must have pending credit")
            if record["source"]["creator"] is not None and record["source"]["credit_status"] != "named":
                errors.append(f"{key}: named creator must have named credit status")
            if record["verified_firmware"] is not None and record["provenance"]["verification_status"] in (
                "imported-not-tested", "source-reviewed-not-tested"
            ):
                errors.append(f"{key}: untested import must not claim a verified firmware")
            for field in ("requires", "conflicts", "optional_related_items", "related_items"):
                for target in record.get(field, []):
                    if target not in item_map:
                        errors.append(f"{key}: {field} references missing item {target}")
                    if target == key:
                        errors.append(f"{key}: self-reference in {field}")
            for field in ("url",):
                url = record["source"][field]
                parsed = urlsplit(url)
                query_keys = {name.lower() for name, _ in parse_qsl(parsed.query)}
                if parsed.username or parsed.password or not parsed.hostname:
                    errors.append(f"{key}: invalid public source URL")
                if query_keys & {"ref", "referral", "aff", "affiliate", "tag", "aff_id"} or any(
                    name.startswith("utm_") for name in query_keys
                ):
                    errors.append(f"{key}: affiliate/tracking parameters in source URL")
                if parsed.path.lower().endswith((".stl", ".3mf", ".bin", ".uf2", ".pdf")):
                    errors.append(f"{key}: link to creator page, not a direct third-party file")

    for document in documents.values():
        if date.fromisoformat(document["imported_at"]) > date.today():
            errors.append("imported_at cannot be a future date")
    if len({doc["version"] for doc in documents.values()}) != 1:
        errors.append("data documents must use the same schema version")

    gates = {gate for item in items for gate in item["gates"]}
    for item in items:
        key = item["id"]
        for target in item["conditions"].get("after_selected", []):
            if target not in item_map:
                errors.append(f"{key}: after_selected references missing item {target}")
            if target == key:
                errors.append(f"{key}: self-reference in after_selected")
        if item["phase"] not in phase_ids:
            errors.append(f"{key}: unknown phase")
        for target in item["conflicts"]:
            if target in item_map and key not in item_map[target]["conflicts"]:
                errors.append(f"{key}: conflict with {target} must be symmetric")
        if set(item["requires"]) & set(item["conflicts"]):
            errors.append(f"{key}: item both requires and conflicts with same item")
        for required in item["conditions"].get("required_gates", []):
            if required not in gates:
                errors.append(f"{key}: gate {required} has no provider")
            providers = [p for p in items if required in p["gates"] and p["id"] != key]
            if not providers:
                errors.append(f"{key}: gate {required} has no independent provider")
        for target in item["requires"]:
            if target in item_map and item_map[target]["phase"] > item["phase"]:
                errors.append(f"{key}: prerequisite {target} is in a later phase")

    visiting, visited = set(), set()

    def visit(key):
        if key in visiting:
            errors.append(f"items.json: prerequisite cycle at {key}")
            return
        if key in visited or key not in item_map:
            return
        visiting.add(key)
        for target in item_map[key]["requires"] + item_map[key]["conditions"].get("after_selected", []):
            visit(target)
        visiting.remove(key)
        visited.add(key)

    for key in item_map:
        visit(key)

    step_ids = []
    for phase in phases:
        for step in phase["steps"]:
            step_ids.append(step["id"])
            target = step["item_id"]
            if target is not None and target not in item_map:
                errors.append(f"{step['id']}: track references missing item {target}")
            if target in item_map and item_map[target]["phase"] > phase["phase"]:
                errors.append(f"{step['id']}: track introduces item before its earliest phase")
    if len(step_ids) != len(set(step_ids)):
        errors.append("phases.json: duplicate track step IDs")
    return errors


def main() -> int:
    try:
        documents = load_documents()
        errors = validate_documents(documents)
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors), file=sys.stderr)
        return 1
    for kind in KINDS:
        print(f"PASS data/{kind}.json: {len(documents[kind][kind])} records (JSON Schema 2020-12)")
    print("PASS cross-document references, prerequisite DAG, gate providers, conflicts, track order, attribution and URLs")
    js_bytes = sum(path.stat().st_size for path in ROOT.rglob("*")
                   if path.suffix in {".js", ".mjs"}
                   if not {".git", ".venv"}.intersection(path.parts))
    if js_bytes >= 200_000:
        print(f"FAIL total JavaScript {js_bytes} bytes; must be below 200000", file=sys.stderr)
        return 1
    print(f"PASS total JavaScript: {js_bytes} / 200000 bytes")
    print("Validation passed: 3 data files; 0 errors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
