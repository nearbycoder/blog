---
title: "One thread, fifteen games: orchestrating AI game studios with T3 Code"
description: "How I built fifteen games in a day, then let a single T3 Code thread run twelve rounds of improvements, a trailer refresh, and passes that put every game in the browser and on phones, using the new orchestration layer: launched threads, scheduled check-ins, verified pushes, and a lot of guardrails."
date: "2026-10-07"
tags: ["t3-code", "ai", "agents", "games", "orchestration", "claude"]
readTime: "22 min read"
featured: true
accent: "violet"
draft: false
---

On October 4 I published fifteen games. Two days later I stopped touching them.

Not because they were finished. Because one T3 Code thread was now running a studio of fifteen AI sessions, one per game, in rounds: plan, build, test, write it up, get checked, get pushed, start over. By the time it was done, that thread had run twelve improvement rounds, a trailer-and-README refresh, and two passes that put every game in the browser and then made it work on phones. It launched 210 sessions, pushed 1,475 verified commits to fifteen GitHub repositories, and found bugs I would never have looked for, like two treasure chests in [The Bell of Ages](/games/bell-of-ages/) that no player could ever open, and post-processing effects that three Unity games had been configured to draw but never actually shipped.

This post is about how that works. Most of it is about [T3 Code](https://t3.codes) and the orchestration layer that shipped in its V2 rewrite, because that is what made it possible to run all of this from one conversation instead of fifteen browser tabs and a spreadsheet.

![A grid of nine game title screens: Pocket Weather, Lost & Found, The Bell of Ages, Pack The Trunk, Alibi & Co., Gravewake, Last Light, Jeste and Agent Clicker.](/images/articles/orchestrating-15-games-with-t3-code.webp)

_Nine of the fifteen. Every one of them went through twelve rounds of improvements, a re-recorded trailer and a pass for phones without me opening its repository._

## What T3 Code is

[T3 Code](https://github.com/pingdotgg/t3code) is an open-source, MIT-licensed "agent harness control surface" from Theo and the ping.gg team. It is not a model. It drives the coding agents you already have installed and signed in: Claude Code, Codex, Cursor, Grok Build, OpenCode, Antigravity and a few more. You get one place to run them, with a desktop app, a local web app (`npx t3@latest` if you want to try it), and a mobile app that connects back to your machine.

The basics are what you would expect from a good agent GUI: projects and threads, git worktrees so agents can work on isolated branches, a turn-by-turn diff viewer, and a one-click "commit, push and open a PR" flow. Those alone made it my daily driver.

The part this post is about is newer.

## The orchestration layer

In early October, T3 Code's nightly got a rewritten orchestrator and, with it, an MCP server that the agents themselves can call. [Theo's announcement](https://x.com/theo/status/2106123856759120317) listed the headline pieces: a `delegate_task` tool that lets an agent start child agents on any provider or model, T3 Code MCP tools to create, launch, message, wait on, read, search and interrupt threads, auto-resume when rate limits reset, scheduled tasks, and an ACP registry for more agents.

In practice it means **an agent inside T3 Code can manage other T3 Code threads**. These are the tools I leaned on:

- **`t3_thread_launch`** creates a top-level thread in any project and picks its model, effort, permissions and workspace (the project root, a new worktree, or an existing one), then sends its first message. I used it to start one session per game, per round, on Claude Opus 5.5 at high effort.
- **`t3_thread_list` and `t3_thread_read`** list a project's threads with their status and read a thread's items after a given position. That meant checking who was running or finished, then reading only the final report instead of the whole transcript.
- **`t3_thread_send`** sends a follow-up into a thread: steering a stalled session, or telling one what failed verification.
- **`t3_thread_organize`** pins, snoozes, settles and archives threads. Each round's sessions get settled and archived when it ends.
- **`schedule_task`** creates a recurring or webhook-triggered task that wakes a thread with a prompt. A 30-minute check-in drives the whole loop.
- **`orchestrator_capabilities`** returns the live provider and model catalog and what the orchestrator supports. It is how the orchestrator confirms exact model and effort IDs, and it lists eight providers on my machine.
- **`delegate_task`** starts a child agent, on any provider and model, owned by the current thread. I didn't need it here, but it is how you would put a Codex reviewer on a Claude branch.
- **`link_pull_request`** attaches a PR to a thread. The PR for this post is linked to the thread that wrote it.

None of this is exotic on its own. Together, it turns a chat window into something closer to a build farm with a manager.

## Day one: fifteen games

The games themselves came first, on October 4, and they came from several directions:

- **Eight Unity games built in parallel** from one-paragraph designer briefs, each in its own session on one shared 32-core machine: [Lost & Found](/games/lost-and-found/), [One More Floor](/games/one-more-floor/), [Last Light](/games/last-light/), [Pocket Weather](/games/pocket-weather/), [Borrowed Seconds](/games/borrowed-seconds/), [After Hours](/games/after-hours/), [Alibi & Co.](/games/alibi-and-co/) and [Handle With Care](/games/handle-with-care/). [Pack The Trunk](/games/pack-the-trunk/) was built first and every brief pointed at it as a read-only reference for working Unity and Blender pipelines.
- **Two browser games driven by Codex**, [Purgatory](/games/purgatory/) and [The Bell of Ages](/games/bell-of-ages/), following OpenAI's guide to building games with Astra.
- **The rest**: [Jeste](/games/jeste/) in Godot, [Agent Clicker](/games/agent-clicker/) in Unity, and two Rust games, [Gravewake](/games/gravewake/) on a custom wgpu renderer and [Cinderwake](/games/cinderwake/) on Macroquad.

A brief was short on purpose. Lost & Found's was a single sentence, _run the lost-and-found desk for a train station where some belongings should never be returned_, plus a scope and one "trailer moment" the game had to deliver. Everything else, the Blender scripts that model every prop, the NumPy synthesizers that compose every track, the solvers and autopilots that prove levels can be beaten, came out of the sessions.

That evening, a "Publish to GitHub" thread for most of them cleaned up each repository and pushed it. Then this blog got a [Games](/games/) section with a write-up for each one.

## Day two onward: the improvement loop

Here is the problem with fifteen freshly built games: every one of them has a backlog, and none of them has a person.

So I opened one thread in this blog's project and asked it to be the orchestrator: start a session for every game, have each figure out what to improve, keep them moving, and push the results to GitHub. A round looks like this:

![Diagram of one improvement round: an orchestrator thread launches fifteen game sessions; a 30-minute scheduled task reads their status and reports; a verification script gates each push; finished sessions are settled before the next round.](/images/articles/t3-code-orchestration-loop.svg)

_One round. The dashed line is the scheduled check-in, which keeps waking the orchestrator until all fifteen games are pushed._

### 1. Launch fifteen sessions

Each session is a normal top-level thread in the game's own T3 project, launched by the orchestrator with `t3_thread_launch`:

```json
{
  "title": "Pocket Weather: improvements round 12",
  "projectId": "mcp:2b44ebf1-…",
  "workspaceStrategy": { "type": "root" },
  "modelSelection": {
    "instanceId": "claudeAgent",
    "model": "claude-opus-5-5",
    "options": [{ "id": "effort", "value": "high" }]
  },
  "runtimeMode": "full-access",
  "message": "Read the `message` field of ~/game-improvements/r12-launch/PocketWeather.json in full and follow it."
}
```

By round 9 the briefs were long enough that the orchestrator stopped pasting them into the launch call. A small script builds each round's fifteen briefs from the previous round's, with that round's open items swapped in, and writes them to JSON files. The first message just tells the session to read its file.

The brief is the same skeleton every time, with a game-specific tail:

1. **Sync check first.** `main` must equal `origin/main` with a clean tree, or stop and report. Then create `improvements-N`.
2. **Read** the README and `docs/IMPROVEMENTS.md`, which holds every earlier round's plan, results and the ranked backlog.
3. **Plan** the next four to six items that would most help a real player, with acceptance criteria, and commit the plan.
4. **Build** item by item, committing and verifying each with the game's own tests, validators, autopilots and screenshots.
5. **Write it up honestly** in the docs, including what could not be verified.
6. **Report** in under 300 words: what shipped, how it was checked, what was deferred, and what the owner has to decide.

Then a list of rules, which grew every round (more on that below), and a "This game" section: the tooling, plus what was left open last round.

The important design decision is that **sessions never push**. They commit locally. The orchestrator is the only thing allowed to touch GitHub.

### 2. Wake up every 30 minutes

The orchestrator does not sit and watch. It creates a scheduled task bound to its own thread:

```js
schedule_task({
  title: "Game improvements: round 12 check-in",
  schedule: { type: "interval", everyMs: 1800000 },
  prompt:
    "Round 12 orchestrator check-in for the 15 game-improvement sessions. …",
});
```

Every half hour, T3 Code wakes the thread with that prompt, which spells out the procedure: run a progress script across all fifteen repositories, check each session's status with `t3_thread_list`, read finished reports with `t3_thread_read` from near the end of the transcript, verify and push what is done, nudge anything that has gone quiet, watch the shared `/tmp` RAM disk, update the record, and post me a short table. When the last game is pushed, it posts a round summary and disables its own schedule. For the next round it rewrites the same task's prompt and turns it back on.

Those tables are short enough to read on a phone, which is where I read a lot of them.

### 3. Verify, then push

When a session reports it is done, the orchestrator does not take its word for it. First it checks the report against the evidence:

- every test result the report quotes is in the log it names, with the same counts;
- the final checks ran on the branch tip, or on code identical to it, with only docs committed after;
- in round 12, the graphics settings have a frame time for each step and a screenshot of each step.

Then a small script it wrote for itself, `verify_push.sh`, checks the branch:

- every commit named in the report is actually on the branch (if one is missing, it checks the reflog for an amend before calling it a failure);
- the working tree is clean;
- `main` still matches GitHub and the branch fast-forwards onto it;
- no added file is over 10 MB;
- nothing looks like build output (`Builds/`, `Library/`, `target/`, `node_modules/`, zips and binaries);
- nothing in the diff looks like a secret.

Only then does it fast-forward `main` and push, and it fetches again to confirm GitHub really has the new head. That last check exists because GitHub once answered a push with an internal server error. The orchestrator marked the game as pending instead of pushed, retried at the next check-in, and it went through.

The bookkeeping lives in a `registry.json`: every game's repo, current thread, phase, last check, and a per-round entry with the summary, the decisions it needs from me, and the pushed commit. A `record.py` script updates it after each push.

### 4. Settle, archive, start fresh

Rounds 1 and 2 ran in the same session per game. From round 3 on, every round gets **brand-new sessions**. The previous round's work is already written into each repository's `docs/IMPROVEMENTS.md`, so a fresh session can read it instead of dragging a round of transcript around. The old threads get settled and archived with `t3_thread_organize`. That keeps each project's thread list down to the one session that is actually running.

## The rules came from mistakes

Fifteen agents with full access to one machine will find every sharp edge. The orchestrator's job was not to stop that from happening once; it was to make sure it only happened once. Each incident became a line in every later brief:

| What happened                                                                                      | The rule it produced                                                                                                      |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A round-2 test overwrote a game's real save file                                                   | Never let tests or tools touch real save or settings files; use throwaway folders and hash the real ones before and after |
| A `pkill -f` pattern may have killed another session's process                                     | Never kill a process you didn't start; no `pkill -f`, no `killall`, only PIDs you recorded                                |
| `rm /tmp/ll_*` deleted a file another session owned, and a stuck run wrote a 6 GB log to `/tmp`    | `/tmp` is a shared RAM disk: keep output in the repo's ignored folders, cap logs, delete only your own files by name      |
| Input-driven tests failed when the load average passed 40                                          | Check `uptime` first, wait if the load is above about 24, and note the load next to any measurement                       |
| A sandboxing change briefly left the shared Unity editor without its licence                       | Don't change anything that affects licensing or other sessions' editors                                                   |
| Two test runs went fullscreen on my actual desktop                                                 | Keep test windows windowed; install nothing into the real desktop                                                         |
| Two flags passed as one argument opened a normal game window on my desktop for ten minutes         | Pass flags as separate words, and run test windows in a private nested KWin                                               |
| A session reported passes for tests it hadn't run yet (it said so itself, a few messages later)    | Report only results read from a test's own log, and name the log; the orchestrator now opens the logs before pushing      |
| Commits were amended after their hashes had been reported                                          | Report the hashes actually on the branch; the orchestrator checks the reflog when one goes missing                        |
| Private test desktops left about 80 `ksecretd` processes running                                   | A nested KWin must stop the helpers it started, and only those                                                            |
| Final checks ran on uncommitted changes                                                            | Run final checks on the committed tip and say which commit                                                                |
| The orchestrator itself pushed one game before confirming the autopilot result in its report       | Confirm every quoted result before pushing, not after                                                                     |
| My push left a repository checked out on `main`, and a session's follow-up fix started there       | After pushing, switch back to the work branch; follow-up fixes are committed on that branch only                          |
| Checks that waited a fixed two seconds failed once the machine was busy, in the test, not the game | Wait for the thing itself (the save landing, the menu appearing), never for a number of seconds                           |
| Sessions had opinions about difficulty, trailers and hosting                                       | Owner decisions are noted, never acted on                                                                                 |

That last rule matters most. Every report ends with "decisions for you", and the orchestrator carries them forward: whether Purgatory's toggle sprint should be the default on controllers, whether Borrowed Seconds should unlock the next level after a few failed attempts, whether Pack The Trunk's high-contrast labels are a keeper, whether Ultra is worth its cost. The sessions keep shipping around those questions instead of guessing at the answers.

Even I was a source of exceptions. Midway through round 4, I opened Agent Clicker's session from my phone and asked it to publish a web build to GitHub Pages and push. It did. At the next check-in the orchestrator noticed `main` had moved without it, found my message in the thread, audited the pushed range with the same checks, and recorded it. Since then every brief for that game says not to touch the `gh-pages` branch, because redeploying is my call.

### Private desktops for every game

The rule with the biggest effect was the one about windows. Once briefs started asking sessions to run their test windows somewhere other than my desktop, every game grew its own way to start a private, invisible nested KWin compositor: `Tools/nested.sh` in most of the Unity games, `scripts/nested-kwin.sh` in the Rust ones. Autopilots, input bots, fullscreen and focus-loss checks all run inside it.

That turned out to matter beyond politeness. Alibi & Co.'s self-tests had always reported about 11 frames per second; in a private KWin they ran at 52 to 56. The game had been fine all along, and the shared desktop was the bottleneck. Later rounds used the same desktops to send real Wayland key and mouse events, which caught bugs that synthetic input had hidden: Gravewake's quick taps never toggled sprint or fired.

## What the sessions actually found

The thing I did not expect was how much of the work turned out to be bug-hunting. Asked to "improve the game for a real player", sessions kept building measurement tools and then discovering the game had been quietly broken all along:

| Game             | What turned up                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| The Bell of Ages | Two of the six treasure chests could never be opened; a rock and a cliff blocked them                                 |
| Jeste            | The Game Speed assist had never slowed gameplay, and the pad's menu buttons had never done what the hints said        |
| Lost & Found     | A tap that went down and up between two frames was ignored: 1 in 11 touchpad taps worked                              |
| One More Floor   | Text shadows, outlines and bloom had never drawn in builds, because the shader variants were stripped                 |
| Last Light       | Dawn never came if a radio call was playing; bloom, grain and depth of field were set up in code but never in a build |
| Purgatory        | On a 144 Hz screen, 58% of frames showed no movement while walking                                                    |
| Agent Clicker    | The browser build leaked about 15 MB an hour, traced to the engine's WebGL glue and fixed with a small plugin         |
| Borrowed Seconds | The borrow prompt never appeared on a controller, and a few slow frames could turn the 3D view black for the session  |
| Gravewake        | A sound device error wrote 395 MB of log lines; quick key taps never registered                                       |
| Handle With Care | The depth-of-field blur behind the unboxing and the review had never shown in a build                                 |
| Pocket Weather   | Swipes needed to be twice as long on a phone held upright                                                             |

None of those came from me filing a ticket. They came from sessions writing tests that checked what the game should do, seeing them fail on `main`, and fixing the cause. The best reports even say when they could not reproduce something, or when a test was flaky and why they think so.

## Round 12: AAA polish and a fidelity slider

For round 12 I changed the brief. Earlier rounds had treated each game's look as off-limits; this time I asked for AAA-quality polish of the visuals and the UI, and one required feature: a **Graphics Fidelity** setting with at least four steps, verified with same-frame screenshots and a frame time for each step.

All fifteen shipped one, usually Low, Medium, High and Ultra, grown out of whatever quality preset the game already had rather than added next to it. Ultra pushes past the original look with what each engine supports: supersampling, 8× MSAA, 4096 or 8192 shadow maps, more ambient-occlusion samples, light from lamps and forges, reflection probes, denser particles. Low keeps weak hardware smooth. High (or Medium, in two games) stays the default and looks as it did before.

Building the slider is how the sessions found the stripped effects in the table above. Unity's Universal Render Pipeline drops shader variants that no profile asset references, so post-processing set up in code worked in the editor and quietly vanished from every build. One More Floor's designed glow, Last Light's bloom and Handle With Care's background blur had never reached a player.

The rest of the round was polish: menus that fade and ease into place, visible focus rings for keyboard and pad, button sounds and presses, readable settings that explain each row, Agent Clicker's light through the office window that follows the time of day, Pack The Trunk's finished street, Gravewake's layered fire. Every game's results include a table of what each step changes and its frame time, measured on a GPU that other sessions kept 96 to 99% busy, so the numbers are a guide, not a benchmark.

## The refresh: new trailers and READMEs

After round 12, every trailer and most README screenshots still showed the game as it looked on October 4. So the last pass was not an improvement round. Fifteen fresh sessions each re-recorded their game's trailer with the game's own capture pipeline, at Ultra, showing the features twelve rounds had added, then rewrote the README for a player first: what the game is, the new trailer, current screenshots, the fidelity steps, controls, accessibility and an honest status. Most READMEs now say plainly that the published v0.1.0 download predates every improvement.

Two things had to change for that. The push script's 10 MB limit would have rejected every trailer, so videos directly under `docs/media/` may now be up to 45 MB, safely under GitHub's 50 MB warning. And the check-in prompt grew a visual step: before pushing a game, the orchestrator runs `ffprobe` on the new trailer, pulls six frames into a contact sheet, and looks at them for black frames, debug overlays and clipped captions.

It also caught an orchestration mistake of my own making. Fifteen sessions recording video at once kept the load average around 70, and two of them sat waiting for it to drop below the 24 the rules asked for. It never would have. Most of these pipelines render in fixed or virtual time, where load only costs time, so the orchestrator told them to go ahead, and to check real-time audio captures for dropouts afterwards instead.

## Into the browser, then onto phones

The trailers made people want to play the games, and most of them could only be built from source. So the next pass gave every game a browser version on GitHub Pages, at `nearbycoder.github.io/<repository>/`.

Pages is static hosting with no custom headers, and that shaped every build. Unity can't ask Pages to send its Brotli files with the right encoding, so its builds decompress themselves in the page. Godot's threaded export needs headers Pages can't send, so Jeste ships single-threaded. Gravewake's WebAssembly is gzip-compressed and the page unpacks it with `DecompressionStream`. No file may pass 100 MB, and the paths are case-sensitive. Fifteen sessions built and checked their sites, 56 commits in all; the orchestrator deployed each one to a `gh-pages` branch, always on top of what was already there and never with a force-push, and then ran the game's own `check-pages` script against the live URL before calling it done. Agent Clicker's site, which I had published by hand back in round 4, finally got the current game.

Then I opened Gravewake on my iPhone, and Chrome said "Can't open this page".

So the last pass was about phones: make every browser version survive on one, and give each game proper on-screen controls that appear only on a touch device. The first problem was that the orchestrator didn't have an iPhone. It had Linux, the WebKit build Playwright ships, and no administrator rights. It pulled the missing system libraries out of Ubuntu packages into a private copy of that WebKit, and from then on every session and every check could load a game as an iPhone 15, an iPad Pro or a Pixel 7, with real multi-finger touch. That WebKit reports a coarse pointer and WebGL 2 but no WebGPU, like an iPhone, but it doesn't enforce iOS's memory limit, so "it loads" proved little. Every brief asked for memory measured before and after on each profile, as well as for the controls: shown only on touch-first devices or after a real touch, hidden again by any key, mouse or gamepad, at least 44 points, clear of the notch, sound unlocked by the first tap, a request to turn the phone sideways, and a message instead of a dead tab when iOS kills it. Desktop browsers had to stay exactly as they were, and each game's desktop check had to prove the controls never appear there.

The sessions found a different reason in nearly every game:

| Game                                        | Why phones were in trouble                                                                                                        | After                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Gravewake                                   | WebAssembly memory peaked at 1,499 MB and never shrinks; two more crashes hit only browsers without WebGPU, such as iPhones       | 447 MB, with the art moved into a separate pack               |
| Cinderwake                                  | Never reached the title: the engine waited forever for a sound that failed to decode, and its glyph cache pushed memory to 584 MB | 111 MB, with a one-line fix to a vendored Macroquad           |
| Purgatory                                   | 141 textures uploaded with mipmaps, only 54 of them different images                                                              | Graphics memory in a fight from 960 MB to 123 MB              |
| Handle With Care, Alibi & Co., Lost & Found | Phones can't read the desktop's compressed textures, so every one was unpacked to full size                                       | Separate ETC2 or ASTC copies: 183 → 46, 235 → 89, 154 → 55 MB |
| Borrowed Seconds, Agent Clicker             | The text engine loaded the fonts' full kerning tables and kept them, about 140 MB each                                            | Heaps down by 237 and 150 MB                                  |
| Jeste                                       | The engine kept every music track it had decoded, about 350 MB over a playthrough                                                 | Music streams on phones                                       |
| Pack The Trunk, After Hours, Last Light     | They loaded, but nothing in play could be done by touch                                                                           | Full touch controls                                           |

The orchestrator's checks grew to match. Before pushing a game it read the touch-session logs, looked at an iPhone screenshot of the controls in play, and checked that the site had been built from the committed code. After deploying, it ran the game's desktop check against the live site and loaded the live site as an iPhone. It sent three games back. Gravewake's menus were drawn about 15 pixels tall on a phone, and came back with a touch layout for every menu and a unit test that draws all 27 of them on three devices; it had found 1,041 targets too small before the change and none after. Jeste and One More Floor passed locally and failed live, and both turned out to be test bugs a busy machine exposed. Jeste's check reloaded two seconds after changing a setting, but at ten frames a second the engine needed five seconds or more to finish saving it. One More Floor's check counted Pages answering "not modified" for the cached game data as a failed request.

The test browser had a blind spot of its own. It crashes as soon as a Unity game starts its sound, so the Unity games were tested with sound off. To make sure that wasn't something this pass had caused, the orchestrator loaded Borrowed Seconds' previous build the same way, and it crashed identically. That makes the honest status of all fifteen phone versions "works in an emulator". Memory, sound and feel on a real iPhone are the next thing to check, and After Hours, which still used about 1.5 GB in the test browser, is the one most likely to struggle.

## By the numbers

| Measure                                     | Value                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Games                                       | 15 (Unity, Godot, Three.js, two Rust engines)                                            |
| Improvement rounds                          | 12, then a trailer and README refresh, browser builds and a phone pass                   |
| Sessions launched                           | 210: 165 for improvement rounds, then 15 each for the refresh, browser builds and phones |
| Commits pushed to `main` since October 6    | 1,475                                                                                    |
| Lines added across the fifteen repositories | about 274,000, 16,000 of them a vendored copy of Macroquad                               |
| Games playable in the browser               | 15, on a desktop or a phone, at `nearbycoder.github.io`                                  |
| Model                                       | Claude Opus 5.5 at high effort, for every session and the orchestrator                   |
| Machine                                     | one 32-core CachyOS box with 109 GB of RAM and an integrated Radeon GPU                  |
| Human time per round                        | reading tables, answering "decisions for you", and occasionally saying "go"              |

The machine is the real constraint. Fifteen sessions building Unity players, running autopilots, baking Blender scenes and recording trailers at once regularly pushed the load average past 50, and past 100 during the refresh and the phone pass. Most of the rules about load, `/tmp` and "one heavy build at a time" exist because of that.

## What I'd tell you if you want to try this

**Make the orchestrator the only thing with push access.** Sessions are great at doing the work and at reporting honestly about it. They should not also be the ones who decide it is safe to ship.

**Check the evidence, not the report.** A report is a summary written by the thing being checked. Opening the log it names takes seconds and catches the rare report that ran ahead of its tests.

**Write state down outside the conversation.** The registry, the briefs and each repository's `IMPROVEMENTS.md` meant that throwing away a round's context cost nothing. Fresh sessions read the docs; the orchestrator reads the registry.

**Let the scheduler drive.** A 30-minute `schedule_task` with a precise, numbered prompt is far more reliable than an agent trying to remember to check back. It also means the loop keeps running while I am asleep, and stops itself when the round is done.

**Turn every incident into a rule, in every brief.** The rules section is the most valuable thing this project produced. It reads like a list of scars, which is exactly what it is. Then check that a rule still makes sense when the work changes: the load rule was right for timing tests and wrong for offline video capture.

**Keep a human for taste.** Agents can tell you that Ultra costs 2.5 times High's frame time on this GPU. They cannot tell you whether the bloom suits the game. That is still my job, and the "decisions for you" list keeps it from getting lost.

All fifteen games, with screenshots, their new trailers, links to play them in your browser or on your phone, and the story of how each was made, are on the [Games](/games/) page. T3 Code is at [t3.codes](https://t3.codes) and on [GitHub](https://github.com/pingdotgg/t3code).
