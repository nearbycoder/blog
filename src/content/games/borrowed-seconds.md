---
title: "Borrowed Seconds"
summary: "A deterministic puzzle game where you freeze obstacles by borrowing time from your future self, across 35 single-screen levels in seven chapters that an exhaustive solver proves solvable."
role: "Creator"
genre: "Puzzle"
platforms: ["Windows", "macOS", "Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:32:44Z"
stack: ["Unity 6", "C#", ".NET", "Blender", "Python", "NumPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/BorrowedSeconds"
download: "https://github.com/nearbycoder/BorrowedSeconds/releases/latest"
featured: false
accent: "yellow"
draft: false
image: "/images/games/borrowed-seconds-exactly-now.webp"
imageAlt: "The player's debt comes due on a gold dial and they freeze into crystal while a slider approaches."
imageCaption: "Paying the debt on a gold dial, exactly on time. From the Borrowed Seconds README."
demoVideos:
  - src: "/videos/games/borrowed-seconds-trailer.mp4"
    title: "Borrowed Seconds feature trailer"
    caption: "The 1:42 feature trailer, re-recorded at Graphics fidelity Ultra after twelve rounds of improvements: borrowing and the debt, every obstacle and device, the thaw forecast, the clue, the best-run ghost, the Low-to-Ultra graphics steps, Settings and chapter VII. It uses the game's procedural music and sound effects with on-screen captions; there is no narration. Recorded frame by frame from the release build playing solver replays. Re-encoded here at 540p and 30 fps from the 60 fps original."
    poster: "/images/games/borrowed-seconds-trailer-poster.webp"
    original: "https://github.com/nearbycoder/BorrowedSeconds/blob/main/docs/media/trailer.mp4"
---

Freeze any moving obstacle for three seconds. The catch is that the time is **borrowed**. A few seconds later the debt comes due and _you_ freeze for three seconds, wherever you happen to be standing.

While you're frozen, nothing can hurt you. Sliders, laser beams, and rotor arms pass straight through. But if you thaw inside a hazard, you **default**, and time rewinds. The best solutions turn the debt into the plan: you pay it back standing on a gold dial, or exactly as a laser sweeps over you.

## One verb, two sides

Borrowing turns a sliding block, a laser, or a rotor arm into crystal for three seconds, and a frozen obstacle is a wall. Repaying freezes you, and a frozen player is untouchable. Both halves are useful.

The game is honest about the future. Aim at something and red ghosts show where every hazard will be at the moment you'd thaw, along with a safe or lethal ring under your feet. They're calculated by running the real simulation forward, so they're never wrong, and the verdict never rests on colour alone: a lethal ring carries an X and the aim tag says SAFE or LETHAL. Each level waits at 0.00 until you first move, so you can read the board before anything moves. Hold Focus to slow time while you line up a shot, or hold rewind to scrub back through everything that happened. A default names what caught you and marks it in red.

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-aim-and-focus.webp" alt="Aiming at a slider while holding Focus: the aim tag reads freeze 3.0s, repay in 5.0s, and red ghosts forecast the hazards." width="1280" height="720" loading="lazy" /><figcaption>Ghosts forecast the moment you'd thaw.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-in-the-beams.webp" alt="Frozen on a gold dial at the crossing of two laser beams, which pass harmlessly through." width="1280" height="720" loading="lazy" /><figcaption>Frozen, and untouchable.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-crystal-bar.webp" alt="A laser frozen mid-shot becomes a cyan crystal bar that blocks the other beam." width="1280" height="720" loading="lazy" /><figcaption>A frozen laser becomes a crystal bar.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-defaulted.webp" alt="Defaulted: the player thawed inside a slider, the banner names it and time rewinds." width="1280" height="720" loading="lazy" /><figcaption>Defaulting names what caught you and rewinds.</figcaption></figure>
</div>

Plates hold a gate open while anything rests on them, including a block you froze there, and each plate wears the same colour and dots as what it controls. Gold dials latch after three seconds of continuous weight from you, frozen or not, or from a frozen block. In later chapters, crystal pushes back: a frozen block pens another slider in, rotor arms swing back off crystal, and a gate you shut blocks light.

## Thirty-five levels, proven

The seven chapters have names borrowed from finance: Principal, Interest, Momentum, Compound, Leverage, Escrow, and Overdraft, where the debt falls due 1.5 to 2.5 seconds after you borrow. Every level is solvable, and that's been proven. For eighteen of them, the solver also proves you _need the debt_: even with unlimited, debt-free borrowing they can't be solved, so your own freeze has to be part of the answer. Every level keeps a timing margin of at least ±150 ms around its intended solution. Par times are the solver's optimal time, which sets the medals.

On a level you've settled, a medal coin by the clock flips from gold to silver to bronze the moment a better medal slips away, and a violet ghost replays your best run in step with the clock. Help comes only if you ask: **Show a clue** marks the obstacle the solver's route freezes first and the tile to stand on when the debt falls due, and **Watch solution** plays the solver's route at par.

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-clue.webp" alt="Show a clue on 2-4 Crossfire: FREEZE FIRST over the laser, DEBT HERE on the dial, and the tip spelling it out." width="1280" height="720" loading="lazy" /><figcaption>A clue, if you ask for one.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-best-ghost.webp" alt="A violet ghost of the best run walks ahead on 1-1 First Loan, its frozen block shown as violet crystal, with the gold medal coin by the clock." width="1280" height="720" loading="lazy" /><figcaption>Racing your best run.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-the-ledger.webp" alt="The Ledger level select with medal coins, best times, and sealed levels." width="1280" height="720" loading="lazy" /><figcaption>The Ledger level select.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-settlement.webp" alt="Settlement, the chapter IV finale: two loans, two dials, a slider, a laser, and a rotor." width="1280" height="720" loading="lazy" /><figcaption>Settlement, the chapter IV finale.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-payroll.webp" alt="Payroll, the chapter VII finale: frozen on the second of three dials as a laser passes through, with two-second terms." width="1280" height="720" loading="lazy" /><figcaption>Payroll, the chapter VII finale.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-settled.webp" alt="Level complete: Settled, with a gold Time Thief medal, the medal times and a new best." width="1280" height="720" loading="lazy" /><figcaption>Settled, with a new best.</figcaption></figure>
</div>

## Settings and graphics fidelity

Every row in Settings says what it does in a line under the list. There's a **game speed** of 100, 85, 70 or 50% (times and medals count game ticks, so they mean the same at any speed), a HUD size up to 150%, Focus as a toggle, Reduce flashing, screen shake, controller vibration, mute in the background, and a render resolution for weaker GPUs. Every keyboard action can be rebound, menus work with keyboard, mouse or gamepad, and the key hints use PlayStation or Switch names on those controllers.

**Graphics fidelity** has four steps. High is the default and the original look; Ultra adds 8× MSAA, an 8192 shadow map, deeper ambient occlusion, point lights from the glowing pieces, more particles and a sharper pocket watch. The board itself is finished with brass trim around every outer edge and plinth sides that glow faintly before fading into the void. On the shared integrated Radeon it was measured on, the median frame at 2560×1440 rose from 11.4 ms on Low to 15.0 ms on Ultra.

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-settings.webp" alt="Settings over a paused level, Graphics fidelity selected with its help line under the list." width="1280" height="720" loading="lazy" /><figcaption>Settings, with a help line for every row.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-title.webp" alt="Title screen: the pocket-watch emblem and the Borrowed Seconds logo over a live replay." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-chapter-card.webp" alt="Chapter VII card: Overdraft, the chapter of short terms." width="1280" height="720" loading="lazy" /><figcaption>A chapter card.</figcaption></figure>
</div>

## What it's built with

The rules are pure C# with no Unity dependency. `Simulation.Step` advances exactly one 20 Hz tick using only integers, with no allocation and no unordered iteration. The game, the ghost previews, a .NET 8 console solver, and the unit tests all compile the same files, and the tests check that .NET and Unity's Mono runtime agree tick for tick.

The solver is a breadth-first search over packed 256-bit states at the player's decision points, with a compact hash table to save memory. It finds the optimal par, then searches again under relaxed rules to prove a level can't be solved _without borrowing_, or _with the debt forgiven_. The hardest level searches up to 150 million states. The clue and Watch solution come straight from its route. Rewind is cheap by comparison: every tick's state is kept in a pooled history, so rewinding just scrubs backwards through it.

**Unity 6** and URP draw the board, with every UI panel rendered by one procedural shader: a chamfered brass rim, enamel gradient, glow, and a clock-hand reveal.

## How it was made

Borrowed Seconds was one of eight games built in parallel from short designer briefs, each by its own AI coding-agent session on one shared machine. The brief asked for twenty single-screen levels, one borrowing ability, and three obstacle types, and required a fully deterministic simulation and a solver that proves both solvability and that the "debt as a tool" trick is needed where it's designed to be. The launch build had thirty levels.

There are no stock assets. Every model is generated by Blender scripts, and every sound effect and the four 16-bar music loops are synthesized with NumPy, with reverb tails wrapped so the loops are seamless.

After launch, the game went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds added chapter VII, the start hold, the clue, Watch solution, medal pace, the best-run ghost, rebinding, game speed and the fidelity slider. They found that the borrow prompt never appeared on a controller, and that a few slow frames could turn the 3D view black for the rest of a session. The release build now autoplays all 35 levels at exactly par, 421 EditMode tests replay every solution, and behaviour checks and an input bot run inside a private, invisible KWin desktop.

The trailer is a shot list played by the release build using solver replays, captured frame-locked at 60 fps on Ultra, with the soundtrack rebuilt offline from the game's audio event log.

## Play it

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/BorrowedSeconds/releases/latest) for Linux. That release is the October 4 launch build, with 30 levels in six chapters and none of the improvements above; to play the current game, build it from source with Unity 6000.6.2f1. It hasn't been playtested by people yet, so some levels may be harder than they look, and chapters VIII to XII are named but not shipped.

[Browse the source on GitHub](https://github.com/nearbycoder/BorrowedSeconds). GitHub records the repository's creation on **October 4, 2026**.
