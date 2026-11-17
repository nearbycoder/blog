---
title: "boilerplate-es6-react-redux-webpack"
summary: "A starter kit from April 2016 for React apps with Redux, React Router and webpack. Its example app looks up a GitHub user's repositories through redux-resource and logs every action in the Redux DevTools."
role: "Creator"
createdAt: "2016-04-10"
year: "2016"
stack: ["JavaScript", "React", "Redux", "React Router", "webpack", "Babel", "Sass"]
githubLink: "https://github.com/nearbycoder/boilerplate-es6-react-redux-webpack"
image: "/images/projects/boilerplate-es6-react-redux-webpack.webp"
imageAlt: "The example app's Repos page: a dark header with Home and Repos links, a Repo List heading, a text box with the placeholder Type a github usernames, the heading Owner: nearbycoder, and underlined repository names from AfterHours to Cinderwake. The Redux DevTools dock on the right logs @@INIT, FETCH_REPOS and RECEIVE_REPOS, whose payload has 100 items."
imageCaption: "Looking up nearbycoder on the Repos page, running locally on Node 6 with the project's 2016 dependencies. Chromium was started with HTTP/2 turned off, for the reason under Running it today."
featured: false
accent: "sky"
draft: false
---

boilerplate-es6-react-redux-webpack is a starter kit for React apps written with ES6 classes and modules. It sets up Redux for state, React Router for routes, Babel for the newer syntax and webpack to bundle, with hot reloading and the Redux DevTools in development. It came two days after [boilerplate-es6-angular-webpack](/projects/boilerplate-es6-angular-webpack) and shares its webpack setup and most of its README.

The example app is there to be stripped out. As the README puts it, "This is more for knowing where the resources go." The repository has four commits: three on April 10, 2016, and one in September 2016 that updated the dependencies (React 15.0 to 15.3) and, to "fix deprecations with react", stopped spreading the action creators onto each list item. It hasn't changed since.

## How it's laid out

- `src/app` splits the Redux pieces into `actions`, `constants`, `reducers` and `store`. Presentational components live in `components`, and the ones connected to the store in `containers`.
- `routes.js` wraps every page in a layout with a header and footer, with Home at `/` and the repo list at `/repos`, using React Router 2 with browser history.
- `fetchRepos` comes from redux-resource's `createResourceAction`, given a URL template, `https://api.github.com/users/:username/repos?page=1&per_page=100`, and three action types: `FETCH_REPOS`, `RECEIVE_REPOS` and `ERR_RECEIVE_REPOS`. Its middleware is redux-thunk.
- Type a username and press Enter to dispatch it. The reducer keeps only the repositories that aren't forks, and on an error it sets a "User Not Found" warning.
- In development the store is wrapped with the Redux DevTools: a dock with a log monitor (Ctrl+H hides it, Ctrl+Q moves it), or the browser extension if it's installed. Adding `?debug_session=<key>` to the URL keeps a session across reloads.
- Components hot reload through react-transform-hmr, and the store swaps in new reducers through webpack's hot module replacement.
- Babel 6 runs the ES2015 and stage-0 presets, so components use class properties for `propTypes` and the `::` bind operator.
- `npm run build` sets `NODE_ENV` to production, which leaves the DevTools out, and writes a deduplicated, uglified bundle to `./dist`.

<figure>
  <picture><source srcset="/images/projects/boilerplate-es6-react-redux-webpack-reducer-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/boilerplate-es6-react-redux-webpack-reducer.webp" alt="Lines 1 to 30 of src/app/reducers/githubRepos.js: an initial state with fetching, warning and repos, and a reducer whose FETCH_REPOS case copies the state, whose RECEIVE_REPOS case stores the payload filtered to repos where fork is false, and whose ERR_RECEIVE_REPOS case sets the warning to User Not Found with an empty repos list." width="1440" height="1221" loading="lazy" /></picture>
  <figcaption>The reducer drops forks and turns any failed request into "User Not Found".</figcaption>
</figure>

## Running it today

Installed with the versions from its last commit (React 15.3.1, Redux 3.6, React Router 2.8, redux-resource 1.1.0 and webpack 1.13) and run on Node 6, the project still compiles and serves. Looking up a user no longer works in a default browser, though. redux-resource 1.1.0 sends its request with XMLHttpRequest and rejects any response whose `statusText` isn't exactly "OK". The GitHub API now answers over HTTP/2, which has no status text, so a successful response goes to `ERR_RECEIVE_REPOS`, and the page says "User Not Found" for an account that exists.

<figure>
  <img src="/images/projects/boilerplate-es6-react-redux-webpack-http2.webp" alt="The same page after the same search, showing User Not Found under the text box and an empty Owner: heading, while the DevTools dock logs @@INIT, FETCH_REPOS and ERR_RECEIVE_REPOS with a payload of 100 items. A dark footer reads Footer." width="1440" height="857" loading="lazy" />
  <figcaption>The same search in Chromium with default settings. The request succeeds over HTTP/2, but the 100 repositories arrive as the payload of ERR_RECEIVE_REPOS.</figcaption>
</figure>

Over HTTP/1.1, GitHub still sends "200 OK". With HTTP/2 turned off in the browser, the app works as written, which is how the screenshot at the top of this page was made. Nothing in the project or its dependencies was changed.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source on Node 6, with its 2016 dependencies, against the live GitHub API, and the code card shows a real source file from the repository.
