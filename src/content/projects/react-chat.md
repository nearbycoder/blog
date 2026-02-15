---
title: "React Chat"
summary: "Real-time ephemeral chat with room-based presence, slash commands, private messages, GIFs, and syntax-highlighted code sharing."
role: "Creator"
year: "Ongoing"
stack: ["React 19", "TypeScript", "TanStack Start", "Tailwind CSS 4", "WebSockets", "Nitro", "Shiki"]
impact: "Built a full-stack realtime chat system with reconnecting WebSockets, room-scoped presence, command-driven UX, and ephemeral in-memory state."
link: "http://chat.nrby.xyz/"
githubLink: "https://github.com/nearbycoder/react.chat"
featured: false
accent: "mist"
---

React Chat is a full-stack realtime chat app built around one core constraint: no accounts and no permanent message storage. You open a room, chat instantly, and everything is intentionally ephemeral.

## Why I built it

I wanted to rebuild a classic internet chat experience with modern frontend architecture and a cleaner product loop:

- join fast
- message fast
- share richer content than plain text
- keep operational complexity low

## Product experience shipped

- Room-based chat (`/chat/:room`) with simple room naming and direct-link sharing
- Optional nickname on join, with local persistence for quick re-entry
- Presence-aware sidebar that shows active users in the current room
- Command-driven UX with autocomplete and keyboard-first flow
- Private messages via `/pm @user message`
- GIF sharing through `/giphy query` (GIPHY API integration)
- Message color customization via `/color`
- Theme switching via picker and `/theme <theme-id>`
- Message utilities like `/list`, `/clear`, and `/help`
- Syntax-highlighted code blocks from fenced input (```language) or `!code`
- Unread-awareness behavior in the browser tab title/favicon

## Technical architecture

- **Client transport:** persistent WebSocket connection to `/ws` with automatic reconnect on disconnect
- **Room state model:** in-memory room manager using peer maps for users and room membership
- **Realtime fanout:** room channels (`room:<name>`) for broadcast plus per-user channels (`pm:<peerId>`) for direct messages
- **Presence lifecycle:** explicit join/leave handling with sorted user list updates and empty-room cleanup
- **Command parsing layer:** typed command parsing for chat/system actions before message dispatch
- **Code rendering:** Shiki-backed syntax highlighting for code messages with theme-aware output

## Reliability and deployment notes

- Automatic reconnect loop keeps conversations resilient through transient network loss
- Color and nickname settings persist locally for continuity across refreshes
- Backend remains lightweight by design because room/message state is process-memory only
- Railway-ready deployment flow with optional `GIPHY_API_KEY` for GIF support

## Product tradeoffs

React Chat optimizes for speed and immediacy over permanence. That tradeoff keeps the experience lightweight and low-friction, while still supporting richer interaction patterns like private messaging, code sharing, and live user presence.
