---
title: "Handle With Care"
summary: "A physics packing puzzle where you pack bizarre deliveries, from a sleeping armadillo to a sneezing dragon, then watch a deterministic journey decide whether they survive."
role: "Creator"
genre: "Physics puzzle"
platforms: ["Windows", "macOS", "Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:16:44Z"
stack: ["Unity 6", "C#", ".NET", "Blender", "Python", "NumPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/HandleWithCare"
download: "https://github.com/nearbycoder/HandleWithCare/releases/latest"
featured: false
accent: "orange"
draft: false
image: "/images/games/handle-with-care-ember-sneezes.webp"
imageAlt: "In the sorting depot the box is tipped on its side and Ember the dragon sneezes fire at the vase: ACHOO!"
imageCaption: "Ember sneezes in the sorting depot, from the Handle With Care README."
demoVideos:
  - src: "/videos/games/handle-with-care-trailer.mp4"
    title: "Handle With Care feature trailer"
    caption: "The 1:39 feature trailer, with the game's synthesized music and sound effects and on-screen captions; there is no narration. A trailer mode plays a data-driven shot list with real mouse and keyboard events on a fixed 30 fps clock. Re-encoded here at 540p."
    poster: "/images/games/handle-with-care-trailer-poster.webp"
    original: "https://github.com/nearbycoder/HandleWithCare/blob/main/docs/media/trailer.mp4"
---

You're the newest packer at the **Mossbury Parcel Post**, the only courier in town that will ship _anything_: a teacup that has survived three wars and one cat, Snoozles the armadillo (do not wake him), two magnets that must never meet, a potion that has to stay upright, a birthday balloon next to a cactus, and Ember, a tiny dragon with a cold.

Pack each order into a cardboard box with paper, bubble wrap, foam, dividers, shelves, and straps. Seal it with a long screech of tape. Then sit back and watch the parcel ride a delivery truck, a sorting depot, a careless courier, a ferry, a cargo plane, and a catapult.

## Spatial packing with personality

Everything sits on a grid and has to rest on something; balloons rest against the ceiling. Each of the 19 kinds of item has a quirk printed on its card. Fragile things break above their jolt limit, and tall things topple unless something supports their shoulders. Snoozles rolls over in his sleep and wakes up on a hard knock. Magnets pull each other from four cells away and stick for good. The ice swan melts near the lava lamp, the frog hops every few seconds, and Ember sneezes fire three cells ahead. While you pack, previews show where a sneeze will reach, which magnets will pull, and how far heat spreads.

Padding is a trade-off. Paper is cheap and a little soft, bubble wrap is softer, and foam is softest and fireproof. Every material costs money, and staying at or under par earns a star.

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-packing.webp" alt="Packing The Vase and the Dragon: Ember's item card is open and his translucent ghost is being placed next to the vase." width="1280" height="720" loading="lazy" /><figcaption>Packing a vase next to a dragon.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-box-on-fire.webp" alt="Ember sneezes at the hard brake and sets the cardboard box on fire." width="1280" height="720" loading="lazy" /><figcaption>BOX ON FIRE.</figcaption></figure>
</div>

## Watch the trip, then fix it

Seal the box and the journey plays out with a director camera that knows the future. It slows down and leans in just before something goes wrong, and shakes on the big hits. Every bump the box takes, whether a brake, pothole, belt drop, robot arm, chute, courier's toss, wave, air pocket, or catapult launch, is exactly what the contents feel.

At the other end, the box lands on the customer's kitchen table, the tape is sliced, and each item rises into the light to get its rubber stamp: **PERFECT**, **SHATTERED**, **WIDE AWAKE**, **SPILLED**, **MELTED**, **POPPED**, or **BOX ON FIRE**. If something fails, the replay lets you scrub the trip in close-up, and back at the bench the last trip's trails mark exactly where it went wrong, such as "Vase shattered at the hard brake, jolt 11/8".

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-catapult.webp" alt="Express catapult: the box flies through the air." width="1280" height="720" loading="lazy" /><figcaption>Express service by catapult.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-ferry.webp" alt="The ferry deck on rough seas, with a big wave coming." width="1280" height="720" loading="lazy" /><figcaption>Rough seas on the ferry.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-unboxing.webp" alt="The unboxing: the vase rises out of the box with a green PERFECT stamp." width="1280" height="720" loading="lazy" /><figcaption>The vase arrives PERFECT.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-last-trip-trails.webp" alt="Back at the bench after a failed trip: the vase's trail and a red cross where it shattered." width="1280" height="720" loading="lazy" /><figcaption>Last trip's trails.</figcaption></figure>
</div>

There are twenty handcrafted deliveries over four shifts, each introducing a new idea, with stars that unlock six tape designs, from Kraft to Dragon Scale and Gold.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/handle-with-care-title.webp" alt="Title screen: the Handle With Care sign above the menu, with a taped parcel on the bench." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-doorstep.webp" alt="Dash the courier tosses the parcel onto the porch." width="1280" height="720" loading="lazy" /><figcaption>Dash on the doorstep.</figcaption></figure>
  <figure><img src="/images/games/handle-with-care-results.webp" alt="Results: PERFECT DELIVERY with three stars and the customer's review." width="1280" height="720" loading="lazy" /><figcaption>Results.</figcaption></figure>
</div>

## What it's built with

The journey is a deterministic 2D physics simulation in pure C#, not Unity's physics. It runs at 240 Hz on axis-aligned bodies with sequential impulses, following a fixed-tick route of box movement, and it doesn't depend on the order items were placed in, so the same packing always gives bit-identical results. A whole journey simulates in a few tens of milliseconds on a worker thread while the tape gun is still sweeping. The journey, replay, director camera, unboxing, review, and trails all play back that one recording.

Impacts are measured per item and softened by whatever the item hits: walls are hard, paper is a little softer, bubble wrap much softer, foam softest. The quirks are rules layered on the same simulation step.

**Unity 6** and URP present it in 2.5D, with 3D Blender-modelled objects on top of the 2D simulation.

## How it was made

Handle With Care was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. The brief asked for twenty handcrafted deliveries with a simplified 2D physics system, deterministic and legible enough that failures could be understood and fixed. Its trailer moment: your perfectly packed vase survives, and then the tiny dragon beside it sneezes. The designer called it the strongest for funny, shareable clips. The commit history spans about ten hours on October 4, 2026.

`Tools/SimCheck` compiles the exact simulation sources into a .NET console app. It proves every delivery has a valid three-star reference packing, checks that packing items without padding fails, and checks determinism. Its parallel local search was used to set each delivery's par, and the built game's autopilot replays the same references through the real input path and compares hashes.

Every 3D model is built by Python in Blender from bevelled primitives and voxel-fused organic shapes, then given procedural PBR materials, such as glazed ceramic, plush, chrome, and timber, baked in Cycles to texture maps that URP reads directly. Every sound and music loop is synthesized with NumPy, and the UI is built at runtime in code, with no prefabs.

## Play it

Version 0.1.0 is complete: 20 deliveries, every one validated solvable with three stars. [Download it from GitHub releases](https://github.com/nearbycoder/HandleWithCare/releases/latest). It's mouse and keyboard only.

[Browse the source on GitHub](https://github.com/nearbycoder/HandleWithCare). GitHub records the repository's creation on **October 4, 2026**.
