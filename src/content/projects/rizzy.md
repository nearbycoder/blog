---
title: "Rizzy"
summary: "An experimental, source-available Rust implementation of Fizzy's board and card workflows."
role: "Creator"
year: "2026"
createdAt: "2026-09-27"
stack: ["Rust", "Axum", "Tokio", "SQLite", "SQLx"]
githubLink: "https://github.com/nearbycoder/rizzy"
featured: false
accent: "sky"
draft: false
image: "/images/projects/rizzy.webp"
imageAlt: "Rizzy visual-baseline board with a central Maybe column, two idea cards, and collapsed neighboring columns."
imageCaption: "Rizzy board screenshot from the repository's visual baselines, using test content."
---

Rizzy is an experimental Rust implementation of Fizzy, using Fizzy's routes, API documentation, schema, and controller tests as a behavioral reference. It is an independent project, with a pinned upstream revision and a public parity tracker.

The current application supports many core board and card workflows. It is still a work in progress and is not a production-ready or one-for-one Fizzy replacement.

## Boards, cards, and the surrounding workflow

Rizzy includes browser interfaces and JSON routes for boards, columns, and cards. Cards support comments, assignments, tags, steps, reactions, watches, pins, and completion. Boards include drag and drop, filtering, lazy card loading, and public sharing.

The surrounding account work includes cookie sessions, API tokens, email-code sign-in, passkeys, membership controls, and private-board access checks. Search uses SQLite FTS5 over visible card and comment text. Uploaded images, files, avatars, and rich-text attachments have their own storage and access paths.

![Rizzy card page showing a title, rich-text description, checklist steps, and stage controls.](/images/projects/rizzy-card.webp)

_A card view from the repository's visual comparison fixtures._

## Implementation and current limits

The server uses Rust, Axum, Tokio, and SQLx with SQLite in WAL mode. Its work includes account import and export, activity timelines, notifications, and durable delivery queues for webhooks and browser push.

Coverage varies across those features. Live push delivery remains unverified, and full UI behavior, notification handling, account transfers, and other upstream workflows still have gaps. The [parity tracker](https://github.com/nearbycoder/rizzy/blob/master/PARITY.md) records what has been checked. Benchmark results apply to specific tested workflows, rather than demonstrating a product-wide performance advantage.

## Source available

Rizzy is public under Fizzy's **O'Saasy License**. Its restriction on directly competing hosted services means this is a source-available project, **not OSI open source**. The repository retains the required license notice and separate third-party asset notices. Rizzy is not affiliated with 37signals.

[The README](https://github.com/nearbycoder/rizzy) covers local setup, current functionality, and licensing. The repository's [GitHub creation date](https://api.github.com/repos/nearbycoder/rizzy) is September 27, 2026 (UTC).
