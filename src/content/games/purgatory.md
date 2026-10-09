---
title: "Purgatory"
summary: "An original gothic arena shooter with 24 levels, five weapons with ten fire modes, Rapier ragdolls, five chapter themes, a four-step graphics fidelity slider, and no reloads, built with Three.js for Linux and the web."
role: "Creator"
genre: "Arena shooter"
platforms: ["Linux", "Web"]
engine: "Three.js + Rapier"
year: "2026"
createdAt: "2026-10-04T22:37:33Z"
stack:
  [
    "TypeScript",
    "Three.js",
    "Rapier",
    "Electron",
    "Vite",
    "Vitest",
    "Blender",
    "Web Audio API",
  ]
link: "https://nearbycoder.github.io/PainKiller/"
githubLink: "https://github.com/nearbycoder/PainKiller"
download: "https://github.com/nearbycoder/PainKiller/releases/latest"
featured: false
accent: "red"
draft: false
image: "/images/games/purgatory-freeze-shatter.webp"
imageAlt: "Freezing a brute with the Freezer, then shattering it with the shotgun."
imageCaption: "Freeze, then shatter: one of Purgatory's weapon combinations, on the Ultra graphics step."
demoVideos:
  - src: "/videos/games/purgatory-trailer.mp4"
    title: "Purgatory feature trailer"
    caption: "The 2:02 feature trailer, re-recorded after twelve rounds of improvements on the Ultra graphics step, with the game's synthesized sound effects and its five chapter themes; there is no narration. All footage is scripted gameplay rendered offscreen in virtual time, so every frame is identical on every run. Re-encoded here at 540p."
    poster: "/images/games/purgatory-trailer-poster.webp"
    original: "https://github.com/nearbycoder/PainKiller/blob/main/docs/media/trailer.mp4"
---

You are a soul with a shotgun and nowhere left to go. Purgatory throws you into sealed arenas, including a moonlit cemetery, a cathedral of ash, a soul-burning foundry, a drowned city, and the Abyss itself. The gate opens only when every wave of the damned is dead.

It's an original homage to the fast, crowd-clearing arena shooters of the early 2000s, Painkiller (2004) above all. It isn't affiliated with or derived from that game; the names, levels, code, models, sounds, and music are original or openly licensed.

## Momentum, not reloading

There's no reload key. Every weapon has two fire modes, and the best tools are combinations. Freeze an enemy, then shatter it with the shotgun. Shoot a stake into your own grenade to launch it. Fire both barrels of the Tempest to call down a storm orb. Every kill leaves a soul that heals you a little; collect 66 and you become the **Wraith** for fifteen seconds, invulnerable and four times as deadly.

The arsenal: the **Thresher**, a spinning melee blade whose head you can hurl and recall; the **Shotgun / Freezer**; the **Stake Launcher / Grenade**, whose stakes ignite over distance and pin bodies to walls; the **Rocket / Chaingun**; and the **Tempest**, which throws shuriken or chain lightning that leaps between targets. The weapon bar shows both reserves of every weapon, and a weapon that runs dry clicks and hands you the best one that can still fire.

<div class="project-media-gallery">
  <figure><img src="/images/games/purgatory-cemetery-horde.webp" alt="A rocket bursting inside a horde in Hallowed Ground." width="1280" height="720" loading="lazy" /><figcaption>A rocket inside a horde in Hallowed Ground.</figcaption></figure>
  <figure><img src="/images/games/purgatory-chain-lightning.webp" alt="Chain lightning arcing through skeletons on The Silent Stage." width="1280" height="720" loading="lazy" /><figcaption>Chain lightning on The Silent Stage.</figcaption></figure>
  <figure><img src="/images/games/purgatory-wraith-form.webp" alt="Wraith Form: the screen turns spectral while the chaingun shreds a crowd." width="1280" height="720" loading="lazy" /><figcaption>Wraith Form.</figcaption></figure>
  <figure><img src="/images/games/purgatory-the-abyss.webp" alt="Late game: a rocket blast in The Abyss." width="1280" height="720" loading="lazy" /><figcaption>The Abyss.</figcaption></figure>
</div>

## The damned, and their generals

Shamblers, skeletons, and hounds rush you; monks and floating witches throw hellfire from range; knights carry swords; brutes soak up punishment. Every melee attack winds up with a growl, panned toward the attacker, before it lands, so you can always dodge it. Each chapter ends with a **general** that fires projectile volleys, summons reinforcements in rage phases at 70% and 35% health, and sends out expanding shockwaves you have to jump.

Danger is shown as well as heard. Red arcs around the crosshair point to whatever hurt you, a dashed arc warns of hellfire from off-screen, and chevrons at the screen's edge point to the last hidden enemies of a wave and to the open gate. At a quarter of your health the readout pulses red, the screen's edges darken, and a heartbeat quickens as health falls. When you die, the death screen names what killed you, lists what hurt you most, and says how that attack is avoided.

<figure>
  <img src="/images/games/purgatory-general.webp" alt="A chapter general's boss bar and an expanding shockwave ring in Dune Sepulchre." width="1280" height="720" loading="lazy" />
  <figcaption>A chapter general in Dune Sepulchre.</figcaption>
</figure>

The campaign runs five chapters, 24 levels, 104 sectors, and 22 environment themes, each chapter with its own combat theme. A new campaign asks for a difficulty: **Reverie**, **Purgatory** or **Torment**. Progress saves as every wave begins, so **Continue** resumes the wave you quit with the supplies you had. Each level hides a relic; find it or collect 25 souls there to earn that chapter's **Grave Tarot** card, which gives thirty seconds of double damage, extra speed, or invulnerability once per sector. Cleared levels keep records of your fastest clear, most kills and deathless runs.

