---
title: "Alibi & Co."
summary: "A cozy-noir deduction game: pin receipts, phone logs, and statements to a timeline, watch walking-time ribbons turn red, and break the alibi that can't be true, across five cases and a generated Daily Docket."
role: "Creator"
genre: "Deduction"
platforms: ["Windows", "macOS", "Linux", "Web"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:21:29Z"
stack:
  ["Unity 6", "C#", ".NET", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/AlibiAndCo"
download: "https://github.com/nearbycoder/AlibiAndCo/releases/latest"
featured: false
accent: "stone"
draft: false
image: "/images/games/alibi-and-co-alibi-breaks.webp"
imageAlt: "Case 2 mid-investigation: the café clock has been corrected and Marlow's lock has broken open."
imageCaption: "An alibi breaking open in case 2, at the Ultra graphics step. From the Alibi & Co. README."
demoVideos:
  - src: "/videos/games/alibi-and-co-trailer.mp4"
    title: "Alibi & Co. feature trailer"
    caption: "The 1:58 feature trailer, re-recorded at Ultra after twelve rounds of improvements: memos held up, a firm stand, links made by holding a card and through Same moment as…, a wrong link, a hint with its CONNIE tag, the seals, the Daily Docket, the controls list, graphics fidelity, and five cases. It uses the game's brushed-drum noir jazz and paper-and-pin sound effects with on-screen captions; there is no narration. The game plays itself through real mouse and keyboard input while its clock steps one frame at a time. Re-encoded here at 540p."
    poster: "/images/games/alibi-and-co-trailer-poster.webp"
    original: "https://github.com/nearbycoder/AlibiAndCo/blob/main/docs/media/alibi-and-co-trailer.mp4"
---

Wrenhaven is a harbour town in autumn 1986. You're the "& Co." at retired Detective Inspector Connie Alibi's two-desk agency. There are five small crimes, five nights, and one cork board.

Every receipt, phone log, ticket stub, press photo, and witness statement says that **someone was somewhere at a certain time**. Pin them onto each suspect's line, and the board measures the walk between them on a real town map. Blue ribbons mean there was time. A red ribbon means a story has just become physically impossible, and somebody, or some clock, is wrong.

The board does the arithmetic. You do the doubting.

## Paper beats people

Records are never false, but their clocks can be wrong. Statements can be false, and a lie isn't proof of guilt. That distinction drives the whole game.

**Confront** a statement that's part of a contradiction. If it's false, the witness admits it and the card is stamped FALSE or MISTAKEN. If it's true, they stand firm and you lose a badge, and Connie tells you what made their story red. **Link** two cards that describe the same moment seen on two different clocks. If one clock is trusted, like the telephone exchange, the BBC, the church bells, or the Electricity Board, the other clock's error is found, and every card it stamped slides to its true time. One receipt moving five minutes can sink an alibi. A link only happens when you mean it: a dragged card has to rest on the other until a LINK tag appears, or you can choose **Same moment as…** and click the other card.

<div class="project-media-gallery">
  <figure><img src="/images/games/alibi-and-co-board-ribbons.webp" alt="Hovering the bar tab in case 1: two stories in the red, with routes drawn on the map." width="1280" height="720" loading="lazy" /><figcaption>Two stories in the red.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-town-map.webp" alt="The town map zoomed in, with walking times." width="1280" height="720" loading="lazy" /><figcaption>Walking times on the town map.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-unknown-faces.webp" alt="Case 3: an unknown figure in a press photo, with the four faces it could be; each is crossed out as the records rule that person out." width="1280" height="720" loading="lazy" /><figcaption>Identity by elimination.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-notebook.webp" alt="The notebook in case 2." width="1280" height="720" loading="lazy" /><figcaption>The notebook.</figcaption></figure>
</div>

Unknown-person cards, such as a cash receipt or a figure in a photo, show candidate faces that are crossed out as the records rule people out. Each suspect shows a lock: **COVERED** if they couldn't have reached the scene for long enough, **OPEN** if they could, with different icons so the board reads without colour too. The incident can only be pinned when nothing is contradicting and it fits exactly one line, so a wrong accusation is impossible by construction. Then a brass pawn walks the culprit's route across the map while the night replays, and the _Wrenhaven Gazette_ prints the front page. Each case awards up to three seals: **Clean** (no badge lost), **Unaided** (no hint) and **Swift**.

<div class="project-media-gallery">
  <figure><img src="/images/games/alibi-and-co-case-file.webp" alt="Case file 1, typed up, before the board opens." width="1280" height="720" loading="lazy" /><figcaption>A case file.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-memo-held.webp" alt="Connie's memo held up off the desk to read, in case 1." width="1280" height="720" loading="lazy" /><figcaption>One of Connie's memos, held up to read.</figcaption></figure>
</div>

## Five cases and a daily docket

There are five handcrafted cases on one shared town map. The first three each teach one idea, pinning and contradictions, then clocks and links, then unknown persons and a camera's date-back clock, and the last two combine them: a crime timed by a wrong clock, and a chain of clocks where one can only be checked once another is mended. Every case is proven airtight by the solver.

Once the second case is closed, the case files offer the **Daily Docket**: a short case generated for each calendar day, with three of the town's regulars, a small crime and three stories, proven airtight by the same validator before it's offered. The last seven days stay in the docket drawer, and **Copy result** puts a spoiler-free line on the clipboard to send a friend.

<div class="project-media-gallery">
  <figure><img src="/images/games/alibi-and-co-late-game.webp" alt="Case 3: four suspects, a town lane, and Connie's hint with CONNIE tags on the cards it names." width="1280" height="720" loading="lazy" /><figcaption>A hint tags the cards it names.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-docket.webp" alt="The Daily Docket's drawer: this week's dockets." width="1280" height="720" loading="lazy" /><figcaption>The Daily Docket drawer.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-case-files.webp" alt="The case files: three of the five cases closed, with their seals, and the Daily Docket." width="1280" height="720" loading="lazy" /><figcaption>Case files and seals.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-title.webp" alt="Title screen: the polaroid wall." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
</div>

## Settings and graphics fidelity

Alibi & Co. plays with a mouse, a keyboard alone, a gamepad with its own button names, or touch in the browser build, and the pause menu lists the controls as a two-column table for whichever you're using. Settings sit in two headed columns: volumes, resolution, fullscreen, text size up to Larger, **plain lettering** that sets every memo, statement and record in a plain sans instead of typewriter and handwriting, reduced motion, and an optional case timer. Menus rise and grow into place, and every case keeps its own board, so a half-solved case is still there when you come back.

**Graphics fidelity** has four steps. High is the look the game was built with, with MSAA, soft lamp and window shadows, ambient occlusion, bloom, film grain and colour grading. Ultra draws the picture at 1.5 times the window's size and scales it down, with high-sample occlusion, high-quality bloom, 64-bit HDR colour, 16× texture filtering and twice the dust. No step draws the board's text below the window's resolution, so times stay sharp on Low. On the integrated Radeon it was measured on, a busy board took 1.7 ms on Low and 8.1 ms on Ultra at 1920×1080.

<figure>
  <img src="/images/games/alibi-and-co-settings.webp" alt="Settings in two columns: volumes, resolution, fullscreen and the graphics fidelity slider; text size, plain lettering, reduced motion and the case timer." width="1280" height="720" loading="lazy" />
  <figcaption>Settings, in two columns.</figcaption>
</figure>

## What it's built with

Everything that decides the game, including the board, case data, town map, and solver, is plain C# in `Assets/Scripts/Logic/` with no Unity dependency. **Unity 6** renders it, and a .NET console app compiles the same files to check it, so the game and the validator can't disagree.

Clocks are data. Every card names the clock that timed it, and each clock has a hidden offset. A link between two cards calibrates the untrusted clock, and the board recomputes every card's true time and walking feasibility in one pass, using all-pairs shortest paths over the town's street graph.

`CaseValidator` searches every reachable board state using only legal moves. It checks that each case has exactly one consistent solution, that the solved state can be reached from every state, that every designed contradiction can be discovered, that unknown cards only ever resolve to the right person, and that no state allows a wrong accusation. The build runs it before it packages anything, and it proves a year of generated dockets airtight.

## How it was made

Alibi & Co. started with a thorough design and technical plan, and its pillars set the tone: the board does the arithmetic and you do the doubting, paper beats people, everything is a physical object on a lamp-lit desk, every case is provably airtight, and it's cozy noir rather than grimdark.

The pipeline is procedural from end to end. Blender scripts model and render the props, portraits, press photos, and the town map; the suspects are built from fused ellipsoids, voxel-remeshed and smoothed into one surface. The map is generated from the same `town.json` the game uses, so its streets match the walking times exactly. Python and NumPy synthesize the score, using Karplus-Strong bass, FM Rhodes, vibraphone, and brushes, along with the foley.

After launch, the game went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds added cases 4 and 5, the Daily Docket, gamepad, keyboard-only and touch play, the seals, plain lettering, memos that wait long enough to read, links in two clicks and the fidelity slider. One round found that the self-tests' long-standing 11 frames per second came from the shared desktop, not the game: in a private, invisible KWin desktop they ran at 52 to 56. Autoplay now plays all five cases and the dockets in the desktop build and in headless Chromium and Firefox.

The trailer recorder pipes raw frames to FFmpeg while the game clock steps exactly one frame at a time, and an audio director logs what every voice plays on each frame so the soundtrack can be rebuilt offline.

## Play it

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/AlibiAndCo/releases/latest) for Linux. That's the October 4 launch build with the first three cases and none of the improvements above; to play the current game, with all five cases and the Daily Docket, build it from source with Unity. A 27 MB browser build can be made from source too, but it isn't hosted yet. Controllers and touch have only been tested with simulated input.

[Browse the source on GitHub](https://github.com/nearbycoder/AlibiAndCo). GitHub records the repository's creation on **October 4, 2026**.
