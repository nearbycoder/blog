---
title: "Dusk Rush ’64"
summary: "A destructive arcade racer for the browser, set around San Francisco Bay: 20 courses, 30 cars and five modes, with launch ramps, shortcuts, bodywork that crumples and breaks away, Time Attack ghosts and a finish you can rewind. The whole game is one HTML file of about 408 KB, drawn with WebGL2, with every sound synthesized."
role: "Creator"
genre: "Arcade racing"
platforms: ["Web"]
engine: "Custom WebGL2"
year: "2026"
createdAt: "2026-11-18T01:03:07Z"
stack:
  [
    "JavaScript",
    "WebGL2",
    "GLSL",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "Node.js",
    "Headless Chrome",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/dusk-rush-64/play/"
githubLink: "https://github.com/nearbycoder/dusk-rush-64"
featured: false
accent: "pink"
draft: false
image: "/images/games/dusk-rush-64.webp"
imageAlt: "A yellow Spectre S with a rear wing speeds up a wide avenue at sunset toward orange jump markings, between pixelated towers and a CROWN AUTO sign, with a 200 km/h speedometer, a JUMP 75 m callout and a personal best of 0:54.74 on screen."
imageCaption: "Time Attack on Downtown Launch: the Spectre S at 200 km/h with a jump 75 m ahead, chasing a personal best of 0:54.74. A screenshot from the repository's verification suite."
demoVideos:
  - src: "https://nearbycoder.github.io/dusk-rush-64/media/attract.mp4"
    title: "Dusk Rush ’64 gameplay reel"
    caption: "The 16-second gameplay reel that opens from the Watch gameplay button on the game's website. A Tempest GTR races the pack across the Golden Span bridge deck, an Aftershock launches off a hilltop ramp on Twin Peaks Plunge and rolls in midair, a Neon Sprint boosts under strings of red lanterns on Chinatown Charge at night, a Grizzly 4×4 drives into the covered bridge on Redwood Rampage, and a Spectre S wrecks in a fireball on Cable Car Carnage and smolders under its own smoke, before an end card with a red muscle car and the line Play in your browser. A caption names each course and car. It has engine and crash sound with a silent end card, runs at 864×486 and 30 fps, and is served from the game's website."
    poster: "/images/games/dusk-rush-64-trailer-poster.webp"
    original: "https://github.com/nearbycoder/dusk-rush-64/blob/main/docs/media/attract.mp4"
---

Dusk Rush ’64 is an arcade racer for the browser, set in and around San Francisco. You start at the back of an eight-car grid and race seven rivals over hill streets, docks, bridges and coastal roads, launching off ramps, cutting through shortcuts and trading paint on the way. The bodywork crumples where it's hit, panels and wheels come off, and a hard enough crash ends in a fireball and three seconds added to your time. All 20 courses and 30 cars are open from the first race.

The whole game is one self-contained HTML file, with no libraries, fonts or downloads. WebGL2 draws the city, the cars and the effects from geometry the game's own code builds, Canvas 2D draws the interface on a layer above, and every sound is synthesized with the Web Audio API. It plays with a keyboard, a gamepad or two thumbs on a touchscreen, inside its website or on a page of its own.

## Around the bay

There are 20 courses: 18 circuits of three laps, and two point-to-point sprints, Market Street Mayhem and Dusk City Gauntlet. Each is set in a district of its own, from Downtown and the tram crossing on Nob Hill to the crane gantries of the Port of Oakland, the timber yard in Marin County, Rockridge Quarry and the prison yard on Blackrock Island, and they run from 1.02 to 2.07 km. Five lighting sets cover sunset, golden light, morning, fog and night, and on Rainline Run the wet road takes more than a quarter of your grip.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-rush-64-golden-span.webp" alt="A purple sports car with white stripes sits on a bridge deck between red suspension cables, with a city skyline and hills in blue haze behind it." width="768" height="408" loading="lazy" /><figcaption>Golden Span, on the bridge deck in fog.</figcaption></figure>
  <figure><img src="/images/games/dusk-rush-64-chinatown-charge.webp" alt="A teal sports car on a curving street at night under strings of glowing red lanterns, between pale apartment blocks." width="768" height="408" loading="lazy" /><figcaption>Chinatown Charge, under the lanterns at night.</figcaption></figure>
  <figure><img src="/images/games/dusk-rush-64-redwood-rampage.webp" alt="A pink boxy off-roader with a roof rack inside a covered timber bridge, with pine trees visible through its cross-braced sides." width="768" height="408" loading="lazy" /><figcaption>Redwood Rampage, inside the covered bridge.</figcaption></figure>
</div>

Every course has two or three launch ramps and two shortcuts, each with a name and a surface of its own, like the steel Maintenance Deck on Golden Span or Keeper’s Path across the grass at Point Bonita. Gravel and grass grip less and drag more than pavement, leaving a shortcut at speed pops the car into the air, and both branches still bring you back through the checkpoints. On Cliffside Chaos, Freeway Fracture, Quarry Quake and Island Lockdown the ramps clear a gap, and taking one too slowly ends with MISSED THE GAP and a recovery. A route arrow calls out the next jump, shortcut, bend or hairpin with its distance in meters, and a mini-map shows where every car is.

## Five ways to race

**Free Race** puts any car on any course against seven rivals, at one of three difficulties (Cruiser, Arcade or Expert) and three damage settings. On Cosmetic, damage only shows; on Arcade and Heavy a crushed nose costs acceleration, uneven side damage pulls the steering, and the car can be wrecked. **Championship** runs five cups of four rounds each, City Lights, High Country, Fault Line, Pacific Run and Last Horizon, which together cover all 20 courses in order. Points run 12, 9, 7, 5, 4, 3, 2 and 1 down the field, 24 points earns silver and 40 gold, progress saves after every round, and finishing a cup unlocks a racing livery. **Time Attack** is a solo run against a pale teal ghost that retraces the line, drift angle, pitch and roll of your best completed run, and each checkpoint shows how far ahead or behind you are. **Wreck Run** forces Heavy damage and keeps a high score for each course, built from hard impacts, airtime, clean slides and distance. **Free Drive** has no timer and no finish.

<figure>
  <img src="/images/games/dusk-rush-64-title.webp" alt="The title screen: DUSK RUSH ’64 in large slanted letters over a yellow Spectre S on a road in front of a red suspension bridge and a striped setting sun, with a START ENGINE button and cards for Free Race, Championship, Time Attack, Wreck Run and Free Drive along the bottom." width="1440" height="813" loading="lazy" />
  <figcaption>The title screen, with the five modes along the bottom.</figcaption>
</figure>

## Boost, wrecks and replays

Shift spends boost, which raises the car's thrust and lets it run past its top speed, and the extra speed bleeds away once you let go. The meter refills slowly as you drive and faster with handbrake slides, airtime and close passes, which the game calls out as CLEAN SLIDE, AIRTIME and CLOSE PASS. Space is the handbrake, for sliding a broad corner. In the air, steering rolls the car and the pedals pitch it, so you can line up a landing; come down on the roof or a side and the car takes the hit.

Front, rear, both sides and the roof take damage separately, and the body deforms to match: the nose folds, the flanks push in and the roof crushes. Past a threshold, bumpers, doors, the hood, the roof panel or wing, and the wheels break away and tumble down the road, and a car that loses its hood shows an engine bay built to fit its opening. Enough damage wrecks the car. It bursts into flames, the game slows down for a moment, and after a short countdown the car is put back on a safe stretch of road with three seconds added to its time. Pressing R recovers you at any time, at the same price.

After a timed finish, Watch finish replays the last six seconds of the race as it was drawn, with the damage, traffic and ghosts, and you can pause it and scrub through it. Split times and finishing positions use the instant each car crosses a gate, worked out inside the physics step, so a photo finish goes to the car that really got there first. In a race, pause and open Photo mode to orbit your car, zoom and save the view. The game enlarges the frame by a whole number without smoothing, adds a strip with the course, the car and the game's name, and downloads it as a PNG.

<div class="project-media-gallery">
  <figure><img src="/images/games/dusk-rush-64-wreck.webp" alt="A wrecked yellow Spectre S burns in a large pixelated fireball on a hillside street, with a trail of flames and smoke behind it, under a RECOVERY 3 countdown, with the wreck score at 562." width="1440" height="813" loading="lazy" /><figcaption>A wreck in Wreck Run on Cable Car Carnage, staged by the verification suite.</figcaption></figure>
  <figure><img src="/images/games/dusk-rush-64-photo-mode.webp" alt="Photo mode: a close view of the yellow Spectre S with its nose crushed and its front bumper torn off, shards of glass and a yellow panel on the road, and Orbit, Zoom, Back and Save photo buttons along the bottom." width="1440" height="813" loading="lazy" /><figcaption>Photo mode, orbiting the same car after a hit on the same course.</figcaption></figure>
</div>

## Thirty cars

The 30 cars come in five classes of six: Street, Muscle, Exotic, Rally / Off-road and Heavy / Special. Beside the hatchbacks, muscle cars and wedge-shaped exotics there's a taxi, a pursuit sedan with a light bar, a delivery van, a beach cruiser, a trophy truck, a buggy with an open roll cage and a truck cab. Top speeds run from 220 km/h for the Iron Mule truck cab to 324 km/h for the Mirage X, and weights from 740 kg for the Dusthopper buggy to 2,580 kg for the Iron Mule. The showroom rates each car for top speed, acceleration, grip, weight, durability and stunt control, which is how well it can be steered in the air. The Mirage X burns boost more slowly than the rest, and the electric Prism Zero has a motor sound of its own. Every car comes in eight paint colors and seven liveries: Factory and Club stripes from the start, and Offset, Coastline, Crosswind, Chequer and Flash from the five cups.

<figure>
  <img src="/images/games/dusk-rush-64-lineup.webp" alt="Six cars on dark showroom turntables, each labeled with its class: the yellow Spectre S, the red Hammerhead V8 with four round headlights, the white Switchback RS rally hatch with a wing, the teal Dusthopper buggy with an open roll cage, the blue Code Three police car and the purple Iron Mule truck cab." width="1440" height="752" loading="lazy" />
  <figcaption>Six of the 30 cars, covering all five classes, rendered in the showroom and laid out on one plate by the verification suite.</figcaption>
</figure>

Each body is built in code from cross-sections along its length, with its own wheelbase, wheel size, nose height, roof rake, wheel spokes, headlamps (pop-ups, quad lamps, rally lights and more) and tail. The front wheels steer and every wheel spins on its own hub.

## Keyboard, gamepad or two thumbs

On a keyboard, W or the up arrow accelerates and S or the down arrow brakes, then reverses. A and D or the side arrows steer and balance the car in the air, Shift boosts, Space is the handbrake, C cycles the chase, bumper and bonnet cameras, R recovers and Escape pauses. Menus work with the arrow keys, Tab and Enter, and in the showroom you drag the car or press Q and E to turn it. A standard gamepad, read through the browser's Gamepad API, steers with the left stick, uses the triggers as analog gas and brake, boosts with the left shoulder button and handbrakes with the west face button; the north button changes the camera, Select recovers and Start pauses.

On a touchscreen, your left thumb steers with two arrow pads and your right holds GAS, with BRAKE beside it and DRIFT and BOOST above. Sliding from Gas onto Boost or Drift keeps the throttle open. VIEW and RECOVER sit above the arrows, out of the way of a sliding thumb. The layout fits landscape and portrait, down to a phone 320 pixels wide, and keeps clear of notches. Invisible buttons sit over the artwork at the same positions for screen readers and switch controls, and on touch devices a pedal or steering arrow they activate stays held until it's activated again.

<figure>
  <img src="/images/games/dusk-rush-64-touch.webp" alt="The landscape touch cockpit during a race: steering arrows under VIEW and RECOVER buttons on the left, BRAKE and a lit GAS pedal under DRIFT and BOOST on the right, a 205 km/h speedometer with a boost bar in the middle, and position, lap and time at the top." width="1440" height="481" loading="lazy" />
  <figcaption>The two-thumb cockpit on Golden Span, with Gas held. The README says it shows the published game in Safari, in an iPhone 18 Pro simulator.</figcaption>
</figure>

Settings has sound and volume, a widescreen or classic 4:3 display, full screen where the browser allows it, and a driving guide for keyboard, touch and gamepad. Reduced motion, which follows the system setting at first, drops the slow motion after a wreck, the camera's pull-back under boost, falling rain and screen flashes.

## One file, built by code

`docs/play/index.html` is the whole game: 11,398 lines and about 408 KB. It runs in order through the course and car tables, the WebGL2 renderer, collision, car bodies and wheels, scenery, saving, sound, physics and race rules, the cameras, the finish replay, the interface and input.

Each course is one entry of data: a name, a district, a feature line, a sky, a scenery theme, the road's half-width, 10 to 15 control points on a 32-meter grid with a height for each, the launch ramps as fractions of a lap, and the control point each shortcut bypasses. When the game starts, it turns the points into a Catmull-Rom spline and rounds tight corners so the inside of the road can't fold through its own wall. It draws each shortcut as a curve that leaves and rejoins the road smoothly, moves any ramp that would share pavement with a shortcut, and works out the route arrow's calls from the finished road. Scenery for the course's theme is batched into sectors along the road and culled by distance.

<figure>
  <picture><source srcset="/images/games/dusk-rush-64-tracks-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/dusk-rush-64-tracks.webp" alt="JavaScript source, lines 109 to 133 of docs/play/index.html: the opening of the tracks array, with Downtown Launch (Downtown, Broad avenues · Plaza cut, sunset, city, 12) and Cable Car Carnage (Nob Hill, Tram crossing · Stair alley, gold, tram, 8), each followed by a string of coordinate pairs, a list of heights, jump fractions and two shortcut indices." width="1440" height="1005" loading="lazy" /></picture>
  <figcaption>The first two courses in <code>docs/play/index.html</code>. The string holds the control points, the next list their heights in meters, then the ramps and the two shortcuts.</figcaption>
</figure>

The world renders 240 pixels tall during a race (300 in the menus and 360 in the showroom) and is scaled up without smoothing. If frames keep running slow, the game drops to about two-thirds of that resolution and lowers its particle limit. One GLSL shader draws the world and the cars: car paint with reflections and the six livery patterns, glass, chrome, tires, lit windows, water, boards and paving, headlight beams, pools of street light and fog. Fire, smoke, sparks and glass are pixel-painted billboards drawn in a single instanced call. Every sign on a course, from local businesses to shortcut names and checkpoint numbers, is printed with Canvas 2D into a texture when the course loads.

The simulation runs at a fixed 60 Hz. Rivals drive through the same physics as you, with a target speed set by the difficulty, lane changes to get past slower cars, a plan for which shortcut to take, and a way to back out if they get stuck. The finish replay is recorded on the graphics card: 20 frames a second are copied into a 120-layer texture array, which holds the six seconds without reading pixels back. Records, ghosts, scores and cup progress save in the browser, with each ghost frame packed into 20 bytes. If the browser takes the graphics context away mid-race, the game keeps the race in the page's history and puts every car back where it was when it reloads.

Sound is off until you turn it on. Each class has its own engine voice: two oscillators whose pitch follows speed and gear, through a filter that opens with the throttle. Filtered noise makes the wind, tire scrub and boost, a short delay adds an echo in tunnels, the nearest rival's engine pans from side to side, and metal impacts, breaking glass and a cheering crowd are synthesized into sample buffers the first time sound starts.

## The website

The repository's `docs` folder is the game's website, served by GitHub Pages at [nearbycoder.github.io/dusk-rush-64](https://nearbycoder.github.io/dusk-rush-64/). It opens with the title, a Press Start button that goes straight to race setup, and a Watch gameplay button that opens the reel. The garage puts every car on a turntable that you drag, or turn with the arrow keys, through 24 angles 15 degrees apart, and each car's views load only when you first turn it. Further down are a paint booth with the seven liveries, a course book with a photograph and a route map for every course that can trace either shortcut, a before-and-after damage comparison, and guides to the cameras, the controls and the five modes. Picking a car and a course carries that pair into Free Race, and the cabinet at the bottom runs the game in the page, opens it full page, or downloads it as a single HTML file.

## How it was made

The repository's 13 commits span November 17 and 18, 2026: an initial commit with a stub README and an icon, then the game, its website and a verification suite in one commit, then eleven more. Those turned the website into a playable cabinet with an illustrated car, course and driving guide, added the two-thumb cockpit, refined finish timing, destruction and recovery, finished the sprint courses, recovered the display when a mobile browser drops WebGL at startup, synthesized the impact, glass and crowd sounds, and put every car on a showroom turntable.

The verification suite in `tests` is a set of Node.js scripts that start a headless Chrome and drive the game's own code over the DevTools protocol. The README says its default run writes the screenshots in `captures`, reads the triangles uploaded to WebGL to check the camera's near plane and moving car bodies against the rendered courses, runs all 20 courses at each difficulty and completes all five cups. The code also races all eight cars to the finish on every course, puts all 30 cars through acceleration, braking, steering, a jump, a barrier hit and a recovery, and checks saving, touch, an analog gamepad and blocked storage. Other flags cover race feedback such as finish order, replay frames and ghost timing, the mobile checks alone, another simulated hour of driving, a real-time run that counts frames over 50 ms, the published website, and rendering the 720 turntable views again. The README says the showroom, track photographs and gameplay reel come from the game renderer.

## Play it

Play it in your browser at [nearbycoder.github.io/dusk-rush-64/play](https://nearbycoder.github.io/dusk-rush-64/play/), or start from [the website](https://nearbycoder.github.io/dusk-rush-64/). It needs WebGL2 and says so if the browser doesn't have it. There's nothing to install: the website's Download game link saves the whole game as `dusk-rush-64.html`, and `docs/play/index.html` in the repository runs offline, straight from disk. Turn the sound on in Settings. Records, ghosts, liveries and cup progress stay in the browser.

Dusk Rush ’64 is one of four browser games, each with its own GitHub Pages site, whose repositories were created on GitHub within a minute of each other on November 18, 2026 (UTC), along with [Starlight Carnival](/games/starlight-carnival), [Wildlight](/games/wildlight) and [Veilbound](/games/veilbound).

[Browse the source on GitHub](https://github.com/nearbycoder/dusk-rush-64). The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from the repository's `captures` folder, which the verification suite fills by driving the game in headless Chrome. The touch cockpit is the exception: the README says it comes from an iPhone 18 Pro simulator. The course photographs, the gameplay reel and its poster come from the game's website, and the code excerpt is from `docs/play/index.html`.
