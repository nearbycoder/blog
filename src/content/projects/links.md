---
title: "Link Manager"
summary: "A self-hosted bookmark manager with categories, tags, favorites and a command palette, built on TanStack Start, Prisma and SQLite. A Raycast extension in the same repository searches and edits your links through the app's API."
role: "Creator"
createdAt: "2025-09-10"
year: "2025"
stack:
  [
    "TypeScript",
    "React 19",
    "TanStack Start",
    "Prisma",
    "SQLite",
    "Better Auth",
    "shadcn/ui",
    "Tailwind CSS 4",
    "Vite",
    "Raycast",
  ]
githubLink: "https://github.com/nearbycoder/links"
image: "/images/projects/links.webp"
imageAlt: "Link Manager's Links page in grid view: a search field with All Categories and All Tags filters, an Add Link button, and cards for Google Fonts, Lucide, Tailwind CSS, Ars Technica, Hacker News and Prisma, each with a favicon, domain, description, colored category and tag badges, and when it was added."
imageCaption: "The Links page in grid view, running locally from the repository's source with sample bookmarks."
featured: false
accent: "blue"
draft: false
---

Link Manager is a small web app for keeping bookmarks. Each link has a title, a URL, an optional description, one category and any number of tags, and can be marked as a favorite. Accounts use an email and password, and every account sees only its own links, categories and tags. The repository is called `links`, and its README is still the default one from the TanStack starter.

Most of it was written in three days in September 2025: the data model, the interface, dark mode, API keys and a [Raycast](https://www.raycast.com/) extension. A second round of commits in October prepared a production build, turned off rate limiting for API keys, and gave the extension delete and incognito actions. The last commit is from October 23, 2025.

## What it does

- **Home** puts your favorites at the top, then lists every category as a collapsible group with a link count. Both sections have their own filter box.
- **Links** shows every bookmark as a grid of cards or as a table, and remembers which one you picked. The search, category, tag and favorites filters live in the page's URL.
- **Categories and tags** each have a name and a color, which every link's badges use. Categories also get a description.
- **A command palette** opens with ⌘K or Ctrl+K. It searches all your links by title, URL, description, category or tag, jumps to Home, Links, Categories or Tags, and creates links, categories and tags.
- **Favicons.** Adding a link saves the site's `/favicon.ico` address, and a plain link icon stands in when it doesn't load.
- **API keys** for programmatic access, each with a name, an expiry from one day to three years, and an optional prefix, permissions and metadata.
- **Light and dark themes**, following the system by default, with a toggle in the header.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/links-home-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/links-home.webp" alt="Link Manager's home page: Your Favorite Links lists Lucide, Hacker News, GitHub and MDN Web Docs with their domains, descriptions, category and tag badges and a 15 minutes ago timestamp. Below it, Links by Category shows Design with 3 links collapsed and Development expanded to show Prisma and TanStack." width="1440" height="900" loading="lazy" /></picture><figcaption>Home: favorites first, then links grouped by category.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/links-list-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/links-list.webp" alt="The Links page in list view: a table with Title, Description, Category, Tags, Added and Actions columns, listing Google Fonts, Lucide, Tailwind CSS, Ars Technica, Hacker News, Prisma, TanStack and GitHub with favicons and colored category and tag badges." width="1440" height="900" loading="lazy" /></picture><figcaption>The same links as a table.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/links-search-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/links-search.webp" alt="The command palette open over the Links page with the query news, showing two results, Ars Technica and Hacker News, each with its URL, description, a News category and a 1 tag count." width="1440" height="900" loading="lazy" /></picture><figcaption>The command palette, searching for "news" across titles, descriptions, categories and tags.</figcaption></figure>
</div>

## The Raycast extension

`raycast/links` holds a Raycast extension with four commands: Links, Create Link, Create Category and Create Tag. It asks for an API key in its preferences and sends it in an `x-api-key` header. Better Auth's API key plugin turns that key into a session, so the extension calls the same `/api/links`, `/api/categories` and `/api/tags` routes as the web app, with no separate API.

<figure>
  <picture><source srcset="/images/projects/links-api-keys-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/links-api-keys.webp" alt="The API Keys page, Manage your API keys for programmatic access, with a Create API Key button and one key named Raycast: Active, a masked key with a copy button, Expires in 30 days, and Remaining Unlimited." width="1440" height="430" loading="lazy" /></picture>
  <figcaption>A key for the extension, created on the local copy.</figcaption>
</figure>

The Links command lists your bookmarks with their favicon, description, category and date, searches as you type, and filters by category from a dropdown. Each result opens in the browser, opens in a Chrome incognito window with ⌘I, edits in a form with ⌘E, or deletes with ⌘D. The incognito action shells out to macOS's `open` command.

<figure>
  <picture><source srcset="/images/projects/links-raycast-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/links-raycast.webp" alt="Lines 94 to 121 of raycast/links/src/links.tsx: an ActionPanel with Action.OpenInBrowser, an Open in Incognito Window action on Command-I that runs open -na Google Chrome --args --incognito with the URL through execa, an Edit Link action on Command-E that pushes EditLinkForm, and a destructive Delete Link action on Command-D that sends DELETE to /api/links/ and the link's id, then revalidates." width="1440" height="1113" loading="lazy" /></picture>
  <figcaption>The actions on each result, from raycast/links/src/links.tsx.</figcaption>
</figure>

## How it's built

It's TypeScript on TanStack Start 1.131 with Vite 6 and React 19. TanStack Query fetches the data, React Hook Form and Zod 4 handle the forms, and the interface is shadcn/ui components on Tailwind CSS 4. Prisma 6 stores everything in a SQLite file. Better Auth 1.3, through its Prisma adapter, handles accounts, sessions and API keys. [Gist](/projects/gist), from earlier in 2025, is built on much the same stack.

The JSON API is a set of TanStack Start server routes under `/api` for links, categories and tags. Each handler reads the session, scopes its query to the signed-in user, and checks that any category or tags on a link belong to that user too. A production build runs as a Node server from `.output/server/index.mjs`.

## Running it today

There's no hosted copy to try: the server address hard-coded in the extension no longer answers. It does run locally. With Node 24, copy `.env.example` to `.env`, set `BETTER_AUTH_SECRET`, set `BETTER_AUTH_URL` to the address you'll open it at, and make `DATABASE_URL` an absolute `file:` path to `prisma/dev.db`. With the example's relative `file:./dev.db`, the built server opens an empty database and fails with "The table `main.user` does not exist." Then:

```sh
npm install
npx prisma migrate deploy
npm run build
npm start
```

Sign up at `/auth/sign-up` and start adding links. The extension's server address is the `BASE_URL` constant in `raycast/links/constants/index.ts`, so using it with your own copy means editing that file.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source with sample bookmarks and a throwaway account, and the code card shows a real file from the repository.
