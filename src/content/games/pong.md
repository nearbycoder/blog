---
title: "Pong"
summary: "A browser arcade game with a CPU opponent, increasingly fast rallies, synthesized sound, and four visual themes."
role: "Creator"
genre: "Arcade"
platforms: ["Web"]
engine: "HTML5 Canvas"
createdAt: "2026-02-01T21:24:03Z"
year: "2026"
stack: ["JavaScript", "HTML5 Canvas", "Web Audio API", "CSS"]
link: "https://pong.nearbylabs.dev"
githubLink: "https://github.com/nearbycoder/pong"
image: "/images/projects/pong.webp"
imageAlt: "Pong's black-and-white court with two paddles, a center ball, and a 0–0 score."
imageCaption: "The retro theme, from the project's repository screenshots."
featured: false
accent: "lime"
draft: false
---

Pong brings the familiar two-paddle arcade game to the browser with a computer opponent and a small, readable implementation. There is no account or installation step: open the game and start a match.

## How it plays

You control the left paddle; the CPU controls the right. The first player to reach 11 points wins. Each paddle hit makes the ball faster, and where it touches the paddle changes the return angle. A long rally becomes a test of positioning as well as reaction time.

The game supports the arrow keys or W/S, mouse movement, and touch dragging on mobile. Its four themes—Retro, Modern, Neon, and Light—change the look of the court without changing the rules. The screenshot above shows the default black-and-white Retro theme.

## Inside the game

The project uses HTML, CSS, and vanilla JavaScript. Canvas draws the court, paddles, ball, and score, while a `requestAnimationFrame` loop advances the simulation. The CPU predicts the ball's path with a reaction delay and an error margin, giving it a beatable opponent's behavior.

Paddle hits, wall bounces, and scoring sounds are synthesized with the Web Audio API. There are no external sound files to download. The repository separates the page, styling, and game engine, making the physics and difficulty settings easy to inspect.

## Play or explore

[Play Pong](https://pong.nearbylabs.dev) for a quick match, or inspect the [source and documented controls](https://github.com/nearbycoder/pong). The README describes the project as MIT licensed. The creation date on this page is the repository's GitHub creation date in UTC.
