---
title: "Veilbound: Echoes of the Hollow Crown"
summary: "A top-down action adventure for the browser across two linked kingdoms, Aurelia and the Gloam, where Rowan follows the trail of the missing Ione through 24 overworld areas and ten dungeons, each with an instrument to find and a guardian to use it on. Canvas 2D code cuts up and animates painted sprite sheets, every sound is synthesized with the Web Audio API, and a short chapter, The First Crossing, plays on its own."
role: "Creator"
genre: "Top-down action adventure"
platforms: ["Web"]
engine: "Custom Canvas 2D"
year: "2026"
createdAt: "2026-11-18T01:02:53Z"
stack:
  [
    "JavaScript",
    "Canvas2D",
    "Web Audio API",
    "Gamepad API",
    "Node.js",
    "Headless Chrome",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/veilbound/play/index.html?chapter=crossing"
githubLink: "https://github.com/nearbycoder/veilbound"
featured: false
accent: "indigo"
draft: false
image: "/images/games/veilbound.webp"
imageAlt: "Top-down view of an apple orchard: Rowan, in an orange hood with a lantern, stands on a dirt path between an old woman holding an apple basket and an acorn-helmeted spearman, with a large pale moth nearby and a carved stone arch at the top of the path. A wooden bar across the top shows ten hearts, an Orchard Weald signboard, a settings button and two equipped tools."
imageCaption: "Orchard Weald in Aurelia: Rowan between Pella and two enemies, an Acorn Lancer and a Needle Moth, below the arch of Mossbell Sanctuary. One of the repository's two 3840×2160 Ultra 4K captures, shrunk here."
demoVideos:
  - src: "https://nearbycoder.github.io/veilbound/assets/media/the-first-crossing.mp4"
    title: "Gameplay trailer for The First Crossing"
    caption: "The 23-second trailer that plays on the game's website, made from gameplay capture with the game's own audio. After a title card over the moonlit bell scene, Rowan rings Bellwick's bell and raises the lantern, and Hushwick opens in a widening circle. In the Drowned Choir, the Echo Chime raises stepping stones over a flooded channel and the Gale Disc rings two brass receivers. In the heart chamber, Rowan answers the Abyssal Chorister's song with the chime and strikes its exposed core, and a closing title card sits over the ending's dawn illustration. It has sound (a plucked melody, the bells, the chime and the sword), it's 1920×1080 at 30 fps, and it's served from the game's website."
    poster: "/images/games/veilbound-trailer-poster.webp"
    original: "https://github.com/nearbycoder/veilbound/blob/main/assets/media/the-first-crossing.mp4"
  - src: "https://nearbycoder.github.io/veilbound/assets/media/gameplay.mp4"
    title: "Silent gameplay reel"
    caption: "A 16-second reel from the full campaign, which the website showed before the chapter trailer replaced it. Rowan crosses Orchard Weald past an Acorn Lancer and a Needle Moth, walks through Hushwick's square past Nelle, fights the Lodgebark Knight in Mossbell Sanctuary through its windup and recovery, and strikes the Abyssal Chorister's exposed core. It's silent, 1280×720 at 24 fps, and still served from the game's website."
    poster: "/images/games/veilbound-gameplay-poster.webp"
    original: "https://github.com/nearbycoder/veilbound/blob/main/assets/media/gameplay.mp4"
---

Veilbound is a top-down action adventure for the browser. Three nights before it begins, Ione rang Bellwick's west bell and vanished, and her lantern came back without her. Merin, the village bellwarden, hands Rowan Ione's satchel, and the lantern leads across the veil into a second kingdom: sunlit Aurelia has a twilight twin, the Gloam, where the same roads and cottages hold other paths and other people. Between them lie 24 overworld areas and ten dungeons. Each dungeon holds an instrument that opens new ways through the world, and a guardian in its heart chamber that asks you to bring that instrument into the fight.

There are two ways in. The First Crossing, which the button at the top of this page opens, is a short chapter on its own: ring Bellwick's bell, cross into Hushwick and take on the Drowned Choir's guardian. Its title screen also leads to the full journey, the ten-dungeon campaign, which saves in the browser. Both play with a keyboard, a gamepad or touch, draw everything with Canvas 2D from painted sprite sheets, and synthesize all their sound in code.

## Aurelia and the Gloam

Each kingdom is twelve areas of one screen each, laid out four across and three down, and every area in Aurelia has a counterpart in the Gloam. Bellwick Village becomes Hushwick, Orchard Weald becomes Thornwake Wood, Glassmere Marsh becomes Choirfen, Harrow Cemetery becomes The Pale Stacks, and Kingscourt becomes Hollow Court. Raising the lantern at one of the small rune arches swaps the world for its twin. Four dungeons lie in Aurelia, and until their four seals are restored, only Bellwick's arch holds and the old roads of the Gloam stay closed. The other six dungeons wait there, and each one frees a Crown fragment.

<div class="project-media-gallery">
  <figure><img src="/images/games/veilbound-hushwick.webp" alt="Hushwick from above: Rowan, in an orange hood with a lantern, stands on a cobbled square beside a pale hooded figure holding a lamp, among violet cottages with glowing cyan windows, crimson foliage and cyan mushrooms, with a bell hanging in a carved stone arch at top left and a stone footbridge over a dark brook at bottom left." width="1080" height="531" loading="lazy" /><figcaption>Hushwick, in the Gloam, with Nelle, the echo guide, on the square.</figcaption></figure>
  <figure><img src="/images/games/veilbound-bellwick.webp" alt="The same view in Bellwick Village: half-timbered cottages with golden and teal roofs, green grass, apple trees and striped market stalls, the same bell arch and footbridge, and a white-bearded man in a red cap with a staff beside Rowan on the square." width="1080" height="531" loading="lazy" /><figcaption>The same view in Bellwick Village, in Aurelia, with Merin in Nelle's place.</figcaption></figure>
</div>

Off the main road, six villagers (Pella, Oren, Fenn, Isla, Marn and Tess) have each lost a keepsake somewhere in the two kingdoms, from an orchard ledger to a bell ribbon, and bringing it back earns an upgrade such as a heart fragment, a lantern crystal or a sword lesson. Every area has a side cave with one of three challenges: a fight, targets for the Gale Disc, or a weight to push onto a plate. Bell towers restore your supplies and link up the places you've found, and a stall on the village square sells a refill of health and charges for two Glimmers. With Follow the trail switched on, the game names the next objective and marks the route to it.

## The First Crossing

The chapter gives Rowan six hearts and two instruments, the Gale Disc on Q and the Echo Chime on E. Ring Bellwick's bell and another answers from across the veil; raise the lantern at the small arch east of the square, find the Choir vault in Hushwick, and you reach a passage split by a flooded channel. A tablet explains the rest: the chime wakes stepping stones that hold only while its notes ring, and the Gale Disc has to strike the two brass receivers on the far side to open the heart chamber. There, Ione's lantern warns that the Abyssal Chorister hides beneath the floor. When it rises to sing, you answer with the chime, then strike while its lantern is open. If the stones fade under you, you're put back on the bank, and a defeat resumes from the latest checkpoint, which lasts only for the session. The closing screen gives your time and offers to play again or to begin the full journey.

<figure>
  <img src="/images/games/veilbound-chorister.webp" alt="The Drowned Choir's heart chamber: Rowan stands on a ringed emblem in a blue mosaic floor, facing a hooded, bell-shaped creature with pale tendrils and a glowing core, with old bells on carved shrines in the corners and the prompts Strike the exposed core and Core exposed, strike now." width="1200" height="675" loading="lazy" />
  <figcaption>The Abyssal Chorister with its core exposed, at the end of The First Crossing.</figcaption>
</figure>

## Ten dungeons

All ten dungeons share one twelve-room plan, turned or mirrored, with the same order of locks. A tablet at the threshold points to the map in the survey alcove and the small key in the key gallery. A warder guards the treasury that holds the dungeon's instrument, the instrument hall teaches it, and the great lock hides the Crown Key to the last vigil and the heart chamber. Each dungeon also has its own mechanism, from Mossbell Sanctuary's seed wheel to the Drowned Choir's bells, which you ring in the order carved on the floor, and the Hollow Crown Citadel's veil dial.

<div class="project-media-gallery">
  <figure><img src="/images/games/veilbound-great-lock.webp" alt="Rowan stands beside a tall column of blue ice inside a diamond inlay on a pale, frost-veined floor, with two brass target stands, a treasure chest, a carved tablet, pots, frosted crystal shrines in the back corners, stained-glass windows and a barred gate in the north wall." width="1440" height="810" loading="lazy" /><figcaption>The great lock of the Frostbound Reliquary, whose chest holds the Crown Key. The repository's other Ultra 4K capture, shrunk here.</figcaption></figure>
  <figure><img src="/images/games/veilbound-foundry.webp" alt="The Emberglass Foundry's heart chamber: a huge iron golem glowing with embers stands at the top of a riveted, rust-red floor with a clock-face inlay, while Rowan waits beside a red-wheeled valve, with brick kilns burning in all four corners." width="1200" height="675" loading="lazy" /><figcaption>The Cinder Colossus, in the Emberglass Foundry.</figcaption></figure>
</div>

The last vigil holds a bell and a tablet with a hint for the guardian. You bait the Cinder Colossus's charge into a glowing coolant valve, turn two mirrors and focus the Prism Lens against the Helio Warden, freeze the Pendulum Tyrant mid-swing, and reflect a bright bolt with Dawnsteel against the Regent of Ash. Every guardian beaten adds a heart.

By the end the satchel holds eleven instruments, and two can be equipped at once. The Gale Disc is a returning blade that cuts vines and rings nodes, River Boots let Rowan swim and burst against currents, the Lodestone Gauntlet pulls weights or draws Rowan to iron anchors, the Prism Lens lights veiled paths, the Wraith Mantle takes Rowan through marked spectral walls, the Echo Chime raises stepping stones and silences singers, Stillglass halts marked gears and foes for four seconds, the Cinder Rod melts blue ice, the Rootbind Staff grows a root bridge for eight seconds, and Ione's Burst Satchel blows open cracked masonry. Dawnsteel, the restored sword, cuts Crown glass. As the website puts it, the tool you bring home from a dungeon can open an old path. There are 28 kinds of regular enemy, and each of them, like every warder and guardian, winds up before it attacks and recovers afterward. Rowan can strike, guard behind a round shield, dodge, and lift and throw pots.

## Keyboard, gamepad or touch

On a keyboard you move with WASD or the arrow keys, strike with J or Z, hold K or X to guard, dodge with Space, interact with F or Enter, use the two equipped instruments with Q and E, and open equipment, the map and the pause menu with Tab, M and Escape. Every key can be rebound. A gamepad, read through the browser's Gamepad API, moves with the left stick or d-pad, strikes with the bottom face button, dodges with the right one, interacts with the left one, guards with the left bumper, uses instruments with the top face button and the right bumper, opens equipment and the map with the triggers, and pauses with Start; it can drive the settings dialog too. On a touchscreen, a d-pad sits on the left and buttons for strike, guard, dodge, use, both instruments, the bag, the map and pause on the right. On a phone held upright, menu choices become full-size buttons under the game view. The settings cover graphics quality, fullscreen, brightness, drifting particles and weather, master, music and effects levels, reduced motion, instant dialogue and the trail guidance. Dialogue is also announced to screen readers, and the game pauses when its window loses focus.

<figure>
  <img src="/images/games/veilbound-settings.webp" alt="The Settings dialog: a scene preview of Rowan on the path to a carved stone arch on the left, and on the right Graphics, Audio and Gameplay tabs, rendering quality choices of Classic, Balanced, High and Ultra 4K with High selected and described as 1920 × 1080, fine terrain and full-detail models, an Enter fullscreen button, a brightness slider at 100% and an atmospheric effects switch." width="1120" height="700" loading="lazy" />
  <figcaption>The settings, with a scene preview that redraws as you change them.</figcaption>
</figure>

## The field kit

The menus are drawn as Rowan's own kit: an open vellum field book for the map, the quest journal and the key bindings, an oxblood leather tool roll for equipment, a carved walnut signboard for the location, brass fittings, heart gems for health and a lantern beside the magic gauge. The pause menu shows the current objective and how many seals and Crown fragments you hold, and saves can be exported as JSON and imported in another browser.

<figure>
  <img src="/images/games/veilbound-menus.webp" alt="Twelve game screens in a grid: the title screen, the pause menu on a field book, the Equipment tool roll, the cartographer's map of Aurelia, the quest journal, the keyboard bindings, the bell tower list, a new journey confirmation, the defeat screen, the ending, a dialogue with Merin, and the map of the Gloam." width="1440" height="663" loading="lazy" />
  <figcaption>Every canvas menu, from the gallery that the repository's test script renders for review.</figcaption>
</figure>

## How it's built

The game lives in the `play/` folder, with no libraries and no build step. `play/index.html` is 15,049 lines and about 479 KB, nearly all of it one inline script. Five more scripts, 3,072 lines between them, hold the painted presentation, the field-kit interface, the field art, the trail guidance and veil crossing, and The First Crossing. A stylesheet covers the HTML settings dialog and the touch controls, and 42 WebP sheets in `play/art`, about 16.5 MB, hold the painted art. The game makes no outside requests, and its serif font, Cormorant Garamond, ships in the repository.

Everything is laid out on a 384×216 grid and drawn into a canvas 1, 3, 5 or 10 times that size, depending on the setting. Classic is 384×216, with every shape snapped to whole pixels and shown unsmoothed. Balanced is 1152×648, High, the default, is 1920×1080, and Ultra 4K is 3840×2160. The simulation steps at a fixed 60 Hz whichever you pick.

The painted sheets are laid out in fixed cells, and the code does the composing. Rowan's sheet has eleven poses in each of three directions (idle, two steps, dodge, guard, three sword poses and three Dawnsteel poses), and the game mirrors the side row to face left. Each regular enemy is a single painted cutout; for its stalk, windup, rush and recovery the renderer leans, stretches and shifts it, bobs fliers higher and staggers it when hit. Each of the 24 areas has its own ground material and light color, roads are painted along each room's real exits, water textures follow its water and riverbeds, and dungeon walls open and gate according to each room's lock state. Under all of it sits a second set of models: a small 3D system that builds Rowan, the villagers, enemies, guardians and instruments from triangles and rasterizes each pose once into a bounded cache. The game falls back on these when a sheet hasn't loaded, and the first published version, which had no painted art at all, drew every character this way.

<figure>
  <picture><source srcset="/images/games/veilbound-veil-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/games/veilbound-veil-code.webp" alt="JavaScript source of crossRealm and paintRealmTransition, lines 208 to 247 of play/journey.js: crossing takes a snapshot of the current frame unless reduced motion is on, flips the realm, builds the new room and plays the veil chord; each frame afterwards draws the old snapshot everywhere except inside an ellipse around Rowan that grows over 36 ticks, then strokes the ellipse's edge." width="1440" height="1545" loading="lazy" /></picture>
  <figcaption>The veil crossing in <code>play/journey.js</code>: the new world shows through a growing hole cut in a snapshot of the old one.</figcaption>
</figure>

There are no audio files. The music is scored in code and played live with oscillators and filtered noise: an eight-bar melody in Aurelia, a slower version with flattened notes in the Gloam, a key that shifts from dungeon to dungeon, and a faster pulse an octave lower for guardian fights, over bass notes, fifths and noise percussion. Each instrument has its own sound, built from short tones and band-passed noise, and everything runs through a compressor with separate music, effects and master levels. Crossing the veil plays a chord, a rising major arpeggio into Aurelia and a falling minor one into the Gloam.

`verification/check.mjs`, 2,039 lines, starts Chrome headless and drives it over the DevTools protocol from Node.js 22 or later. The README says it plays through the campaign and The First Crossing, checks input, artwork, settings and audio, and regenerates the captures and `results.json`. Those recorded results describe a fresh save played to the ending, with a midway exit, a puzzle reset, a death, a checkpoint retry and a reload in every dungeon, all 120 rooms visited and all eleven instruments found, plus 90 named checks: 80 repeated saves and reloads, multitouch holds, an emulated gamepad, rebound keys, all 28 enemy silhouettes, the mixer's output with sound on and its silence when muted, and the whole chapter from its first bell to its guardian. They list no runtime errors.

## The website

The repository root is the game's website, published by GitHub Pages. It opens on the moonlit bell scene, rendered by the game, with two choices, Play The First Crossing and Watch trailer; Enter starts the chapter. Merin speaks from a dialogue box below. Further down come the chapter with a view of its bell passage, a slider that blends Bellwick into Hushwick beside a button that rings a synthesized west bell, four screenshots from the dungeons and the orchard, and Rowan's field journal: an atlas of all 24 regions with a switch to cross between the kingdoms, the eleven instruments in the satchel, and the controls. The trailer plays in a dialog with English captions, and the footer links the full game, the offline download and the repository.

## How it was made

The repository's `SUBMISSION.md` is an entry packet prepared for BIG Festival 2027, and its generative AI disclosure says OpenAI image generation made the painted backdrops, sprites, textures and interface art, and that generative AI also helped with the programming, the design iteration and the writing. The art notes in `play/art/README.md` say the sheets came from the built-in ImageGen tool, with a Bellwick and Hushwick concept diptych supplied for the project as the reference, and they give each sheet's cell layout along with the prompts. The game's code assembles and animates the results, the music and effects are synthesized in the browser, and the trailer is gameplay capture with the game's own audio. The README adds that the original promotional bell-tower art, still in the repository, was made with ImageGen too, and gives its prompt, while the current homepage art, screenshots and journal illustrations come from the game renderer.

The repository's ten commits are all dated November 17, 2026. After a first commit with a stub README and the icon, the second published the game and its website, with a game that loaded no images and drew everything in code. The painted sheets arrived over the following commits: Rowan and the village first, then the guardians, instruments, surfaces and ending art, then the field-kit interface, and last the enemies, warders, entrances and props, along with the Ultra 4K setting. The final commit added The First Crossing, its trailer and the offline ZIP.

## Play it

Play [The First Crossing](https://nearbycoder.github.io/veilbound/play/index.html?chapter=crossing) or [the full game](https://nearbycoder.github.io/veilbound/play/index.html?launch=1), which begins a new journey or resumes your save, or start from [the website](https://nearbycoder.github.io/veilbound/). Sound starts with your first input, and the fullscreen button sits on the title screen. To play offline, download [the game archive](https://nearbycoder.github.io/veilbound/downloads/veilbound.zip), extract all of it, and open `play/index.html` in a browser. The campaign saves in the browser you play in, so export your save from the pause menu before you switch.

Veilbound's repository was created on GitHub within a minute of three others on November 18, 2026 (UTC), and each of the four is a browser game with its own GitHub Pages site: [Starlight Carnival](/games/starlight-carnival), [Dusk Rush ’64](/games/dusk-rush-64) and [Wildlight](/games/wildlight).

[Browse the source on GitHub](https://github.com/nearbycoder/veilbound). The creation date shown here is the GitHub repository's UTC creation date. All the screenshots come from the repository: the Orchard Weald cover and the Frostbound Reliquary room are its two Ultra 4K captures, shrunk with Lanczos resampling, the settings and menu captures are ones its test script writes to `verification/`, and the rest are from the website's `assets/media` folder. The trailer's poster is the website's own, the gameplay reel's poster is a frame from the reel, and the code excerpt is from `play/journey.js`.
