---
title: "Pocket Weather"
summary: "A cozy puzzle game where you play Pip, a tiny cloud who rains, shades, and gusts a miniature world through its day across twelve tilt-shift dioramas, with Encores on a scorcher and a five-step graphics setting."
role: "Creator"
genre: "Cozy puzzle"
platforms: ["Windows", "macOS", "Linux", "Web"]
engine: "Unity 6 (URP)"
year: "2026"
createdAt: "2026-10-04T22:35:04Z"
stack:
  ["Unity 6", "C#", "HLSL", "Blender", "Python", "NumPy", "SciPy", "FFmpeg"]
link: "https://nearbycoder.github.io/PocketWeather/"
githubLink: "https://github.com/nearbycoder/PocketWeather"
download: "https://github.com/nearbycoder/PocketWeather/releases/latest"
featured: false
accent: "sky"
draft: false
image: "/images/games/pocket-weather-rain.webp"
imageAlt: "Pip, a smiling cloud, rains on a flower bed in a tilt-shift diorama."
imageCaption: "Pip watering Rosa's flower bed at Ultra, from the Pocket Weather README."
demoVideos:
  - src: "/videos/games/pocket-weather-trailer.mp4"
    title: "Pocket Weather trailer"
    caption: "The 2:00 trailer, re-recorded at Ultra after twelve rounds of improvements: fires lighting the night, mistake hints, the bouquet's landing ring, Encores, and the settings with the keyboard focus ring. It uses the game's synthesized music, musical raindrops, and sound effects with on-screen captions; there is no narration. Every shot was staged by an in-game script and recorded on a fixed clock, not screen-captured. Re-encoded here at 540p."
    poster: "/images/games/pocket-weather-trailer-poster.webp"
    original: "https://github.com/nearbycoder/PocketWeather/blob/main/docs/media/pocket-weather-trailer.mp4"
---

You're Pip, a tiny cloud helping a miniature world through its day. Rain on thirsty gardens, shade overheated sheep, and puff sailboats home before the sun goes down. But every drop counts, and too much rain fixes one problem by causing another.

Twelve single-screen, tilt-shift dioramas follow one summer in **Pocketvale**: from Rosa's first flower bed, through Tom's becalmed fishing boat, a rainbow picnic, and a night of runaway haystack fires, to their lakeside wedding, where Pip sneezes, soaks the whole party, and has to make a rainbow to save the day.

## One resource, three ways to spend it

Water is everything. Rain spends it, a gust costs a little, and Pip's size, and so the shade it casts, grows with how full it is. Refill by hovering over ponds and the sea, or by catching vapour: morning dew, chimney steam, the steam off a doused fire.

Each day is a small ecosystem of wants. The carrots want rain, but not too much, and each bed shows its just-right band. The sheep want shade, but not rain. The washing wants wind, and definitely not rain. The duck pond you're drinking from has a line the ducks would rather you didn't cross. Meet every need at the same moment and the day is saved. The first time each kind of mistake happens, a hint says how to put it right, and if the sun sets first, the sunset card has a tip for each friend left and a Try again that goes straight back into the day.

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-drink.webp" alt="Pip drinking from a pond." width="1280" height="720" loading="lazy" /><figcaption>Drinking from a pond.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-shade.webp" alt="Pip shading a hot sheep." width="1280" height="720" loading="lazy" /><figcaption>Shade for an overheated sheep.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-rainbow.webp" alt="A rainbow over a picnic." width="1280" height="720" loading="lazy" /><figcaption>A rainbow over the picnic.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-campfire.webp" alt="Raining out a burning haystack at night, its fire lighting the grass and hay around it." width="1280" height="720" loading="lazy" /><figcaption>Campfire Night.</figcaption></figure>
</div>

Rain leaves a sparkling mist behind. Step aside and let the sun shine through it, and a rainbow arcs over the spot. Anyone under it is delighted and forgives being rained on, and some wishes can only be granted that way. Later days change the rules: a night of fires that spread and light everything around them, a regatta with several boats at once, and a heatwave with sunflowers that droop in your shadow. At the wedding, a ring on the ground shows where the bouquet will land, so Pip can catch it.

## Rain that makes music

Hold to rain, or tap to toggle it, and the soil darkens, the grass greens, and sprouts pop into flowers. Each drop that lands plays a note from the current chord of the soundtrack, on a timbre chosen by what it hits: kalimba on leaves, glass on water, glockenspiel on roofs, marimba on soil. Playing well sounds good.

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-wedding.webp" alt="The wedding: Pip catches the bouquet under the rainbow." width="1280" height="720" loading="lazy" /><figcaption>The wedding finale.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-day-saved.webp" alt="The day-saved card with three stamps." width="1280" height="720" loading="lazy" /><figcaption>Three stamps: saved, before par, and a secret delight.</figcaption></figure>
</div>

Each day has three stamps: **Day saved**, **Before par**, and **Delight**, a secret reaction hinted at by a riddle in the pause menu. Once a day is saved, its postcard offers an **Encore**: the same diorama on a scorcher, where the sun crosses the sky in three quarters of the time, the beds dry out as you watch, and Pip sets off half-empty. Saving it earns a fourth stamp.

