---
title: "Clay-Per-View: Famous Last Blows"
summary: "A clay wrestling brawler for one or two players, staged like a late-night broadcast: eight fictional celebrities fight for a television title belt, posed in stepped stop-motion frames while two commentators call the action. The desktop game is C++ on Unreal Engine 5.9 with every model sculpted by Blender scripts, and the browser version is a file-for-file TypeScript port on Three.js."
role: "Creator"
genre: "Wrestling brawler"
platforms: ["macOS", "Web"]
engine: "Unreal Engine 5.9 and Three.js"
year: "2026"
createdAt: "2026-11-20T19:14:32Z"
stack:
  [
    "Unreal Engine 5",
    "C++",
    "Blender",
    "Python",
    "NumPy",
    "Kokoro-82M",
    "FFmpeg",
    "TypeScript",
    "Three.js",
    "WebGL2",
    "GLSL",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "meshoptimizer",
    "Vite",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/clay-per-view/play/"
githubLink: "https://github.com/nearbycoder/clay-per-view"
download: "https://github.com/nearbycoder/clay-per-view/releases/latest"
featured: false
accent: "yellow"
draft: false
image: "/images/games/clay-per-view.webp"
imageAlt: "Key art on a dark purple background: CLAY-PER-VIEW in yellow letters over a red Famous Last Blows banner, under a gold television title belt with CPV on its screen, between clay busts of Vince Voltage, a rocker with long black hair and a black top, on the left and Madame Mystica, in a purple turban with a white feather and gold hoop earrings, on the right. Below them reads Eight stars. Three bouts. One belt."
imageCaption: "The key art from the press kit, with Vince Voltage and Madame Mystica on either side of the title belt."
demoVideos:
  - src: "https://nearbycoder.github.io/clay-per-view/media/trailer-720.mp4"
    title: "Gameplay trailer"
    caption: "The 46-second trailer from the game's website, which combines footage of the desktop game with extra scripted commentary. It opens on Chef Bruno Flambe hitting Vince Voltage with a studio clapperboard, then shows the title, the entrances of Duchess Winnifred and DJ Wubz, Lola Glitz cast for a Ratings Run, Rex Granite pinning Chip Sterling for a three count, the Mic Drop, Encore, Tiny Fate and Order Up! Curtain Calls, and Rex with the title belt. It has sound, and it's the 720p copy that the game's website serves. The full-quality 1080p file in the release has English and Brazilian Portuguese captions."
    poster: "/images/games/clay-per-view-trailer-poster.webp"
    original: "https://github.com/nearbycoder/clay-per-view/releases/download/v1.0.0/Clay-Per-View-Trailer.mp4"
---

Clay-Per-View: Famous Last Blows is a wrestling brawler for one or two players, staged like a late-night broadcast. Eight fictional celebrities, from a straight-to-streaming action hero to a late-night TV psychic, fight for a television title belt in a packed arena. The referee counts the falls, and two commentators, Dirk Bluster and Nigel Quibble, keep score of the indignities. The fighters are clay puppets that move in stepped stop-motion frames, and every model in the game, from the headliners to the crowd and the props, is sculpted by Blender scripts.

There are two versions. The desktop original is C++ on Unreal Engine 5.9 and runs on Apple silicon Macs. The browser version, which the Play in your browser button opens, is a TypeScript port on Three.js that follows the C++ file for file and uses the same models, animation and sound. It plays with a keyboard, gamepads or a touchscreen, with nothing to install.

Eric Fogel developed MTV's _Celebrity Deathmatch_ around feuding public figures in a clay wrestling ring, and the project guide says his accounts of staging its matches informed the game's broadcast format. Clay-Per-View isn't affiliated with that show. Its league, belt, commentators and headliners are all invented, and no real person appears in the game.

## Three broadcasts

The main mode is the Ratings Run. Cast a headliner and the game books three bouts against rivals chosen for that star, each a single 60-second round, and you have to win each one to move on. In the Cold Open the rival plays one difficulty level lower, and the crowd wants a three-hit combo. In the Prop Department both corners start armed, you with a studio clapperboard and your rival with a guitar, and the crowd wants a hit with a prop. In Prime Time both stars start with a full signature meter, and the crowd wants the bout finished with a Curtain Call. Each episode pays up to three stars: one for the win, one for finishing with at least half your health and one for answering the crowd. The game remembers the champions and each headliner's best score out of nine at each of the three difficulty levels.

Ring School is a coached rehearsal: the coach has you land a jab on Chip Sterling, block his punch, body-slam him and fire your signature, then sends you to casting. Exhibition casts both corners and sets the rules, Two Players splits one keyboard down the middle or gives each player a gamepad, and Watch a Bout hands both corners to the computer. After a bout, Instant Replay shows the closing seconds again from the arena camera.

<div class="project-media-gallery">
  <figure><img src="/images/games/clay-per-view-casting.webp" alt="The Cast your headliner screen: Lola Glitz, a blonde pop diva in a pink dress, and Madame Mystica, in a purple turban and a teal dress, stand in the ring above a grid of eight portraits, with Lola's power, speed and guts bars, her signature High Note and her Curtain Call Mic Drop on the left, Mystica's on the right, and the card along the top: bout 1 Madame Mystica, bout 2 DJ Wubz, bout 3 Duchess Winnifred." width="1280" height="720" loading="lazy" /><figcaption>Casting Lola Glitz for a Ratings Run, with a first-round meeting with Madame Mystica.</figcaption></figure>
  <figure><img src="/images/games/clay-per-view-title-belt.webp" alt="Rex Granite, grinning, holds the gold television title belt over his head as the referee raises an arm and confetti falls, with Dirk Bluster's subtitle: REX GRANITE wins! And the crowd goes absolutely bananas!" width="1280" height="720" loading="lazy" /><figcaption>Rex holds the television belt after the final broadcast.</figcaption></figure>
</div>

## In the ring

The fighting runs on a triangle: strikes beat grabs, grabs beat blocks and blocks beat strikes. Tap jab three times for a jab, a cross and a launching uppercut. A heavy hit toward your opponent is a big boot, and a heavy hit on its own is a haymaker. A blocked strike recoils, which stops the combo and leaves the attacker open for a moment, and catching a strike in the first 130 milliseconds of your guard counts as a clean block and earns extra ratings. In a grab, jab is a headbutt, heavy is a body slam, and grab with a direction whips your opponent into the ropes. The ropes are springy: run into them to rebound, and out of the rebound a jab becomes a clothesline and a heavy hit a dropkick. Against an opponent on the mat, jab stomps and heavy is a flying splash, but a fighter who's down can only be hit twice, and tapping any button gets you up sooner.

The ratings bar under your health fills as you land hits, take hits and taunt, and a full bar buys your signature move. The crowd throws things into the ring: a folding chair, a guitar, a gold star award, a frying pan, a mallet, a rubber chicken and a studio clapperboard. Walk over one and press grab to pick it up, then swing it or press grab again to throw it, and a taunt can earn you one.

<div class="project-media-gallery">
  <figure><img src="/images/games/clay-per-view-chair.webp" alt="Chef Bruno Flambe and Madame Mystica tussle by the ropes in a corner while a folding chair lies on the mat behind them. The HUD shows the timer at 82, SIGNATURE READY under Bruno's health bar, 3 HITS! on the right, and the banner INCOMING: FOLDING CHAIR! WALK OVER IT AND PRESS GRAB." width="1280" height="720" loading="lazy" /><figcaption>In the browser version, the crowd throws in a folding chair during a bout between Chef Bruno and Madame Mystica.</figcaption></figure>
  <figure><img src="/images/games/clay-per-view-clapperboard.webp" alt="Chef Bruno Flambe, in a chef's whites and checked trousers with a black and red clapperboard, trades blows with Vince Voltage, a rocker in black with red trousers, beside the referee. A comic sound word bursts over them, and the HUD shows both health bars, the timer at 97 and STUDIO CLAPPERBOARD x2 under Bruno's name." width="1280" height="720" loading="lazy" /><figcaption>Chef Bruno borrows a studio clapperboard for his bout with Vince Voltage.</figcaption></figure>
</div>

Lose the deciding round by knockout and you're left reeling on your feet, and your rival has a few seconds to get close and press Signature for their Curtain Call, a finishing move built around a prop. In exhibitions with pinfalls switched on, you can cover a downed opponent, and the defender kicks out by tapping jab while a needle passes through a gold zone, with one try for each count. A stray shot can flatten the referee, and if both corners pick the same star, the one on the right turns up as a tinted stunt double.

<div class="project-media-gallery">
  <figure><img src="/images/games/clay-per-view-three-count.webp" alt="Seen from above, Rex Granite, in camouflage trousers, lies across Chip Sterling on the mat while the kneeling referee slaps the count. A panel reads REX GRANITE / COVER with counts one and two lit, and P2 TAP COMMA / X IN THE GOLD TO KICK OUT over a bar with a gold zone and a needle." width="1280" height="720" loading="lazy" /><figcaption>Rex hooks a cover while Chip tries to beat the count.</figcaption></figure>
  <figure><img src="/images/games/clay-per-view-mic-drop.webp" alt="Lola Glitz, in her pink dress and white boots, stands in the ring beside a giant silver microphone head that has crashed onto the mat, its black handle rising out of the frame, in front of a crowd holding placards." width="1280" height="720" loading="lazy" /><figcaption>Lola makes good on the name of her Curtain Call, Mic Drop.</figcaption></figure>
</div>

## The cast

Eight invented showbiz archetypes headline the card. Each has a signature move, bought with a full ratings bar, and a Curtain Call to finish a reeling rival.

| Fighter           | Who                               | Signature         | Curtain Call      |
| ----------------- | --------------------------------- | ----------------- | ----------------- |
| Rex Granite       | Straight-to-streaming action hero | Box Office Bomb   | Director's Cut    |
| Lola Glitz        | Chart-topping pop diva            | High Note         | Mic Drop          |
| Chef Bruno Flambe | Volcanic TV chef                  | Flambe            | Order Up!         |
| Chip Sterling     | Tech billionaire, allegedly human | Push Notification | Launch Day        |
| DJ Wubz           | Festival headliner, face unknown  | Bass Drop         | Wall of Sound     |
| Duchess Winnifred | Frostiest royal in the tabloids   | Royal Decree      | Off With the Head |
| Vince Voltage     | Stadium rock survivor             | Power Chord       | Encore            |
| Madame Mystica    | Late-night TV psychic             | Crystal Ball      | Tiny Fate         |

The referee and the two commentators are sculpted the same way, and the commentators call every bout from a desk at ringside.

## Stop-motion on a clock

Every animation is sculpted pose by pose in code. `CpvAnims.cpp` holds 71 clips, from the idle and the walk to the signature moves and the referee's count, and each is a handful of key poses, sets of joint angles with an ease into each one. `FCpvRig` turns a pose into bone transforms for each character's proportions, plants the feet, and swaps replacement mouths and hands, as stop-motion animators do. Each pose also names an expression, from neutral and smug to dazed, when the pupils roll, and the puppets blink every few seconds.

The whole cast changes pose on one shared clock, 12 times a second by default. Each frame, a puppet works out which tick of the clock the game time falls in and updates its pose only when the tick changes, so everyone in the ring moves on together, whatever the display's refresh rate. In Options, the animation can run at 12 or 15 frames per second, or smoothly on every frame. The clay material keeps the same time: on every tick it shifts its thumbprint detail to a new random offset, so the surface boils the way handled clay does from frame to frame. On each tick, too, hair, tails, bellies and skirts swing on damped springs driven by how the head and hips moved since the tick before, and a hit kicks a flinch spring through the spine, chest and head.

<figure>
  <picture><source srcset="/images/games/clay-per-view-clock-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/clay-per-view-clock.webp" alt="Two code excerpts. C++ lines 189 to 203 of ClayPerView/Source/ClayPerView/CpvPuppet.cpp, under the comment The whole cast changes pose on the same clock, a fixed number of times per second: the puppet adds the frame's time to an accumulator, multiplies the world time by the step rate and rounds down to find the current step, and only when the step has changed, a step is forced or the rate is zero for smooth animation, updates its pose with the accumulated time, clamped between 0.001 and 0.25 seconds, and resets the accumulator. Below, TypeScript lines 213 to 225 of web/src/game/CpvPuppet.ts do the same, line for line, with the same comment and names." width="1440" height="1180" loading="lazy" /></picture>
  <figcaption>The shared clock in <code>CpvPuppet.cpp</code>, above, and in the browser port's <code>CpvPuppet.ts</code>, below.</figcaption>
</figure>

## Sculpted by script

Every model starts as Python. `Art/build_art.py` runs Blender without its interface and builds them all with a modeling kit in `cpv/common.py` that fuses primitives into smooth clay with a voxel remesh, paints vertex colors, skins the result to a shared skeleton and exports FBX. The scripts make eleven characters, the eight headliners, the referee and the two commentators, along with the ring, the arena, the audience, the weapons, the finishers' props, the effects' shapes and the thumbprint maps the clay material uses. An editor script then builds the materials in Unreal and imports the meshes, the portraits and the sound. On screen, the effects are lumps of clay too: hit bursts, comic words and chunks that stick to the mat.

The arena is assembled in code from the exported pieces. Its ropes bend, its video screens carry a live feed of the bout, its lights have moods, and about 6,700 instanced spectators sit, stand, bob and wave as the bout heats up, moved by their material from a sit-to-stand pose baked into the meshes. Some of them brought placards.

<figure>
  <img src="/images/games/clay-per-view-arena.webp" alt="A wide view of the darkened arena: Duchess Winnifred, a small figure in purple with a tall white hat, walks a lit runway from a stage under a big screen reading ENTERING WINNIFRED toward the ring, through stands packed with clay spectators, with a lower-third caption reading DUCHESS WINNIFRED, Frostiest Royal in the Tabloids." width="1280" height="720" loading="lazy" />
  <figcaption>Duchess Winnifred enters through the crowd.</figcaption>
</figure>

The sound is generated too. `Scripts/make_audio.py` synthesizes the fight effects, the crowd and the music with NumPy, and the dialogue is spoken ahead of time by the open-weight Kokoro-82M text-to-speech model, run through kokoro-onnx. The ring announcer is the Onyx voice with a short arena echo, the coach is Onyx too, Dirk is Puck and Nigel is George, with British pronunciation. Lines that name a fighter or a prop are rendered as whole sentences, one for each name. The playtest counts 225 English voice clips and 11 minutes of speech, and subtitles for the booth, the announcer and the coach come in English and Brazilian Portuguese. The Sound Mixer has separate levels for the music, voices, effects, crowd and menus under the master volume, and it can lower the music and the crowd while someone speaks.

## The browser version

The port follows the C++ closely. `web/src/engine` is a thin layer shaped like the parts of Unreal the game uses, its math, actors, mesh components, materials, audio and input, so the game code in `web/src/game` can keep Unreal's names and numbers: `CpvFighter.ts` is `CpvFighter.cpp`, `CpvAI.ts` is `CpvAI.cpp`, and the names, the order and the tuned values match, so the two can be read side by side. It keeps Unreal's world too, left-handed, with Z up and distances in centimeters, and a transform becomes a Three.js matrix only at the last moment. In Unreal, the game mode is one class spread over ten source files. In the port, `CpvGame.ts` plays the header, and each of the other files supplies its share of the methods through an `implement()` call. The port runs to 12,503 lines of TypeScript, against 10,347 lines of C++ in the Unreal project.

The models come out through Unreal's glTF exporter, so the browser starts from the vertex data the desktop game draws. `tools/build-assets.mjs` then trims them and compresses them with meshoptimizer, converts the portraits and textures to WebP and the fonts to WOFF2, and encodes the sound as MP3 in two packs, one for effects and music and one for voices. The clay, glow, crowd, sign and screen materials are GLSL ports of the Unreal material graphs, and the HUD is drawn on a 2D canvas over the scene.

In the arena, what differs is the lighting. The desktop game lights the arena with dozens of lamps, more than a browser can afford, so in the port the ring's key lights, a center stage light and a flash over the ring are real Three.js lights, the stage spots and fill lights are added in the clay shader without shadows, and each spectator is lit on the CPU, a slice of the stands each frame. The light the desktop game gets from global illumination is put back by hand, as a glow off the mat, the ring and the stage, with strengths set by matching frames of the desktop game, and there's no volumetric fog.

A web page can't know its hardware the way the Mac build does, so until a picture setting is chosen by hand, the browser version watches its own frame rate. If it stays under 44 frames per second for three seconds, the game drops a preset, and if that doesn't raise the frame rate by at least 12 percent, it puts the settings back and stops trying. Phones and tablets start a preset lower. On a touchscreen, a stick appears during a bout, with buttons for jab, heavy, grab, dodge, block and taunt and a STAR button for the signature, and the game asks to be played in landscape. Options and records are saved in the browser, and Quit becomes Exit to website.

<div class="project-media-gallery">
  <figure><img src="/images/games/clay-per-view-touch.webp" alt="A wide, phone-shaped view of a bout between Lola Glitz and Vince Voltage, with the referee between them. A yellow stick sits at the lower left, round buttons labeled JAB, HEAVY, GRAB, DODGE, BLOCK, STAR and TAUNT at the lower right, a pause button at the upper right, and Nigel Quibble's subtitle at the bottom: I'm told this is all fictional. The dental bills are not." width="1440" height="665" loading="lazy" /><figcaption>Touch controls in the browser version, in an emulated phone held in landscape.</figcaption></figure>
  <figure><img src="/images/games/clay-per-view-menu.webp" alt="The main menu over a dimmed view of the ring: Ratings Run highlighted, then Exhibition, Two Players, Watch a Bout, Options, Ring School, Credits and Exit to website, beside a Tonight's title bouts panel with the belt and the line Prime-time championship: Win the card. Answer the crowd. Earn up to nine stars." width="1280" height="720" loading="lazy" /><figcaption>The browser version's main menu, where Exit to website takes the place of Quit.</figcaption></figure>
</div>

## The playtest

`Release/PLAYTEST.md` reports a playtest of the 1.0.0 Mac build on an Apple M5 Max running macOS 27.3. The final app played 30 minutes as Chef Bruno at full health against active opponents, retries after losses included, for 36 bouts and 10 championships. In the editor, 24 exhibitions between computer players covered every headliner at each difficulty and produced 36 covers, 28 kickouts and 70 perfect guards, and all eight Curtain Calls reached the results screen. A pre-release build crashed on Metal while cleaning up its render graph, and the Mac build now waits for the pass work to finish before destroying the graph. The report also lists what still needs hands-on coverage: physical controllers, switching to full screen by hand, a second Mac and older versions of macOS.

The Mac build's Picture Quality page has four presets, from Low at a 60 percent render scale to Ultra at 125 percent, and an Auto setting that keeps High detail and scales large windows toward 1,200 rendered lines. For the report, the same fixed 1080p ringside shot ran twice with each preset, with the frame cap and VSync off, and the figures are medians of the in-game meter after the first nine seconds. The wrestlers stood still, and the report notes that frame rates in moving bouts and on other machines can differ:

| Preset | Render scale | Median frame rate | Time per frame |
| ------ | -----------: | ----------------: | -------------: |
| Low    |          60% |          119.9 fps |         8.3 ms |
| Medium |          85% |          120.0 fps |         8.3 ms |
| High   |         100% |           99.5 fps |        10.1 ms |
| Ultra  |         125% |           50.6 fps |        19.8 ms |

<figure>
  <img src="/images/games/clay-per-view-presets.webp" alt="The playtest report's Picture presets figure: the same fixed ringside shot of Rex Granite, the referee and Lola Glitz at Low, 60% render scale and 119.9 median FPS, and at Ultra, 125% render scale and 50.6 median FPS, each above a strip of ring detail at original pixel size, with the note Apple M5 Max. Images show the same fixed camera with the HUD hidden." width="1440" height="847" loading="lazy" />
  <figcaption>Low and Ultra from the playtest report. The strip under each frame shows the same patch of the ring at original pixel size.</figcaption>
</figure>

The browser version takes the desktop game's launch options as its query string, so the same camera works there too.

<figure>
  <img src="/images/games/clay-per-view-browser.webp" alt="Rex Granite and Lola Glitz face each other in fighting stances with the referee crouched between them, seen from the same fixed camera outside the ropes, with placards reading RATINGS GOLD, THIS IS A SIGN and MOLD & HOLD in the crowd and a commentator at the desk behind the ring." width="1440" height="810" loading="lazy" />
  <figcaption>The playtest's camera in the browser version, at its default Auto setting with the HUD hidden.</figcaption>
</figure>

## How it was made

The production disclosure in `Release/ENTRY.md`, a draft festival entry, says generative AI assisted the game design, the dialogue, the localization, the programming, the Blender scripts that make the characters and scenery, and the scripts that synthesize the music and effects, and that Kokoro-82M v1.0 synthesized the English dialogue for the game and the trailer. It also says the trailer combines game footage with additional scripted commentary. The typefaces are Titan One, Anton, Barlow Condensed and Bangers, under the SIL Open Font License, and the credits file in the Mac download names the voice model and its presets, the engine and the fonts.

The repository has four commits. The first, on November 17, 2026, holds a README stub and the icon. The other three, all on November 20, add the Unreal project with the release notes and the press kit, then the browser version and its website, then newer versions of the actions in the Pages workflow, and all three are co-authored by Claude. The Unreal assets, source audio and fonts are stored with Git LFS, and the Mac build, the press kit and the full-quality trailer are downloads from the v1.0.0 release.

## Play it

Play [in your browser](https://nearbycoder.github.io/clay-per-view/play/), or start from [the website](https://nearbycoder.github.io/clay-per-view/), which has the trailer, the cast and the controls. For a first bout, the README suggests Ring School. The browser version needs WebGL 2 and downloads about 11 MB the first time, or 15 MB uncompressed. On a keyboard, one player moves with W A S D, jabs with J, hits heavy with K, grabs or throws with L, holds I to block, dodges with Space, holds Left Shift to run, fires the signature with U and taunts with O. In a two-player bout, the keyboard splits into W A S D with F, G, H and R on the left and the arrow keys with comma, period, slash and M on the right, and gamepads work too. The web guide says the browser version has been checked in Chrome and in WebKit on an Apple silicon Mac, including an emulated phone, and that Firefox, Windows, Linux and real phones haven't been tested.

[Download the Mac version](https://github.com/nearbycoder/clay-per-view/releases/latest) for Apple silicon Macs running macOS 14 or later, about 415 MB. It's ad-hoc signed and not notarized, so extract the whole archive, try to open the app once, then allow it under System Settings › Privacy & Security. On macOS 14, right-clicking the app and choosing Open also works. Building the desktop game needs a Mac, Git LFS for the Unreal assets and a source build of Unreal Engine at `~/UnrealEngine`, plus Blender 5 only to rebuild the models and sound. The browser version needs Node 22 or newer, then `npm install` and `npm run dev` in `web/`.

[Browse the source on GitHub](https://github.com/nearbycoder/clay-per-view). The creation date shown here is the GitHub repository's UTC creation date. The cover is the press kit's key art, and the casting, title belt, clapperboard, three-count, Mic Drop and arena pictures are its gameplay stills, captured from the desktop game. All of them come from `Release/Press` and were shrunk with Lanczos resampling. The Low and Ultra comparison is the playtest report's `Release/Picture-presets.jpg`. The folding chair, touch controls, main menu and fixed-camera pictures were captured for this page from the live browser version in headless Chromium on Linux with an AMD Radeon 8060S, using the game's own launch options in the query string. The trailer and its poster are the website's own, and the code excerpts are from `CpvPuppet.cpp` and its port, `CpvPuppet.ts`.
