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


    def test_accepts_fractional_seconds(self):
        for fraction in ("1", "123456"):
            with self.subTest(fraction=fraction):
                payload = example()
                payload["observed_at"] = "2026-11-06T12:59:00." + fraction + "Z"
                self.assertTrue(validate(payload, NOW))

    def test_rejects_noncanonical_timestamps(self):
        for timestamp in (
            "2026-11-06\n12:59:00Z",
            "2026-11-06X12:59:00Z",
            "2026-11-06T12:59:00.00000012345678901234567890Z",
            "2026-11-06Z",
            "2026-11-06T12:59:00+00:00",
            "2026-11-06T12:59:00+00:00Z",
            "2026-11-06T12:59:00Z\n",
        ):
            with self.subTest(timestamp=timestamp):
                payload = example()
                payload["observed_at"] = timestamp
                with self.assertRaises(ValueError):
                    validate(payload, NOW)

    def test_rejects_invalid_calendar_dates(self):
        payload = example()
        payload["observed_at"] = "2026-02-30T12:59:00Z"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_freshness_boundaries(self):
        for seconds, accepted in (
            (900, True), (900.000001, False),
            (-60, True), (-60.000001, False),
        ):
            with self.subTest(seconds=seconds):
                payload = example()
                observed = NOW - dt.timedelta(seconds=seconds)
                payload["observed_at"] = observed.isoformat().replace("+00:00", "Z")
                if accepted:
                    self.assertTrue(validate(payload, NOW))
                else:
                    with self.assertRaises(ValueError):
                        validate(payload, NOW)

    def test_cli_rejects_date_only_without_traceback(self):
        import contextlib
        import io
        from unittest.mock import patch
        from status_contract import main

        payload = example()
        payload["observed_at"] = "2026-11-06Z"
        import json
        stderr = io.StringIO()
        with patch("sys.argv", ["status_contract.py", "snapshot.json"]), \
                patch("status_contract.Path.read_text", return_value=json.dumps(payload)), \
                contextlib.redirect_stderr(stderr):
            with self.assertRaises(SystemExit) as error:
                main()
        self.assertEqual(error.exception.code, 1)
        self.assertIn("REJECTED:", stderr.getvalue())
        self.assertNotIn("Traceback", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
