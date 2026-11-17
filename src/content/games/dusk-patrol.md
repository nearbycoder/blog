---
title: "Dusk Patrol"
summary: "A pixel-art fighter-jet flying toy for the browser, set over autumn lake country at the last light of day, with chase, cockpit and top-down views. The whole game is one HTML file of about 180 KB that generates a 20 km world with web workers and ray-marches it in raw WebGL2."
role: "Creator"
genre: "Flying toy"
platforms: ["Web"]
engine: "Custom WebGL2"
year: "2026"
createdAt: "2026-11-17T17:21:15Z"
stack:
  [
    "JavaScript",
    "WebGL2",
    "GLSL",
    "Canvas2D",
    "Web Audio API",
    "Web Workers",
    "Gamepad API",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/dusk-patrol/play/"
githubLink: "https://github.com/nearbycoder/dusk-patrol"
featured: false
accent: "orange"
draft: false
image: "/images/games/dusk-patrol.webp"
imageAlt: "A gray twin-tail jet with red-tipped fins and glowing nozzles banks over lakes, autumn forest and pink cumulus toward a low, dithered sun."
imageCaption: "The chase view, banking over the cumulus toward a low sun, from the Dusk Patrol README."
---

Dusk Patrol is a pixel-art fighter-jet flying toy for the browser. You fly a gray twin-tail jet over autumn lake country while the sun sits low in the west: lakes with turquoise shallows, forests in orange, crimson and gold, gray-violet mountains with snow on the peaks, and drifting pink cumulus. It's a toy rather than a game with goals. There are no enemies, scores or missions: you steer, roll, light the afterburner, fire missiles into the ground or a lake, and switch between three cameras. The jet can't crash. It pulls up on its own before terrain and levels off about 10 m above the water.

The whole game is one self-contained `index.html` of about 180 KB, with no libraries and no image files. Web workers generate the world each time the page loads, a ray-marching shader in raw WebGL2 draws it, the cockpit and HUD are plotted pixel by pixel on a Canvas 2D surface, and the sound is synthesized with the Web Audio API. It's one of three single-file pixel-art browser games set at dusk and published on November 17, 2026, along with [Dusk Circuit](/games/dusk-circuit) and [Dusk Station](/games/dusk-station).

## Three cameras

Space (or Y on a controller) cycles the views, and each change swoops the camera into place over about a second. **Chase** sits behind the jet as it banks, with vapor trails streaming from the wingtips. **Cockpit** puts you behind a green HUD and a pixel-art instrument panel. **Top-down** keeps north up like a map, and the jet flies toward wherever you point.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-patrol-cockpit.webp" alt="The cockpit view at sunset: a green HUD with a pitch ladder and speed and altitude boxes over the sun and a sea of pink cloud, above an instrument panel with six round dials, an amber radar scope, engine tapes, a clock and warning lamps." width="1280" height="720" loading="lazy" /><figcaption>The cockpit. The HUD's pitch ladder sits on the real horizon, and every needle on the panel reads the flight model.</figcaption></figure>
  <figure><img src="/images/games/dusk-patrol-top-down.webp" alt="Top-down view of the small jet crossing yellow, orange and crimson autumn forest and pale meadows, with a turquoise lake at the top left and pink cumulus on the right and at the bottom." width="1280" height="720" loading="lazy" /><figcaption>The top-down view, north up, over forest, a lake and drifting cumulus.</figcaption></figure>
</div>

## Flying it

The mouse steers. In the chase and cockpit views, the cursor's offset from the center of the screen sets how hard the jet banks and how steeply it climbs or dives. In the top-down view the jet turns toward the cursor, and the mouse wheel changes its altitude. A quick click is a barrel roll, holding the left button lights the afterburner, and a right click or F fires a missile. Shift and R also boost and roll, M turns the sound on (it's off by default), and P pauses. Until you take over, the jet flies lazy S-turns on its own, with the AUTO lamp lit on the panel.

On a touchscreen you drag anywhere to steer and use on-screen FIRE, BOOST, ROLL and VIEW buttons. Any controller that the browser exposes in the Gamepad API's standard layout works too, including Xbox, PlayStation, Switch Pro and 8BitDo pads. The left stick flies (in the top-down view, you point it where you want to go), RT is the afterburner, A or LT fires, B rolls, LB and RB roll left or right, Y changes the view, the d-pad or right stick sets the altitude in the top-down view, and Start pauses. The game also pauses if the controller disconnects. Back swaps between pulling back and pushing up to climb, and the choice is remembered between visits. Pads with rumble shake on launches, nearby explosions, rolls and low passes over water, and the hint strip at the top switches to controller hints until you move the mouse or touch the screen again.

