import datetime as dt
import copy
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


class ConsistencyTests(unittest.TestCase):
    # Keep expected policy explicit here rather than deriving it from validator constants.
    components = ("readiness", "authorization", "orb", "scanner", "runtime", "reconciliation")
    scoped_blockers = (
        ("readiness_unverified", "readiness"),
        ("authorization_unverified", "authorization"),
        ("orb_unverified", "orb"),
        ("scanner_stale", "scanner"),
        ("runtime_unverified", "runtime"),
        ("reconciliation_unverified", "reconciliation"),
    )

    def snapshot(self, state="ok", blockers=()):
        payload = example()
        payload.update({field: state for field in self.components})
        payload["blockers"] = list(blockers)
        return payload

    def test_rejects_all_healthy_with_unavailable_telemetry(self):
        with self.assertRaisesRegex(ValueError, "telemetry_unavailable"):
            validate(self.snapshot(blockers=["telemetry_unavailable"]), NOW)

    def test_unavailable_telemetry_rejects_each_ok_component(self):
        for field in self.components:
            with self.subTest(field=field):
                payload = self.snapshot("unknown", ["telemetry_unavailable"])
                payload[field] = "ok"
                with self.assertRaisesRegex(ValueError, "telemetry_unavailable"):
                    validate(payload, NOW)

    def test_unavailable_telemetry_preserves_non_ok_states(self):
        for state in ("unknown", "degraded", "blocked"):
            with self.subTest(state=state):
                payload = self.snapshot(state, ["telemetry_unavailable"])
                original = copy.deepcopy(payload)
                self.assertTrue(validate(payload, NOW))
                self.assertEqual(payload, original)

    def test_scoped_blocker_status_matrix(self):
        for code, field in self.scoped_blockers:
            for state in ("ok", "unknown", "degraded", "blocked"):
                with self.subTest(code=code, state=state):
                    # Unrelated components may remain healthy with a scoped warning.
                    payload = self.snapshot(blockers=[code])
                    payload[field] = state
                    if state == "ok":
                        with self.assertRaisesRegex(ValueError, code):
                            validate(payload, NOW)
                    else:
                        self.assertTrue(validate(payload, NOW))

    def test_paper_endpoint_environment_and_authorization_matrix(self):
        for environment in ("paper", "unknown"):
            for state in ("ok", "unknown", "degraded", "blocked"):
                with self.subTest(environment=environment, authorization=state):
                    payload = self.snapshot(blockers=["paper_endpoint_unverified"])
                    payload["environment"] = environment
                    payload["authorization"] = state
                    if environment == "paper" or state == "ok":
                        with self.assertRaises(ValueError):
                            validate(payload, NOW)
                    else:
                        self.assertTrue(validate(payload, NOW))

    def test_unknown_states_do_not_require_failure_or_blocker(self):
        payload = self.snapshot("unknown")
        payload["environment"] = "unknown"
        self.assertTrue(validate(payload, NOW))

    def test_missing_health_field_is_rejected(self):
        for field in self.components:
            with self.subTest(field=field):
                payload = self.snapshot("unknown")
                del payload[field]
                with self.assertRaisesRegex(ValueError, "missing fields"):
                    validate(payload, NOW)

    def test_valid_mixed_degraded_snapshot(self):
        payload = self.snapshot(blockers=["scanner_stale", "runtime_unverified"])
        payload.update(scanner="degraded", runtime="unknown", authorization="blocked")
        original = copy.deepcopy(payload)
        self.assertTrue(validate(payload, NOW))
        self.assertEqual(payload, original)

    def test_multiple_blockers_cannot_hide_contradiction(self):
        payload = self.snapshot("unknown", [code for code, _ in self.scoped_blockers])
        self.assertTrue(validate(payload, NOW))
        for _, field in self.scoped_blockers:
            with self.subTest(field=field):
                contradictory = copy.deepcopy(payload)
                contradictory[field] = "ok"
                with self.assertRaises(ValueError):
                    validate(contradictory, NOW)

    def test_empty_blockers_does_not_imply_healthy_or_authorized(self):
        for state in ("ok", "unknown", "degraded", "blocked"):
            with self.subTest(state=state):
                self.assertTrue(validate(self.snapshot(state), NOW))
        payload = self.snapshot()
        payload["environment"] = "unknown"
        with self.assertRaises(ValueError):
            validate(payload, NOW)

    def test_cli_rejects_contradiction_without_success_output(self):
        import contextlib
        import io
        import json
        from unittest.mock import patch
        from status_contract import main

        stdout, stderr = io.StringIO(), io.StringIO()
        parse_timestamp = dt.datetime.fromisoformat
        payload = self.snapshot(blockers=["telemetry_unavailable"])
        with patch("sys.argv", ["status_contract.py", "snapshot.json"]), \
                patch("status_contract.Path.read_text", return_value=json.dumps(payload)), \
                patch("status_contract.dt.datetime") as clock, \
                contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            clock.fromisoformat.side_effect = parse_timestamp
            clock.now.return_value = NOW
            with self.assertRaises(SystemExit) as error:
                main()
        self.assertEqual(error.exception.code, 1)
        self.assertIn("REJECTED:", stderr.getvalue())
        self.assertNotIn("Traceback", stderr.getvalue())
        self.assertEqual(stdout.getvalue(), "")


if __name__ == "__main__":
    unittest.main()
