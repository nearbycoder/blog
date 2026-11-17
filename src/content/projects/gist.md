---
title: "Gist"
summary: "A self-hosted home for code snippets, built on TanStack Start, Prisma and SQLite. Every save becomes a new version you can compare in a Monaco diff, and public gists can be shared, embedded and forked."
role: "Creator"
createdAt: "2025-01-03"
year: "2025"
stack:
  [
    "TypeScript",
    "React 19",
    "TanStack Start",
    "Prisma",
    "SQLite",
    "Better Auth",
    "Monaco Editor",
    "shadcn/ui",
    "Tailwind CSS 4",
    "Vite",
  ]
githubLink: "https://github.com/nearbycoder/gist"
image: "/images/projects/gist.webp"
imageAlt: "A gist called Health check server: a Go badge and 2 versions under the title, buttons for compare, favorite, Share, Fork, Delete and Edit, a Version 2 selector, and the Go source of a small HTTP server in a Monaco editor with line numbers."
imageCaption: "A gist with two versions, running locally from the repository's source with sample gists."
featured: false
accent: "violet"
draft: false
---

Gist is a small, self-hosted take on GitHub Gist. You sign in, write a snippet in a Monaco editor, pick one of twelve languages, and choose whether it's public. Saving never overwrites anything: each save adds a numbered version, and any two versions can be compared side by side. Public gists get a share page, an embeddable view, a raw text endpoint and a generated social image, and other people can fork them into their own accounts.

The repository has 183 commits from January to June 2025. Most of the app was built in January and February. From March on the commits are mostly dependency upgrades, ending with a move to the Vite-based version of TanStack Start in June. The last commit is from June 18, 2025.

## Features

- **Your gists** as cards, with a search over titles and contents, a language filter, and Public only and Favorites only switches, all kept in the URL.
- **Versions.** Creating a gist makes version 1, and every save makes the next one. The editor shows the version number a save will become.
- **Compare.** Pick a version and one to compare it with, and Monaco's diff editor shows them side by side.
- **Favorites, forks and deletes** from each gist's header. A fork copies the latest version into your account, links back to the original, and adds to the original's fork count.
- **Sharing.** A public gist's share page works without signing in. It has the same version picker and compare, an Embed button that copies an iframe snippet, and Fork, which sends visitors who aren't signed in to the login page.
- **Embeds and raw text.** `/gists/:id/embed` is a minimal read-only editor that takes `version` and `theme` parameters, and `/api/gists/:id` returns a public gist's text, or a specific version with `?version=`.
- **Social images.** Share pages set Open Graph and Twitter tags, and `/api/og/:id` draws a 1200 by 630 card with `@vercel/og`.
- **Accounts** with email and password or GitHub sign-in, a settings page for your name and password, and light, dark or automatic themes.
- **Public gists** from every account on one page, with a preview of each and its fork count.
- **Admin pages** where admins change other users' roles, impersonate a user, and browse every gist in a searchable table that filters by user.

The languages are TypeScript, JavaScript, Python, Rust, Go, Java, C#, PHP, Ruby, Swift, SQL and Elixir. In the editor, ⌘S or Ctrl+S runs Monaco's Format Document.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/gist-list-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gist-list.webp" alt="The Gist dashboard: a sidebar with Gists, an Admin section with User Management and Gists Management, and Sample User at the bottom; a Search gists field, an All languages menu, Public only and Favorites only switches and a New Gist button; and seven gist cards such as Health check server, go, 2 versions and Sum a CSV column, python, 2 versions." width="1440" height="560" loading="lazy" /></picture><figcaption>The dashboard, with search and filters.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/gist-diff-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gist-diff.webp" alt="Compare mode on the Health check server gist: Version 2 compared with Version 1 in a side-by-side Monaco diff, with the old http.HandleFunc line marked removed in red and the added time import, ServeMux and http.Server with read and write timeouts marked in green." width="1440" height="900" loading="lazy" /></picture><figcaption>Comparing version 2 with version 1.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/gist-edit-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gist-edit.webp" alt="Editing the Sum a CSV column gist: Title, a Language menu set to Python, a Public switch turned off, and a Content editor with a Python function that totals a CSV column using Decimal. Version 3 is shown above the editor, and an Update Gist button is at the bottom." width="1440" height="900" loading="lazy" /></picture><figcaption>Editing a private gist. Saving it will create version 3.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/gist-fork-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gist-fork.webp" alt="A forked gist called Retry with exponential backoff, TypeScript, 1 version, with the line Forked from Retry with exponential backoff linking to the original, above a TypeScript retry function in the editor." width="1440" height="900" loading="lazy" /></picture><figcaption>A fork of another account's public gist, made with the Fork button.</figcaption></figure>
</div>

## Sharing

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/gist-share-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gist-share.webp" alt="The public share page for Health check server, viewed while signed out: the title, a Go badge, 2 versions, compare, Embed and Fork buttons, a Version 2 selector, and the Go source in a read-only editor." width="1440" height="900" loading="lazy" /></picture><figcaption>The share page, as a visitor who isn't signed in sees it.</figcaption></figure>
  <figure><img src="/images/projects/gist-og.webp" alt="A 1200 by 630 social card on a dark gradient: a shooting star icon next to the name Sample User, the title Health check server in large type, a Go badge and the text 2 versions." width="1200" height="630" loading="lazy" /><figcaption>The card from /api/og/:id. The sample account had no avatar, so for this capture its image was set to the app's own icon.</figcaption></figure>
</div>

The social card draws the author's avatar from their account. Better Auth fills that in from the GitHub profile on a GitHub sign-in, but email accounts don't have one, and for them the route fails with "Image source is not provided."

## How it's built

It's TypeScript on TanStack Start 1.121 with Vite 6 and React 19. Pages load and change data through TanStack Start server functions validated with Zod, and an auth middleware attaches the signed-in user to the private ones. Prisma 6 keeps users, sessions, gists and versions in SQLite. Favorites are a many-to-many relation between users and gists, and a fork points at the gist it came from. Better Auth 1.2 handles email and password accounts, GitHub sign-in, sessions, and the admin plugin's roles and impersonation.

The interface is shadcn/ui on Tailwind CSS 4. The editor and the diff viewer are `@monaco-editor/react` with GitHub light and dark editor themes, and the theme choice is stored in a cookie so the server renders the right one.

`npm start` also runs a worker next to the server, using plainjob, a job queue stored in SQLite. The only job it defines is an example that logs its payload, which the `/api/test` route queues. Inngest and Trigger.dev were each tried for background work earlier in the history and removed.

## State

The ⌘K command palette, added in January 2025, is broken in the latest code. A February 20 change made the server function behind it return the gists together with a total count, but the palette still expects a plain list, so pressing ⌘K replaces the page with an error. The README also lists Markdown preview, but the repository's Markdown component isn't used by any page.

## Running it today

It needs Node 22 or newer. Create a `.env` with `DATABASE_URL` (an absolute `file:` path), `WORKER_DATABASE_URL` (a file path for the queue), `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` and `VITE_BETTER_AUTH_URL` set to the address you'll open. GitHub sign-in also needs `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. The committed `.example.env` still lists the variables from before the move to Better Auth. Then:

```sh
npm install
npx prisma db push
npm run build
npm start
```

Register at `/auth/register`, and `npm run make-admin you@example.com` gives an account the admin role.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source with Node 24, two throwaway accounts and sample gists.