<div class="project-media-gallery">
  <figure><img src="/images/games/purgatory-level-select.webp" alt="Level select with chapter tabs and environment previews." width="1280" height="720" loading="lazy" /><figcaption>Level select.</figcaption></figure>
  <figure><img src="/images/games/purgatory-grave-tarot.webp" alt="The Grave Tarot card screen." width="1280" height="720" loading="lazy" /><figcaption>The Grave Tarot.</figcaption></figure>
  <figure><img src="/images/games/purgatory-title.webp" alt="Title screen over the moonlit cemetery." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## Graphics fidelity and options

One slider under Options › Video has four steps, and every step plays the same fight; only the picture changes. **Low** has no shadows, ambient occlusion or antialiasing, for weak and integrated graphics. **Medium**, the default, adds sun shadows and FXAA. **High** adds bloom on lamps, fire, blasts and muzzle flashes, a colour grade and vignette, and ambient occlusion. **Ultra** adds stronger bloom, 4096-pixel shadows refreshed every frame, full-resolution ambient occlusion, SMAA, denser particles and up to twice the pixel density. On the integrated Radeon it was measured on, a 1280×800 frame rendered in about 0.8 to 1.0 ms on Low and 1.8 to 2.3 ms on Ultra.

<figure>
  <img src="/images/games/purgatory-fidelity.webp" alt="The same frame of Hallowed Ground, Frostbound Crossing and Cathedral of Ash on Low, Medium, High and Ultra." width="1280" height="600" loading="lazy" />
  <figcaption>The same three frames on Low, Medium, High and Ultra.</figcaption>
</figure>

Every keyboard, mouse and controller action can be rebound, two per action, the sticks can be swapped for left-handed play, and sprint can be held or toggled. There are separate mouse and stick sensitivities, a stick dead zone, controller vibration, inverted look, a HUD scale from 75 to 150%, a crosshair in four styles, five colours and several sizes, and reduced camera motion. Menus work with the mouse, the keys or a D-pad, fade in, and light up when pressed, and the key line at the bottom names the controller's buttons when one is connected.

## What it's built with

Purgatory is TypeScript on **Three.js** r180, bundled with Vite. The same build runs in any WebGL 2 browser or inside an **Electron** desktop shell, packaged as an AppImage for Linux. The desktop shell is locked down: the renderer is sandboxed with context isolation and no Node access, and the preload script exposes only save, fullscreen, and quit.

Gameplay advances in fixed 1/60-second steps, decoupled from rendering, with its own seeded random sequence, so a seeded fight replays exactly at any frame rate and on any graphics step. Each frame draws motion between the last two steps, so it stays even on 120 and 144 Hz displays. Physics is a hybrid. The player and living enemies use fast swept-box collision against the arena. When an enemy dies, its current animated pose is handed to a **Rapier 3D** ragdoll. Grenades are rigid bodies with continuous collision detection, and stakes ray-cast ahead of a flying corpse and pin the struck bone to the architecture with a spherical joint.

There are no audio files at all. Gunfire, footsteps, pickups, enemy telegraphs, and the five chapter themes are oscillators and filtered noise generated at runtime with the Web Audio API. Each theme thins to a drone between waves and grows a layer while a general lives, scheduled on the audio clock so its tempo never follows the frame rate.

## How it was made

Every environment, weapon, and enemy costume is built by headless Blender Python scripts, which handle procedural masonry, baked weapon materials, animation retargeting onto new rigs, level-of-detail reduction, and optimized GLB export. Those scripts start from CC0 sources (models, materials, and the HDR sky from Poly Haven, plus a zombie model and animations by Rikindle3D from OpenGameArt), and the full manifest is in the repository.

The game was built with AI coding agents, following OpenAI's guide to [building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra). After launch it went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds found that on a 144 Hz screen, 58% of frames showed no movement while walking, and added the chapter themes, rebinding, the death recap, the low-health warning, the difficulty choice, mid-sector resume and the fidelity slider. They also measured the HUD's contrast over bright snow and sand and in crowded fights until every label held its target. The tests now include 181 Vitest checks and in-browser scenario scripts for every fire mode, enemy, environment and boss, run in Electron and in Firefox, plus a balance autopilot that has played all 104 sectors.

The trailer is rendered by the game itself: a Python script drives scripted shots offscreen at 1920×1080 on Ultra in virtual time, so every frame is identical on every run, then scores the cut with the game's own synthesized sound and chapter themes.

## Play it

Play it in your browser at [nearbycoder.github.io/PainKiller](https://nearbycoder.github.io/PainKiller/). It's the current game, about 53 MB before the title screen, needing a browser with WebGL 2. Saves are kept in the browser, and sound starts on your first click or key.

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/PainKiller/releases/latest) as an AppImage, a portable Linux archive, or a web build you can serve yourself. That release is the October 4 launch build: the whole campaign is there, but not the improvements above. For the current desktop version, build it from source with Node 22 or later. It supports keyboard and mouse, controllers, and touch, though controllers and touch have only been tested with synthetic input. Four of the themes use Blender-authored scenes and the other eighteen are compact procedural arenas, and the five generals share one rig.

[Browse the source on GitHub](https://github.com/nearbycoder/PainKiller). GitHub records the repository's creation on **October 4, 2026**.
