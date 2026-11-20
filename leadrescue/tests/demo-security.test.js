import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { request } from "node:http";
import { createInterface } from "node:readline";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Engine } from "../lib/engine.js";
import { ScriptBrain } from "../lib/ai.js";
import { SmsSender } from "../lib/sms.js";
import { Store } from "../lib/store.js";
import { createApp, loadBusinesses } from "../server.js";

const serverPath = fileURLToPath(new URL("../server.js", import.meta.url));
const business = loadBusinesses()[0];
const phone = "+14045550123";
const base = "https://leadrescue.example.test";
const run = promisify(execFile);
const post = (body, headers = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});

async function listen(t, app) {
  app.listen(0, "127.0.0.1");
  await once(app, "listening");
  t.after(() => new Promise((resolve) => app.close(resolve)));
  return `http://127.0.0.1:${app.address().port}`;
}

test("webhook server does not expose or mutate seeded customer data through demo routes", async (t) => {
  const store = new Store(null);
  const sms = new SmsSender({ store });
  const engine = new Engine({ store, sms, brain: new ScriptBrain() });
  await engine.handleInboundSms(business, phone, "Synthetic customer message");
  await engine.notifyOwner(business, "Synthetic owner alert");
  const before = structuredClone(store.state);

  const origin = await listen(t, createApp({ businesses: [business], engine, authToken: "test-token", publicBaseUrl: base }));
  const health = await fetch(origin + "/healthz");
  assert.deepEqual(await health.json(), { ok: true });
  for (const [route, options] of [
    ["/"],
    [`/api/state?business=${business.id}`],
    ...["missed-call", "sms", "reset"].map((action) => ["/sim/" + action, post({ phone }, { Origin: origin })]),
  ]) {
    const res = await fetch(origin + route, options);
    assert.equal(res.status, 404, route);
    assert.equal(await res.text(), "not found", route);
  }
  assert.deepEqual(store.state, before);
});

test("an unconfigured webhook server rejects requests without changing customer state", async (t) => {
  const store = new Store(null);
  const engine = new Engine({ store, sms: new SmsSender({ store }), brain: new ScriptBrain() });
  const origin = await listen(t, createApp({ businesses: [business], engine }));
  for (const route of ["voice", "dial-status", "sms"]) {
    const res = await fetch(origin + "/twilio/" + route, post({ From: phone, To: business.twilioNumber, Body: "Hello" }, {
      "X-Twilio-Signature": "invalid",
    }));
    assert.equal(res.status, 403, route);
    await res.text();
  }
  assert.deepEqual(store.state, { conversations: {}, outbox: [] });
});

test("demo is local, sample-only, and dry-run even with provider credentials in the environment", { timeout: 5000 }, async (t) => {
  const child = spawn(process.execPath, [serverPath, "--demo"], {
    env: {
      ...process.env,
      NODE_ENV: "test",
      DISABLE_SIM: "0",
      PORT: "0",
      TWILIO_ACCOUNT_SID: "dummy-sid",
      TWILIO_AUTH_TOKEN: "dummy-token",
      PUBLIC_BASE_URL: "",
      ANTHROPIC_API_KEY: "dummy-key",
    },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const closed = once(child, "close");
  t.after(async () => {
    child.kill();
    await closed;
  });
  const lines = createInterface({ input: child.stdout });
  const origin = await Promise.race([
    once(lines, "line").then(([line]) => line.match(/^LeadRescue demo on (http:\/\/127\.0\.0\.1:\d+)$/)?.[1]),
    closed.then(() => assert.fail("demo exited before starting")),
  ]);
  assert.ok(origin);
  const page = await fetch(origin + "/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /\/api\/state/);

  const badHost = await new Promise((resolve, reject) => {
    const req = request(origin + "/api/state", { headers: { Host: "external.example.test" } }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", reject);
    req.end();
  });
  assert.equal(badHost, 403);

  const demoPost = (route, body, callerOrigin = origin) =>
    fetch(origin + route, post({ phone, ...body }, { Origin: callerOrigin }));
  const blockedCall = await demoPost("/sim/missed-call", {}, base);
  assert.equal(blockedCall.status, 403);
  await blockedCall.text();
  const state = async () => {
    const res = await fetch(origin + "/api/state?business=untrusted");
    assert.equal(res.headers.get("cache-control"), "no-store");
    return res.json();
  };
  const initial = await state();
  assert.deepEqual(initial.conversations, []);
  assert.deepEqual(initial.ownerAlerts, []);
  assert.deepEqual(initial.businesses.map(({ id }) => id), ["sample-hvac"]);
  assert.equal(initial.brain, "Scripted demo");

  const call = await demoPost("/sim/missed-call", { business: "untrusted" });
  assert.equal((await call.json()).action, "text_back_sent");
  for (const body of ["AC blows warm air", "Demo Caller", "Demo City, GA"]) {
    const res = await demoPost("/sim/sms", { body });
    assert.equal(res.status, 200);
    await res.json();
  }
  const after = await state();
  assert.equal(after.conversations[0].status, "qualified");
  assert.equal(after.ownerAlerts.length, 1);
  assert.equal(after.ownerAlerts[0].delivered, "dry-run");

  const webhook = await fetch(origin + "/twilio/voice", post({ From: phone, To: business.twilioNumber }));
  assert.equal(webhook.status, 404);
  await webhook.text();
  const blockedReset = await fetch(origin + "/sim/reset", post({}));
  assert.equal(blockedReset.status, 403);
  await blockedReset.text();
  assert.deepEqual(await state(), after);

  const reset = await demoPost("/sim/reset", {});
  assert.deepEqual(await reset.json(), { ok: true });
  assert.deepEqual(await state(), initial);
});

test("explicit demo startup is refused in production", async () => {
  await assert.rejects(
    run(process.execPath, [serverPath, "--demo"], {
      env: { ...process.env, NODE_ENV: "production", PORT: "0" },
      timeout: 3000,
    }),
    (err) => err.code === 1 && err.stderr.includes("The local demo cannot run in production"),
  );
});
