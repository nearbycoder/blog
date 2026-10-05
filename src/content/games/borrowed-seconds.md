---
title: "Borrowed Seconds"
summary: "A deterministic puzzle game where you freeze obstacles by borrowing time from your future self, across 30 single-screen levels that an exhaustive solver proves solvable."
role: "Creator"
genre: "Puzzle"
platforms: ["Linux"]
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
    caption: "The 1:36 feature trailer covering every mechanic, obstacle, and device, with the game's procedural music and sound effects and on-screen captions; there is no narration. Recorded frame by frame from the release build playing solver replays. Re-encoded here at 540p and 30 fps from the 60 fps original."
    poster: "/images/games/borrowed-seconds-trailer-poster.webp"
    original: "https://github.com/nearbycoder/BorrowedSeconds/blob/main/docs/media/trailer.mp4"
---

Freeze any moving obstacle for three seconds. The catch is that the time is **borrowed**. A few seconds later the debt comes due and _you_ freeze for three seconds, wherever you happen to be standing.

While you're frozen, nothing can hurt you. Sliders, laser beams, and rotor arms pass straight through. But if you thaw inside a hazard, you **default**, and time rewinds. The best solutions turn the debt into the plan: you pay it back standing on a gold dial, or exactly as a laser sweeps over you.

## One verb, two sides

Borrowing turns a sliding block, a laser, or a rotor arm into crystal for three seconds, and a frozen obstacle is a wall. Repaying freezes you, and a frozen player is untouchable. Both halves are useful.

The game is honest about the future. Aim at something and red ghosts show where every hazard will be at the moment you'd thaw, along with a safe or lethal ring under your feet. They're calculated by running the real simulation forward, so they're never wrong. Hold Focus to slow time to a crawl while you line up a shot, or hold rewind to scrub back through everything that happened.

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-aim-and-focus.webp" alt="Aiming at a slider while holding Focus: the aim tag reads freeze 3.0s, repay in 5.0s, and red ghosts forecast the hazards." width="1280" height="720" loading="lazy" /><figcaption>Ghosts forecast the moment you'd thaw.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-in-the-beams.webp" alt="Frozen on a gold dial at the crossing of two laser beams, which pass harmlessly through." width="1280" height="720" loading="lazy" /><figcaption>Frozen, and untouchable.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-crystal-bar.webp" alt="A laser frozen mid-shot becomes a cyan crystal bar that blocks the other beam." width="1280" height="720" loading="lazy" /><figcaption>A frozen laser becomes a crystal bar.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-defaulted.webp" alt="Defaulted: the player thawed inside a slider and time rewinds." width="1280" height="720" loading="lazy" /><figcaption>Defaulting rewinds you two seconds.</figcaption></figure>
</div>

Plates hold a gate open while anything rests on them, including a block you froze there. Gold dials latch after three seconds of continuous weight from you, frozen or not, or from a frozen block. In later chapters, crystal pushes back: a frozen block pens another slider in, rotor arms swing back off crystal, and a gate you shut blocks light.

## Thirty levels, proven

The six chapters have names borrowed from finance: Principal, Interest, Momentum, Compound, Leverage, and Escrow. Every level is solvable, and that's been proven. For thirteen of them, the solver also proves you _need the debt_: even with unlimited, debt-free borrowing they can't be solved, so your own freeze has to be part of the answer. Every level keeps a timing margin of at least ±150 ms around its intended solution. Par times are the solver's optimal time, which sets the medals.

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-the-ledger.webp" alt="The Ledger level select with medal coins, best times, and sealed levels." width="1280" height="720" loading="lazy" /><figcaption>The Ledger level select.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-settlement.webp" alt="Settlement, the chapter IV finale: two loans, two dials, a slider, a laser, and a rotor." width="1280" height="720" loading="lazy" /><figcaption>Settlement, the chapter IV finale.</figcaption></figure>
</div>

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/borrowed-seconds-title.webp" alt="Title screen: the pocket-watch emblem and the Borrowed Seconds logo over a live replay." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-chapter-card.webp" alt="Chapter VI card: Escrow, leave something behind to hold the door." width="1280" height="720" loading="lazy" /><figcaption>A chapter card.</figcaption></figure>
  <figure><img src="/images/games/borrowed-seconds-settled.webp" alt="Level complete: Settled, on par, with a gold Time Thief medal." width="1280" height="720" loading="lazy" /><figcaption>Settled on par.</figcaption></figure>
</div>

## What it's built with

The rules are pure C# with no Unity dependency. `Simulation.Step` advances exactly one 20 Hz tick using only integers, with no allocation and no unordered iteration. The game, the ghost previews, a .NET 8 console solver, and the unit tests all compile the same files, and the tests check that .NET and Unity's Mono runtime agree tick for tick.

The solver is a breadth-first search over packed 256-bit states at the player's decision points, with a compact hash table to save memory. It finds the optimal par, then searches again under relaxed rules to prove a level can't be solved _without borrowing_, or _with the debt forgiven_. The hardest level searches up to 150 million states. Rewind is cheap by comparison: every tick's state is kept in a pooled history, so rewinding just scrubs backwards through it.

**Unity 6** and URP draw the board, with every UI panel rendered by one procedural shader: a chamfered brass rim, enamel gradient, glow, and a clock-hand reveal.

## How it was made

Borrowed Seconds was one of eight games built in parallel from short designer briefs, each by its own AI coding-agent session on one shared machine. The brief asked for twenty single-screen levels, one borrowing ability, and three obstacle types, and required a fully deterministic simulation and a solver that proves both solvability and that the "debt as a tool" trick is needed where it's designed to be. The session delivered thirty levels. Its commit history spans about nine and a half hours on October 4, 2026.

There are no stock assets. Every model is generated by Blender scripts, and every sound effect and the four 16-bar music loops are synthesized with NumPy, with reverb tails wrapped so the loops are seamless. The trailer is a shot list played by the release build using solver replays, captured frame-locked at 60 fps, with the soundtrack rebuilt offline from the game's audio event log.

## Play it

Version 0.1.0 is complete and playable from start to finish, and the release build autoplays all 30 levels from the solver's replays without a failure. [Download the Linux build](https://github.com/nearbycoder/BorrowedSeconds/releases/latest) and run `./BorrowedSeconds.x86_64`. It hasn't been playtested by people yet, so some levels may be harder than they look. Chapters VII–XII are planned but not designed.

[Browse the source on GitHub](https://github.com/nearbycoder/BorrowedSeconds). GitHub records the repository's creation on **October 4, 2026**.
