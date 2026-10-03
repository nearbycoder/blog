---
title: "Rustfire"
summary: "An in-progress Rust implementation of ONCE Campfire, with chat rooms, search, attachments, and an offline importer."
role: "Creator"
year: "2026"
createdAt: "2026-09-27"
stack: ["Rust", "Axum", "Tokio", "SQLite", "WebSockets"]
githubLink: "https://github.com/nearbycoder/rustfire"
featured: false
accent: "orange"
draft: false
image: "/images/projects/rustfire.webp"
imageAlt: "Rustfire repository application icon: colorful strokes forming a flame on a purple background."
imageCaption: "Application icon bundled in the Rustfire repository; this is artwork, not a screenshot of the chat interface."
---

Rustfire is an independent Rust implementation of ONCE Campfire, the self-hosted group chat application. It follows a pinned Campfire revision as its compatibility target and remains in progress: core workflows are implemented, but it is not yet a one-for-one replacement.

The current application includes chat, rooms, search, accounts, bots, attachments, and live browser updates. A separate offline importer can bring data over from a stopped Campfire installation. The repository keeps a detailed compatibility record so implemented behavior and remaining gaps can be reviewed together.

## A self-hosted chat server

Rustfire uses Axum and Tokio for the server, WebSockets for browser communication, and SQLite for persistence. Its local state includes the database, uploaded files, and signing keys. The Docker setup stores that state in a persistent volume and includes the media-processing tools used by the application.

Opening a new installation creates the first administrator. A local source build also needs native image-processing libraries, ffmpeg, and Poppler. The README documents the address, database, upload directory, public origin, and cookie settings needed to run it behind an HTTPS proxy.

The Campfire importer operates on an offline installation and needs the original secret key base to preserve signed identifiers and sessions. Its documented workflow calls for testing the imported copy before replacing a running service.

## Compatibility before broad claims

The repository includes paired compatibility and performance probes against the reference Campfire checkout. Those checks cover specific workloads, including browser-channel traffic, delivery, persistence, and sampled markup. They are useful for measuring particular paths, but do not establish a whole-application speed advantage or full feature parity.

The [compatibility record](https://github.com/nearbycoder/rustfire/blob/master/docs/COMPATIBILITY.md) and [benchmark notes](https://github.com/nearbycoder/rustfire/blob/master/bench/RESULTS.md) describe those boundaries in more detail.

Rustfire is MIT-licensed and retains notices for the Campfire, Trix, and Surfguard material included in the repository. It is not affiliated with or endorsed by 37signals. The image above is the repository's application icon; no Rustfire-specific demonstration screenshot or video was available in the repository at the time this page was added.

The [GitHub repository](https://github.com/nearbycoder/rustfire) was [created](https://api.github.com/repos/nearbycoder/rustfire) on September 27, 2026 (UTC).
