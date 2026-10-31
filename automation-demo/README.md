# Sanitized Workflow Automation Demo

This small, dependency-free demonstration implements a Node.js health endpoint and Python monitoring workflow, with example PM2 and cron configuration and an optional Telegram failure-alert integration.

It is a portfolio demonstration, not a production deployment or paid-client system. No credentials, private infrastructure, business data, performance metrics, or production logs are included.

> This project is a Portfolio Demonstration. It is a synthetic case study created for a cybersecurity consulting portfolio. It does not represent paid client work, employment history, or testing performed for a real organization unless explicitly stated.

> No live third-party systems were tested. No real client names, production IP addresses, credentials, proprietary data, or sensitive information are included.

## What is demonstrated

| Capability | Public evidence |
| --- | --- |
| Node.js and REST API | `server.js` exposes `GET /health` using Node's HTTP module |
| Python | `monitor.py` calls the endpoint, evaluates readiness, and records the result |
| PM2 configuration | `ecosystem.config.js` contains an example PM2 application definition; PM2 execution is not validated here |
| Cron scheduling | `cron.example` contains an installable five-minute scheduling example; installed cron execution is not evidenced |
| Monitoring and JSONL | Each check appends one structured record to `monitoring/health-checks.jsonl` |
| Telegram alert integration | `monitor.py` contains an optional Telegram Bot API failure-alert path; successful delivery has not been validated |
| Defensive notification handling | Offline tests verify that Telegram exceptions preserve the original health report and unhealthy exit status |

## Run locally

Requirements: Node.js 18+ and Python 3. No package installation is required for the demo itself.

```bash
cd automation-demo
node server.js
```

In another terminal:

```bash
cd automation-demo
python3 monitor.py
```

Expected result: the monitor exits successfully and appends a JSON object with `"healthy":true` to `monitoring/health-checks.jsonl`.

PM2 and cron are optional operating examples and are not required for the basic demonstration. The PM2 commands require PM2 to be installed separately:

```bash
pm2 start ecosystem.config.js
pm2 status
```

Copy `.env.example` to `.env` only for local reference; this dependency-free script reads environment variables from the shell and does not load `.env` automatically. Export `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to enable failure alerts. Never commit either value.

## Health and notification results

The monitor appends the health result to JSONL **before** attempting notification. The JSONL record contains the original health evidence; notification metadata appears only in the final JSON report on stdout.

- Healthy checks print the health report and exit with status `0`, without attempting Telegram delivery.
- Unhealthy checks print the health report and exit with status `1`, including when notification raises an exception.
- If either Telegram environment variable is missing, delivery is skipped and the report includes `"telegram": "not_configured"`.
- If the Telegram request completes with HTTP 200, the report includes `"telegram": "sent"`. This reflects the current HTTP status check; the script does not validate Telegram's response body or prove receipt by a person.
- If notification raises an ordinary exception, the report includes `"telegram": "failed"` and `telegram_error` containing only its exception class, such as `HTTPError` or `TimeoutError`. Raw Telegram exception messages are omitted because they may contain the bot token in the request URL.

The existing Telegram request timeout is 10 seconds. There are no notification retries. This change isolates notification exceptions; failures writing the health log or stdout remain outside this guarantee.

## Validation

From the repository root:

```bash
node --check automation-demo/server.js
node --check automation-demo/ecosystem.config.js
python3 -m py_compile automation-demo/monitor.py
python3 -m unittest discover -s automation-demo/tests -v
```

The six standard-library test methods cover unavailable services, unhealthy responses, Telegram network errors, HTTP rejection, timeouts and other notification exceptions, missing or partial credentials, mocked successful delivery, and healthy checks. They assert the final report, original JSONL evidence, and return status. All HTTP calls are mocked, logs use temporary directories, and credentials are synthetic. No Telegram messages are sent by the tests.

Local validation of this change also exercised the monitor as a subprocess against the demo Node server: `/health` returned exit `0`, a missing route returned exit `1`, and the stopped service returned exit `1`. All three runs printed valid JSON and appended the expected health record to a temporary JSONL file, with Telegram credentials absent.

For an end-to-end local check, start `node server.js` in `automation-demo`, then run:

```bash
python3 monitor.py
```

A successful check exits with status `0` and appends a record containing `"healthy":true`. PM2 execution, installed cron execution, Telegram delivery, and OpenClaw integration have not been validated by this repository.

## OpenClaw evidence boundary

This demo's health endpoint and JSON output can be consumed by an external controller such as OpenClaw, but the repository does **not** contain or prove an active OpenClaw deployment, multi-service coordination, lead-generation workflow, dashboard, production watchdog, or delivered Telegram message. Those claims require separate sanitized configuration, screenshots, or logs before they can be treated as publicly evidenced.
