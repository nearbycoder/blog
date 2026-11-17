---
title: "medium-scraper"
summary: "A small Node.js library on npm that scraped a Medium user's latest posts into a list of titles, dates, images and links. Medium's markup has since changed, so today it finds nothing."
role: "Creator"
createdAt: "2017-02-03"
year: "2017"
stack: ["JavaScript", "Node.js", "Cheerio", "npm"]
link: "https://www.npmjs.com/package/medium-scraper"
githubLink: "https://github.com/nearbycoder/medium-scraper"
image: "/images/projects/medium-scraper.webp"
imageAlt: "Lines 5 to 25 of index.js: getPosts returns a Promise that requests https://medium.com/ plus the user plus /latest, loads the HTML with cheerio, and turns each .streamItem--postPreview element into a title, a time, an image URL on cdn-images-1.medium.com and a read-more URL, then sets posts.success to true and resolves."
imageCaption: "The core of index.js, the library's only source file."
featured: false
accent: "green"
draft: false
---

medium-scraper is a small Node.js library that reads a Medium user's latest posts by scraping their profile. You give `getPosts` a username, and it returns a promise of posts, each with a title, a date, a header image URL and a link. It was written and published to npm on February 3, 2017, and hasn't changed since.

## How it works

The whole library is `index.js`, 29 lines. It requests `https://medium.com/<user>/latest` with `request`, loads the HTML into Cheerio, and walks the `.streamItem--postPreview` elements in Medium's markup of the time. The title comes from the post's leading paragraph, the date from its `<time>` element, and the image from the first picture's `data-image-id`, turned into a `cdn-images-1.medium.com` URL. The link is the post's "read more" link, without its query string.

The README's example asks for `@nearbycoder` and shows the eight posts it returned, from January to July 2016, most of them from the Made By Munsters publication on Medium. Only the two newest had header images, so the others come back with `image: null`.

## Running it today

<figure>
  <picture><source srcset="/images/projects/medium-scraper-run-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/medium-scraper-run.webp" alt="A terminal in the medium-scraper folder running node -v && node example.js, which prints v6.17.1 and then [ success: true ]." width="1030" height="292" loading="lazy" /></picture>
  <figcaption>The repository's example.js, run on Node 6.17.1 in November 2026.</figcaption>
</figure>

On Node 6 the example still runs without errors. Medium redirects `/@nearbycoder/latest` to the profile page and answers with a 200, and the posts are still in that page, but none of the elements carry the class names the scraper looks for. So `getPosts` resolves an empty array. The `success: true` in the output is a property the library sets on the array.

The package is still on npm at version 0.0.21. Versions 0.0.1, 0.0.2 and 0.0.21 were all published within about 12 minutes of each other. The code is the same in all three, and 0.0.2 added the README.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the repository's example locally on Node 6.17.1, and the code card shows the repository's index.js.
