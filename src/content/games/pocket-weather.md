---
title: "Pocket Weather"
summary: "A cozy puzzle game where you play Pip, a tiny cloud who rains, shades, and gusts a miniature world through its day across twelve tilt-shift dioramas."
role: "Creator"
genre: "Cozy puzzle"
platforms: ["Windows", "macOS", "Linux", "Web"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:35:04Z"
stack:
  ["Unity 6", "C#", "HLSL", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
githubLink: "https://github.com/nearbycoder/PocketWeather"
download: "https://github.com/nearbycoder/PocketWeather/releases/latest"
featured: false
accent: "sky"
draft: false
image: "/images/games/pocket-weather-rain.webp"
imageAlt: "Pip, a smiling cloud, rains on a flower bed in a tilt-shift diorama."
imageCaption: "Pip watering Rosa's flower bed, from the Pocket Weather README."
demoVideos:
  - src: "/videos/games/pocket-weather-trailer.mp4"
    title: "Pocket Weather trailer"
    caption: "The 1:54 trailer, with the game's synthesized music, musical raindrops, and sound effects, and on-screen captions; there is no narration. Every shot was staged by an in-game script and recorded on a fixed clock, not screen-captured. Re-encoded here at 540p."
    poster: "/images/games/pocket-weather-trailer-poster.webp"
    original: "https://github.com/nearbycoder/PocketWeather/blob/main/docs/media/pocket-weather-trailer.mp4"
---

You're Pip, a tiny cloud helping a miniature world through its day. Rain on thirsty gardens, shade overheated sheep, and puff sailboats home before the sun goes down. But every drop counts, and too much rain fixes one problem by causing another.

Twelve single-screen, tilt-shift dioramas follow one summer in **Pocketvale**: from Rosa's first flower bed, through Tom's becalmed fishing boat, a rainbow picnic, and a night of runaway haystack fires, to their lakeside wedding, where Pip sneezes, soaks the whole party, and has to make a rainbow to save the day.

## One resource, three ways to spend it

Water is everything. Rain spends it, a gust costs a little, and Pip's size, and so the shade it casts, grows with how full it is. Refill by hovering over ponds and the sea, or by catching vapour: morning dew, chimney steam, the steam off a doused fire.

Each day is a small ecosystem of wants. The carrots want rain, but not too much. The sheep want shade, but not rain. The washing wants wind, and definitely not rain. The duck pond you're drinking from has a line the ducks would rather you didn't cross. Meet every need at the same moment and the day is saved.

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-drink.webp" alt="Pip drinking from a pond." width="1280" height="720" loading="lazy" /><figcaption>Drinking from a pond.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-shade.webp" alt="Pip shading a hot sheep." width="1280" height="720" loading="lazy" /><figcaption>Shade for an overheated sheep.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-rainbow.webp" alt="A rainbow over a picnic." width="1280" height="720" loading="lazy" /><figcaption>A rainbow over the picnic.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-campfire.webp" alt="Raining out a haystack fire at night." width="1280" height="720" loading="lazy" /><figcaption>Campfire Night.</figcaption></figure>
</div>

Rain leaves a sparkling mist behind. Step aside and let the sun shine through it, and a rainbow arcs over the spot. Anyone under it is delighted and forgives being rained on, and some wishes can only be granted that way. Later days change the rules: a night of fires that spread, a regatta with several boats at once, and a heatwave with sunflowers that droop in your shadow.

## Rain that makes music

Hold to rain, and the soil darkens, the grass greens, and sprouts pop into flowers. Each drop that lands plays a note from the current chord of the soundtrack, on a timbre chosen by what it hits: kalimba on leaves, glass on water, glockenspiel on roofs, marimba on soil. Playing well sounds good.

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-wedding.webp" alt="The wedding: Pip catches the bouquet under the rainbow." width="1280" height="720" loading="lazy" /><figcaption>The wedding finale.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-day-saved.webp" alt="The day-saved card with three stamps." width="1280" height="720" loading="lazy" /><figcaption>Three stamps: saved, before par, and a secret delight.</figcaption></figure>
</div>

## More screenshots

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-title.webp" alt="The Pocket Weather title screen over a live diorama." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-map.webp" alt="Map of Pocketvale with stamps." width="1280" height="720" loading="lazy" /><figcaption>The map of Pocketvale.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-regatta.webp" alt="The regatta: a sailboat gusted home to its buoy." width="1280" height="720" loading="lazy" /><figcaption>The regatta.</figcaption></figure>
</div>

## What it's built with

Pocket Weather is a **Unity 6** URP game for desktop and the web, playable with mouse, touch, keyboard, or gamepad. Each level is a JSON file used three ways: Blender reads it to sculpt the island's terrain, Unity reads it to build the diorama, and a validator reads it to check that every need is reachable and the water budget works.

Many of the details are small, specific pieces of engineering:

- **Rain is physical and cheap.** Each drop is raycast once when it spawns, along the cloud's velocity so a moving cloud rains at a slant, then drawn with GPU instancing. On impact it delivers an exact amount of water, paints a wetness map, adds to the rainbow mist, and plays a note.
- **Wet ground is a texture.** A 256 × 179 render texture over the island stores wetness, which the sun dries, and greenness, which lasts the day. The ground shaders sample it by world position.
- **Shade is a shader.** The cloud's shadow is a global shader vector, so every surface inside it darkens, even the sheep's backs, and gameplay uses the same test.
- **Pip's face is maths.** A signed-distance-field shader blends 13 parameters, including eye openness, brows, mouth curve, blush, and sweat, behind 17 expressions, from drinking to the finale's "ah... ah... CHOO".
- **Tilt-shift that survives a push-in.** When the camera moves closer, the aperture stops down with the square of the zoom, so the miniature blur stays constant.

## How it was made

Pocket Weather was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. Its brief: you're a tiny cloud helping a miniature world through its day, with twelve single-screen dioramas using rain, wind, and shade. The trailer moment: you accidentally soak a wedding, then make a rainbow to save it. The designer called it the strongest fit for touch controls, so input was designed for both mouse and touch from day one. The repository's commit history spans about ten hours on October 4, 2026.

There is no stock art or audio. Every model is generated by a Blender script, and every sound and note of music is synthesized with NumPy and SciPy. The synthesizer also exports each track's tempo and chord timeline, which is how raindrops know which notes to play.

An AutoPilot plays every level through the same input intents as a player and reports finishing time against par, mistakes, and water used. It has expert and hesitant-newcomer modes, and one that hunts for each level's secret delight. Separate self-tests drive the real Input System with virtual keyboard, gamepad, and touch devices, and a web smoke test boots the WebGL build in headless Chrome and plays it with real browser touch events. The trailer is a shot list run by the game on a fixed clock. It was developed with [Claude Code](https://claude.com/claude-code).

## Play it

Version 0.1.0 has all twelve days, the finale and ending, and every input method. [Download it from GitHub releases](https://github.com/nearbycoder/PocketWeather/releases/latest): a desktop build, or a web build to serve over HTTP. Touch and gamepad have only been tested through virtual devices so far.

[Browse the source on GitHub](https://github.com/nearbycoder/PocketWeather). GitHub records the repository's creation on **October 4, 2026**.
