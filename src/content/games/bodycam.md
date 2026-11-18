---
title: "Bodycam: Operation Blackout"
summary: "A single-player first-person shooter for the browser, played through a body camera: find and disable fourteen hostile inspection drones across four floors of a derelict industrial annex with a service pistol and a compact carbine. It's built with Three.js, its first corridor is a walkable reconstruction of a 23-second body-camera clip, and its scanned textures load at up to 4K."
role: "Creator"
genre: "First-person shooter"
platforms: ["Web"]
engine: "Three.js"
year: "2026"
createdAt: "2026-11-18T17:58:17Z"
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
link: "https://nearbycoder.github.io/bodycam/play/"
githubLink: "https://github.com/nearbycoder/bodycam"
featured: false
accent: "lime"
draft: false
image: "/images/games/bodycam.webp"
imageAlt: "First-person view down a derelict corridor: gloved hands hold a black compact carbine at the lower right, and a white and black quadrotor drone with a camera slung beneath it hovers ahead beside a wall of faded red graffiti, with daylight from tall windows on the left falling across a floor strewn with rubble and paper."
imageCaption: "An inspection drone in the intake corridor, in the website's in-engine hero capture, shrunk here. The carbine and the gloves holding it are ImageGen artwork that the game animates."
demoVideos:
  - src: "https://nearbycoder.github.io/bodycam/press/briefing.mp4"
    title: "In-engine tour of the annex"
    caption: "The 12-second clip behind the website's Watch footage button, a lighter copy of the repository's graphics preview. With the service pistol drawn, it starts in the intake corridor, where a drone hovers by a doorway, then cuts to the motor bay and its parked coupe, the basement's pump room, the archive stacks on the records floor and the roof plant under a cloudy sky. It's silent, 1280×720 at 30 fps, and served from the game's website."
    poster: "/images/games/bodycam-trailer-poster.webp"
    original: "https://github.com/nearbycoder/bodycam/blob/main/public/press/briefing.mp4"
  - src: "https://nearbycoder.github.io/bodycam/press/handling.mp4"
    title: "Weapon handling"
    caption: "The 8-second clip behind the website's Watch the reload button, captured in the intake corridor with the HUD showing Xbox controller prompts. The service pistol fires twice at a drone and reloads. An orb from the drone hits as the player switches to the compact carbine, flashing the view red and taking the armor from 100 to 78, then three carbine rounds bring the drone down and the carbine reloads. It has sound, it's 960×540 at 30 fps, and it's served from the game's website."
    poster: "/images/games/bodycam-handling-poster.webp"
    original: "https://github.com/nearbycoder/bodycam/blob/main/public/press/handling.mp4"
---

Bodycam: Operation Blackout is a single-player first-person shooter for the browser, seen through the lens of a body camera. The inspection drones in a derelict industrial annex have turned hostile, and you have to find and disable all fourteen of them, from the pump room in the basement to the plant on the roof, with a service pistol and a compact carbine. The camera sets the look: a wide lens, sway as you walk, grain, and exposure that shifts as you pass from dim rooms into daylight.

A drone only spots you within 13 meters and with a clear line of sight. When it does, it turns to face you, flashes amber, and a little under a second later launches an energy orb at the spot where you stood, so there's time to step behind a wall or a machine. Cover stops its orbs and your shots alike. Each orb that lands takes 22 points of armor, and armor recovers after about six seconds without a hit. Most drones go down after two hits, and three of them take a third. If your camera goes offline, you redeploy a little way back, and the drones you've already disabled stay down. Press Q to scan, and the game plots a route to the nearest drone through doorways and up the stairs, with a marker on screen that leads the way and counts down the meters.

## Four floors

Two switchback stairwells join four playable levels. You start on the ground floor in the intake corridor, the part of the building rebuilt from the body-camera footage, and its side rooms open onto the works gallery: dispatch, switchgear and a motor bay with a parked coupe. Below, pressure vessels, gauges and switchboards crowd the utility basement's pump room, and a service gallery leads on to the boiler room, the valve shop and the service stores. Upstairs, the records floor holds document intake, archive stacks, a survey office and a map room, and a link gallery leads back to the west stairs. At the top of the east stair, the roof plant is out in daylight among condenser banks, pipe runs and an aerial mast, on a roof darkened by rain. Three drones patrol the corridor and its side rooms, three each hold the basement, the works gallery and the records floor, and the last two are on the roof.

