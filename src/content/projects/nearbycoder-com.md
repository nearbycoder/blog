---
title: "nearbycoder.com"
summary: "This site: Josh Hamilton's writing, projects, games and build logs, built with Astro and styled as an Art Deco tower in Tulsa. It also has a browser desktop with a window manager, 30 apps, an arcade and DOOM."
role: "Creator"
createdAt: "2021-03-16"
year: "2021"
stack:
  [
    "Astro",
    "TypeScript",
    "Tailwind CSS 4",
    "React 19",
    "sharp",
    "Playwright",
    "Resend",
    "Vercel",
    "Cloudflare R2",
    "WebAssembly",
    "WebSockets",
    "node-pty",
  ]
link: "https://nearbycoder.com"
githubLink: "https://github.com/nearbycoder/blog"
image: "/images/projects/nearbycoder-com.webp"
imageAlt: "The nearbycoder.com home page in its light theme: a header with an elevator dial and numbered Read, Workshop and About menus, a plaque reading The Nearby Building beside Est. 2013, Tulsa, Oklahoma, the headline Always curious. Still building. in tall condensed capitals with the second line in striped terracotta, Explore the writing and Browse projects buttons, and a portrait of Josh in an octagonal gilt medallion with a ring of rays."
imageCaption: "The home page in the light theme, captured from nearbycoder.com."
featured: false
accent: "amber"
draft: false
---

nearbycoder.com is Josh Hamilton's personal site, and this repository is its source, including this page. It holds articles, projects, games, a weekly build log started after a layoff, and postmortems. The site is laid out as a building: three floors called Read, Workshop and About, with the home page as the lobby.

Today it's a static Astro 7 site with Tailwind CSS 4, deployed on Vercel. The repository dates from March 2021, and the site has been rebuilt several times since: it ran on Gatsby, then Next.js, and since February 2026, Astro.

## The Nearby Building

The current theme, from November 2026, treats the site as an Art Deco tower in Tulsa, Oklahoma, borrowing from the city's Deco architecture and from Route 66. The light theme is daylight on a limestone facade, with terracotta, jade and gilt on warm paper. The dark theme is the same building at night, with its neon lit: a midnight indigo sky, rose and teal neon, and bulb gold.

Each section is a floor with its own color. Read is terracotta (rose at night), Workshop is jade (teal at night), and About is brass. An elevator dial in the header points at the floor you're on, and the home page puts a dial above each of its three elevator doors.

<figure>
  <picture><source srcset="/images/projects/nearbycoder-com-floors-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/nearbycoder-com-floors.webp" alt="The home page's Three ways in section: cards for Read, Workshop and About, each under a sunburst and an elevator dial pointing at floor 01, 02 or 03, with a short description, live counts (29 stories, 56 topics and 3 reading paths; 37 projects, 23 games, 9 build logs and 3 postmortems; Now updated Oct 13, 2026) and links such as Start here, Layoff Log, Lab, Uses and Follow along." width="1184" height="820" loading="lazy" /></picture>
  <figcaption>"Three ways in" on the home page, one door per floor, with live counts as of November 2026. Captured from nearbycoder.com; it follows this site's light or dark theme.</figcaption>
</figure>

The fonts are self-hosted through Fontsource: Big Shoulders Display for the tall signage headings, Newsreader for reading, Jost for the interface, Limelight for the wordmark and plate numbers, and JetBrains Mono for code. The ornament is CSS: sunburst rays made with repeating conic gradients, plates with stepped setback corners, double gilt rules, triple speed lines and octagonal medallions.

A few pieces carry the theme. By day the hero headline is inlaid with streamline stripes, and at night it's a neon sign that flickers on once. The latest article is "Now showing" on a theater marquee whose bulbs chase. The work history is a setback tower with one floor per job, a spire and a blinking beacon, and the footer is the lobby's directory board. All of the motion turns off when reduced motion is preferred.

## What's inside

The content lives in Astro content collections: articles, projects, games, the layoff log and postmortems, each a folder of Markdown files with a typed schema. Projects and games share one shape, and games add a genre, platforms and an engine. Two data modules hold the site's navigation and work timeline, and the `/uses` page.

Around that, the site has a command palette (Cmd+K or Ctrl+K), light, dark and system themes, RSS, a Lab of small interactive experiments, and technology pages that group projects by what they're built with. A run of reading features landed in September 2026: reading paths, full-text search with excerpts, a topic directory, private reading lists and notes kept in the browser, a focus mode, a print edition, Markdown downloads and citations.

