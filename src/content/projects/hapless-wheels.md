---
title: "Hapless Wheels"
summary: "A browser physics racer with five unlikely riders, fourteen obstacle courses, and ragdoll crashes that rarely go to plan."
role: "Creator"
year: "2026"
createdAt: "2026-10-03"
stack: ["JavaScript", "Three.js", "Planck.js", "Vite", "Web Audio API"]
link: "https://hapless-wheels.vercel.app"
githubLink: "https://github.com/nearbycoder/hapless-wheels"
featured: false
accent: "amber"
draft: false
image: "/images/projects/hapless-wheels.webp"
imageAlt: "A rider in a rocket-powered wheelchair jumps between rooftops against a pink city skyline."
imageCaption: "Skyscraper Scramble, from the project's gameplay screenshots."
demoVideos:
  - src: "/videos/projects/hapless-wheels-loop.mp4"
    title: "Scooter Sal takes on Loop Mania"
    caption: "A silent gameplay clip from the repository showing the turbo moped tackling a loop-the-loop. Converted from the original GIF; press play to watch."
    poster: "/images/projects/hapless-wheels-loop-poster.webp"
---

Hapless Wheels is a side-scrolling obstacle-course racer inspired by Happy Wheels. Pick a rider, get their vehicle moving, and try to reach the golden finish star without losing the ability to keep going. A clean landing matters more than holding the accelerator down.

The five vehicles change how each course feels: a rocket wheelchair, a self-balancing gyro board, a bicycle with a passenger, a motorized shopping cart, and a turbo moped. Each has its own abilities. The wheelchair can boost across gaps, while the moped trades control for speed.

## Fourteen ways to get into trouble

The levels move from tutorial hills to rooftop jumps, minefields, swinging wrecking balls, factories, and loop-the-loops. Props participate in the physics: glass breaks, bridges can snap, barrels trigger chain reactions, and dominoes knock into whatever is behind them.

Checkpoints make another attempt quick. Best times stay in the browser, and finishing against a level's target time earns a gold, silver, or bronze medal. Settings let players adjust body toughness and the amount of blood and gore, including turning the latter off.

![Character and level selection, with five riders and cards for the game's obstacle courses.](/images/projects/hapless-wheels-level-select.webp)

_The character picker makes each vehicle's speed, control, and toughness visible before a run._

## The physics behind the crashes

Planck.js, a JavaScript version of Box2D, handles the simulation. Each rider is a ten-part ragdoll connected by joints. Motors help those joints hold a riding pose; enough force can break the connections. The game advances physics in fixed steps at 120 Hz, while Three.js draws the scene and follows the rider.

The visual and audio assets are generated in code: canvas supplies textures, and Web Audio synthesizes effects. The project is organized into separate modules for riders, vehicles, level objects, courses, rendering, effects, sound, and input. Vite builds the result into a static site.

## Take a run

[Play Hapless Wheels](https://hapless-wheels.vercel.app). On a keyboard, **W/S** or the up/down arrows control movement, **A/D** or left/right lean the rider, and **Space** activates the primary ability. **Enter** retries from a checkpoint; **R** restarts the course. Gamepad and touch controls are also available.

This is a fan-made homage with original characters, artwork, and levels, unaffiliated with the creators of Happy Wheels. [The public repository](https://github.com/nearbycoder/hapless-wheels) contains the source, controls, and local setup instructions. GitHub records its creation on **October 3, 2026**.
