// Tiny JSON-file store. Fine for a pilot with a handful of clients;
// swap for SQLite/Postgres before running dozens of businesses on it.
import fs from "node:fs";
import path from "node:path";

export class Store {
  constructor(file) {
    this.file = file;
    this.state = { conversations: {}, outbox: [] };
    if (file && fs.existsSync(file)) {
      this.state = JSON.parse(fs.readFileSync(file, "utf8"));
    }
  }

  save() {
    if (!this.file) return; // in-memory (tests)
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2));
    fs.renameSync(tmp, this.file);
  }

  key(businessId, phone) {
    return `${businessId}|${phone}`;
  }

  getConversation(businessId, phone) {
    return this.state.conversations[this.key(businessId, phone)] || null;
  }

  upsertConversation(businessId, phone) {
    const k = this.key(businessId, phone);
    if (!this.state.conversations[k]) {
      this.state.conversations[k] = {
        businessId,
        phone,
        status: "new", // new | engaged | qualified | opted_out
        lead: { name: null, service: null, address: null, urgency: null, preferredTime: null },
        emergencyNotified: false,
        messages: [],
        missedCalls: [],
        lastTextBackAt: null,
        createdAt: new Date().toISOString(),
      };
    }
    return this.state.conversations[k];
  }

  listConversations(businessId) {
    return Object.values(this.state.conversations).filter(
      (c) => !businessId || c.businessId === businessId,
    );
  }

  reset() {
    this.state = { conversations: {}, outbox: [] };
    this.save();
  }
}
