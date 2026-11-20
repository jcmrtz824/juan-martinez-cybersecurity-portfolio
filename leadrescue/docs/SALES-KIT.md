# Sales kit

Fill in anything in [brackets]. Nothing here gets sent without your review.

## Pricing

| Plan | Setup | Monthly | Includes |
|---|---|---|---|
| Missed-Call Rescue | $297 | $197 | Text-back, AI lead capture, owner and emergency alerts, carrier registration |
| Front Desk (offer after 3 clients) | $297 | $397 | The above, plus estimate follow-ups, review requests, monthly report |

Terms: month to month. Setup refunded if no lead is captured in the first 30 days live. Billing starts the day the line goes live, not the day they sign.

Do not discount the monthly price. If someone hesitates, offer to waive setup in exchange for a written testimonial after 30 days. Limit that to your first three clients.

## Outreach

The hook is real and specific: you called their business and nobody answered. Only use it when that actually happened, and state the true day and time.

### Text or email after a missed secret-shopper call

> Hi [Name], this is Juan with Culmen Contracting here in [city]. I called [Business] [Tuesday at 12:40] about [a real question] and got voicemail. No complaint, I run a crew myself and know you were on a job.
>
> I set up a system for local contractors that texts the caller back in seconds when you can't pick up, finds out what they need, and sends you the lead. Here's a 60-second demo you can try from your phone: [demo link]
>
> Worth a 10-minute call this week?

### Phone script when the owner answers

> "Hey [Name], Juan Martinez, Culmen Contracting in [city]. Quick question and I'll let you go: when you're on a job and the phone rings, what happens to that call?"
>
> (Let them answer. Most say voicemail, or their spouse, or they call back later.)
>
> "That's what I figured. I set up something for contractors that texts that caller back right away and gets you their name and what they need before they call the next guy. Can I text you a demo? Takes a minute to try."

If they say they already have an answering service: "Good. How much of what it sends you turns into a booked job?" Then stop and listen.

### Walk-in

Bring your phone with the demo open. Say: "Call this number and don't let me answer." Let them watch the text arrive and the lead show up. Then ask how many calls they think they miss in a week.

### Follow-up, three days later

> Hi [Name], Juan again. Did you get a chance to try the demo? If missed calls aren't a problem for you, just say so and I won't bug you.

Two follow-ups maximum. If they say no or ask you to stop, mark them closed in the tracker and do not contact them again.

## Proposal (one page)

> **Missed-Call Rescue for [Business]**
> Prepared by Juan Martinez, Culmen Contracting LLC, [date]
>
> **The problem.** You told me that when you're on a job, calls go to [voicemail]. You estimated you miss about [N] calls a week and your average job is about [$X].
>
> **What I'll set up.**
> 1. When a call to [their number] goes unanswered, the caller gets a text from [Business] within seconds.
> 2. An automated assistant asks what they need, where, and when. It does not quote prices or promise times.
> 3. You get a text with the lead. Emergencies are flagged immediately.
> 4. You keep your number. I handle the carrier registration.
>
> **What I need from you.** Your EIN and business address for carrier registration, 20 minutes to go over how you want callers handled, and one test call together.
>
> **Timeline.** Live about 5-10 business days after signing. Carrier approval sets the pace.
>
> **Price.** $297 setup, then $197/month starting the day it goes live. Month to month. If it captures no leads in the first 30 days, the setup fee is refunded.
>
> **Sign-off.** [Name], [date], [signature]

Use the prospect's own numbers. Never fill in a missed-call count or job value they did not give you.

## Onboarding checklist

Per client, in order:

1. Signed proposal and setup fee collected.
2. Written permission to text their callers on their behalf.
3. Collect: legal business name, EIN, address, owner cell, hours, services, service area, things never to say by text.
4. Submit A2P brand and campaign registration. Record the date.
5. Buy the number. Create `config/businesses/[client].json`.
6. Set Voice and Messaging webhooks on the number.
7. After registration clears: owner sets up forward-when-unanswered with their carrier. Do it with them on the phone.
8. Test together: call, let it ring out, run the conversation, confirm the owner alert arrives.
9. Tell them it's live. Start billing. Add the client to `money.csv`.
10. Day 7: check in by phone. Day 30: send the count of missed calls and leads, ask for a referral.

## Trackers

- `pipeline.csv`: one row per prospect, updated after every contact.
- `money.csv`: only money that has actually moved. A signed proposal is not income until it's paid.
