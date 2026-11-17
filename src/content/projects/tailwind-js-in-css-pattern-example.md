---
title: "tailwind-js-in-css-pattern-example"
summary: "A Create React App example from January 2019 that copies Tailwind's default colors, text sizes and spacing into an Emotion theme, so components can use Tailwind's names, such as red-light and 5xl, as styled-system props."
role: "Creator"
createdAt: "2019-01-14"
year: "2019"
stack: ["JavaScript", "React", "Create React App", "Emotion", "styled-system"]
githubLink: "https://github.com/nearbycoder/tailwind-js-in-css-pattern-example"
image: "/images/projects/tailwind-js-in-css-pattern-example.webp"
imageAlt: "All 23 lines of src/App.js: an Emotion JSX pragma, imports of jsx from @emotion/core, styled from @emotion/styled/macro, Component from react, and space, fontSize and color from styled-system; a Box made with styled.div that applies space, fontSize and color; and an App class that renders a Box with m 4, color red-light and fontSize 5xl around the word test."
imageCaption: "The whole app, src/App.js."
featured: false
accent: "red"
draft: false
---

tailwind-js-in-css-pattern-example uses Tailwind's design tokens without Tailwind's CSS. Its theme file holds Tailwind 0.7's default color palette, text sizes and margin scale, copied value for value. Emotion's `ThemeProvider` hands the theme to components, and styled-system turns props like `color="red-light"` and `fontSize="5xl"` into styles, the way Tailwind's `text-red-light` and `text-5xl` classes would.

It's a Create React App project from January 2019 with two commits: the generated app, and the pattern on top of it. The package is named `pattern-library`, but it has a single component, a `Box` that renders the word "test". It hasn't changed since, and the README is the Create React App default.

## The theme

`src/theme/index.js` has three scales. `colors` holds all 73 entries of Tailwind 0.7's palette, from `black` and the grey scale to the pink scale. `fontSizes` runs from `xs` (0.75rem) to `5xl` (3rem), and `spaces` holds `auto`, `px` and the steps `0` to `32` (8rem). All of them match the default config that shipped with tailwindcss 0.7.3.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/tailwind-js-in-css-pattern-example-colors-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/tailwind-js-in-css-pattern-example-colors.webp" alt="Lines 1 to 21 of src/theme/index.js: the start of the colors object, with transparent, black #22292f, grey-darkest #3d4852 through grey-lightest #f8fafc, white, and red-darkest #3b0d0c through red-lightest #fcebea, including red-light #ef5753." width="1440" height="861" loading="lazy" /></picture><figcaption>The start of the palette: Tailwind 0.7's greys and reds.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/tailwind-js-in-css-pattern-example-scales-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/tailwind-js-in-css-pattern-example-scales.webp" alt="Lines 86 to 114 of src/theme/index.js: fontSizes from xs .75rem to 5xl 3rem, each with a comment giving the size in pixels, then spaces with auto, px 1px, and steps 0 to 32 from 0 to 8rem." width="1440" height="1149" loading="lazy" /></picture><figcaption>The text sizes and the spacing scale, which the theme calls spaces.</figcaption></figure>
</div>

## What it renders

The app renders one `Box` with `m="4"`, `color="red-light"` and `fontSize="5xl"`. Emotion turns it into a single class: `margin: 32px; font-size: 3rem; color: rgb(239, 87, 83)`. The color is Tailwind's red-light (`#ef5753`) and the size is its 5xl, both from the theme. The margin isn't Tailwind's `m-4` (1rem): styled-system 3 looks for a scale named `space`, and this theme calls it `spaces`, so `m="4"` falls back to styled-system's default scale, where step 4 is 32px.

<figure>
  <img src="/images/projects/tailwind-js-in-css-pattern-example-render.webp" alt="The running app: the word test in coral red at 48 pixels, near the top left of an otherwise blank white page." width="1200" height="300" loading="lazy" />
  <figcaption>The whole page, from a local run with Node 10.</figcaption>
</figure>

## How it's built

It uses react-scripts 2.1.3 with React 16.7, Emotion 10 (`@emotion/core`, `@emotion/styled` through its Babel macro, and `emotion-theming`) and styled-system 3.2. Tailwind itself isn't a dependency: only its default values are.

It still installs from its lockfile and starts with Node 10: `yarn install`, then `yarn start`.

The creation date shown here is the GitHub repository's UTC creation date. The screenshot was captured by running the project locally from its source with Node 10, and the code cards show real source files from the repository.
