---
title: "angular-surprise-button"
summary: "A one-component AngularJS module on npm: a blue button that plays a tada animation while you hold it down. It was the example project for a Made By Munsters blog post about building Angular modules with webpack and npm."
role: "Creator"
createdAt: "2017-03-18"
year: "2017"
stack: ["AngularJS", "JavaScript", "webpack", "Sass", "npm"]
link: "https://www.npmjs.com/package/angular-surprise-button"
githubLink: "https://github.com/nearbycoder/angular-surprise-button"
image: "/images/projects/angular-surprise-button.webp"
imageAlt: "A blue button labeled Surprise! in white, enlarged and tilted a few degrees clockwise, centered on a white page."
imageCaption: "The button 300 milliseconds into its tada animation, captured from a local demo page that loads AngularJS 1.6.3 and the repository's built bundle. The label is sample content."
featured: false
accent: "blue"
draft: false
---

angular-surprise-button is a single AngularJS component, packaged for npm. Put `<mbm-surprise-button>` in a template and you get a blue button with your own label inside it. Press it and it plays a one-second tada animation: it shrinks a little with a slight tilt, then grows and rocks from side to side before settling.

It was made in March 2017 as the example project for a post on the Made By Munsters blog about building Angular modules with webpack and npm. The post is no longer online. The repository has two commits, five minutes apart, and the package hasn't changed since.

## The animation

The animation lives in the stylesheet and runs on the button's `:active` state, so it plays while the button is held down. These frames come from a small local page that loads AngularJS 1.6.3 and the bundle from the repository's `dist` folder, with the animation paused at set times for each screenshot.

<div class="project-media-gallery">
  <figure><img src="/images/projects/angular-surprise-button-rest.webp" alt="The Surprise! button at rest: a flat blue rectangle with white text, centered on a white page." width="960" height="520" loading="lazy" /><figcaption>At rest.</figcaption></figure>
  <figure><img src="/images/projects/angular-surprise-button-shrink.webp" alt="The Surprise! button 150 milliseconds into the animation, slightly smaller and tilted counterclockwise." width="960" height="520" loading="lazy" /><figcaption>150 ms in: shrunk to 90% and tilted.</figcaption></figure>
  <figure><img src="/images/projects/angular-surprise-button-wobble.webp" alt="The Surprise! button 450 milliseconds into the animation, larger than at rest and tilted slightly clockwise." width="960" height="520" loading="lazy" /><figcaption>450 ms in: enlarged and rocking from side to side.</figcaption></figure>
</div>

## How it's built

The component is a template, a transclude flag and an empty controller class. `surprise-button.module.js` imports it and the stylesheet, registers it on a module named `mbmSurpriseButton`, and exports that name.

<figure>
  <picture><source srcset="/images/projects/angular-surprise-button-component-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/angular-surprise-button-component.webp" alt="The 13 lines of src/js/surprise-button.component.js: an empty controller class and a component definition with transclude set to true and a template of an anchor with the class mbm-surprise-button and role button, wrapping an ng-transclude element." width="1440" height="573" loading="lazy" /></picture>
  <figcaption>The whole component, from src/js/surprise-button.component.js.</figcaption>
</figure>

The styles are 73 lines of SCSS, most of them the keyframes for the `tada` animation, with `-webkit-` prefixed copies of each rule.

<figure>
  <picture><source srcset="/images/projects/angular-surprise-button-scss-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/angular-surprise-button-scss.webp" alt="Lines 1 to 19 of src/sass/surprise-button.scss: the .mbm-surprise-button rule with a one-second animation duration, a #007BC1 background, white 18px text, inline-block display and 5px padding, and an :active block that sets the animation name to tada." width="1440" height="789" loading="lazy" /></picture>
  <figcaption>The button's styles. Holding it down starts the tada keyframes. From src/sass/surprise-button.scss.</figcaption>
</figure>

webpack 2 bundles everything into one CommonJS file, `dist/angular-surprise-button.js`, with a source map. The Sass goes through sass-loader, css-loader and style-loader, so the CSS is compiled into the bundle and added to the page in a `<style>` tag when the module loads. There's no separate stylesheet to include. AngularJS is only a dev dependency: the bundle uses the `angular` global from the page.

## On npm

Version 1.0.0 went to npm on March 18, 2017 (UTC), and 1.0.1 followed a few minutes later with the README and repository links. The bundle is the same in both, and it's the same file that's in the repository.

```sh
npm install angular-surprise-button
```

The package's default export is the module name, so you can import it and list it in your app module's dependencies, then use `<mbm-surprise-button>` in a template. Load AngularJS on the page first.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured from a local demo page that loads AngularJS 1.6.3 and the repository's built bundle, with Surprise! as a sample label, and the code cards show the repository's source files.
