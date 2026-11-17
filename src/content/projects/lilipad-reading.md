---
title: "LiliPad Reading"
summary: "Gentle read-aloud practice for kids on iPad and iPhone, with six adventures, spoken hints and levels from Pre-K to 5th grade, and no accounts, ads or tracking. This repository is the app's website."
role: "Creator"
createdAt: "2026-10-02"
year: "2026"
stack: ["iOS", "HTML", "CSS", "GitHub Pages"]
link: "https://nearbycoder.github.io/LiliPad-ios/"
githubLink: "https://github.com/nearbycoder/LiliPad-ios"
image: "/images/projects/lilipad-reading.webp"
imageAlt: "The LiliPad Reading share image: the LiliPad Reading logo, the lines “Read aloud. Hop ahead.” and “Gentle reading practice for growing minds.”, Pre-K to 5th grade and iPad & iPhone badges, and a frog reading a book on a lily pad beside a pink water lily."
imageCaption: "The share image from the LiliPad Reading website."
demoVideos:
  - src: "https://nearbycoder.github.io/LiliPad-ios/promo.mp4"
    title: "LiliPad Reading animated tour"
    caption: "The 53-second animated tour from the LiliPad Reading website, set to what the site calls original music. In a phone frame, it shows a word read aloud for a star, a tricky word split into parts, a whole sentence, a scrambled sentence built from word tiles, words that get harder as a reader's age goes up, up to six readers with their buddies, and the privacy promise."
    poster: "/images/projects/lilipad-reading-promo-poster.webp"
featured: false
accent: "emerald"
draft: false
---

LiliPad Reading is read-aloud practice for kids on iPad and iPhone. Children read words, sentences and little stories out loud, and the app listens, cheers them on and offers spoken hints. This repository is the app's website on GitHub Pages: a landing page with an animated tour, a privacy policy and a support page. The app's own source isn't in this public repository.

It shares its name, its frog and its six adventures with [LiliPad](/projects/lilipad), the reading web app whose repository was created the same day. The web app runs open speech models in the browser, and its README says it isn't yet a native iPad app. LiliPad Reading is an app for iPad and iPhone that, according to its privacy policy, listens with Apple's speech recognition on the device and speaks its hints with the voices built into iOS.

## What the site describes

- **Six reading adventures:** Word Hop, Sound Safari, Sight Word Stars, Sentence Pond, Sentence Scramble and Story Trail.
- **Pre-K to 5th grade.** Each reader's age sets the reading level. In Parent corner, a grown-up can change the age or pick a level, and each level keeps its own place.
- **Up to six readers**, each with their own stars, words and places, a name, and a buddy emoji or photo.
- **Help when it's needed.** Spoken hints break tricky words into parts. If a word isn't heard, the support page suggests saying "The word is …" first.
- **Reading without a microphone.** With **Read together** on, a grown-up listens and taps "My grown-up heard it".

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/lilipad-reading-home-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/lilipad-reading-home.webp" alt="The LiliPad Reading landing page: the frog app icon, the headline A little practice. A lot of possibility., the frog on its lily pad, the promo video with a Watch with sound button, and a card listing six reading adventures, Pre-K to 5th grade, up to six readers and Private by design." width="1260" height="2054" loading="lazy" /></picture><figcaption>The landing page.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/lilipad-reading-privacy-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/lilipad-reading-privacy.webp" alt="The LiliPad Reading privacy policy, effective October 2, 2026, with a short-version card and sections on information kept on the device, microphone and speech recognition, children's privacy, third parties, changes and contact." width="1260" height="2780" loading="lazy" /></picture><figcaption>The privacy policy.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/lilipad-reading-support-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/lilipad-reading-support.webp" alt="The LiliPad Reading support page with a Getting started card and common questions about microphone access, reading together, reading levels, the hint voice and syncing." width="1260" height="2325" loading="lazy" /></picture><figcaption>The support page.</figcaption></figure>
</div>

## Privacy

The policy's short version is that the app doesn't collect, store on servers, sell or share any personal information, and has no accounts, advertising, analytics or tracking. Reader profiles, progress and settings stay in the app's private storage on the device. They aren't backed up to a server run by the developer and don't sync between devices. A chosen photo is resized and saved without its location or other metadata.

The microphone is on only while a reading activity is open and listening is turned on, and recordings are never saved. By default, speech is recognized on the device. A grown-up can choose Apple's speech service in Parent corner instead, which sends the audio to Apple to be transcribed.

## LiliPad Math

On October 29, 2026, the site gained privacy and support pages for a second app, LiliPad Math. Players are set up the same way, with a name, an age and a buddy, and the age picks a math level from Pre-K to 5th grade. Answers are tapped on a number pad, or spoken after tapping **Say it**, and the privacy policy makes the same promises. The support page says it also works on an iPhone Duo, filling whichever display is in use and adjusting when the phone is folded, unfolded or rotated.

<figure>
  <picture><source srcset="/images/projects/lilipad-reading-math-support-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/lilipad-reading-math-support.webp" alt="The top of the LiliPad Math support page: the LiliPad Math icon with a frog holding a 1+2=3 slate, a Getting started card about players, math levels, the number pad and Say it, and the first two common questions." width="1260" height="1358" loading="lazy" /></picture>
  <figcaption>The top of the LiliPad Math support page.</figcaption>
</figure>

## How the site is built

The site is plain HTML with one small stylesheet that follows the visitor's light or dark setting. Each page has Open Graph and Twitter card tags and schema.org data, which describe LiliPad Reading as a free educational app for iOS and iPadOS 18 or later, and there's a sitemap. On the landing page the promo plays muted on a loop, with a **Watch with sound** button, and it stays paused for visitors who prefer reduced motion.

The creation date shown here is the GitHub repository's UTC creation date. The share image, promo video and poster come from the website, and the page screenshots were captured from the live site in its light and dark themes.