The flight model is arcade, but it's limited to +11 g and -5 g, so the g meter reads like a fighter's. The jet cruises at 185 m/s, about 360 knots, and the afterburner pushes it toward 305 m/s. Terrain avoidance looks about five seconds along your path and pulls up just early enough, so you can dive at a lake and level off into a skim that throws up spray and leaves a wake.

<figure>
  <img src="/images/games/dusk-patrol-skim.webp" alt="The jet skims a rippled blue lake toward a low sun behind violet clouds, with glints of light on the water ahead, vapor trails behind and snowy mountains on the right." width="1280" height="720" loading="lazy" />
  <figcaption>Skimming a lake at about 10 m, into the glitter path.</figcaption>
</figure>

## Missiles

Four missiles hang on the wings, two at the tips and two further in, and each re-arms 4.5 seconds after it's fired while a pip in the hint strip refills. A missile drops clear, lights its motor and steers for the spot on the ground where the nose is pointing, which a small diamond marks on the HUD in the cockpit. With the nose above the horizon, it picks a spot on the ground ahead instead. On land, a hit makes a flash, a fireball and an expanding shock ring, then a lingering column of smoke and a scorch mark with embers glowing in it. Scorch marks fade after 90 seconds. On water, a hit throws up a column of spray and leaves rings of foam. With the sound on, a distant blast is heard late, delayed by its distance at the speed of sound.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-patrol-strike-land.webp" alt="The jet flies toward an orange fireball inside a pale shock ring on a forested hill, with a dark column of smoke rising into the sunset sky." width="1280" height="720" loading="lazy" /><figcaption>A land strike: fireball, shock ring and a smoke column that lingers.</figcaption></figure>
  <figure><img src="/images/games/dusk-patrol-strike-lake.webp" alt="Ahead of the jet, a white column of spray and rings of foam rise from a dark blue lake inside a pale shock ring, with mountains and the sun on the horizon." width="1280" height="720" loading="lazy" /><figcaption>On water, a missile throws up a column of spray and rings of foam.</figcaption></figure>
</div>

## The lake country

The world is a single square of terrain, 20.48 km on a side, that repeats in every direction: fly off one edge and you come back in on the other. It comes from a fixed seed, so it's the same world on every visit. Noise with a large domain warp shapes the lakes, an erosion-style noise adds rolling hills, and ridged noise raises mountain ranges, while the shoreline gets wide shallow shelves and gentle beaches. Lakes run up to 75 m deep. Forest grows in patches away from beaches, steep rock and high ground, in orange, crimson and gold with stands of dark conifers, and snow starts at around 840 m.

<figure>
  <img src="/images/games/dusk-patrol-map.webp" alt="The whole generated world from above: deep blue lakes with turquoise shallows, pale meadows spotted with orange and crimson forest, gray-violet mountain ranges, and white snow on the highest peaks." width="1024" height="1024" loading="lazy" />
  <figcaption>The whole 20.48 km tile, rendered from the game's generator in its own palette, from the website.</figcaption>
</figure>

The sun hangs 8.5° above the horizon in the west-southwest, and shadows for it are baked into the terrain, so every hill throws a long violet shadow. A layer of puffy cumulus, with its base at 1,050 m, drifts slowly to the east-northeast and casts shadows on the land and water. Up close, the shader draws every tree crown separately, in cells about 8 m across that grow coarser with distance.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-patrol-valley.webp" alt="The jet banks down a valley between gray-violet mountains with crimson forest on their slopes, snowy peaks on the left and peach-lit clouds above." width="1280" height="720" loading="lazy" /><figcaption>Banking down a mountain valley in the last light.</figcaption></figure>
  <figure><img src="/images/games/dusk-patrol-canopy.webp" alt="Seen from above, the small jet crosses a dense golden forest drawn crown by crown, with a few dark green conifers, a pale meadow on the left and orange and crimson crowns at the bottom left." width="1280" height="720" loading="lazy" /><figcaption>Low over the canopy, where the shader draws every crown.</figcaption></figure>
</div>

## How it works

