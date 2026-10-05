---
title: "Flip Flop Cheer"
summary: "A QWOP-style cheer tumbling game where four controls turn a ragdoll into back tucks, handsprings, combos, and the occasional spectacular flop."
role: "Creator"
genre: "Physics sports"
platforms: ["Web"]
engine: "Three.js + Planck.js"
year: "2026"
createdAt: "2026-10-03T18:45:45Z"
stack: ["JavaScript", "Three.js", "Planck.js", "Vite", "Web Audio API"]
link: "https://flip-flop-cheer.vercel.app"
githubLink: "https://github.com/nearbycoder/flip-flop-cheer"
featured: false
accent: "amber"
draft: false
image: "/images/projects/flip-flop-cheer.webp"
imageAlt: "A cheerleader tucks upside down above a blue mat, with a stadium crowd behind her and Q W O P controls below."
imageCaption: "Mid-back-tuck gameplay, from the Flip Flop Cheer README."
demoVideos:
  - src: "/videos/projects/flip-flop-cheer-demo.mp4"
    title: "Back tucks, handsprings, a stuck landing, and a flop"
    caption: "The README's full-quality, silent gameplay recording: a back tuck, back handsprings, a stuck landing, and a final flop. This is the same demo shown in its animated GIF, recorded with the game's scripted capture mode. Press play to watch."
    poster: "/images/projects/flip-flop-cheer.webp"
---

Flip Flop Cheer turns cheer tumbling into a game of timing. Instead of pressing a button that plays a finished animation, you control a ragdoll's tuck, arch, bend, and jump. Coordinate those movements and a back handspring can become a back tuck. Miss the landing and the run ends with **FLOP!**

The default spring floor provides assistance while learning. The gym floor is the more demanding option, closer to the awkward, independent body control of QWOP. Both take place on a cheer mat in a stadium, where the crowd reacts when a skill lands.

## Stick a landing, then try another

The game recognizes skills from the gymnast's motion, including tucks, pikes, layouts, handsprings, walkovers, front variants, and multiple rotations. Chaining skills builds a combo that multiplies their points. Standing still after landing sticks the finish, adds 50 points, and banks the combo.

Feet and hands can touch the mat safely; contact with another body part ends the run. The summary shows score, completed skills, distance, and whether the attempt set a personal best.

<figure>
  <img src="/images/projects/flip-flop-cheer-flop.webp" alt="The FLOP results screen reports that the gymnast's knees hit the mat, with score, skills, distance, and a Try again button." width="1280" height="720" loading="lazy" />
  <figcaption>A landing that did not quite stick. Restarting puts another attempt a button press away.</figcaption>
</figure>

## A gymnast you can make your own

The character starts in a black-and-gold uniform with white western boots, a braces smile, and long box braids. The braids have their own simulation, so they follow the movement through a flip. Skin, hair, highlights, uniform, trim, boots, and the jersey letter are customizable.

<div class="project-media-gallery">
  <figure><img src="/images/projects/flip-flop-cheer-gymnast.webp" alt="The gymnast wearing the default black-and-gold uniform, with box braids and white boots." width="800" height="800" loading="lazy" /><figcaption>The default uniform and character.</figcaption></figure>
  <figure><img src="/images/projects/flip-flop-cheer-face.webp" alt="Close-up of the character's sculpted face, braces smile, and braided hair." width="800" height="800" loading="lazy" /><figcaption>Face and hair details.</figcaption></figure>
  <figure><img src="/images/projects/flip-flop-cheer-custom.webp" alt="The gymnast customized with a maroon-and-white uniform, an S on the jersey, and brown boots." width="800" height="800" loading="lazy" /><figcaption>A different uniform, letter, and boot color.</figcaption></figure>
</div>

## Four controls, several ways to play

On a keyboard, **Q** tucks, **W** arches, **O** bends, and **P** jumps. A first back tuck starts with **O** to dip, **P + W** to launch, then **Q** to tuck before releasing to open up for the landing. **R** or **Space** restarts, and **H** opens help.

Phones and tablets use large touch buttons that can be held together or reached by sliding a thumb. Controllers support buttons and sticks, with rumble on a fall. The help sheet includes step-by-step recipes for learning the skills.

<div class="project-media-gallery">
  <figure><img src="/images/projects/flip-flop-cheer-phone-help.webp" alt="The mobile how-to-play sheet with descriptions of the four controls and skill recipes." width="720" height="1558" loading="lazy" /><figcaption>Skill recipes on a phone.</figcaption></figure>
  <figure><img src="/images/projects/flip-flop-cheer-phone-play.webp" alt="Portrait phone gameplay showing a back tuck and large Q W O P touch buttons at the bottom." width="720" height="1558" loading="lazy" /><figcaption>Touch controls during a run.</figcaption></figure>
  <figure><img src="/images/projects/flip-flop-cheer-phone-customize.webp" alt="The phone customization sheet for changing the floor, graphics quality, and character appearance." width="720" height="1558" loading="lazy" /><figcaption>Floor, graphics, and appearance settings.</figcaption></figure>
</div>

## How the tumbling works

Planck.js supplies the two-dimensional ragdoll physics and joint motors; Three.js draws the three-dimensional gymnast and stadium. Physics advances at 120 Hz with a cap on work per rendered frame. When the browser falls behind, that cap favors a brief slowdown over an ever-growing backlog.

An adaptive quality controller adjusts resolution and shadows to suit measured frame times. Repeated scenery, including the crowd, uses instancing so many objects can be drawn together. Sound effects are synthesized with Web Audio. Vite builds the game for static hosting.

The repository also includes tools for searching control timings, validating a scripted routine, and capturing media. The demonstration below follows a scripted sequence and uses a simulated clock to produce a smooth recording.

[Play Flip Flop Cheer](https://flip-flop-cheer.vercel.app) or [browse the source and original README media](https://github.com/nearbycoder/flip-flop-cheer). GitHub records the repository's creation on **October 3, 2026**.
