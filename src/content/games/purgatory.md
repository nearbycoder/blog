---
title: "Purgatory"
summary: "An original gothic arena shooter with 24 levels, five weapons with ten fire modes, Rapier ragdolls, and no reloads, built with Three.js for Linux and the web."
role: "Creator"
genre: "Arena shooter"
platforms: ["Linux", "Web"]
engine: "Three.js + Rapier"
year: "2026"
createdAt: "2026-10-04"
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
githubLink: "https://github.com/nearbycoder/PainKiller"
download: "https://github.com/nearbycoder/PainKiller/releases/latest"
featured: false
accent: "red"
draft: false
image: "/images/games/purgatory-freeze-shatter.webp"
imageAlt: "Freezing a brute with the Freezer, then shattering it with the shotgun."
imageCaption: "Freeze, then shatter: one of Purgatory's weapon combinations."
demoVideos:
  - src: "/videos/games/purgatory-trailer.mp4"
    title: "Purgatory feature trailer"
    caption: "The 1:57 feature trailer, with the game's synthesized music and sound effects and on-screen captions; there is no narration. All footage is scripted gameplay rendered offscreen in virtual time, so every frame is identical on every run. Re-encoded here at 540p."
    poster: "/images/games/purgatory-trailer-poster.webp"
    original: "https://github.com/nearbycoder/PainKiller/blob/main/docs/media/trailer.mp4"
---

You are a soul with a shotgun and nowhere left to go. Purgatory throws you into sealed arenas, including a moonlit cemetery, a cathedral of ash, a soul-burning foundry, a drowned city, and the Abyss itself. The gate opens only when every wave of the damned is dead.

It's an original homage to the fast, crowd-clearing arena shooters of the early 2000s, Painkiller (2004) above all. It isn't affiliated with or derived from that game; the names, levels, code, models, sounds, and music are original or openly licensed.

## Momentum, not reloading

There's no reload key. Every weapon has two fire modes, and the best tools are combinations. Freeze an enemy, then shatter it with the shotgun. Shoot a stake into your own grenade to launch it. Fire both barrels of the Tempest to call down a storm orb. Every kill leaves a soul that heals you a little; collect 66 and you become the **Wraith** for fifteen seconds, invulnerable and four times as deadly.

The arsenal: the **Thresher**, a spinning melee blade whose head you can hurl and recall; the **Shotgun / Freezer**; the **Stake Launcher / Grenade**, whose stakes ignite over distance and pin bodies to walls; the **Rocket / Chaingun**; and the **Tempest**, which throws shuriken or chain lightning that leaps between targets.

<div class="project-media-gallery">
  <figure><img src="/images/games/purgatory-cemetery-horde.webp" alt="A rocket bursting inside a horde in Hallowed Ground." width="1280" height="720" loading="lazy" /><figcaption>A rocket inside a horde in Hallowed Ground.</figcaption></figure>
  <figure><img src="/images/games/purgatory-chain-lightning.webp" alt="Chain lightning arcing through skeletons on The Silent Stage." width="1280" height="720" loading="lazy" /><figcaption>Chain lightning on The Silent Stage.</figcaption></figure>
  <figure><img src="/images/games/purgatory-wraith-form.webp" alt="Wraith Form: the screen turns spectral while the chaingun shreds a crowd." width="1280" height="720" loading="lazy" /><figcaption>Wraith Form.</figcaption></figure>
  <figure><img src="/images/games/purgatory-the-abyss.webp" alt="Late game: a rocket volley in The Abyss." width="1280" height="720" loading="lazy" /><figcaption>The Abyss.</figcaption></figure>
</div>

## The damned, and their generals

Shamblers, skeletons, and hounds rush you; monks and floating witches throw hellfire from range; knights carry swords; brutes soak up punishment. Every melee attack winds up before it lands, so you can always dodge it. Each chapter ends with a **general** that fires projectile volleys, summons reinforcements in rage phases at 70% and 35% health, and sends out expanding shockwaves you have to jump.

<figure>
  <img src="/images/games/purgatory-general.webp" alt="A chapter general's boss bar, shockwave, and hellfire in Dune Sepulchre." width="1280" height="720" loading="lazy" />
  <figcaption>A chapter general in Dune Sepulchre.</figcaption>
</figure>

The campaign runs five chapters, 24 levels, 104 sectors, and 22 environment themes. Each level hides a relic; find it or collect 25 souls there to earn that chapter's **Grave Tarot** card, which gives thirty seconds of double damage, extra speed, or invulnerability once per sector.

<div class="project-media-gallery">
  <figure><img src="/images/games/purgatory-level-select.webp" alt="Level select with chapter tabs and environment previews." width="1280" height="720" loading="lazy" /><figcaption>Level select.</figcaption></figure>
  <figure><img src="/images/games/purgatory-grave-tarot.webp" alt="The Grave Tarot card screen." width="1280" height="720" loading="lazy" /><figcaption>The Grave Tarot.</figcaption></figure>
</div>

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/purgatory-title.webp" alt="Title screen over the moonlit cemetery." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## What it's built with

Purgatory is TypeScript on **Three.js** r180, bundled with Vite. The same build runs in any WebGL 2 browser or inside an **Electron** desktop shell, packaged as an AppImage for Linux. The desktop shell is locked down: the renderer is sandboxed with context isolation and no Node access, and the preload script exposes only save, fullscreen, and quit.

Gameplay advances in fixed 1/60-second steps, decoupled from rendering. Physics is a hybrid. The player and living enemies use fast swept-box collision against the arena. When an enemy dies, its current animated pose is handed to a **Rapier 3D** ragdoll. Grenades are rigid bodies with continuous collision detection, and stakes ray-cast ahead of a flying corpse and pin the struck bone to the architecture with a spherical joint.

Rendering uses PBR materials, an HDR sky, soft shadows refreshed at 30 Hz, half-resolution SSAO on High, and FXAA, with static meshes merged by material and an adaptive resolution controller for heavy moments. There are no audio files at all. Gunfire, footsteps, pickups, and the combat music are oscillators and filtered noise generated at runtime with the Web Audio API.

## How it was made

Every environment, weapon, and enemy costume is built by headless Blender Python scripts, which handle procedural masonry, baked weapon materials, animation retargeting onto new rigs, level-of-detail reduction, and optimized GLB export. Those scripts start from CC0 sources (models, materials, and the HDR sky from Poly Haven, plus a zombie model and animations by Rikindle3D from OpenGameArt), and the full manifest is in the repository. Enemies combine six retargeted base animations with procedural layers for breathing, turning, attacks, casting, hit reactions, and armor.

The game was built with AI coding agents, following OpenAI's guide to [building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra). It has 56 Vitest unit and regression checks, an Electron smoke test, and larger in-browser scenario scripts covering every fire mode, freeze-and-shatter, death and retry, pickups, tarot cards, gates, and every environment and boss, run against a development API. The same fixed-step function powers the trailer, which a Python script renders offscreen in virtual time.

## Play it

Purgatory is a playable prototype at v0.1.0, and the whole campaign can be played from start to finish. [Download it from GitHub releases](https://github.com/nearbycoder/PainKiller/releases/latest) as an AppImage, a portable Linux archive, or a web build you can serve with any static file server. It supports keyboard and mouse, controllers, and touch. Four of the themes use Blender-authored scenes and the other eighteen are compact procedural arenas, and the five generals share one rig.

[Browse the source on GitHub](https://github.com/nearbycoder/PainKiller). GitHub records the repository's creation on **October 4, 2026**.
