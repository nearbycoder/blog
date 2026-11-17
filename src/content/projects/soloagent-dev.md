---
title: "soloagent.dev"
summary: "An open-source, self-hosted control plane for durable AI agents built on Pi. Agents run on the AI subscriptions you already pay for, answer in Slack, Discord, Telegram, webhooks, a web dashboard and a terminal UI, and keep everything in SQLite."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "TypeScript",
    "Node.js",
    "Pi Durable",
    "SQLite",
    "Hono",
    "WebSockets",
    "React 19",
    "Tailwind CSS 4",
    "Slack Bolt",
    "MCP",
    "Docker",
    "Homebrew",
  ]
link: "https://soloagent.dev"
githubLink: "https://github.com/nearbycoder/soloagent.dev"
image: "/images/projects/soloagent-dev.webp"
imageAlt: "The soloagent social image: the lettermark and name, the line Open source, Self-hosted, Built on Pi, the headline “Durable agents for Slack, Discord, and your terminal.” with Durable highlighted in lime, and a cropped dashboard showing a chat list with threads from Slack, Discord, Telegram, a webhook and the web."
imageCaption: "The social image from the soloagent.dev repository."
featured: false
accent: "lime"
draft: false
---

soloagent is a self-hosted home for AI agents. You give each agent a name, instructions, a model and a set of skills, then talk to all of them from Slack, Discord, Telegram, webhooks, a web dashboard or a terminal UI. It's built on [Pi](https://github.com/earendil-works/pi): `pi-ai` for model access and Pi Durable for durable execution. Every model turn and tool call is written to SQLite before it's shown, so a crash, a redeploy or a killed container is a pause rather than a reset.

It's open source under the MIT license, and it runs on your laptop, a home server or a cloud host. The changelog lists four releases, 0.1.0 through 0.2.1, on November 2 and 3, 2026. It shares its name and author with [SoloAgent](/projects/soloagent), an Electron desktop app for coding workflows from February 2026, but it's a separate codebase in its own repository.

<figure>
  <picture><source srcset="/images/projects/soloagent-dev-dashboard-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/soloagent-dev-dashboard.webp" alt="The soloagent dashboard: a sidebar with Overview, Chat, Agents, Providers, Connections, Activity, Usage, Settings and four agents named Solo, Coder, Scout and Ops; a list of chats from Slack, Discord, Telegram, a webhook and the web; and an #eng-deploys thread where the Coder agent runs bash on a CI log, calls ask_agent for Scout, and explains a failed deploy with a table of two builds." width="1440" height="900" loading="lazy" /></picture>
  <figcaption>The dashboard, from soloagent.dev, with the site's example threads. A question from Slack, answered by the Coder agent after reading a CI log and asking the Scout agent for help. Screenshots with a light and dark version follow this site's theme.</figcaption>
</figure>

## What it does

- **Durable by default.** Conversations, model turns, tool calls, reminders and delegations live in Pi Durable's SQLite storage. A restart resumes unfinished work, and a reminder set for next Tuesday fires next Tuesday.
- **Your existing subscriptions.** Sign in with Claude Pro or Max, ChatGPT, GitHub Copilot, SuperGrok, OpenRouter and others over OAuth, or paste API keys for more than 30 providers. Each agent can use a different one. Credentials are sealed with AES-256-GCM.
- **Where your team talks.** Slack over Socket Mode, so it needs no public URL, with replies streaming into the thread. Discord mentions, replies and DMs, with each thread as its own conversation. Telegram DMs, groups and forum topics. Webhooks that answer synchronously or post to a `callback_url`.
- **Skills.** `memory` remembers across conversations, `web` fetches and searches, `delegate` hands a task to another agent through a durable child conversation, `schedule` sets reminders and recurring automations, and `workspace` reads, writes and runs shell commands in a per-agent folder. The last one isn't a sandbox, so it's off by default.
- **Approvals.** An agent can pause before risky tools until someone approves in the dashboard, the terminal UI, or with buttons in the Slack, Discord or Telegram thread. The wait survives restarts, and an approved call runs once.
- **Teams.** Access lists for people, channels and agents on each connector, daily spend and message budgets per agent, per-person rate limits, and dashboard users with admin and member roles.
- **MCP tools.** Connect any Model Context Protocol server over stdio or HTTP and pick which agents get its tools. Large tool sets load on demand.
- **Files, automations and memory.** Share screenshots and files from any chat app. Schedule recurring posts with cron in any time zone. See and edit what each agent remembers.

