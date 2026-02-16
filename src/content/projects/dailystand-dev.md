---
title: "dailystand.dev"
summary: "Open-source, self-hostable async standup platform for teams with analytics, API keys, a public REST API, and MCP support."
role: "Creator"
year: "Ongoing"
stack:
  [
    "TanStack Start",
    "TypeScript",
    "tRPC",
    "Drizzle ORM",
    "PostgreSQL",
    "Better Auth",
    "Tailwind CSS v4",
    "Bun",
  ]
impact: "Built a production-ready team standup platform with organization/team management, analytics exports, API keys, MCP tooling, and optional billing/observability integrations."
link: "https://dailystand.dev"
githubLink: "https://github.com/nearbycoder/dailystand.dev"
featured: true
accent: "cyan"
---

DailyStand is an open-source, self-hostable async standup app for modern teams.

## What it is

- Team standups with `completed`, `planned`, and `blockers` updates
- Multi-team submission modes for shared or per-team updates
- Team and personal history with markdown export flows
- Analytics dashboard with drilldowns and CSV/markdown export
- API keys plus public REST API endpoints
- MCP server endpoint for AI workflows using API key auth
- Optional plan-based billing and usage limits

## Tools it uses

- TanStack Start + TanStack Router/Query
- TypeScript + tRPC
- Drizzle ORM + PostgreSQL
- Better Auth (org/auth/API key/Stripe plugins)
- Tailwind CSS v4
- Bun (runtime/package manager)
- Vitest + Playwright
- Optional integrations: Stripe, Sentry, PostHog, React Email, Resend
