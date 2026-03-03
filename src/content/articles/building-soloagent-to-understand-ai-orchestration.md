---
title: "Building SoloAgent to understand AI orchestration"
description: "I built SoloAgent as an orchestration-layer experiment to understand how modern AI coding workflows are wired under the hood."
date: "2026-03-03"
tags: ["ai", "orchestration", "build-in-public", "electron", "typescript", "agents"]
readTime: "6 min read"
featured: false
accent: "indigo"
draft: false
---

To understand how orchestration layers in AI frameworks actually work, I built one myself.

No, I am not trying to sell you something. This was purely an experiment to measure how much work it takes to wire a usable desktop workflow end to end.

The result is [SoloAgent](https://github.com/nearbycoder/soloagent): a local desktop app for per-project workspaces, scoped chat context, terminal execution, and live git visibility.

![SoloAgent screenshot](/images/soloagent.jpg)

## Why I built this

I wanted to move from abstract opinions about agent orchestration to first-hand implementation constraints:

- what state needs to persist across conversations and spaces
- how tool calls should stream and render without killing UX
- where terminal and git integration create real complexity
- what "good enough" local orchestration looks like without cloud dependencies

## What SoloAgent currently does

- Project + space-scoped chat context
- Streaming assistant responses with tool trace rendering
- PTY terminal workspace with tabs/splits
- Git Diff and file-tree insight panels
- SQLite-backed persistence for projects/settings/history

### Core app/runtime

- Electron 39
- React 19
- TypeScript 5
- Node.js 22+
- SQLite via `node:sqlite`

### AI orchestration + chat runtime

- `@tanstack/ai`
- `@tanstack/ai-react`
- `@tanstack/ai-openai`
- `@tanstack/ai-client`
- `zod` (typing/validation support)

### Terminal + git workflow

- `node-pty` (PTY shell sessions)
- `ghostty-web` (terminal renderer)
- `@pierre/diffs` (diff rendering)
- Git + GitHub CLI (`gh`) integration
- `codex` CLI integration

### UI + state

- Tailwind CSS 4
- Radix primitives (`@radix-ui/react-*`)
- `lucide-react`
- `motion`
- `zustand`
- `react-markdown` + `remark-gfm`
- `react-syntax-highlighter`

### Build and quality tooling

- `electron-vite`
- Vite
- `electron-builder`
- ESLint
- Prettier
- Vitest

## What this experiment gave me

The value was not "another framework." The value was implementation clarity.

I now have a better mental model for where orchestration complexity really lives: message state, tool boundaries, terminal lifecycle, and git operations under real user behavior.

## Related updates

- Project page: [SoloAgent](/projects/soloagent)
- Layoff log: [Week 3: SoloAgent orchestration experiment](/layoff/week-003-2026-03-03-soloagent)
