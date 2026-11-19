---
title: "Pointer"
summary: "A native macOS presentation pointer written in Rust with Rune: a giant cartoon glove on a telescoping pole that follows your cursor across every display. Clicks ripple, five quick taps crack the glass, and hotkeys bring out a spotlight, a laser, a pen and a focus box."
role: "Creator"
createdAt: "2026-11-19"
year: "2026"
stack:
  [
    "Rust",
    "Rune",
    "wgpu",
    "WGSL",
    "Metal",
    "Core Audio",
    "Core Graphics",
    "AppKit",
    "notarytool",
    "FFmpeg",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/pointer/"
githubLink: "https://github.com/nearbycoder/pointer"
image: "/images/projects/pointer.webp"
imageAlt: "The Pointer social card on a violet gradient: the name Pointer in large white letters, the line “A giant pointer for your screen.” and “Free for macOS · Apple silicon and Intel” beneath it, and on the right a white cartoon glove on a chrome pole, its raised finger at the center of two faint rings."
imageCaption: "The social card from the Pointer website, which the app draws itself in a headless scene."
demoVideos:
  - src: "https://nearbycoder.github.io/pointer/media/launch.mp4"
    title: "The launch film"
    caption: "The 1:03 launch film from the website, with sound. Its shots were performed and rendered headlessly by Pointer, then cut together with FFmpeg. The sound effects are the app's own, under a voiceover generated with ElevenLabs."
    poster: "/images/projects/pointer-film-poster.webp"
    original: "https://github.com/nearbycoder/pointer/blob/main/docs/media/launch.mp4"
featured: false
accent: "violet"
draft: false
---

Pointer puts a giant cartoon glove on a telescoping pole over everything on your Mac. The fingertip sits exactly on your cursor, and the system cursor hides while the glove is out. Click and the glass ripples with a pop. Tap five times quickly, or hold a press still, and a dial winds up around the fingertip until the glass cracks with a crash and tinkling shards. Hotkeys switch to a spotlight, a laser trail, a pen or a focus box, each with its own sound. It's made for presenting: the overlays show up in screen shares and recordings, so the people watching see the glove too.

It's a native macOS app written in Rust on [Rune](https://github.com/anomalyco/rune), a pre-release, GPU-rendered Rust UI framework, with its own WGSL shaders for the pointer and its effects. It's free and open source under the MIT license, runs on macOS 13 or later on Apple silicon and Intel, and the download is signed with a Developer ID and notarized by Apple. Pointer lives in the menu bar rather than the Dock, and it asks for no permissions: there's no Accessibility or Screen Recording prompt. Version 1.0.0 was released on the day the repository was created.

## Five tools

<div class="project-media-gallery">
  <figure><img src="/images/projects/pointer-tap.webp" alt="The sample slide on a light page: the field “Ask anything about the launch…”, chips for Revenue, Retention, Roadmap and Hiring, and blue, orange, green and purple tiles. The white glove's fingertip rests on the Retention chip inside a ring of short ticks, and its chrome pole runs down to the lower right." width="1280" height="720" loading="lazy" /><figcaption>A tap sends out ticks and a ripple.</figcaption></figure>
  <figure><img src="/images/projects/pointer-crack.webp" alt="A spider-web crack centered just below the blue and orange tiles, its jagged spokes running across both tiles and up past the Retention chip, with the glove beside the point of impact." width="1280" height="720" loading="lazy" /><figcaption>The glass after five quick taps.</figcaption></figure>
  <figure><img src="/images/projects/pointer-spotlight.webp" alt="The slide dimmed to gray except for a bright circle around the glove's fingertip, which lights the bottom of the green and purple tiles. The earlier crack is still on the dimmed glass to the left." width="1280" height="720" loading="lazy" /><figcaption>Spotlight, with the crack still on the glass.</figcaption></figure>
  <figure><img src="/images/projects/pointer-laser.webp" alt="The slide's title, “Quarterly product update”, and its subtitle above the question field, with a thin pink-red trail running across the field to the glove's fingertip at its right end." width="1280" height="720" loading="lazy" /><figcaption>The laser's trail fades behind the fingertip.</figcaption></figure>
  <figure><img src="/images/projects/pointer-pen.webp" alt="A pink ink loop drawn around the lower half of the green tile and into the purple one, with the glove at its lower right and a toast at the bottom reading Pen, Drag to draw · Esc to finish, with the keys ⌃⌥4." width="1280" height="720" loading="lazy" /><figcaption>Ink from the pen, with the toast that names the tool.</figcaption></figure>
  <figure><img src="/images/projects/pointer-focus.webp" alt="The slide dimmed to gray except for a bright rounded box framing the tops of the orange and green tiles, with the glove below it to the right." width="1280" height="720" loading="lazy" /><figcaption>A focus box dims everything outside it.</figcaption></figure>
</div>

⌃⌥1 to ⌃⌥5 switch tools while you talk:

- **Pointer** (⌃⌥1): every click sends out a ripple, and quick taps or a press held still crack the glass. ⌃⌥X smashes it on cue.
- **Spotlight** (⌃⌥2): everything dims except a circle around the fingertip.
- **Laser** (⌃⌥3): the fingertip leaves a glowing trail that fades within about half a second.
- **Pen** (⌃⌥4): drag to draw on the screen.
- **Focus** (⌃⌥5): drag a box around the part that matters, and everything outside it dims.

Pointer, Spotlight and Laser pass every click through to the app underneath, so you can keep working while you point. Pen and Focus take the mouse while they're out, so drawing doesn't click whatever is beneath it, and Esc or another tool hands it back. ⌃⌥Z clears ink, cracks and the focus box, and ⌃⌥/ shows every hotkey on screen.

## Cracking the glass

A click that comes within 0.55 seconds of the last one adds to a charge, so the fifth quick tap breaks the glass. Holding the button still for about a third of a second starts the dial filling instead, and the glass cracks a little under a second later. Stop, and the charge drains away.

Each crack is generated, not drawn from an image. Between 13 and 15 jagged spokes wander outward from the impact and sometimes branch, rings of chords join neighboring spokes, and a core of short splinters fills the middle. Every segment records its distance from the impact, so the crack runs outward over about a quarter of a second. A crack holds for 3.4 seconds and then fades over about a second, and the glove jolts back along its pole when the glass gives.

<figure>
  <picture><source srcset="/images/projects/pointer-crack-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/pointer-crack-code.webp" alt="Lines 636 to 678 of pointer/src/fx.rs: crack_pattern, documented as a spider-web fracture of jagged spokes with branches, a few rings of chords between them and a shattered core. It sets the number of spokes and their reach from the power, walks each spoke out from the impact at evenly spread, jittered angles, then for up to three rings at 0.2, 0.43 and 0.7 of the reach joins each spoke to the next through a jittered midpoint, skipping about one in five, and finally scatters 8 plus 12 times the power short splinters near the center, returning the segments and the reach." width="1440" height="1380" loading="lazy" /></picture>
  <figcaption>The crack pattern in <code>src/fx.rs</code>. The <code>d0</code> and <code>d1</code> on each segment are its distance from the impact, which the drawing code uses to grow the crack outward.</figcaption>
</figure>

## Five pointers

<figure>
  <img src="/images/projects/pointer-styles.webp" alt="Five panels over the sample slide: the white glove on its chrome pole; a green laser sword glowing and throwing sparks; a black magic wand with a white tip shedding sparkles; a wooden mallet with iron bands and little stars; and a yellow rubber chicken on the pole with feathers flying above it." width="1440" height="387" loading="lazy" />
  <figcaption>The five pointers, from the README.</figcaption>
</figure>

⌃⌥S swaps the pointer: the one that's out slides away and the next comes in. Each has its own click and sounds, and the tools and the cracking glass work with all of them.

| Pointer        | Click                                                 | Sounds                                                                       |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Glove          | A burst of ticks and ripples                          | A soft pop                                                                   |
| Laser sword    | A flash, a spray of sparks and a scorch mark          | A snap-hiss as it lights, a hum that swells as it swings, a crackling clash |
| Magic wand     | A puff and a burst of stars                           | Tinkles as it moves, a rising arpeggio when it casts                         |
| Mallet         | Impact lines, a dust puff and stars circling the spot | A bonk, then a cartoon boing                                                 |
| Rubber chicken | Feathers fly up and drift down                        | A squawk                                                                     |

The sword lights the page around its blade and leaves an afterimage when it swings, and each time you pick it, the blade takes the next of five colors: blue, green, red, purple and gold. The wand sheds sparkles as it moves, more the faster it goes.

## A glove on a stick

The fingertip stays on the cursor, and the rest of the rig follows it on springs. The pole's base trails behind on a slow spring, like a hand holding the stick from below the screen. The middle of the pole is a damped mass, so the pole bends and wobbles when you move fast. The glove turns with the pole, rolls a little as you move sideways, and dips toward the screen when you press. The springs are sub-stepped at 600 Hz, so the motion looks the same at any frame rate. The glove is about a ninth of the display's height, and ⌃⌥] and ⌃⌥[ make it bigger or smaller.

The glove, the chicken and the mallet's head are raymarched in 3D in the fragment shader, with soft wrap lighting, ambient occlusion and a dark rim that keeps them readable on white pages and dark ones. The pole is drawn as five chrome sections with a collar at each joint, a chrome ferrule and a rubber grip, and the pointer casts soft shadows onto the screen. With several displays, the pointer lives on whichever one has the cursor: it retracts from the display you leave and extends on the one you enter, and effects stay where they happened.

## Sound

Every sound is synthesized as it plays, from oscillators, noise, filters and envelopes, so there are no audio files. A tap sounds a few milliseconds after the click, because the mix goes straight to a Core Audio output unit with about 10 ms of latency instead of through a media player. The pole sliding out makes a rising rush with a click for each section. The charge dial ticks as it fills, over a whine that climbs and crackles. The glass breaks with a thump, a snap, crackle running outward, tinkling shards and a whoosh. Spotlight clunks on like a stage light, the laser hums and sizzles louder the faster you move, and the pen sounds like felt tip on glass.

Sounds pan toward the side of the screen they happen on, and only the display with the cursor makes them. ⌃⌥M turns them off. When nothing is sounding, the output stops after a few seconds, so an idle pointer costs no CPU.

## Settings, updates and the menu bar

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/pointer-settings-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/pointer-settings.webp" alt="Pointer's settings window on its Pointer page: a sidebar with General, Pointer, Shortcuts, Updates and About under the app's name and version 1.0.0, and “Made with Rune” at the bottom. The page shows five pointer tiles, Glove (selected), Laser sword, Magic wand, Mallet and Chicken; a Size slider at 100%; five color swatches for the laser sword's blade; and a Tool switcher for Pointer, Spotlight, Laser, Pen and Focus." width="1440" height="1005" loading="lazy" /></picture><figcaption>The Pointer page.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/pointer-shortcuts-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/pointer-shortcuts.webp" alt="The Shortcuts page, which says to click a shortcut and press the keys you want, with Backspace to clear and Esc to cancel, above a list of hotkeys and their keys: Show or hide the pointer, Next pointer, the five tools, Smash the glass here and Clear ink, cracks and focus, running on past the bottom of the window." width="1440" height="1005" loading="lazy" /></picture><figcaption>The Shortcuts page, with a recorder for each of the 17 hotkeys.</figcaption></figure>
</div>

The menu bar item, a pointing hand, shows or hides the pointer, switches pointers and tools, and opens Settings, the update check and Quit. Settings has five pages: General, Pointer, Shortcuts, Updates and About. Every hotkey has a recorder on the Shortcuts page: click one and press the keys you want, Backspace clears it, Esc cancels, and Restore defaults puts them all back. Hotkeys are registered while the app runs, so a change applies at once. If another app already owns a combination, the Shortcuts page marks it so you can pick another, and a new combination that can't be registered leaves the old one in place. Choices are saved in `~/Library/Application Support/Pointer/prefs.json`.

The installed app checks the repository's latest GitHub release 8 seconds after launch and every six hours after that, unless you turn checks off. When a newer version is out, **Install and relaunch** downloads its `Pointer.zip` with the system's `curl`, unpacks it with `ditto`, verifies it with `codesign`, checks that it's signed by the same Apple team as the running app and that its version matches the release, then swaps it in and relaunches. A copy running from the disk image can't replace itself, so Pointer asks you to move it into Applications first. `Pointer --update` does the same from a terminal.

## How it's built

Each display gets its own Rune overlay: transparent, full-screen and click-through, at window level 102, one above pop-up menus, so a context menu can't cover the glove while it's the only pointer you can see. The overlays aren't excluded from screen capture, which is how shares and recordings pick them up. Rune paces each overlay with its display's own display link, one frame per refresh, so a 120 Hz ProMotion panel runs at 120 fps. When nothing moves, an overlay stops drawing, and a sampler thread that reads the mouse every 4 milliseconds wakes it when the mouse moves or clicks on its display.

Rune draws the small HUD: the toast when a tool changes, the hotkey card and the frame-rate readout. Pointer's compositor draws the rest with its own wgpu pipelines at two effect slots in Rune's view, the glass under the HUD and the pointer over it, so a toast never covers the glove. Each frame is built on the CPU as instanced quads, which the fragment shader fills with signed-distance shapes, and triangle ribbons for the pole, trails and ink, so a translucent stroke never blends twice where its pieces meet. The shaders are 662 lines of WGSL, and the app is 6,757 lines of Rust in 22 files.

The cursor's position and button come from Core Graphics' system-wide state, and the hotkeys are Carbon hotkeys registered through Rune, which is why there's no permission prompt. Hiding the cursor while another app is in front uses WindowServer's private `SetsCursorInBackground` switch, the same one Rune's `macos-background-cursor` feature uses, and macOS shows the cursor again if the process dies. Rune has no macOS menu bar item yet, so that part is a little AppKit through the `objc2` crates, and Open at login uses `SMAppService`. Rust 1.99.1 and Rune's Git revision are pinned, and `cargo test` runs 21 tests covering the physics, the effects, the sound and more.

The README reports measurements on an M4 Max. A live overlay on a 4K display held a steady 60 presents a second on its 60 Hz panel, with no failed or skipped frames and 0.10 to 0.19 ms of CPU per frame. A headless render of the full demo at 3840×2160 and 120 fps ran at 126 frames a second, including reading back and H.264-encoding every frame.

`scripts/bundle.sh` builds the release: a universal binary for Apple silicon and Intel, signed with a Developer ID and the hardened runtime, notarized and stapled with `notarytool`, then packed as `Pointer.zip` for the updater and `Pointer.dmg` for the website. The website is a static page in `docs/`, served by GitHub Pages.

## Made by the app

Rune apps can run headless on the same renderer, and Pointer makes its own media that way. A headless run draws a 1920×1080 stage over a sample slide titled “Quarterly product update”, driven by a scripted mouse, and with `POINTER_AUDIO` set it also renders the run's sound effects into a WAV, in sync with the frames. `scripts/site-media.sh` renders a 17-second tour of the tools and another of the pointers at twice that size, cuts the website's silent close-ups and their stills from them, snaps four settings pages in light and dark, and draws the social card. `scripts/art.sh` renders the app icon and the settings window's pointer thumbnails the same way.

The launch film is the app too. `src/promo.rs` scripts seven shots, from a lost cursor on a screen share and the reveal to the tools, the pointers, the tech cards and the call to action, each performed headlessly, and the settings window is filmed recording real shortcuts. `scripts/promo.sh` renders the shots and cuts them together with FFmpeg, then lays the voiceover on top phrase by phrase, with the app's own sound effects at 20% beneath it. The voiceover was generated with ElevenLabs v4 in its Adam voice, and the take and its cue sheet are committed in `assets/promo/`.

The repository has three commits, all on November 19, 2026: an initial commit with a stub README and a placeholder icon, Pointer 1.0.0 two and a half hours later, and the launch film with its voiceover 41 minutes after that. Both commits after the first are co-authored by Claude.

## Try it

Download [Pointer.dmg](https://github.com/nearbycoder/pointer/releases/latest/download/Pointer.dmg) from the [website](https://nearbycoder.github.io/pointer/) or the [latest release](https://github.com/nearbycoder/pointer/releases/latest), open it, and drag Pointer into Applications. It needs macOS 13 or later, on Apple silicon or Intel. The first launch opens Settings. After that, the menu bar item or ⌃⌥, brings it back, and ⌃⌥Q quits. To build it yourself, you need macOS and a Rust toolchain from [rustup](https://rustup.rs): `cargo run --release` builds and runs it, and the toolchain pinned in `rust-toolchain.toml` installs itself on the first build. It's macOS only for now, because the mouse sampling and cursor hiding are macOS calls, and it reads the displays at launch, so restart it after plugging in or rearranging monitors.

The creation date shown here is the GitHub repository's UTC creation date. The cover, the close-ups and the settings pages come from the Pointer website and were rendered by the app, the picture of the five pointers is from the README, the film's poster is a frame from the film, and the code excerpt is from `src/fx.rs`. Where there are light and dark versions, they follow this site's theme.
