---
title: "NoBo"
summary: "A self-hosted Slack assistant with thread-aware replies, reminders, shared memory, document artifacts, and an App Home dashboard."
role: "Creator"
createdAt: "2026-05-22"
year: "2026"
stack: ["TypeScript", "Node.js", "Slack Bolt", "Flue", "Redis", "Hono"]
githubLink: "https://github.com/nearbycoder/JoshBot"
image: "/images/projects/nobo.svg"
imageAlt: "NoBo architecture: Slack mentions, threads, and commands reach a Bolt server and Flue agent, with Redis memory and tools for search, reminders, and documents."
imageCaption: "Architecture overview based on the public README; this is a diagram, not a Slack screenshot."
featured: false
accent: "amber"
draft: false
---

NoBo is a Slack assistant that lives alongside a team's conversations. Its public repository is named **JoshBot**, but the application and commands use NoBo. A standalone TypeScript service receives Slack events, reads the relevant thread, and replies where the conversation is already happening.

## Beyond a mention and a reply

NoBo supports mentions, direct messages, thread replies, slash commands, reactions, and Slack's App Home. Replies can stream into a single message, and workspaces with Slack's Agent experience enabled can use native agent sessions and progress updates.

The assistant keeps per-user preferences and memories, along with shared channel memory. It can schedule one-time reminders and recurring tasks, track follow-ups from a discussion, and record channel decisions. App Home brings upcoming reminders, recent documents, and preferences into a native Slack dashboard.

Other tools include web search, channel digests, lightweight polls, and versioned HTML or Markdown artifacts. Document artifacts have preview links and version history, so a thread can produce something useful outside the chat itself. The README calls out that its search interface currently uses lexical scoring rather than embeddings.

## How it fits together

Slack Bolt receives and verifies events and interactions. A Flue agent runtime handles model calls and tool execution, while Redis holds thread state, memories, schedules, and other shared data. Hono provides health and artifact routes. Retry suppression and duplicate-event locks handle Slack's delivery behavior.

This is a self-hosted integration, so running it requires a configured Slack app and model credentials; persistent features also use Redis. There is no public chat demo. The image above explains the architecture without exposing a workspace conversation or presenting a fabricated Slack interface.

The [public README and source](https://github.com/nearbycoder/JoshBot) document setup and the current feature set. GitHub does not currently identify a repository license, so this page describes the public code without making a broader licensing claim. The creation date is the GitHub repository's UTC date.
