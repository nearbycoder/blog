---
title: "Alibi & Co."
summary: "A cozy-noir deduction game: pin receipts, phone logs, and statements to a timeline, watch walking-time ribbons turn red, and break the alibi that can't be true."
role: "Creator"
genre: "Deduction"
platforms: ["Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04"
stack:
  ["Unity 6", "C#", ".NET", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/AlibiAndCo"
download: "https://github.com/nearbycoder/AlibiAndCo/releases/latest"
featured: false
accent: "stone"
draft: false
image: "/images/games/alibi-and-co-alibi-breaks.webp"
imageAlt: "Case 2 mid-investigation: the café clock has been corrected and Marlow's alibi has broken open."
imageCaption: "An alibi breaking open in case 2, from the Alibi & Co. README."
demoVideos:
  - src: "/videos/games/alibi-and-co-trailer.mp4"
    title: "Alibi & Co. feature trailer"
    caption: "The 1:50 feature trailer, with the game's brushed-drum noir jazz and paper-and-pin sound effects and on-screen captions; there is no narration. The game plays itself through scripted mouse and keyboard input, and the cut is made from frame-numbered markers. Re-encoded here at 540p."
    poster: "/images/games/alibi-and-co-trailer-poster.webp"
    original: "https://github.com/nearbycoder/AlibiAndCo/blob/main/docs/media/alibi-and-co-trailer.mp4"
---

Wrenhaven is a harbour town in autumn 1986. You're the "& Co." at retired Detective Inspector Connie Alibi's two-desk agency. There are three small crimes, three nights, and one cork board.

Every receipt, phone log, ticket stub, press photo, and witness statement says that **someone was somewhere at a certain time**. Pin them onto each suspect's line, and the board measures the walk between them on a real town map. Blue ribbons mean there was time. A red ribbon means a story has just become physically impossible, and somebody, or some clock, is wrong.

The board does the arithmetic. You do the doubting.

## Paper beats people

Records are never false, but their clocks can be wrong. Statements can be false, and a lie isn't proof of guilt. That distinction drives the whole game.

**Confront** a statement that's part of a contradiction. If it's false, the witness admits it and the card is stamped FALSE or MISTAKEN. If it's true, they stand firm and you lose a badge. **Link** two cards that describe the same moment seen on two different clocks. If one clock is trusted, like the telephone exchange, the BBC, the church bells, or the Electricity Board, the other clock's error is found, and every card it stamped slides to its true time. One receipt moving five minutes can sink an alibi.

<div class="project-media-gallery">
  <figure><img src="/images/games/alibi-and-co-board-ribbons.webp" alt="Hovering the bar tab in case 1: two stories in the red, with routes drawn on the map." width="1280" height="720" loading="lazy" /><figcaption>Two stories in the red.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-town-map.webp" alt="The town map zoomed in, with walking times." width="1280" height="720" loading="lazy" /><figcaption>Walking times on the town map.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-unknown-faces.webp" alt="Case 3: an unknown figure in a press photo, with candidate faces being crossed out." width="1280" height="720" loading="lazy" /><figcaption>Identity by elimination.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-notebook.webp" alt="The notebook in case 2." width="1280" height="720" loading="lazy" /><figcaption>The notebook.</figcaption></figure>
</div>

Unknown-person cards, such as a cash receipt or a figure in a photo, show candidate faces that are crossed out as the records rule people out. Each suspect shows a lock: **COVERED** if they couldn't have reached the scene for long enough, **OPEN** if they could. The incident can only be pinned when nothing is contradicting and it fits exactly one line, so a wrong accusation is impossible by construction. Then a brass pawn walks the culprit's route across the map while the night replays, and the _Wrenhaven Gazette_ prints the front page.

<figure>
  <img src="/images/games/alibi-and-co-case-file.webp" alt="Case file 1, typed up, with the Gazette's front page." width="1280" height="720" loading="lazy" />
  <figcaption>A closed case and its front page.</figcaption>
</figure>

There are three handcrafted cases of roughly five, ten, and fifteen minutes. Each teaches one new idea: pinning and contradictions, then clocks and links, then unknown persons and a camera's date-back clock.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/alibi-and-co-title.webp" alt="Title screen: the polaroid wall." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-late-game.webp" alt="Case 3 in progress: four suspects, a town lane, and one of Connie's memos." width="1280" height="720" loading="lazy" /><figcaption>Case 3 in progress.</figcaption></figure>
  <figure><img src="/images/games/alibi-and-co-case-files.webp" alt="The case files with all three cases closed." width="1280" height="720" loading="lazy" /><figcaption>Case files.</figcaption></figure>
</div>

## What it's built with

Everything that decides the game, including the board, case data, town map, and solver, is plain C# in `Assets/Scripts/Logic/` with no Unity dependency. **Unity 6** renders it, and a .NET console app compiles the same files to check it, so the game and the validator can't disagree.

Clocks are data. Every card names the clock that timed it, and each clock has a hidden offset. A link between two cards calibrates the untrusted clock, and the board recomputes every card's true time and walking feasibility in one pass, using all-pairs shortest paths over the town's street graph.

`CaseValidator` searches every reachable board state using only legal moves. It checks that each case has exactly one consistent solution, that the solved state can be reached from every state, that every designed contradiction can be discovered, that unknown cards only ever resolve to the right person, and that no state allows a wrong accusation. The build runs it before it packages anything.

## How it was made

Alibi & Co. started with a thorough design and technical plan, and its pillars set the tone: the board does the arithmetic and you do the doubting, paper beats people, everything is a physical object on a lamp-lit desk, every case is provably airtight, and it's cozy noir rather than grimdark. Its commit history spans about nine and a half hours on October 4, 2026.

The pipeline is procedural from end to end. Blender scripts model and render the props, portraits, press photos, and the town map; the suspects are built from fused ellipsoids, voxel-remeshed and smoothed into one surface. The map is generated from the same `town.json` the game uses, so its streets match the walking times exactly. Python and NumPy synthesize the score, using Karplus-Strong bass, FM Rhodes, vibraphone, and brushes, along with the foley. Pillow ages the photos and typesets each case's newspaper.

The recorder pipes raw frames to FFmpeg while the game clock steps exactly one frame at a time, and an audio director logs what every voice plays on each frame so the soundtrack can be rebuilt offline.

## Play it

Version 0.1.0 is a complete, small game: three cases from start to finish. [Download the Linux build](https://github.com/nearbycoder/AlibiAndCo/releases/latest) and run `./AlibiAndCo.x86_64`. It's played with a mouse and keyboard.

[Browse the source on GitHub](https://github.com/nearbycoder/AlibiAndCo). GitHub records the repository's creation on **October 4, 2026**.