A built-in demo model answers until you connect a provider, so a fresh install works with no accounts.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/soloagent-dev-chat-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/soloagent-dev-chat.webp" alt="A local soloagent dashboard with one chat, What is soloagent?, answered by the Solo agent on the demo/solo-demo model, with a collapsed Thought process and three bullets about durability, subscriptions and the places agents answer." width="1440" height="900" loading="lazy" /></picture><figcaption>A fresh install running locally from source. The built-in demo model answers, with no provider connected.</figcaption></figure>
  <figure><img src="/images/projects/soloagent-dev-agents.webp" alt="The Agents page with cards for Solo, Coder, Scout and Ops, each showing a handle, a one-line role, a model such as Claude Sonnet 5.5, Claude Opus 5.5, GPT-6 Sol or GPT-6.1 Terra with a thinking level, skill tags like Memory, Web, Delegate, Schedule and Workspace, and a thread count." width="1440" height="900" loading="lazy" /><figcaption>Agents, each with a model, instructions and skills. From soloagent.dev.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/soloagent-dev-providers-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/soloagent-dev-providers.webp" alt="The Providers page marked None connected, with sign-in cards for Anthropic (Claude Pro / Max), OpenAI (ChatGPT Plus / Pro), GitHub Copilot, xAI (SuperGrok / X Premium), OpenAI Codex (legacy), Kimi For Coding and Meta, each with a model count, and an API keys list starting with Anthropic and DeepSeek." width="1440" height="900" loading="lazy" /></picture><figcaption>Sign in with a subscription or paste an API key. Captured locally, with nothing connected.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/soloagent-dev-slack-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/soloagent-dev-slack.webp" alt="The Connect Slack dialog with choices for Slack, Discord, Telegram and Webhook, empty fields for the bot token and app-level token, an Answers as menu set to the default agent, an Approvers field, and a setup guide with four steps and the Slack app manifest in YAML." width="1440" height="900" loading="lazy" /></picture><figcaption>Every connector has a setup guide. Slack uses Socket Mode and a bundled app manifest. Captured locally, and never connected to Slack.</figcaption></figure>
</div>

## On the record

Every model turn, tool call, delegation and reminder is a durable step in SQLite. Model turns and tool calls are committed before Slack or the dashboard shows them, and streaming text is saved as it arrives. After a restart, an interrupted model request is retried and finished tool calls never run twice. A reminder sleeps in storage and fires on time across any number of deploys. Skills are Pi Durable extensions, so their work is recorded the same way.

Messages sent while an agent is working join the run at its next step instead of waiting for it to finish. In any chat, `@coder fix the build` or `coder: fix the build` picks an agent, and the commands `!agents`, `!reset`, `!stop` and `!help` work there too.

## The terminal UI

The `soloagent` command opens a full-screen terminal UI built on Pi's `pi-tui`, either with a private local server or against a remote one after `soloagent connect`. It has a threads sidebar, streaming answers with thinking and tool output you can toggle, and slash commands like `/new @agent`, `/model`, `/login`, `/approve` and `/usage`. The same command also does one-off work, as in `git diff | soloagent ask - --agent reviewer`, plus backups, restores and moving agents between servers.

<figure>
  <img src="/images/projects/soloagent-dev-terminal.webp" alt="The soloagent terminal UI on a dark background: a threads sidebar, and the #eng-deploys thread with Maya Chen's question from Slack, the Coder agent's bash and ask_agent tool calls, a framed table of two builds, a SQL fix, a schedule_reminder call, and a command bar listing shortcuts and token counts." width="1100" height="1089" loading="lazy" />
  <figcaption>The terminal UI with the same example thread. From soloagent.dev.</figcaption>
</figure>

## How it's built

It's a TypeScript monorepo of npm workspaces that runs on Node.js 22.19 or later. From a clone, Node runs the TypeScript source directly, and data goes into SQLite through the built-in `node:sqlite` module.

- **`packages/core`** is the runtime: the Pi Durable harness, agents, threads, skills, credential sealing and connectors, using Slack Bolt, discord.js and grammY for Telegram. The demo model is a Pi faux provider.
- **`packages/server`** is a Hono REST and WebSocket API that also serves the dashboard.
- **`packages/client`** is the typed SDK that the dashboard and terminal UI both use.
- **`packages/web`** is the dashboard, in React 19 with Vite 8 and Tailwind CSS 4.
- **`packages/cli`** is the `soloagent` command and terminal UI.

The runtime tests run end to end on Pi's faux provider. Connector tests run against fake Slack and Telegram servers, and Playwright tests drive the dashboard in CI. A version tag bundles the `soloagent` package with esbuild, attaches it to a GitHub release, publishes a multi-arch Docker image to GitHub's container registry, and updates the formula in the Homebrew tap. The [website](https://soloagent.dev) is plain HTML, CSS and JavaScript, deployed on Vercel.

## Try it

On your machine, with Node.js 22.19 or later:

```sh
curl -fsSL https://soloagent.dev/install.sh | sh
soloagent            # terminal UI with a private local server
soloagent serve      # web dashboard on http://localhost:7420
```

On macOS or Linux you can install it from the [Homebrew tap](https://github.com/nearbycoder/homebrew-soloagent) instead, with `brew install nearbycoder/soloagent/soloagent`. The formula depends on Homebrew's Node and installs the npm package from the GitHub release. The tap's CI audits and test-installs it on macOS and Linux every day.

With Docker, run `docker run -d --name soloagent -p 7420:7420 -v soloagent:/data ghcr.io/nearbycoder/soloagent.dev`, and `docker logs soloagent | grep token` prints the login token. The repository also has configs for Docker Compose, Railway, Render, Fly.io and a systemd unit. It needs a long-running process and a persistent disk, so serverless platforms can't run it. The [docs](https://soloagent.dev/docs/) cover each host, the chat connectors, backups and the API, and the [releases page](https://github.com/nearbycoder/soloagent.dev/releases) has every version.

The creation date shown here is the GitHub repository's UTC creation date. The social image and the dashboard, Agents and terminal screenshots come from the soloagent.dev repository and website, and the chat, Providers and Slack screenshots were captured by running version 0.2.1 locally from its source, with the built-in demo model and no providers or chat apps connected.
