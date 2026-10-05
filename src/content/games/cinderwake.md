---
title: "Cinderwake"
summary: "A clockwork action roguelite built in Rust on Macroquad: climb and descend a ruined brass city across three elevations, with responsive combat, pixel art, particles, and selective bloom."
role: "Creator"
genre: "Action roguelite"
platforms: ["macOS"]
engine: "Macroquad (Rust)"
year: "2026"
createdAt: "2026-10-04T21:02:57Z"
stack: ["Rust", "Macroquad", "GLSL", "Python"]
githubLink: "https://github.com/nearbycoder/Cinderwake"
featured: false
accent: "amber"
draft: false
image: "/images/games/cinderwake-combat.webp"
imageAlt: "Cinderwake combat with animated sprites, particles, and lighting."
imageCaption: "Clockwork combat with sprite animation, impact effects, and selective bloom. From the Cinderwake README."
demoVideos:
  - src: "/videos/games/cinderwake-trailer.mp4"
    title: "Cinderwake gameplay demo"
    caption: "The 40-second demo, with Cinderwake's original ambient music and no narration. It opens with 15 seconds of scripted combat using live physics, then follows a full vertical traversal; enemies and hazards are disabled during the traversal so the route stays visible. Re-encoded here at 540p."
    poster: "/images/games/cinderwake-demo-poster.webp"
    original: "https://github.com/nearbycoder/Cinderwake/blob/main/docs/media/cinderwake-demo.mp4"
---

**Carry the last fragment of a broken sun.** You are a small brass automaton in a city of copper, glass, and failing machinery. Fight across upper galleries, surface works, and buried chambers; collect equipment and memories; then carry your embers to the next bellgate before the city claims them back. At the top waits the Brass Regent.

## A city with depth

Every biome connects three elevations, from **upper galleries** to **surface works** to **undercroft**, through stairways, platforms, gaps, and drop shafts. Double-jump up into the galleries, drop through a ledge into the undercroft, and find connected routes back to the surface. A camera that follows on both axes, plus a full-height atlas, keeps track of the journey, and the layered backdrops change with both distance and elevation.

<div class="project-media-gallery">
  <figure><img src="/images/games/cinderwake-rooftops.webp" alt="Upper galleries against the moonlit rooftop skyline." width="1280" height="720" loading="lazy" /><figcaption>Above the city.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-undercroft.webp" alt="Underground route with the buried cistern backdrop." width="1280" height="720" loading="lazy" /><figcaption>Below the surface.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-foundry.webp" alt="The Ember Foundry's industrial scenery and molten light." width="1280" height="720" loading="lazy" /><figcaption>The Ember Foundry.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-crown.webp" alt="Crown of the Machine with its celestial clockwork backdrop." width="1280" height="720" loading="lazy" /><figcaption>Crown of the Machine.</figcaption></figure>
</div>

A run starts in the flooded galleries and waterwheels of the **Drowned Aqueduct**, then branches to either the **Glassroot Conservatory** or the **Ember Foundry**, before climbing to the **Crown of the Machine** and the Regent. The routes are authored, with seeded variation in enemies and rewards.

## Responsive combat, choices that carry

Chain melee strikes, reflect projectiles with directional parries, dodge through danger, fire glassbolts, throw fire vessels, and place arc snares. Hit-stop, camera shake, dodge afterimages, and event-driven particles sell every impact.

Chests swap your melee weapon for an upgraded random one, memories raise one of three stats, and forges temper your weapon for copper. Carried embers are banked when you reach a bellgate, and at the Keeper's rest you spend them on permanent vitality, flask capacity, or a mutation for the current run. Death resets your equipment and carried embers, but banked progress survives.

<figure>
  <img src="/images/games/cinderwake-atlas.webp" alt="The full-height atlas showing all three elevations and the camera footprint." width="1280" height="720" loading="lazy" />
  <figcaption>The atlas surveys all three elevations of a biome.</figcaption>
</figure>

## What it's built with

Cinderwake is a custom game framework in Rust on top of **Macroquad**, which supplies the window, input, GPU drawing, and audio. Everything else is Cinderwake's own code: the fixed-step simulation, platform physics, combat, enemy AI, progression, animation, rendering composition, and tools.

- **Simulation** runs at a fixed 120 Hz, independent of the render rate. Visual effects use their own random stream, so changing particle emission never changes gameplay randomness.
- **Movement** has acceleration, variable-height double jumps, coyote time, jump buffering, one-way platforms, deliberate drop-throughs, and an aerial ground slam.
- **Rendering** draws 640 × 360 world coordinates to a 1280 × 720 target with nearest-neighbour sampling, then applies separable selective bloom, per-biome color grading, a vignette, and up to eight dynamic combat lights, with an unfiltered fallback.
- **Particles** come from a bounded pool of 512: sparks, debris, smoke, dust, motes, shockwaves, and flashes.
- **Saves** are version-tolerant JSON written with atomic file replacement.

All runtime art, fonts, shaders, and audio are embedded in the executable.

## How it was made

The setting, characters, and encounters are original. Dead Cells was the initial reference for genre and feel, but no Dead Cells assets or code are used. The artwork, including character sheets, environments, animated scenery, vertical backdrops, and interface elements, was generated with an AI image-generation tool, and the original outputs and prompts are kept in the repository. Code at runtime then extracts connected silhouettes from the sprite sheets and anchors the sprites. The ambience and nine sound effects are synthesized by a Python script.

Tests cover physics, combat, progression, animation timing, effects, and multi-biome traversal, including a route follower that drives normal input through every tier and checks each exit is reachable and returnable. CI runs tests, Clippy with warnings as errors, and a format check. The README notes that rendered captures are a separate visual check, and passing tests alone don't prove visual quality.

## Play it

Cinderwake is a playable prototype, verified on Apple Silicon Macs. There's no release download. Install Rust, clone the repository, and run `cargo run --release --locked`, or build a local `.app` with `./scripts/package-macos.sh`. Gamepad support, control rebinding, and broader progression aren't implemented yet. The code and generated assets are MIT licensed.

[Browse the source on GitHub](https://github.com/nearbycoder/Cinderwake). GitHub records the repository's creation on **October 4, 2026**.
