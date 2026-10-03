---
title: "codex-grab"
summary: "A development toolkit that pins Codex prompt widgets to React components, keeping selection, edits, and streamed status next to the UI."
role: "Creator"
createdAt: "2026-03-06"
year: "2026"
stack: ["TypeScript", "React", "WebSockets", "IndexedDB", "Vite", "Codex CLI"]
githubLink: "https://github.com/nearbycoder/codex-grab"
image: "/images/projects/codex-grab.webp"
imageAlt: "The codex-grab React demo with a prompt widget pinned beside a selected component."
imageCaption: "The local React demo with a selected component and an unsent prompt. The coding bridge is disconnected for this capture."
demoVideos:
  - src: "/videos/projects/codex-grab.webm"
    title: "Select a component and draft an edit"
    caption: "Silent local demo: open the picker, select the Route A CTA, and draft a prompt in its pinned widget. The coding bridge is disconnected, so no edit is submitted or generated."
    poster: "/images/projects/codex-grab.webp"
featured: false
accent: "cyan"
draft: false
---

codex-grab connects a running React interface to a local coding workflow. Select a component in the browser, describe the change in a small widget beside it, and follow the edit's progress without losing sight of the element you meant.

## A prompt with a location

The floating picker selects React-owned elements and captures component context. Each selection gets its own pinned widget, with an independent prompt, session, model choice, and status. A screenshot of the selected region can provide additional visual context.

While a turn runs, a widget can collapse into a compact status chip. Expanding it reveals the plan, command output, diffs, and approval requests. Approved changes appear through the application's existing hot-reload or Fast Refresh flow.

Widgets are aware of the current route. A widget can disappear when you leave its page and return when you come back, after checking that the stored selector still identifies the same component. IndexedDB stores widgets and turn history locally in the browser.

## Three pieces

- **Core** handles DOM selection, React context capture, serialization, and shared message types.
- **React** supplies the provider, overlay, widgets, and hooks used by the application.
- **Bridge** runs a localhost WebSocket sidecar that manages Codex's app-server and streams events back to the browser.

The public npm packages are `@codex-grab/core`, `@codex-grab/react`, and `@codex-grab/bridge`. The repository also includes a routed Vite demo for exploring selection and persistence.

## Development scope

This is an MIT-licensed development tool. It requires a compatible Codex CLI and an authenticated session for live edits, and the overlay is intended to be enabled only during development. The capture on this page demonstrates the browser selection interface; it does not imply that an edit was sent or completed.

See the [repository README](https://github.com/nearbycoder/codex-grab) for installation and bridge configuration. The creation date shown here is the GitHub repository's UTC creation date.
