# Resend newsletter

The static Astro site uses three Vercel Functions in `api/`. Resend stores subscribers and sends confirmation emails and post broadcasts. The verified sender is `Josh Hamilton <newsletter@nearbycoder.com>`.

## Configuration

Set these server environment variables in Vercel. Never commit their values:

- `NEWSLETTER_ENABLED=true` also enables the signup UI at build time. Missing configuration leaves the RSS fallback.
- `RESEND_API_KEY`: Full access key, required for contacts, topics, and broadcasts as well as sending.
- `NEWSLETTER_FROM`: verified sender.
- `NEWSLETTER_TOKEN_SECRET`: random secret of at least 32 characters, distinct for Preview and Production.
- `RESEND_SEGMENT_ID` and `RESEND_TOPIC_ID`: dedicated newsletter segment and topic. Create the topic with `default_subscription: opt_out`.
- `CRON_SECRET`: random production secret. Vercel includes it as the cron request’s bearer token.

Create a numeric contact property named `nearbycoder_confirmed_at` with fallback 0. Production and Preview use separate segments and topics. The feature branch’s Preview configuration uses the dedicated test segment; do not copy production segment credentials into Preview. API keys and token secrets are sensitive Vercel variables. `.env.example` contains names only.

## Reader flow

`POST /api/newsletter` validates the address, explicit consent, origin, request size, and honeypot before sending an email. A confirmation email does not add a subscriber. Encrypted, authenticated confirmation tokens expire after one hour and are passed in a URL fragment, then removed from the browser address. Opening the link does not subscribe the reader: the confirmation page requires a button click and `POST /api/newsletter-confirm`.

Confirmation upserts the contact into the newsletter segment and opts it into this topic. It preserves other contact details and never reverses a global unsubscribe. The stored confirmation timestamp makes replaying an already-used link harmless, including after a topic unsubscribe. A fresh link can rejoin this topic; a global opt-out must be changed in Resend’s preferences page first.

Signup works through a normal HTML form without JavaScript; confirmation requires JavaScript. Enhanced forms show sending, retry, failure, and success states. Success means the email service accepted the request, not proof of inbox delivery. The address is stored in Resend, never localStorage.

Confirmation sends use Resend’s email idempotency key per address/topic/ten-minute window. A best-effort per-instance IP limiter and honeypot reduce accidental repeated requests; these are not a distributed abuse-prevention system. For higher traffic, add a shared limiter or Vercel firewall rule. Provider rate limits receive bounded retries.

## New posts

Vercel calls `/api/newsletter-publish` daily at 14:00 UTC. It requires the cron secret and a production environment. The endpoint reads the published-only `/newsletter-feed.json`, excludes future posts, and sends at most three new posts per run, oldest first. Notifications contain the title, excerpt, generated social image, article link, and Resend’s native unsubscribe/preferences link in both HTML and text.

`src/data/newsletter-baseline.json` records the 27 posts present before activation, preventing an archive blast. Do not add new posts to that baseline. Updating an existing article does not resend it; a new article ID is a new notification.

Resend broadcasts are the persistent delivery ledger, keyed by a hash of article ID and matched to the configured segment. A failed send reuses its draft. Sent or queued broadcasts are skipped. Keep those records: deleting a sent broadcast can make its article eligible again. Resend broadcast creation does not support idempotency keys, so avoid overlapping manual publisher runs; this ledger protects sequential retries, not simultaneous invocations. Inspect Resend after an ambiguous timeout before manually retrying.

## Verification

Run `npm run verify` before release. The suite checks all routes, social images, responsive layouts, light/dark accessibility, configured and fallback signup UI, consent validation, token integrity/expiry, opt-out preservation, used links, provider failures, baseline filtering, and broadcast retry behavior.

On the Vercel Preview, use a unique `delivered+nearbycoder-<label>@resend.dev` address in the isolated test segment. Verify confirmation email acceptance/delivery events, explicit confirmation, contact topic status, a test broadcast, its preferences link, and replay after opt-out. These are Resend’s synthetic delivery addresses; a delivery event does not establish rendering or inbox placement at Gmail or another human mailbox. Never publish a fake article or send a test to the production list.
