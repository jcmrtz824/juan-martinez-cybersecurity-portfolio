# Proposed OpenClaw read-only status contract

**Design only. No Mac mini integration, live telemetry, broker connectivity, publishing job, or deployed agent is included in this PR.** The repository cannot yet attest that OpenClaw, ORB or the scanner are healthy.

The proposed public snapshot contains exactly these fields:

| Field | Values |
| --- | --- |
| schema_version | 1 |
| observed_at | UTC `YYYY-MM-DDTHH:MM:SSZ`, optionally with 1–6 fractional second digits before `Z` |
| environment | paper, unknown (never live) |
| readiness, authorization, orb, scanner, runtime, reconciliation | ok, degraded, blocked, unknown |
| blockers | up to 10 fixed codes from status_contract.py |

Validator behavior: deny unrecognized keys, arbitrary blocker text, invalid statuses, stale timestamps (>15 minutes), excessively future timestamps (>60 seconds), and live environment declarations. It validates shape and freshness, **not the truth or origin of the status**.

Timestamps require the literal `T` separator and final `Z`; offsets, date-only values, control characters, and more than six fractional digits are rejected. Calendar dates must be valid. Observations exactly 15 minutes old or 60 seconds ahead are accepted; values beyond those limits are rejected.

## Safety requirements before deployment

1. Run a local, **read-only** collector on the Mac mini, with no trade, order, or broker mutation rights.
2. Source status from approved local health signals, never from an LLM's interpretation.
3. Use environment=unknown unless the collector confirms the paper endpoint. Never treat a missing signal as ok.
4. Use only fixed status values and blocker codes. Never include tokens, account identifiers, positions, fills, order IDs, P&L, IP addresses, machine names, free text, or logs.
5. Validate locally *before* publishing; if validation fails, publish nothing and separately alert the operator. Prevent stale GitHub snapshots from being treated as live.
6. Require an explicit review of the collector's permissions and publication method before connecting any scheduled uploader. Public GitHub is not an appropriate sink for sensitive telemetry.

## Local validation

Run:

```sh
python3 -m unittest discover -s automation-demo/tests -v
python3 -m py_compile automation-demo/status_contract.py
```

No real-time status snapshot is committed because synthetic timestamps could be mistaken for live health. This is a foundation for a future reviewed, safe telemetry integration—not evidence that OpenClaw is currently running.
