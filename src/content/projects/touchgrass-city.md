---
title: "TouchGrass.city"
summary: "A realtime multiplayer browser game about collecting grass, grabbing powerups, and avoiding computer enemies across a scrolling city."
role: "Creator"
year: "2026"
createdAt: "2026-02-20"
stack:
  [
    "TypeScript",
    "React",
    "TanStack Start",
    "WebSockets",
    "PostgreSQL",
    "Drizzle",
  ]
link: "https://touchgrass.city"
githubLink: "https://github.com/nearbycoder/touchgrass.city"
image: "/images/projects/touchgrass-city.webp"
imageAlt: "The TouchGrass.city signup screen with display name, email, password, and a choice of player colors."
imageCaption: "The game's account and player-color screen, from the repository's published screenshot."
featured: false
accent: "emerald"
draft: false
---

TouchGrass.city turns “touch grass” into a multiplayer browser game. Players create an account, choose a color, and move through a shared city collecting grass for points. Roaming computer enemies patrol their territories, chase nearby players, and reset a player's score on contact.

## Collect, move, and avoid the computers

The world is larger than the viewport, with a camera that follows the player across a scrolling map. The shared game protocol defines a 10,000 by 10,000 world, including streets, buildings, grass, powerups, enemies, and other players.

Three powerups change the collection loop: speed increases movement, magnet pulls grass toward the player, and double points increases the reward. Keyboard controls support desktop play, while a touch joystick supports mobile input. An in-game leaderboard shows player standings, and an FPS counter exposes rendering performance during play.

## Realtime state and persistent profiles

The application uses React and TanStack Start for its interface and routing. A CrossWS WebSocket endpoint carries movement and color-change messages from clients and sends world snapshots back to players. Shared TypeScript types describe those messages and the objects that make up each snapshot.

The server maintains the active world and connected players in memory. PostgreSQL stores player scores and saved colors through Drizzle, while Better Auth supplies email/password accounts. This separates the frequently changing multiplayer state from the profile and score records that need to persist between sessions.

## Project status and source

The [public site](https://touchgrass.city) provides the account screen for entering the game. The repository contains the game client, WebSocket server, database schema and migrations, and instructions for running it with Bun and PostgreSQL or deploying it on Railway.

The image above is the project's published signup screenshot, including its player-color picker. Gameplay capabilities are documented in the README and shared game/server code. These details and the repository creation date come from [the public source repository](https://github.com/nearbycoder/touchgrass.city).
