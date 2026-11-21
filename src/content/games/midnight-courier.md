---
title: "Midnight Courier"
summary: "A downhill bike game about one ridiculously fragile package: two minutes to carry a box of antique glass across a rainy hillside city, where the tip at the door pays for speed and for care. It's C++ on Unreal Engine 5.9 with hand-rolled bike physics and a city generated in Blender, and the browser version is a Three.js port with the same physics."
role: "Creator"
genre: "Downhill delivery"
platforms: ["macOS", "Web"]
engine: "Unreal Engine 5.9 and Three.js"
year: "2026"
createdAt: "2026-11-21T05:03:39Z"
stack:
  [
    "Unreal Engine 5",
    "C++",
    "HLSL",
    "Blender",
    "Python",
    "NumPy",
    "JavaScript",
    "Three.js",
    "three-mesh-bvh",
    "WebGL2",
    "GLSL",
    "Web Audio API",
    "Gamepad API",
    "glTF Transform",
    "meshoptimizer",
    "FFmpeg",
    "Playwright",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/midnight-courier/play/"
download: "https://github.com/nearbycoder/midnight-courier/releases/latest"
githubLink: "https://github.com/nearbycoder/midnight-courier"
featured: false
accent: "pink"
draft: false
image: "/images/games/midnight-courier.webp"
imageAlt: "The courier, in a yellow rain jacket with the package on their back, rides onto the top of Lantern Steps at night with the headlamp lighting the wet pavement, between brick buildings and a pink building with a vertical neon sign, under strings of lights that run down the stairs."
imageCaption: "The top of Lantern Steps, one of the website's screenshots of the Unreal game."
demoVideos:
  - src: "https://nearbycoder.github.io/midnight-courier/media/trailer.mp4"
    title: "Trailer"
    caption: "The website's 36-second trailer, in 1080p at 30 frames per second with sound. After a title card reading One package. Ridiculously fragile., the courier rides down Crown Street past parked cars under Two minutes to get it down the hill, rolls down Lantern Steps under strings of lights for Take the stairs, follows the curving streets for Or take the long way round, and heads for the dock kicker and the beam of light over the drop-off for Every landing counts. It ends on the title with Play in your browser and Download for Mac. It's served from the game's website."
    poster: "/images/games/midnight-courier-trailer-poster.webp"
    original: "https://github.com/nearbycoder/midnight-courier/blob/main/web/media/trailer.mp4"
---

Midnight Courier is a downhill bike game about one package. It's a box of antique glass, and it has to get from Lucky Lantern Noodles at the top of Lantern Hill, a rainy, neon-lit neighborhood, to the Hotel Marlowe on the harbor in two minutes. Stairs, curbs and walls all rattle the glass, and the tip at the door pays for speed and for care, so the fastest route isn't always the winning one. R restarts instantly, and the ghost of your best run rides beside you.

The game is C++ on Unreal Engine 5.9, with bike physics written by hand instead of Unreal's physics simulation, and the README says scripts generate every model, the whole neighborhood, every material and every sound: Python in Blender for the bike, the rider and the city, procedural HLSL for the materials and NumPy for the audio. The Mac app is the full Unreal game, lit with Lumen, and the browser version is a JavaScript port on Three.js, built from the same generated assets, with the same physics.

## One hill, three gambles

The safe way down runs along Crown Street, around the Kiln Road hairpin, down Market Street, Tanner Row and Lamp Hill, along the canal, over Gull Bridge and down Pier Lane, and the README puts a good ride at about 1:35. Three shortcuts cut it to about a minute. Lantern Steps is four flights of stairs between the legs of the hairpin. Needle Alley is a narrow slot through the block with two short stair sets. The dock jump is a kicker on the quay across the 12-meter canal, and the README says you need about 12 meters per second off it, or you swim. Checkpoints at Market Street, Lamp Hill and Pier Lane show your split against your best run, and a crash puts you back where you were a few seconds earlier, with the clock still running.

<div class="project-media-gallery">
  <figure><img src="/images/games/midnight-courier-steps.webp" alt="The courier rides down Lantern Steps, seen from behind, between brick and pink buildings, with paper lanterns and strings of lights hanging over the stairs and a vertical neon sign on the right." width="1280" height="720" loading="lazy" /><figcaption>Lantern Steps.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-alley.webp" alt="The courier rides through Needle Alley, a narrow passage between dark walls, under a bare bulb, past a green dumpster, with the headlamp lighting the way ahead." width="1280" height="720" loading="lazy" /><figcaption>Needle Alley.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-jump.webp" alt="The courier on the plank kicker on the quay, about to launch over the dark canal toward the lit buildings and the beam of light on the far side." width="1280" height="720" loading="lazy" /><figcaption>The dock jump.</figcaption></figure>
</div>

## The tip

The tip is $20 plus $1 for every second left on the clock, times a care multiplier, which is the package's condition raised to the power 1.5, plus $15 for a pristine box at 95 percent or better, or $6 for a careful one at 85. A tip of $85 earns an S, $65 an A, $48 a B and $32 a C. Run out of time or let the condition hit zero and there's no tip at all. A clean ride down the safe route in 1:36 at 98 percent comes to about $58 and a B, while a one-minute run with a perfect box would pay $95. Your best run is the one with the biggest tip, not the fastest time, and it's saved with its splits and its ghost. The Unreal game never saves autopilot, scripted or invincible test runs, while the browser version saves any run that beats your best unless it was opened with `?fresh`.

<div class="project-media-gallery">
  <figure><img src="/images/games/midnight-courier-delivered.webp" alt="The DELIVERED screen in the Unreal game over the courier at the hotel door: Not a scratch. Are you even human?, time 1:36.20, package 98 percent, delivery fee and early bonus $43.80, care multiplier times 0.97, pristine bonus plus $15.00, landings and feathered 1 and 0, and a tip of $57.63 with a big B, NEW BEST, and the note A at $65, $7.37 to go, the stairs, the alley and the dock are faster." width="1280" height="720" loading="lazy" /><figcaption>A delivery in the Unreal game.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-web-delivered.webp" alt="The same DELIVERED screen in the browser version after the safe-route autopilot: time 1:36.06, package 98 percent, $43.94, times 0.98, plus $15.00, landings and feathered 0 and 0, and a tip of $57.88 with a B, NEW BEST, and A at $65, $7.12 to go." width="1280" height="720" loading="lazy" /><figcaption>A delivery in the browser version.</figcaption></figure>
</div>

## Physics you can feel through the box

The bike in `McBike.cpp` doesn't use Unreal's physics simulation, only its collision sweeps. It steps at a fixed 240 Hz: a rigid body in the vertical plane, height and pitch, riding on two wheels that feel the ground with swept spheres, each on its own spring and damper. On the ground plane it has an arcade grip model, with steering limited by lean, and a swept capsule stops it at walls. The power slide cuts the tires' grip from 16 to 2, so the bike slides through the hairpin and bleeds speed, and in the air, W and S tilt the bike.

The rider's legs are a second spring, and the package rides on them. Seated, they're stiff, with 19 centimeters to give. Holding Space braces: you stand on the pedals, the legs become a third as stiff with 30 centimeters to give, and rim strikes and bottomed-out landings do less harm, but you can't pedal and you turn 15 percent less sharply. The box loses condition when a wheel strikes a curb or a step edge, when the legs bottom out, when you hit a wall, when it feels more than 2.7 g, and on sketchy landings, more than 26 degrees off the slope or 35 degrees sideways, which also cost speed. A crash costs 22 percent and a swim 30, a head-on wall hit faster than 8.5 meters per second is a crash, and so is landing more than 52 degrees off the slope while dropping faster than 3 meters per second, or more than 75 degrees sideways. Brace in the 0.4 seconds before touchdown for a feather landing, which cuts that landing's impact damage to a fifth. Letting go of brace hops, higher the longer you held it, with the front wheel coming up first.

<figure>
  <picture><source srcset="/images/games/midnight-courier-legs-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/midnight-courier-legs-code.webp" alt="C++ source, lines 863 to 908 of MidnightCourier/Source/MidnightCourier/McBike.cpp, the rider's legs and the package: the spring constant, damping, force cap and travel limits switch between the braced and seated values, and the leg force is clamped between zero and the cap. The torso's velocity and offset are integrated against gravity and the frame's vertical acceleration. Sitting back down from a crouch does no harm, but when the legs or the seat bottom out, the remaining downward speed is the hit, and above the leg threshold it does damage of LegScale times the excess to the power LegExp, times 0.6 when braced, as a landing shock. Then the felt load on the package is the leg force combined with half the horizontal acceleration, in g, and above the safe level it drains condition by GScale times the excess to the power GExp, per second." width="1440" height="1869" loading="lazy" /></picture>
  <figcaption>The rider's legs and the package in <code>McBike.cpp</code>, stepped 240 times a second.</figcaption>
</figure>

## A city from one script

`Art/build_city.py` builds Lantern Hill in Blender: streets laid out from straight and curved paths, Lantern Steps, Needle Alley, the canal, Gull Bridge, the dock kicker and the harbor, about 2,600 buildings by the README's count, neon signs, shopfronts, parked cars, lamps and strings of lanterns. It also writes `level.json`, with the start, the checkpoints, the water, the lights, the autopilot routes and the minimap. `build_bike.py` makes the bike, the package and a few effect meshes, and `build_rider.py` grows the courier from a joint graph with Blender's Skin modifier into one skinned character, which the game poses every frame with two-bone IK to the pedals and grips. `Scripts/import_assets.py` builds every material as a procedural HLSL graph, from wet asphalt with puddles and rain ripples to windows, neon, water, GPU rain, the ghost and the sky, and `Scripts/make_audio.py` synthesizes all 30 sounds with NumPy, from the rain and the freewheel to the package's glassy tinks and cracks and two music loops.

The game itself is 4,514 lines of C++ in 16 files: the bike, the run flow and scoring, the ghost recorded 30 times a second, the world built from `level.json` with fog, GPU rain and lightning, a HUD drawn on Unreal's canvas, and sound loops driven by speed and slip.

<div class="project-media-gallery">
  <figure><img src="/images/games/midnight-courier-crown-street.webp" alt="The courier rides down the middle of Crown Street in the rain, the headlamp lighting the wet road, past a parked black car and dark buildings with lit windows, toward a pink-lit building far down the hill." width="1280" height="720" loading="lazy" /><figcaption>Crown Street in the rain.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-hairpin.webp" alt="The courier leans into the Kiln Road hairpin on a wet road that curves back to the right, with a dark building ahead lit by a lamp." width="1280" height="720" loading="lazy" /><figcaption>The Kiln Road hairpin.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-bridge.webp" alt="The courier rides along a wet street the website labels Gull Bridge over the canal, past a street lamp, with a white car parked ahead and lit apartment blocks beyond." width="1280" height="720" loading="lazy" /><figcaption>Gull Bridge over the canal.</figcaption></figure>
</div>

## The Mac version

The Mac app is the full Unreal game for Apple silicon on macOS 14 or later, lit with Lumen, and the website and the release notes say it runs at up to 4K and 120 frames per second. Its settings have Low, Medium, High and Ultra presets and an automatic resolution scale that renders toward 760 to 1,440 lines, depending on the preset, and lets Unreal's Temporal Super Resolution fill in the rest. There's a 60, 120 or unlimited frame cap, switches for Lumen, volumetric fog and motion blur, a sound mixer, and options for camera shake, the ghost, hints and gamepad rumble.

## The browser version

The browser version in `web/play` is a port of the Unreal game in plain ES modules with no build step: the same city and the same 240 Hz bike physics with the constants from `McBike.cpp`, the same rider rig, scoring, ghost, autopilot, HUD and sounds. Three.js r187 renders it, three-mesh-bvh speeds up the sphere and capsule sweeps against the city, and the HLSL materials become GLSL. It can't run the Unreal version's roughly 230 dynamic lights with Lumen, so the nearest 10 to 20 lights, depending on quality, are real lights that get re-picked every few frames, while emissive surfaces, an analytic glow in the fog, a hemisphere fill and bloom stand in for the rest. On High and Ultra, a planar reflection of the ground under the bike stands in for Lumen's reflections. `tools/build_assets.sh` packs the Blender exports into four meshopt-compressed glTF files and the sounds into MP3s, and a first visit downloads about 5 MB, or 14 MB uncompressed. It needs WebGL 2, plays with a keyboard or a gamepad, takes the mouse in menus, and keeps the settings and the best run, with its ghost, in local storage.

The README says the safe-route autopilot delivers in about 96 seconds with about 98 percent, against 1:36.25 and 99 percent in Unreal, and that the shortcut autopilot breaks the package at around 75 seconds in both. In the captures for this page, the safe route came in at 1:36.06 with 98.4 percent for a $57.88 tip, and the shortcuts broke the package at 75.1 seconds.

<div class="project-media-gallery">
  <figure><img src="/images/games/midnight-courier-web-title.webp" alt="The title screen in the browser version: MIDNIGHT COURIER in big white and yellow letters, the lines One package. Ridiculously fragile. Two minutes to get it down the hill., a menu of RIDE, SETTINGS and FULL SCREEN, and the controls, beside the courier on the bike under the red Lucky Lantern sign with a parked car's headlights on the right." width="1280" height="720" loading="lazy" /><figcaption>The title screen in the browser version.</figcaption></figure>
  <figure><img src="/images/games/midnight-courier-web-steps.webp" alt="The shortcut autopilot rolling down Lantern Steps in the browser version, braced at 21 km/h, with 1:41.01 left, the drop-off 426 meters away, THUD and minus 4 percent called out ahead, the package at 94 percent with its shock meter, and a minimap in the corner." width="1280" height="720" loading="lazy" /><figcaption>Lantern Steps in the browser version.</figcaption></figure>
</div>

## How it was made

The repository has five commits. The first, a README stub and an icon, came about three and a half hours before the rest. The other four came within about half an hour: the Unreal game with its art and audio pipeline, the Mac packaging and the website with the trailer; a commit whose message lists title-screen fixes but whose only change is the Mac package's version counter; the browser version, with a fix to the direction the bikes lean in both versions; and a re-rendered trailer, hero loop and hairpin still with the corrected lean. All four are co-authored by Claude.

## Play it

Play [in your browser](https://nearbycoder.github.io/midnight-courier/play/), or start from [the website](https://nearbycoder.github.io/midnight-courier/), which has the trailer, the routes and a gallery. W or Up pedals, S or Down brakes, and A and D steer, and in the air, W and S tilt the bike. Hold Space to brace and let go to hop, Shift power-slides, R restarts, G turns the ghost on or off, and Esc or P pauses. On a gamepad, the triggers pedal and brake, the left stick steers, A braces, X or RB slides and Y restarts.

[Download the Mac app](https://github.com/nearbycoder/midnight-courier/releases/latest) from the latest release, a zip of about 410 MB for Apple silicon Macs on macOS 14 or later. It's signed ad hoc, not notarized, so the first launch needs a right-click and Open. Building it takes the source-built Unreal Engine 5.9 at `~/UnrealEngine`: `./build.sh` compiles the game, `./build.sh --assets` regenerates every asset with Blender 5 and NumPy and imports them again, and `./play.sh` runs it in a 1600 × 900 window.

[Browse the source on GitHub](https://github.com/nearbycoder/midnight-courier). The creation date shown here is the GitHub repository's UTC creation date. The cover and the Lantern Steps, Needle Alley, dock jump, Crown Street, hairpin, Gull Bridge and Unreal delivery pictures are the website's screenshots of the Unreal game, from the repository's `web/media` folder, and the larger ones were shrunk with Lanczos resampling. The browser title, Lantern Steps and delivery pictures were captured for this page from the live browser version in headless Chromium on Linux with an AMD Radeon 8060S, the last two using the game's own `?auto=short` and `?auto=main` autopilot flags. The trailer and its poster are the website's own, and the code excerpt is from `McBike.cpp`.
