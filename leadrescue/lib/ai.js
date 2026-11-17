// The "brain" that decides what to text back. Two interchangeable implementations:
//   ClaudeBrain - real conversations via the Claude API (needs credentials)
//   ScriptBrain - deterministic scripted fallback (demo without a key, and tests)
// Both return: { reply, lead: {name, service, address, urgency, preferredTime}, qualified, emergency }
import Anthropic from "@anthropic-ai/sdk";

const TURN_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "The SMS to send to the customer. Under 300 characters." },
    name: { type: ["string", "null"] },
    service: { type: ["string", "null"], description: "What they need done, in a few words." },
    address: { type: ["string", "null"], description: "Service address, or at least city/ZIP." },
    urgency: { type: ["string", "null"], description: "One of: emergency, soon, flexible." },
    preferredTime: { type: ["string", "null"] },
    qualified: {
      type: "boolean",
      description: "True once service, name and address/area are all known.",
    },
    emergency: { type: "boolean" },
  },
  required: ["reply", "name", "service", "address", "urgency", "preferredTime", "qualified", "emergency"],
  additionalProperties: false,
};

function systemPrompt(business) {
  return `You answer text messages for ${business.name}, a ${business.trade} company serving ${business.serviceArea}. The customer called, nobody could pick up, and we texted them back. You are continuing that text conversation on the company's behalf.

Company facts:
- Services: ${business.services.join(", ")}
- Hours: ${business.hours}
- Owner's notes: ${business.notes || "none"}

Your job is to keep the customer from calling a competitor by getting the owner what they need to call back and book the job: what the customer needs, their name, the service address (city or ZIP is enough to start), how urgent it is, and when they'd like someone out. Ask for one thing at a time, the way a friendly office manager would by text. Skip anything they have already told you.

Write like a person texting: short, warm, plain words, no emoji, no markdown, under 300 characters. You cannot see the schedule, so never promise an arrival time or confirm an appointment - say the owner or office will call or text to lock in a time. Never quote prices or diagnose the problem; the tech does that on site. If asked whether you are a real person, say you are the company's automated text assistant and that a team member will follow up personally. If the request is outside what the company does or outside the service area, say so politely.

If someone describes a safety emergency (gas smell, fire, sparks, flooding, carbon monoxide), tell them to get safe and call 911 or the utility first, mark it as an emergency, and let them know the owner is being alerted right now.

Once you have the service, name and address or area, mark the lead qualified and tell the customer the team will reach out shortly. Report the lead fields from the whole conversation each turn, using null for anything still unknown.`;
}

export class ClaudeBrain {
  constructor({ client = new Anthropic(), model = process.env.LEADRESCUE_MODEL || "claude-opus-5-5" } = {}) {
    this.client = client;
    this.model = model;
  }

  async nextTurn({ business, conversation }) {
    const messages = conversation.messages
      .filter((m) => m.role === "customer" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "customer" ? "user" : "assistant",
        content: m.body,
      }));
    // The API requires the first message to be from the user. Our text-back came
    // first, so describe it in the system prompt instead of sending it as a turn.
    let opening = "";
    while (messages.length && messages[0].role === "assistant") {
      opening += `\n\nYou already sent this opening text: "${messages.shift().content}"`;
    }

    const response = await this.client.beta.messages.create({
      model: this.model,
      max_tokens: 2000,
      system: systemPrompt(business) + opening,
      messages,
      output_config: {
        effort: "low", // short SMS replies; keeps latency and cost down
        format: { type: "json_schema", schema: TURN_SCHEMA },
      },
      // If a safety classifier declines a turn, let the API retry on a fallback
      // model instead of leaving the customer with no reply.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      throw new Error(`Claude stopped early: ${response.stop_reason}`);
    }
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("Claude returned no text block");
    const out = JSON.parse(text);
    return {
      reply: out.reply,
      lead: {
        name: out.name,
        service: out.service,
        address: out.address,
        urgency: out.urgency,
        preferredTime: out.preferredTime,
      },
      qualified: out.qualified,
      emergency: out.emergency,
    };
  }
}

const EMERGENCY = /\b(emergency|gas|smell|leak|leaking|flood|flooding|sparks?|smoke|fire|no heat|no ac|no air|burst|carbon monoxide)\b/i;

// Scripted fallback: asks service -> name -> address -> time, in order.
export class ScriptBrain {
  async nextTurn({ business, conversation }) {
    const lead = { ...conversation.lead };
    const last = conversation.messages.filter((m) => m.role === "customer").at(-1)?.body.trim() || "";
    const emergency = EMERGENCY.test(last) || lead.urgency === "emergency";

    // Fill the first empty slot with the customer's latest message.
    if (!lead.service) lead.service = last;
    else if (!lead.name) lead.name = last;
    else if (!lead.address) lead.address = last;
    else if (!lead.preferredTime) lead.preferredTime = last;
    if (emergency) lead.urgency = "emergency";

    let reply;
    if (!lead.name) {
      reply = emergency
        ? "That sounds urgent - I'm alerting the owner right now. Can I get your name?"
        : "Got it, we can help with that. Can I get your name?";
    } else if (!lead.address) {
      reply = `Thanks ${lead.name.split(" ")[0]}. What's the address or ZIP code for the job?`;
    } else if (!lead.preferredTime) {
      reply = "Perfect. When would be a good time for us to come out?";
    } else {
      reply = `Thanks! I've passed this to the team at ${business.name}. Someone will call or text you shortly to lock in a time.`;
    }
    return {
      reply,
      lead,
      qualified: Boolean(lead.service && lead.name && lead.address),
      emergency,
    };
  }
}
