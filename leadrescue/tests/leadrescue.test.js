import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../lib/store.js";
import { SmsSender, twilioSignature, validTwilioSignature } from "../lib/sms.js";
import { Engine } from "../lib/engine.js";
import { ScriptBrain, ClaudeBrain } from "../lib/ai.js";
import { createApp, loadBusinesses } from "../server.js";

const biz = loadBusinesses()[0];
const CALLER = "+14045550111";

function setup({ brain = new ScriptBrain(), now } = {}) {
  const store = new Store(null);
  const sms = new SmsSender({ store });
  const engine = new Engine({ store, sms, brain, now });
  return { store, sms, engine, out: () => store.state.outbox };
}

test("missed call sends one text-back with opt-out language", async () => {
  const { engine, out } = setup();
  const r = await engine.handleMissedCall(biz, CALLER);
  assert.equal(r.action, "text_back_sent");
  assert.equal(out().length, 1);
  assert.equal(out()[0].to, CALLER);
  assert.equal(out()[0].from, biz.twilioNumber);
  assert.match(out()[0].body, /Peach State/);
  assert.match(out()[0].body, /STOP/);
});

test("redial within 24h does not text again; after 24h it does", async () => {
  let t = Date.parse("2026-11-17T12:00:00Z");
  const { engine, out } = setup({ now: () => t });
  await engine.handleMissedCall(biz, CALLER);
  t += 60 * 60 * 1000;
  assert.equal((await engine.handleMissedCall(biz, CALLER)).reason, "cooldown");
  assert.equal(out().length, 1);
  t += 24 * 60 * 60 * 1000;
  assert.equal((await engine.handleMissedCall(biz, CALLER)).action, "text_back_sent");
  assert.equal(out().length, 2);
});

test("full conversation qualifies the lead and alerts the owner exactly once", async () => {
  const { engine, store, out } = setup();
  await engine.handleMissedCall(biz, CALLER);
  await engine.handleInboundSms(biz, CALLER, "My AC is blowing warm air");
  await engine.handleInboundSms(biz, CALLER, "Maria Lopez");
  await engine.handleInboundSms(biz, CALLER, "412 Oak St, Buford 30518");
  await engine.handleInboundSms(biz, CALLER, "Tomorrow morning");

  const c = store.getConversation(biz.id, CALLER);
  assert.equal(c.status, "qualified");
  assert.deepEqual(c.lead, {
    name: "Maria Lopez",
    service: "My AC is blowing warm air",
    address: "412 Oak St, Buford 30518",
    urgency: null,
    preferredTime: "Tomorrow morning",
  });
  const alerts = out().filter((m) => m.kind === "owner_alert");
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].to, biz.ownerPhone);
  assert.match(alerts[0].body, /Maria Lopez/);
  assert.match(alerts[0].body, /\+14045550111/);
  assert.match(alerts[0].body, /Buford/);
});

test("emergency wording alerts the owner immediately, once", async () => {
  const { engine, out } = setup();
  await engine.handleMissedCall(biz, CALLER);
  await engine.handleInboundSms(biz, CALLER, "I smell gas near the furnace");
  await engine.handleInboundSms(biz, CALLER, "Dan");
  const urgent = out().filter((m) => m.kind === "owner_alert" && /URGENT/.test(m.body));
  assert.equal(urgent.length, 1);
});

test("STOP opts out, blocks replies and future text-backs; START restores", async () => {
  const { engine, store, out } = setup();
  await engine.handleMissedCall(biz, CALLER);
  assert.equal((await engine.handleInboundSms(biz, CALLER, " Stop ")).action, "opt_out");
  assert.equal(store.getConversation(biz.id, CALLER).status, "opted_out");
  const n = out().length;
  assert.equal((await engine.handleInboundSms(biz, CALLER, "hello?")).action, "ignored");
  assert.equal((await engine.handleMissedCall(biz, CALLER)).reason, "opted_out");
  assert.equal(out().length, n);
  assert.equal((await engine.handleInboundSms(biz, CALLER, "START")).action, "opt_in");
});

test("brain failure still answers the customer and hands off to the owner", async () => {
  const brain = { nextTurn: async () => { throw new Error("api down"); } };
  const { engine, out } = setup({ brain });
  const r = await engine.handleInboundSms(biz, CALLER, "need a quote");
  assert.equal(r.action, "fallback");
  assert.equal(out().filter((m) => m.kind === "owner_alert").length, 1);
  assert.equal(out().filter((m) => m.to === CALLER).length, 1);
});

