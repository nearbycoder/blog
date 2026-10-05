---
title: "Last Light"
summary: "Keep the last lighthouse on a wrecking coast: sweep a heavy beam to guide ships home, chart hidden reefs ahead of them, and douse the wreckers' false lights across twelve nights."
role: "Creator"
genre: "Strategy"
platforms: ["Linux"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04"
stack:
  ["Unity 6", "C#", "HLSL", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/LastLight"
download: "https://github.com/nearbycoder/LastLight/releases/latest"
featured: true
accent: "sky"
draft: false
image: "/images/games/last-light-play.webp"
imageAlt: "Night III, Lantern Row: the beam sweeps across the bay toward a ship while a lit buoy keeps the channel."
imageCaption: "Night III, Lantern Row, from the Last Light README."
demoVideos:
  - src: "/videos/games/last-light-trailer.mp4"
    title: "Last Light feature trailer"
    caption: "The 1:50 feature trailer, with the game's synthesized waltz and sound and animated on-screen captions. There is no narration; radio voices are synthesized gibberish shown with typed text. Every shot is the game running scripted nights. Re-encoded here at 540p."
    poster: "/images/games/last-light-trailer-poster.webp"
    original: "https://github.com/nearbycoder/LastLight/blob/main/docs/media/LastLight_trailer.mp4"
---

Gannet Head Light is being switched off at the end of the season, and a radio beacon will replace it. You have twelve nights left.

Out on Merrow Bay, trawlers, coal steamers, and the passenger ferry steer by your light. Keep a ship in the beam and its captain sails on with confidence. Leave it in the dark and the captain loses the way, drifting toward rocks nobody can see. There's one beam and many ships, so every night is a quiet juggling act. The sea looks calm, but every decision is tense.

## Point the light

That's the entire interface. The lens is a heavy mass on a damped spring: it builds up speed, overshoots slightly, and settles. Hold to **focus** for a narrow, long, bright beam that reaches the far lanes and pierces fog, at the cost of a slower, smaller sweep. A foghorn on a cooldown sends a shockwave across the water that steadies every ship in earshot.

Each ship has a confidence ring that refills in your beam and drains in the dark. At zero the captain is Lost. Reefs are hidden, and the captains' routes run straight over them. Sweep the water ahead of a ship and the surf breaks white over each reef you reveal, and the captain steers around it. Charts fade about 22 seconds after the light leaves them, so you time your sweeps to stay just ahead of each ship.

<div class="project-media-gallery">
  <figure><img src="/images/games/last-light-chart.webp" alt="Night II, The Teeth: the beam passes over a reef cluster and white water breaks over the rocks it has charted." width="1280" height="720" loading="lazy" /><figcaption>Charting the Teeth ahead of a trawler.</figcaption></figure>
  <figure><img src="/images/games/last-light-foghorn.webp" alt="Night V, Sea Fret: the foghorn's shockwave rings spread across the bay through drifting fog banks." width="1280" height="720" loading="lazy" /><figcaption>The foghorn cutting through sea fret.</figcaption></figure>
</div>

## One new idea per night

Night by night the season adds hidden reefs, buoys that hold a channel while you tend to other ships, collier steamers that turn wide and run aground on sandbanks trawlers can cross, fog, damaged vessels with no lights that you find by radio bearing and distress flares, and storms that push ships off course but light the whole bay with every lightning strike.

Then come the wreckers. The Corleys sweep lanterns from the cliffs that imitate your light, luring ships toward the rocks. Hold your beam on a lantern to douse it, or light the ship to break the spell. On night 11, one false light copies your every sweep.

<div class="project-media-gallery">
  <figure><img src="/images/games/last-light-false-light.webp" alt="Night IX, False Light: a wrecker's orange lantern on the cliffs lures a steamer toward the rocks." width="1280" height="720" loading="lazy" /><figcaption>A wrecker's false light.</figcaption></figure>
  <figure><img src="/images/games/last-light-storm.webp" alt="Night XII, Last Light: rain and a lightning flash light the whole bay during the finale." width="1280" height="720" loading="lazy" /><figcaption>Lightning over the finale.</figcaption></figure>
  <figure><img src="/images/games/last-light-wreck.webp" alt="A trawler left in the dark strikes an uncharted reef and burns, its ring turned red." width="1280" height="720" loading="lazy" /><figcaption>Every ship counts.</figcaption></figure>
  <figure><img src="/images/games/last-light-logbook.webp" alt="The keeper's logbook: nights kept with their lamps, later nights still sealed with wax." width="1280" height="720" loading="lazy" /><figcaption>The keeper's logbook.</figcaption></figure>
</div>

Nights take two to five minutes and are rated with up to three lamps. Ianto the harbourmaster, Maren on the _Little Auk_, Captain Pryce on the _SS Calloway_, and Dot on the ferry _Evening Star_ grumble, joke, panic, and thank you over the radio. Finish the season and an endless, procedurally generated **Night Watch** opens.

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/last-light-title.webp" alt="The title screen: the lighthouse at night, its beam sweeping overhead." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/last-light-results.webp" alt="Dawn results for night II: three lamps lit, five ships home, none wrecked." width="1280" height="720" loading="lazy" /><figcaption>Dawn results.</figcaption></figure>
  <figure><img src="/images/games/last-light-night-watch.webp" alt="The Night Watch, with its tally, clock, and wreck allowance." width="1280" height="720" loading="lazy" /><figcaption>The Night Watch.</figcaption></figure>
</div>

## What it's built with

All gameplay lives in a pure C# `SimWorld`, stepped at a fixed 60 Hz with a seeded random number generator. **Unity 6** and URP only read it and interpolate. The same code runs in the game, in the EditMode tests, and under the **AutoKeeper** bot, which plays through the same input structure as a player, so the lens's speed limits apply to it too.

The identity of the game is the light, so the most interesting code is in the shaders. The beam test, with cone falloff, range, shadows cast by sea stacks, and fog extinction, is written once in C# and mirrored in HLSL. The glow you see on the water is the same function the ships respond to. A full-screen raymarch computes single scattering from the beam analytically, along with moonlit haze and drifting fog banks; the fog quality setting is simply the step count. The water uses Gerstner waves, a moon glitter path, and a foam texture that the simulation writes for charted reefs and wakes.

A single JSON file, `merrow_bay.json`, describes the coast. It drives both the simulation and the Blender generators for the cliffs, rocks, and buoys, so geometry and gameplay can't drift apart.

## How it was made

Last Light was one of eight games built in parallel from short designer briefs, each by its own AI coding session on a shared machine. The brief: keep a lighthouse working by moving its beam through a sea full of hidden routes, with one coastal map, three vessel types, and twelve missions. Its trailer moment: a captain thanks you for the light, and then your lighthouse is switched off. The brief also told the session to invest in shaders and lighting early, since the beam, the fog, and the night sea are the game's identity. The repository's commit history spans about ten hours on October 4, 2026.

Every model was built by script in Blender, and every sound, radio voice, and note of music was synthesized in Python with NumPy and SciPy. Radio voices use formant synthesis, pitched and timed per character and band-passed like a wireless. The score includes a waltz, a night bed with a tension layer that rises as ships get lost, and a music-box ending.

Balance comes from bots. The AutoKeeper wins all twelve nights in the pure simulation, and a deliberately sloppy "novice keeper", slow to react, shaky, and unaware of the reefs, gives a rough difficulty curve. For the trailer, a headless twin of each scripted night runs first to find the frame where the moment happens; the real night is then fast-forwarded off camera and recorded at a fixed 30 fps, and a Python script cuts the clips to the bars of the title waltz.

## Play it

Version 0.1.0 includes all twelve nights, the ending, and the Night Watch. [Download the Linux build](https://github.com/nearbycoder/LastLight/releases/latest) and run `./LastLight.sh`; it needs a GPU with OpenGL 4.5. It supports mouse, keyboard, and gamepad, though the gamepad has only been tested with a simulated device and balance hasn't been tuned with human players yet.

[Browse the source on GitHub](https://github.com/nearbycoder/LastLight). GitHub records the repository's creation on **October 4, 2026**.