<div class="project-media-gallery">
  <figure><img src="/images/games/pocket-weather-title.webp" alt="The Pocket Weather title screen over a live diorama." width="1280" height="720" loading="lazy" /><figcaption>Title screen.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-map.webp" alt="Map of Pocketvale with stamps." width="1280" height="720" loading="lazy" /><figcaption>The map of Pocketvale.</figcaption></figure>
  <figure><img src="/images/games/pocket-weather-regatta.webp" alt="The regatta: a sailboat gusted home to its buoy." width="1280" height="720" loading="lazy" /><figcaption>The regatta.</figcaption></figure>
</div>

## Settings and graphics fidelity

Pocket Weather plays with mouse, touch, keyboard, or gamepad, and a visible focus ring shows which menu control the keys or pad will press. **Relaxed days** let the sun take half as long again to cross the sky, and the sunset card offers it after a day's second sunset. There are separate volumes, tilt-shift strength, screen shake, hints, and touch buttons. On a phone, the HUD and menus are drawn larger held sideways, and held upright the interface is rearranged and a closer camera follows Pip.

**Graphics** is a five-step slider. **Auto**, the default, runs High and drops to Low if the GPU can't keep up. Low renders at 75% with AMD FSR upscaling where the build has it, without ambient occlusion or extra lights. High is the full look, with MSAA, ambient occlusion, bokeh depth of field, two shadow cascades and fire light. Ultra renders at 1.5× and downsamples, with four shadow cascades, deeper ambient occlusion, a wetness map twice as fine, more particles, and a second scatter of tufts and wildflowers. On the integrated Radeon it was measured on, a frame took 0.85 to 0.89 ms of GPU time on Low and 2.79 to 2.97 ms on Ultra at 1600×900. The web build starts from a lighter base to keep its download at about 17.7 MB before the title.

## What it's built with

Pocket Weather is a **Unity 6** URP game for desktop and the web. Each level is a JSON file used three ways: Blender reads it to sculpt the island's terrain, Unity reads it to build the diorama, and a validator reads it to check that every need is reachable and the water budget works.

Many of the details are small, specific pieces of engineering:

- **Rain is physical and cheap.** Each drop is raycast once when it spawns, along the cloud's velocity so a moving cloud rains at a slant, then drawn with GPU instancing. On impact it delivers an exact amount of water, paints a wetness map, adds to the rainbow mist, and plays a note.
- **Wet ground is a texture.** A render texture over the island stores wetness, which the sun dries, and greenness, which lasts the day. The ground shaders sample it by world position, and Ultra doubles its resolution for crisper wet edges.
- **Shade is a shader.** The cloud's shadow is a global shader vector, so every surface inside it darkens, even the sheep's backs, and gameplay uses the same test.
- **Pip's face is maths.** A signed-distance-field shader blends 13 parameters, including eye openness, brows, mouth curve, blush, and sweat, behind 17 expressions, from drinking to the finale's "ah... ah... CHOO".
- **Tilt-shift that survives a push-in.** When the camera moves closer, the aperture stops down with the square of the zoom, so the miniature blur stays constant.

## How it was made

Pocket Weather was one of eight games built in parallel from short designer briefs, each by its own AI coding session on one shared machine. Its brief: you're a tiny cloud helping a miniature world through its day, with twelve single-screen dioramas using rain, wind, and shade. The trailer moment: you accidentally soak a wedding, then make a rainbow to save it. The designer called it the strongest fit for touch controls, so input was designed for both mouse and touch from day one.

There is no stock art or audio. Every model is generated by a Blender script, and every sound and note of music is synthesized with NumPy and SciPy. The synthesizer also exports each track's tempo and chord timeline, which is how raindrops know which notes to play.

After launch, the game went through [twelve rounds of improvements](/articles/orchestrating-15-games-with-t3-code/), each run by a fresh AI session and pushed only after its logs were checked. Those rounds found that swipes needed to be twice as long on a phone held upright, cut the web download from 21 MB to about 17.7 MB, and added Encores, relaxed days, phone layouts, mistake hints, the bouquet's landing ring, fire light, the focus ring and the graphics slider. An AutoPilot plays every day through the same input intents as a player, and self-tests drive the real Input System with virtual keyboard (78 checks), gamepad (37) and touch (23) devices, while a UI audit checks eight window shapes down to a phone held upright.

The trailer is a shot list run by the game on a fixed clock, recorded at Ultra. It was developed with [Claude Code](https://claude.com/claude-code).

## Play it

Play it in your browser at [nearbycoder.github.io/PocketWeather](https://nearbycoder.github.io/PocketWeather/). It's the current game as a WebGL build, about 17 MB before the title, with saves kept in the browser and touch controls on phones and tablets.

[Download v0.1.0 from GitHub releases](https://github.com/nearbycoder/PocketWeather/releases/latest) for Linux. That release is the October 4 launch build with all twelve days and the finale, but none of the improvements above; for the current game on the desktop, build it from source with Unity. Touch and gamepad have only been tested through virtual devices so far.

[Browse the source on GitHub](https://github.com/nearbycoder/PocketWeather). GitHub records the repository's creation on **October 4, 2026**.
