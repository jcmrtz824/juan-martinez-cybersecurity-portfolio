"""Offline, read-only adapter for *reviewed* local health attestations.

This program never executes commands, connects to brokers, starts services, or
uploads data. Missing/invalid input is reported as UNKNOWN, not healthy.
Input is a local JSON file of explicit assertions from a trusted operator or
a separately reviewed read-only collection process.
"""
import argparse
import datetime as dt
import json
from pathlib import Path
from status_contract import validate

COMPONENTS = ("readiness", "authorization", "orb", "scanner", "runtime", "reconciliation")
ALLOWED = {"ok", "degraded", "blocked", "unknown"}
CODES = {
    "readiness": "readiness_unverified",
    "authorization": "authorization_unverified",
    "orb": "orb_unverified",
    "scanner": "scanner_stale",
    "runtime": "runtime_unverified",
    "reconciliation": "reconciliation_unverified",
}
MAX_INPUT_AGE = dt.timedelta(minutes=5)


def make_snapshot(source, now=None):
    """Produce a public-safe allowlisted snapshot; never echo raw source input."""
    now = now or dt.datetime.now(dt.timezone.utc)
    stamp = now.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    result = {
        "schema_version": 1,
        "observed_at": stamp,
        "environment": "unknown",
        **{name: "unknown" for name in COMPONENTS},
        "blockers": ["telemetry_unavailable", "paper_endpoint_unverified"],
    }
    if not isinstance(source, dict):
        validate(result, now)
        return result
    # Fail-closed by refusing extra input fields. No log, token, account data
    # or command line is read, copied, parsed or included in output.
    expected = {"observed_at", "environment", *COMPONENTS}
    if set(source) != expected:
        validate(result, now)
        return result
    try:
        raw_time = source["observed_at"]
        if not isinstance(raw_time, str) or not raw_time.endswith("Z"):
            raise ValueError("invalid timestamp")
        observed = dt.datetime.fromisoformat(raw_time[:-1] + "+00:00")
        if observed > now + dt.timedelta(seconds=60) or now - observed > MAX_INPUT_AGE:
            raise ValueError("stale input")
        if source["environment"] not in ("paper", "unknown"):
            raise ValueError("unconfirmed environment")
        if any(type(source[k]) is not str or source[k] not in ALLOWED for k in COMPONENTS):
            raise ValueError("invalid component state")
    except (ValueError, TypeError, OverflowError):
        validate(result, now)
        return result
    # Keep the upstream observation timestamp: never make old evidence appear newer.\n    result["observed_at"] = observed.isoformat(timespec="seconds").replace("+00:00", "Z")\n    result["environment"] = source["environment"]
    for name in COMPONENTS:
        result[name] = source[name]
    if result["environment"] == "unknown":
        result["authorization"] = "unknown"  # never establish authorization by assumption
        result["blockers"] = ["paper_endpoint_unverified"]
    else:
        result["blockers"] = []
    for name in COMPONENTS:
        if result[name] == "unknown":
            result["blockers"].append(CODES[name])
    # Default unknown/telemetry unavailable is kept only for fully invalid source.
    # For partial source, fail on any unexpectedly inconsistent output.
    validate(result, now)
    return result


def main():
    parser = argparse.ArgumentParser(description="Offline status adapter; no network or GitHub writes")
    parser.add_argument("--source", type=Path, required=True, help="Local reviewed JSON input")
    parser.add_argument("--output", type=Path, required=True, help="Local output; never publish automatically")
    args = parser.parse_args()
    try:
        obj = json.loads(args.source.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        obj = None
    status = make_snapshot(obj)
    # Never print raw input, errors, secrets or machine identifiers.
    args.output.write_text(json.dumps(status, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print("Wrote validated local snapshot (not published; no runtime attestation)")


if __name__ == "__main__":
    main()
