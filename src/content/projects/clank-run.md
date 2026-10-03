---
title: "Clank"
summary: "A full-stack TypeScript framework that exposes one application's typed actions through a reactive web interface and an authenticated MCP server."
role: "Creator"
year: "2026"
createdAt: "2026-07-16"
stack: ["TypeScript", "Node.js", "SQLite", "TSX", "MCP"]
link: "https://clank.run"
githubLink: "https://github.com/nearbycoder/clank.run"
image: "/images/projects/clank-run.webp"
imageAlt: "Clank Design Studio showing the component catalog, theme selector, and an interactive dialog preview."
imageCaption: "The public Clank Design Studio, built with the framework's own UI primitives."
featured: false
accent: "lime"
draft: false
---

Clank is a TypeScript framework and deployment platform for applications used by both people and agents. A developer defines typed server queries and mutations once. Clank uses those contracts for the browser client, runtime validation, live query updates, and eligible MCP tools.

The human interface is a reactive web application. The agent interface is an authenticated, app-specific MCP server with schemas, scopes, and action metadata. Both operate against the application's own authentication boundary and data model.

## A complete application foundation

The framework combines signals and compiler-powered TSX with server rendering and hydration that preserves existing DOM nodes. Its starter includes registration, sessions, private per-user SQLite data, live synchronization, migrations, and a deployment contract. The UI layer provides headless controls, forms, routing, and accessibility behavior.

Other primitives cover durable jobs, workflow graphs, file buckets, revision history, and typed durable objects. These sit alongside the core query and mutation system, allowing an application to share validation and authorization rules across its interfaces.

## Development through deployment

The `clank` CLI creates applications from templates, runs the local development supervisor, checks configuration, and deploys releases. Deployment builds a checksummed artifact, backs up data, applies migrations, and checks the candidate before activation. The previous release remains available if activation fails.

The framework package has no dependencies, development dependencies, or peer dependencies; its documented runtime baseline is Node.js 22.16 or later. SQLite and platform APIs supply much of the underlying infrastructure. The repository also includes the open-source control plane and optional runner/provider tooling.

## Explore the framework

The [Design Studio](https://design.clank.run) is a working component workshop built with Clank. It lets visitors inspect 39 UI families, switch among ten themes, and try real interaction states. The [documentation](https://docs.clank.run) covers framework concepts, application recipes, authentication, MCP, and operations.

Clank is available as the MIT-licensed `@clank.run/framework` package. Its public examples include CRUD, commerce, booking, dashboard, authentication, and durable counter applications. The screenshot shows the live Design Studio. Technical details and the repository creation date are sourced from [GitHub](https://github.com/nearbycoder/clank.run).
