import datetime as dt
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from collect_status import make_snapshot
from status_contract import validate

NOW = dt.datetime(2026, 11, 12, 20, 0, tzinfo=dt.timezone.utc)


def sample():
    return {
        "observed_at": "2026-11-12T19:59:00Z", "environment": "paper",
        "readiness": "ok", "authorization": "blocked", "orb": "unknown",
        "scanner": "degraded", "runtime": "ok", "reconciliation": "unknown",
    }


class CollectorTests(unittest.TestCase):
    def test_valid_attestations_are_allowlisted(self):
        item = make_snapshot(sample(), NOW)
        self.assertTrue(validate(item, NOW))
        self.assertEqual(item["environment"], "paper")
        self.assertEqual(item["readiness"], "ok")
        self.assertIn("orb_unverified", item["blockers"])

    def test_preserves_upstream_observation_time(self):
        item = make_snapshot(sample(), NOW)
        self.assertEqual(item["observed_at"], "2026-11-12T19:59:00Z")

    def test_fresh_source_is_not_retimestamped(self):
        item = sample()
        item["observed_at"] = "2026-11-12T19:55:00Z"
        out = make_snapshot(item, NOW)
        self.assertEqual(out["observed_at"], "2026-11-12T19:55:00Z")

    def test_source_time_with_invalid_calendar_fails_closed(self):
        item = sample()
        item["observed_at"] = "2026-13-12T19:59:00Z"
        self.assertEqual(make_snapshot(item, NOW)["environment"], "unknown")

    def test_missing_source_unknown(self):
        item = make_snapshot(None, NOW)
        self.assertTrue(validate(item, NOW))
        self.assertEqual(item["environment"], "unknown")
        self.assertTrue(all(item[k] == "unknown" for k in ("orb", "scanner", "runtime")))
        self.assertIn("telemetry_unavailable", item["blockers"])

    def test_extra_field_rejects_whole_source(self):
        item = sample()
        item["api_key"] = "do-not-publish"
        output = make_snapshot(item, NOW)
        self.assertNotIn("api_key", json.dumps(output))
        self.assertEqual(output["readiness"], "unknown")

    def test_stale_source_fails_closed(self):
        item = sample()
        item["observed_at"] = "2026-11-12T19:30:00Z"
        self.assertEqual(make_snapshot(item, NOW)["environment"], "unknown")

    def test_live_endpoint_fails_closed(self):
        item = sample()
        item["environment"] = "live"
        self.assertEqual(make_snapshot(item, NOW)["environment"], "unknown")

    def test_unknown_endpoint_never_implies_authorization(self):
        item = sample()
        item["environment"] = "unknown"
        item["authorization"] = "ok"
        output = make_snapshot(item, NOW)
        self.assertEqual(output["authorization"], "unknown")
        self.assertIn("paper_endpoint_unverified", output["blockers"])

    def test_no_raw_fields_are_exported(self):
        item = sample()
        item["positions"] = [{"symbol": "SECRET"}]
        text = json.dumps(make_snapshot(item, NOW))
        self.assertNotIn("SECRET", text)

    def test_output_is_valid_under_unknown_fields(self):
        item = sample()
        item["scanner"] = "unknown"
        self.assertTrue(validate(make_snapshot(item, NOW), NOW))


if __name__ == "__main__":
    unittest.main()
