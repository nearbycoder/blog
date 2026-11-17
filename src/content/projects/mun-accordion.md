---
title: "Mun-Accordion"
summary: "An accordion menu built as a pair of AngularJS 1.4 directives for a code challenge in January 2016. Items open one at a time, or several at once with multiple='true'."
role: "Creator"
createdAt: "2016-01-29"
year: "2016"
stack: ["AngularJS", "JavaScript", "Sass", "Gulp"]
githubLink: "https://github.com/nearbycoder/Mun-Accordion"
image: "/images/projects/mun-accordion.webp"
imageAlt: "The Mun-Accordion demo page on a purple background: the title Mun-Accordion in a white script face, the subtitle Pure Angular Accordion Menu, a paragraph about the code challenge, an Example API block with a mun-accordion element holding three accordion-item elements titled Heading 1 to 3, a note explaining the item-title and initially-open attributes, and the accordion itself with Heading 1 open showing the word test and Heading 2 and Heading 3 closed."
imageCaption: "The demo page, served locally from the repository's committed src folder."
featured: false
accent: "purple"
draft: false
---

Mun-Accordion is an accordion menu made of two AngularJS 1.4 directives. Wrap `<accordion-item>` elements in a `<mun-accordion>`, give each one an `item-title`, and add `initially-open="true"` to any that should start open. Whatever you put inside an item is transcluded into its body.

The README calls it a code challenge, and so does the demo page: "Below is examples of my work for the code challenage." The page names the accordion animations as what it would improve, and says the CSS "was compiled scss that I built as a custom grid framework." The repository has four commits over two days in January 2016 and hasn't changed since.

## How it works

`mun-accordion` is an element directive with an isolated scope and a small controller that keeps a list of its items. Each `accordion-item` requires that controller (`require: '^munAccordion'`), registers its own scope when it loads, and toggles itself when its header is clicked. Opening an item asks the controller to close all the others first, unless the accordion has `multiple='true'`. Every `mun-accordion` keeps its own list, so several on one page don't affect each other.

<figure>
  <img src="/images/projects/mun-accordion-single.webp" alt="The first accordion with Heading 1 closed, Heading 2 open showing the word test, and Heading 3 closed, each header in light blue with a circled arrow icon." width="1344" height="303" loading="lazy" />
  <figcaption>The first accordion after clicking Heading 2: Heading 1 closes as Heading 2 opens.</figcaption>
</figure>

Opening and closing are CSS transitions on `max-height`, one second to open and 0.22 seconds to close, while a Font Awesome arrow turns to point down.

<figure>
  <picture><source srcset="/images/projects/mun-accordion-controller-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/mun-accordion-controller.webp" alt="Lines 1 to 27 of js/mun-accordion.js: an IIFE that creates the munAccordion module, with comments crediting the naming scheme to a talk by Dave Smith, and a munAccordionController that keeps an accordionItems array, closes every item before opening the clicked one unless $scope.multiple is set, and adds items as they load." width="1440" height="1149" loading="lazy" /></picture>
  <figcaption>The module and its controller, from js/mun-accordion.js.</figcaption>
</figure>

The demo puts a form, a table, preformatted code, an image, a YouTube video and a SoundCloud player inside items.

<figure>
  <img src="/images/projects/mun-accordion-multiple.webp" alt="Two accordions side by side under a note about multiple='true'. The left one has Inputs open with Username and Password fields, Tables open with a two-row table of names and numbers, and Pre Tags open with a code sample. The right one has Video Embed closed, Image open with a blurred photo of a beach at sunset, and Audio Embed closed." width="1413" height="752" loading="lazy" />
  <figcaption>Two accordions with multiple='true', with several items open at once. The photo is loaded from Unsplash by the demo page. The video and audio items are closed, and the SoundCloud track in the audio item no longer exists.</figcaption>
</figure>

## How it's built

The directive is plain JavaScript in `js/mun-accordion.js`, and the demo loads AngularJS 1.4.9 and Font Awesome from CDNs. Gulp 3 concatenates the `js` folder into `src/js/main.js`, compiles the Sass with gulp-scss, and serves `src` with live reload. The last commit synced the repository with changes made in JS Bin, including some CSS and semicolons whose absence had caused errors there.

The Sass is a set of partials: variables, resets, mixins, flex containers, helpers, a theme and the accordion layout. Most of the same partials appear in [Flexer](/projects/flexer), a flexbox grid started the next day, and several of the files are identical.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by serving the repository's committed `src` folder locally, with AngularJS, the fonts and the photo loaded from the same public URLs the page uses, and the code card shows a real source file from the repository.
