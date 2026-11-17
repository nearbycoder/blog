---
title: "Flexer"
summary: "A small flexbox grid written in Sass in January 2016, with twelve-column classes at several breakpoints, offsets and helper classes. Its demo page still runs on GitHub Pages."
role: "Creator"
createdAt: "2016-01-30"
year: "2016"
stack: ["Sass", "CSS", "Gulp", "GitHub Pages"]
link: "https://nearbycoder.github.io/flexer/"
githubLink: "https://github.com/nearbycoder/flexer"
image: "/images/projects/flexer.webp"
imageAlt: "The top of the Flexer demo page on a purple background: the word flexer in a white script logo with a GitHub corner ribbon, a blue box describing flexer as a super simple grid made with flexbox whose gutters are pixel perfect, and rows of white boxes labeled with their classes, from one .col-sm-12 down to twelve .col-md-1 boxes."
imageCaption: "The top of the live demo page on GitHub Pages."
featured: false
accent: "violet"
draft: false
---

Flexer is a grid layout built on flexbox and written in Sass. A `.row` wraps its columns, and classes like `.col-sm-6` or `.col-lg-4` give each column a width in twelfths of the row, minus a fixed gutter. The repository has the Sass partials, the compiled `flexer.css` and `flexer.min.css` in `dist`, and a demo page published on [GitHub Pages](https://nearbycoder.github.io/flexer/).

All ten commits were made within a day in late January 2016, and the repository hasn't changed since. The demo page still loads and works.

## The grid

The settings live in `_vars.scss`: 12 columns, a 10px gutter, rows 98% wide and containers up to 1400px. The `sm` classes have no media query, so they're the base size, and the `md`, `lg` and `xl` classes start at 751px, 971px and 1171px. Loops in `_flex.scss` generate a class for every column count at every size, plus `-outer-` columns without gutters and `-os-` offsets that push a column to the right.

The `col` mixin subtracts the gutter inside `calc()` and puts half of it on each side as margin, so columns stay exactly 10px apart at any width. The demo calls the gutters "pixel perfect", and changing `$gutter-size` resizes them all.

<figure>
  <picture><source srcset="/images/projects/flexer-mixins-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/flexer-mixins.webp" alt="Lines 1 to 26 of scss/mixins/_sizing.scss: mixins for flex, flex-wrap and justify-content; a col mixin whose width is calc of the size over the max column count times 100% minus the gutter, with half the gutter as margin; col-outer without the gutter; padding and margin mixins; and an os mixin that sets margin-left for offsets." width="1440" height="1041" loading="lazy" /></picture>
  <figcaption>The mixins behind every column class, from scss/mixins/_sizing.scss.</figcaption>
</figure>

## The demo page

The demo labels every box with the class that applies at the current width. Each box lists its class for every size in data attributes, and a jQuery resize handler swaps in the matching label, so resizing the browser shows the breakpoints change.

<figure>
  <img src="/images/projects/flexer-breakpoints.webp" alt="Two blue notes about breakpoints and offsets above rows of white boxes at a tablet width: pairs labeled .col-md-6, a full-width .col-md-12, a row where one box sits on the right labeled .col-md-6 .col-md-os-6, and two more full-width .col-md-12 boxes." width="1290" height="1002" loading="lazy" />
  <figcaption>The breakpoint and offset sections at 860px wide, where the md classes apply. At 1280px the first three rows become 5 and 7 columns, three 4s, and four 3s.</figcaption>
</figure>

The page also documents its helper classes: clearing floats, centering with flexbox, padding, margins and font sizes in 10px steps from 10 to 60, and text alignment, including variants for small screens.

<figure>
  <img src="/images/projects/flexer-helpers.webp" alt="Two columns on the purple page. On the left, under Helpers can be used to add functionality to your dom nodes, a table of classes such as .clear-both, .no-padding, .flex-center-right, .pad-10 to 60, .margin-tb-10 to 60, .font-10 to 60 and .text-align-center, each with a one-line description. On the right, under Additional column classes to use, .col-#{media}-outer-#{size}, .row-inner and .col-#{media}-os-#{size}." width="1440" height="1017" loading="lazy" />
  <figcaption>The helper classes and the extra column classes, from the live page.</figcaption>
</figure>

## How it's built

Gulp 3 runs the build. Its `scss` task compiles the partials with gulp-scss, a plugin that calls Ruby Sass's `scss` command, `minify` writes `flexer.min.css` with cssnano, and `dist` copies the Sass partials into `dist/scss`. The default task serves the demo with gulp-webserver and reloads it on changes.

Flexer's partials also appear in [Mun-Accordion](/projects/mun-accordion), a code challenge started the day before, whose demo page describes its CSS as "compiled scss that I built as a custom grid framework." Several files are identical, Flexer added the outer columns and `.row-inner` in later commits, and its demo page still has `ng-app='AccordionDemo'` on the `<html>` tag.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from the live demo on GitHub Pages, and the code card shows a real source file from the repository.
