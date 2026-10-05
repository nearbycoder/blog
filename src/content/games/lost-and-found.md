---
title: "Lost & Found"
summary: "A small deduction game set at the lost-property desk of a 1962 railway station, where you inspect objects, catch liars, and decide which belongings should never be returned."
role: "Creator"
genre: "Deduction"
platforms: ["Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04"
stack: ["Unity 6", "C#", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/LostAndFound"
download: "https://github.com/nearbycoder/LostAndFound/releases/latest"
featured: true
accent: "amber"
draft: false
image: "/images/games/lost-and-found-hum.webp"
imageAlt: "The battered suitcase glowing gold in the player's hands as Mrs Marsh asks whether it is humming."
imageCaption: "A suitcase that hums for its real owner, from the Lost & Found README."
demoVideos:
  - src: "/videos/games/lost-and-found-trailer.mp4"
    title: "Lost & Found feature trailer"
    caption: "The just-under-two-minute feature trailer, with the game's swing-jazz score and sound effects and on-screen captions. There is no narration; claimants speak in synthesized, wordless babble. It was filmed by the game playing whole days through simulated mouse and keyboard input. Re-encoded here at 540p."
    poster: "/images/games/lost-and-found-trailer-poster.webp"
    original: "https://github.com/nearbycoder/LostAndFound/blob/main/docs/media/trailer.mp4"
---

It's October 1962 at Ninefold Junction, and you've just taken over the Lost Property desk from Agnes Pell, who ran it for forty-one years. Commuters come to the window to claim what they've lost. You search the drawers and shelves, turn each object over in your hands, find what's hidden inside, and stamp the claim **RETURN**, **REFUSE**, or **SEAL** it in the Iron Drawer.

Some claimants are lying. Some things hum when their owner is near. Some things come from tomorrow. And some belongings should never be returned at all, especially not to the polite grey gentleman who keeps asking for the keys.

## Looking closely is the whole game

There are no timers and no walls of text. Every case can be solved from what's on the desk: the intake tag that says where and when the object was found, the details hidden in the object itself, the claimant's story, and the rules Agnes left behind.

Pick something up and it comes to your hands under the lamp. Drag to turn it, scroll to lean in, and open its lid, latch, or clasp. A magnifier glints when you're close to a hidden detail, such as a name strip inside an umbrella or a date stamped on the back of a photograph. Each discovery is written onto the claim slip, and clicking it asks the claimant a neutral question about it.

<div class="project-media-gallery">
  <figure><img src="/images/games/lost-and-found-drawers.webp" alt="Drawer A open, with the wallet's intake tag swung up." width="1280" height="720" loading="lazy" /><figcaption>Every stray has an intake tag.</figcaption></figure>
  <figure><img src="/images/games/lost-and-found-inspect.webp" alt="The brown wallet open in the player's hands as a discovery is written on the claim slip." width="1280" height="720" loading="lazy" /><figcaption>Discoveries go straight onto the slip.</figcaption></figure>
</div>

Honest owners know what's inside. Liars only know what they could have seen from across the counter, so they bluff. The game never announces a contradiction; you compare, and the evening ledger tells you whether you were right.

<figure>
  <img src="/images/games/lost-and-found-liar.webp" alt="Asking Reggie Stokes about the name strip inside the umbrella." width="1280" height="720" loading="lazy" />
  <figcaption>Asking a claimant about a detail they couldn't have seen.</figcaption>
</figure>

## The uncanny, gently

Things arrive from other times on Platform 9. A pocket watch found tomorrow runs backwards. A cold visitor frosts the window glass. From Thursday, Agnes's lamp gains a blue filter that reveals hidden ink, and a ring in a velvet box turns up. Return it to the right person and every photograph on your desk changes. Mr Vell, the Grey Gentleman, knows every detail of every object, and nothing ever hums for him.

<div class="project-media-gallery">
  <figure><img src="/images/games/lost-and-found-vell.webp" alt="Mr Vell, the Grey Gentleman, at the window while the player holds up a pocket watch whose hands run backwards." width="1280" height="720" loading="lazy" /><figcaption>Mr Vell and a watch from tomorrow.</figcaption></figure>
  <figure><img src="/images/games/lost-and-found-frost.webp" alt="Frost creeping over the window glass as a First World War lieutenant waits." width="1280" height="720" loading="lazy" /><figcaption>Frost means they've gone on ahead.</figcaption></figure>
  <figure><img src="/images/games/lost-and-found-lamp.webp" alt="The desk lamp switched to its blue filter, revealing hidden ink on a chit." width="1280" height="720" loading="lazy" /><figcaption>Agnes's blue lamp.</figcaption></figure>
  <figure><img src="/images/games/lost-and-found-ledger.webp" alt="The Day Ledger marking each case, beside the Ninefold Gazette's headline." width="1280" height="720" loading="lazy" /><figcaption>The evening ledger and Gazette.</figcaption></figure>
</div>

The week runs five days, with 24 cases plus an alternate, 25 objects, 25 sculpted characters, and three endings. Choices carry forward: refused items wait in storage for their real owner, and every gift to the Grey Gentleman visibly drains the colour from the station. A full week takes about an hour.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/lost-and-found-title.webp" alt="The title screen: Agnes's desk at dusk." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/lost-and-found-photographs.webp" alt="A framed photograph on the desk changing." width="1280" height="720" loading="lazy" /><figcaption>A photograph changing.</figcaption></figure>
</div>

## What it's built with

Lost & Found runs on **Unity 6** with the Universal Render Pipeline. Its main scene is empty. A `Boot` script builds the whole game at runtime from code and the `Resources` folder: camera rig, lights, post-processing, desk, props, UI, and the director that runs days and cases. Restarting a day tears everything down and builds it again, which keeps scene wiring from going stale.

All content is JSON: objects, hidden details, hotspots, claims, answers, verdicts, story flags, newspaper headlines, and endings. Blender models line up with that data by name. Hotspots are empties named `HS_<detail>`, and moving parts are nodes named `Lid`, `Flap`, or `Key`.

A rules solver keeps every case fair. It sees only what a player could learn at the desk by that point in the week and must reach each case's intended verdict, or the build fails validation. The same solver powers an AutoPilot that plays the entire week through the real desk systems to each ending.

## How it was made

This was one of eight games built in parallel from short designer briefs, each by its own AI coding session on a single shared 32-core machine. The brief for this one, in full, was a sentence: _run the lost-and-found desk for a train station where some belongings should never be returned_. It came with a scope (one desk, 25 objects, a five-day story) and a trailer moment: return a wedding ring, and every photograph on your desk changes. The designer called it their strongest pick. The session wrote a full design and technical plan first, then built the game. The repository's commit history spans about ten and a half hours on October 4, 2026.

Everything is generated by code in the repository. Characters are sculpted as signed distance fields and meshed with marching cubes, so faces, lips, and ears are one continuous surface. They're animated procedurally, with breathing, blinking, glances, and talking, rather than rigs. The photographs on the desk are staged with the real character models in Blender, then aged in Python into 1921 sepia, 1951 silver, and 1962 Polaroid. About 170 sound effects, voices, and ambience clips come from a small NumPy synthesis toolkit, along with a swing-jazz score built around a nine-note "Ninefold" motif.

The trailer was shot by the game itself. A frame-locked recorder runs at 30 fps, pipes frames to FFmpeg, and captures the mixed audio, and its play mode drives a simulated mouse and keyboard through whole days. The project was developed with [Claude Code](https://claude.com/claude-code).

## Play it

Version 0.1.0 includes all five days, every case, and all three endings. [Download the Linux build](https://github.com/nearbycoder/LostAndFound/releases/latest) and run `LostAndFound.x86_64`. It's mouse and keyboard only, and it hasn't had broad human playtesting yet.

[Browse the source on GitHub](https://github.com/nearbycoder/LostAndFound). GitHub records the repository's creation on **October 4, 2026**.