test("ClaudeBrain builds a valid request and parses the structured reply (stubbed client)", async () => {
  let sent;
  const client = {
    beta: { messages: { create: async (req) => {
      sent = req;
      return { stop_reason: "end_turn", content: [
        { type: "thinking", thinking: "" },
        { type: "text", text: JSON.stringify({ reply: "Can I get your name?", name: null, service: "AC repair", address: null, urgency: "soon", preferredTime: null, qualified: false, emergency: false }) },
      ] };
    } } },
  };
  const brain = new ClaudeBrain({ client, model: "claude-opus-5-5" });
  const conversation = { messages: [
    { role: "assistant", body: "Sorry we missed your call!" },
    { role: "customer", body: "AC is out" },
  ] };
  const turn = await brain.nextTurn({ business: biz, conversation });
  assert.equal(turn.reply, "Can I get your name?");
  assert.equal(turn.lead.service, "AC repair");
  assert.equal(sent.messages.length, 1);
  assert.equal(sent.messages[0].role, "user"); // API requires user-first
  assert.match(sent.system, /Sorry we missed your call!/);
  assert.equal(sent.output_config.format.type, "json_schema");

  client.beta.messages.create = async () => ({ stop_reason: "refusal", content: [] });
  await assert.rejects(brain.nextTurn({ business: biz, conversation }), /refusal/);
});

test("Twilio signature validation accepts the right signature and rejects others", () => {
  const params = { From: CALLER, To: biz.twilioNumber, Body: "hi" };
  const url = "https://example.test/twilio/sms";
  const sig = twilioSignature("secret", url, params);
  assert.ok(validTwilioSignature("secret", url, params, sig));
  assert.ok(!validTwilioSignature("secret", url, { ...params, Body: "tampered" }, sig));
  assert.ok(!validTwilioSignature("other", url, params, sig));
  assert.ok(!validTwilioSignature("secret", url, params, undefined));
});

test("HTTP: Twilio webhooks end to end, with signature enforcement", async (t) => {
  const { engine, store, out } = setup();
  const base = "https://lr.example.test";
  const app = createApp({ businesses: [biz], engine, store, authToken: "secret", publicBaseUrl: base, brainName: "test" });
  await new Promise((r) => app.listen(0, r));
  t.after(() => app.close());
  const origin = `http://127.0.0.1:${app.address().port}`;
  const call = (path, params, sign = true) =>
    fetch(origin + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(sign ? { "X-Twilio-Signature": twilioSignature("secret", base + path, params) } : {}),
      },
      body: new URLSearchParams(params),
    });

  const unsigned = await call("/twilio/voice", { From: CALLER, To: biz.twilioNumber }, false);
  assert.equal(unsigned.status, 403);
  assert.equal(out().length, 0);

  const voice = await call("/twilio/voice", { From: CALLER, To: biz.twilioNumber });
  assert.equal(voice.status, 200);
  assert.match(await voice.text(), /<Say>.*sent you a text.*<\/Say><Hangup\/>/);
  assert.equal(out().length, 1);

  const sms = await call("/twilio/sms", { From: CALLER, To: biz.twilioNumber, Body: "Water heater pilot keeps going out" });
  assert.equal(sms.status, 200);
  await new Promise((r) => setTimeout(r, 50)); // reply is sent after the ack
  assert.equal(out().length, 2);
  assert.match(out()[1].body, /name/i);

  const unknown = await call("/twilio/sms", { From: CALLER, To: "+19990000000", Body: "x" });
  assert.equal(unknown.status, 404);

  // mode "dial": ring owner first, text back only if they don't pick up
  const dialBiz = { ...biz, id: "dial", twilioNumber: "+15550109999", mode: "dial" };
  const app2 = createApp({ businesses: [dialBiz], engine, store, brainName: "test" });
  await new Promise((r) => app2.listen(0, r));
  t.after(() => app2.close());
  const o2 = `http://127.0.0.1:${app2.address().port}`;
  const form = (p) => ({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(p) });
  const v = await (await fetch(o2 + "/twilio/voice", form({ From: CALLER, To: dialBiz.twilioNumber }))).text();
  assert.match(v, /<Dial timeout="20" action="\/twilio\/dial-status">\+15550100001<\/Dial>/);
  const before = out().length;
  await fetch(o2 + "/twilio/dial-status", form({ From: CALLER, To: dialBiz.twilioNumber, DialCallStatus: "completed" }));
  assert.equal(out().length, before);
  await fetch(o2 + "/twilio/dial-status", form({ From: CALLER, To: dialBiz.twilioNumber, DialCallStatus: "no-answer" }));
  assert.equal(out().length, before + 1);
});
