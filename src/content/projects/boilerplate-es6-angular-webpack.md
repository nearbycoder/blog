---
title: "boilerplate-es6-angular-webpack"
summary: "A starter kit from April 2016 for writing AngularJS 1.5 apps as ES6 classes and modules, bundled by webpack. A month later it got a commented copy, getting-started-with-angular-1.5-webpack, that explains nearly every line."
role: "Creator"
createdAt: "2016-04-08"
year: "2016"
stack: ["JavaScript", "AngularJS", "webpack", "Babel", "Sass"]
githubLink: "https://github.com/nearbycoder/boilerplate-es6-angular-webpack"
image: "/images/projects/boilerplate-es6-angular-webpack.webp"
imageAlt: "The commented copy of the boilerplate running in a browser: a dark page with the cyan heading The Number Of Repos Is 30, a text box containing nearbycoder, and a centered list of repository names such as AfterHours, AgentClicker, api-research and astro-blog, with every other name in a cyan bar."
imageCaption: "The commented copy, getting-started-with-angular-1.5-webpack, running locally on Node 6 with its 2016 dependencies. Typing a username and pressing Enter loads that user's repositories from the live GitHub API, so the names are today's."
featured: false
accent: "cyan"
draft: false
---

boilerplate-es6-angular-webpack is a starter kit for AngularJS 1.5 apps written as ES6 classes and modules. Babel compiles them, webpack bundles them, and webpack-dev-server serves the app while you work. Its one example component, `home`, shows the layout it suggests: a folder per component, with a module file that imports a controller, a directive, a component and a service and registers them on one Angular module.

The boilerplate's 13 commits are from April 8 to 17, 2016. On May 15, its final state was copied into a second repository, [getting-started-with-angular-1.5-webpack](https://github.com/nearbycoder/getting-started-with-angular-1.5-webpack), and commented line by line under the title "Getting Started With ES6 Angular 1.5 and Webpack". Neither has changed since May 2016.

<figure>
  <img src="/images/projects/boilerplate-es6-angular-webpack-home.webp" alt="The boilerplate's unstyled demo in black serif text on white: the line The Number Of Repos Is 30, followed by repository names from AfterHours and AgentClicker down to astro-blog and auto-slack." width="820" height="482" loading="lazy" />
  <figcaption>The boilerplate's own demo, which has no styles: the counter component and the names of the 30 repositories the GitHub API returns for nearbycoder. Running locally with its 2016 dependencies.</figcaption>
</figure>

## What's in the kit

- **ES6 throughout.** Controllers, services and directives are ES6 classes, components are plain objects, and files import each other as modules. Babel 6 compiles them with its ES2015 preset.
- **Minification-safe injection.** Instead of Angular's array syntax for naming dependencies, functions start with `'ngInject';` and ng-annotate adds the names at build time.
- **Templates in the bundle.** webpack treats `src/public/views` as a module folder, so a route can `import templateUrl from 'home/home.html'`, and ngtemplate-loader puts the HTML in Angular's template cache.
- **Routing** with the 1.0 alpha of UI-Router, using hash URLs and falling back to `/`.
- **Styles** in Sass, compiled by node-sass and injected by style-loader.
- **A production build.** `npm run build` writes `./dist` with a hashed, deduplicated and uglified bundle and its source map, and copies everything in `src/public` except the HTML.

The `home` example asks a `$resource` service for the repositories of a GitHub user (hardcoded as nearbycoder) and lists their names. An `es-counter` component, bound one way to the list, shows how many there are once the request resolves, and an `es-capitalize` directive title-cases its text. Later commits fixed spelling, replaced a `$scope.$watch` in the counter with the resource's promise, and moved the request out of `$onInit` ("Fix issue with controller not having $onInit function").

<figure>
  <picture><source srcset="/images/projects/boilerplate-es6-angular-webpack-module-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/boilerplate-es6-angular-webpack-module.webp" alt="Lines 1 to 16 of src/app/components/home/index.js: imports of angular, angular-ui-router, angular-resource and the home routes, controller, capitalize directive, counter component and GitHub service, all registered on the app.home module with config, controller, directive, component and service calls, exporting the module's name." width="1440" height="681" loading="lazy" /></picture>
  <figcaption>The example component's module file, which wires an ES6 class or object into each kind of Angular registration.</figcaption>
</figure>

## The commented copy

getting-started-with-angular-1.5-webpack starts from the boilerplate's last commit. One commit, "Added comments to all", then annotated nearly every line: what `'ngInject'` does, why templates are imported, and what each webpack loader and plugin is for. The same commit made the demo interactive. An `es-enter` directive runs an expression when you press Enter, so you type a GitHub username and load that user's repositories, and a new stylesheet gives the page the dark theme shown at the top.

The counter went back to a `$scope.$watch`, because, as its comment says, the watch is needed to update the count after the request. Another comment notes that counting this way is "Probably not the best approach for larger github user repo lists as they are paginated." The API's first page holds 30 repositories, which is why both demos stop at 30.

<figure>
  <picture><source srcset="/images/projects/boilerplate-es6-angular-webpack-commented-counter-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/boilerplate-es6-angular-webpack-commented-counter.webp" alt="Lines 1 to 33 of the commented counter.component.js: a controller class whose constructor takes $scope, with comments explaining ngInject, a note that counting all repos is probably not the best approach for larger paginated lists, a $scope.$watch that sets the count when the repos arrive, and the exported component object with controller, templateUrl and a repos binding." width="1440" height="1293" loading="lazy" /></picture>
  <figcaption>The counter component in the commented copy.</figcaption>
</figure>

## Use

The boilerplate has 17 stars and 8 forks on GitHub. In January 2017, a developer building an Angular 1.x app from it reported that their router stopped working in builds without source maps. The reply was a pull request to their project, and they closed the issue as resolved.

Its sibling, [boilerplate-es6-react-redux-webpack](/projects/boilerplate-es6-react-redux-webpack), came two days later with the same webpack setup for React and Redux.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running both repositories locally on Node 6, with dependencies at the versions current when they were last committed (Angular 1.5.5, webpack 1.13, Babel 6 and node-sass 3), against the live GitHub API, and the code cards show real source files from the two repositories.
