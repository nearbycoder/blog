---
title: "api-research"
summary: "Notes from April 2016 on the Asana, Wunderlist, FreshBooks, QuickBooks and GitHub APIs, cut down to the endpoints that could be useful to Weekly Roundup. They're published as a docs site built with Marcel Pociot's Whiteboard."
role: "Creator"
createdAt: "2016-04-07"
year: "2016"
stack: ["Whiteboard", "Hexo", "Node.js", "GitHub Pages"]
link: "https://nearbycoder.github.io/api-research/"
githubLink: "https://github.com/nearbycoder/api-research"
image: "/images/projects/api-research.webp"
imageAlt: "The api-research docs site in three columns: a dark sidebar with Whiteboard's yellow Your Logo Here placeholder, a search box, and links for Introduction, Asana API with Authentication and Basic API under it, Wunderlist API, FreshBooks API, QuickBooks API and Github API; a light middle column with Asana's Basic API section, showing the Get Workspaces request and a table of its id, name and is_organization fields; and a dark right column with example JSON responses listing workspaces and projects."
imageCaption: "The Asana section of the live site on GitHub Pages, as generated in April 2016."
featured: false
accent: "amber"
draft: false
---

api-research is a one-page reference covering five APIs. Its introduction calls it "API integration suggestions for Weekly Roundup": the information in each service's own documentation, "consolidated down to endpoints that could be useful to Weekly Roundup." For each service it covers how to authenticate and the few calls that matter, with example requests and responses.

Everything was committed on April 7, 2016, and the generated site on the `gh-pages` branch still serves at [nearbycoder.github.io/api-research](https://nearbycoder.github.io/api-research/).

## The tool and the content

The site is built with [Whiteboard](https://github.com/mpociot/whiteboard), Marcel Pociot's Node.js take on the Slate API documentation tool, which runs on the Hexo static site generator. The repository is a copy of Whiteboard as it was then, not a GitHub fork, so the README, the theme with its three-column layout and search, the scripts and the Apache license are all Whiteboard's. So is the "Your Logo Here" placeholder in the sidebar, which was never replaced.

The original part is the content: the site title, Weekly Roundup API; `source/index.md`, which pulls in one file per service; and the five Markdown files in `source/includes`, about 1,100 lines in all. He also added a `.gitlab-ci.yml` with a `pages` job that runs `npm install` and `npm run-script generate`.

<figure>
  <picture><source srcset="/images/projects/api-research-index-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/api-research-index.webp" alt="Lines 1 to 22 of source/index.md: front matter with the title API Reference, a json language tab, includes for asana, wunderlist, freshbooks, quickbooks and github, and search set to true, then an Introduction heading and a paragraph describing the page as API integration suggestions for Weekly Roundup." width="1440" height="969" loading="lazy" /></picture>
  <figcaption>The index page: the five includes and the introduction. Whiteboard renders everything else.</figcaption>
</figure>

## What the notes cover

- **Asana**: OAuth, with a note that it would work much like an existing Harvest integration and that tokens need an expiry check before each call. Then workspaces, a workspace's projects and a project's tasks, using `opt_fields` to ask for just the fields needed.
- **Wunderlist**: OAuth, then lists, the tasks in a list, and their subtasks.
- **FreshBooks**: two side notes up top, "The API docs at FreshBooks is super sparse" and "xml api only!" Authentication is OAuth 1.0a through three endpoints, and the access token doesn't seem to expire. Then clients, a client's projects and a project's time entries, with the XML requests and responses converted to JSON for the examples.
- **QuickBooks**: OAuth 1.0 through Intuit, where the `realmId` returned to the callback is the company ID to query, and tokens expire after 180 days, so they need an auto-renew strategy. For time tracking one endpoint is enough: a SQL-style query on `TimeActivity`.
- **GitHub**: the OAuth web flow, then the user's organizations, an organization's repositories and issues, and a repository's issues.

<figure>
  <img src="/images/projects/api-research-freshbooks.webp" alt="The FreshBooks API section of the site, with FreshBooks API highlighted in the sidebar. Under the heading are two bold notes, side note: The API docs at FreshBooks is super sparse, and bigger side note: xml api only!, followed by an Authentication section about the OAuth 1.0 flow and its request token URL." width="1440" height="810" loading="lazy" />
  <figcaption>The FreshBooks section opens with its two side notes. From the live site.</figcaption>
</figure>

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from the live site on GitHub Pages, and the code card shows a real source file from the repository.
