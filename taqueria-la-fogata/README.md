# Taqueria La Fogata

**Kennesaw, Georgia · Family-owned**

A sales growth plan and a working website for a running taqueria.

**Goal right now: raise sales.** More people coming by, more of them trying the micheladas, the birria tacos, the elotes — the whole menu.

Liquor and the patio are still the long-term plan, but they're not the priority. They live in [`docs/later/`](./docs/later/).

---

## Start here

**→ [docs/00-THE-PLAN.md](./docs/00-THE-PLAN.md)**

Then the two that do the work:

- **[docs/01-CONTENT-PLAYBOOK.md](./docs/01-CONTENT-PLAYBOOK.md)** — what actually works on TikTok and Reels for a taqueria, built from real outlier data
- **[docs/02-30-DAY-SHOT-LIST.md](./docs/02-30-DAY-SHOT-LIST.md)** — 30 videos, already specified. Film and post.

---

## The finding worth leading with

I pulled real outlier data — Instagram Reels and TikToks from the last 30 days that massively beat their own creator's median — for birria/taqueria and michelada content. The pattern that matters most:

**The biggest breakouts came from the smallest accounts.**

| Account | Followers | Normal video | Breakout | Multiple |
|---|---|---|---|---|
| **@fiestatequilabar** | **4,000** | 2,600 views | **1.9M** | **706×** |
| @tmcheladas | 52,700 | 8,300 views | 1.8M | 216× |
| @chatostacos_ | 32,000 | 16,800 views | 2.7M | 161× |
| @milindobadiraguato | 33,000 | 33,100 views | 3.8M | 115× |

A tequila bar with **four thousand followers** put up a video that did **1.9 million views**. A michelada vendor whose normal post gets 8,300 views hit 1.8 million. None of them broke out because they had a following — they broke out because they posted the right kind of video, enough times.

**Your follower count is not what's standing between you and reach.** The number of good attempts is. That's the entire case for the 30-day shot list.

What the winners had in common, all of it achievable with a phone:

- **The first second is hands already working** — never a face saying hello
- **Music only, no talking** — regional Mexican audio (La Zenda Norteña, Los Ángeles Azules both showed up)
- **The camera doesn't move** — @tmcheladas did 216× on a static phone
- **Address and hours in the caption, every post** — every restaurant in the data did this
- **Cheese pull, dip, or griddle sizzle** as the money shot
- **A question or challenge in the caption** — that's what the 706× video did
- Effort rating across nearly all of them: **"within an hour"**

Full breakdown and sources in [docs/01-CONTENT-PLAYBOOK.md](./docs/01-CONTENT-PLAYBOOK.md).

---

## The three levers

| Lever | Why | Doc |
|---|---|---|
| **1. Be findable** | Most customers type "tacos near me" and pick from the list. Free, one afternoon, highest return on this page. | [03-GOOGLE-BUSINESS-PROFILE.md](./docs/03-GOOGLE-BUSINESS-PROFILE.md) |
| **2. Content that reaches Cobb County** | A million views from Ohio sells nothing. 2,000 local views fills the room. | [01-CONTENT-PLAYBOOK.md](./docs/01-CONTENT-PLAYBOOK.md) · [02-30-DAY-SHOT-LIST.md](./docs/02-30-DAY-SHOT-LIST.md) |
| **3. Bigger tickets** | A customer who orders 3 tacos is worth half of one who orders 3 tacos, an elote and a michelada. | [04-TURN-VIEWS-INTO-VISITS.md](./docs/04-TURN-VIEWS-INTO-VISITS.md) · [05-SELL-MORE-PER-TICKET.md](./docs/05-SELL-MORE-PER-TICKET.md) |

---

## The weekly rhythm — four hours

| When | What | Time |
|---|---|---|
| Slow afternoon | Batch-film 8–12 clips = two weeks of posts | 45 min |
| Daily | Post one. Reply to comments in the first hour. | 15 min |
| Weekly | Google profile: 3 photos, 1 post, reply to reviews | 15 min |
| Sunday | Write down five numbers | 10 min |

Do only the first two rows and you're still ahead of nearly every restaurant in Kennesaw, because almost none of them post consistently.

---

## Money available without a single new customer

Three sentences asked consistently, from [05-SELL-MORE-PER-TICKET.md](./docs/05-SELL-MORE-PER-TICKET.md):

| Lever | Per week | Per year |
|---|---|---|
| Michelada attach rate 20% → 50% (at 100 beers/wk) | +$70 | +$3,600 |
| 30 more elotes a week | +$84 | +$4,400 |
| 10 combos instead of taco-only orders | +$77 | +$4,000 |
| **Total** | **+$231** | **~$12,000** |

The margin behind the first row: a $5 beer makes you about **$4.08**. The same beer as an $8 michelada makes about **$6.40** — **+$2.32** for roughly 68¢ of Clamato, lime and Tajín. You already sell them, so the lever isn't launching, it's the **attach rate**: what share of beers go out as micheladas, and whether anybody is asking.

> **"¿Se la preparo como michelada?"**

Every beer. Every time.

---

## The website

**[`website/`](./website/)** — mobile-first, free to host, no dependencies.

Shows whether you're open right now (in Georgia time, so it's right for someone checking from out of state), big tap-to-call button, full menu, and an **English/Spanish toggle** your Kennesaw market will use.

**You edit one file: `website/site-config.js`.**

⚠️ **The phone number and address in it are placeholders** — a fake 555 number and an example street, on purpose. Replace them before the site reaches a customer. Setup in [website/README.md](./website/README.md).

This matters more than it looks: the real customer path is *see video → Google the name → check photos and hours → drive over*. Content creates the intent; your Google profile and website **close** it. Fix only the content and you leak most of the customers it creates.

---

## Everything here

```
docs/
  00-THE-PLAN.md                 ← start here
  01-CONTENT-PLAYBOOK.md         ← what works, from real outlier data
  02-30-DAY-SHOT-LIST.md         ← 30 videos, already decided
  03-GOOGLE-BUSINESS-PROFILE.md  ← free local discovery
  04-TURN-VIEWS-INTO-VISITS.md   ← closing the view→customer gap
  05-SELL-MORE-PER-TICKET.md     ← micheladas, elotes, combos
  06-TRACKING.md                 ← five numbers, Sundays
  later/                         ← liquor + patio, summer 2027
website/                         ← the site; edit site-config.js
```

---

## What to expect, honestly

**Weeks 1–4.** Views are small. Feels like it isn't working. It is — you're building a library and teaching the algorithm what your account is. The job here is **not quitting**.

**Weeks 4–8.** One video beats the others. That's your most valuable piece of information. Make three more exactly like it.

**Weeks 8–12.** You start hearing "I saw you on TikTok" at the register. Write it down every time — that's the real number.

**After that.** The breakout. Month 2 or month 7; nobody can tell you which. The data says it's about volume and consistency, not follower count.

This will not produce a line out the door next Tuesday. It compounds, and the upsell work pays immediately while the content builds.
