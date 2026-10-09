---
title: "Gravewake: The Hollow Tithe"
summary: "A first-person gothic arena roguelite built in Rust on a custom wgpu renderer, with 33 weapons, soul powers, location-based dismemberment, Rapier ragdolls, controller support, and a four-step graphics fidelity setting, in a haunted cemetery."
role: "Creator"
genre: "Arena roguelite"
platforms: ["Linux", "macOS"]
engine: "Custom Rust (wgpu)"
year: "2026"
createdAt: "2026-10-04T21:38:20Z"
stack: ["Rust", "wgpu", "WGSL", "winit", "egui", "Rapier", "rodio", "Blender"]
githubLink: "https://github.com/nearbycoder/gravewake"
featured: false
accent: "purple"
draft: false
image: "/images/games/gravewake-combat.webp"
imageAlt: "First-person combat against the Tithekeeper and a mixed crowd of undead, with a headshot marker."
imageCaption: "Holding the line in Mournhollow at the Ultra fidelity step, from the Gravewake README."
demoVideos:
  - src: "/videos/games/gravewake-trailer.mp4"
    title: "Gravewake gameplay trailer"
    caption: "The 45-second gameplay trailer, re-recorded at the Ultra fidelity step after twelve rounds of improvements: combat against mixed creatures, brazier fire and shadows, a break-open reload, location damage and fracturing remains, a pack opened through the real menus, the Collector's preview of the next descent, a level-up, the pause ledger, the death recap and the title's chronicle. The sound is the game's own effects, menu sounds, ambience and adaptive score, with no narration. Encounters are staged, scripted runs; the captions and opening and closing cards are added in the edit. Re-encoded here at 540p."
    poster: "/images/games/gravewake-trailer-poster.webp"
    original: "https://github.com/nearbycoder/gravewake/blob/main/docs/media/gravewake-trailer.mp4"
---

**The dead rise. The living owe.** Gravewake is a first-person gothic arena roguelite. Fight through a ruined cemetery called Mournhollow, tear open weapon packs at the Collector's table, and turn the souls of the dead into a build that can survive the next descent. Clear twelve descents, face the Tithekeeper, then keep going in endless survival.

## Answer the bell

Mournhollow is a 96 × 96 metre arena with five connected districts: the Mourning Court, the Ruined Chapel, the Sunken Cloister, the Bell Sanctuary, and the Ash Orchard. Ground hunters, flying creatures, summoners, and bosses pressure different parts of your build. Twelve creature types include dive-bombing Gloamwings, six-legged Grave Crawlers, armoured Iron Penitents, exploding Plague Vessels, and blinking Tithe Reapers. The first time each one comes into clear view, a field note names it and says how to fight it.

Where you hit matters. Headshots can detach skulls. Severed arms weaken attacks, losing a leg causes a limp, and losing both makes an enemy crawl. When something dies, it becomes a Rapier ragdoll built from whatever body sections survived, and those remains react to later impacts. Reticle marks confirm hits, red arcs point to whatever just hurt you, and amber chevrons point to special attacks winding up out of view, each with its own warning sound.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-bestiary.webp" alt="Gloamwing flying creature in the bestiary." width="1280" height="720" loading="lazy" /><figcaption>A Gloamwing in the bestiary.</figcaption></figure>
  <figure><img src="/images/games/gravewake-powers.webp" alt="Three soul powers offered during a level-up over the blurred arena." width="1280" height="720" loading="lazy" /><figcaption>Choosing a soul power.</figcaption></figure>
</div>

Every kill drops experience. Level up and combat pauses behind a blurred veil while you choose a soul power, such as orbiting blades, lightning, frost pulses, or stronger pickups. Each run draws its own seed and shuffles each descent's creatures. The ending screen names the blow that killed you and the creature that hurt you most, and the title keeps your records and a chronicle of your last five runs.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-pause-ledger.webp" alt="Pause menu with the run so far on the left and every bound power on the right." width="1280" height="720" loading="lazy" /><figcaption>The pause ledger.</figcaption></figure>
  <figure><img src="/images/games/gravewake-death-recap.webp" alt="The ending screen naming the killing blow and summing up the run." width="1280" height="720" loading="lazy" /><figcaption>The death recap.</figcaption></figure>
</div>

## Three cards, one choice