<figure>
  <img src="/images/projects/nearbycoder-com-games.webp" alt="The Games archive in the light theme: cards for Jeste and Lost & Found, each with a screenshot in a gilt frame of sunburst rays, the date Oct 4, 2026, its genre and platforms, a one-line description, technology tags such as Godot, GDScript, Unity 6 and Blender, and links to the game page, Play and Source." width="1280" height="770" loading="lazy" />
  <figcaption>The Games archive, captured from nearbycoder.com. Each game sits in a gilt vitrine with its platforms, stack and links.</figcaption>
</figure>

## The desktop

[`/desktop`](/desktop/) is the building's penthouse: an experimental browser desktop for exploring the same content. The shell is inspired by CachyOS and KDE Plasma, with a panel, an application launcher (Ctrl+Esc), desktop icons, and windows you can move, resize, snap to halves and quarters, and minimize. The Library is a file manager over everything on the site, and opening a file shows the real page in a reader window.

The launcher has 30 apps, from Notes, Tasks and a Markdown editor to a step sequencer, Sudoku, Reversi and Conway's Game of Life. Workspaces adds up to eight virtual desktops, and Tile mode arranges windows in Niri-style scrolling columns built on [Trellis](https://trellisui.com/) panels. Layouts and app data are saved in the browser, with backups and restores in a Data Center app. There's no account and no sync.

<figure>
  <picture><source srcset="/images/projects/nearbycoder-com-desktop-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/nearbycoder-com-desktop.webp" alt="The /desktop workspace: octagonal icons for Articles, Projects, Lab, About & more, Arcade, Ghostty and Notes down the left, a Library file manager listing projects such as Axolotl, Clank and Couch Potato beside a Places sidebar, an Arcade window with DOOM selected, a Play DOOM button and a game list of Memory, Bug Sweep, Snake, Pong and 15 Puzzle, a Deco skyline wallpaper with a Penthouse plaque, and a panel with a clock along the bottom." width="1440" height="900" loading="lazy" /></picture>
  <figcaption>The Library and the Arcade, with DOOM selected but not started. Captured from nearbycoder.com in the light and dark themes.</figcaption>
</figure>

