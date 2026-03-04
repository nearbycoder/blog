---
title: "SoloAgent"
summary: "Desktop AI harness workspace for coding workflows with project-scoped chat context, terminal execution, and live git visibility."
role: "Creator"
year: "Ongoing"
stack: ["TypeScript", "Electron", "React 19", "TanStack AI", "node-pty", "SQLite", "Tailwind CSS 4"]
impact: "Built as a practical AI harness experiment to understand state, tool-calling, terminal lifecycle, and git integration tradeoffs in modern AI coding workflows."
githubLink: "https://github.com/nearbycoder/soloagent"
featured: false
accent: "indigo"
draft: false
---

SoloAgent is a desktop app experiment I built to better understand AI harness internals in AI-assisted coding workflows.

![SoloAgent screenshot](/images/soloagent.jpg)

There is no live website yet. This project is currently repo-only:

- Repo: [nearbycoder/soloagent](https://github.com/nearbycoder/soloagent)

## Why I built it

I wanted first-hand implementation experience with AI harness constraints instead of theory:

- scoped conversation state per workspace
- tool-call trace rendering while responses stream
- terminal lifecycle and shell behavior
- git diff/PR workflows inside the same product surface

## Current capabilities

- Per-project workspaces and per-space context
- Streaming chat responses with tool traces
- PTY-backed terminal tabs/splits
- Git diff panel and file tree panel
- SQLite-backed persistence for settings and chat history

## Tooling pulled from the repo

- App/runtime: Electron, React, TypeScript, Node.js 22+, SQLite
- AI runtime: `@tanstack/ai`, `@tanstack/ai-react`, `@tanstack/ai-openai`, `@tanstack/ai-client`
- Terminal/diff: `node-pty`, `ghostty-web`, `@pierre/diffs`
- UI/state: Tailwind CSS, Radix UI primitives, `lucide-react`, `motion`, `zustand`
- Quality/build: `electron-vite`, Vite, `electron-builder`, ESLint, Prettier, Vitest
- External CLIs: Git, GitHub CLI (`gh`), Codex CLI

## Related updates

- Launch article: [Building SoloAgent to understand AI harnesses](/articles/building-soloagent-to-understand-ai-harnesses)
- Layoff log: [Week 3: SoloAgent AI harness experiment](/layoff/week-003-2026-03-03-soloagent)
