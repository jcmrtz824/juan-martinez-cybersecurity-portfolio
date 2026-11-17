# LeadRescue

Missed-call text-back with an AI lead qualifier, built to be sold as a done-for-you service to home-service businesses.

A call the owner can't answer triggers a text to the caller. An assistant (Claude) collects what they need, their name, location and timing, then texts the owner a ready-to-call lead. One server handles many client businesses; each is a JSON file in `config/businesses/`.

## Run the demo

```bash
npm install
npm start          # http://localhost:3000
npm test
```

With no credentials it runs a scripted assistant and records texts instead of sending them, which is enough to demo in front of a prospect. Set `ANTHROPIC_API_KEY` to use Claude for the conversation.

## Environment

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables the Claude assistant. Unset = scripted fallback. |
| `LEADRESCUE_MODEL` | Model ID. Default `claude-opus-5-5`. `claude-haiku-5-5` costs far less per conversation; compare reply quality before switching. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Sends real texts and turns on webhook signature checks. Unset = dry run. |
| `PUBLIC_BASE_URL` | Public https URL of this server. Required with Twilio credentials. |
| `DISABLE_SIM=1` | Turns off the demo page and `/sim/*` in production. |
| `PORT` | Default 3000. |

## Going live for a client

1. Buy a Twilio number and register the client for A2P 10DLC (carriers block unregistered business texting).
2. Copy `config/businesses/sample-hvac.json`, fill in the client's details and the new number.
3. Point the number's Voice webhook at `POST {PUBLIC_BASE_URL}/twilio/voice` and its Messaging webhook at `POST {PUBLIC_BASE_URL}/twilio/sms`.
4. Pick a mode:
   - `forwarded`: the client turns on "forward when unanswered" with their carrier to the Twilio number. They keep their number and phone habits. Every call reaching us is already a missed call.
   - `dial`: the Twilio number is the published number. We ring `ownerPhone` for `ringSeconds`, and text back only if nobody picks up.
5. Call the client's line from a test phone, let it ring out, and walk the conversation end to end before telling them it's live.

## What has and hasn't been verified

Verified here (automated tests plus a browser run of the demo): the text-back, 24-hour redial cooldown, STOP/START/HELP handling, lead capture, owner and emergency alerts, the failure hand-off, webhook signature checking, and both call modes at the HTTP level.

Not yet verified, because no accounts were available: a real Twilio call or text, and a live Claude API call. The Claude request is tested against a stubbed client only. Do one live run of each before a customer depends on it.

## Compliance notes

Not legal advice. The service only texts people who just called the business, sends one text-back per caller per day, identifies the business, and honors STOP in code. Get the client's written OK to text their callers, and have an attorney confirm the TCPA position before scaling past pilots.
