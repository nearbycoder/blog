---
title: "The 6-hour build and why technical interviewing needs to change"
description: "Building TripHaven in about six hours made one thing clear: interviews should test end-to-end product replication and engineering judgment, not isolated feature trivia."
date: "2026-03-02"
publishedAt: "2026-03-02T00:00:00Z"
tags: ["interviews", "ai", "career", "build-in-public", "prototype", "triphaven"]
readTime: "7 min read"
featured: false
accent: "sky"
draft: false
---

![TripHaven screenshot](/images/triphaven.png)

I just built [TripHaven](https://github.com/nearbycoder/triphaven), a full-stack Expedia-style hotel booking platform, in about six hours.

That is not because the work is "easy." It is because a skilled engineer with the right modern workflow can now scaffold serious prototypes much faster than interview loops usually assume.

## What TripHaven is

TripHaven is a full-stack booking app with:

- Home search with destination autocomplete, date selection, and guest controls
- Faceted `/search` with URL-driven state, sorting, filters, pagination, and map support
- Hotel detail pages with galleries, amenities, policies, reviews, and room offers
- Auth-gated checkout and booking confirmation flows
- Saved listings and profile booking history management
- AI chat assistant with tool-calling and an MCP endpoint over the same hotel data layer
- Admin tools for listings, room/rate/inventory management, media, and review operations

Stack-wise, this build uses TanStack Start, tRPC, Better Auth, Drizzle ORM, Postgres, and TypeScript.

## How this 6-hour spike actually worked

This is not something you can single-prompt into existence.

You have to be systematic.

I start from a scaffold of technologies I already know and trust, then iterate feature by feature with clear boundaries.

I also do not over-index on design at the start. With a strong technical foundation, I can pivot the design direction later without rewriting core flows.

Specs are part of the build, not a cleanup phase.

I add unit and end-to-end specs throughout implementation so regressions get caught while the system is still evolving.

Is this 6-hour spike missing functionality? Of course.

But the point was the process and technical decision-making that got it to a credible end-to-end state, not pretending it is production-ready on day one.

## Why this matters for interviewing

Older technical loops often say: "Build feature X in a timed environment."

That still measures something, but it misses how strong engineers actually ship now:

- They frame the product and scope tradeoffs
- They scaffold systems quickly with modern tools
- They verify generated code instead of blindly trusting it
- They make architecture calls under real constraints
- They communicate decisions clearly to stakeholders

So instead of "build one isolated feature," a stronger interview format is:

Replicate a known app slice end to end, then present your implementation thoroughly:

- Why you chose the architecture you did
- Where you used AI and how you validated outputs
- What you cut, what you deferred, and why
- What breaks first in production and how you would harden it

That maps much closer to real engineering work than syntax recall under a timer.

<video controls preload="metadata" playsinline style="width: 100%; height: auto;" src="https://dz3hejmfbr.ufs.sh/f/LfZ3RwMGeY0baRcrAVUuAvge9Vfm4B7WClskKLyriETjpqQM">
  Your browser does not support the video tag.
</video>

## The bar should move up, not down

This is not an argument for easier interviews.

It is an argument for better interviews:

- more systems thinking
- more product replication under constraints
- more accountability for correctness
- more communication around tradeoffs and reliability

If candidates can scaffold faster now, interview quality should increase by evaluating judgment and execution depth, not just keystrokes.

## Related updates

- Project page: [TripHaven](/projects/triphaven)
- Layoff log: [Week 3: TripHaven prototype](/layoff/week-003-2026-03-02-triphaven)