<div class="project-media-gallery">
  <figure><img src="/images/games/bodycam-basement.webp" alt="Two pale green pressure vessels with pipes rising to the ceiling and red valve wheels stand against a stained concrete wall under a fluorescent strip, beside a bank of dark green switchboard cabinets with round gauges." width="1200" height="675" loading="lazy" /><figcaption>The pump room in the utility basement, B1.</figcaption></figure>
  <figure><img src="/images/games/bodycam-works.webp" alt="A red coupe with dark multi-spoke wheels parked in a concrete room with tall windows and fluorescent tubes, a yellow line painted on the floor and a steel cabinet in the far corner." width="1200" height="675" loading="lazy" /><figcaption>The motor bay on the works floor, G. The coupe is adapted from the Car Concept model credited below.</figcaption></figure>
  <figure><img src="/images/games/bodycam-records.webp" alt="Steel shelving racks of cardboard archive boxes with printed labels such as RECORDS / EAST, under fluorescent tubes in a concrete room with peeling plaster." width="1200" height="675" loading="lazy" /><figcaption>The archive stacks on the records floor, 01.</figcaption></figure>
  <figure><img src="/images/games/bodycam-roof.webp" alt="A gloved hand with a pistol beside a gray condenser unit with two caged fans on a wet, flat roof, with two white geodesic radar domes, one torn and covered in graffiti, beyond the parapet under an overcast sky." width="944" height="531" loading="lazy" /><figcaption>The roof plant, 02. The radar domes on the horizon belong to the rooftop panorama, which derives from Greg Zaal's Teufelsberg Roof.</figcaption></figure>
</div>

## Drones, pistol and carbine

The inspection drones are modeled in code: a lofted shell from the battery door to the nose, four rotors whose blades change pitch, chord and sweep along their span, twin obstacle sensors in the nose, and a camera hung below on elastomer suspension. Each one hovers in a loop sized to the room around it, and several times a second it checks whether it can see you.

<div class="project-media-gallery">
  <figure><img src="/images/games/bodycam-drone.webp" alt="A white and black quadrotor with four arms, a large camera lens slung below its body, small amber lights and landing legs, hovering low in the sunlit corridor among rubble and scattered paper." width="992" height="558" loading="lazy" /><figcaption>An inspection drone in the intake corridor.</figcaption></figure>
  <figure><img src="/images/games/bodycam-pistol.webp" alt="First-person view of a gloved hand firing a pistol down the graffiti-covered corridor at a drone whose camera ring glows orange, with a muzzle flash. The HUD reads UNIT 4417 / INTAKE CORRIDOR, 14 drones active, armor 100, service pistol 10 of 12, a route marker reading 6 m, and a strip of Xbox button prompts." width="1280" height="720" loading="lazy" /><figcaption>The service pistol firing at a drone. The HUD shows the drones left, armor, ammunition and a scan's route marker.</figcaption></figure>
</div>

The service pistol holds 12 rounds and fires up to four times a second, and the compact carbine holds 24 and fires about seven. A reload takes about 1.5 seconds with the pistol and 1.9 with the carbine, a little longer from an empty magazine, and the count refills only as the weapon comes back to the ready. Right-click or the left trigger narrows the view for a focused aim, and you can't fire while sprinting. Each weapon has its own reload, holster, draw and recoil timing, and the hand, the magazine and the weapon move separately: the empty magazine falls out of the bottom of the frame while the replacement comes in carried between palm and fingertips. R reloads even with a full magazine, so you can watch it, and switching away in the middle of a reload keeps its progress.