When the page opens, two to eight web workers (one fewer than the computer's cores) fill a 2,048 × 2,048 height field, with 10 m between samples, in strips of 32 rows while a loading bar fills. The worker code sits in the page as text and starts from a Blob URL, which is how a single file can run workers. A final pass grows the forest patches and their canopy height, sweeps shadows across the tile for the low sun, blurs in ambient occlusion, and builds a max-mip pyramid of 12 levels, in which each cell stores the highest point beneath it. Another worker builds the clouds: 250 cumulus clusters with lobes and cauliflower bumps, in a 1,024 × 1,024 field at 12 m per sample, stored as a signed height so their outlines stay smooth.

A fragment shader then casts one ray per pixel. It strides over empty air a whole mip cell at a time, drops a level whenever the ray might touch the terrain, and at the finest level solves exactly where the ray meets the bilinear patch between four samples. Clouds are traced the same way on their own pyramid. Because the terrain isn't a mesh, any camera angle works, from straight down to the horizon.

<figure>
  <img src="/images/games/dusk-patrol-heatmap.webp" alt="The chase view recolored by rendering cost: a black sky, dark teal cloud domes with glowing cyan edges, and dim brown and amber terrain beneath the jet." width="1280" height="720" loading="lazy" />
  <figcaption>Ray-march work per pixel, from the website: amber is terrain, teal is clouds, and open sky costs almost nothing. It's a diagnostic render; the published game has no switch for it.</figcaption>
</figure>

<figure>
  <picture><source srcset="/images/games/dusk-patrol-traverse-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/dusk-patrol-traverse.webp" alt="GLSL source of traceTerrain, lines 796 to 830 of index.html: the setup, then a loop that reads the highest point in the current mip cell, skips to the cell's far edge while the ray stays above it, moves up a level on leaving the parent cell, and otherwise drops a level." width="1440" height="1281" loading="lazy" /></picture>
  <figcaption>The start of the terrain traversal in <code>index.html</code>. The rest of the loop solves the bilinear patch at the finest level.</figcaption>
</figure>

The world's colors come from 30 hand-picked palette ramps, such as water from navy to pale turquoise and clouds from violet to peach. Light picks a tone, and a 4×4 Bayer matrix dithers only a narrow strip at each tone boundary, so bands stay flat and edges stay crisp. The world renders at about 340 pixels tall and is scaled up by a whole number with nearest-neighbor sampling. If frames run slow, the internal resolution steps down a notch at a time, through six heights from 340 down to 176 pixels, and it can step back up when frames are fast again.

The jet is 354 triangles built in code: a dark radome, a gold-tinted bubble canopy, cropped delta wings, canted twin fins with red caps, and glowing nozzles. Every face takes one of three tones, in a gray and slate splinter camouflage, and a last pass draws a one-pixel dark outline around it. A small orthographic mask casts its shadow onto land, water and cloud.

The cockpit and HUD are plotted pixel by pixel on a Canvas 2D surface with a 3×5 font. The panel has airspeed, an attitude ball, an altimeter with drum digits, turn and slip, a heading card, climb rate, an amber ground-mapping radar that sweeps 8 km ahead and fades slowly, engine tapes, a clock on your local time, warning lamps and a throttle lever that follows the afterburner. The HUD's pitch ladder is projected through the same camera as the world, so its zero line sits on the true horizon.

Sound is off until you press M or the sound button. Then it's synthesized live: two slightly detuned sawtooth oscillators for the engine, a turbine whine, filtered noise for the roar, the afterburner and the wind, a hiss when you skim water, and a warning tone with PULL UP in the cockpit.

## The website

The website at [nearbycoder.github.io/dusk-patrol](https://nearbycoder.github.io/dusk-patrol/) runs the real game behind its opening text, in a silent autopilot mode with no interface that barrel-rolls every twelve seconds. The page fades the game in once it reports that it's flying, pauses it when you scroll away, and leaves it out for visitors who prefer reduced motion, use data saver or have a low-memory device. Below that come the three cameras, the world map, a gallery of screenshots, six steps on how it works with a slider that shows how the dither width changes a sky gradient, the controls, and a cabinet that plays the game inside the page when you press Take off. On a phone or tablet, the background copy of the game is removed when the cabinet starts, so only one copy runs.

A short shell script assembles the site with the game at `/play/`, and a GitHub Actions workflow deploys it to GitHub Pages on every push to `main`.

## How it was made

The repository has three commits, all on November 17, 2026: an initial commit with a stub README and an icon, the game and its website together about three hours later, and controller support 17 minutes after that. Both commits after the first are co-authored by Claude. The game exposes hooks on `window.DUSK` for headless checks, such as `advance(seconds)`, `teleport()`, `checkFinite()` and one that simulates a slow GPU, but the checks themselves aren't in the repository.

## Play it

Play it in your browser at [nearbycoder.github.io/dusk-patrol/play](https://nearbycoder.github.io/dusk-patrol/play/), with a mouse, a controller or a touchscreen. It needs WebGL2, and it says so if the browser doesn't have it. The only outside requests are two Google Fonts. To run it locally, open `index.html` directly or serve the folder; to preview the website, run `sh scripts/build-site.sh && python3 -m http.server 8000 -d _site` in the repository.

[Browse the source on GitHub](https://github.com/nearbycoder/dusk-patrol). The creation date shown here is the GitHub repository's UTC creation date. The screenshots, the heatmap and the world map come from the game's website, in the repository's `site/media` folder, with the 640×360 images enlarged 2× here using nearest-neighbor scaling, and the code excerpt is from `index.html`.
