---
title: "Week 3: Roomba Wars"
summary: "Turned a Roomba interview prompt into a multiplayer browser game with realtime systems, 3D rendering, and benchmark tooling."
date: "2026-03-08"
week: 3
status: "shipped"
stack: ["TypeScript", "React 19", "Vite", "React Three Fiber", "three", "Cloudflare Workers", "Durable Objects"]
image: "/images/roomba-1.png"
repoUrl: "https://github.com/nearbycoder/roomba-wars"
siteUrl: "https://roomba.nerb.dev"
accent: "lime"
draft: false
---

This Week 3 build is [Roomba Wars](https://github.com/nearbycoder/roomba-wars), a multiplayer browser game that grew out of a Roomba-based interview exercise.

![Roomba Wars screenshot](/images/roomba-1.png)

## What I built

- Open source repo: [nearbycoder/roomba-wars](https://github.com/nearbycoder/roomba-wars)
- Live app: [roomba.nerb.dev](https://roomba.nerb.dev)
- New article: [When AI in an interview fails you](/articles/when-ai-in-an-interview-fails-you)
- New project page: [Roomba Wars](/projects/roomba-wars)

## Why this mattered

This project let me revisit an interview prompt and push it toward something more like real engineering work: multiplayer state, rendering constraints, gameplay systems, and scale questions instead of just one grid-based implementation.

The benchmark arena was a key part of that rethinking. It gave me a way to test hypotheses around player counts and rendering pressure after the interview raised bigger questions about how a much larger board or denser simulation would hold up.
