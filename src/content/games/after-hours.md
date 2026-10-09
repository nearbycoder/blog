---
title: "After Hours"
summary: "A first-person cleaning game with a mystery underneath: scrub an office over seven nights, find what the day shift is hiding, and decide which evidence survives until morning."
role: "Creator"
genre: "First-person mystery"
platforms: ["Windows", "macOS", "Linux", "Web"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:26:34Z"
stack:
  ["Unity 6", "C#", "HLSL", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
link: "https://nearbycoder.github.io/AfterHours/"
githubLink: "https://github.com/nearbycoder/AfterHours"
download: "https://github.com/nearbycoder/AfterHours/releases/latest"
featured: false
accent: "indigo"
draft: false
image: "/images/games/after-hours-whiteboard.webp"
imageAlt: "An erased whiteboard showing the ghost of an older diagram underneath."
imageCaption: "Erase a whiteboard, and what was written before shows through. Captured at Ultra, from the After Hours README."
demoVideos:
  - src: "/videos/games/after-hours-trailer.mp4"
    title: "After Hours trailer"
    caption: "The 2:00 trailer, re-recorded at Graphics fidelity Ultra after twelve rounds of improvements: Settings walked with the arrow keys, the pause menu's keycaps, the leftovers' glint, the break room at Low and at Ultra, the case file, and Night 7's storm. It uses the game's lo-fi night jazz and cleaning sounds with on-screen captions; there is no narration. Every shot was filmed by the game itself from scripted input on a fixed clock. Re-encoded here at 540p."
    poster: "/images/games/after-hours-trailer-poster.webp"
    original: "https://github.com/nearbycoder/AfterHours/blob/main/docs/media/AfterHours-trailer.mp4"
---

It's 10 PM at Halvorsen Freight, Suite 1408 of Meridian Tower. The day shift has gone home and left the usual mess: coffee rings, confetti from somebody's birthday, a crumpled note under a desk. You've got a cart, a clipboard, and the whole floor to yourself.

The cleaning is the toy. But grime hides things, and over seven nights the mess you clean away reveals what the day shift is hiding. Then you decide what survives until morning.

## Cleaning that feels good on its own

Look at a dirty surface and the right tool comes up: a cloth for desks and counters, a squeegee for glass, a vacuum for carpet, a mop for hard floors. The reticle turns into a progress ring, and a nearly clean surface finishes itself with a gleam, a sparkle, and a ding whose pitch climbs if you clean several in a row. The vacuum leaves light and dark stripes in the carpet nap. Glass needs foam first, then the squeegee. Mopped floors stay wet for a few seconds.

Rubbish gets sorted into black bins and blue recycling with a charged throw; long shots get a swish and a "Nice shot!" Moved objects have home spots, and a ghost shows where each one belongs. Chairs tuck in, monitors switch off, lights go out when you leave.

You're never stuck on the last can. The shift sheet says which rooms still have work, and a line under the wristwatch names the room you're in. After a minute with no progress, whatever's left glints and the nearest few chime, and a caption says which way they are ("behind you in reception").

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-wipe.webp" alt="Wiping the grime off the reception counter with a cloth." width="1280" height="720" loading="lazy" /><figcaption>Wiping the reception counter.</figcaption></figure>
  <figure><img src="/images/games/after-hours-vacuum.webp" alt="Vacuum stripes in the bullpen carpet." width="1280" height="720" loading="lazy" /><figcaption>Vacuum stripes in the bullpen.</figcaption></figure>
  <figure><img src="/images/games/after-hours-throw.webp" alt="A charged throw into the reception bin: Nice shot!" width="1280" height="720" loading="lazy" /><figcaption>A charged throw.</figcaption></figure>
  <figure><img src="/images/games/after-hours-corner-office.webp" alt="The corner office at night, lit by a desk lamp and the city." width="1280" height="720" loading="lazy" /><figcaption>The corner office.</figcaption></figure>
</div>

## Grime hides things

Clues turn up _because_ you clean. Erasing a whiteboard leaves the ghost of what was written there before. Window foam shows letters someone traced on the glass. The vacuum knocks something loose from under a desk. A pencil rubbing brings back the last page torn from a notepad. From Night 2, a UV torch shows invisible-ink marks left by the cleaner before you.

Everything you find is yours to decide about. Keep a document in your pocket, put it back, throw it away, shred it, or leave it in someone's inbox tray to find in the morning. The clipboard's **case file** lists everything you've read, night by night, with what became of it, so you can read any of it again before you decide. One office belongs to someone who notices when things move. The next morning's office chat reacts to what you did, the next night has changed, and on the seventh night you decide what survives. There are four endings, and **Night Select** replays any night you've reached so you can try another road.

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-window.webp" alt="Spray foam on the break-room window reveals finger-writing." width="1280" height="720" loading="lazy" /><figcaption>Foam reveals finger-writing.</figcaption></figure>
  <figure><img src="/images/games/after-hours-uv.webp" alt="The UV torch showing invisible-ink arrows on the wall." width="1280" height="720" loading="lazy" /><figcaption>The UV torch.</figcaption></figure>
  <figure><img src="/images/games/after-hours-evidence.webp" alt="Reading a crumpled note in the inspect view, with options to keep it, put it back, or throw it away." width="1280" height="720" loading="lazy" /><figcaption>Keep it, put it back, or bin it.</figcaption></figure>
  <figure><img src="/images/games/after-hours-report.webp" alt="The shift report: an S grade stamped on the clipboard and before-and-after polaroids." width="1280" height="720" loading="lazy" /><figcaption>The shift report.</figcaption></figure>
</div>

There's no fail state and no timer pressure. The wristwatch runs toward dawn, but it never ends your shift for you. Each night is designed to take five to eight minutes, and clocking out brings a graded shift report with before-and-after polaroids of every room.

## Settings and graphics fidelity

Keys, mouse buttons and pad buttons can all be rebound, with hold or toggle for crouch, walking briskly, and cleaning. The pause menu's controls card draws each binding as a keycap. Accessibility settings include captions for story sounds and the leftovers' chimes, **Reduce flashing and flicker** (Night 7's storm then dims the lights to half instead of dropping them out), **Mono audio**, **Text size** up to Largest, which grows documents and menus too, and **Handwriting: Plain**, which sets every handwritten note in a plain font. Camera motion can be turned off, and brightness is offered on first launch. Menus fade in and out, the selection is lit whether the pad, the arrow keys or the mouse moves it, and buttons dip when pressed.

**Graphics fidelity** has four steps. High is the default and the game as it was built. Ultra adds a reflection probe in every room, so metal, glass and glossy surfaces reflect the lit room, plus soft shadows from the desk lamps, sharper shadows, the most ambient-occlusion samples, and 16× texture filtering. On the shared integrated GPU it was measured on, the mean of four views took 4.0 ms on Low, 6.2 on Medium, 8.1 on High and 9.6 on Ultra. If a night runs slowly, the game offers the next lower step once.

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-settings.webp" alt="Settings, with Graphics fidelity and the accessibility options." width="1280" height="720" loading="lazy" /><figcaption>Settings.</figcaption></figure>
  <figure><img src="/images/games/after-hours-pause-controls.webp" alt="The pause menu and its controls card, with keycaps for the keys as bound." width="1280" height="720" loading="lazy" /><figcaption>The pause menu's controls card.</figcaption></figure>
  <figure><img src="/images/games/after-hours-title.webp" alt="The After Hours title screen." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## What it's built with

After Hours is a **Unity 6** URP game with keyboard, mouse, and gamepad support. The cleaning runs on paint masks. Every cleanable surface is an overlay quad with its own 2D space, so painting never depends on the model's UVs. Each one has a render-texture mask with channels for dirt, vacuum nap, wetness, and reveals, plus a quarter-resolution copy of the dirt channel on the CPU, which gives exact completion percentages without reading back from the GPU. Dirt is composed at the start of each night from procedural stamps: coffee rings, footprints, smudges, marker, confetti, and spills.

The same masks drive the secrets: ghost text where marker was erased, letters that stay clear in window foam, and a rubbing layer that shading brings back.

## How it was made

After Hours was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. The brief: clean an office while learning its secrets, and decide which evidence survives, in one office that changes over seven nights. Its trailer moment was cleaning a whiteboard to discover a message beneath the marker, and it insisted that the cleaning feel satisfying on its own before anything else.

Blender is the level editor. `office.py` builds the floor in Python, and object names carry meaning, with prefixes like `GRIME_`, `ANCHOR_`, `LIGHT_`, `DOOR_`, `TRAY_`, and `BIN_`. An `OfficeBuilder` script reads the exported FBX and attaches behaviour by name. Every sound effect, ambience bed, and music track is synthesized in NumPy: FM electric piano, brushed hats, and vinyl crackle for the lo-fi night jazz, and layered noise for the cloth, squeegee, vacuum, and shredder.

After launch, the game went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds added the case file, Night Select, rebinding, text size, plain handwriting, captions, mono audio, the room line and the leftovers' glint, the softer storm, and the fidelity slider. The story logic is pure C#, and an EditMode test enumerates every combination of choices to prove all four endings are reachable. An AutoPilot plays the shipped build through all seven nights along five story routes, with about 600 checks per route, inside a private, invisible KWin desktop.

The trailer recorder runs the game on a fixed 30 fps clock at Ultra and captures the mixed audio, so every shot is scripted and repeatable.

## On phones and tablets

Before this pass, the browser version only reached its title on a phone after a "Load it anyway" tap, and nothing in a night could be done by touch. Now a stick appears under your left thumb, a drag on the right looks around, and buttons cover **Clean** (it becomes **Throw** while you hold something), **Use**, **Spray**, **Drop**, **UV**, **Tool**, the **Crouch** and **Brisk** switches, pause, the shift **Sheet** and fullscreen. The clipboard and the document reader get extra soft keys. All of them are at least 44 pixels and clear of the notch, they show only while touch is the input in use, and a phone held upright pauses the night and asks to be turned.

Phones and tablets start on Low and draw about a million pixels, with the grime made at half resolution. On every platform, the grime is now built in reused buffers and the dirt from earlier nights is freed. On the iPhone profile, estimated graphics memory fell from 315 MB to 90 MB and the WebAssembly heap from 531 MB to 443 MB. Even so, the test browser's page still used about 1.5 GB, which may be more than a real iPhone allows, so After Hours is the game most likely to still struggle on a phone. When it does run out of memory, it now shows a readable message instead of a frozen tab.

<figure>
  <img src="/images/games/after-hours-phone.webp" alt="The janitor's closet on a phone, with a stick, Crouch and Brisk on the left and Tool, Spray, Use and Clean on the right." width="1280" height="598" loading="lazy" />
  <figcaption>Starting a night on a phone, in a headless iPhone 15 profile.</figcaption>
</figure>

It has only been played in headless test browsers with iPhone, iPad and Android phone profiles so far. A real phone still has to confirm iOS's memory limit, sound, frame rate, and how the controls feel under a thumb.

## Play it

Play it in your browser at [nearbycoder.github.io/AfterHours](https://nearbycoder.github.io/AfterHours/), on a desktop or on a phone or tablet held sideways. It's the current game as a WebGL build of about 44 MB, starting on Medium graphics on a desktop and Low on a phone, with saves kept in the browser. On a desktop, Esc frees the mouse and pauses the night; click to look around again.

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/AfterHours/releases/latest). It's the October 4 launch build, with all seven nights, four endings, menus and saves, but none of the improvements above; for the current game on the desktop, build it from source with Unity. No one outside development has played it yet, so pacing and how obvious the clues are remain untested with real players, and the README ships a playtest kit for the first sessions.

[Browse the source on GitHub](https://github.com/nearbycoder/AfterHours). GitHub records the repository's creation on **October 4, 2026**.
