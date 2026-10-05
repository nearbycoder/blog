---
title: "Gravewake: The Hollow Tithe"
summary: "A first-person gothic arena roguelite built in Rust on a custom wgpu renderer, with 33 weapons, soul powers, location-based dismemberment, and Rapier ragdolls in a haunted cemetery."
role: "Creator"
genre: "Arena roguelite"
platforms: ["macOS"]
engine: "Custom Rust (wgpu)"
year: "2026"
createdAt: "2026-10-04"
stack: ["Rust", "wgpu", "WGSL", "winit", "egui", "Rapier", "rodio", "Blender"]
githubLink: "https://github.com/nearbycoder/gravewake"
featured: false
accent: "purple"
draft: false
image: "/images/games/gravewake-combat.webp"
imageAlt: "First-person combat against a mixed group of undead in the cemetery at night."
imageCaption: "Holding the line in Mournhollow, from the Gravewake README."
demoVideos:
  - src: "/videos/games/gravewake-trailer.mp4"
    title: "Gravewake gameplay trailer"
    caption: "The 42-second gameplay trailer, captured from the native game with in-game sound and no external soundtrack or narration. It edits together staged combat encounters, pack openings, a reload, body physics, and armory views; the opening and closing cards are editorial graphics. Re-encoded here at 540p."
    poster: "/images/games/gravewake-trailer-poster.webp"
    original: "https://github.com/nearbycoder/gravewake/blob/main/docs/media/gravewake-trailer.mp4"
---

**The dead rise. The living owe.** Gravewake is a first-person gothic arena roguelite. Fight through a ruined cemetery called Mournhollow, tear open weapon packs at the Collector's table, and turn the souls of the dead into a build that can survive the next descent. Clear twelve descents, face the Tithekeeper, then keep going in endless survival.

## Answer the bell

Mournhollow is a 96 × 96 metre arena with five connected districts: an open court, a ruined chapel, a cloister, a bell sanctuary, and a grave orchard. Ground hunters, flying creatures, summoners, and bosses pressure different parts of your build. Twelve enemy types include dive-bombing Gloamwings, six-legged Grave Crawlers, armoured Iron Penitents, exploding Plague Vessels, and blinking Tithe Reapers.

Where you hit matters. Headshots can detach skulls. Severed arms weaken attacks, losing a leg causes a limp, and losing both makes an enemy crawl. When something dies, it becomes a Rapier ragdoll built from whatever body sections survived, and those remains react to later impacts.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-ruined-chapel.webp" alt="The ruined chapel's stone archway at night, with a skeleton approaching from the left and the Worn Iron pistol in hand." width="1280" height="800" loading="lazy" /><figcaption>The Ruined Chapel district.</figcaption></figure>
  <figure><img src="/images/games/gravewake-mourning-court.webp" alt="The Mourning Court: braziers burn on either side of a stone court under a full moon." width="1280" height="800" loading="lazy" /><figcaption>The Mourning Court.</figcaption></figure>
  <figure><img src="/images/games/gravewake-bestiary.webp" alt="Gloamwing flying enemy in the bestiary." width="960" height="600" loading="lazy" /><figcaption>A Gloamwing in the bestiary.</figcaption></figure>
  <figure><img src="/images/games/gravewake-powers.webp" alt="Three soul powers offered during a level up." width="1280" height="800" loading="lazy" /><figcaption>Choosing a soul power.</figcaption></figure>
</div>

Every kill drops experience. Level up and combat pauses while you choose a soul power, such as orbiting blades, lightning, frost pulses, or stronger pickups.

## Three cards, one choice