The Arcade has Memory, Bug Sweep (an 8×8 board hiding ten bugs), Snake, Pong and a 15 puzzle, plus DOOM: the original v1.9 shareware Episode One in js-dos 8.4.1, whose emulator loads from jsDelivr only after you press Play. There are two terminals. One is a pretend shell that never runs anything but knows a few jokes (try `sudo make coffee`). The other, Ghostty, is a real terminal built on [Ghostty Web](https://github.com/coder/ghostty-web), a WebAssembly port of Ghostty's engine, with tabs and split panes. Its panes connect over authenticated WebSockets to a separate bridge in `services/terminal` that runs real PTYs with node-pty. No bridge is configured by default, so you'd connect it to one you run yourself.

Each app loads only when it's opened. Playwright tests hold the bundles to byte budgets: one each for the home page, an article and the desktop shell, and 24 KiB for each app.

## Social cards

Every route gets a 1200 × 630 PNG social card at build time, made with astro-opengraph-images and a custom renderer. The renderer describes each card as React elements, which Satori turns into an image: the night edition of the building, with a midnight sky, a gold sunburst, a stepped gilt frame, the Limelight wordmark, a floor plaque and the title in Big Shoulders. The right panel holds an article's art, a game's screenshot, a project's cover in a gilt vitrine, the portrait medallion on the home and About pages, or the tower. Cards render four pages at a time to keep build memory down, and sharp then palette-compresses them, about 70% smaller by the config's own note.

<div class="project-media-gallery">
  <figure><img src="/images/projects/nearbycoder-com-card-home.webp" alt="The home page's social card: a midnight-blue panel with the Nearbycoder wordmark, a plaque reading The Lobby, Tulsa, Oklahoma, the headline Always curious. Still building. in glowing capitals, a gold rule over Josh Hamilton and nearbycoder.com, and on the right a portrait of Josh in an octagonal gilt frame against gold rays." width="1200" height="630" loading="lazy" /><figcaption>The home page's card.</figcaption></figure>
  <figure><img src="/images/projects/nearbycoder-com-card-project.webp" alt="Murmur's social card: the Nearbycoder wordmark, a plaque reading Floor 02, Workshop, Projects, the title Murmur and the start of its summary, a gold rule over Josh Hamilton and nearbycoder.com, and on the right Murmur's banner in a gilt frame against gold rays." width="1200" height="630" loading="lazy" /><figcaption>A project card, with the cover in a vitrine. Both cards were rendered with the site's own card renderer, fonts and Satori setup.</figcaption></figure>
</div>

## Newsletter, media and tests

New posts go out by email. Three Vercel Functions in `api/` run the newsletter on Resend: a signup that sends a confirmation email, a confirmation step that needs a click on the page (opening the link alone doesn't subscribe anyone), and a daily cron at 14:00 UTC that sends up to three new posts. Videos aren't deployed with the site. They're served from a Cloudflare R2 bucket at `media.nerb.dev`.

`npm run verify` runs Astro's type checks, a production build, and 70 Playwright spec files against the built site. They cover every route, the desktop and each of its apps, the games, the newsletter flow, axe accessibility checks in both themes, and the bundle budgets.

## History

The repository was created on March 16, 2021, the date of the first post, "New Beginnings". The Wayback Machine's capture of nearbycoder.com from later that month shows that version: "Nearbycoder Blog", generated by Gatsby 3.0.1, with a newsletter signup under the posts. Two of those posts, "Building a Subscription Feature" and "Twitter Share Feature", are still on the site. The week before, two starters went up on GitHub unmodified: [example-blog](https://github.com/nearbycoder/example-blog), Gatsby's blog starter, and [sanity-gatsby-blog](https://github.com/nearbycoder/sanity-gatsby-blog), Sanity's Gatsby blog template.

The early commits are no longer on any branch. The oldest one that can still be traced on GitHub is a fresh "initial commit" from November 28, 2022: a Next.js 13 site with React 18, Tailwind CSS 3 and MDX articles, started from a Tailwind UI template, with About, Articles, Projects, Speaking and Uses pages and an RSS feed. It gained a sitemap and, in January 2023, a command bar from [Qikbar](/projects/qikbar). Its last commit is from June 2024.

On February 1, 2026, a commit titled "redo" started over with Astro 5.17 and Tailwind CSS 4.1, carrying over seven articles and five projects, and the main branch begins there. The layoff log followed two weeks later. Since then the site has been redesigned six times: a brutalist look in April, a "signal archive" restyle and a riso print one in July, an editorial redesign in September, a topographic field survey at the end of September, and the Nearby Building in November. The desktop arrived in September and the Games section in October.

<div class="project-media-gallery">
  <figure><img src="/images/projects/nearbycoder-com-2021.webp" alt="nearbycoder.com in March 2021: the title Nearbycoder Blog in purple inside a tilted outline, a byline reading Written by Josh Hamilton, Senior Software Engineer @ FireHydrant.io beside an empty dark circle where the profile picture belongs, and tilted cards for the posts Twitter Share Feature (March 28, 2021), Building a Subscription Feature (March 22, 2021) and New Beginnings (March 16, 2021)." width="980" height="980" loading="lazy" /><figcaption>March 2021, the Gatsby version, as archived by the Wayback Machine on March 29, 2021. The profile picture doesn't load in the archived copy.</figcaption></figure>
  <figure><img src="/images/projects/nearbycoder-com-2024.webp" alt="The 2024 Projects page: a round avatar, a pill-shaped menu with About, Articles, Projects and Uses, the heading Things I've made trying to put my dent in the universe., and entries for Qikbar, Math Game and Secret Santa Pair with icons, one-line descriptions and links to qikbar.com, math.nrby.xyz and santa.nrby.xyz." width="1280" height="730" loading="lazy" /><figcaption>June 2024, the Next.js version, running locally from that commit with its analytics script blocked.</figcaption></figure>
  <figure><img src="/images/projects/nearbycoder-com-2026-redo.webp" alt="The February 2026 redo in a dark theme: a header with the Nearbycoder name and About, Articles, Projects and Uses links, tags reading Staff Engineer, Calm Under Fire and Curious Builder, the headline Staff software engineer, loving husband, and amateur gamer., Read the latest and View projects buttons, and a panel of glassy tiles labeled Focus, Practice, Signal, Speed and Teams." width="1280" height="800" loading="lazy" /><figcaption>February 2026, the first Astro version, running locally from the "redo" commit.</figcaption></figure>
</div>

Other personal sites have their own pages: [nearbycoder.tk](/projects/nearbycoder-tk), an AngularJS portfolio from 2015, and an [Astro Blog](/projects/astro-blog) starter deployed to GitHub Pages in 2024. [jhamilton.design](/projects/jhamilton-design), a one-page Remix site from 2022, is another small site from the same years.

## Running it

The site needs Node 24. `npm install` and `npm run dev` start the dev server on port 4321. `npm run verify` runs the checks, the build and the tests, after `npx playwright install chromium`. The [README](https://github.com/nearbycoder/blog) and the `docs/` folder cover the theme, the desktop, the terminal bridge and the newsletter setup.

The creation date shown here is the GitHub repository's UTC creation date. The current screenshots were captured from nearbycoder.com, the social cards were rendered with the site's own card renderer, the March 2021 view comes from the Wayback Machine, and the 2024 and February 2026 views were captured by running those commits locally.
