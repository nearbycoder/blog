---
title: "Handle With Care"
summary: "A physics packing puzzle where you pack bizarre deliveries, from a sleeping armadillo to a sneezing dragon, then watch a deterministic journey decide whether they survive, with Mabel's hints, care meters, and an Overtime shift."
role: "Creator"
genre: "Physics puzzle"
platforms: ["Windows", "macOS", "Linux", "Web"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:16:44Z"
stack: ["Unity 6", "C#", ".NET", "Blender", "Python", "NumPy", "FFmpeg"]
link: "https://nearbycoder.github.io/HandleWithCare/"
githubLink: "https://github.com/nearbycoder/HandleWithCare"
download: "https://github.com/nearbycoder/HandleWithCare/releases/latest"
featured: false
accent: "orange"
draft: false
image: "/images/games/handle-with-care-ember-sneezes.webp"
imageAlt: "In the sorting depot the box is tipped on its side and Ember the dragon sneezes fire at the vase: ACHOO!"
imageCaption: "Ember sneezes in the sorting depot, at GRAPHICS FIDELITY ULTRA. From the Handle With Care README."
demoVideos:
  - src: "/videos/games/handle-with-care-trailer.mp4"
    title: "Handle With Care feature trailer"
    caption: "The 1:45 feature trailer, re-recorded at ULTRA after twelve rounds of improvements: the polished look and menus, care meters on the trip, the replay, the bench card after a failure, Ask Mabel's ghosts, an Overtime delivery, all 25 deliveries in the log, and Settings stepping from LOW to ULTRA. It uses the game's synthesized music and sound effects with on-screen captions; there is no narration. A trailer mode plays a data-driven shot list with real mouse and keyboard events on a fixed 30 fps clock. Re-encoded here at 540p."
    poster: "/images/games/handle-with-care-trailer-poster.webp"
    original: "https://github.com/nearbycoder/HandleWithCare/blob/main/docs/media/trailer.mp4"
---

You're the newest packer at the **Mossbury Parcel Post**, the only courier in town that will ship _anything_: a teacup that has survived three wars and one cat, Snoozles the armadillo (do not wake him), two magnets that must never meet, a potion that has to stay upright, a birthday balloon next to a cactus, and Ember, a tiny dragon with a cold.

Pack each order into a cardboard box with paper, bubble wrap, foam, dividers, shelves, and straps. Seal it with a long screech of tape. Then sit back and watch the parcel ride a delivery truck, a sorting depot, a careless courier, a ferry, a cargo plane, and a catapult.

## Spatial packing with personality

Everything sits on a grid and has to rest on something; balloons rest against the ceiling. Each of the 19 kinds of item has a quirk printed on its card. Fragile things break above their jolt limit, and tall things topple unless something supports their shoulders. Snoozles rolls over in his sleep and wakes up on a hard knock. Magnets pull each other from four cells away and stick for good. The ice swan melts near the lava lamp, the frog hops every few seconds, and Ember sneezes fire three cells ahead. While you pack, previews show where a sneeze will reach, which magnets will pull, and how far heat spreads.

The order card lists every knock on the route, with an arrow showing which wall it throws your items into. Padding is a trade-off: paper is cheap and a little soft, bubble wrap is softer, and foam is softest and fireproof. Every material costs money, and staying at or under par earns a star.

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-packing.webp" alt="Packing The Vase and the Dragon: the order card's route with a knock icon after each stop, Ember's item card open with its controls line, and his translucent ghost being placed next to the vase." width="1280" height="720" loading="lazy" /><figcaption>Packing a vase next to a dragon.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-box-on-fire.webp" alt="Ember sneezes at the hard brake and sets the cardboard box on fire." width="1280" height="720" loading="lazy" /><figcaption>BOX ON FIRE.</figcaption></figure>
</div>

## Watch the trip, then fix it

Seal the box and the journey plays out with a director camera that knows the future. It slows down and leans in just before something goes wrong, and shakes on the big hits. Every bump the box takes, whether a brake, pothole, belt drop, robot arm, chute, courier's toss, wave, air pocket, or catapult launch, is exactly what the contents feel. In the corner, a **care meter** for each item fills with its worst knock so far against its limit, turns amber past the "handled with care" line, and names the failure the moment it happens.

At the other end, the box lands on the customer's kitchen table, the tape is sliced, and each item rises into the light to get its rubber stamp: **PERFECT**, **RATTLED**, **SHATTERED**, **WIDE AWAKE**, **SPILLED**, **MELTED**, **POPPED**, or **BOX ON FIRE**. If something fails, the replay lets you scrub the trip in close-up and jump to each trouble spot, and back at the bench the last trip's trails mark exactly where it went wrong, such as "Vase shattered at the hard brake, jolt 11/8". **SAVE GIF** turns the trip's big moment into a looping animated GIF.

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-care-meters.webp" alt="The trip on the van: the tall vase has toppled at the hard brake and smashed, and the care meters in the corner name it SHATTERED." width="1280" height="720" loading="lazy" /><figcaption>Care meters during the trip.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-catapult.webp" alt="Express catapult: the box flies through the air." width="1280" height="720" loading="lazy" /><figcaption>Express service by catapult.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-ferry.webp" alt="The ferry deck on rough seas, with a big wave coming." width="1280" height="720" loading="lazy" /><figcaption>Rough seas on the ferry.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-unboxing.webp" alt="The unboxing: the vase rises out of the box with a green PERFECT stamp." width="1280" height="720" loading="lazy" /><figcaption>The vase arrives PERFECT.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-last-trip-trails.webp" alt="Back at the bench after a failed trip: the vase's trail, a red cross where it shattered, and its card saying it shattered at the hard brake." width="1280" height="720" loading="lazy" /><figcaption>Last trip's trails.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-doorstep.webp" alt="The last mile: the parcel is tossed onto the porch." width="1280" height="720" loading="lazy" /><figcaption>Dash on the doorstep.</figcaption></figure>
</div>

After a trip that missed a star, **Ask Mabel** for help. Her first hint is a note about the item at risk; the next ones show its exact spot as a ghost in the box, then her dividers and shelves, then her whole packing. Each ghost carries a check or a cross as you match it, so none of it depends on telling red from green, and hints never cost stars.

<figure>
  <img src="/images/games/handle-with-care-ask-mabel.webp" alt="Ask Mabel's fourth hint on The Vase and the Dragon: ghosts of her whole packing in the box, each marked with a check or a cross, and her note counting what is in place, in the way and extra." width="1280" height="720" loading="lazy" />
  <figcaption>Ask Mabel.</figcaption>
</figure>

There are twenty handcrafted deliveries over four shifts, each introducing a new idea, then five more in **Overtime**, which mixes quirks the story never shares a box: Ember beside an ice swan, a hopping frog with a balloon, and Mabel's own house move by catapult. Stars unlock six tape designs, from Kraft to Dragon Scale and Gold, and **Mabel's best**, the cheapest three-star packing the solver has found, waits for anyone stubborn enough to match it.

## Settings and graphics fidelity

Everything works with the mouse, with keyboard shortcuts that follow your layout's labels, or with a gamepad alone, with Xbox letters or PlayStation shapes. Settings include screen shake, **REDUCED MOTION**, **LARGER TEXT**, a packing grid, window size, VSync and a frame-rate limit. Menus fade in, and the button under the pointer or the pad's cursor gets a ring and a faint sheen.

**GRAPHICS FIDELITY** has four steps. HIGH is the default, with 4× MSAA, soft shadows, ambient occlusion, bloom and the background blur behind the unboxing and the review. ULTRA adds 125% supersampling, 4096 shadow maps in four cascades, soft shadows from the bench lamp, high-quality bloom, 16× anisotropic filtering, a sharper reflection probe and more particles. LOW is for weaker hardware. Frame times on the shared integrated Radeon it was measured on ranged from 5 to 18 ms, and only LOW was clearly the fastest there.

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-settings.webp" alt="Settings over the title screen, with the GRAPHICS FIDELITY steps LOW, MEDIUM, HIGH and ULTRA and ULTRA chosen." width="1280" height="720" loading="lazy" /><figcaption>Settings.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-results.webp" alt="Results: PERFECT DELIVERY with three stars and the customer's review." width="1280" height="720" loading="lazy" /><figcaption>Results.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-title.webp" alt="Title screen: the Handle With Care sign above the menu, with a taped parcel on the bench." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## What it's built with

The journey is a deterministic 2D physics simulation in pure C#, not Unity's physics. It runs at 240 Hz on axis-aligned bodies with sequential impulses, following a fixed-tick route of box movement, and it doesn't depend on the order items were placed in, so the same packing always gives bit-identical results. A whole journey simulates in a few tens of milliseconds on a worker thread while the tape gun is still sweeping. The journey, replay, director camera, care meters, unboxing, review, and trails all play back that one recording.

Impacts are measured per item and softened by whatever the item hits: walls are hard, paper is a little softer, bubble wrap much softer, foam softest. The quirks are rules layered on the same simulation step.

**Unity 6** and URP present it in 2.5D, with 3D Blender-modelled objects on top of the 2D simulation.

## How it was made

Handle With Care was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. The brief asked for twenty handcrafted deliveries with a simplified 2D physics system, deterministic and legible enough that failures could be understood and fixed. Its trailer moment: your perfectly packed vase survives, and then the tiny dragon beside it sneezes.

`Tools/SimCheck` compiles the exact simulation sources into a .NET console app. It proves every delivery has a valid three-star reference packing, checks that packing items without padding fails, and checks determinism. Its parallel local search sets each delivery's par and finds Mabel's best, and the built game's autopilot replays the same references through the real input path and compares hashes. Every 3D model is built by Python in Blender from bevelled primitives and voxel-fused organic shapes, with procedural PBR materials baked in Cycles, and every sound and music loop is synthesized with NumPy.

After launch, the game went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds added Ask Mabel, care meters, near misses and RATTLED stamps, the route's knock arrows, SAVE GIF, gamepad play, Overtime and the fidelity slider. They also found that the depth-of-field blur behind the unboxing and the review had never reached a build, because URP stripped the shader variants. The autopilot replays 118 reference and careless packings, alongside tours, pad, save, hint and layout pilots that run inside a private, invisible KWin desktop.

The trailer mode plays a data-driven shot list at ULTRA with real mouse and keyboard events on a fixed 30 fps game clock, so slow frames are drawn late, not dropped.

## Play it

Play it in your browser at [nearbycoder.github.io/HandleWithCare](https://nearbycoder.github.io/HandleWithCare/), with Overtime included. It's a WebGL build of about 71 MB, starting on MEDIUM, with saves kept in the browser; GIFs and photos become downloads.

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/HandleWithCare/releases/latest) for Linux. It's the October 4 launch build with the 20 story deliveries, but none of the improvements above; for the current game on the desktop, build it from source with Unity. A macOS app builds but hasn't been run on a Mac, and gamepads have only been tested as virtual devices.

[Browse the source on GitHub](https://github.com/nearbycoder/HandleWithCare). GitHub records the repository's creation on **October 4, 2026**.