<figure>
  <picture><source srcset="/images/games/bodycam-drone-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/bodycam-drone-code.webp" alt="JavaScript source, lines 243 to 274 of src/encounters.js: every fifth of a second or so, a drone checks whether the player is within its detection range with no surface in between. While it can see the player, it turns toward them, waits, then raises a warning that lasts 0.86 seconds before launching an orb toward the player that stops at the first surface in its way. When it can't see the player, it slowly turns in place." width="1440" height="1293" loading="lazy" /></picture>
  <figcaption>A drone's attack in <code>src/encounters.js</code>: it fires only along a clear line, after a warning long enough to reach cover.</figcaption>
</figure>

## Keyboard, controller or touch

With a keyboard and mouse, you move with WASD, look with the mouse or the arrow keys, fire with the left button or Space, aim with the right button, reload with R, pick a weapon with 1 or 2, scan with Q, hold Shift to sprint, open the floor plan with Tab and pause with Escape, and M turns the sound on and off. An Xbox controller, read through the browser's Gamepad API, moves and looks with the sticks, aims and fires with the triggers, reloads with X, switches with the right bumper, scans with Y, sprints with a click of the left stick, and opens the floor plan with View and the pause menu with Menu. It rumbles when you fire, take a hit or seat a magazine. Press A on the main menu to start with it, and unplugging it mid-fight pauses the game. On a touchscreen, you drag on the left to move and on the right to look, with buttons to fire, scan, reload and swap. The floor plan shows one storey at a time, with your position, the drones still active and the current route, and the arrow keys, the d-pad or the bumpers step between floors.

## From footage to annex

The game began with a clip. The project's package description calls it a walkable Three.js reconstruction of the supplied body-camera footage: 23 seconds at 2560×1440, with sound, that walks down a graffiti-covered corridor with a pistol drawn, glances through two doorways and climbs a switchback stair to an upper landing. The README calls the intake corridor the original body-camera corridor, and the rest of the annex opens out from it. It also says the sampled photographic artwork derives from that reference, the pistol in your hand included, and that some of the graffiti and foreground artwork comes from small regions of the frame with reconstructed fine detail. From the main menu, Camera archive plays the original footage, or rides the reconstructed route: the same walk inside the engine, interpolated through 38 keyframes, with the clip's own sound and a running timestamp that matches the one burned into the footage.

<div class="project-media-gallery">
  <figure><img src="/images/games/bodycam-footage.webp" alt="A fisheye body-camera frame of a derelict corridor: tall windows on the left, rubble and paper on the floor, a white tag and a large looping graffiti piece on the right wall, a pistol held low at the bottom, and the overlay 2026-11-17 14:33:31 +0100, CAM 2 · UNIT 4417 at the top right." width="1280" height="720" loading="lazy" /><figcaption>The first frame of the supplied footage, shrunk from 2560×1440.</figcaption></figure>
  <figure><img src="/images/games/bodycam-corridor.webp" alt="The same corridor rendered by the game from a similar spot: tall windows and a radiator on the left, the white tag and the looping graffiti on the right wall, hanging lamps, rubble on a damp floor and a pistol in a gloved hand." width="1280" height="720" loading="lazy" /><figcaption>The corridor in the engine, from the first frame of the repository's graphics preview.</figcaption></figure>
</div>

## How it's built

The game and its website are two pages that Vite 8 builds from one repository, and Three.js 0.187 is the only runtime dependency. The game's code is 31 JavaScript modules in `src/`, 5,341 lines and about 255 KB. Apart from the coupe, there are no model files: the architecture, the machinery, the props and the drones are all built from geometry in code, and parts that share a material are merged so that repeated stair posts, radiators and lamp fittings draw in a handful of calls. On every push to `main`, a GitHub Actions workflow builds both pages with Node.js 24 and publishes them to GitHub Pages.

The Graphics menu sets the largest texture edge to 512, 1024, 2048 or 4096 pixels, 1024 by default. Every surface has a file at each size, and a change downloads the new set two files at a time, rolls back to the previous size if any download fails, and is remembered by the browser. At 4096, 33 of the maps load as KTX2 files with GPU-compressed mipmaps, through Three.js's KTX2Loader. The annex's walls, floors and roof use scans of concrete and bitumen with matching normal and roughness maps.

