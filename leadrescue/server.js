// LeadRescue server: Twilio webhooks + a browser demo simulator.
//   POST /twilio/voice        incoming call on a business's LeadRescue number
//   POST /twilio/dial-status  result of ringing the owner (mode "dial")
//   POST /twilio/sms          incoming text from a customer
//   npm run demo              separate local browser simulator
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "./lib/store.js";
import { SmsSender, validTwilioSignature } from "./lib/sms.js";
import { Engine } from "./lib/engine.js";
import { ClaudeBrain, ScriptBrain } from "./lib/ai.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export function loadBusinesses(dir = path.join(here, "config", "businesses")) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

const xml = (s) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
const twiml = (inner = "") => `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 64 * 1024) throw new Error("body too large");
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if ((req.headers["content-type"] || "").includes("application/json")) {
    return raw ? JSON.parse(raw) : {};
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

const send = (res, status, type, body) => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
};
const json = (res, status, obj) => send(res, status, "application/json", JSON.stringify(obj));

export function createApp({ businesses, engine, authToken, publicBaseUrl }) {
  const byNumber = new Map(businesses.map((b) => [b.twilioNumber, b]));

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/healthz") return json(res, 200, { ok: true });

      // ---- Twilio webhooks -------------------------------------------------
      if (req.method === "POST" && url.pathname.startsWith("/twilio/")) {
        if (!authToken || !publicBaseUrl || !req.headers["x-twilio-signature"]) {
          return send(res, 403, "text/plain", "invalid signature");
        }
        const p = await readBody(req);
        const full = publicBaseUrl.replace(/\/$/, "") + req.url;
        if (!validTwilioSignature(authToken, full, p, req.headers["x-twilio-signature"])) {
          return send(res, 403, "text/plain", "invalid signature");
        }
        const business = byNumber.get(p.To) || byNumber.get(p.Called);
        if (!business) return send(res, 404, "text/plain", "unknown number");

        if (url.pathname === "/twilio/voice") {
          if (business.mode === "dial") {
            // Ring the owner first; Twilio reports the outcome to /twilio/dial-status.
            return send(res, 200, "text/xml", twiml(
              `<Dial timeout="${Number(business.ringSeconds) || 20}" action="/twilio/dial-status">${xml(business.ownerPhone)}</Dial>`,
            ));
          }
          // mode "forwarded": the owner's carrier only forwards calls here when
          // they didn't answer, so every call that arrives is already a missed call.
          await engine.handleMissedCall(business, p.From);
          return send(res, 200, "text/xml", twiml(
            `<Say>Thanks for calling ${xml(business.name)}. We can't get to the phone right now, so we just sent you a text. Reply there and we'll take care of you.</Say><Hangup/>`,
          ));
        }

        if (url.pathname === "/twilio/dial-status") {
          if (p.DialCallStatus !== "completed") {
            await engine.handleMissedCall(business, p.From);
            return send(res, 200, "text/xml", twiml(
              `<Say>Sorry we missed you. We just sent you a text. Reply there and we'll take care of you.</Say><Hangup/>`,
            ));
          }
          return send(res, 200, "text/xml", twiml());
        }

        if (url.pathname === "/twilio/sms") {
          // Acknowledge right away (Twilio times out at 15s); the reply goes out
          // through the REST API when the brain finishes.
          send(res, 200, "text/xml", twiml());
          engine.handleInboundSms(business, p.From, p.Body || "").catch((e) => console.error(e));
          return;
        }
      }

      send(res, 404, "text/plain", "not found");
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, 500, "text/plain", "server error");
    }
  });
}

// The demo deliberately takes no runtime configuration or customer store.
function createDemoApp() {
  const business = JSON.parse(fs.readFileSync(path.join(here, "config", "businesses", "sample-hvac.json"), "utf8"));
  const store = new Store(null);
  const engine = new Engine({ store, sms: new SmsSender({ store }), brain: new ScriptBrain() });
  const summary = { id: business.id, name: business.name, trade: business.trade };
  const html = fs.readFileSync(path.join(here, "public", "demo.html"));

  const app = http.createServer(async (req, res) => {
    try {
      const host = `127.0.0.1:${app.address().port}`;
      const origin = `http://${host}`;
      if (req.headers.host !== host) return send(res, 403, "text/plain", "local demo only");
      const { pathname } = new URL(req.url, origin);

      if (req.method === "GET" && pathname === "/") return send(res, 200, "text/html", html);
      if (req.method === "GET" && pathname === "/api/state") {
        return json(res, 200, {
          brain: "Scripted demo",
          business: summary,
          businesses: [{ id: business.id, name: business.name }],
          conversations: store.listConversations(business.id),
          ownerAlerts: store.state.outbox.filter((m) => m.kind === "owner_alert"),
        });
      }
      if (req.method === "POST" && pathname.startsWith("/sim/")) {
        if (req.headers.origin !== origin) return send(res, 403, "text/plain", "local demo only");
        if (pathname === "/sim/reset") {
          store.reset();
          return json(res, 200, { ok: true });
        }
        if (pathname === "/sim/missed-call" || pathname === "/sim/sms") {
          const p = await readBody(req);
          const phone = p.phone || "+15550123456";
          const result = pathname === "/sim/missed-call"
            ? await engine.handleMissedCall(business, phone)
            : await engine.handleInboundSms(business, phone, String(p.body || ""));
          return json(res, 200, result);
        }
      }
      send(res, 404, "text/plain", "not found");
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, 500, "text/plain", "server error");
    }
  });
  return app;
}

// ---- Entrypoint -------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const env = process.env;
  const port = env.PORT === undefined || env.PORT === "" ? 3000 : Number(env.PORT);

  if (process.argv.slice(2).includes("--demo")) {
    if (env.NODE_ENV === "production" || env.DISABLE_SIM === "1") {
      throw new Error("The local demo cannot run in production or with DISABLE_SIM=1.");
    }
    const app = createDemoApp();
    app.listen(port, "127.0.0.1", () => {
      console.log(`LeadRescue demo on http://127.0.0.1:${app.address().port}`);
    });
  } else {
    if (env.TWILIO_AUTH_TOKEN && !env.PUBLIC_BASE_URL) {
      throw new Error("PUBLIC_BASE_URL is required with a Twilio auth token to verify webhook signatures.");
    }
    const store = new Store(path.join(here, "data", "store.json"));
    const sms = new SmsSender({ store, accountSid: env.TWILIO_ACCOUNT_SID, authToken: env.TWILIO_AUTH_TOKEN });
    const useClaude = Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN) && env.LEADRESCUE_BRAIN !== "script";
    const brain = useClaude ? new ClaudeBrain() : new ScriptBrain();
    const app = createApp({
      businesses: loadBusinesses(),
      engine: new Engine({ store, sms, brain }),
      authToken: env.TWILIO_AUTH_TOKEN,
      publicBaseUrl: env.PUBLIC_BASE_URL,
    });
    app.listen(port, () => {
      console.log(`LeadRescue webhooks on port ${app.address().port}  brain=${useClaude ? "claude" : "script"}  sms=${sms.live ? "twilio" : "dry-run"}`);
    });
  }
}
