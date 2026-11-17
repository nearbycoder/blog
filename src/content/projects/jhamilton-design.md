---
title: "jhamilton.design"
summary: "A one-page site for J Hamilton Designs, built with Remix on Netlify in March 2022: a profile card with a logo, a line about bringing clients' home designs to life, and a Get In Touch button."
role: "Creator"
createdAt: "2022-03-09"
year: "2022"
stack: ["Remix", "React", "TypeScript", "Tailwind CSS", "Netlify"]
githubLink: "https://github.com/nearbycoder/jhamilton.design"
image: "/images/projects/jhamilton-design.webp"
imageAlt: "The top of the jhamilton.design profile card: the name Jessica Hamilton over a pale green rule, a briefcase icon with What you do, a globe icon with Your Location - 36.1540° N, 95.9928° W, and the J Hamilton Designs logo, a line drawing of a house among flowers marked Est 2022."
imageCaption: "The profile card, running locally from the repository's source. The portrait photo beside it on the page is cropped out."
featured: false
accent: "emerald"
draft: false
---

jhamilton.design is a one-page site for J Hamilton Designs. A white card carries Jessica Hamilton's name, the business's logo and one line about the work: "Design is a passion of mine and I strive to make my clients home designs come to life." A green Get In Touch button opens an email, and icons link to Facebook and Instagram. On wide screens a large portrait photo sits beside the card, and on phones a round one sits above it.

The four commits are from one evening in March 2022: the app, two favicon updates and the logo.

## How it's built

It's the Remix 1.2 template for Netlify: one route, `app/routes/index.tsx`, rendered by a Netlify Function, with `netlify.toml` serving `public/` as static files and sending every other path to the function. The markup comes from a Tailwind profile-card template, styled by Tailwind CSS 2.2 from the unpkg CDN instead of a build step. The template's comments are still in the code, and "What you do" is still its placeholder text.

<figure><picture><source srcset="/images/projects/jhamilton-design-route-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jhamilton-design-route.webp" alt="Lines 1 to 22 of app/routes/index.tsx: an Index component returning a max-w-4xl flex container under a comment reading Replace with your tailwind.css once created, a profile div with Tailwind classes such as lg:w-3/5, shadow-2xl and opacity-75, a round mobile-only image div with a background image of /images/image.jpeg, and an h1 reading Jessica Hamilton." width="1440" height="1005" loading="lazy" /></picture><figcaption>The top of the only route, with the template's comments. The code card follows this site's light or dark theme.</figcaption></figure>

## Running it today

The jhamilton.design domain now points to a different site, so this app isn't live. It still builds with Node 16: `npm ci`, whose postinstall runs `remix setup node`, then `npx remix build` to produce the Netlify function. The dev script expects the Netlify CLI (`netlify dev`), so for the screenshot the built function was served through a small local stand-in for Netlify.

The creation date shown here is the GitHub repository's UTC creation date. The screenshot was captured by running the built app locally, with a small server standing in for Netlify, and the code card shows the repository's own source.
