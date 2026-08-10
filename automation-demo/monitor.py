#!/usr/bin/env python3
"""Check a REST health endpoint, append JSONL evidence, and optionally alert Telegram."""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib import parse, request

HEALTH_URL = os.getenv("HEALTH_URL", "http://127.0.0.1:3000/health")
LOG_PATH = Path(os.getenv("MONITOR_LOG", "monitoring/health-checks.jsonl"))


def telegram_alert(message: str) -> str:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return "not_configured"

    payload = parse.urlencode({"chat_id": chat_id, "text": message}).encode()
    endpoint = f"https://api.telegram.org/bot{token}/sendMessage"
    with request.urlopen(endpoint, data=payload, timeout=10) as response:
        if response.status != 200:
            raise RuntimeError(f"Telegram returned HTTP {response.status}")
    return "sent"


def check_health() -> dict:
    checked_at = datetime.now(timezone.utc).isoformat()
    try:
        with request.urlopen(HEALTH_URL, timeout=5) as response:
            body = json.loads(response.read().decode("utf-8"))
            healthy = response.status == 200 and body.get("status") == "ok"
            return {
                "checked_at": checked_at,
                "url": HEALTH_URL,
                "healthy": healthy,
                "http_status": response.status,
                "response": body,
            }
    except Exception as error:  # Record operational failures as monitoring evidence.
        return {
            "checked_at": checked_at,
            "url": HEALTH_URL,
            "healthy": False,
            "error": f"{type(error).__name__}: {error}",
        }


def main() -> int:
    result = check_health()
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(result, separators=(",", ":")) + "\n")

    if not result["healthy"]:
        result["telegram"] = telegram_alert(
            f"Automation demo health check failed: {result.get('error', result)}"
        )

    print(json.dumps(result, indent=2))
    return 0 if result["healthy"] else 1


if __name__ == "__main__":
    sys.exit(main())
