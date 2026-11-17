---
title: "Astro Blog"
summary: "Astro's blog starter, deployed to GitHub Pages in May 2024. Its five commits point every link and asset at the /astro-blog/ project path, and the posts are still the starter's placeholders."
role: "Creator"
createdAt: "2024-05-09"
year: "2024"
stack: ["Astro", "MDX", "TypeScript", "GitHub Actions", "GitHub Pages"]
link: "https://nearbycoder.github.io/astro-blog/"
githubLink: "https://github.com/nearbycoder/astro-blog"
image: "/images/projects/astro-blog.webp"
imageAlt: "The Astro Blog home page: a white header with the title Astro Blog, Home, Blog and About links, and Mastodon, Twitter and GitHub icons, above an astronaut emoji, the heading Hello, Astronaut!, and the starter's welcome text with a list of files to edit, such as src/pages/index.astro and src/components/Header.astro."
imageCaption: "The home page, captured from the live GitHub Pages site."
featured: false
accent: "indigo"
draft: false
---

Astro Blog is Astro's official blog starter, the one `npm create astro@latest -- --template blog` generates, set up in May 2024 and deployed to GitHub Pages, where it's still live. It runs Astro 4.7 with the MDX, RSS and sitemap integrations. A GitHub Actions workflow builds it with `withastro/action` and publishes it with `actions/deploy-pages` on every push to `main`.

## What changed from the starter

The five commits took about ten minutes. The first is the generated starter plus the deploy workflow. The rest set `site` to `https://nearbycoder.github.io/astro-blog/` and point the header links, post links, hero images, favicon and font preloads at `/astro-blog/`, because a GitHub Pages project site is served from a subpath. The paths are prefixed by hand rather than through Astro's `base` option, and the touched files were reformatted from tabs to two spaces along the way.

Everything else is the starter's. The title is still "Astro Blog", the posts are its lorem ipsum from 2022 with gradient placeholder images, and the header links to Astro's own Mastodon, Twitter and GitHub.

<figure><img src="/images/projects/astro-blog-posts.webp" alt="The Astro Blog post list: a large hero image with the Astro logo and Build the web you want above the title Markdown Style Guide and the date Jul 1, 2022, then two cards with purple and red gradient images for Using MDX (Jul 2, 2022) and First post (Jul 8, 2022)." width="1280" height="1085" loading="lazy" /><figcaption>The blog index with the starter's placeholder posts, captured from the live site.</figcaption></figure>

## Try it

The site is at [nearbycoder.github.io/astro-blog](https://nearbycoder.github.io/astro-blog/). `npm install` and `npm run build` still work with Node 20, and the build runs `astro check` first. Because of the hand-written prefixes, the output only lines up when it's served from `/astro-blog/`, as GitHub Pages does.

[nearbycoder.com](/projects/nearbycoder-com) moved to Astro in February 2026, starting from Astro 5.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured from the live GitHub Pages site.
