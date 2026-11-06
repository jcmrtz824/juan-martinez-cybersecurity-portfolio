import datetime as dt
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from status_contract import validate

NOW = dt.datetime(2026, 11, 6, 13, 0, tzinfo=dt.timezone.utc)


def example():
    return {
        "schema_version": 1, "observed_at": "2026-11-06T12:59:00Z",
        "environment": "paper", "readiness": "unknown",
        "authorization": "blocked", "orb": "unknown",
        "scanner": "unknown", "runtime": "unknown",
        "reconciliation": "unknown", "blockers": ["telemetry_unavailable"],
    }


class ContractTests(unittest.TestCase):
    def test_accepts_fresh_allowlisted_data(self):
        self.assertTrue(validate(example(), NOW))

    def test_rejects_secret_or_unexpected_field(self):
        payload = example()
        payload["api_key"] = "secret"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_rejects_free_form_blocker(self):
        payload = example()
        payload["blockers"] = ["Account 123"]
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_rejects_stale_timestamp(self):
        payload = example()
        payload["observed_at"] = "2026-11-06T12:30:00Z"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_rejects_future_timestamp(self):
        payload = example()
        payload["observed_at"] = "2026-11-06T13:10:00Z"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_rejects_live_mode(self):
        payload = example()
        payload["environment"] = "live"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_rejects_unknown_env_authorized(self):
        payload = example()
        payload["environment"] = "unknown"
        payload["authorization"] = "ok"
        with self.assertRaises(ValueError):
            validate(payload, NOW)


if __name__ == "__main__":
    unittest.main()
