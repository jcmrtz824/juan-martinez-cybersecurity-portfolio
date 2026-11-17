// Core flow: missed call -> text-back -> AI conversation -> owner alert.
const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit"]);
const START_WORDS = new Set(["start", "unstop", "yes"]);
const TEXT_BACK_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const FALLBACK_REPLY =
  "Thanks for the message! A team member will call or text you back shortly.";

export class Engine {
  constructor({ store, sms, brain, now = () => Date.now() }) {
    this.store = store;
    this.sms = sms;
    this.brain = brain;
    this.now = now;
  }

  async handleMissedCall(business, callerPhone) {
    const convo = this.store.upsertConversation(business.id, callerPhone);
    convo.missedCalls.push(new Date(this.now()).toISOString());

    if (convo.status === "opted_out") {
      this.store.save();
      return { action: "skipped", reason: "opted_out" };
    }
    // Don't text the same person twice in a day because they redialed.
    if (convo.lastTextBackAt && this.now() - Date.parse(convo.lastTextBackAt) < TEXT_BACK_COOLDOWN_MS) {
      this.store.save();
      return { action: "skipped", reason: "cooldown" };
    }

    const body = business.textBack.replaceAll("{name}", business.name);
    convo.messages.push({ role: "assistant", body, at: new Date(this.now()).toISOString() });
    convo.lastTextBackAt = new Date(this.now()).toISOString();
    await this.sms.send({ from: business.twilioNumber, to: callerPhone, body, kind: "text-back" });
    this.store.save();
    return { action: "text_back_sent", body };
  }

  async handleInboundSms(business, fromPhone, text) {
    const convo = this.store.upsertConversation(business.id, fromPhone);
    const word = text.trim().toLowerCase();
    const reply = async (body, kind = "reply") => {
      convo.messages.push({ role: "assistant", body, at: new Date(this.now()).toISOString() });
      await this.sms.send({ from: business.twilioNumber, to: fromPhone, body, kind });
      this.store.save();
      return { action: kind, body };
    };

    // Carrier-required keywords are handled in code, never by the model.
    if (STOP_WORDS.has(word)) {
      convo.status = "opted_out";
      return reply(`You're unsubscribed from ${business.name} texts. Reply START to resubscribe.`, "opt_out");
    }
    if (word === "help") {
      return reply(`${business.name}: reply here or call ${business.twilioNumber}. Reply STOP to opt out.`, "help");
    }
    if (convo.status === "opted_out") {
      if (!START_WORDS.has(word)) {
        this.store.save();
        return { action: "ignored", reason: "opted_out" };
      }
      convo.status = "engaged";
      return reply(`You're resubscribed to ${business.name} texts. How can we help?`, "opt_in");
    }

    convo.messages.push({ role: "customer", body: text, at: new Date(this.now()).toISOString() });
    const wasQualified = convo.status === "qualified";
    if (convo.status === "new") convo.status = "engaged";

    let turn;
    try {
      turn = await this.brain.nextTurn({ business, conversation: convo });
    } catch (err) {
      // Never leave the customer hanging: fixed reply + hand the thread to the owner.
      console.error("brain failed:", err.message);
      await this.notifyOwner(business, `LeadRescue could not auto-reply to ${fromPhone}. They said: "${text}". Please text or call them.`);
      return reply(FALLBACK_REPLY, "fallback");
    }

    // Keep anything we already knew if the brain returns null for it.
    for (const [k, v] of Object.entries(turn.lead)) {
      if (v) convo.lead[k] = v;
    }

    if (turn.emergency && !convo.emergencyNotified) {
      convo.emergencyNotified = true;
      await this.notifyOwner(business, `URGENT missed-call lead ${fromPhone}: "${text}". Call them now.`);
    }
    if (turn.qualified && !wasQualified) {
      convo.status = "qualified";
      const l = convo.lead;
      await this.notifyOwner(
        business,
        `New lead from a missed call:\n${l.name || "Unknown"} - ${fromPhone}\nNeeds: ${l.service || "?"}\nWhere: ${l.address || "?"}\nWhen: ${l.preferredTime || "not said"}${l.urgency ? `\nUrgency: ${l.urgency}` : ""}`,
      );
    }
    return reply(turn.reply);
  }

  async notifyOwner(business, body) {
    return this.sms.send({ from: business.twilioNumber, to: business.ownerPhone, body, kind: "owner_alert" });
  }
}
