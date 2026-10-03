---
title: "Geo Wars: Neon Evolved"
summary: "A neon twin-stick browser shooter with five game modes, evolving weapons, a reactive grid, and a soundtrack synthesized as you play."
role: "Creator"
year: "2026"
createdAt: "2026-10-03"
stack: ["JavaScript", "Three.js", "WebGL", "Web Audio API"]
link: "https://geowars-bice.vercel.app"
githubLink: "https://github.com/nearbycoder/geowars"
featured: false
accent: "cyan"
draft: false
image: "/images/projects/geowars.webp"
imageAlt: "Green neon enemies surround the player on a blue grid, with bright explosions and a score multiplier at the top."
imageCaption: "Evolved mode in action, from the project's gameplay screenshots."
demoVideos:
  - src: "/videos/projects/geowars-gameplay.mp4"
    title: "Neon enemies, explosions, and a moving grid"
    caption: "A silent gameplay clip from the repository showing the ship firing through enemy swarms as the arena grid reacts. Converted from the original GIF; press play to watch."
    poster: "/images/projects/geowars-gameplay-poster.webp"
---

Geo Wars: Neon Evolved is a Geometry Wars–inspired arcade shooter that runs in the browser. Movement and aiming are independent: steer away from danger with one set of controls while firing in another direction. The arena quickly fills with enemies, pickups, and explosions, so finding a safe route matters as much as landing shots.

Destroyed enemies leave green pickups called geoms. Collecting them increases the score multiplier and upgrades the weapon from a twin stream to wider spreads. Dying resets that progress. A bomb can clear a crowded screen, but the enemies it removes award no points.

## Five different rhythms

**Evolved** is an endless survival run with lives and bombs. **Deadline** gives the player three minutes and unlimited lives to build a score. **Waves** sends walls of bouncing rockets across the arena, making the gaps between them the important part.

The other two modes change when shooting is possible. **Pacifism** removes guns entirely: passing through the middle of a gate detonates nearby enemies, while touching its ends is fatal. **King** allows firing only from temporary safe zones that drain and eventually collapse.

High scores are saved separately for each mode in the browser. Keyboard and mouse, twin-stick gamepads, and touch controls all work; on a phone, floating controls let each thumb choose its own starting position.

## An arena that reacts

The grid is a spring-and-mass simulation rather than a static backdrop. Bullets and explosions disturb it, and black holes pull it into visible gravity wells. Those black holes also affect the player, enemies, bullets, and pickups, so the effect changes the game as well as its appearance.

![A bright black hole pulls the purple arena grid into a gravity well while neon enemies approach.](/images/projects/geowars-black-hole.webp)

_Black holes bend the grid and draw nearby objects toward their center._

Three.js renders the scene, with bloom, particles, screen shake, and brief slow-motion effects emphasizing the action. Web Audio generates both the sound effects and an adaptive synthwave soundtrack. The game can reduce rendering resolution when performance drops, and it pauses when the player switches browser tabs.

## One file, ready to play

The interface, rendering, game rules, enemy behavior, input, and audio all live in one `index.html`, divided into commented sections. There is no build step. Three.js and the font load from public CDNs, so an internet connection is needed on first load.

[Play Geo Wars](https://geowars-bice.vercel.app). Use **WASD** to move, aim with the mouse, hold the left button to fire, and press **Space** for a bomb. The arrow keys can also aim and fire. Gamepads use the left stick for movement and the right stick for shooting.

This is a fan-made homage with original code, visuals, and audio, unaffiliated with Bizarre Creations or Activision. [The public repository](https://github.com/nearbycoder/geowars) includes the full source and game rules. GitHub records its creation on **October 3, 2026**.
