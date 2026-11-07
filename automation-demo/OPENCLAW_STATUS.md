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

Validator behavior: deny unrecognized keys, arbitrary blocker text, invalid statuses, stale timestamps (>15 minutes), excessively future timestamps (>60 seconds), live environment declarations, and the contradictory combinations below. It validates shape, freshness, and limited internal consistency, **not the truth or origin of the status**.

Timestamps require the literal `T` separator and final `Z`; offsets, date-only values, control characters, and more than six fractional digits are rejected. Calendar dates must be valid. Observations exactly 15 minutes old or 60 seconds ahead are accepted; values beyond those limits are rejected.

## Internal consistency rules

Blockers describe current snapshot conditions, not historical warnings. `ok` is
an affirmative claim; `unknown` means insufficient information, `degraded` means
an observed impairment, and `blocked` means an explicit gate or prevention.
Missing information alone does not establish either impairment or a blocked gate.
Validation rejects contradictions with `ValueError`; it never rewrites statuses.

| Blocker | Reject | May coexist |
| --- | --- | --- |
| readiness_unverified | readiness=ok | readiness=unknown, degraded, or blocked |
| authorization_unverified | authorization=ok | authorization=unknown, degraded, or blocked |
| orb_unverified | orb=ok | orb=unknown, degraded, or blocked |
| scanner_stale | scanner=ok | scanner=unknown, degraded, or blocked |
| runtime_unverified | runtime=ok | runtime=unknown, degraded, or blocked |
| reconciliation_unverified | reconciliation=ok | reconciliation=unknown, degraded, or blocked |
| telemetry_unavailable | Any of the six status fields=ok | Any combination of unknown, degraded, and blocked |
| paper_endpoint_unverified | environment=paper | environment=unknown with authorization=unknown, degraded, or blocked |

The existing rule also rejects authorization=ok whenever environment=unknown,
with or without blockers. Environment=paper by itself does not imply readiness,
authorization, or healthy components.

`telemetry_unavailable` is deliberately snapshot-wide because version 1 has no
telemetry scope field. Do not combine it with healthy component claims. For a
partial gap, use the appropriate component code and retain `unknown` for the
unobserved component. Independently established degraded conditions or blocked
gates can remain non-ok even when full telemetry is unavailable. The validator
does not establish that such independent evidence exists.

Scoped blockers do not constrain unrelated components. For example,
scanner=degraded plus scanner_stale can coexist with runtime=ok. An unverified
component can have an independently known impairment or gate, so unverified
does not force unknown or imply confirmed failure. Where no such evidence
exists, the collector must report unknown.

All status fields remain required: absent fields are rejected, and missing
signals must be explicitly represented as unknown. Unknown/degraded/blocked do
not require blocker codes; the existing allowlist has no code for every possible
condition. Empty blockers do not imply health. Multiple codes apply together.

No dependency graph is asserted between readiness, authorization, ORB, scanner,
runtime, and reconciliation: authorization is a separate gate, and the repository
does not define which service conditions prevent readiness. Do not infer an
overall healthy or executable system merely from a valid document. Any future
dashboard must show unknowns and blockers and must not treat VALID as healthy or
as permission to trade. A future dependency or scoped telemetry model needs a
separately reviewed contract change.

These rules narrow accepted version-1 inputs without changing the field schema;
future producers must follow these semantics before using the strengthened
validator. No deployed producer is verified by this repository.

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

The offline consistency tests cover each scoped blocker across all four states,
snapshot-wide telemetry gaps, unknown and missing fields, mixed degraded states,
combined blockers, endpoint uncertainty, preservation of input values, and CLI
rejection without success output. Fixtures use a fixed clock and synthetic data;
the tests do not connect to a Mac mini, OpenClaw, a broker, or live telemetry.

No real-time status snapshot is committed because synthetic timestamps could be mistaken for live health. This is a foundation for a future reviewed, safe telemetry integration—not evidence that OpenClaw is currently running.
