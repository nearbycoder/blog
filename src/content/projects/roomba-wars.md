---
title: "Roomba Wars"
summary: "A multiplayer browser game that turns a simple Roomba interview prompt into a realtime 3D arena with procedural terrain, enemies, and benchmark tooling."
role: "Creator"
year: "2026"
stack: ["TypeScript", "React 19", "Vite", "React Three Fiber", "three", "Cloudflare Workers", "Durable Objects"]
impact: "Reimagined an interview exercise as a multiplayer game prototype with realtime simulation, persistent scoring, and benchmark tooling to test rendering limits at higher player counts."
link: "https://roomba.nerb.dev"
githubLink: "https://github.com/nearbycoder/roomba-wars"
featured: false
accent: "lime"
draft: false
---

Roomba Wars takes a very small interview prompt and pushes it into something much closer to a real product and systems exercise.

![Roomba Wars screenshot one](/images/roomba-1.png)

![Roomba Wars screenshot two](/images/roomba-2.png)

## What it includes

- Multiplayer gameplay in a shared browser arena
- An infinite procedural dirt field instead of a fixed board
- Custom player names and Roomba colors
- Dirt-clearing rules that change where movement is possible
- Regrowth timing that keeps the arena shifting
- Dust bunny enemies that create pressure and combat moments
- Persistent leaderboard tracking best runs
- A benchmark arena for testing higher player-count rendering behavior

## Why I built it

The original interview challenge was about controlling a Roomba on a grid.

After the interview, I wanted to see what would happen if I treated that core idea like the start of a real game instead of the end of a coding prompt. That meant adding realtime multiplayer, a stronger visual layer, and enough gameplay systems to make movement, territory, and score all matter.

Benchmarking became part of that rework too.

One of the scale questions raised in the interview was what happens when the board gets dramatically larger. The benchmark arena is not a perfect stand-in for live websocket traffic, but it gives me a practical way to test rendering constraints and player-count pressure without hand-waving the performance problem away.

## Links

- Live app: [roomba.nerb.dev](https://roomba.nerb.dev)
- GitHub repo: [nearbycoder/roomba-wars](https://github.com/nearbycoder/roomba-wars)

## Related updates

- Launch article: [When AI in an interview fails you](/articles/when-ai-in-an-interview-fails-you)
- Layoff log: [Week 3: Roomba Wars](/layoff/week-003-2026-03-08-roomba-wars)
