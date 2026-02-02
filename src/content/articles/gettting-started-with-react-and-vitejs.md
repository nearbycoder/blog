---
title: "Getting started with React and ViteJS"
description: "In this blog post I go over the basic scaffolding of building out a starter React app using ViteJS and explain ViteJS works compared to something like your traditional module loaders such as Webpack."
date: "2021-04-02"
tags: ["react", "vite", "tooling"]
readTime: "6 min read"
featured: true
accent: "amber"
---

Have you ever started up a webpack application and just sat their and waited in order for everything to compile and build? What do you normally do in that time? Go get some coffee, stand up and stretch, head to twitter? In this post I will be going over ViteJS using React and not only how easy it is to get started but also how fast it can be.

## Video Guide

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/ZBSelnyLgp4"
    title="Getting started with React and ViteJS"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

## The Basics

First you will want to go to [ViteJS Getting Started](https://vitejs.dev/guide/) that way you can follow along with the guides already provided.

In the video I ran the following code to get started

```shell
npm init @vitejs/app [app-name]

cd [app-name]
npm install
npm run develop
```

From this point you pretty much have a barebones React application setup using ViteJS. Start playing around with changing things and saving and just see how much faster the response time is to updating your application. This may seem like it's just because the app is so small but continue to build things on top of it and you will still notice that the app doesn't start to become slugish in dev mode due to how only the modules you update need to be replaced and their is no recompile step along the way.

## Building for Production

ViteJS uses rollup under the hood and although their is a escape hatch to break into and modify the configs for rollup most apps will work just fine using the default bundling mechanism. If you run the following

```shell
npm run build
```

The app will build out and codesplit the application for you into a vendor file for third party libraries and your code in another JS file. I have yet to try codesplitting React components directly using React Router but I am sure it's something that is probably handled under the hood for you.

## Next Steps with ViteJS

In the next blog post / video I am going to be showing you how to use ViteJS to actually deploy a library to NPM the right way, so stay tuned.