Between descents, the Collector pays you in gold. Spend it on equipment and supplies, or tear open an Armory Pack: three cards, turn them over one at a time or all at once, then choose one to equip. Each card names its trait, how far one attack reaches, and its estimated damage per second against the weapon you hold. Thirty-three weapons span six families, including revolvers, scatterguns, automatic weapons, grenade launchers, occult implements, and melee weapons like cleavers, rapiers, scythes, and flails. Burn, frost, venom, piercing, chain lightning, and life drain change how each one fights. The Binding lets you invest in a card's damage, speed, and mana, and beside the way out, the Collector tells you what waits in the next descent.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-packs.webp" alt="Three revealed weapon cards on the Collector's table, each with its reach and damage estimate." width="1280" height="720" loading="lazy" /><figcaption>A pack on the Collector's table.</figcaption></figure>
  <figure><img src="/images/games/gravewake-collector.webp" alt="The Collector's table offering a weapon draw, a legendary weapon and the Hollow Chalice, with the next descent previewed." width="1280" height="720" loading="lazy" /><figcaption>The Collector previews the next descent.</figcaption></figure>
  <figure><img src="/images/games/gravewake-shotgun.webp" alt="Double shotgun in the armory with its damage and reload statistics." width="1280" height="720" loading="lazy" /><figcaption>The armory.</figcaption></figure>
  <figure><img src="/images/games/gravewake-occult.webp" alt="Ember Staff occult weapon card." width="1280" height="720" loading="lazy" /><figcaption>An occult implement.</figcaption></figure>
  <figure><img src="/images/games/gravewake-melee.webp" alt="Butcher Cleaver melee weapon card and its statistics." width="1280" height="720" loading="lazy" /><figcaption>A melee weapon card.</figcaption></figure>
  <figure><img src="/images/games/gravewake-binding.webp" alt="The Binding upgrade paths for a weapon card." width="1280" height="720" loading="lazy" /><figcaption>The Binding.</figcaption></figure>
</div>

## Settings and graphics fidelity

Gravewake plays with keyboard and mouse or a controller, and prompts follow whichever you touched last. Keys and controller buttons can be rebound, key names follow your keyboard layout, and a controller gets its own look speed and an aim assist that slows the stick near a visible creature without ever moving your aim. Settings include aim sensitivity, field of view, flash reduction, hold or toggle sprint, the reticle's size and colour, HUD size, a frame limit, and field tips. Menu buttons tick on hover and clack when pressed, screens fade in, and a synthesized score adds a heartbeat drum and strings as the crowd grows.

**Graphics fidelity** has four steps on the journal's Display page. High is the default and draws exactly what the game drew before the setting existed. Ultra renders at twice the resolution and supersamples it, adds shadows from the three nearest braziers, eight lights, finer occlusion, mist and bloom, 16× anisotropic filtering, and denser fire. On the one GPU it was measured on, the game's own passes took 0.82 ms on Low, 1.18 on Medium, 1.43 on High and 7.31 on Ultra at 1440×900.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-display.webp" alt="The journal's Display page with Graphics fidelity set to Ultra." width="1280" height="720" loading="lazy" /><figcaption>The Display page.</figcaption></figure>
  <figure><img src="/images/games/gravewake-hero.webp" alt="Gravewake: The Hollow Tithe title screen, the bell emblem over a moonlit cemetery." width="1280" height="374" loading="lazy" /><figcaption>Title art.</figcaption></figure>
</div>

## What it's built with

Gravewake doesn't use a game engine. It's a custom Rust game layer and renderer built from libraries: **wgpu** for the GPU, **winit** for the window, **egui** for the menus and card UI, **Rapier 3D** for body physics, **gilrs** for controllers, and **rodio** for audio. Lighting and post-processing are custom WGSL shaders, and the fire is a shader with layered flame tongues and sparks. Creature geometry is GPU-instanced and static geometry is split into visibility batches. Models, textures, fonts, shaders, and sounds are embedded at compile time, so the game is a single executable with no asset downloads.

The weapons got a "weathered arsenal" pass: pitted iron with local corrosion, oxidized brass, worn walnut, and oil-darkened leather, from Blender material bakes packed into two texture atlases. UVs are attached to the model rather than the camera, so the texture doesn't swim across the surface while you aim or reload.

## How it was made

The twelve creatures are original Blender meshes, with recessed skull cavities, separate jaws and teeth, curved ribcages, and articulated hands and feet. They share the anatomical pose the game uses for hit regions, so headshots, dismemberment, and ragdolls use the same body parts you see. Blender is only an authoring tool, and the game doesn't need it to run.

Gravewake began as a study inspired by **Dark Veil — The Blackwood** by Thomas Ricouard ([@Dimillian](https://github.com/Dimillian)), and the repository keeps the reference credits. It isn't affiliated with that project, and the reference images and videos aren't redistributed. Some UI artwork is generated, with its provenance recorded in the repository, and the recorded firearm and reload sounds are CC0.

After launch, Gravewake went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds brought it to Linux and added controllers, rebinding, settings, accessibility, records, the adaptive score, the next-descent preview and the fidelity steps. They also found that quick key taps never toggled sprint or fired, and that a failing sound device could write 395 MB of log lines; the game now carries on silently and reconnects. `cargo test` runs 173 tests, and smoke runs fight a wave and open a pack through the real UI with keyboard or controller inside a private, invisible KWin desktop.

The trailer is recorded by the game at Ultra in fixed time steps, so no frame is dropped, with the game's own full audio mix.

## Play it

Gravewake is a playable development build with no release download or browser build yet. Install Rust, clone the repository, and run `cargo run --release --locked`; scripts also package a Linux tarball and a local macOS app. It's been tested on Linux with an AMD Radeon GPU, macOS is built and tested in CI but hasn't been run on a Mac since the Linux work, Windows hasn't been built, and controllers have only been tested with simulated input.

[Browse the source on GitHub](https://github.com/nearbycoder/gravewake). GitHub records the repository's creation on **October 4, 2026**.
