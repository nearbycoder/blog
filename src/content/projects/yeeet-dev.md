---
title: "Yeeet"
summary: "A static-site deployment platform with browser uploads, a CLI, immutable releases, preview channels, and tools for coding agents."
role: "Creator"
year: "2026"
createdAt: "2026-08-13"
stack:
  ["TypeScript", "TanStack Start", "PostgreSQL", "S3", "Better Auth", "Railway"]
link: "https://yeeet.dev"
githubLink: "https://github.com/nearbycoder/yeeet.dev"
image: "/images/projects/yeeet-dev.webp"
imageAlt: "Yeeet's dark homepage with the heading Build it. Yeeet it., a deployment mascot, and a Start yeeeting button."
imageCaption: "The Yeeet homepage, from the project's published repository screenshot."
featured: false
accent: "orange"
draft: false
---

Yeeet publishes already-built static files to HTTPS URLs. You can upload through its web console, deploy a folder from the command line, or use its API and MCP server from automation. The same deployment model supports a quick disposable site, a stable named site, and a repeatable release workflow.

## A release is an immutable version

Each deployment uploads into a unique storage location. Yeeet verifies its manifest before moving the site's active version pointer in a database transaction. An incomplete upload therefore does not replace the working site, and rolling back selects an existing version without rewriting its files.

Clients hash files with SHA-256. When unchanged content is already available in an eligible deployment belonging to the same account, the platform copies it within storage and only requests uploads for changed content. Immutable version URLs preserve exact builds, while named channels such as staging can move independently of production.

## Browser, terminal, and agent workflows

The console and CLI cover deployment history, promotion, rollback, private sharing, and custom domains. Static builds can include versioned header and redirect rules, and single-page applications can use a fallback for browser refreshes on client-side routes. Password protection and revocable share links support private review.

A GitHub Action adds pull-request previews and cleanup, while the first-party MCP package exposes deployment and release operations to coding agents. The documentation includes an OpenAPI contract and machine-readable entry points. Each site also receives its own deterministic animated Yeeetling mascot and a fallback social card.

## How it is built

The TanStack Start control plane stores site records and version pointers in PostgreSQL. Files live in private S3-compatible storage behind an asset gateway with separate cache behavior for live aliases, immutable versions, and protected responses. Better Auth provides login, and the repository includes the CLI, MCP server, database migrations, documentation, and Railway configuration.

The [hosted platform](https://yeeet.dev) is available, and the MIT-licensed source supports self-hosting. Yeeet serves static output; the framework's build step runs before deployment. Project details, screenshot, and creation date are sourced from [the GitHub repository](https://github.com/nearbycoder/yeeet.dev).
