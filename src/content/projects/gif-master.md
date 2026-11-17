---
title: "gif-master"
summary: "A GIF search page made with Create React App in 2017. It searches GIPHY, plays each GIF when you hover over it and copies its link when you click, but it needs a GIPHY API key at build time and none is in the repository."
role: "Creator"
createdAt: "2017-10-18"
year: "2017"
stack: ["JavaScript", "React", "Create React App", "styled-components", "GIPHY"]
githubLink: "https://github.com/nearbycoder/gif-master"
image: "/images/projects/gif-master.webp"
imageAlt: "Lines 13 to 31 of src/containers/App/index.js: getGifs calls queryForGifs, which fetches https://api.giphy.com/v1/gifs/search with the REACT_APP_API_KEY environment variable, the query and an offset, logs the result, and stores its data and pagination in state."
imageCaption: "The GIPHY search request in src/containers/App/index.js. The key comes from an environment variable at build time."
featured: false
accent: "fuchsia"
draft: false
---

gif-master is a one-screen GIF search built with React. Type a word and press Enter, and it asks GIPHY's search API for matching GIFs and lays them out in rows. Each GIF stays still until the mouse is over it, and clicking one copies the address of the original GIF to the clipboard. A row of page numbers steps through the results.

The repository is a single commit from October 2017, and it hasn't changed since. The app reads its GIPHY API key from a `REACT_APP_API_KEY` environment variable when it's built, and no key is included, so the screenshot here shows the app before a search.

<figure><img src="/images/projects/gif-master-search.webp" alt="gif-master's whole interface: a single full-width text box containing the word cats, with nothing below it." width="1440" height="180" loading="lazy" /><figcaption>The whole interface before a search, with “cats” typed in. Results go below the box.</figcaption></figure>

## How it works

`App` keeps the query, the results and GIPHY's pagination block in its state. On Enter, the `Search` component passes the text to `queryForGifs`, which calls the search endpoint with the key, the query and an offset, then stores the `data` and `pagination` fields of the response.

Results render as a centered, wrapping list of images 300 pixels wide. Each `GifItem` shows GIPHY's downsized still frame and swaps in the animated downsized version while the mouse is over it. The item is wrapped in react-copy-to-clipboard's `CopyToClipboard`, so a click copies the link to the full-size original.

<figure>
  <picture><source srcset="/images/projects/gif-master-code-item-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/gif-master-code-item.webp" alt="Lines 22 to 41 of src/components/GifItem.js: render wraps a list item in CopyToClipboard with the original GIF's URL, and its img switches between the downsized and downsized_still URLs on mouse enter and leave." width="1440" height="825" loading="lazy" /></picture>
  <figcaption>Hover to play, click to copy, in src/components/GifItem.js.</figcaption>
</figure>

`Pagination` turns the total count into at most eight page numbers, highlights the current page in red, and asks for another page by offset.

## Without a key

Built without a key, the app sends `api_key=undefined`. GIPHY answers 401 Unauthorized with an empty `data` array and no `pagination` block, and `Pagination` then reads `total_count` from `undefined`. That throws while rendering, and React 16 removes the whole page, so pressing Enter leaves a blank screen.

## How it's built

It's React 16.0 on Create React App (react-scripts 1.0.14), with styled-components 2.2 for its few styles and react-copy-to-clipboard 5.0. Dependencies are locked with Yarn. It still installs and builds with Node 8 and Yarn 1.

The creation date shown here is the GitHub repository's UTC creation date. The screenshot was captured by running the project locally from its source without an API key, and the code cards show real source files.
