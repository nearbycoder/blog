---
title: "Building hackernews-tui in 30 minutes with OpenTUI and GPT-5.3-Codex"
description: "I built and shipped a Hacker News terminal UI in about 30 minutes using OpenTUI and GPT-5.3-Codex, then published it straight to npm from the Codex app."
date: "2026-03-04"
tags: ["build-in-public", "tui", "opentui", "npm", "hacker-news", "ai-coding"]
readTime: "4 min read"
featured: false
accent: "amber"
draft: false
---

I wanted a faster way to scan Hacker News without opening a browser, so I built `hackernews-tui` as a small command-line app.

![hackernews-tui screenshot](/images/hackernews-tui.jpg)

The interesting part is speed: this went from idea to shipped npm package in roughly 30 minutes.

## Why this was so fast

OpenTUI handled the terminal UI primitives, so I did not have to spend time wiring low-level terminal behavior from scratch.

GPT-5.3-Codex handled most of the implementation loop:

- scaffold the project and command structure
- generate core search and rendering flow
- iterate on UX quickly in terminal
- clean up packaging and publish workflow

The Codex app made it straightforward to move from prompt to working code to publish without context-switching across multiple tools.

## Run it

```bash
bunx hackernews-tui
```

or

```bash
npx hackernews-tui
```

## What shipped

- Open source repo: [nearbycoder/hackernews-tui](https://github.com/nearbycoder/hackernews-tui)
- npm package: [hackernews-tui](https://www.npmjs.com/package/hackernews-tui)
- Project page: [hackernews-tui](/projects/hackernews-tui)
- Layoff log: [Week 3: hackernews-tui](/layoff/week-003-2026-03-04-hackernews-tui)
