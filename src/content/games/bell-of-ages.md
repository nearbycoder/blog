---
title: "The Bell of Ages"
summary: "An original 3D action-adventure for the browser about a boy, a forgotten song, and a kingdom in two ages, built with TypeScript, Three.js, and a scripted Blender pipeline."
role: "Creator"
genre: "Action-adventure"
platforms: ["Web"]
engine: "Three.js"
year: "2026"
createdAt: "2026-10-04T22:32:07Z"
stack:
  [
    "TypeScript",
    "Three.js",
    "Vite",
    "Vitest",
    "Blender",
    "glTF Transform",
    "Web Audio API",
    "Playwright",
  ]
githubLink: "https://github.com/nearbycoder/Ocarina"
download: "https://github.com/nearbycoder/Ocarina/releases/latest"
featured: false
accent: "teal"
draft: false
image: "/images/games/bell-of-ages-boss.webp"
imageAlt: "Alder raises his shield as the Cinder Colossus winds up inside a golden warning ring."
imageCaption: "Facing the Cinder Colossus, from The Bell of Ages README."
demoVideos:
  - src: "/videos/games/bell-of-ages-trailer.mp4"
    title: "The Bell of Ages trailer"
    caption: "The 1:41 trailer, with the game's own sound effects and a score arranged from its synthesized flute, chime, and ambient voices, plus on-screen captions; there is no voice acting. Everything is captured from the real game under a deterministic clock. Re-encoded here at 540p."
    poster: "/images/games/bell-of-ages-trailer-poster.webp"
    original: "https://github.com/nearbycoder/Ocarina/blob/main/docs/media/trailer.mp4"
---

Alder is eleven. His father Tomas, keeper of the great bell, went to mend it last autumn and never came home. On the morning of the lantern festival, the bell sounds its first warning, and the village falls quiet.

Take up a practice sword and your father's reed flute. Follow the pale paths out of Alder Village into the Whisperwood, up Cinderpeak, and down to the Larkwater Coast. Solve each sanctuary's trial, break its guardian seal, and face the warden at its heart. When three relics rest in the altar, the Bell of Ages offers a crossing that costs seven years of your life.

The Bell of Ages is an original adventure inspired by classic 3D action-adventure games. Its world, characters, story, models, and music are original to the project, and it runs in a browser.

## Sword, shield, and the golden ring

Chain a diagonal cut, a return cut, and a heavier thrust. Damage comes from the blade itself: each swing traces the sword's real path against enemy hit volumes, so a miss is really a miss, and a blade that hits a wall glances off in sparks. Guardians telegraph every attack with a pulsing golden ring and commit to their facing, so a well-timed shield or dodge always has an answer. Lock-on keeps a single foe in focus.

<div class="project-media-gallery">
  <figure><img src="/images/games/bell-of-ages-combat.webp" alt="Alder slashes a stone guardian in the Whisperwood, leaving a pale sword trail." width="1280" height="720" loading="lazy" /><figcaption>A sword combo in the Whisperwood.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-mirrors.webp" alt="Turning star mirrors in the Glass Monastery." width="1280" height="720" loading="lazy" /><figcaption>Star mirrors in the Glass Monastery.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-flute.webp" alt="The reed flute interface with low, middle, and high notes." width="1280" height="720" loading="lazy" /><figcaption>Your father's reed flute.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-map.webp" alt="The map of the kingdom of Aevora with its regions and sanctuaries." width="1280" height="720" loading="lazy" /><figcaption>The kingdom map.</figcaption></figure>
</div>

Seven sanctuaries each run from a puzzle chamber to a sealed guardian hall to a warden's arena, and each asks something different: touch memory stones in the order the roots remember, push a stone onto a seal, echo a melody on the three-note reed flute, turn star mirrors toward the north, balance light and shadow across three flames, or ring bells in the order an inscription names.

## A kingdom in two ages

Before the crossing, you make your oldest friend Mira a promise: "I'll find my way home" or "I'll remember us as we are." The choice changes your reunion, the memories in your journal, and the ending. As an adult you're taller and stronger and carry the keeper's longsword. The kingdom's light has changed, and new sanctuaries wake in its far corners.

<div class="project-media-gallery">
  <figure><img src="/images/games/bell-of-ages-promise.webp" alt="At the Bell Sanctuary, Mira asks Alder what he will promise before the seven-year crossing." width="1280" height="720" loading="lazy" /><figcaption>The promise before the crossing.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-crownfall.webp" alt="Crownfall in the second age." width="1280" height="720" loading="lazy" /><figcaption>Crownfall, seven years later.</figcaption></figure>
</div>

The campaign spans ten regions on one continuous overworld, seven sanctuaries and wardens, sixteen story scenes, one meaningful choice, and optional chests, wandering lights, and a sword upgrade.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/bell-of-ages-title.webp" alt="The Bell of Ages title screen." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-village.webp" alt="Alder Village and the Bell Sanctuary." width="1280" height="720" loading="lazy" /><figcaption>Alder Village.</figcaption></figure>
  <figure><img src="/images/games/bell-of-ages-story.webp" alt="Mira asks Alder to find the wandering light in the orchard." width="1280" height="720" loading="lazy" /><figcaption>A story scene with Mira.</figcaption></figure>
</div>

## What it's built with

The game is TypeScript on **Three.js** r186, built with Vite into plain static files. A few engineering choices do most of the work:

- **One height function.** Terrain rendering, character grounding, and camera clearance all sample the same deterministic function, so nothing floats or sinks.
- **Swept collision.** Movement and dodge rolls are swept circles against rotated boxes and tree trunks in a spatial hash, so fast rolls can't tunnel through fences, and you slide along walls instead of sticking.
- **Blade-accurate combat.** The sword's base-to-tip segment is sampled at 120 Hz across each swing and tested against enemy capsules, so hits that fall between frames still count.
- **A camera that respects walls.** The follow camera casts against obstacle heights, retracts immediately, eases back out, and re-checks its smoothed position so it can't clip through a corner.
- **Rendering on a budget.** Static scenery is batched by material and spatial cell, vegetation is instanced, wind-animated in the shader, and swapped to lighter versions at a distance, and an adaptive mode lowers 3D resolution under load before trimming effects.

There are no audio files. Every sound, from flute notes to sword swings, is synthesized with the Web Audio API.

## How it was made

All 31 models, including cottages, the sanctuary, a dungeon kit, props, trees, characters, and the warden, come from one deterministic Blender Python script, along with their procedural texture atlas. glTF Transform then compresses the export with Meshopt and WebP, from 13.3 MB down to a 2.4 MB runtime pack that passes the Khronos validator with zero errors. Two painted textures were made with an AI image-generation tool, with prompts recorded in the repository.

The game was developed with AI coding assistants following OpenAI's guide to [building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra), with 30 Vitest tests covering progression, story, saves, assets, collision, and combat, plus scripted in-browser checks. The trailer and screenshots are reproducible. A Playwright harness runs the game under a fake clock, so every frame advances the simulation by exactly 1/30 second, and records the game's own Web Audio output through an offline audio context.

## Play it

The Bell of Ages is a playable prototype at v0.1.0, with a complete story from opening to epilogue. [Download the web build](https://github.com/nearbycoder/Ocarina/releases/latest), unzip it, and serve the folder with any static file server, then open it in a desktop browser with WebGL 2. Keyboard and mouse are recommended. The README is upfront about its limits: all seven sanctuaries share one three-chamber layout, the wardens share one model, and there's no gamepad support yet.

[Browse the source on GitHub](https://github.com/nearbycoder/Ocarina). GitHub records the repository's creation on **October 4, 2026**.
