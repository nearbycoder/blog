---
title: "Jeste"
summary: "A pixel-art precision platformer about a young jester climbing a mountain that laughs back, with nine chapters, an eight-way dash, and every room proven beatable by an automated solver."
role: "Creator"
genre: "Precision platformer"
platforms: ["Linux"]
engine: "Godot 4.7"
year: "2026"
createdAt: "2026-10-04"
stack: ["Godot", "GDScript", "Python", "NumPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/Jeste"
download: "https://github.com/nearbycoder/Jeste/releases/latest"
featured: false
accent: "rose"
draft: false
image: "/images/games/jeste-dash.webp"
imageAlt: "Mira chains a dash through three green dash gems over a spike pit in Lantern Town."
imageCaption: "Lantern Town: chaining dashes through dash gems, from the Jeste README."
demoVideos:
  - src: "/videos/games/jeste-trailer.mp4"
    title: "Jeste feature trailer"
    caption: "The 1:48 feature trailer, with the game's synthesized music and sound effects and on-screen captions. There is no narration; character voices are wordless blips. Every frame is the real game, played by the project's automated solver and rendered with Godot's Movie Maker. Re-encoded here at 540p."
    poster: "/images/games/jeste-trailer-poster.webp"
    original: "https://github.com/nearbycoder/Jeste/blob/main/docs/media/jeste_trailer.mp4"
---

Mira Vale grew up as a jester in a travelling troupe, trained by her grandmother Nana Odile. They always planned to climb Mount Jeste together, the mountain whose wind is said to laugh. Nana died last winter, Mira never cried, and one night she froze on stage. So she climbs Jeste alone. The old bell-ringer at the bottom warns her that the mountain shows you whatever you hide behind your smile.

Jeste is a tight, forgiving climb in the tradition of modern precision platformers. Deaths cost about a second, the hardest challenges are optional, and an assist mode is always one menu away.

## Run, jump, climb, dash

Mira can jump, wall-jump, cling and climb on limited stamina, and dash once in the air in any of eight directions. Her jester cap shows whether the dash is ready, spent, or doubled. Underneath those basics sit the techniques experienced players will look for: supers, hypers, wavedashes, wall-bounces, dash corner correction, and momentum boosts from moving platforms.

The feel comes from small, deliberate details: coyote time, jump buffering, variable jump height, half gravity at the top of a jump, squash and stretch, afterimages, freeze frames, directional screen shake, and a cap with two physics-simulated tails and bells.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-curtains.webp" alt="Mira glides through red velvet curtains on the Hollow Stage, a dream theatre inside the mountain." width="1280" height="720" loading="lazy" /><figcaption>The Hollow Stage: curtains you dash through.</figcaption></figure>
  <figure><img src="/images/games/jeste-chase.webp" alt="The Grin, Mira's mirror image, chases her through the Hollow Stage, replaying her every move." width="1280" height="720" loading="lazy" /><figcaption>The Grin replays your moves a moment behind you.</figcaption></figure>
</div>

## Nine chapters, one new idea each

Each chapter is built around a single mechanic: jack-in-the-box springs and crumbling boards in Lantern Town, comedy and tragedy mask blocks that swap on every dash in the Grand Carnival, gusting wind and cable gondolas on Whistling Ridge, circus balloons in the Mirror Cathedral, and pinball bumpers in the Undertow. In chase rooms, the Grin, Mira's own reflection, follows a fraction of a second behind, replaying every move. Stop to think and it catches you.

There are 69 rooms across the prologue, seven chapters, and an epilogue, with 61 sunberries, seven hidden jester bells, and seven golden sunberries for anyone who wants to carry one through a whole chapter without dying.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-gondola.webp" alt="Whistling Ridge: Mira rides a cable gondola across a windy gap." width="1280" height="720" loading="lazy" /><figcaption>Whistling Ridge.</figcaption></figure>
  <figure><img src="/images/games/jeste-cathedral.webp" alt="Mirror Cathedral: Mira passes through a mirror pane between stained-glass windows." width="1280" height="720" loading="lazy" /><figcaption>Mirror Cathedral.</figcaption></figure>
  <figure><img src="/images/games/jeste-undertow.webp" alt="Undertow: glowing pinball bumpers in a dark cave above a spike floor." width="1280" height="720" loading="lazy" /><figcaption>Undertow.</figcaption></figure>
  <figure><img src="/images/games/jeste-summit.webp" alt="The Summit at 2400 m: Mira dashes out of a velvet curtain above the clouds." width="1280" height="720" loading="lazy" /><figcaption>The Summit.</figcaption></figure>
</div>

The story is told in scripted cutscenes with animated, blinking portraits and per-character voice blips. Mira meets Old Bellamy the bell-ringer, Tobi the anxious painter, a ghostly ringmaster who never ends his show, and the Grin.

<figure>
  <img src="/images/games/jeste-story.webp" alt="Old Bellamy warns Mira that Jeste is a trickster in a cutscene with animated portraits." width="1280" height="720" loading="lazy" />
  <figcaption>A cutscene with Old Bellamy at the foot of the mountain.</figcaption>
</figure>

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-title.webp" alt="Title screen: the JESTE logo over Mount Jeste, with Mira juggling by a campfire." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/jeste-chapter-select.webp" alt="Chapter select with a living postcard of Whistling Ridge and collectible stats." width="1280" height="720" loading="lazy" /><figcaption>Chapter select.</figcaption></figure>
</div>

## What it's built with

Jeste is written in GDScript for **Godot 4.7** and renders a 320 × 180 pixel canvas scaled up by whole numbers. The central design decision is that the simulation in `scripts/sim/world.gd` doesn't depend on Godot's scene nodes. It's a fixed-step, 60 Hz model of a room. The game renders it, a solver searches it, and the tests replay it, so an input recording that clears a room in a test clears it in the game.

That made it possible to **prove every room is beatable**. The solver runs a weighted A\* search over input macro-actions such as run, jump, hold, dash, and climb, simulating every candidate with the real physics. It runs across parallel headless Godot workers. The test suite proves that each chapter's end can be reached and that every collectible can be taken on a route that still finishes. It then plays every chapter end to end through the real level scene without a death, which also proves every golden run.

Levels are plain ASCII files, one per chapter, with a legend for solid ground, spikes, springs, gems, curtains, mask blocks, gondolas, balloons, and bumpers.

## How it was made

Nothing in Jeste comes from a third-party asset pack. All 56 PNGs are generated by a Godot script that reproduces the committed images byte for byte. Characters are "paper dolls": ASCII-drawn heads and torsos with procedurally posed limbs, 34 animation frames each. Terrain is painted per pixel from the collision map on worker threads, with bevels, ambient occlusion, and snow, grass, or crystal caps.

The audio comes from a small NumPy synthesizer in `tools/synth.py`, with electric piano, FM bells, pads, choir, organ, calliope, drums, and convolution reverb. It composes 13 music tracks on one recurring theme as seamless 32-bar loops, plus ambience beds and 36 layered sound effects.

Even the trailer is reproducible. `tools/trailer/` drives the real game through Godot's Movie Maker using the solver's proven routes, draws captions in the game's own pixel font, and assembles the cut with FFmpeg, with transitions on the music grid and loudness normalized to EBU R128.

Jeste was built with [Claude Code](https://claude.com/claude-code) as an AI pair programmer. Its public commit history runs about 18 hours on October 4, 2026.

## Play it

Version 0.1.0 is a complete game from prologue to credits. [Download the Linux build](https://github.com/nearbycoder/Jeste/releases/latest), unzip it, and run `./Jeste.x86_64`; it needs a Vulkan-capable GPU. Windows, macOS, and web builds aren't published yet. Difficulty was tuned against the bot rather than a range of human players, so some rooms may feel tighter than intended, and assist mode is there for that.

[Browse the source and README media on GitHub](https://github.com/nearbycoder/Jeste). GitHub records the repository's creation on **October 4, 2026**.
