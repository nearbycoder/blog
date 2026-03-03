---
title: "Week 3: SoloAgent orchestration experiment"
summary: "Built SoloAgent to understand orchestration internals in AI coding frameworks by implementing the workflow stack directly."
date: "2026-03-03"
week: 3
status: "building"
stack: ["TypeScript", "Electron", "React 19", "TanStack AI", "node-pty", "SQLite"]
image: "/images/soloagent.jpg"
repoUrl: "https://github.com/nearbycoder/soloagent"
siteUrl: "https://github.com/nearbycoder/soloagent"
accent: "indigoDeep"
draft: false
---

This Week 3 build is [SoloAgent](https://github.com/nearbycoder/soloagent), a desktop orchestration experiment for AI-assisted coding workflows.

![SoloAgent screenshot](/images/soloagent.jpg)

There is no live site yet, only the repository.

## What I built

- Open source repo: [nearbycoder/soloagent](https://github.com/nearbycoder/soloagent)
- New article: [Building SoloAgent to understand AI orchestration](/articles/building-soloagent-to-understand-ai-orchestration)
- New project page: [SoloAgent](/projects/soloagent)

## Repo pull-down tool audit

I pulled the repo and inspected the current manifests/docs to verify the tooling.

- App/runtime: Electron 39, React 19, TypeScript 5, Node.js 22+, SQLite
- AI runtime: `@tanstack/ai`, `@tanstack/ai-react`, `@tanstack/ai-openai`, `@tanstack/ai-client`
- Terminal/diff: `node-pty`, `ghostty-web`, `@pierre/diffs`
- UI/state: Tailwind CSS 4, Radix UI, `lucide-react`, `motion`, `zustand`
- Quality/build: `electron-vite`, Vite, `electron-builder`, ESLint, Prettier, Vitest
- External CLIs: Git, GitHub CLI (`gh`), Codex CLI

## Why this mattered

This was a practical way to map where orchestration complexity actually sits: state boundaries, tool-call UX, terminal process management, and git operations that hold up under real project workflows.
