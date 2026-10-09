---
title: "Cinderwake"
summary: "A clockwork action roguelite built in Rust on Macroquad: climb and descend a ruined brass city across three elevations, with responsive combat, pixel art, selective bloom, controller support, and a four-step graphics fidelity setting."
role: "Creator"
genre: "Action roguelite"
platforms: ["macOS", "Linux", "Web"]
engine: "Macroquad (Rust)"
year: "2026"
createdAt: "2026-10-04T21:02:57Z"
stack: ["Rust", "Macroquad", "GLSL", "Python"]
githubLink: "https://github.com/nearbycoder/Cinderwake"
featured: false
accent: "amber"
draft: false
image: "/images/games/cinderwake-combat.webp"
imageAlt: "The hero runs at a guardian winding up an attack, with a warning mark over its head and its reach drawn on the ground."
imageCaption: "A guardian warns before it strikes. Drawn by the game at graphics fidelity Ultra, from the Cinderwake README."
demoVideos:
  - src: "/videos/games/cinderwake-trailer.mp4"
    title: "Cinderwake trailer"
    caption: "The 43-second trailer, re-recorded at graphics fidelity Ultra after twelve rounds of improvements, with the game's own music and the effects those frames played; there is no narration. It opens with a scripted fight using live physics and combat, follows the route from the upper galleries into the undercroft (guardians removed so the route stays visible), tours all four biomes, and ends on the Regent's arena and the menus. Re-encoded here at 540p."
    poster: "/images/games/cinderwake-demo-poster.webp"
    original: "https://github.com/nearbycoder/Cinderwake/blob/main/docs/media/cinderwake-demo.mp4"
---

**Carry the last fragment of a broken sun.** You are a small brass automaton in a city of copper, glass, and failing machinery. Fight across upper galleries, surface works, and buried chambers; collect equipment and memories; then carry your embers to the next bellgate before the city claims them back. At the top waits the Brass Regent.

## A city with depth

Every biome connects three elevations, from **upper galleries** to **surface works** to **undercroft**, through stairways, platforms, gaps, and drop shafts. Double-jump up into the galleries, drop through a ledge into the undercroft, and find connected routes back to the surface. The camera follows on both axes and runs ahead of a fall so you see where you'll land; hold down while standing to look below the ledge. A full-height atlas maps all three elevations as you explore, with its own mark for each kind of object, so a forge or sealed cache you passed is easy to find again.

<div class="project-media-gallery">
  <figure><img src="/images/games/cinderwake-rooftops.webp" alt="The hero crossing the upper galleries against the rooftop skyline at dusk." width="1280" height="720" loading="lazy" /><figcaption>Above the city.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-undercroft.webp" alt="Underground route with the buried cistern backdrop." width="1280" height="720" loading="lazy" /><figcaption>Below the surface.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-foundry.webp" alt="The Ember Foundry's industrial scenery and molten light." width="1280" height="720" loading="lazy" /><figcaption>The Ember Foundry.</figcaption></figure>
  <figure><img src="/images/games/cinderwake-crown.webp" alt="The hero facing the Brass Regent in the Crown of the Machine, under its celestial clockwork." width="1280" height="720" loading="lazy" /><figcaption>Crown of the Machine.</figcaption></figure>
</div>

A run starts in the flooded galleries and waterwheels of the **Drowned Aqueduct**, then branches to either the **Glassroot Conservatory** or the **Ember Foundry**, before climbing to the **Crown of the Machine** and the Regent. The routes are authored, with seeded variation in enemies and rewards.

## Responsive combat, choices that carry

Chain melee strikes, reflect projectiles with directional parries, dodge through danger, fire glassbolts, throw fire vessels, and place arc snares. Hit-stop, camera shake, dodge afterimages, and event-driven particles sell every impact. A press made up to 0.15 seconds before its move is ready still happens as soon as it is, and a press that comes too early briefly outlines its slot on the HUD. Every guardian warns before it attacks, with a mark over its head, the reach of its strike on the ground, or the line of an archer's aim. One winding up out of view, or a bolt flying in from off screen, gets a marker at the screen's edge.

Chests raise your weapon tier and offer a random weapon to take or leave, memories raise one of three stats, and forges temper your weapon for copper; every prompt says what it needs and gives. Carried embers are banked when you reach a bellgate, and at the Keeper's rest you spend them on permanent vitality, flask capacity, or a mutation for the current run. Death resets your equipment and carried embers, but banked progress survives, and a recap names what ended the run and compares it with your records. Closing the game mid-run keeps the run from its last checkpoint.

