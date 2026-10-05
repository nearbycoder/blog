---
title: "Agent Clicker"
summary: "An idle clicker about a developer who quietly hands their whole job to AI agents, played on a computer inside a 3D office that fills up as the numbers climb toward a centillion."
role: "Creator"
genre: "Idle clicker"
platforms: ["Linux", "macOS"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:20:58Z"
stack: ["Unity 6", "C#", "Blender", "Python", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/AgentClicker"
download: "https://github.com/nearbycoder/AgentClicker/releases/latest"
featured: false
accent: "cyan"
draft: false
image: "/images/games/agent-clicker-software-factory.webp"
imageAlt: "100% AUTOMATED: Sam reclines with their feet on the desk."
imageCaption: "The Software Factory: fully automated, feet on the desk. From the Agent Clicker README."
demoVideos:
  - src: "/videos/games/agent-clicker-trailer.mp4"
    title: "Agent Clicker trailer"
    caption: "The 1:41 trailer, with the game's synthesized lo-fi music and sound effects, captions, and title cards; there is no narration. A scripted director clicks real UI with an on-screen cursor while the game records itself at a fixed 30 fps. Re-encoded here at 540p."
    poster: "/images/games/agent-clicker-trailer-poster.webp"
    original: "https://github.com/nearbycoder/AgentClicker/blob/main/docs/media/trailer.mp4"
---

Synergex Corp's CEO has read an article about AI. The memo goes out on Monday morning: Synergex is now **AI-First**, and every engineer is expected to deliver **10x output** by the end of the quarter.

You are Sam, a developer at a very ordinary desk. Every morning you clock in, sit down, and log in to **CorpOS**, a whole game running on the monitor in front of you. Ship code by hand, earn compute credits, and hire AI agents from a marketplace of entirely fictional frontier labs: Hallucin8 Labs ("Move fast and make things up"), Paperclip Dynamics, Deep Pocket AI, OmniSapient, and more. Agents write the code, then review the code, and eventually manage the agents that write the code.

The goal is the **Software Factory**: every agent wired into one pipeline, 100% automated, and Sam leaning back with their feet on the desk.

## A game inside a game

Click **SHIP CODE** to earn credits, and spend them in the ModelMart on agents that earn every second and on upgrades that multiply them. Steady clicking builds **Focus**, worth up to ×3, which drains as soon as you stop. CorpOS is a full 2D interface living on the monitor's screen mesh in the 3D office; it stays live from the office view, and the camera dollies in until it fills the screen.

A work day runs from 9 to 5, five real minutes by default. At 5 PM a performance review compares the day against your quota, and your agents work the night shift.

<div class="project-media-gallery">
  <figure><img src="/images/games/agent-clicker-ship-code.webp" alt="Clicking SHIP CODE with Focus at x3 and floating credit numbers." width="1280" height="720" loading="lazy" /><figcaption>Shipping code at ×3 Focus.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-corpos-late-game.webp" alt="The CorpOS desktop late in the game, with the agent fleet and the ModelMart." width="1280" height="720" loading="lazy" /><figcaption>CorpOS late in the game.</figcaption></figure>
</div>

## Your desk is the upgrade screen

Eighteen office gadgets, from a company mug and a rubber duck to a lava lamp, an espresso machine, a homelab server rack, a monitor wall, and a "SHIP IT" neon sign, pop into the 3D office with a camera showcase, and each has a real bonus. Promotions change the room: the cubicle walls disappear, and a rug, bookshelf, sofa, and trophies arrive.

The desk phone rings. It might be your manager asking for a demo, Gary from IT asking why your Chat Assistant reset the CEO's password to "hunter2", a recruiter, your mom, or eventually your own agents escalating tickets to you. Every reply has consequences. **Model drops** are the game's golden cookie: catch the card before it vanishes for a burst of production. **API outages** halve production until you click the banner enough times to fail over.

<div class="project-media-gallery">
  <figure><img src="/images/games/agent-clicker-gadget-showcase.webp" alt="Sam celebrates as a second monitor appears on the desk." width="1280" height="720" loading="lazy" /><figcaption>A new gadget arrives.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-phone-call.webp" alt="Sam on the phone with Gary from IT, choosing a reply." width="1280" height="720" loading="lazy" /><figcaption>Gary from IT is calling.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-office-late-game.webp" alt="The office late in the game: monitor wall, neon sign, server rack, and mini fridge." width="1280" height="720" loading="lazy" /><figcaption>The office, much later.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-board-room.webp" alt="The Board Room, where Stock Options buy permanent perks." width="1280" height="720" loading="lazy" /><figcaption>The Board Room.</figcaption></figure>
</div>

The story is told in 26 emails across six chapters, from The Mandate to The Factory, and the epilogue changes depending on how you treated people. Building the Factory ends the story but not the game. Frontier agents follow, including a Digital Twin of Sam, an AGI Intern, a Dyson Swarm, and The Singularity. Reorgs roll the Factory out to new divisions for Stock Options, there's a Board Room of permanent perks, there are 512 trophies, and the numbers climb all the way to a centillion.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/agent-clicker-title.webp" alt="The Agent Clicker title screen." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-performance-review.webp" alt="The end-of-day performance review: QUOTA MET." width="1280" height="720" loading="lazy" /><figcaption>Performance review.</figcaption></figure>
  <figure><img src="/images/games/agent-clicker-frontier-agents.webp" alt="Frontier agents, unlocked after the Software Factory." width="1280" height="720" loading="lazy" /><figcaption>Frontier agents.</figcaption></figure>
</div>

## What it's built with

The economy is a plain C# model with no Unity dependencies, covered by 96 EditMode tests. A `BalanceSimulator` plays the game greedily, and the test suite fails if the bot reaches the first Factory in under 1.5 or over 5 hours. A person should take about three. All money math saturates at the largest double-precision number, so huge values can't turn into NaN or Infinity in a save.

**Unity 6** and URP render the office. The UI, including CorpOS, the store, the inbox, and calls, is built at runtime with uGUI and TextMesh Pro. Because an idle game spends a lot of time in the background, performance got real attention: nested canvases so a ticking number only rebuilds its own batch, pooled floating numbers, prewarmed font atlases, and a 15 fps cap when the window is unfocused. A late-game office runs at about 1.7 ms of main-thread CPU at 60 fps while clicking fifteen times a second.

## How it was made

Everything is generated from code. Blender scripts build all 46 models from primitives, and material names carry meaning: `EMIT_*` glows, `GLASS_*` is transparent, `Screen` marks a monitor. An import pipeline turns them into URP materials. Sam is a rigged employee made of rigid parts, with ten animations, such as typing, sipping, facepalming, and feet-up, baked on one timeline and split into clips on import. Typing speed follows your click rate.

The game ships with zero audio files. Key clicks, chimes, the phone ring, the office hum, and a 76 BPM lo-fi loop are synthesized on a worker thread when the game starts. The trailer is played by a scripted director that clicks real UI through Input System events while the game records itself. It was developed with [Claude Code](https://claude.com/claude-code).

## Play it

Version 0.1.0 is complete and playable from the first click to the endless game. [Download it from GitHub releases](https://github.com/nearbycoder/AgentClicker/releases/latest). The Linux build is tested on CachyOS; the macOS universal build is experimental, unsigned, and hasn't been run on a Mac. It's mouse and keyboard only. Every lab, AI model, company, and person in the game is fictional.

[Browse the source on GitHub](https://github.com/nearbycoder/AgentClicker). GitHub records the repository's creation on **October 4, 2026**.
