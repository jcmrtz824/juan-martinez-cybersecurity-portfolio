# Revenue plan

Target: first $1,000 collected, then $5,000-$10,000 per month. Nothing below is a guarantee. Figures marked (assumption) are estimates I could not verify.

## The three opportunities

| | 1. Missed-call rescue for Georgia trades | 2. Welding / fab subcontracting | 3. Self-serve SaaS tool |
|---|---|---|---|
| What you sell | Done-for-you text-back + AI lead capture | Your labor and rig to GCs and fab shops | A subscription product sold online |
| Startup cost | About $30-$60 (Twilio, registration, hosting) | High unless you already own a rig and carry insurance | Low cash, high time |
| Time to first payment | 2-4 weeks (assumption) | Days to weeks if equipped; net-30 terms are common | Months |
| Demand evidence | Strong, but mostly vendor data: Invoca reports about 27% of home-service calls go unanswered | Real, but I found no 2026 Georgia demand data; GDOT work needs registration, AWS D1.5 qualification and bonding | Proven category, crowded |
| Competition | Many DIY tools at $25-$300/month; few local people who install and run it for a contractor | Local, relationship-driven | National, well funded |
| Recurring revenue | Yes | No. Income stops when you stop welding | Yes, after a long ramp |
| Fit | Python/Node, AI agents, operations, and you speak contractor | Direct fit for your hands | Fit for skills, not for the timeline |

## The pick: missed-call rescue

It is the only one of the three that is fast, cheap to start, and recurring. The software is a commodity; what a roofer or HVAC owner pays for is someone local who sets it up, deals with the carrier paperwork, and answers the phone when something breaks. Your contracting background is the sales advantage.

Welding stays as the cash fallback. If you need money this week, a subcontract shift pays sooner than any software sale. It just doesn't compound.

**What you sell:** Missed-Call Rescue at $297 setup + $197/month. Front Desk at $397/month once you have three paying clients and have built the follow-up and review features.

**Who buys:** owner-operated trades with 1-10 people and no full-time office staff: HVAC, plumbing, roofing, electrical, garage doors, tree service, pressure washing, fab shops.

**Why they pay:** each missed call is a job that may go to the next name on Google. Vendor estimates of a missed call's value run from $200 to $1,200; ask each prospect for their own average ticket instead of quoting those.

**The math:** two clients = $988 in the first month. $5,000/month recurring is about 25 clients on the base plan, or about 15 on a mix. Realistic pace is 2-4 new clients a month at first (assumption), so $5k/month is a 6-10 month goal, not a 30-day one.

**Costs:** roughly $10-$20 per client per month for number, texts, registration and API (assumption; confirm in the Twilio console). Hosting $5-$7/month. One-time Twilio registration fees were about $4.50 + $15 per brand when I checked.

**Risks:**
- Carrier registration (A2P 10DLC) is required per client business, needs their EIN, and takes days to weeks. This is the main schedule risk. Start yours on day 1.
- Cheap competitors. Do not compete on price; compete on "I set it up and I'm 20 minutes away".
- Churn if the client sees no leads. The monthly report and the money-back setup offer address this.
- Texting law (TCPA). The design is conservative, but get a lawyer's read before scaling.

## 14-day plan

| Day | You | Claude |
|---|---|---|
| 1 | Open Twilio and Anthropic API accounts. Start A2P registration for Culmen. Decide the public phone and email for the landing page. | Done: working demo, tests, landing page, sales kit. |
| 2 | Approve a host (about $5-$7/month). Review the prospect list. | Build the list of 20 Georgia prospects from public listings. Deploy the demo once approved. |
| 3 | Live test: call your Twilio number from a second phone, run the whole conversation. | Fix whatever the live test turns up. Draft 20 personalized messages. |
| 4-5 | "Secret shopper" calls: phone each prospect at lunch or after 5pm. Note who went to voicemail. Send the approved message to those. | Log results in `pipeline.csv`. Adjust the script from replies. |
| 6-7 | Walk into 5 local shops with the demo on your phone. Follow up by text on day 4-5 contacts. | Follow-up drafts. Second list of 20. |
| 8-10 | Run demos. Ask for the pilot. Collect the setup fee and EIN at signing. | Proposal per prospect. Client config files. Registration paperwork prep. |
| 11-14 | Go live with client 1 as soon as registration clears. Start wave 2 outreach. Ask client 1 who else they know. | Go-live checklist with you. Monthly report feature. |

Expected funnel (assumption): 40 contacts, 4-6 real conversations, 1-2 paying pilots.

## Status

**Done**
- LeadRescue MVP: server, demo simulator, 9 passing tests.
- Landing page (`site/index.html`), needs your contact details.
- Pricing, outreach templates, proposal, onboarding checklist (`docs/SALES-KIT.md`).
- Trackers (`docs/pipeline.csv`, `docs/money.csv`).

**Blocked on you**
- Twilio account and A2P registration.
- Anthropic API key.
- Phone, email and demo URL for the landing page.
- Approval to deploy, and where.
- A private home for prospect data. This repository is public.

**Next**
- 20 prospects with personalized messages for your review.
- One live Twilio call and one live Claude conversation.

**Money actually earned so far: $0.**
