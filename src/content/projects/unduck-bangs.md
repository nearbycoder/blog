---
title: "Unduck.link Search Directory"
summary: "A searchable directory of the DuckDuckGo !bang shortcuts you can use through Unduck, built with React, TanStack Virtual and Tailwind. It renders only the cards near the screen, which keeps a list of thousands of bangs on one scrolling page."
role: "Creator"
createdAt: "2025-02-15"
year: "2025"
stack: ["TypeScript", "React", "TanStack Virtual", "Tailwind CSS", "Vite"]
githubLink: "https://github.com/nearbycoder/unduck-bangs"
image: "/images/projects/unduck-bangs.webp"
imageAlt: "The Unduck.link Search Directory in light mode: the title, a search field reading Search by name, domain, or shortcut, the hint use with https://unduck.link/?q=%s, category chips from Online Services to Translation plus Popular, and a three-column grid of cards for Google !g, YouTube !yt, Wikipedia !w, DuckDuckGo Images !image, Google Maps !gm, Reddit !r and more, each with a favicon, domain and category."
imageCaption: "Running locally from the repository's source. The original data endpoint is gone, so DuckDuckGo's current bang list is served locally in the shape the app expects."
featured: false
accent: "orange"
draft: false
---

[Unduck](https://unduck.link/) is a page you set as your browser's search engine to use DuckDuckGo's `!bang` shortcuts, like `!w` for Wikipedia, without waiting on DuckDuckGo's own redirects. This directory is a companion for finding the bang you want. It lists every shortcut with its site, domain and category, and shows the URL to add to your browser, `https://unduck.link/?q=%s`.

It was written on February 15, 2025, with one more commit on March 3 that sorted the list by rank. It loaded its data from an endpoint on Deno Deploy that no longer answers, so a copy built today shows no bangs until you give it the data another way.

## Features

- **Search** across site names, domains and shortcuts, with or without the leading `!`.
- **Category chips** built from the data, plus Popular, which shows only the one-letter bangs.
- **Ranked order.** Cards are sorted by the rank field in DuckDuckGo's data, which puts `!g`, `!yt` and `!w` first.
- **Favicons** from Google's favicon service, with a globe icon when one doesn't load.
- **Shareable filters.** The search and category are kept in the URL as `?q=` and `?category=`.
- **Light and dark themes** that follow the system until you use the toggle, which is then remembered in local storage.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/unduck-bangs-search-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/unduck-bangs-search.webp" alt="The directory filtered by the search !gh: cards for GitHub !gh, Google HK !ghk, Geizhals !ghde, GitHub Code !ghc, GitHub Repo !ghrepo, Github (code search) !ghcode, Ghacks !ghacks and other bangs that start with gh." width="1440" height="900" loading="lazy" /></picture><figcaption>Searching for !gh matches every bang that starts with gh.</figcaption></figure>
  <figure><img src="/images/projects/unduck-bangs-dark-mode.webp" alt="The directory in dark mode with the Popular chip selected, showing one-letter bangs: Google !g, Wikipedia !w, Reddit !r, Amazon.com !a, Google Maps !m, DuckDuckGo Images !i, startpage.com !s, Bing !b, eBay !e, X !x, The Free Dictionary !d and Yahoo! !y." width="1440" height="900" loading="lazy" /><figcaption>Popular, in dark mode: only the one-letter bangs.</figcaption></figure>
</div>

## How it works

It's a single React 18 component in TypeScript, built with Vite 5 and styled with Tailwind CSS 3. The grid is virtualized in both directions with TanStack Virtual's `useWindowVirtualizer`: one virtualizer for rows and one for columns, with columns up to 500 pixels wide and 160-pixel rows, so only the cards near the viewport are in the page. Filtering runs over the whole list on each keystroke.

<figure>
  <picture><source srcset="/images/projects/unduck-bangs-virtual-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/unduck-bangs-virtual.webp" alt="Lines 57 to 72 of src/App.tsx: rowCount is the filtered list's length divided by the column count, rounded up; a rowVirtualizer from useWindowVirtualizer with that count, an estimated row height, overscan 5 and a scroll margin from the list's offsetTop; and a horizontal columnVirtualizer with the column count, an estimated column width, overscan 2 and a scroll margin from offsetLeft." width="1440" height="681" loading="lazy" /></picture>
  <figcaption>Two window virtualizers, one per axis, in src/App.tsx.</figcaption>
</figure>

## Running it today

It still builds and runs with Node 20 (`npm run dev`), but the data URL in `src/App.tsx` is gone. DuckDuckGo publishes the same list at `https://duckduckgo.com/bang.js` in the shape `src/types.ts` describes, and the app expects it wrapped as `{ "data": [...] }`.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source, with the dead endpoint's requests answered locally by DuckDuckGo's current bang list, and the code card shows a real file from the repository.
