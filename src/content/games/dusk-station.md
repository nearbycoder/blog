---
title: "Dusk Station"
summary: "A pixel-art exploration platformer for the browser: a lone surveyor works down through an abandoned research station at perpetual dusk, finding an air dash and magnetic boots on the way to a buried reactor and its overgrown guardian. The whole game is one HTML file of about 256 KB, drawn with Canvas 2D at 320×180, with every sound synthesized."
role: "Creator"
genre: "Exploration platformer"
platforms: ["Web"]
engine: "Custom Canvas 2D"
year: "2026"
createdAt: "2026-11-17T17:10:02Z"
stack:
  [
    "JavaScript",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/dusk-station/"
githubLink: "https://github.com/nearbycoder/dusk-station"
featured: false
accent: "violet"
draft: false
image: "/images/games/dusk-station.webp"
imageAlt: "The surveyor, in a white helmet and orange suit, leaps over the vine-draped SURVEY 3 transport at the landing site, with the DS-7 lander on the left and a dithered dusk sky fading from purple to orange."
imageCaption: "The landing site, where every run begins. A 320×180 screenshot from the Dusk Station repository, enlarged four times with nearest-neighbor scaling."
demoVideos:
  - src: "https://nearbycoder.github.io/dusk-station/assets/media/gameplay.mp4"
    title: "Dusk Station gameplay montage"
    caption: "The 16-second gameplay montage that loops at the top of the game's website until you press Play. The surveyor runs from the lander across the landing site and over the vine-draped transport, air-dashes across the collapsed concourse walkway, fights drones and a ceiling organism on the observation deck, wall-jumps up the coolant spire on the magnetic boots, and fights the Custodian in front of the reactor core, dashing through its floor charge, before a dithered fade to black. It's silent, 1280×720 at 60 fps, and served from the game's website."
    poster: "/images/games/dusk-station-trailer-poster.webp"
    original: "https://github.com/nearbycoder/dusk-station/blob/main/assets/media/gameplay.mp4"
---

Dusk Station is a pixel-art side-scrolling exploration game. A lone surveyor lands beside Outpost 7, an abandoned research station half swallowed by the planet, under a sun that never quite sets. Its uplink beacon is dark, its reactor is cold, and something luminous has grown through the machinery while the crew was gone. Work down through the station, recover an air dash and magnetic boots, wake the buried reactor, defeat the overgrown machine that guards it, and bring the beacon back online. A first run takes about 15 to 20 minutes.

The whole game is one self-contained HTML file, with no libraries and no image or audio files. Its own code draws the world, the characters and the interface with Canvas 2D at 320×180 and scales them up without smoothing, and every sound is synthesized with the Web Audio API. It plays with a keyboard, a controller or touch, either inside its website or full screen on a page of its own.

## Outpost 7

The station is fifteen hand-built rooms: fourteen in three regions, and Beacon Ridge on the surface. Each region has its own palette, parallax, drifting spores and ambient sound, so you can tell where you are even in the dark.

- **The Landing Complex**: the landing site, the concourse hub with a rest pod and a collapsed walkway to the reactor lift, the observation deck and the service shaft. Amber light falls through broken windows, and turquoise growth curls around dormant machinery.
- **The Flooded Laboratories**: the atrium, the specimen gallery, a lab shelter, the containment vault where the Warden Sentinel guards the air dash, and a pump shaft that opens a hatch back into the landing site. Cold tile, standing water and cracked specimen tanks.
- **The Buried Reactor**: the descent, the magnetics bay with the magnetic boots and a high shortcut door back to the atrium, the coolant spire where you release the core seal, the core shelter and the reactor core. Rust, heat, and a core the size of a hill that glows brighter the deeper you go.
- **Beacon Ridge**, reached by the surface lift after the final fight.

Terminals keep a little of what happened. One on the observation deck reads, "Day 1,903. The growth reached the windows today. It leans toward the light." Another stands in front of the specimen gallery's glass: "SPECIMEN 9 has outgrown tank C. Do not tap the glass. It taps back."

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-station-observation.webp" alt="The observation deck: amber dusk light pours through tall broken windows that frame dark towers, a gray security drone hovers at left, a ceiling organism hangs from the top, and the surveyor runs past a terminal toward a glowing pickup in a sealed chamber." width="1280" height="720" loading="lazy" /><figcaption>The observation deck, in the Landing Complex.</figcaption></figure>
  <figure><img src="/images/games/dusk-station-specimen.webp" alt="The specimen gallery: a huge dark creature drifts behind a wall of laboratory glass in teal light while the surveyor stands at a terminal under a W prompt, with a ceiling organism hanging at top left." width="1280" height="720" loading="lazy" /><figcaption>The specimen gallery, in the Flooded Laboratories.</figcaption></figure>
  <figure><img src="/images/games/dusk-station-descent.webp" alt="The reactor descent: a huge glowing orange reactor sphere sits at the top of a rust-colored shaft, and a security drone at left traces a dotted aiming line down to the surveyor on a riveted floor." width="1280" height="720" loading="lazy" /><figcaption>The reactor descent, in the Buried Reactor.</figcaption></figure>
</div>

## Dash, boots and bolts

You can see the reactor lift from the first hub, but you can't reach it yet. The air dash, a burst of thrust on the ground or in midair, carries you over the collapsed walkway and through the living membranes that seal some passages. The magnetic boots let you slide down walls and jump off them, which opens the climb up the coolant spire. Both upgrades change how you get through rooms you've already crossed, and shortcuts unlock from the far side, so trips back stay short. Jumps have coyote time, a jump buffer and variable height.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-station-concourse.webp" alt="The surveyor air-dashes over a gap in the concourse floor, trailing teal afterimages, past a DANGER sign, with amber light from windows on both sides and the glowing reactor lift at the right edge." width="1280" height="720" loading="lazy" /><figcaption>The air dash, over the collapsed walkway.</figcaption></figure>
  <figure><img src="/images/games/dusk-station-spire.webp" alt="The surveyor clings to a blue-lit steel wall high in the coolant spire's rust-brown shaft, above a ledge with pink spikes and a cone of orange lamplight, with a boot icon beside the health cells." width="1280" height="720" loading="lazy" /><figcaption>Wall-jumping up the coolant spire.</figcaption></figure>
</div>

The surveyor fires quick bolts forward, up or diagonally, and can shoot while running, jumping or crouching. Hold fire and release for a charged shot, which passes through enemies and costs one of three energy cells; they refill on their own. Cracked panels break under fire, and bolts can shoot enemy bolts out of the air. Hits land with a brief hit-stop and measured knockback, being hit gives you about a second of grace, and nothing but hazards can hurt you mid-dash.

Every enemy winds up before it strikes and recovers after, so a fight is about reading tells. Maintenance crawlers rear up and flash an eye before they lunge. Security drones keep their distance and paint a line before they fire. Ceiling organisms swell, drip and mark the floor below before they drop. Armored sentinels turn slowly behind a shield that bounces shots, so you jump over or dash through them and aim for the glow on their backs.

The Warden Sentinel, a bigger armored guard, holds the containment vault with the air dash inside. The Custodian, the reactor's ceiling-rail maintenance machine overrun by luminous growth, guards the core. It slams its claw to send shockwaves along the floor, fires spore volleys at marked landing spots, and charges at floor level, and in its second phase it chains those attacks faster. Its core opens after every pattern, and that's your window. A rest pod waits right outside the door.

<figure>
  <img src="/images/games/dusk-station-custodian.webp" alt="The Custodian, a boxy ceiling-rail machine covered in glowing turquoise growth with a bright yellow core, hangs in front of the huge orange reactor sphere while red spore landing marks dot the floor, the surveyor stands by the door at right, and its health bar sits half full along the bottom." width="1280" height="720" loading="lazy" />
  <figcaption>The Custodian, in its second phase.</figcaption>
</figure>

## Secrets and the map

Four suit cells, each adding a health cell, and a pulse amplifier that makes bolts hit harder and charge faster sit off the main path, behind cracked panels, membranes and wall-jump climbs. Each hiding place is signposted the same way, by cracked panels, exposed wiring, spores drifting out of a wall, or a chamber you can see but not reach. The station map only shows the rooms you've been to, plus the doors and barriers you've seen and the items you've glimpsed. Rest pods heal you and save, and the game also saves on upgrades, shortcuts and boss kills.

When the beacon is back on, the ending screen counts your time, items found out of seven, rooms explored out of fifteen, deaths and a completion percentage. Then you can keep exploring or start a new run.

<figure>
  <img src="/images/games/dusk-station-map.webp" alt="The station map: fifteen rooms drawn as outlined boxes in their region's colors, with door marks, rest pods and barrier icons, under the heading Magnetics Bay, Buried Reactor, and a footer reading Rooms 15/15 and Items 3/7 above a legend." width="1280" height="720" loading="lazy" />
  <figcaption>The station map, with each region in its own colors.</figcaption>
</figure>

## Keyboard, controller or touch

On a keyboard you move with A and D or the arrow keys, jump with Space (hold for height), fire with J, dash with K, use things and aim up with W, open the map with M and pause with Esc. Controllers go through the browser's Gamepad API with the standard layout: the left stick or d-pad to move, A to jump, X or the right trigger to fire, and B, a bumper or the left trigger to dash. Button prompts follow whichever device you used last and switch to Xbox, PlayStation or Nintendo labels to match the pad. There's light rumble, and unplugging a controller pauses the game. On a touchscreen, a d-pad sits under the left thumb, JUMP, FIRE and DASH sit on the right, and the map and pause buttons are at the top right; it's best in landscape.

Hints appear the first time you need them and name the buttons of whatever you're holding. A reduced-motion option turns off screen shake, parallax motion and hit-stop, and the game pauses itself when it loses focus.

## One file, drawn by code

`play/index.html` is the whole game: 4,431 lines and about 256 KB. It runs in order through core utilities and palettes, room data, the world and collision, input, audio and saving, the player, enemies, the boss, objects, game state and menus, rendering, and a fixed-step main loop. The only outside resources are two Google Fonts, Silkscreen and IBM Plex Mono, with monospace fallbacks offline.

The world draws into a 320×180 canvas that CSS scales up with no smoothing, by a whole number whenever the window is at least twice that size. Text and touch controls go on a second canvas at the screen's full resolution, so they stay sharp. Skies, shadows, light shafts and fades are ordered 4×4 Bayer patterns rather than gradients, and even see-through effects like water and membranes are dithered instead of blended. The website breaks a frame into seven layers: the sky, which scrolls at 0.18 of the camera's speed; the station silhouettes, at 0.48; the back wall; the tiles and scenery; the light shafts; the characters and effects; and the interface. Characters are assembled from small pixel parts, outlined automatically and cached for each pose.

<figure>
  <img src="/images/games/dusk-station-layers.webp" alt="One frame of the observation deck split into seven see-through layers stacked in perspective: the dusk sky at the bottom, then dark station silhouettes, the back wall with its window openings, the floor tiles, a band of dotted amber light, the surveyor with a drone, a ceiling organism and a pickup, and the health cells on top." width="1395" height="1129" loading="lazy" />
  <figcaption>The website's "Anatomy of a frame": one frame of the observation deck, pulled apart into its seven layers.</figcaption>
</figure>

Rooms are data. Each one is a list of tile rectangles plus its objects, enemies and scenery, and its parallax layers, back wall, tiles and light are painted procedurally the first time it's shown, then cached. All fifteen rooms are stitched into one tile grid, so collision carries straight across room edges.

<figure>
  <picture><source srcset="/images/games/dusk-station-rooms-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/dusk-station-rooms.webp" alt="JavaScript source: a comment block explaining the room format, then the Landing Site room as tile rectangles, objects (a suit cell, a hatch, a terminal reading UPLINK BEACON // RIDGE 4 and STATUS: OFFLINE, and a boots barrier), one crawler, and scenery including the transport, the lander, vines, DUSK STATION and OUTPOST 7 signs and amber lamps." width="1440" height="1281" loading="lazy" /></picture>
  <figcaption>The landing site's room data in <code>play/index.html</code>. The transport, the lander and the vines in the cover image are its <code>deco</code> entries.</figcaption>
</figure>

The simulation steps at a fixed 60 Hz, with 0.1 seconds of coyote time, a 0.135-second jump buffer, and movement split into steps of at most 4 pixels, so nothing tunnels through an 8-pixel tile. The camera snaps to whole pixels. All 41 sound effects, from footsteps and bolts to the enemies' tells, plus the charge hum, a drone for each region and a pulse during the boss fight, are oscillators and filtered noise in the Web Audio API. Sound stays off until you turn it on.

## The website

The repository's root is the game's website, served by GitHub Pages. Its first screen loops the gameplay montage under a Play now button; press it and the game loads in its place, in an iframe, with buttons below to go full screen or open it in a new tab. On a phone, Play opens the full-screen page instead, and a connected controller can start the game with A or Start. Further down are the story, the three regions with their color palettes, the features, an enemy roster that shows each enemy's sprite before and during its tell, a screenshot gallery, the exploded frame shown above, and control charts for keyboard, controller and touch.

## How it was made

The repository's three commits are all from November 17, 2026: an initial commit, then the game and the website together, then controller support about fifteen minutes later. Both of the later commits are co-authored by Claude. The game exposes a `window.DS` object for automated tests, with hooks to step the simulation frame by frame, press actions, teleport the surveyor to any room and read back its state. The README says tests use them for a scripted playthrough from a fresh save to the ending, randomized stress runs, save and reload checks and multi-touch tests in a headless browser, and the website says that's how several unfair jumps were found and fixed. The tests themselves aren't in the repository.

## Play it

Play it in your browser at [nearbycoder.github.io/dusk-station](https://nearbycoder.github.io/dusk-station/), or open [the game on its own, full screen](https://nearbycoder.github.io/dusk-station/play/), which is the better choice on a phone. There's nothing to install, and `play/index.html` also runs straight from disk. Turn sound on from the title or pause menu. Progress saves in the browser, and if storage is blocked the game still runs; it just can't save.

Dusk Station is one of three single-file pixel-art browser games set at dusk, all published on November 17, 2026, along with [Dusk Patrol](/games/dusk-patrol) and [Dusk Circuit](/games/dusk-circuit).

[Browse the source on GitHub](https://github.com/nearbycoder/dusk-station). The creation date shown here is the GitHub repository's UTC creation date. The screenshots, the station map, the gameplay montage and its poster come from the repository's `assets` folder, and the README says they were all captured from the game itself; the 320×180 screenshots are enlarged four times with nearest-neighbor scaling, the exploded frame is a capture of the website served locally from the repository, and the code excerpt is from `play/index.html`.