The fluorescent light is computed rather than painted on. When the level loads, a Web Worker bakes the light of every tube into a 3D texture of 114 × 50 × 71 cells, each a twelfth of a storey on a side, by tracing rays from each cell to three points across each tube and testing them against the boxes of the walls and equipment, so cabinets and tanks cast shadows that soften with distance. The materials' shaders, patched through Three.js's `onBeforeCompile` hook, read that volume at every pixel. The windows are rectangular area lights, and the roof has its own lightmap of how much sky each spot can see.

The camera comes last. The scene renders in linear light into a half-float buffer, and a final pass applies the sensor's clipping, lens aberration, bloom, exposure and grain, then draws the weapon on top. At the 1024 setting and above, damp patches on the floors reflect what the camera can see, found by stepping through the depth buffer, and at 2048 and 4096 the scene is multisampled on GPUs that support it. Both weapons are flat images that this pass moves and bends. The pistol and the gloved hand holding it come from the footage. The carbine picture is split into regions, the support arm, the magazine and a patch of metal the glove normally hides, and each region is sampled through its own bone transform, so the fabric grain stays attached to the wrist as it bends.

The scanner and the floor plan share a navigation grid. While the level loads, the game moves the player's own collision volume a step in each direction from the start, a few milliseconds each frame, to build a grid of walkable points 40 cm apart, with separate cells for the overlapping flights of each switchback. A scan runs a breadth-first search across it to the nearest live drone, and Canvas 2D draws the floor plan. The sound runs through the Web Audio API. The two gunshots are short recordings, played at a slightly random pitch, and everything else, from footsteps and reload clicks to a drone's alert, its orb and the hit on your armor, is a burst of filtered noise shaped in code, each handling sound triggered as its pose crosses a point in the animation.

## The website

The repository's root page is the game's website, styled as a body-camera feed, with REC and unit labels over a looping in-engine capture of a drone in the corridor, which stays still if you've asked for reduced motion or turned on a data saver. It has the mission briefing, a facility index with a tab and a screenshot for each floor, notes on the loadouts, the optics, the texture sizes and the camera archive, and a field manual with keyboard, Xbox and touch controls. Both clips on this page play there in a dialog, and the footer links the credits and the source.

## How it was made

The README's asset notes say the body-camera footage and the sampled photographic artwork derive from the supplied reference, and that the carbine artwork was generated with the built-in ImageGen tool, from a brief that called for a photographic, contemporary matte-black compact carbine, black fabric gloves and subdued window light on a transparent background. Several other photographic sources are CC0 assets from Poly Haven: the concrete wall scan by Charlotte Baglioni and Dario Barresi, the worn concrete floor by Dimitrios Savva and Rico Cilliers, the bitumen and a worn metal plate by Rob Tuytel, the rooftop panorama, from Greg Zaal's Teufelsberg Roof, and the coupe's light probe, from Dimitrios Savva and Jarod Guest's Small Workshop. The coupe is adapted from [Car Concept](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept) by Eric Chadwick, copyright 2024 Darmstadt Graphics Group GmbH and based on Unity Fan's vehicle design, used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) as an optimized copy with adapted materials, lighting and glass. The website's fonts are Barlow, Barlow Condensed and IBM Plex Mono, under the SIL Open Font License.

The repository has two commits, both dated November 18, 2026. The first holds a README stub and the icon, and the second published the game and its website.

## Play it

Play [in your browser](https://nearbycoder.github.io/bodycam/play/), or start from [the website](https://nearbycoder.github.io/bodycam/). The game needs a browser with WebGL 2. The sound comes on when you deploy, and the game pauses whenever its window loses focus. To run it locally, clone the repository, run `npm ci` and `npm run dev`, and open the address Vite prints, adding `/play/` for the game.

[Browse the source on GitHub](https://github.com/nearbycoder/bodycam). The creation date shown here is the GitHub repository's UTC creation date. The cover and the floor and drone shots are the website's own in-engine stills from `public/press`, with the cover shrunk with Lanczos resampling. The gameplay frame comes from the repository's weapon-handling capture, the corridor pair is the first frame of the supplied footage and of the graphics preview, the tour's poster is another frame of the graphics preview, the handling clip's poster is the website's own, and the code excerpt is from `src/encounters.js`.
