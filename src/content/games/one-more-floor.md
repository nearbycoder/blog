---
title: "One More Floor"
summary: "A short-shift score-attack game where you run the elevator in a hotel that rearranges its floors every time you stop, for guests including a vampire, a houseplant, and a soaked swimmer."
role: "Creator"
genre: "Arcade puzzle"
platforms: ["Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04"
stack: ["Unity 6", "C#", "Blender", "Python", "NumPy", ".NET", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/OneMoreFloor"
download: "https://github.com/nearbycoder/OneMoreFloor/releases/latest"
featured: false
accent: "red"
draft: false
image: "/images/games/one-more-floor-ocean-moment.webp"
imageAlt: "The elevator doors open onto the ocean, and a soaked swimmer asks for the lobby."
imageCaption: "Saturday at The Shuffleton: the Ocean visits, and a swimmer says “Lobby, please.”"
demoVideos:
  - src: "/videos/games/one-more-floor-trailer.mp4"
    title: "One More Floor feature trailer"
    caption: "The 1:56 feature trailer, walking through every guest, every shuffle card, the reactive music, the week of shifts, and Overtime. It uses the game's own music and sound with on-screen captions; there is no narration, and guests speak in wordless synthesized voices. Recorded by the game from scripted, seeded play. Re-encoded here at 540p."
    poster: "/images/games/one-more-floor-trailer-poster.webp"
    original: "https://github.com/nearbycoder/OneMoreFloor/blob/main/docs/media/trailer.mp4"
---

The Shuffleton is a mid-century Art Deco hotel with one problem: **every time the elevator stops, the building shuffles.** Two floors swap, the Penthouse rises to the top, a block of floors rolls over, and late in the week a whole stack flips upside down. You're the new elevator operator, and your guests still expect to get where they're going.

Shifts last two to three minutes. You earn tips, stars, and a best score, and then there's a large **One More Shift** button.

## Read the forecast, then press a button

Let guests in at the floor you're docked at, send the car to their floor, and watch the forecast on your brass panel to see what the building will do at your next stop. The anchor rule is what makes it plannable: the floor you're docked at can't move. A card that names it jams, with sparks and a grinding noise, so docking somewhere is how you protect it.

Tips are the fare plus whatever patience a guest had left, multiplied by your streak and by group drops, when several guests get off at one stop. The last 30 seconds of every shift are Rush Hour. Five complaints and you're fired.

<figure>
  <img src="/images/games/one-more-floor-triple-drop.webp" alt="Rush hour: a triple drop with sunkissed and jammed popups and the streak at times 2.50." width="1280" height="720" loading="lazy" />
  <figcaption>A triple drop during Rush Hour, with the streak at its ×2.5 cap.</figcaption>
</figure>

## Eight guests, one rule each

Every guest's rule fits on an icon. The commuter just wants their floor. A houseplant won't get off until the doors have opened on a sunny floor. A mirror mover takes two spaces and won't ride with a vampire. The vampire won't ride with a mirror, and if the doors open on sunlight, it turns into bats. A courier's floor is about to leave the building. The swimmer waits on the Ocean, which only stays a few stops, and always says "Lobby, please." The kid pressed every button. The tycoon pays the most, but only if the trip is express.

The fun is in the combinations, like a kid riding with a vampire past the Greenhouse. Hover over a floor to preview the trip: every stop on the way, where sunlight will hit, and who gets off.

<div class="project-media-gallery">
  <figure><img src="/images/games/one-more-floor-vampire-poof.webp" alt="POOF: the doors open on the Greenhouse with a vampire aboard." width="1280" height="720" loading="lazy" /><figcaption>Sunlight and vampires don't mix.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-houseplant-sun.webp" alt="A houseplant perks up in the Greenhouse and says it needed sunshine." width="1280" height="720" loading="lazy" /><figcaption>A houseplant gets its sun.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-route-preview.webp" alt="Hovering a floor previews every stop the car will make on the way with a kid aboard." width="1280" height="720" loading="lazy" /><figcaption>Previewing a trip with a kid aboard.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-graveyard-flip.webp" alt="Friday the 13th: five floors flip at night." width="1280" height="720" loading="lazy" /><figcaption>The Graveyard Shift's Flip card.</figcaption></figure>
</div>

The week has ten shifts, each adding one guest or twist, then the Graveyard Shift on Friday the 13th and an endless Overtime. The soundtrack is lounge music that panics: five stems play in sync, and a trouble meter fades in nervous strings, a ticking woodblock, and a tape warble as guests lose patience, then relaxes again when you recover.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/one-more-floor-title.webp" alt="Title screen: the tower at dusk with the neon sign." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-core-shuffle.webp" alt="Monday: the first drop-off puts you on the clock as the floors start to shuffle." width="1280" height="720" loading="lazy" /><figcaption>Monday's first shift.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-gamepad-closeup.webp" alt="Gamepad play zoomed in: gold floor brackets, a guest card, and the button prompt strip." width="1280" height="720" loading="lazy" /><figcaption>Gamepad close-up.</figcaption></figure>
  <figure><img src="/images/games/one-more-floor-roster.webp" alt="The duty roster: ten shifts with stars, bests, and locks." width="1280" height="720" loading="lazy" /><figcaption>The duty roster.</figcaption></figure>
</div>

## What it's built with

The rules live in `ShiftSim`, plain C# with no Unity dependency. It steps on a fixed 1/60-second clock from a seed, owns everything that matters for timing, such as car motion, doors, and patience, and raises events that the Unity views animate. The game, a bot player, the tests, a balance harness, and the trailer recorder all drive that same object.

Because the rules don't need Unity, they also run on plain .NET. `Tools/sim.sh` throws random commands at every shift and checks invariants, and its balance mode plays every shift with four bot skill levels. One of those is a **model of a human player**, with decision time, Fitts's-law pointer travel for every click, and a beat to take in each stop. Star thresholds come from that model's score percentiles, so about half of first attempts should earn the star that unlocks the next shift.

**Unity 6** handles the presentation, with URP, the Input System for mouse, keyboard, and gamepad, and Playables to blend each character's animation clips.

## How it was made

One More Floor was one of eight games built in parallel from short designer briefs, each by its own AI coding session on a shared machine. The brief asked for an elevator in a building that rearranges itself between stops, with ten floors, eight passenger types, and short score-based shifts. Its trailer moment: the doors open onto the ocean, and a soaked passenger says, "Lobby, please." The repository's commit history spans about ten hours on October 4, 2026.

Every model is a Blender script. `ArtSource/*.py` builds the ten floors, nine characters, the car, the brass panel, and props from primitives. The characters have real armatures with keyframed clips such as idle, walk, stomp, cheer, and fume. Every sound is synthesized with NumPy: the music stems and about 100 effects and "animalese" voices. An audit script checks each one objectively, measuring loudness, true peak, clicks, loop seams, and leading silence.

The trailer is recorded by the game. Each shot plays from a fixed seed and skips ahead to a moment found by playing the same seed headlessly. It's recorded twice, once offline at a locked 30 fps for video and once in real time for sound, and the two line up exactly because the simulation is deterministic. A Python script cuts the shots on the beat of the game's 104 BPM track.

## Play it

Version 0.1.0 has the full scope: ten floors, eight guests, ten shifts, Overtime, menus, saves, and gamepad support. [Download the Linux build](https://github.com/nearbycoder/OneMoreFloor/releases/latest) and run `./OneMoreFloor.x86_64`. Difficulty is fitted to the player model rather than real playtests so far, and the README is candid that the audio has been measured more than it's been listened to.

[Browse the source on GitHub](https://github.com/nearbycoder/OneMoreFloor). GitHub records the repository's creation on **October 4, 2026**.
