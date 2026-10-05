---
title: "After Hours"
summary: "A first-person cleaning game with a mystery underneath: scrub an office over seven nights, find what the day shift is hiding, and decide which evidence survives until morning."
role: "Creator"
genre: "First-person mystery"
platforms: ["Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04"
stack:
  ["Unity 6", "C#", "HLSL", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/AfterHours"
download: "https://github.com/nearbycoder/AfterHours/releases/latest"
featured: false
accent: "indigo"
draft: false
image: "/images/games/after-hours-whiteboard.webp"
imageAlt: "An erased whiteboard showing the ghost of an older diagram underneath."
imageCaption: "Erase a whiteboard, and what was written before shows through. From the After Hours README."
demoVideos:
  - src: "/videos/games/after-hours-trailer.mp4"
    title: "After Hours trailer"
    caption: "The 1:54 trailer, with the game's lo-fi night jazz and cleaning sounds and on-screen captions; there is no narration. Every shot was filmed by the game itself from scripted input. Re-encoded here at 540p."
    poster: "/images/games/after-hours-trailer-poster.webp"
    original: "https://github.com/nearbycoder/AfterHours/blob/main/docs/media/AfterHours-trailer.mp4"
---

It's 10 PM at Halvorsen Freight, Suite 1408 of Meridian Tower. The day shift has gone home and left the usual mess: coffee rings, confetti from somebody's birthday, a crumpled note under a desk. You've got a cart, a clipboard, and the whole floor to yourself.

The cleaning is the toy. But grime hides things, and over seven nights the mess you clean away reveals what the day shift is hiding. Then you decide what survives until morning.

## Cleaning that feels good on its own

Look at a dirty surface and the right tool comes up: a cloth for desks and counters, a squeegee for glass, a vacuum for carpet, a mop for hard floors. The reticle turns into a progress ring, and a nearly clean surface finishes itself with a gleam, a sparkle, and a ding whose pitch climbs if you clean several in a row. The vacuum leaves light and dark stripes in the carpet nap. Glass needs foam first, then the squeegee. Mopped floors stay wet for a few seconds.

Rubbish gets sorted into black bins and blue recycling with a charged throw; long shots get a swish and a "Nice shot!" Moved objects have home spots, and a ghost shows where each one belongs. Chairs tuck in, monitors switch off, lights go out when you leave.

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-wipe.webp" alt="Wiping the grime off the reception counter with a cloth." width="1280" height="720" loading="lazy" /><figcaption>Wiping the reception counter.</figcaption></figure>
  <figure><img src="/images/games/after-hours-vacuum.webp" alt="Vacuum stripes in the bullpen carpet." width="1280" height="720" loading="lazy" /><figcaption>Vacuum stripes in the bullpen.</figcaption></figure>
  <figure><img src="/images/games/after-hours-throw.webp" alt="A charged throw into the reception bin: Nice shot!" width="1280" height="720" loading="lazy" /><figcaption>A charged throw.</figcaption></figure>
  <figure><img src="/images/games/after-hours-corner-office.webp" alt="The corner office on Night 4, lit by a desk lamp and the city." width="1280" height="720" loading="lazy" /><figcaption>The corner office.</figcaption></figure>
</div>

## Grime hides things

Clues turn up _because_ you clean. Erasing a whiteboard leaves the ghost of what was written there before. Window foam shows letters someone traced on the glass. The vacuum knocks something loose from under a desk. A pencil rubbing brings back the last page torn from a notepad. From Night 2, a UV torch shows invisible-ink marks left by the cleaner before you.

Everything you find is yours to decide about. Keep a document in your pocket, put it back, throw it away, shred it, or leave it in someone's inbox tray to find in the morning. One office belongs to someone who notices when things move. The next morning's office chat reacts to what you did, the next night has changed, and on the seventh night you decide what survives. There are four endings.

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-window.webp" alt="Spray foam on the break-room window reveals finger-writing." width="1280" height="720" loading="lazy" /><figcaption>Foam reveals finger-writing.</figcaption></figure>
  <figure><img src="/images/games/after-hours-uv.webp" alt="The UV torch showing invisible-ink arrows on the wall." width="1280" height="720" loading="lazy" /><figcaption>The UV torch.</figcaption></figure>
  <figure><img src="/images/games/after-hours-evidence.webp" alt="Reading a crumpled note in the inspect view, with options to keep it, put it back, or throw it away." width="1280" height="720" loading="lazy" /><figcaption>Keep it, put it back, or bin it.</figcaption></figure>
  <figure><img src="/images/games/after-hours-report.webp" alt="The shift report: an S grade stamped on the clipboard and before-and-after polaroids." width="1280" height="720" loading="lazy" /><figcaption>The shift report.</figcaption></figure>
</div>

There's no fail state and no timer pressure. The wristwatch runs toward dawn, but it never ends your shift for you. Each night is designed to take five to eight minutes.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/after-hours-title.webp" alt="The After Hours title screen." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## What it's built with

After Hours is a **Unity 6** URP game with keyboard, mouse, and gamepad support. The cleaning runs on paint masks. Every cleanable surface is an overlay quad with its own 2D space, so painting never depends on the model's UVs. Each one has a render-texture mask with channels for dirt, vacuum nap, wetness, and reveals, plus a quarter-resolution copy of the dirt channel on the CPU, which gives exact completion percentages without reading back from the GPU. Dirt is composed at the start of each night from procedural stamps: coffee rings, footprints, smudges, marker, confetti, and spills.

The same masks drive the secrets: ghost text where marker was erased, letters that stay clear in window foam, and a rubbing layer that shading brings back.

## How it was made

After Hours was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. The brief: clean an office while learning its secrets, and decide which evidence survives, in one office that changes over seven nights. Its trailer moment was cleaning a whiteboard to discover a message beneath the marker, and it insisted that the cleaning feel satisfying on its own before anything else. The commit history spans about ten hours on October 4, 2026.

Blender is the level editor. `office.py` builds the floor in Python, and object names carry meaning, with prefixes like `GRIME_`, `ANCHOR_`, `LIGHT_`, `DOOR_`, `TRAY_`, and `BIN_`. An `OfficeBuilder` script reads the exported FBX and attaches behaviour by name. Every sound effect, ambience bed, and music track is synthesized in NumPy: FM electric piano, brushed hats, and vinyl crackle for the lo-fi night jazz, and layered noise for the cloth, squeegee, vacuum, and shredder.

The story logic is pure C#, and an EditMode test enumerates every combination of choices to prove all four endings are reachable. An AutoPilot plays the shipped build through all seven nights along five story routes, with about 200 checks per route, including that no prop is floating or sunk into furniture. The trailer recorder runs the game on a fixed 30 fps clock and captures the mixed audio, so every shot is scripted and repeatable.

## Play it

Version 0.1.0 includes all seven nights, four endings, menus, and saves. [Download the Linux build](https://github.com/nearbycoder/AfterHours/releases/latest) and run `./AfterHours.x86_64`. No one outside development has played it yet, so pacing and how obvious the clues are remain untested with real players.

[Browse the source on GitHub](https://github.com/nearbycoder/AfterHours). GitHub records the repository's creation on **October 4, 2026**.