Between descents, the Collector pays you in gold. Spend it on equipment and supplies, or tear open an Armory Pack: three cards, turn them over one at a time or all at once, then choose one to equip. Thirty-three weapons span six families, including revolvers, scatterguns, automatic weapons, grenade launchers, occult implements, and melee weapons like cleavers, rapiers, scythes, and flails. Burn, frost, venom, piercing, chain lightning, and life drain change how each one fights. The Binding lets you invest in a card's damage, speed, and mana, and finishing a path unlocks Soul Siphon.

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-packs.webp" alt="Three revealed weapon cards on the Collector's table." width="1280" height="800" loading="lazy" /><figcaption>A pack on the Collector's table.</figcaption></figure>
  <figure><img src="/images/games/gravewake-shotgun.webp" alt="Double shotgun in the armory with its damage and reload statistics." width="1280" height="800" loading="lazy" /><figcaption>The armory.</figcaption></figure>
  <figure><img src="/images/games/gravewake-occult.webp" alt="Ember Staff occult weapon card." width="1280" height="800" loading="lazy" /><figcaption>An occult implement.</figcaption></figure>
  <figure><img src="/images/games/gravewake-binding.webp" alt="The Binding upgrade paths for a weapon card." width="1280" height="800" loading="lazy" /><figcaption>The Binding.</figcaption></figure>
</div>

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/gravewake-hero.webp" alt="Gravewake: The Hollow Tithe, the bell above a haunted cemetery." width="1280" height="409" loading="lazy" /><figcaption>Title art.</figcaption></figure>
  <figure><img src="/images/games/gravewake-ash-orchard.webp" alt="The Ash Orchard at night: a lit brazier among pine trees and gravestones." width="1280" height="800" loading="lazy" /><figcaption>The Ash Orchard.</figcaption></figure>
  <figure><img src="/images/games/gravewake-melee.webp" alt="Butcher Cleaver melee weapon card and its statistics." width="1280" height="800" loading="lazy" /><figcaption>A melee weapon card.</figcaption></figure>
</div>

## What it's built with

Gravewake doesn't use a game engine. It's a custom Rust game layer and renderer built from libraries: **wgpu** for the GPU, **winit** for the window, **egui** for the menus and card UI, **Rapier 3D** for body physics, and **rodio** for audio. Lighting and post-processing are custom WGSL shaders. Creature geometry is GPU-instanced, static geometry is split into visibility batches, and only the six closest braziers contribute point lights. Models, textures, fonts, shaders, and sounds are embedded at compile time, so the game is a single executable with no asset downloads.

The weapons got a "weathered arsenal" pass: pitted iron with local corrosion, oxidized brass, worn walnut, and oil-darkened leather, from Blender material bakes packed into two texture atlases. UVs are attached to the model rather than the camera, so the texture doesn't swim across the surface while you aim or reload.

## How it was made

The twelve creatures are original Blender meshes, with recessed skull cavities, separate jaws and teeth, curved ribcages, and articulated hands and feet. They share the anatomical pose the game uses for hit regions, so headshots, dismemberment, and ragdolls use the same body parts you see. The architecture modules and seven of the weapons are also Blender-authored; the rest of the weapons are procedural Rust meshes. Blender is only an authoring tool, and the game doesn't need it to run.

Gravewake began as a study inspired by **Dark Veil — The Blackwood** by Thomas Ricouard ([@Dimillian](https://github.com/Dimillian)), and the repository keeps the reference credits. It isn't affiliated with that project, and the reference images and videos aren't redistributed. Some UI artwork is generated, with its provenance recorded in the repository, and the recorded firearm and reload sounds are CC0.

Testing runs at two levels. `cargo test` covers combat, progression, saves, geometry, and physics. A native smoke run opens a real window, fights a fixed eight-enemy wave under the normal combat rules, buys and opens a pack through real UI pointer events, equips a weapon, buys an upgrade, and enters the next round, saving screenshots as it goes.

## Play it

Gravewake is a playable development build, verified on Apple Silicon Macs with Metal. There's no release download yet. Install Rust, clone the repository, and run `cargo run --release --locked`, or use `./scripts/package-macos.sh` to build a local `.app`. Windows, Linux, and browser builds haven't been validated, and a keyboard and mouse are required.

[Browse the source on GitHub](https://github.com/nearbycoder/gravewake). GitHub records the repository's creation on **October 4, 2026**.
