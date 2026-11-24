---
title: "The Backrooms"
summary: "An endless first-person horror game for the browser, styled as found footage: walk out of the yellow Lobby into offices, concrete service passages and tiled Poolrooms that are generated as you go, mark your way with numbered floor tape, and listen for a second set of footsteps. It's built with Three.js on Kenney's CC0 textures, and the maze, its light, the figure that hunts you and every sound are generated in code."
role: "Creator"
genre: "First-person horror"
platforms: ["Web"]
engine: "Three.js"
year: "2026"
createdAt: "2026-11-23T23:15:58Z"
stack:
  [
    "JavaScript",
    "Three.js",
    "WebGL2",
    "GLSL",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "Web Workers",
    "Vite",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/backrooms/play/"
githubLink: "https://github.com/nearbycoder/backrooms"
featured: false
accent: "yellow"
draft: false
image: "/images/games/backrooms.webp"
imageAlt: "A Lobby corridor seen past the edge of a wall: yellow walls printed with a repeating pattern above a dark baseboard, a worn greenish carpet, and a stained drop ceiling with a bright recessed fluorescent fixture, with smaller lights receding down the corridor into the dark."
imageCaption: "A corridor in the Lobby, the hero image of the first version of the game's website."
demoVideos:
  - src: "https://nearbycoder.github.io/backrooms/media/trailer.mp4"
    title: "Gameplay trailer"
    caption: "The website's 25-second trailer, 720p at 24 frames per second with sound, under a camcorder overlay with REC, a running timecode, CAM_01, the district's name and TAPE 001. It walks through the Lobby past a LEVEL 0 stencil, the blue wallpaper and wood paneling of the Office Annex, the tiled Poolrooms with a shallow basin and an arched doorway, and the concrete rooms of Maintenance with the flashlight raised. Back in the Lobby, the Listener steps out from beside a pillar and walks up to the camera until the flashlight catches it, and the tape cuts to a title card. On the website it comes with an English captions track that describes the sound, from the fluorescent hum and footsteps on carpet to dripping water, a ringing pipe, heavier footsteps and tape hiss. It's served from the game's website."
    poster: "/images/games/backrooms-trailer-poster.webp"
    original: "https://github.com/nearbycoder/backrooms/blob/main/public/media/trailer.mp4"
---

The Backrooms is an endless first-person horror game for the browser, styled as found footage. Every expedition is a new tape with a running timecode, and every one starts in the Lobby: yellow wallpaper, worn carpet and humming fluorescent lights. Beyond it, connected rooms lead into the blue offices of the Office Annex, the bare concrete of Maintenance and the tiled Poolrooms, and they never run out. There's no exit to find. You walk, leave numbered tape on the floor to find your way back, and keep the recording going while something else walks the same rooms. When it ends, the game shows how long the tape ran, the farthest you got from the start and the districts you recorded.

It's built with Three.js on Kenney's Retro Textures Liminal pack, and the maze, its lighting, the figure that hunts you and every sound are generated in code. The game and its website, the Liminal Archive, are two pages that Vite builds from one repository, and the website opens on camera feeds recorded in the game, with a playable demo a click away.

## A second set of footsteps

Nine to twelve seconds into a recording, Signal interference appears on the HUD and a tall, thin figure stands ahead of you, usually just off to one side, at the end of a clear line 5.5 to 12.5 meters long. The website calls it the Listener. The first time, it's only a glimpse: it's gone after 2.4 seconds, or as soon as you come within 4.3 meters, hold the flashlight on it or lose sight of it. From then on, glimpses and hunts take turns, with 13 to 55 seconds of quiet between them, and most quiet stretches carry one incidental sound from the district you're in, like a ballast sagging in the Lobby, a chair creaking in the Office Annex, a pipe ringing in Maintenance or water dripping in the Poolrooms.

<figure>
  <img src="/images/games/backrooms-listener.webp" alt="A tall, thin figure with a dark olive body, long arms and a pale, mask-like head with deep-set eyes stands on a pale tiled floor in the Poolrooms, between walls of blue-white tile with a teal band at waist height, under a tiled ceiling and a strip light, with a yellow-walled Lobby room visible through a doorway behind it." width="1440" height="900" loading="lazy" />
  <figcaption>The Listener in the Poolrooms, in the still the website labels Encounter footage.</figcaption>
</figure>

A hunt starts with a knock and Footsteps nearby on the HUD. The figure appears at least 6.7 meters away, usually to one side of you or behind you, and stands for 3.4 seconds while its footsteps sound about once a second, panned toward it. Then it comes at 3.05 meters per second, faster than your walk, at 2.65, and slower than your sprint, at 7.6, heading for wherever it last saw you. While it hunts, the film grain thickens, and inside 3.2 meters the HUD warns Signal fading and a dark red shadow closes in at the edges of the frame. If it stays within 0.9 meters of you for 0.8 seconds, in sight and out of the light, the recording ends, and the Signal lost screen says the last sound on the tape is a second set of footsteps.

The README gives three ways out: shine the flashlight at it, outrun it, or turn a corner and stay out of sight. The beam works from within 18 meters, with the figure within about 20 degrees of where you're looking: it slows the Listener to 0.3 meters per second, and after 0.69 seconds in it, the Listener breathes, backs away and fades. It also gives up when it hasn't seen you for 2.9 seconds, when you're more than 18 meters off, or 34 seconds after it appeared. A full stamina bar lasts about ten seconds of sprinting and refills over 6.5 seconds after a half-second pause, and if you run it dry, you can't sprint again until it's back to 30 percent, or 55 if you're still holding Shift.

<div class="project-media-gallery">
  <figure><img src="/images/games/backrooms-closing-in.webp" alt="The Listener about two meters away in a Lobby room, a tall, dark olive figure with a pale, mask-like head and long arms filling the middle of the frame between yellow wallpapered walls, with the HUD's Signal fading message over its legs, two pale green tape arrows on the carpet, and THE LOBBY, N, 10 m MAX RANGE, REC 00:00:35 and LIGHT OFF on the HUD." width="1280" height="720" loading="lazy" /><figcaption>Closing in, about a second before the catch.</figcaption></figure>
  <figure><img src="/images/games/backrooms-flashlight.webp" alt="The flashlight held up in the lower right corner as the Listener stands in its beam about four and a half meters down a Lobby corridor, dark and thin against the yellow wallpaper, with Signal interference on the HUD, a pale green tape arrow on the carpet in the foreground, and LIGHT ON, THE LOBBY, SE and 15 m MAX RANGE on the HUD." width="1280" height="720" loading="lazy" /><figcaption>The flashlight on it, a moment before it recoils.</figcaption></figure>
</div>

<figure>
  <picture><source srcset="/images/games/backrooms-hunt-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/backrooms-hunt-code.webp" alt="JavaScript source, lines 188 to 228 of src/apparition.js: once the beam has been on the figure for 0.69 seconds, it breathes, the flashlight dips and it starts to recoil. If it hasn't seen the player for 2.9 seconds, is more than 18 meters away or has been out for 34 seconds, it rests for 24 to 55 seconds. Its footsteps play every 1.05 seconds while it waits and every 0.55 seconds after, panned toward it and louder as it nears, and after 3.4 seconds of waiting it starts its pursuit. It moves toward the spot where it last saw the player at 3.05 meters per second, or 0.3 in the beam, sliding along walls, the warning becomes Signal fading inside 3.2 meters, and contact builds while it's within 0.9 meters with a clear line and no beam on it, ending the recording at 0.8 seconds." width="1440" height="1581" loading="lazy" /></picture>
  <figcaption>The hunt in <code>src/apparition.js</code>, from the beam that drives the figure back to the 0.8 seconds that end the tape.</figcaption>
</figure>

## Four districts

The maze is built in 24-meter blocks. The first is always the Lobby, its four neighbors hold one district each, in an order set by the expedition's seed, and farther out the districts spread into wings several blocks across. The Lobby is yellow wallpaper over a dark baseboard, worn carpet and a stained drop ceiling with recessed fluorescent fixtures, some of them dim and warmer than the rest. The Office Annex has blue striped wallpaper over dark wood paneling and faded red carpet. Maintenance is bare concrete with exposed pipes and strip lights, and the Poolrooms are tiled from floor to ceiling, with tiled arches over some doorways and shallow basins you can wade straight across. Each district has its own light color, fog and fittings. The Lobby has clocks and boarded-up doors, the offices have notice boards, clocks and taped-up elevators marked OUT OF SERVICE, Maintenance has pipes, overhead conduits, HIGH VOLTAGE cabinets and more taped elevators, and the Poolrooms have NO DIVING tiles and taped PUMP ROOM doors. Here and there in the Lobby and the offices, a ceiling tile hangs open over the dark plenum.

<div class="project-media-gallery">
  <figure><img src="/images/games/backrooms-lobby.webp" alt="A Lobby corridor with yellow patterned wallpaper, a boarded-up wooden door with crossed planks on the left wall, a worn greenish carpet and a stained drop ceiling with recessed lights, opening onto more wallpapered rooms in the distance." width="1200" height="750" loading="lazy" /><figcaption>The Lobby.</figcaption></figure>
  <figure><img src="/images/games/backrooms-office.webp" alt="The Office Annex: blue striped wallpaper above dark wood paneling, a cork notice board with three pinned sheets on a pillar, a dark carpet, and a drop ceiling with a fluorescent fixture and a dark vent." width="1200" height="750" loading="lazy" /><figcaption>The Office Annex.</figcaption></figure>
</div>

Where two districts meet, the floor of one runs three meters into the other, so the carpet or tile changes a few steps away from the doorway where the walls and the light change. Footsteps are muffled in the carpeted districts and sharper on concrete and tile, and the fluorescent hum is loudest in Maintenance and quietest in the Poolrooms.

<div class="project-media-gallery">
  <figure><img src="/images/games/backrooms-maintenance.webp" alt="Maintenance: concrete panel walls with copper and gray-green pipes running up and along the wall, a pale green electrical cabinet with a yellow label, a concrete floor with rows of bolt holes, and strip lights on a grid ceiling over a wide room of square concrete columns." width="1200" height="750" loading="lazy" /><figcaption>Maintenance.</figcaption></figure>
  <figure><img src="/images/games/backrooms-poolrooms.webp" alt="The Poolrooms: walls of pale blue-white tile with a teal band, a tiled ceiling with strip lights, and a shallow rectangular basin of blue water set into the tiled floor, seen from a concrete threshold, with a red door far down the passage on the right." width="1200" height="750" loading="lazy" /><figcaption>The Poolrooms.</figcaption></figure>
</div>

## Keeping your bearings

Each expedition gets a new random seed, and every room is rebuilt from that seed and its position, so retracing your steps brings back the same rooms and landmarks while the next tape is different. The HUD names your district and shows a compass heading and your max range, the farthest you've been from the start in a straight line. E drops a strip of floor tape a step ahead of you, an arrow pointing the way you face, with its number printed on it, and the latest 24 stay down until the recording ends. Pausing shows the tape's length, its farthest range and the districts recorded so far.

## How it's built

Each block of the maze is a pure function of its coordinates and the seed. Inside one, a four-by-four grid of rooms with jittered walls is joined by a randomized spanning tree, so every room connects, and 28 to 52 percent of the remaining walls open up too, 54 in the Poolrooms, for loops and suites. About two-thirds of the openings are doorways in a partial wall, 1.75 to 4.85 meters wide, and the rest leave the whole side open. Each side of a block has a single opening, 2.7 to 4 meters wide, that both neighbors derive from the same hash, so the seams always meet. The block you start in has a hand-placed interior, apart from one wall that comes and goes, with a LEVEL 0 stencil on a pillar. The game keeps the 25 blocks around you, a 120-meter square, and builds new ones in a Web Worker, nearest first, and a block you come back to is rebuilt exactly as it was. The tests, run with Node's built-in test runner, check that blocks rebuild the same whatever order you find them in, that the seams of sampled blocks are walkable and reachable from inside each block, and that each district brings its own walls, floors and ceilings.

There are no light sources in the scene for the fluorescents. The worker cuts every wall, floor and ceiling into a grid of points no more than 95 centimeters apart, or 65 in the first block, and bakes the light into them: each point adds up the fixtures within about 8 meters, including those across a seam, skips any whose line to it crosses a wall, so partitions cast shadows, and darkens near other walls and where the walls meet the floor and ceiling. About five rooms in six get a fixture: recessed troffers in the Lobby and the offices, bare strips in Maintenance and sealed bulkheads in the Poolrooms, each tinted by its district. The room surfaces use Three.js Lambert materials with GLSL patched in through `onBeforeCompile`. The baked light scales only the ambient light, so the flashlight shows the true texture even in a shadow, and a noise tile sampled in world space adds wear, from matted carpet and traffic paths to damp rising up the wallpaper, water stains and return-air grilles in the ceiling, pores in the concrete and glazed tile that catches the strongest lamp. The basins shift the tiles beneath them as you move and reflect the strip light above.

The Kenney textures are 64 pixels wide, and the game uses 21 of them. It recomposes the Lobby wallpaper on a canvas to keep the molding and baseboard at a real scale while the printed pattern repeats more densely, and redraws the acoustic ceilings as 60-by-120-centimeter panels in the original tile's color. Everything else in the scene is drawn on a canvas or built from geometry in code, from the signs, the clock face and the tape arrows to the flashlight in your hand, made from lathe-turned shells with a band printed L-04 and a gloved thumb on the switch. The Listener is ten lofted shells with uneven outlines, a brow and deep eye sockets, posed as it walks and shaded to match the ceiling light that falls on it. The flashlight's beam projects a texture with a hotspot, a wide spill and a faint ring, and casts shadows.

A last pass gives the picture its camera look. The scene renders into a multisampled buffer, half-float where the GPU supports it, the brightest parts are blurred at a fifth of the resolution into a glow around the fixtures, and the image is slightly desaturated, adjusted by the brightness setting and rolled off in the highlights so the diffusers keep their pattern. The film grain and the REC overlay sit on top. Every sound is synthesized with the Web Audio API: the fluorescent hum, a 60-hertz tone with harmonics near 120 and 180 hertz and a slow flutter, footsteps made from bursts of filtered noise, with a faint ring on tile, the district sounds, and the Listener's footsteps, a low thump panned toward it.

Vite 7 builds the website and the game, at `/play/`, and Three.js 0.181 is the only runtime dependency. The game is 15 JavaScript modules, 5,129 lines, and the website's scripts are three more, 419 lines. On every push to `main`, a GitHub Actions workflow runs the tests, builds both pages with Node.js 24 and publishes them to GitHub Pages.

## The website

The website calls itself the Liminal Archive. Its hero is a camera viewfinder that plays one of four eight-second recordings captured in the game, The Lobby, Office Annex, Maintenance and Poolrooms, picked from a row of channels below it. They play muted, with a button for their ambient sound, and stay still if you've asked for reduced motion or turned on a data saver. Play demo opens the game in a dialog on the page and starts an expedition as soon as it has loaded, and none of the game's code loads until you press it. Watch trailer opens the trailer in another dialog, with English captions available. Below the hero are a district index whose photographs open into a gallery with field notes, a field guide that pairs the Listener's picture with a link that replays the encounter in the trailer, and the controls for keyboard and mouse, controller and touchscreen.

<figure>
  <img src="/images/games/backrooms-website.webp" alt="The Liminal Archive homepage tuned to the Poolrooms: the CAM 04 / POOLROOMS feed of a tiled room with a shallow basin plays behind THE BACKROOMS in large letters, Found footage horror, the line Explore an endless maze of fluorescent rooms. Stop walking. Listen for the footsteps that keep going., Play demo and Watch trailer buttons, and a row of four camera feeds, The Lobby, Office Annex, Maintenance and Poolrooms, along the bottom." width="1440" height="810" loading="lazy" />
  <figcaption>The website, tuned to the Poolrooms feed.</figcaption>
</figure>

## How it was made

The repository has four commits, all dated November 23, 2026. The first, a README stub and the icon, came almost five hours before the rest. The second published the game and the first version of the website, with the trailer, the district photographs, the textures and the Pages workflow. Two minutes later, a commit gave the game a loading state on its title screen and fit the website's navigation on narrow phones, and eleven minutes after that, the last one turned the website into an interactive demo, with the four camera feeds and the playable dialog. The textures come from Kenney's Retro Textures Liminal 1.0 pack, which the README gives as CC0, and the pack's license file is in `public/textures`. The website's footer credits the textures to Kenney. The fonts, Barlow Condensed and IBM Plex Mono, are under the SIL Open Font License, and Three.js is under the MIT license.

## Play it

Play [in your browser](https://nearbycoder.github.io/backrooms/play/), or start from [the website](https://nearbycoder.github.io/backrooms/), which has the trailer, the camera feeds and the playable demo. It needs WebGL 2 and plays on desktop or mobile, and it pauses when its window loses focus. Move with W A S D or the up and down arrows, look with the mouse, by dragging or with the left and right arrows, hold Shift to sprint, and press F for the flashlight, E to drop tape and Esc to pause. On an Xbox or PlayStation controller, press a button to connect it, then move and look with the sticks, sprint by holding LB or L1 or by clicking and holding the left stick, toggle the light with Y or Triangle, drop tape with X or Square and pause with Menu or Options. Unplugging the controller pauses the game. On a touchscreen, drag on the left half to move and on the right to look, and use the Run, Light, Mark and pause buttons. Settings, on the title screen and in the pause menu, cover the master, ambience and effects volume with a test sound, brightness, a field of view from 55 to 88 degrees, bloom, film grain, a steadier camera, and look sensitivity with inverted controller look, and they're saved in the browser. A first visit downloads about 420 KB, or about 1 MB uncompressed, the largest part of it the game's script with Three.js.

To run it locally with Node.js 22.12 or newer, clone the repository, run `npm ci` and `npm run dev`, and open the address Vite prints, adding `play/` for the game. `npm test` runs the world and controller tests.

[Browse the source on GitHub](https://github.com/nearbycoder/backrooms). The creation date shown here is the GitHub repository's UTC creation date. The cover is the hero image of the website's first version, still in the repository's `public/media` folder, shrunk with Lanczos resampling. The Listener picture is the website's Encounter footage still, and the four district pictures are its field photographs, used as they are. The Listener closing in and the flashlight pictures were captured for this page from the live game in headless Chromium on Linux with an AMD Radeon 8060S, and shrunk from 1440 × 810 with Lanczos resampling, and the website picture was captured from the live website the same way. The trailer and its poster are the website's own, and the code excerpt is from `src/apparition.js`.