<figure>
  <img src="/images/games/cinderwake-atlas.webp" alt="The full-height atlas showing all three elevations, the camera footprint, and a mark for each kind of object." width="1280" height="720" loading="lazy" />
  <figcaption>The atlas surveys all three elevations of a biome.</figcaption>
</figure>

## Settings and graphics fidelity

Cinderwake plays on keyboard, mouse, or controller, and on-screen prompts follow whichever you used last. Every menu works with the mouse alone, and gameplay keys can be rebound. The options page has music and effects volume, screen shake, hit-stop, **reduce flashes**, a **game speed** from 50% to 100% for players who need more time to react, one-time tips, and fullscreen. The game pauses when its window loses focus or a controller is removed, and it draws motion between simulation steps, so play stays even at any refresh rate.

**Graphics fidelity** has four steps, on the options page or **F9**. Low turns off bloom, lighting and colour grading for slower graphics. Medium and High, the default, add bloom, combat lights and grading, with even-pixel scaling at any window size. Ultra draws the world at 2560×1440 and filters it down, samples the art from mipmaps, lets lamps, forges, wells and the bellgate light their surroundings with up to sixteen lights, and adds a wide bloom halo and half again as many sparks. On the shared development GPU, Low, Medium and High cost about the same and Ultra 15 to 25% more.

## What it's built with

Cinderwake is a custom game framework in Rust on top of **Macroquad**, which supplies the window, input, GPU drawing, and audio. Everything else is Cinderwake's own code: the fixed-step simulation, platform physics, combat, enemy AI, progression, animation, rendering composition, and tools.

- **Simulation** runs at a fixed 120 Hz, independent of the render rate, and is drawn between steps. Visual effects use their own random stream, so changing particle emission never changes gameplay randomness.
- **Movement** has acceleration, variable-height double jumps, coyote time, jump buffering, one-way platforms, deliberate drop-throughs, and an aerial ground slam.
- **Rendering** draws 640 × 360 world coordinates to a 1280 × 720 target with nearest-neighbour sampling (2560 × 1440 with mipmapped art on Ultra), then applies separable selective bloom, per-biome color grading, a vignette, and dynamic combat lights.
- **Particles** come from a bounded pool: 512 by default, 256 on Low and 1,024 on Ultra.
- **Saves** are version-tolerant JSON written with atomic file replacement; a damaged file is kept aside rather than overwritten.
- **Controllers** work on the desktop through gilrs and in the browser build through the Gamepad API.

All runtime art, fonts, shaders, and audio are embedded in the executable, so the experimental browser build is a single 52 MB WebAssembly file.

## How it was made

The setting, characters, and encounters are original. Dead Cells was the initial reference for genre and feel, but no Dead Cells assets or code are used. The artwork, including character sheets, environments, animated scenery, vertical backdrops, and interface elements, was generated with an AI image-generation tool, and the original outputs and prompts are kept in the repository. The score, with a loop for each biome, and seventeen sound effects are synthesized by a Python script.

After launch, Cinderwake went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds added the settings and accessibility options, controller and mouse support, saving mid-run, the off-screen warnings, input buffering, the camera's look-ahead, the browser build and the fidelity steps. The test suite has 177 tests covering physics, combat, progression, settings, saving, menus driven by keyboard, mouse and controller, and multi-biome traversal, and Clippy runs with warnings as errors on both the native and WebAssembly builds.

The trailer is recorded by the game itself: a capture-only mode saves frames at a fixed simulated rate and logs which sound cues each frame played, and a Python script mixes the game's own music and effects under the cut.

## Play it

Cinderwake is a playable prototype with no release download or hosted version yet. Install Rust, clone the repository, and run `cargo run --release --locked`. Scripts also build a local macOS app, a portable Linux tarball, and the experimental browser build. It was checked on macOS on Apple Silicon at launch and on Linux since; Windows hasn't been tried, controllers have only been tested as simulated devices, and balance hasn't been playtested. The code and generated assets are MIT licensed.

[Browse the source on GitHub](https://github.com/nearbycoder/Cinderwake). GitHub records the repository's creation on **October 4, 2026**.
