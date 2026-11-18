# OpenClaw read-only collector staging and review runbook

**Current status: code only. No Mac mini access, deployment, source adapters, telemetry upload, or integration verified.** This tool does not query Alpaca, OpenClaw, PM2, cron, watchdogs, Telegram, or the broker.

## Step 1: readiness, endpoint and authorization
- Inspect actual read-only local evidence for the last readiness check and authorization gate.
- Verify Alpaca's **paper** environment independently without exposing URLs or credentials in the repository.
- If evidence is absent, mark status **unknown**; never treat missing signals as passed gates.
- Never disable fail-closed readiness, change strategy settings, or turn on live orders.

## Step 2: ORB, scanner and reconciliation
- Read the scanner's last success timestamp, compare to its documented cycle interval, and note staleness.
- Read ORB's strategy state and actual daily cap enforcement, not merely configuration values.
- Read broker reconciliation output using read-only privileges; missing/contradictory results remain unknown.
- Do not publish trades, symbols, position counts, P&L, or order identifiers.

## Step 3: runtime and deployment
- Inspect local PM2 and watchdog status, restart counts and cron/scheduler last-execution timestamps.
- Use a separately reviewed local read-only adapter for each specific service; do not execute shell commands from GitHub or permit remote execution.
- A passing GitHub Actions run proves only repository validation, not live deployment.

## Step 4: CI
- The PR extends explicit Python compilation to the collector, status validator and tests.
- Run `python3 -m unittest discover -s automation-demo/tests -v` and `python3 -m py_compile automation-demo/{collect_status,status_contract,monitor}.py` in the reviewed environment.

## Step 5: local staging before any publishing
The collector reads a **local reviewed input file** with exactly the keys below:
```json
{
  "observed_at": "2026-11-12T19:59:00Z",
  "environment": "unknown",
  "readiness": "unknown",
  "authorization": "unknown",
  "orb": "unknown",
  "scanner": "unknown",
  "runtime": "unknown",
  "reconciliation": "unknown"
}
```
The timestamp is **illustrative** and will be stale; don't use it as real operational evidence.

Run from the repository root after preparing an independently reviewed local input:
```sh
python3 automation-demo/collect_status.py --source /path/to/reviewed-input.json --output /path/to/private-status.json
python3 automation-demo/status_contract.py /path/to/private-status.json
```
Outputs remain local. Do **not** commit the generated status or the local input file.

The collector only filters an upstream assertion: it cannot establish that an upstream assertion is truthful. An actual Mac mini health collector, source-of-truth mapping, read-only permissions, service installation, and secure publication require separate implementation and deployment verification.

### Future publishing acceptance gates
- Only use an explicitly approved, least-privileged GitHub credential, protected from logs and output, with a dedicated destination.
- Require operator approval of each source adapter and full sensitivity review before enabling scheduling.
- Fail closed on invalid, missing, contradictory, stale or future data.
- Never upload raw local input, process output, private identifiers, secrets, or trading commands.
- Prefer a private destination unless there is a documented threat/privacy review. Disclose stale snapshots as stale, not healthy.
- Do not enable any automated GitHub publisher in this PR.
