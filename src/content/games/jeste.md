---
title: "Jeste"
summary: "A pixel-art precision platformer about a young jester climbing a mountain that laughs back, with nine chapters, an eight-way dash, an Assist mode with a Route Ghost, and every room proven beatable by an automated solver."
role: "Creator"
genre: "Precision platformer"
platforms: ["Linux", "Web"]
engine: "Godot 4.7"
year: "2026"
createdAt: "2026-10-04T22:49:29Z"
stack: ["Godot", "GDScript", "Python", "NumPy", "FFmpeg"]
link: "https://nearbycoder.github.io/Jeste/"
githubLink: "https://github.com/nearbycoder/Jeste"
download: "https://github.com/nearbycoder/Jeste/releases/latest"
featured: false
accent: "rose"
draft: false
image: "/images/games/jeste-dash.webp"
imageAlt: "Mira chains a dash through green dash gems over a spike pit in Lantern Town."
imageCaption: "Lantern Town: chaining dashes through dash gems, captured at Graphics: Ultra. From the Jeste README."
demoVideos:
  - src: "/videos/games/jeste-trailer.mp4"
    title: "Jeste feature trailer"
    caption: "The 1:51 feature trailer, re-recorded at Graphics: Ultra after twelve rounds of improvements, with the game's synthesized music and sound effects and on-screen captions. It adds Assist with the Route Ghost, the Graphics steps over the blurred pause screen, and the checkpoint picker. There is no narration; character voices are wordless blips. Every frame is the real game, played by the project's automated solver and rendered with Godot's Movie Maker. Re-encoded here at 540p."
    poster: "/images/games/jeste-trailer-poster.webp"
    original: "https://github.com/nearbycoder/Jeste/blob/main/docs/media/jeste_trailer.mp4"
---

Mira Vale grew up as a jester in a travelling troupe, trained by her grandmother Nana Odile. They always planned to climb Mount Jeste together, the mountain whose wind is said to laugh. Nana died last winter, Mira never cried, and one night she froze on stage. So she climbs Jeste alone. The old bell-ringer at the bottom warns her that the mountain shows you whatever you hide behind your smile.

Jeste is a tight, forgiving climb in the tradition of modern precision platformers. Deaths cost about a second, the hardest challenges are optional, and an assist mode is always one menu away.

## Run, jump, climb, dash

Mira can jump, wall-jump, cling and climb on limited stamina, and dash once in the air in any of eight directions. Her jester cap shows whether the dash is ready, spent, or doubled. Underneath those basics sit the techniques experienced players will look for: supers, hypers, wavedashes, wall-bounces, dash corner correction, and momentum boosts from moving platforms.

The feel comes from small, deliberate details: coyote time, jump buffering, variable jump height, half gravity at the top of a jump, squash and stretch, afterimages and a dash ribbon, freeze frames, directional screen shake, gamepad rumble, and a cap with two physics-simulated tails and bells.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-curtains.webp" alt="Mira glides through red velvet curtains on the Hollow Stage, a dream theatre inside the mountain." width="1280" height="720" loading="lazy" /><figcaption>The Hollow Stage: curtains you dash through.</figcaption></figure>
  <figure><img src="/images/games/jeste-chase.webp" alt="The Grin, Mira's mirror image, chases her through the Hollow Stage, replaying her every move." width="1280" height="720" loading="lazy" /><figcaption>The Grin replays your moves a moment behind you.</figcaption></figure>
</div>

## Nine chapters, one new idea each

Each chapter is built around a single mechanic: jack-in-the-box springs and crumbling boards in Lantern Town, comedy and tragedy mask blocks that swap on every dash in the Grand Carnival, gusting wind and cable gondolas on Whistling Ridge, circus balloons in the Mirror Cathedral, and pinball bumpers in the Undertow. In chase rooms, the Grin, Mira's own reflection, follows a fraction of a second behind, replaying every move. Stop to think and it catches you.

