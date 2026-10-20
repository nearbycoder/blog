---
title: "Dex"
summary: "A personal AI agent on Cloudflare. Each user gets an agent in a Durable Object that answers with live UI, works on its own cloud VM you can watch, and brings along skills, MCP servers, GitHub and a phone app."
role: "Creator"
createdAt: "2026-10-17"
year: "2026"
stack:
  [
    "TypeScript",
    "TanStack Start",
    "React 19",
    "Effect",
    "Cloudflare Workers",
    "Durable Objects",
    "Cloudflare Agents SDK",
    "Pi Durable",
    "OpenUI",
    "Cloudflare R2",
    "Workers AI",
    "boat.dev",
    "MCP",
    "Tailwind CSS 4",
  ]
link: "https://trydex.dev"
githubLink: "https://github.com/nearbycoder/dex"
image: "/images/projects/dex.webp"
imageAlt: "The Dex title card: a green cube logo, the name Dex, the line “Your personal AI agent, running on Cloudflare.”, and chips for generative UI, ClinePass and OpenCode Go, a cloud VM per chat, skills, any MCP server and works on your phone."
imageCaption: "The title card from the Dex README."
demoVideos:
  - src: "https://trydex.dev/tour.mp4"
    title: "Dex tour"
    caption: "The two-minute tour from trydex.dev: answers as live UI, the model menu, skills, a cloud VM per chat, the live desktop, GitHub repositories, usage and the phone app. It's captured from the app with demo content, with a caption over each feature."
    poster: "/images/projects/dex-tour-poster.webp"
featured: false
accent: "teal"
draft: false
---

