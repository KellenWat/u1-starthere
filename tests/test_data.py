"""M1 import checks and meaningful negative cases for the offline validator."""

import copy
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from validate import load_documents, validate_documents


class DataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.seed = load_documents()

    def setUp(self):
        self.docs = copy.deepcopy(self.seed)

    def item(self, key):
        return next(item for item in self.docs["items"]["items"] if item["id"] == key)

    def rejects(self, phrase):
        errors = validate_documents(self.docs)
        self.assertTrue(any(phrase in error for error in errors), errors)

    def test_seed_passes(self):
        self.assertEqual(validate_documents(self.docs), [])

    def test_catalog_groups_cannot_drop_items(self):
        self.docs['items']['catalog_groups'].pop(0)
        self.rejects('exactly one catalog group')

    def test_catalog_categories_cannot_appear_twice(self):
        self.docs['items']['catalog_groups'][1]['categories'].append('setup')
        self.rejects('overlapping category')

    def test_catalog_group_ids_are_unique(self):
        self.docs['items']['catalog_groups'][1]['id'] = self.docs['items']['catalog_groups'][0]['id']
        self.rejects('duplicate group ID')

    def test_community_evidence_rejects_tracking_links(self):
        self.item('split-waste-chute')['community_evidence'][0]['url'] += '?utm_source=test'
        self.rejects('affiliate/tracking')

    def test_community_evidence_links_to_pages_not_files(self):
        self.item('split-waste-chute')['community_evidence'][0]['url'] = 'https://example.org/model.stl'
        self.rejects('direct third-party file')

    def test_minimum_catalog_and_fixes(self):
        expected = {
            "stock-burn-in-complete", "concrete-paver-base", "just-a-riser-xl",
            "ptfe-support-guides", "tpu-feed-tube-holder", "tool-holders-spool-adapters",
            "cryogrip-pro", "paxx12-extended-firmware", "openspool-ntag215", "space-pi-x4",
            "dryer-dry-feed", "vfa-slicer-fix", "flow-pa-calibration", "makerworld-u1-converter",
            "spare-toolhead", "spares-kit", "official-top-cover", "diy-samla-lid", "biqu-popcap",
            "liber-high-flow-hotends", "hardened-steel-hotends", "panda-breath-heater",
            "mainboard-psu-cooling", "biqu-popstatus", "multiace", "sidecar", "full-spectrum",
        }
        self.assertTrue(expected <= {item["id"] for item in self.docs["items"]["items"]})
        expected_fixes = {
            "pogo-cleaning-reminder-loop", "homing-anomaly", "nozzle-grease-calibration",
            "vfa-banding", "prime-tower-toppling", "runout-sensor-errors", "psu-fan-whine",
            "driver-temperature-baseline", "dryer-feed-rfid-loss", "cryogrip-part-stuck",
            "pogo-fan-dropout", "top-cover-odor-mode",
        }
        self.assertTrue(expected_fixes <= {card["id"] for card in self.docs["fixes"]["fixes"]})

    def test_rejects_code_without_evidence(self):
        del self.docs["fixes"]["fixes"][0]["code_evidence"]
        self.rejects("required property")

    def test_rejects_duplicate_code_mapping(self):
        self.docs["fixes"]["fixes"][1]["codes"].append(self.docs["fixes"]["fixes"][0]["codes"][0])
        self.rejects("duplicate code mapping")

    def test_rejects_partial_code(self):
        self.docs["fixes"]["fixes"][0]["codes"] = ["0045"]
        self.rejects("does not match")

    def test_rejects_unreviewed_code_mapping(self):
        self.docs["fixes"]["fixes"][0]["provenance"]["verification_status"] = "imported-not-tested"
        self.rejects("code mapping must be source-reviewed")

    def test_rejects_code_review_date_mismatch(self):
        self.docs["fixes"]["fixes"][0]["code_evidence"]["reviewed_at"] = "2026-10-28"
        self.rejects("code review date must match")

    def test_rejects_tracking_in_code_evidence(self):
        self.docs["fixes"]["fixes"][0]["code_evidence"]["sources"][0]["url"] += "?ref=affiliate"
        self.rejects("affiliate/tracking")

    def test_import_prices_preserved(self):
        prices = {"cryogrip-pro": 27.89, "space-pi-x4": 159, "spare-toolhead": 64.99,
                  "official-top-cover": 149, "biqu-popcap": 175.99,
                  "liber-high-flow-hotends": 99, "hardened-steel-hotends": 15.99,
                  "panda-breath-heater": 87.12, "biqu-popstatus": 32.55,
                  "biqu-popstation-mini": 279.99}
        for key, price in prices.items():
            with self.subTest(item=key):
                self.assertEqual(self.item(key)["cost_usd"], price)
                self.assertEqual(self.item(key)["price_checked_at"], "2026-10-26")
        self.assertAlmostEqual(self.item("spares-kit")["cost_usd"], 3.99 * 3 + 4.99)
        self.assertIsNone(self.item("multiace")["cost_usd"])

    def test_seed_encodes_prerequisites_and_warnings(self):
        self.assertIn("stock-burn-in-complete", self.item("paxx12-extended-firmware")["requires"])
        heater = self.item("panda-breath-heater")
        self.assertIn("mainboard-psu-cooling", heater["requires"])
        self.assertIn("enclosed", heater["conditions"]["required_gates"])
        self.assertIn("openspool-ntag215", self.item("dryer-dry-feed")["optional_related_items"])
        self.assertIn("RFID", " ".join(self.item("dryer-dry-feed")["warnings"]))
        for key in ("spoolman-integration", "print-notifications"):
            self.assertEqual(self.item(key)["type"], "setting")

    def test_embedded_license_and_import_attribution(self):
        for document in self.docs.values():
            self.assertEqual(document["license"], "CC-BY-4.0")
            self.assertEqual(document["imported_at"], "2026-10-28")
            self.assertEqual({s["id"] for s in document["attribution"]["sources"]}, {"brief", "checklist"})

    def test_rejects_missing_required_field(self):
        del self.item("cryogrip-pro")["source"]
        self.rejects("required property")

    def test_rejects_unknown_field(self):
        self.item("cryogrip-pro")["cost_uds"] = 1
        self.rejects("Additional properties")

    def test_rejects_invalid_date_and_category(self):
        self.item("cryogrip-pro")["last_verified"] = "2026-02-30"
        self.item("cryogrip-pro")["category"] = "sponsor"
        self.rejects("date")
        self.rejects("not one of")

    def test_rejects_negative_price(self):
        self.item("cryogrip-pro")["cost_usd"] = -1
        self.rejects("minimum")

    def test_rejects_malformed_uri(self):
        self.item("cryogrip-pro")["source"]["url"] = "https://example.com/%zz"
        self.rejects("not a 'uri'")

    def test_missing_uri_dependency_fails_explicitly(self):
        with patch.dict("validate.FormatChecker.checkers", {}, clear=True):
            with self.assertRaisesRegex(ValueError, "URI format dependency missing"):
                validate_documents(self.docs)

    def test_rejects_duplicate_ids(self):
        self.docs["items"]["items"].append(copy.deepcopy(self.item("cryogrip-pro")))
        self.rejects("duplicate record IDs")

    def test_rejects_dangling_reference(self):
        self.item("cryogrip-pro")["requires"].append("missing-item")
        self.rejects("missing item")

    def test_rejects_unknown_followup_reference(self):
        self.item("vibration-recalibration")["conditions"]["after_selected"] = ["missing-item"]
        self.rejects("missing item")

    def test_rejects_followup_cycle(self):
        self.item("just-a-riser-xl")["conditions"]["after_selected"] = ["vibration-recalibration"]
        self.rejects("prerequisite cycle")

    def test_rejects_dependency_cycle(self):
        self.item("bench-and-slicer-prep")["requires"] = ["stock-burn-in-complete"]
        self.rejects("prerequisite cycle")

    def test_rejects_asymmetric_conflict(self):
        self.item("official-top-cover")["conflicts"] = []
        self.rejects("must be symmetric")

    def test_rejects_missing_gate_provider(self):
        self.item("abs-asa-first-print")["conditions"]["required_gates"] = ["no-such-gate"]
        self.rejects("has no provider")

    def test_rejects_broken_fix_reference(self):
        self.docs["fixes"]["fixes"][0]["related_items"] = ["missing-item"]
        self.rejects("missing item")

    def test_rejects_broken_track_reference(self):
        self.docs["phases"]["phases"][0]["steps"][0]["item_id"] = "missing-item"
        self.rejects("track references missing item")

    def test_rejects_missing_track_prerequisite(self):
        self.docs["phases"]["phases"][2]["steps"][0]["requires_steps"] = ["missing-step"]
        self.rejects("missing prerequisite step")

    def test_rejects_track_prerequisite_after_dependent(self):
        self.docs["phases"]["phases"][2]["steps"][0]["requires_steps"] = ["test-four-color"]
        self.rejects("prerequisite step must appear earlier")

    def test_rejects_missing_guide_completion_check(self):
        del self.docs["phases"]["phases"][2]["steps"][0]["guidance"]["done_when"]
        self.rejects("required property")

    def test_rejects_guide_tracking_links(self):
        self.docs["phases"]["phases"][2]["steps"][0]["guidance"]["sources"][0]["url"] += "?ref=affiliate"
        self.rejects("affiliate/tracking")

    def test_rejects_milestone_requiring_optional_purchase(self):
        self.docs["phases"]["milestones"][0]["step_ids"].append("consider-paver")
        self.rejects("readiness must not require optional step")

    def test_rejects_missing_milestone_step(self):
        self.docs["phases"]["milestones"][0]["step_ids"].append("missing-step")
        self.rejects("missing milestone step")

    def test_rejects_missing_track_destination(self):
        node = next(node for node in self.docs["journey"]["nodes"] if node.get("step_id"))
        node["step_id"] = "missing-step"
        self.rejects("missing track destination")

    def test_rejects_reordered_phases(self):
        self.docs["phases"]["phases"].reverse()
        self.rejects("in order 0 through 6")

    def test_rejects_duplicate_track_step_ids(self):
        steps = self.docs["phases"]["phases"][0]["steps"]
        steps[1]["id"] = steps[0]["id"]
        self.rejects("duplicate track step IDs")

    def test_rejects_fake_firmware_verification(self):
        self.item("cryogrip-pro")["verified_firmware"] = "1.5.x"
        self.rejects("must not claim a verified firmware")

    def test_rejects_false_creator_credit(self):
        self.item("tpu-feed-tube-holder")["source"]["credit_status"] = "named"
        self.rejects("unknown creator")

    def test_rejects_affiliate_link(self):
        self.item("cryogrip-pro")["source"]["url"] += "?ref=commission"
        self.rejects("affiliate/tracking")

    def test_rejects_direct_model_download(self):
        self.item("cryogrip-pro")["source"]["url"] = "https://example.com/model.stl"
        self.rejects("not a direct third-party file")

    def test_rejects_missing_journey_destination(self):
        self.docs["journey"]["nodes"][0]["choices"][0]["next"] = "missing-node"
        self.rejects("missing journey node")

    def test_rejects_missing_journey_fix(self):
        node = next(node for node in self.docs["journey"]["nodes"] if node["kind"] == "fix")
        node["fix_id"] = "not-a-fix"
        self.rejects("missing fix")

    def test_rejects_duplicate_journey_choices(self):
        node = self.docs["journey"]["nodes"][0]
        node["choices"].append(copy.deepcopy(node["choices"][0]))
        self.rejects("duplicate choice IDs")

    def test_rejects_unreachable_journey_nodes(self):
        node = copy.deepcopy(self.docs["journey"]["nodes"][-1])
        node["id"] = "unreachable-support"
        self.docs["journey"]["nodes"].append(node)
        self.rejects("unreachable node")

    def test_rejects_missing_resource_item(self):
        node = next(node for node in self.docs["journey"]["nodes"] if node["kind"] == "resources")
        node["item_ids"].append("missing-software")
        self.rejects("missing resource item")

    def test_rejects_software_tracking_links(self):
        self.item("helixscreen")["software"]["docs"][0]["url"] += "?ref=affiliate"
        self.rejects("affiliate/tracking")

    def test_rejects_software_without_setup_outline(self):
        self.item("helixscreen")["software"]["setup_steps"] = []
        self.rejects("/software/setup_steps")


if __name__ == "__main__":
    unittest.main()
