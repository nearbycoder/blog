---
title: "SNOW PATROL"
summary: "A snowplow game for the browser: drive a sprite-stacked snowcat through five alpine shifts and push the snow out of each zone against a par time, on a snow field that the blade scoops, carries and spills. It's one HTML file on Three.js, with music synthesized as it plays and 24 radio lines made with the Reverb-TTS speech model."
role: "Creator"
genre: "Snowplow driving"
platforms: ["Web"]
engine: "Three.js"
year: "2026"
createdAt: "2026-11-23T23:18:17Z"
stack:
  [
    "JavaScript",
    "Three.js",
    "WebGL2",
    "GLSL",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "Reverb-TTS",
    "Python",
    "FFmpeg",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/snow-patrol/play.html"
githubLink: "https://github.com/nearbycoder/snow-patrol"
featured: false
accent: "sky"
draft: false
image: "/images/games/snow-patrol.webp"
imageAlt: "The red snowcat drives toward the camera across a sunset-pink snowfield, its black plow blade, with yellow marks along the top, pushing a churning wave of snow chunks, and a strip of cleared gray cobblestones behind it. Orange cones, part of a blue SUV and a gold and cyan turbo canister sit on the left, with a woodpile, a snowman, a red-and-white zone pole and the zone's dashed edge beyond."
imageCaption: "Plowing the Cabin Driveway at sunset, captured for this page from the live game."
---

SNOW PATROL is a snowplow game for the browser. You drive a tracked snowcat through five alpine shifts, from a cabin driveway at sunset to a helipad in a midnight blizzard, and push the snow out of each zone, marked by red-and-white poles and a dashed line on the ground, against a par time. Chief Maren at base dispatch briefs every shift over the radio, Barnaby the lodge husky trots around the chalet, guests' cars are parked in the way, and snowmen and turbo canisters pay a bonus. When the last shift is clear, a rescue helicopter comes down on the pad.

The whole game is `play.html`, one file of about 2 MB that loads Three.js 0.170 from jsDelivr. Apart from particles, the wave of snow chunks, the gold marker and the helicopter's rotor, every model in it is a sprite stack: a pile of 2D pixel slices built in code, which the game draws as thin stacked layers and lights as if they were solid. The snow is a height field that the blade digs into and moves, the music and sound effects are synthesized with the Web Audio API, and the 24 radio lines, made with Software Mansion's Reverb-TTS model, are embedded in the file.

<figure>
  <img src="/images/games/snow-patrol-helicopter.webp" alt="At night on the Avalanche Helipad, a red and white rescue helicopter with cyan windows and a black cross-shaped rotor comes down over a big gold H outlined in red and white, lit by its own searchlight, with the red snowcat parked on the right beside a curving gold ring and snow falling." width="1440" height="810" loading="lazy" />
  <figcaption>Alpine Rescue One landing on the cleared Avalanche Helipad, the last shift's finale.</figcaption>
</figure>

## Five shifts

Each shift is a bigger square of mountain: 60 meters across for the Cabin Driveway, then 74, 84, 96 and 110 for the Summit Ski Plaza, the Chalet Village Court, Pine Ridge Pass and the Avalanche Helipad. All five are open from the start, and par runs from 55 seconds on the driveway to 3:05 on the helipad. The driveway is a warm-up beside a log chalet, with a parked SUV, a woodpile and two snowmen. The plaza puts a lift tower in the middle of the zone and black ice in its east corner. The courtyard, the only daytime shift, is a ring of cobblestones around a chalet, with three guests' cars, two ice slicks and two woodpiles. Pine Ridge Pass is an S-curved highway under deep drifts in a blizzard, with a dashed center line, two lift towers on the road and ice on both bends. The helipad is a round pad with a gold ring and an H under the snow, at night in a blizzard that brings a squall warning every 28 seconds.

Black ice only matters once you've uncovered it: then the tracks keep about a quarter of their grip, so the snowcat slides and coasts. Smash a snowman for 45 credits, pick up a turbo canister for 35 and a full tank, and turbo through a deep drift for a 25-credit Drift Buster. Traffic cones go flying, chalet chimneys smoke, a red and a gold gondola cabin glide along a cable north of every shift, and the air horn makes Barnaby hop and bark if he's nearby.

<div class="project-media-gallery">
  <figure><img src="/images/games/snow-patrol-plaza.webp" alt="The snowcat, seen from behind, slides across a pale blue patch of black ice it has just uncovered on the Summit Ski Plaza, under the game's 25% CLEARED! and black ice warning toasts and a TURBO FULL! +35 Cr popup, with traffic cones flying, a zone pole on the left and the gray base of the lift tower on the right." width="1440" height="810" loading="lazy" /><figcaption>Black ice on the Summit Ski Plaza.</figcaption></figure>
  <figure><img src="/images/games/snow-patrol-village.webp" alt="The snowcat, from behind, plows past a log chalet with glowing yellow windows in the Chalet Village Court in daylight, between high white banks of pushed snow, on gray cobblestones beside a pale blue ice slick, with snowmen, a lantern, a turbo canister and the roof of a green car around it." width="1440" height="810" loading="lazy" /><figcaption>The Chalet Village Court, the daytime shift.</figcaption></figure>
  <figure><img src="/images/games/snow-patrol-pass.webp" alt="The snowcat on Pine Ridge Pass in a blizzard, beside a snow-capped woodpile and a pale blue patch of ice, with a T-shaped lift tower with a red light, a turbo canister, a blue car and a toppled cone nearby and big flakes falling." width="1440" height="810" loading="lazy" /><figcaption>Pine Ridge Pass in a blizzard.</figcaption></figure>
</div>

## Blade, snow and score

Each shift's snow is a 128 × 128 grid of depths, whatever the size of the map, so a cell is about half a meter across on the driveway and closer to 0.9 m on the helipad. The blade samples 15 points across its 4.6-meter width, and while it's down and moving forward, each one digs the snow out of the cells under it every frame and adds about a quarter of it to a load bin of its own. When a bin is full, the overflow is thrown outward past it, part of it lost as spray, and builds windrows along your path, while a rolling wave of snow chunks in front of the moldboard grows with the load. Angle the blade with Q or E and each bin passes some of its load toward one end, so the snow is cast off that side. Lift the blade with Space, or stop, and the load drops in a pile in front of you. The tracks leave grooves, and plowed ground shows what's underneath: groomed corduroy, cobblestones, a dashed center line or the helipad's markings.

<figure>
  <picture><source srcset="/images/games/snow-patrol-plow-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/snow-patrol-plow-code.webp" alt="JavaScript source, lines 3105 to 3149 of play.html: while the blade is down and the snowcat moves forward, a loop over the 15 blade bins places each bin along the blade and finds its cell in the snow grid. From that cell and its four neighbors it takes 92 percent of the snow above a thin base from the center and 64 percent from the others, marks them groomed and adds 27 percent of what it took to the bin's load. If the blade is angled, part of each bin's load moves to the next bin toward that side. When a bin holds more than its limit, the excess is thrown sideways past the bin by the thrower's distance plus a random amount and added to the snow there, scaled by the spray factor." width="1440" height="1833" loading="lazy" /></picture>
  <figcaption>The blade's scoop, pass-along and spill in <code>play.html</code>, run every frame.</figcaption>
</figure>

The progress bar counts the zone's cells that are down to a thin layer and reads 100 percent once 95.5 percent of them are. At 80 percent, a gold marker floats over the deepest snow that's left, and the snow radar shows it too. The clock starts when you first drive, and on later shifts in the same visit, as soon as the shift loads. A shift pays out in credits when the zone is clear: base pay from 160 on the driveway to 550 on the helipad, 120 more and three stars for beating par, 60 and two stars for finishing within 1.45 times par, a clean-driver bonus of up to 100, and 20 for each snowman and 15 for each canister. A bump into a parked car at more than a crawl, at most one every 3.2 seconds, knocks 15 points off the clean-driver score, down to a floor of 20, sets off the car's alarm and puts its angry owner on channel 4. Stars add up to a career rank on the title screen, from Rookie Groomer to Alpine Legend at 14 of the 15.

<div class="project-media-gallery">
  <figure><img src="/images/games/snow-patrol-hud.webp" alt="The game's HUD on the Cabin Driveway: the snowcat has bumped a parked blue SUV, with WATCH THE PAINT! -15% floating above it and the radio banner reading ANGRY GUEST · CH. 4 · REVERB-TTS, Hey! Watch the paint! That is a brand new four by four! The mission card shows 160 Cr, 00:30, Follow gold marker to finish! and 95 percent, with chips for 154.4 t, the car at 85%, snowmen 2/2, fuel 2/2 and FLOW x3.0, and a gold diamond marker floats by the lit chalet. The snow radar reads 60 FPS, and the telemetry shows 21 KM/H, PLOW DOWN, the blade load and the turbo meter." width="1440" height="810" loading="lazy" /><figcaption>Bumping a guest's SUV at 95 percent, with the gold marker over the last of the snow.</figcaption></figure>
  <figure><img src="/images/games/snow-patrol-victory.webp" alt="The SHIFT COMPLETE panel for Cabin Driveway Clear!: 00:35 clear time, 181t of snow moved and three stars, with Shift Base Pay +160 Cr, Speed Rating (Par 00:55) +120 Cr, Clean Driver (85%) +85 Cr, a side bonus for two snowmen and two canisters of +70 Cr and Total Shift Earnings of +435 Cr, and buttons for Next Shift, Garage, Free Groom and Replay over the blurred driveway." width="1440" height="810" loading="lazy" /><figcaption>The same shift's payout.</figcaption></figure>
</div>

Holding Shift fires the twin turbo: about 44 percent more top speed for as long as the tank lasts, close to three seconds from full, and it refills in about five, while the camera pulls back and widens a little. Credits buy upgrades in Gus's garage, three levels each, for 140 to 620 credits a level. The Wide-Wing Plow Blade makes the blade 15 percent wider a level and lets it hold more snow, the Twin-Turbo Diesel adds top speed, turbo and refill rate, the Heated Ice-Grip Tracks turn faster and grip better on ice, and the Rotary Powder Thrower casts snow farther. The paint shop has five liveries, from the free Pisten Crimson to Stealth Ember at 300, and the snowcat's shader repaints its red voxels in the new color while leaving the glass, lights and tracks alone.

## Keyboard, gamepad or touch

On a keyboard, W A S D or the arrow keys drive and steer, Q and E angle the blade, Space lifts or drops it, Shift fires the turbo and H sounds the air horn. C cycles four cameras, Auto, Close, Tactical and Orbit, and dragging with the mouse swings into the orbit camera, where the wheel zooms. R restarts the shift, Esc opens the stage menu, G the garage and O the settings, and B, U and M mute the music, the radio and the effects. A gamepad drives with the triggers or the left stick, steers with the left stick, angles the blade with the bumpers, lifts it with A, boosts with X, honks with B and orbits the camera with the right stick. Y changes the camera, Select opens the garage and Start the stage menu, and the pad rumbles as the blade bites, harder for impacts, snowmen and drift busts. On a screen 860 pixels wide or narrower, a six-button pad appears for driving and angling the blade.

The settings have volume sliders for the master, music, radio and effects, three radio EQ presets (Broadcast, Walkie and Studio), four pixel sizes, the time of day, the weather, shadow quality, the strength of the outlines, glow and snow caps, and camera sensitivity. All of them except the time of day, which each shift sets for itself, are saved in the browser with your credits, stars, best times and upgrades.

## Built from slices

`makeProceduralVolume` fills a small voxel grid in code, then works out a normal for each voxel from its neighbors, darkens voxels that have others stacked above them and marks upward-facing tops for snow caps. The snowcat's chassis is 40 by 58 voxels and 32 slices tall, built twice for two tread frames that alternate as it moves. Each volume's slices are laid side by side in strip textures for color, normals and those extra values, and its mesh is a stack of flat quads, one to three per slice, which look up their slice in the strip, discard empty pixels and shade from the stored normals in three bands of light. There are 25 volumes from 19 builder functions: the snowcat's chassis, twice, and its blade, crane and tiller, two gondola cabins, Barnaby, the turbo canister, the helicopter, three cars, the lift tower, the snowman, the cone, the woodpile, two pines, two boulders, the zone pole, the lantern, the chalet and the grass. Props and trees are instanced, and a matching depth material lets the stacks cast real shadows.

<div class="project-media-gallery">
  <figure><img src="/images/games/snow-patrol-inspector.webp" alt="The Sprite-Stack Slice Strips panel open beside the snowcat, which has stopped against a green wagon in the Chalet Village Court by the chalet, with an angry guest's radio line at the top. The panel lists each model's slices laid side by side: Snowcat Chassis (f0), 32 slices, 40×58px; Front Plow Blade, 16 slices, 54×18px; Alpine Rescue Chopper, 20 slices, 26×54px; Alpine Gondola, 20 slices, 16×14px; Barnaby Lodge Husky, 12 slices, 12×18px; and the start of the Turbo Fuel Canister." width="1440" height="810" loading="lazy" /><figcaption>The Slice Strip Inspector (V) shows the slices of nine of the models.</figcaption></figure>
  <figure><img src="/images/games/snow-patrol-exploded.webp" alt="The Chalet Village Court in daylight with every sprite stack pulled apart: the snowcat rises as a tall tower of separated slices from its blade to its amber roof lights, a snowman becomes a column of thin layers, and the zone poles and lanterns turn into dotted columns beside a pine and a woodpile." width="1440" height="810" loading="lazy" /><figcaption>X pulls every stack's slices apart.</figcaption></figure>
</div>

The scene renders into a low-resolution buffer, a third of the window's size by default, or a half, a quarter or full size in the settings. A final pass scales it up with hard pixel edges, draws a 1-pixel outline wherever the depth jumps, adds a glow around the brightest pixels and rolls off the highlights. The ground is a grid of 128 × 128 vertices that the shader lifts from a data texture holding each cell's snow depth, how groomed it is, its zone and the ground height, re-uploaded whenever the snow changes. The same shader paints the snow in three tones and adds the ice, the markings, the zone's dashed edge, pools of warm light from lanterns and chalet windows, the headlights, the flashing roof beacon, the reversing lights and the helicopter's searchlight, and the sun casts real-time shadows.

The game's code is 4,112 lines of JavaScript, about 194 KB, in one module in `play.html`, and Three.js is its only library. Most of the rest of the file is the voice bundle: the 24 MP3s, about 1.3 MB of audio, as base64 in a JSON script tag.

## Radio and music

Three voices work the radio. Chief Maren has 17 lines: a briefing for each shift, the 50 and 80 percent marks, black ice, the turbo, a smashed snowman, the first canister, a drift bust, a squall, Barnaby and the horn, and the wrap-ups, including the helicopter's clearance. Gus has five, one for each upgrade and one for a new paint job, and the angry guest on channel 4 has two. The lines run from 3 to 9 seconds, 2 minutes 17 seconds in all. Each one plays between two radio squelches through a high-pass, a low shelf, a presence peak and a low-pass that the Broadcast, Walkie and Studio presets retune, with a banner showing the speaker and the words, and the music ducks while it plays.

The music is generated as it plays: three tracks, one for each time of day, at 96, 102 and 112 beats a minute. Each is a loop of four chords with a choir pad made from sawtooth waves through pairs of vowel formant filters, an arpeggiated lead and a bass line, and during a shift a synthesized kick and hi-hat that get busier with speed, plowing and turbo. The website names the tracks Alpenglow Chill, Alpine Groove and Midnight Aurora. The effects are synthesized too: a diesel engine from a sawtooth and a sub-octave triangle that rise with speed and load, filtered noise for the snow crunch, the ice scrape and the wind, which swells in a blizzard, an air horn of three tones sounded together, Barnaby's two-yip bark, a car alarm chirp and chimes for pickups.

## The website

The repository's `index.html` is the game's website, and all of its art apart from the logo is drawn live with Canvas 2D by about 1,500 lines of script, with no libraries. The header is a live pixel-art diorama of the snowcat plowing a road with Barnaby beside it, under a gondola line and with a chalet down the road, with buttons for alpenglow, day and aurora and one to honk at Barnaby, and clicking the snow kicks up powder. Below it, a console plays an animated cover until you launch the real game inside the page, each shift has a card with a little animated scene and a link that opens the game on that shift, and a turntable spins sprite-stacked versions of the snowcat, the chalet, the helicopter and Barnaby that you can drag and explode into their slices, with the snowcat in any of the five liveries. The voice cast section has animated pixel portraits of the three speakers and plays nine of the MP3s from `assets/voices`.

<div class="project-media-gallery">
  <figure><img src="/images/games/snow-patrol-site.webp" alt="The top of the SNOW PATROL website: a pixel-art diorama of the red snowcat plowing with its headlights on beside Barnaby the husky, under a red and a gold gondola cabin, with pines, lanterns, a log chalet with a smoking chimney and pink mountains, buttons for Alpenglow, Alpine Day, Aurora and HONK AT BARNABY, then the headline CARVE THE MOUNTAIN. CLEAR THE STORM. and buttons to play full screen, play embedded below or see the source on GitHub." width="1440" height="810" loading="lazy" /><figcaption>The website's live pixel-art header.</figcaption></figure>
  <figure><img src="/images/games/snow-patrol-turntable.webp" alt="The website's sprite-stack turntable: a pixel snowcat labeled SNOWCAT 01 · 18 SLICES with its layers spread apart, EXPLODED: 71%, on a round plinth, beside buttons for the Tracked Snowcat, Alpine Chalet, Rescue Chopper and Barnaby Husky, the explode slider at 71 percent and five livery swatches with Pisten Crimson selected." width="1140" height="402" loading="lazy" /><figcaption>The website's turntable, with the snowcat exploded to 71 percent.</figcaption></figure>
</div>

## How it was made

The repository has three commits, all dated November 23, 2026. The first holds a README stub and the icon. About five hours later, the second added the game, the 24 voice files, the voice script and the first version of the website, and about a quarter of an hour after that, the third rebuilt the website with the live dioramas and the turntable. GitHub Pages serves the repository's root as the site, with no build step.

The voices come from `scripts/generate_voices.py`. It loads the fp16 variant of Software Mansion's Reverb-TTS, builds each character's voice from one reference recording and its transcript, which the README and the script call zero-shot cloning, and generates that character's lines. The script labels Chief Maren's reference HiFi-TTS Studio #92 (Broadcast Female), Gus's HiFi-TTS Studio #6097 (Deep Baritone) and the guest's RAVDESS Studio #21 (Strong Angry), whose transcript is "Dogs are sitting by the door! Kids are talking by the door!" The reference clips aren't in the repository. FFmpeg then masters each line with a 70 Hz high-pass, trims the silence from both ends, normalizes the loudness to -16 LUFS and writes a 24 kHz mono MP3, and the script bundles all 24 as base64 JSON, the same data `play.html` embeds. The README gives the licenses as CC BY-NC 4.0 for the model weights, CC BY 4.0 for NVIDIA's HiFi-TTS and CC BY-NC-SA 4.0 for RAVDESS. It also credits [danielwh2/sprite-stacking](https://github.com/danielwh2/sprite-stacking), under the MIT License, as the inspiration for the sprite stacking, and the code's own heading for that section calls it a port. Apart from Three.js and the voices, everything in the game, from the models and textures to the music and the sound effects, comes from its own code.

## Play it

Play [in your browser](https://nearbycoder.github.io/snow-patrol/play.html), or start from [the website](https://nearbycoder.github.io/snow-patrol/), which can run the game inside the page and has a link to each shift. Pick a shift on the title screen and press Start Shift. It needs WebGL 2, which Three.js r170 requires, and there's nothing to install: a first visit downloads about 1.5 MB, or 3.2 MB uncompressed, almost all of it `play.html` and Three.js. To run it from a copy of the repository, serve the folder with any static file server; the game still loads Three.js from jsDelivr.

[Browse the source on GitHub](https://github.com/nearbycoder/snow-patrol). The creation date shown here is the GitHub repository's UTC creation date. The repository has no screenshots or video, so every screenshot here was captured for this page from the live game and website in headless Chromium on Linux with an AMD Radeon 8060S, at the game's default 3x pixel size. A small script drove the snowcat with the keyboard controls, steering by the game's own snow radar, and it cleared the Cabin Driveway in 35 seconds and the Avalanche Helipad in 1:08 for the payout and helicopter pictures. The cover and the shift, helicopter and exploded pictures are 1440 × 810 crops from the middle of a 2160 × 1215 window, which leaves out the HUD panels. The code excerpt is from `play.html`.
