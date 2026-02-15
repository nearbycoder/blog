---
title: "QikPoll"
summary: "Anonymous StrawPoll-style app with realtime vote updates, privacy-focused anti-repeat guardrails, and Redis-backed polling."
role: "Creator"
year: "Ongoing"
stack: ["React 19", "TypeScript", "TanStack Start", "Redis", "WebSockets", "Vite 7", "Bun"]
impact: "Built a no-signup polling product with live result streaming, poll visibility controls, and abuse-resistant voting powered by Redis TTL keys and atomic server logic."
link: "https://poll.nrby.xyz"
githubLink: "https://github.com/nearbycoder/qikpoll"
featured: false
accent: "teal"
---

QikPoll is a fast anonymous polling app designed for "create, share, vote" in seconds. It supports public and private poll visibility, realtime vote/result updates, and a lightweight UX that works without account creation.

## Why I built it

I wanted a polling tool that feels immediate like classic internet utility apps, but with modern reliability around realtime updates and vote fairness.

## What shipped

- Poll creation with 2 to 8 options and visibility modes (`public` or `private`)
- Shareable poll links for direct participation
- Live poll result updates over WebSockets
- Realtime updates for the recent public poll feed
- Redis-backed persistence with TTL expiration so stale polls clean themselves up

## Technical highlights

- **Realtime architecture:** WebSocket streams per poll plus a public feed stream for new public polls
- **Abuse guardrails:** one-vote protections using hashed fingerprint and hashed IP keys instead of storing raw IP data
- **Atomic vote handling:** Redis Lua script path to reduce race-condition double voting
- **Operational simplicity:** TTL-based key lifecycle for polls and vote locks keeps the data model compact

## Product and engineering notes

QikPoll balances speed and trust. The core loop is intentionally simple for users, while the backend enforces practical anti-repeat constraints and consistent live updates. That balance was the central product goal.
