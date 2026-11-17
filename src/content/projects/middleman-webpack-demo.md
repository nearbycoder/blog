---
title: "middleman-webpack-demo"
summary: "A demo of a Middleman static site whose JavaScript and Sass are built by webpack 2 through Middleman's external pipeline, with Bourbon and Neat available to the stylesheets."
role: "Creator"
createdAt: "2017-02-21"
year: "2017"
stack: ["Middleman", "Ruby", "webpack", "Babel", "Sass", "JavaScript"]
githubLink: "https://github.com/nearbycoder/middleman-webpack-demo"
image: "/images/projects/middleman-webpack-demo.webp"
imageAlt: "Lines 31 to 48 of config.rb: activate :livereload, the css_dir, js_dir and images_dir settings, and activate :external_pipeline named webpack, running webpack.js --bail -p for a build or webpack.js --watch -d --progress --color otherwise, with source .tmp/dist and a latency of 1."
imageCaption: "The external pipeline setup in config.rb, where Middleman hands its assets to webpack."
featured: false
accent: "amber"
draft: false
---

middleman-webpack-demo is a starter Middleman 4.2 site whose JavaScript and stylesheets are built by webpack 2 instead of Middleman's own asset pipeline. It's a demo: the page is Middleman's default "Middleman is Running" welcome page, and the JavaScript only imports the stylesheet and logs a message to the console. What it shows is the wiring between the two tools. It was made over two days in February 2017 and hasn't changed since.

## How it fits together

Middleman's `external_pipeline` extension runs webpack next to the site. In development it starts `webpack --watch`, and in a build it runs `webpack --bail -p`. Either way, Middleman treats whatever webpack writes to `.tmp/dist` as part of the site's source.

webpack starts from `assets/javascripts/main.js`. The JavaScript goes through Babel with the ES2015 and stage-0 presets, and the Sass it imports goes through sass-loader and css-loader into ExtractTextPlugin, which writes it out as its own CSS file. node-neat supplies the include paths for Bourbon and Neat, so the stylesheet can `@import "bourbon"` and `@import "neat"` without copying them into the project.

<figure>
  <picture><source srcset="/images/projects/middleman-webpack-demo-webpack-config-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/middleman-webpack-demo-webpack-config.webp" alt="Lines 1 to 16 of webpack.config.js: requiring webpack and extract-text-webpack-plugin, mapping node-neat's includePaths into a sass-loader query string, an entry point of ./assets/javascripts/main.js, and output to __dirname plus /.tmp/dist with the filename assets/javascript/main.bundle.js." width="1440" height="681" loading="lazy" /></picture>
  <figcaption>The start of webpack.config.js. Its output folder is the one config.rb watches.</figcaption>
</figure>

The layout links the two bundles with Middleman's `stylesheet_link_tag "main.bundle"` and `javascript_include_tag "main.bundle"` helpers, and livereload is turned on. The second commit added an `npm-build` script and `npm-webpack.config.js`, which builds the same entry point into `dist/javascript/roundup.js` and `dist/css/roundup.css`, plus an `.npmignore` that leaves the Middleman files out of a package.

## Running it today

Ruby isn't needed for the webpack half. On Node 6, `npm install` still works, with the `^2.2.1` range resolving to webpack 2.7.0, and the build command from `config.rb` produces both bundles. Sass prints a deprecation warning from Bourbon along the way.

<figure>
  <picture><source srcset="/images/projects/middleman-webpack-demo-build-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/middleman-webpack-demo-build.webp" alt="A terminal running node -v and ./node_modules/webpack/bin/webpack.js --bail -p --hide-modules: Node v6.17.1, a loader-utils deprecation warning, a Bourbon warning that em is deprecated, then webpack 2.7.0 emitting assets/javascript/main.bundle.js at 583 bytes and assets/stylesheets/main.bundle.css at 481 bytes." width="1397" height="705" loading="lazy" /></picture>
  <figcaption>The production build from config.rb, run on Node 6.17.1, with --hide-modules added to leave out the module list.</figcaption>
</figure>

`npm run npm-build` doesn't get that far. webpack 2 requires an absolute output path and `npm-webpack.config.js` gives `./dist`, so it stops at config validation, with webpack 2.2.1 and with 2.7.0. The Middleman side wasn't run for this page.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the repository's webpack build locally on Node 6.17.1, and the code cards show the repository's source files.