Dex is a personal AI agent that I built to run entirely on Cloudflare. Each user gets their own agent, living in a Durable Object and running [Pi Durable](https://developers.cloudflare.com/agents/harnesses/pi/). It thinks with models from [ClinePass](https://docs.cline.bot/getting-started/clinepass) or [OpenCode Go](https://opencode.ai/docs/go/), answers with interactive UI instead of only text, and does real work on a cloud VM of its own. You can watch that VM while you chat.

It's open source under the MIT license. You can see it at [trydex.dev](https://trydex.dev), then deploy your own copy to a Cloudflare account.

## Answers you can click

Ask Dex for something and the answer can come back as a card, a table, stat tiles, a chart or a form, streamed as the model writes it. The model writes these with a `render_ui` tool built on [OpenUI](https://www.openui.com/), and they keep working without another round trip to the model. Filters, tabs and toggles hold their own state, and a card opens the way you left it.

Cards can also show live Dex data, such as your chats, VMs, usage, workspace files, or a read-only look at a running VM's files, git status, ports and processes. The data refreshes while the card is on screen. Buttons can run app operations or open a chat, file or machine. Anything that deletes something or changes a setting shows Dex's own description of the action and waits for you to confirm.

<div class="project-media-gallery">
  <figure><img src="/images/projects/dex-chat-chart.webp" alt="A Dex chat titled Weekly signups chart, answering with two stat tiles, 875 total signups and Friday as the best day with 187, above a bar chart of signups from Monday to Sunday." width="1280" height="800" loading="lazy" /><figcaption>A chat answering with a stat card and a bar chart.</figcaption></figure>
  <figure><img src="/images/projects/dex-models.webp" alt="The Dex model menu, open on its OpenCode Go tab, listing GLM-5.3, GLM-5.3 Flash, GLM-5.2, Kimi K3 and Kimi K2.7 Code with badges for vision, context size and thinking." width="1280" height="800" loading="lazy" /><figcaption>One searchable menu for both model subscriptions.</figcaption></figure>
</div>

Each chat picks its model and thinking level from one menu, with nearly 50 models across both subscriptions. The list stays current on its own: each agent checks OpenCode Go's live model list and [models.dev](https://models.dev) at startup and every hour while it's in use. New models appear, retired ones drop out, and a chat on a retired model moves to your default. Replies stream live, and a run survives restarts, evictions and deploys.

Every reply has one activity row that folds its thinking, tool calls and notes. While it works, the row shows what's really happening, like "Running on the VM… npm test". When it's done it reads something like "Worked for 36s · 8 tools · 6 thoughts", and you can tap it to see every step.

## A computer for every chat

The first time a chat needs to do real work, it gets its own Ubuntu VM from [boat.dev](https://boat.dev), with root, Docker, Node, Bun, Python, Chrome and a desktop. Plain questions never start one. The model can run commands with streaming output, read and write files, open ports behind tokens, take screenshots, and use the desktop by clicking, typing, scrolling and dragging.

The Machine page shows the live desktop and every command as it happens. You can take control of the desktop, run your own commands, or stop the agent partway through and take over. While a VM is running, a floating button opens a picture-in-picture window of its desktop. You can drag it anywhere and resize it from a corner, so you can keep chatting while you watch.

<div class="project-media-gallery">
  <figure><img src="/images/projects/dex-machine.webp" alt="The Dex Machine page for a running small VM: the live desktop showing Hacker News in Chrome, a Take control button, and an activity log with Create small VM, a Chrome launch, a sleep command and a 1920×1080 screenshot." width="1280" height="800" loading="lazy" /><figcaption>The Machine page: the VM's desktop, live, beside every command the agent ran.</figcaption></figure>
  <figure><img src="/images/projects/dex-vm-preview.webp" alt="A Dex chat answering with a Q3 revenue chart, with a floating VM desktop window over it showing GitHub's Trending page." width="1280" height="800" loading="lazy" /><figcaption>The floating preview keeps the VM in view while you chat.</figcaption></figure>
</div>

The desktop streams three ways. The first is boat's own player, in Chrome. The second is [Selkies](https://github.com/selkies-project/selkies), H.264 over a WebSocket decoded with WebCodecs, which also plays on iPhone and iPad. The third is noVNC. The Worker relays the stream and adds the VM's cookie and password itself, so neither reaches the browser.

New VMs start from a prepared disk saved in your boat.dev account, so they're ready in seconds. A VM stops after five idle minutes and keeps its disk, and it's deleted along with its chat. Everyone connects their own boat.dev key.

## Skills, MCP servers and GitHub

Skills are instructions for particular tasks: a `SKILL.md` and the files beside it. Type `/` in any message to search your own skills and [skills.sh](https://skills.sh), and install one in place. Auto skills are listed for every chat, and the model loads one when a request matches.

MCP servers can be remote, with no auth, headers or OAuth, or local. Local servers are npm, PyPI or Docker packages that run on a dedicated MCP VM behind [supergateway](https://github.com/supercorp-ai/supergateway). Search covers [Smithery](https://smithery.ai) and the official MCP Registry. Before you add a server, Dex checks it: HTTPS, whether the publisher is verified and the endpoint is on their domain, a live MCP handshake with its tool list, and its GitHub repository's stars, license and last push.

<div class="project-media-gallery">
  <figure><img src="/images/projects/dex-skill-menu.webp" alt="The Dex composer with “/des” typed and a menu listing the installed frontend-design skill and skills.sh results with Install buttons." width="1280" height="800" loading="lazy" /><figcaption>Typing <code>/</code> finds installed skills and installs new ones from skills.sh.</figcaption></figure>
  <figure><img src="/images/projects/dex-mcp-search.webp" alt="Dex's MCP servers page searching “linear”, with the Linear server expanded to show checks for a secure endpoint, a verified listing, hosting, OAuth sign-in, source and 25 tools." width="1280" height="800" loading="lazy" /><figcaption>MCP search, with Dex's checks on a server before it's added.</figcaption></figure>
</div>

Projects bundle one or more repositories with a setup script, notes for the model, a starter prompt and a VM size. Starting a project chat boots its VM, signs in to GitHub, clones the repositories and runs the setup script before the model starts. Every VM signs git and the GitHub CLI in with your connection, so agents can push branches and open pull requests. Custom agents add a name, icon, instructions, model and MCP servers on top. Dex ships with a PR Author, PR Reviewer, Researcher, Data Analyst and Changelog Writer.

## Built for the phone, too

<figure>
  <img src="/images/projects/dex-everywhere.webp" alt="Two phones running Dex, one with the chat sidebar showing Snoozed and Settled groups and one with the weekly signups chart, beside the headline “Your agent. Everywhere you are.”" width="1280" height="800" loading="lazy" />
  <figcaption>Dex installed on a phone, from the README.</figcaption>
</figure>

Dex installs to a phone or tablet Home Screen and runs full screen. The composer stays above the keyboard, and a swipe from the left edge opens the sidebar. Push notifications cover replies, errors, scheduled prompts and snoozed chats coming back, and a chat open on any device stays quiet. On iPhone, which has no Vibration API, every tap plays the system haptic through a hidden switch input.

The chat list works like an inbox. Settle a chat when you're done for now, or snooze it until this evening or next week and it returns to the top with a notification. Messages sent while a chat is working wait in a queue, where you can edit, reorder or delete them, or steer one into the current run.

## Built to be driven

Every app capability is an operation in a single registry: chats, agents, projects, skills, MCP servers, VMs, schedules, the workspace, settings and usage. Chats can call those operations, so "start a chat per repo and have each open a PR" just works. External agents can connect to Dex over MCP with a scoped, expiring token. Every operation is validated, rate limited and logged. A check that runs before each deploy fails if a new operation isn't covered.

Tools run without approval, so text from a web page or an MCP server could try to steer a chat. Anything lasting or destructive waits for your Confirm. Chats can start other chats at most two levels deep. Saved secrets reach VMs as environment variables, and the model only ever sees their names, with values masked in any output it reads.

## How it's built

The browser runs a TanStack Start app with React 19. It talks to a Cloudflare Worker over HTTP for sign-in, and to a Durable Object per user over a WebSocket for RPC, synced state and the Pi event stream. The Durable Object holds the chats in its own SQLite, the ClinePass and OpenCode Go providers, a simulated shell over a persistent `/workspace`, the VM manager, the MCP client, skills, secrets, the queue, media in R2 and push. Server code uses Effect, and web search and fetch use Workers AI.

Pages render from the agent's synced state, so switching pages never waits on the network. The last state and the last eight chats you opened are kept on the device, so a launch shows them right away while a cold agent wakes up. The service worker serves the app shell from its last copy, so recent chats open even offline.

The web app is about 26,000 lines of TypeScript, in an npm workspace with room for native iOS and Android apps. I built it in three days, over 96 commits from 17 to 19 October 2026.

## Try it

Watch the tour on [trydex.dev](https://trydex.dev), or below. To run your own, the [repository](https://github.com/nearbycoder/dex) covers creating a GitHub OAuth app, adding secrets with Wrangler and deploying with `npm run deploy`.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots and the tour come from the Dex README and trydex.dev.
