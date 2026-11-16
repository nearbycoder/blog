---
title: "Ventriloquist"
summary: "A native Mac app for trying open voice models side by side: text to speech, voice cloning, voice conversion and spoken conversation, all running on your Mac, with every take's speed and memory beside it."
role: "Creator"
createdAt: "2026-11-11"
year: "2026"
stack:
  [
    "Rust",
    "Rune",
    "Python",
    "MLX",
    "mlx-audio",
    "mlx-lm",
    "PyTorch",
    "uv",
    "Hugging Face",
    "Sparkle",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/Ventriloquist/"
githubLink: "https://github.com/nearbycoder/Ventriloquist"
image: "/images/projects/ventriloquist.webp"
imageAlt: "Ventriloquist in dark mode: a sidebar of text-to-speech models from Kokoro to LFM3 Audio TTS, Kokoro selected with its line about a puppet, a Compare 12 button, and takes from Kitten TTS 2 and ZONOS3 Mini with waveforms, time to make, speed against real time and peak memory."
imageCaption: "The bench, with takes from several models. The screenshot from the Ventriloquist site."
featured: false
accent: "amber"
draft: false
---

Ventriloquist is a bench for speech models that run on your own Mac. Type a line or record a clip, pick a model, and hear what comes out, along with how long it took. **Compare** runs every installed model of that kind on the same input, one after another, so you can hear the differences and see the timings side by side.

It covers four kinds of model: text to speech, voice cloning, voice conversion and spoken conversation. Everything runs locally. Your text, recordings and generated audio stay on the Mac, and the network is only used to download models and check for updates. It's free and open source under the MIT license, and it needs a Mac with Apple silicon.

## Nothing is bundled

The app itself is a few megabytes. A new install opens on the **Models** page, which lists every model with its size, publisher, release date and license. Download the ones you want to try and the sidebar shows only those. **Remove** deletes a model's weights again, along with its Python environment once no other model needs it. Downloading everything comes to about 130 GB, so the site suggests starting small: Kokoro is 0.7 GB.

<figure>
  <picture><source srcset="/images/projects/ventriloquist-models-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/ventriloquist-models.webp" alt="The Ventriloquist Models page: 3 of 23 downloaded, 8.2 GB, a Download all 19 button, and cards for Kokoro, Phonon 31M, ZONOS3 Mini, Kitten TTS 2, Ming 3.0 TTS, Fish Drama 3 and its 8-bit build, and Breeze TTS 2, each with its size and a Download or Remove button." width="1280" height="869" loading="lazy" /></picture>
  <figcaption>The Models page. Each model is downloaded from its publisher only when you ask for it.</figcaption>
</figure>

The models were chosen in November 2026 for open weights, no Hugging Face gate, and a real path on Apple silicon, through MLX or PyTorch on Metal. Each one was installed and run before it was listed, and its output transcribed back to check the words. The README lists them all with their release date, license, size and how quickly each one works on the same eight-second line once it's loaded. A few examples:

| Kind             | Model                     | Size    | What it does                                            |
| ---------------- | ------------------------- | ------- | ------------------------------------------------------- |
| Text to speech   | Kokoro 82M                | 0.7 GB  | 54 voices in 9 languages, no cloning, 0.17 s for 8 s    |
| Text to speech   | ZONOS3 Mini               | 2.9 GB  | 27 voices, cloning, steering by named controls          |
| Text to speech   | Fish Drama 3              | 23.8 GB | Acts the line, cloning, inline cues                     |
| Voice conversion | Seed-VC                   | 4.5 GB  | Diffusion; keeps the performance best                   |
| Voice conversion | OpenVoice v2              | 0.3 GB  | Moves timbre only, nearly instant                       |
| Conversation     | Sophon Realtime 32B Flash | 22.6 GB | Hears tone as well as words, answers with laughs, sighs |
| Conversation     | LFM2.5 Audio 1.5B         | 2.4 GB  | Turn-based, and calls tools                             |

Licenses differ, and the app marks them before you download. Breeze TTS 2 is for research and non-commercial use only, and Fish Drama 3, Kitten TTS 2, LFM3 and LFM2.5 allow commercial use only below a revenue threshold. The README also lists the models that were left out and why: non-commercial, gated, CUDA only, or no file-in, file-out path.

## Voices, cloning and conversion

Models with voices of their own have a voice button that opens the full list, with search once the list is long. The play button on each voice reads a short line in that voice's own language. The first listen has the model make it, and after that it plays from disk.

A **voice sample** or **speech** slot takes a dropped file, a chosen file or a recording. Cloning models take a few seconds of a voice to imitate. Conversion models keep the words and timing of a recording and change who is saying them. Each take shows its waveform, how long it took, its speed against real time, its load time when it had to load, and its peak memory. The icons on a take hand it to the next run as the voice sample or as the speech to convert.

<div class="project-media-gallery">
  <figure><img src="/images/projects/ventriloquist-voices.webp" alt="Kitten TTS 2 selected in dark mode, with its voice list open: a Search 115 voices field and English voices Alfred, Bella, Bruno (checked), Claire, Dante, Diana, Dolores and Edith, each with a short description and a play button." width="1280" height="869" loading="lazy" /><figcaption>Kitten TTS 2's 115 voices, each with a preview.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/ventriloquist-convert-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/ventriloquist-convert.webp" alt="The Voice conversion page for Seed-VC, marked GPL-3.0 and Copyleft, with interview.wav as the speech to convert, an eight-second recording as the voice to speak in, a Convert button, and one take that took 2.4 s to make at 5.8× real time and 4.6 GB peak." width="1280" height="869" loading="lazy" /></picture><figcaption>Seed-VC re-voicing a 14-second interview.</figcaption></figure>
</div>

## Conversation and tool calls

The conversation models take a spoken question and answer out loud. Sophon Realtime 32B Flash was published for vLLM-Omni on NVIDIA GPUs and had no Apple silicon runtime, so the one in Ventriloquist is a port written for the app. Its 32B language model is converted once at install to a 4-bit MLX model, its audio encoder runs in PyTorch as published so the model hears the recording rather than a transcript, and its reply is spoken by its own voice stage. The encoder was checked against the reference implementation on the same audio. What isn't ported is the live session around the model: one recording goes in and one reply comes out.

LFM2.5 Audio can call tools: a clock, a calculator, dice, a coin and the battery level. The published model wasn't trained to call tools from speech, so the app leads it through a call in steps, each using the same model. It transcribes the recording, offers each tool alone and reads off the model's own probability of calling it, writes the arguments, runs the tool, answers from the result and reads that answer aloud. On 34 test recordings it called the right tool for all 18 requests, and called one unasked in 1 of 16 ordinary questions. The tools run locally and change nothing.

<figure>
  <picture><source srcset="/images/projects/ventriloquist-tools-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/ventriloquist-tools.webp" alt="The Conversation page for LFM2.5 Audio, with a three-second recording and takes showing roll_dice(sides=20) returning 14 on a 20-sided die with the answer “The twenty-sided die rolled a number of 14.”, and calculate(expression=“1234 * 56”) returning 69,104." width="1280" height="869" loading="lazy" /></picture>
  <figcaption>Each take shows the tool LFM2.5 Audio called and what came back.</figcaption>
</figure>

## Enhance and Scene

**Enhance** has a small local language model, Gemma 4 E4B through mlx-lm, mark up your line for the selected voice model. It punctuates for delivery, spells out numbers and dates, and adds only the expression marks that model understands, like `[joyful]` and `<sigh>` for Kitten or `[sighs]`-style cues for Fish Drama 3. **Revert** puts your line back. Standing instructions, such as "make everything sound tired and sarcastic" or "translate into Spanish", apply to every line and are kept between launches.

**Scene** writes dialogue from a description: who's talking, where, and what happens, in short, medium or long. For Fish Drama 3, which can voice up to four characters in one take, each line is marked with its speaker.

<div class="project-media-gallery">
  <figure><img src="/images/projects/ventriloquist-enhanced.webp" alt="Kitten TTS 2 in dark mode with an enhanced line: “[excited] We won the grant! &lt;gasp&gt; I can hardly believe it. Two point five million dollars. I told you (((never))) to doubt us!” and a Revert button beside Enhance, Instructions and Scene." width="1280" height="869" loading="lazy" /><figcaption>A line marked up by Enhance for Kitten TTS 2.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/ventriloquist-scene-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/ventriloquist-scene.webp" alt="The Write a scene popover over Fish Drama 3, describing a couple in the car after he misses the exit again, with Short selected and a Write dialogue button, above lines marked speaker 0 and speaker 1." width="1280" height="869" loading="lazy" /></picture><figcaption>Scene writing dialogue for two speakers.</figcaption></figure>
</div>

## How it's built

The window is [Rune](https://github.com/anomalyco/rune), a GPU-rendered Rust UI with no web view. The models run in Python workers that the app starts on demand and keeps warm, so the second run of a model measures the model and not its start-up. **Unload** in the toolbar quits them and frees the memory. Workers talk to the app over JSON lines on stdin and stdout.

Most text-to-speech models run through [mlx-audio](https://github.com/Blaizzy/mlx-audio). There are six Python environments because the libraries don't agree on versions, each built with [uv](https://docs.astral.sh/uv/). Weights go to the shared Hugging Face cache. The Python sidecar files are compiled into the binary and written out at launch, so the app is one file, and no model weights are in the repository or the app.

Every screen renders headless with the same renderer as the window, which is how the screenshots, the app icon and the installer's background are made. Releases are signed with a Developer ID and notarized by Apple, and installed copies update themselves through [Sparkle](https://sparkle-project.org), checking the feed on GitHub Pages once a day.

## Try it

Download `Ventriloquist.dmg` from the [website](https://nearbycoder.github.io/Ventriloquist/) or the [latest release](https://github.com/nearbycoder/Ventriloquist/releases/latest), and drag the app to Applications. You'll need a Mac with Apple silicon, plus [uv](https://docs.astral.sh/uv/) (`brew install uv`) and git to set up model environments. Small models run in a few gigabytes of memory, and the largest want far more. The [repository](https://github.com/nearbycoder/Ventriloquist) covers building from source with `scripts/bundle --install`, trying models from the terminal, and adding a new one to the catalog. The [changelog](https://github.com/nearbycoder/Ventriloquist/blob/main/CHANGELOG.md) has each release's notes.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from the Ventriloquist README and website. Where the site has both light and dark versions, they follow this site's theme.