There are 69 rooms across the prologue, seven chapters, and an epilogue, with 61 sunberries, seven hidden jester bells, and seven golden sunberries for anyone who wants to carry one through a whole chapter without dying. Once you've reached more than one room of a chapter, chapter select lets you start from any checkpoint, and its postcard shows which berries and bell that room still holds.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-gondola.webp" alt="Whistling Ridge: Mira dashes off a cable gondola over a windy gap." width="1280" height="720" loading="lazy" /><figcaption>Whistling Ridge.</figcaption></figure>
  <figure><img src="/images/games/jeste-cathedral.webp" alt="Mirror Cathedral: Mira passes through a mirror pane between stained-glass windows." width="1280" height="720" loading="lazy" /><figcaption>Mirror Cathedral.</figcaption></figure>
  <figure><img src="/images/games/jeste-undertow.webp" alt="Undertow: glowing pinball bumpers in a dark cave above a spike floor." width="1280" height="720" loading="lazy" /><figcaption>Undertow.</figcaption></figure>
  <figure><img src="/images/games/jeste-summit.webp" alt="The Summit: Mira dashes out of a velvet curtain above the clouds." width="1280" height="720" loading="lazy" /><figcaption>The Summit.</figcaption></figure>
</div>

The story is told in scripted cutscenes with animated, blinking portraits and per-character voice blips. Mira meets Old Bellamy the bell-ringer, Tobi the anxious painter, a ghostly ringmaster who never ends his show, and the Grin.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-story.webp" alt="Old Bellamy warns Mira that Jeste is a trickster in a cutscene with animated portraits." width="1280" height="720" loading="lazy" /><figcaption>A cutscene with Old Bellamy.</figcaption></figure>
  <figure><img src="/images/games/jeste-checkpoints.webp" alt="Chapter select's checkpoint picker for The Hollow Stage: a postcard of room 4 of 8, its berries all found, and a trail of room pips." width="1280" height="720" loading="lazy" /><figcaption>Starting from a checkpoint.</figcaption></figure>
</div>

## Assist, settings and graphics

**Pause → Assist** offers game speed from 50 to 100%, infinite stamina, invincibility, extra or infinite air dashes, and **Dash Aim**, which stops time while you choose a direction. Its newest option is the **Route Ghost**: a translucent Mira runs the room the way the solver proved it can be done, using only the moves the game teaches, while a strip lights the buttons she presses. Set her to Berries and she shows how to take every berry and bell you're still missing. After ten deaths in a room, the game points you to her once.

Every key and pad button can be rebound, grab can be held or toggled, and a stick deadzone setting comes with a live dial for tuning out a drifting stick. Prompts name keys as your keyboard layout prints them and pad buttons the way your controller does. There's **Reduce Flashing**, **Smooth Motion** for displays that aren't a multiple of 60 Hz, a speedrun timer, and mouse support in every menu. Every option explains itself in a box beside the panel, which opens on the side of the screen away from Mira.

**Graphics** has four steps, and the change shows at once. High is the full look, with glow, colour grading, fog and light shafts. Ultra adds a wide soft glow, soft shadows cast by the terrain, light shafts in every chapter, depth of field on distant ridges, finer light pools and more particles. Every step takes well under a millisecond of GPU time on the integrated Radeon it was measured on. From Medium up, pausing softly blurs the climb behind the menu.

<div class="project-media-gallery">
  <figure><img src="/images/games/jeste-route-ghost.webp" alt="Route Ghost: a translucent Mira jumps between two rock pillars on Whistling Ridge while the real Mira waits below; a strip at the bottom left lights the buttons the ghost presses." width="1280" height="720" loading="lazy" /><figcaption>The Route Ghost.</figcaption></figure>
  <figure><img src="/images/games/jeste-graphics.webp" alt="The pause menu's Options panel with Graphics set to Ultra; its help box lists what Ultra adds, over the softly blurred Lantern Town." width="1280" height="720" loading="lazy" /><figcaption>Graphics on Ultra, over the blurred pause.</figcaption></figure>
  <figure><img src="/images/games/jeste-title.webp" alt="Title screen: the JESTE logo over Mount Jeste, with Mira juggling by a campfire." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/jeste-chapter-select.webp" alt="Chapter select with a living postcard of The Hollow Stage and collectible stats." width="1280" height="720" loading="lazy" /><figcaption>Chapter select.</figcaption></figure>
</div>

## What it's built with

Jeste is written in GDScript for **Godot 4.7** and renders a 320 × 180 pixel canvas scaled up by whole numbers. The central design decision is that the simulation in `scripts/sim/world.gd` doesn't depend on Godot's scene nodes. It's a fixed-step, 60 Hz model of a room. The game renders it, a solver searches it, and the tests replay it, so an input recording that clears a room in a test clears it in the game.

