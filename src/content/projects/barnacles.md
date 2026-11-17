---
title: "Barnacles"
summary: "An iOS app for reading barnacl.es, a link aggregator for bootstrapped businesses, built with React Native in May 2017. It came with its own Express API that scraped the site into JSON, and a small npm package for that API."
role: "Creator"
createdAt: "2017-05-18"
year: "2017"
stack:
  [
    "React Native",
    "iOS",
    "JavaScript",
    "React Router",
    "styled-components",
    "Node.js",
    "Express",
    "Cheerio",
    "webpack",
    "Jasmine",
    "Karma",
    "npm",
  ]
githubLink: "https://github.com/nearbycoder/BarnaclesNative"
image: "/images/projects/barnacles.webp"
imageAlt: "The top of the Barnacles app on an iPhone: the iOS status bar, then two stories posted by @pushcx, Having multiple projects is sort of awful from medium.com, tagged business with a score of 5, and How to Overcome the Biggest Challenges to Your Online Business with Patrick McKenzie from indiehackers.com, tagged audio, transcript and business with a score of 4."
imageCaption: "The Top tab on an iPhone, cropped from the screenshot in the BarnaclesNative README."
featured: false
accent: "orange"
draft: false
---

Barnacles is an iOS app for reading barnacl.es, a link aggregator for small, self-funded businesses with the tagline "News for bootstrappers, not VC hackers". The site was based on the code of Lobsters, the tech news site. The app lists the Top, Recent and All stories with their authors, tags and scores, loads more as you scroll, refreshes when you pull down, and opens a story's link when you tap its title.

The app didn't read barnacl.es directly. It was built over a week in May 2017 as three repositories:

- [BarnaclesNative](https://github.com/nearbycoder/BarnaclesNative), the React Native app.
- [BarnaclesApi](https://github.com/nearbycoder/BarnaclesApi), an Express server that scraped the site's pages into JSON for the app.
- [barnacles-scraper](https://github.com/nearbycoder/barnacles-scraper), a small npm package that wraps the API.

None of them has changed since. barnacl.es and the API's host no longer exist, so the app has nothing left to load.

## The app

<figure>
  <img src="/images/projects/barnacles-tabs.webp" alt="Further down the same screen: a story by @pushcx, SaaS landing pages in 2017: Our analysis of 100+ top businesses, from blog.chartmogul.com, tagged marketing, saas and web with a score of 3, the start of a story by @AndyM, and a tab bar with a dark teal Top button and lighter Recent and All buttons." width="1242" height="678" loading="lazy" />
  <figcaption>The bottom of the same README screenshot, with the tab bar. Top is selected.</figcaption>
</figure>

Each tab is a route in React Router v4's `NativeRouter`, and each route renders the same list component with a different endpoint: `/top`, `/recent`, or the front page for All. The tab bar is a row of `NavLink`s, and the one for the current route turns a darker teal.

<figure>
  <picture><source srcset="/images/projects/barnacles-routes-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/barnacles-routes.webp" alt="Lines 18 to 47 of index.ios.js: a NativeRouter holding a Switch with three Routes, where / renders BarnList with the endpoint /top, /recent renders it with /recent and /all renders it with an empty endpoint, followed by a BarnListNavView with NavLinks labeled Top, Recent and All." width="1440" height="1185" loading="lazy" /></picture>
  <figcaption>Three routes, one list component and the tab bar. From index.ios.js in BarnaclesNative.</figcaption>
</figure>

The list fetches the first page of its endpoint from the API and shows a spinner until it arrives. React Native's `ListView` renders the stories through react-native-infinite-scroll-view, which asks for the next page when you reach the bottom, and a `RefreshControl` reloads the first page. The views are styled components from `styled-components/native`: tomato-red titles, teal tag pills, an orange score badge and a few shadows.

The app uses React Native 0.44 with React 16.0.0-alpha.6, and it was only set up for iOS. Its Android entry point is still the template's welcome screen, and the README lists the Android app as a to-do.

## The API

BarnaclesApi is an Express 4 server that fetched barnacl.es pages with `request`, parsed them with Cheerio, and answered with JSON. It has routes for the front page, Top, Recent, a tag's stories, the list of tags, a user's profile and a story's comments, with an optional page number where the site had pages. Links to profiles and comments in the JSON point back at the API itself, using an `API_URL` from a `.env` file. It's written in ES2015 and built with Babel when it's installed, and a Procfile starts it with `npm run serve`.

<figure>
  <picture><source srcset="/images/projects/barnacles-parse-stories-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/barnacles-parse-stories.webp" alt="Lines 8 to 34 of parseStories.js: for each .story_liner element, collect the text of its .tags links, then push a story with the title and URL from .link a, the .score text, the tags, the .domain text, the author from the byline's second link, an authorProfile and commentsUrl built from process.env.API_URL, and a commments field from the comments label." width="1440" height="1077" loading="lazy" /></picture>
  <figcaption>How a story is read out of the page. From src/lib/parseStories.js in BarnaclesApi.</figcaption>
</figure>

With barnacl.es gone, the API can still run against an archived copy of the site. Here it answers its front-page route from the Wayback Machine's copy of barnacl.es from June 3, 2017:

<figure>
  <picture><source srcset="/images/projects/barnacles-api-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/barnacles-api.webp" alt="A terminal running curl against the local API's /1 route piped into jq: it prints 25, then the second story as JSON, with the title How We Built Machine Learning Into the Ladder Planner, a score of 3, a blog.ladder.io URL and domain, the tag marketing, the author stefan, an authorProfile and commentsUrl on 127.0.0.1:5201, and commments set to no comments." width="1440" height="727" loading="lazy" /></picture>
  <figcaption>BarnaclesApi running locally from its source on Node 8. A local stub served the archived front page in place of barnacl.es, and a preloaded shim pointed the server's requests at the stub and moved it from port 5000 to 5201.</figcaption>
</figure>

## The npm package

barnacles-scraper wraps the API in six functions that return promises: `getTopStories`, `getRecentStories`, `getStories`, `getStoriesByFilter`, `getUser` and `getTags`. Each is a node-fetch call to the API's host. webpack 2 and Babel build it into one CommonJS file, and its Jasmine tests run in Chrome through Karma, with coverage from Istanbul. One test file calls the live API and expects 25 stories a page, a user profile and a `web` tag, and the rest check that each method exists. Version 0.1.0 went to npm on May 13, 2017, and it's still listed there, though the API it calls is gone.

The creation date shown here is the GitHub repository's UTC creation date. The app screenshots are crops of the screenshot in the BarnaclesNative README, the terminal capture comes from running BarnaclesApi locally against an archived copy of barnacl.es, and the code cards show the repositories' source files.
