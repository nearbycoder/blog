---
title: "React Boilerplate with testing"
summary: "A starter kit from September 2015 for React 0.13 apps written in ES6, with Babel, webpack, React Hot Loader, and Karma and Jasmine for tests. Its files became the first commit of react.chat.v2."
role: "Creator"
createdAt: "2015-09-19"
year: "2015"
stack: ["JavaScript", "React", "Babel", "webpack", "React Hot Loader", "Karma", "Jasmine"]
githubLink: "https://github.com/nearbycoder/react-boilerplate-with-testing"
image: "/images/projects/react-boilerplate-with-testing.webp"
imageAlt: "A dark terminal running ./node_modules/karma/bin/karma start --single-run --no-auto-watch karma.headless.config.js: Karma v0.13.22 starts, HeadlessChrome 159 connects, and the spec reporter lists Empty test with one passing spec and initial app rendered with three (renders without problems, has text Hello World, returns test for test func), ending with Executed 4 of 4 SUCCESS and TOTAL: 4 SUCCESS."
imageCaption: "The test suite passing today with Karma 0.13. It runs in Playwright's headless Chromium instead of PhantomJS, through a small local config that wraps the repository's karma.config.js."
featured: false
accent: "cyan"
draft: false
---

React Boilerplate with testing is a starter kit for React 0.13 apps written in ES6. Its README lists the parts: Babel 5 for ES6, webpack 1 and its dev server for bundling, React Hot Loader "for tweaking React components in real time", and Karma for unit tests. The webpack config explains each of its options in comments. The app itself is one component that renders "Hello, World!".

All three commits are from September 19, 2015, and the repository hasn't changed since.

## What's in it

- **`npm start`** runs `server.js`, a webpack-dev-server with hot module replacement on port 5000. Edit a component while it runs and React Hot Loader swaps it into the page without a reload. That still works today.
- **`npm test`** runs Karma once in PhantomJS, with Jasmine, karma-webpack to bundle the specs through Babel, istanbul-instrumenter-loader for coverage, and a spec reporter. `npm run test_watch` keeps Karma running and reruns the specs on every change. There's an empty test that always passes, plus three that render the app and check its text and one of its methods.
- **`npm run lint`** runs ESLint 0.21 with babel-eslint and eslint-plugin-react rules.
- **`npm run build`** uses a separate production config with UglifyJS and `NODE_ENV` set to production. Its Babel loader points at a `scripts` folder instead of `src`, so the build stops at the first line of JSX.

<figure>
  <picture><source srcset="/images/projects/react-boilerplate-with-testing-webpack-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/react-boilerplate-with-testing-webpack.webp" alt="Lines 47 to 75 of webpack.config.js: entries for webpack-dev-server/client?http://localhost:5000, webpack/hot/dev-server and ./src/index, output to bundle.js under /static/, .js and .jsx extensions, eval-source-map, the HotModuleReplacementPlugin and NoErrorsPlugin, and one loader rule sending .js and .jsx files in src through react-hot and babel." width="1440" height="1149" loading="lazy" /></picture>
  <figcaption>The development config. Every file in <code>src</code> goes through React Hot Loader and Babel.</figcaption>
</figure>

## react.chat.v2

Eleven minutes after the last commit here, [react.chat.v2](https://github.com/nearbycoder/react.chat.v2) started from these same files: its first commit matches this repository file for file. Its README only says "React Chat V2", and its package.json describes it as "FireBase react-chat-v2", though it never got any Firebase code. In October 2015 it added react-router 1.0's release candidate, a Sass loader, Home and About routes, and a sidebar of rooms with a filter box, and it stopped there. Its name points to [React Chat](/projects/react-chat), which had started two months earlier.

## Running it today

With Node 6, `npm install --ignore-scripts` installs everything but skips PhantomJS's binary download. Karma then runs in headless Chromium instead, through a small config that wraps `karma.config.js` and swaps the PhantomJS launcher for karma-chrome-launcher, and all four specs pass. The dev server still starts, and hot reloading works as the README describes.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture shows a real run of the test suite today, and the code card shows the project's own source.
