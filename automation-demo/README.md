# Sanitized Workflow Automation Demo

This small, dependency-free demonstration provides public evidence of a Linux-oriented automation pattern using Node.js, Python, a REST endpoint, PM2 configuration, cron scheduling, JSONL monitoring records, and optional Telegram failure notifications.

It is a portfolio demonstration, not a production deployment or paid-client system. No credentials, private infrastructure, business data, performance metrics, or production logs are included.

## What is demonstrated

| Capability | Public evidence |
| --- | --- |
| Node.js and REST API | `server.js` exposes `GET /health` using Node's HTTP module |
| Python | `monitor.py` calls the endpoint, evaluates readiness, and records the result |
| Linux process management | `ecosystem.config.js` provides a PM2 application definition |
| Scheduling | `cron.example` shows a five-minute Linux cron entry |
| Monitoring and JSONL | Each check appends one structured record to `monitoring/health-checks.jsonl` |
| Telegram notification | `monitor.py` optionally calls Telegram's Bot API on failure when environment variables are configured |

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

PM2 and cron are optional operating examples:

```bash
pm2 start ecosystem.config.js
pm2 status
```

Copy `.env.example` to `.env` only for local reference; this dependency-free script reads environment variables from the shell and does not load `.env` automatically. Export `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to enable failure alerts. Never commit either value.

## OpenClaw evidence boundary

This demo's health endpoint and JSON output can be consumed by an external controller such as OpenClaw, but the repository does **not** contain or prove an active OpenClaw deployment, multi-service coordination, lead-generation workflow, dashboard, production watchdog, or delivered Telegram message. Those claims require separate sanitized configuration, screenshots, or logs before they can be treated as publicly evidenced.