That made it possible to **prove every room is beatable**. The solver runs a weighted A\* search over input macro-actions such as run, jump, hold, dash, and climb, simulating every candidate with the real physics, across parallel headless Godot workers. The test suite proves that each chapter's end can be reached and that every collectible can be taken on a route that still finishes, then plays every chapter end to end through the real level scene without a death. The Route Ghost replays those same proven routes.

Levels are plain ASCII files, one per chapter, with a legend for solid ground, spikes, springs, gems, curtains, mask blocks, gondolas, balloons, and bumpers.

## How it was made

Nothing in Jeste comes from a third-party asset pack. All the art is generated by a Godot script that reproduces the committed images byte for byte. Characters are "paper dolls": ASCII-drawn heads and torsos with procedurally posed limbs. Terrain is painted per pixel from the collision map on worker threads, with bevels, ambient occlusion, and snow, grass, or crystal caps. The audio comes from a small NumPy synthesizer that composes 13 music tracks on one recurring theme, plus ambience beds and 36 layered sound effects.

After launch, Jeste went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds found that the Game Speed assist had never slowed gameplay, that the pad's menu buttons hadn't done what the hints said since v0.1.0, that closing the pause menu could make Mira jump, and that a crash could lose a save. They added checkpoints, the Route Ghost, Dash Aim, rebinding, the stick deadzone, smooth motion, mouse menus and the graphics steps, and a random-input fuzzer now drives menus and levels for hundreds of thousands of frames looking for script errors.

The trailer is reproducible too. `tools/trailer/` drives the real game through Godot's Movie Maker at Ultra using the solver's proven routes, draws captions in the game's own pixel font, and assembles the cut with FFmpeg, with transitions on the music grid and loudness normalized to EBU R128. Jeste was built with [Claude Code](https://claude.com/claude-code).

## On phones and tablets

The browser version's menus always worked by tap, but on a touchscreen Mira couldn't move, jump, dash, grab or pause. Phones and tablets now get a d-pad on the left, **Jump**, **Dash** and **Grab** on the right, and pause at the top right. Dash goes the way the d-pad points, Grab lights up while latched when Grab Mode is Toggle, and holding pause skips a cutscene. The controls appear only on touch-first devices or after a touch, and a key, the mouse or a gamepad hides them again. A phone held upright is asked to turn sideways; a tablet works either way up, with the controls below the picture.

Memory was the other risk. The engine kept every music track it had decoded, about 350 MB over a full playthrough, so phones and tablets now stream music instead. On the iPhone profile, decoded audio after the first level fell from 103 MB to 6 MB and the WebAssembly heap's peak from 115 MB to 67 MB. Painted room art is kept for one chapter rather than every chapter visited, phones start on Medium graphics, and if iOS closes the tab mid-game, the next visit starts on Low and says why.

<figure>
  <img src="/images/games/jeste-phone.webp" alt="Mira running on an iPhone-sized screen, with the d-pad on the left and Grab, Dash and Jump on the right." width="1280" height="598" loading="lazy" />
  <figcaption>On a phone held sideways, in a headless iPhone 15 profile.</figcaption>
</figure>

It has only been played in headless test browsers with iPhone, iPad and Android phone profiles so far. A real phone still has to confirm iOS's memory limit, sound, frame rate, and how the controls feel under a thumb.

## Play it

Play it in your browser at [nearbycoder.github.io/Jeste](https://nearbycoder.github.io/Jeste/), on a desktop or on a phone or tablet held sideways. It's the current game, exported from Godot as a single-threaded web build of about 27 MB over the wire. Saves stay in the browser, and fullscreen is in Options.

To play on the desktop, install Godot 4.6 or later, clone the repository, and run `godot --path .`. [The v0.1.0 Linux build](https://github.com/nearbycoder/Jeste/releases/latest) is the October 4 launch build, a complete game from prologue to credits, but without any of the fixes and features above. Difficulty was tuned against the bot rather than a range of human players, so some rooms may feel tighter than intended; Assist mode and the Route Ghost are there for that.

[Browse the source and README media on GitHub](https://github.com/nearbycoder/Jeste). GitHub records the repository's creation on **October 4, 2026**.
