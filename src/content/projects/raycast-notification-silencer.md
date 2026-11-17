---
title: "Notification Silencer"
summary: "A Raycast extension with one command, Clear Notifications, that closes everything in the macOS Notification Center. It's a short AppleScript that walks Notification Center's interface and presses Close or Clear All, matched in eleven languages."
role: "Creator"
createdAt: "2025-02-07"
year: "2025"
stack: ["TypeScript", "Raycast", "AppleScript"]
githubLink: "https://github.com/nearbycoder/raycast-notification-silencer"
image: "/images/projects/raycast-notification-silencer.webp"
imageAlt: "Lines 7 to 25 of src/clear-notifications.ts, highlighted as AppleScript: a macOS 15 Sequoia comment, a closeActionSet property listing Close and Clear All in English, German, Spanish, Chinese, French, Russian, Arabic, Portuguese, Japanese, Hindi and Polish, and a closeNotification handler that asks System Events for an element's actions and performs the first one whose description is in that set."
imageCaption: "The close-button phrases and the handler that presses them, from src/clear-notifications.ts."
featured: false
accent: "slate"
draft: false
---

Notification Silencer is a [Raycast](https://www.raycast.com/) extension with a single command, Clear Notifications. Run it and it closes every notification in the macOS Notification Center, then shows a "Notifications cleared" HUD. It's a `no-view` command, so no window opens.

The whole extension is one TypeScript file that hands an AppleScript to `runAppleScript` from `@raycast/utils`. The repository has two commits from February 2025, and a comment in the script names macOS 15 Sequoia. The README's install steps point to the Raycast Store, but the extension isn't there: nearbycoder's Raycast profile has no published extensions.

## How it works

The script uses System Events to script the interface of the NotificationCenter process. If the process or its "Notification Center" window isn't there, it logs that and stops. Otherwise it searches the window's elements depth first, and for each one it asks for the element's actions and performs the first whose description is in its list of close phrases. The list holds "Close" and "Clear All" in eleven languages: English, German, Spanish, Chinese, French, Russian, Arabic, Portuguese, Japanese, Hindi and Polish.

<figure>
  <picture><source srcset="/images/projects/raycast-notification-silencer-walk-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/raycast-notification-silencer-walk.webp" alt="Lines 27 to 46 of src/clear-notifications.ts: a searchAndCloseNotifications handler that, inside a System Events tell block, first recurses into each of the element's UI elements and returns true if any of them closed a notification, then tries closeNotification on the element itself, and returns false otherwise." width="1440" height="825" loading="lazy" /></picture>
  <figcaption>The depth-first search, children before the element itself.</figcaption>
</figure>

Each pass performs one close action. The main loop then waits 0.1 seconds and searches again, until a pass finds nothing to close or an error ends the loop. Back in TypeScript, the command shows its HUD once the script returns. Because the script only logs the cases where Notification Center or its window is missing, the HUD appears in those cases too.

<figure>
  <picture><source srcset="/images/projects/raycast-notification-silencer-loop-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/raycast-notification-silencer-loop.webp" alt="Lines 56 to 85 of src/clear-notifications.ts: inside tell process NotificationCenter, a check that logs and returns if the Notification Center window doesn't exist, then a repeat loop that exits when searchAndCloseNotifications closes nothing, delays 0.1 seconds between passes, and logs and exits on an error, followed by the end of the AppleScript string and await showHUD with Notifications cleared." width="1440" height="1185" loading="lazy" /></picture>
  <figcaption>The main loop and the HUD, at the end of the file.</figcaption>
</figure>

## Running it

Since it isn't in the Store, you'd load it from the repository with Raycast's developer tools on a Mac: `npm install`, then `npm run dev`, which runs `ray develop`. It still compiles with `@raycast/api` 1.91 (`npm run build`), but the command itself only works on macOS.

The creation date shown here is the GitHub repository's UTC creation date. The images are code cards of the extension's only source file, `src/clear-notifications.ts`, with the embedded script highlighted as AppleScript.
