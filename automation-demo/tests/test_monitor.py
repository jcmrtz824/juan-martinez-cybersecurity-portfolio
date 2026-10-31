"""Offline regression tests; all HTTP calls and credentials are synthetic."""

import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from contextlib import redirect_stdout
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError, URLError

spec = importlib.util.spec_from_file_location(
    "monitor", Path(__file__).resolve().parents[1] / "monitor.py"
)
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)


class MonitorTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.log_path = Path(temporary.name) / "nested" / "health.jsonl"
        for patcher in (
            patch.dict(os.environ, {}, clear=True),
            patch.object(monitor, "LOG_PATH", self.log_path),
        ):
            patcher.start()
            self.addCleanup(patcher.stop)
        http_patcher = patch.object(monitor.request, "urlopen")
        self.urlopen = http_patcher.start()
        self.addCleanup(http_patcher.stop)

    def response(self, body, status=200):
        response = MagicMock()
        response.status = status
        response.read.return_value = json.dumps(body).encode()
        context = MagicMock()
        context.__enter__.return_value = response
        return context

    def run_monitor(self):
        output = io.StringIO()
        with redirect_stdout(output):
            exit_code = monitor.main()
        report = json.loads(output.getvalue())
        records = [json.loads(line) for line in self.log_path.read_text().splitlines()]
        self.assertEqual(len(records), 1)
        # Alert metadata must not overwrite the original health evidence.
        self.assertEqual(records[0], {
            key: value for key, value in report.items()
            if key not in ("telegram", "telegram_error")
        })
        return exit_code, report

    def test_unavailable_service_without_credentials(self):
        self.urlopen.side_effect = URLError("service unavailable")
        code, report = self.run_monitor()
        self.assertEqual(code, 1)
        self.assertFalse(report["healthy"])
        self.assertIn("service unavailable", report["error"])
        self.assertEqual(report["telegram"], "not_configured")
        self.assertEqual(self.urlopen.call_count, 1)

    def test_missing_or_partial_credentials_skip_delivery(self):
        for credentials in ({}, {"TELEGRAM_BOT_TOKEN": "test-token"},
                            {"TELEGRAM_CHAT_ID": "test-chat"}):
            with self.subTest(credentials=credentials), patch.dict(
                os.environ, credentials, clear=True
            ):
                self.assertEqual(monitor.telegram_alert("test"), "not_configured")
        self.urlopen.assert_not_called()

    def test_failed_delivery_preserves_original_failure_and_exit_status(self):
        failures = (
            URLError("https://api.telegram.org/bottest-token/sendMessage"),
            HTTPError("https://api.telegram.org/bottest-token/sendMessage", 401,
                      "Unauthorized", {}, None),
            TimeoutError("test-token test-chat"),
            RuntimeError("test-token test-chat"),
        )
        for failure in failures:
            with self.subTest(failure=type(failure).__name__), patch.dict(
                os.environ, {"TELEGRAM_BOT_TOKEN": "test-token",
                             "TELEGRAM_CHAT_ID": "test-chat"}
            ):
                self.log_path.unlink(missing_ok=True)
                self.urlopen.side_effect = [URLError("original service failure"), failure]
                code, report = self.run_monitor()
                self.assertEqual(code, 1)
                self.assertFalse(report["healthy"])
                self.assertIn("original service failure", report["error"])
                self.assertEqual(report["telegram"], "failed")
                self.assertEqual(report["telegram_error"], type(failure).__name__)
                self.assertNotIn("test-token", json.dumps(report))
                self.assertNotIn("test-chat", json.dumps(report))

    def test_unhealthy_response_with_successful_delivery(self):
        with patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": "test-token",
                                     "TELEGRAM_CHAT_ID": "test-chat"}):
            self.urlopen.side_effect = [self.response({"status": "degraded"}),
                                        self.response({"ok": True})]
            code, report = self.run_monitor()
        self.assertEqual(code, 1)
        self.assertFalse(report["healthy"])
        self.assertEqual(report["response"], {"status": "degraded"})
        self.assertEqual(report["telegram"], "sent")

    def test_non_200_telegram_response_is_contained(self):
        with patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": "test-token",
                                     "TELEGRAM_CHAT_ID": "test-chat"}):
            self.urlopen.side_effect = [URLError("original service failure"),
                                        self.response({}, status=503)]
            code, report = self.run_monitor()
        self.assertEqual(code, 1)
        self.assertEqual(report["telegram"], "failed")
        self.assertEqual(report["telegram_error"], "RuntimeError")
        self.assertIn("original service failure", report["error"])

    def test_healthy_service_does_not_send_alert(self):
        with patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": "test-token",
                                     "TELEGRAM_CHAT_ID": "test-chat"}):
            self.urlopen.return_value = self.response({"status": "ok"})
            code, report = self.run_monitor()
        self.assertEqual(code, 0)
        self.assertTrue(report["healthy"])
        self.assertNotIn("telegram", report)
        self.assertEqual(self.urlopen.call_count, 1)


if __name__ == "__main__":
    unittest.main()
