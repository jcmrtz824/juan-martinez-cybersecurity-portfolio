"""Validate deliberately minimal, public-safe OpenClaw status reports.

Validation does not attest that the source host or broker is healthy.
Never feed this validator credentials, logs, order details or account IDs.
"""
import argparse
import datetime as dt
import json
from pathlib import Path

SCHEMA_VERSION = 1
FIELDS = {
    "schema_version", "observed_at", "environment", "readiness",
    "authorization", "orb", "scanner", "runtime", "reconciliation",
    "blockers",
}
STATES = {"ok", "degraded", "blocked", "unknown"}
MAX_AGE_SECONDS = 15 * 60


def validate(document, now=None):
    if not isinstance(document, dict) or set(document) != FIELDS:
        raise ValueError("Unexpected or missing fields (fail closed)")
    if type(document["schema_version"]) is not int or document["schema_version"] != SCHEMA_VERSION:
        raise ValueError("Invalid schema version")
    if document["environment"] not in {"paper", "unknown"}:
        raise ValueError("Only paper or unknown environments may be published")
    for field in ("readiness", "authorization", "orb", "scanner", "runtime", "reconciliation"):
        if type(document[field]) is not str or document[field] not in STATES:
            raise ValueError("Invalid status: " + field)
    if not isinstance(document["blockers"], list) or len(document["blockers"]) > 10:
        raise ValueError("Invalid blockers")
    # Fixed codes only; never permit free-form logs or secret-bearing messages.
    allowed = {
        "readiness_unverified", "authorization_unverified", "scanner_stale",
        "orb_unverified", "runtime_unverified", "reconciliation_unverified",
        "paper_endpoint_unverified", "telemetry_unavailable",
    }
    if any(type(b) is not str or b not in allowed for b in document["blockers"]):
        raise ValueError("Unapproved blocker code")
    if type(document["observed_at"]) is not str or not document["observed_at"].endswith("Z"):
        raise ValueError("Timestamp must be UTC ISO-8601 with Z")
    try:
        observed = dt.datetime.fromisoformat(document["observed_at"].replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Invalid timestamp") from exc
    now = now or dt.datetime.now(dt.timezone.utc)
    age = (now - observed).total_seconds()
    if age < -60 or age > MAX_AGE_SECONDS:
        raise ValueError("Stale or future observation")
    if document["environment"] != "paper" and document["authorization"] == "ok":
        raise ValueError("Cannot claim authorized outside confirmed paper environment")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("snapshot", type=Path)
    args = parser.parse_args()
    try:
        payload = json.loads(args.snapshot.read_text(encoding="utf-8"))
        validate(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        parser.exit(1, "REJECTED: " + str(exc) + "\n")
    print("VALID: format, allowlist, and freshness only; runtime health NOT independently proven")


if __name__ == "__main__":
    main()
