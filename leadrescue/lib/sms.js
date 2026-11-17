// SMS sending. With TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN set, messages go out
// through Twilio's REST API. Without them, messages are only recorded in the
// outbox (dry run) - which is what the demo simulator and the tests use.
import crypto from "node:crypto";

export class SmsSender {
  constructor({ store, accountSid, authToken, fetchImpl = fetch } = {}) {
    this.store = store;
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fetch = fetchImpl;
  }

  get live() {
    return Boolean(this.accountSid && this.authToken);
  }

  async send({ from, to, body, kind }) {
    const entry = { from, to, body, kind, at: new Date().toISOString(), delivered: "dry-run" };
    if (this.live) {
      try {
        const res = await this.fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization:
                "Basic " + Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64"),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ From: from, To: to, Body: body }),
          },
        );
        entry.delivered = res.ok ? "sent" : `failed:${res.status}`;
      } catch (err) {
        entry.delivered = `failed:${err.message}`;
      }
    }
    this.store.state.outbox.push(entry);
    this.store.save();
    return entry;
  }
}

// Twilio request validation: base64(HMAC-SHA1(authToken, url + sorted(key+value))).
export function twilioSignature(authToken, url, params) {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  return crypto.createHmac("sha1", authToken).update(data, "utf8").digest("base64");
}

export function validTwilioSignature(authToken, url, params, header) {
  if (!header) return false;
  const expected = Buffer.from(twilioSignature(authToken, url, params));
  const given = Buffer.from(header);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
