# LeadRescue

LeadRescue is a missed-call text-back prototype for home-service businesses. A text assistant collects service, name, location, and timing, then prepares an alert for the owner. Business configurations are JSON files in `config/businesses/`.

## Run the local demo

```bash
npm ci
npm run demo
npm test
```

Open `http://127.0.0.1:3000`. The demo uses the bundled sample business, a scripted assistant, and an in-memory store. It records simulated texts and alerts until reset or restart. Use sample inputs for demonstrations. The process binds to IPv4 loopback, checks the browser origin on simulator actions, and refuses to start in production. Keep the demo off public proxies and tunnels.

## Webhook server

`npm start` launches the webhook server. It serves `GET /healthz` and signed Twilio hooks. The demo page, state API, and simulator actions are unavailable on this server.

| Variable | Purpose |
|---|---|
| `NODE_ENV=production` | Refuses explicit demo startup. |
| `DISABLE_SIM=1` | Also refuses explicit demo startup if retained in existing configuration. |
| `ANTHROPIC_API_KEY` | Enables Claude on the webhook server. Unset it and `ANTHROPIC_AUTH_TOKEN`, or set `LEADRESCUE_BRAIN=script`, to use the scripted assistant. |
| `LEADRESCUE_MODEL` | Model ID. Default `claude-opus-5-5`. |
| `TWILIO_AUTH_TOKEN`, `PUBLIC_BASE_URL` | Enable signed webhook requests. Set the base URL to the exact public HTTPS origin configured in Twilio. Missing configuration causes requests to be denied. |
| `TWILIO_ACCOUNT_SID` | With the auth token, enables real outbound SMS on the webhook server. Keep live credentials out of staging until authorized. |
| `PORT` | Default 3000. |

Voice mode `forwarded` expects the carrier to forward unanswered calls only. Mode `dial` rings the owner through Twilio and uses the signed `POST /twilio/dial-status` callback to determine the outcome. Configure voice and inbound SMS on `POST /twilio/voice` and `POST /twilio/sms`.

## Before a customer pilot

- **Consent.** Have counsel and the contractor review the exact caller flow against the [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy) and applicable TCPA rules before any customer traffic. The engine currently sends after an unanswered call without checking for customer consent. Require a documented, sender-specific opt-in before sending a proactive text. Keep consent evidence, identify the sender, and let callers use a voice callback if they decline. Reconcile carrier opt-out events with the application's list and test that an opt-out also blocks any reply already in progress. Keep the pilot focused on the service request.
- **Twilio.** Confirm sender registration for the chosen number. Test both call modes, missed and answered calls, inbound replies, owner alerts, and STOP/START/HELP with consenting test phones. Verify signatures through the actual HTTPS ingress against the exact configured URL. The custom signature logic has offline fixtures. Check it against Twilio's fixtures or use Twilio's SDK validator before the pilot. Add delivery status tracking using message SIDs and signed callbacks. The current outbox marks an accepted REST request as sent, and the voice flow can announce a text even when sending was skipped or failed.
- **Claude.** Validate the configured model, structured output, and fallback with synthetic messages against the actual pilot account. Check timeout and refusal handling, prompt injection, reply length, and accidental diagnosis, pricing, or appointment promises. Make emergency guidance and escalation deterministic and verify human handoff. Review [Anthropic's data retention terms](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) and minimize transcripts and addresses sent to the model.
- **Hosting and reliability.** Start with one contractor and private business configuration. Keep secrets, transcripts, and backups outside the public repo. Use restricted encrypted storage, limited retention, and a tested deletion and recovery process. The webhook runtime currently uses one local JSON file. Use a durable webhook queue and deduplicate Twilio call and message IDs before relying on retries or restarts. Verify TLS, public route exposure, monitoring with redacted logs, and an outbound kill switch before enabling customer messaging.

## Verification

`npm test` runs offline engine and HTTP tests, including demo isolation, production startup protection, disabled routes, and signed webhooks. The Claude test uses a stubbed client and messages use a dry-run sender. Live Twilio calls, handset delivery, live Claude requests, customer consent, and hosted ingress require separate verification.
