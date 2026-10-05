---
title: "Pack The Trunk"
summary: "A cozy voxel packing puzzle about one family, thirty years, and one very full trunk: 33 trips, 11 vehicles, and 116 Blender-modelled items, every level proven solvable."
role: "Creator"
genre: "Packing puzzle"
platforms: ["Windows", "macOS", "Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:36:53Z"
stack: ["Unity 6", "C#", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/PackTheTrunk"
download: "https://github.com/nearbycoder/PackTheTrunk/releases/latest"
featured: false
accent: "orange"
draft: false
image: "/images/games/pack-the-trunk-packing.webp"
imageAlt: "Holding a suitcase over a sedan's trunk, with a green ghost showing where it will land."
imageCaption: "Packing a sedan, from the Pack The Trunk README."
demoVideos:
  - src: "/videos/games/pack-the-trunk-trailer.mp4"
    title: "Pack The Trunk trailer"
    caption: "The 1:50 trailer, with the game's lo-fi soundtrack and sound effects and on-screen captions; there is no narration. Recorded from the real game at a locked 30 fps with its audio captured in lockstep. Re-encoded here at 540p."
    poster: "/images/games/pack-the-trunk-trailer-poster.webp"
    original: "https://github.com/nearbycoder/PackTheTrunk/blob/main/docs/media/pack-the-trunk-trailer.mp4"
---

Every family has one person who can make anything fit. In 1998 it's Grandpa Joe, a little red wagon, a picnic at the creek, and his rule: _big things first, fragile on top, and always leave room for one more thing._ After that, you're the family's packer.

Each trip parks a car in the driveway next to a picnic blanket piled with stuff. Pack every **essential** into the trunk, then close it. Every **extra** you squeeze in raises your star rating, and whatever doesn't fit gets left on the curb.

## Turn it until it fits

Pick something up off the blanket, turn it, and drop it in. A green ghost shows where it will land; red means it won't fit, and the game tells you why. Three keys turn, tip, and roll the item around axes that follow the camera, so "tip it away from me" always means what you'd expect. The mouse wheel chooses between resting heights, on top of something or tucked into a gap underneath. Undo is unlimited.

The rules are short. Items snap to a grid and can't overlap the car, wheel wells, sloped hatch glass, toolboxes, or the clown who was already in the car. Everything has to rest on something. Fragile things, such as eggs, cakes, the garden gnome, and the lava lamp, can't have anything on top, so the order you pack in matters.

<div class="project-media-gallery">
  <figure><img src="/images/games/pack-the-trunk-fragile.webp" alt="A grocery bag held over the birthday cake: the cake is fragile, so nothing can go on top of it." width="1280" height="720" loading="lazy" /><figcaption>Nothing goes on the cake.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-clown-car.webp" alt="The Clown Car: a clown is already sitting in the trunk, so the tuba won't fit there." width="1280" height="720" loading="lazy" /><figcaption>The Clown Car.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-everyone-everything.webp" alt="Everyone, Everything: a minivan nearly full, with 23 of 25 things packed." width="1280" height="720" loading="lazy" /><figcaption>23 of 25 things in a minivan.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-slam.webp" alt="The sedan's trunk slams shut and confetti pops over the roof." width="1280" height="720" loading="lazy" /><figcaption>The slam.</figcaption></figure>
</div>

Close the trunk and it slams, confetti pops, the horn honks, and the car pulls out of the driveway. A postcard stamps your stars and lists what got left behind.

## A family story in 33 trips

Between puzzles, the family texts you. Over six chapters you pack for a grandmother's big move, a dorm, a festival, a wedding, a first house, and a nursery, until you're back in Grandpa's wagon teaching your own daughter. Heirlooms like Mr. Buttons the teddy bear, Grandpa's guitar, and the gnome keep coming back. The trunks get stranger, from a toy wagon and a Mini to a pickup, a convertible, and a moving truck, and so does the cargo: a giant rubber duck, a taxidermy moose head, six hundred records, a tiered wedding cake, and eventually the kitchen sink.

<div class="project-media-gallery">
  <figure><img src="/images/games/pack-the-trunk-story.webp" alt="Mom's texts on a phone next to the trip card for Weekend Getaway." width="1280" height="720" loading="lazy" /><figcaption>Texts from Mom before a trip.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-family-album.webp" alt="The family album: a polaroid of every packed trunk from 1998 to 2027." width="1280" height="720" loading="lazy" /><figcaption>The family album.</figcaption></figure>
</div>

Every trunk you close is photographed for the family album, one polaroid per trip from 1998 to 2027.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/pack-the-trunk-title.webp" alt="Title screen: the next trip's car parked in the driveway under the logo." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-postcard.webp" alt="The postcard: two stars, with the garden gnome and the box of cables left on the curb." width="1280" height="720" loading="lazy" /><figcaption>The postcard.</figcaption></figure>
  <figure><img src="/images/games/pack-the-trunk-trip-map.webp" alt="The trip map, paged by chapter, with stars for every trip." width="1280" height="720" loading="lazy" /><figcaption>The trip map.</figcaption></figure>
</div>

## What it's built with

Pack The Trunk is a **Unity 6** URP game whose data lives in one JSON file. An item's shape is a list of ASCII layers, where each string is a horizontal slice and letters map to a palette, so adding an item or a level is a text edit. `VoxelShape` handles the 24 possible orientations.

All rules live in `TrunkGrid`. It answers every question the game asks: does this fit, what's it resting on, is anything fragile above or below, and at which heights could it rest in this column. The error messages come from the same checks, which is why the game can always explain why something won't fit.

Everything is built at runtime. `GameController` bootstraps itself, and cars, the driveway, the UI, and even UI sprites are created in code and freed with their trip. The album photo is rendered when the trunk closes, read back from the GPU asynchronously, and encoded to PNG on a worker thread, so the best moment in the game doesn't hitch.

## How it was made

Pack The Trunk came first. The briefs for the Unity games that were built in parallel afterwards pointed each session to it as a read-only reference for working Unity and Blender pipeline patterns.

Every model is generated by Python in Blender: one builder per item, sized to the exact grid cells it occupies, and one body per level wrapped around that level's trunk, with the lid, tailgate, and wheels as separate objects so they can animate. A backtracking solver in `Tools/solve_levels.py` uses the same rules as the game and proves every level can be packed to 100%. Its solutions drive an autopilot that packs all 33 trips with real input events, the gameplay recorder, and the trailer.

Unlike most of the other games here, the music and many sound effects come from CC0 packs: TAD's "lofi Compilation" from OpenGameArt, Kenney's interface and impact sounds, and Thimras's park ambiences. The stingers, horn, engine, and whooshes are synthesized by a project script. It was developed with [Claude Code](https://claude.com/claude-code).

## Play it

Version 0.1.0 includes all 33 trips, the story, the album, menus, and settings. [Download it from GitHub releases](https://github.com/nearbycoder/PackTheTrunk/releases/latest). It's mouse and keyboard only for now.

[Browse the source on GitHub](https://github.com/nearbycoder/PackTheTrunk). GitHub records the repository's creation on **October 4, 2026**.
