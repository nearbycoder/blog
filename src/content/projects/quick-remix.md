---
title: "quick-remix"
summary: "A small Markdown blog built on Remix 1.0 in November 2021, with an admin area behind a GitHub login for writing, editing and deleting posts that are stored as files."
role: "Creator"
createdAt: "2021-11-23"
year: "2021"
stack: ["Remix", "React", "TypeScript", "Node.js"]
githubLink: "https://github.com/nearbycoder/quick-remix"
image: "/images/projects/quick-remix.webp"
imageAlt: "quick-remix's admin page in its dark theme: a Remix logo header with Logged in as demo@example.com, Admin, Posts and a Logout button, an Admin sidebar listing Hello from Remix, Loading posts and Sample notes, and the Loading posts post with a short code block and Edit and Delete links."
imageCaption: "The admin view of a sample post, in the starter's dark theme. Captured from a local run with sample posts, using a session cookie signed locally in place of the GitHub login."
featured: false
accent: "blue"
draft: false
---

quick-remix is a small blog built with Remix. Posts are Markdown files in a `posts` folder, with the title in their front matter. Anyone can read them at `/posts`, and an admin area behind a GitHub login lists every post, with forms to create, edit and delete them.

It was built in the first days of Remix's public release: the repository was created about two hours after Remix 1.0.4, the version it uses, was published to npm. All 17 commits are from November 22 and 23, 2021, and it hasn't changed since. It started from Remix's starter template, whose welcome page is still the home page, and the last commit deleted the starter's demo routes.

## What's in it

- **Posts from files.** `app/post.ts` reads, writes and deletes Markdown files with Node's `fs`, reads the title with front-matter, and renders the body to HTML with `@ryanflorence/md`. Git ignores the `posts` folder, so no posts are committed.
- **An admin area.** `/admin` lists the posts in a sidebar. A new post takes a title, a slug and Markdown, and the route's action sends back which fields are missing. Editing keeps the slug, and Delete removes the file.
- **GitHub login.** remix-auth's GitHub strategy signs you in and keeps your GitHub id and email in a cookie session. The admin layout's loader sends anyone who isn't signed in back to the home page. Logout destroys the session.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/quick-remix-admin-new-errors-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/quick-remix-admin-new-errors.webp" alt="The new post form in the admin area after submitting it empty, with Title is required, Slug is required and Markdown is required next to the Post Title, Post Slug and Markdown fields, and a Create Post button." width="1440" height="900" loading="lazy" /></picture><figcaption>Submitting an empty form. The action returns the missing fields.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/quick-remix-admin-edit-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/quick-remix-admin-edit.webp" alt="The edit form for the Loading posts post, with its title in a text field, the fixed slug loading-posts shown as text, its Markdown in a large text area, and an Update Post button." width="1440" height="900" loading="lazy" /></picture><figcaption>Editing a post's Markdown. The slug can't change.</figcaption></figure>
</div>

`@ryanflorence/md` runs code blocks through Shiki, but the colors it outputs are CSS variables that the app's stylesheets never define, so code shows up without highlighting.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/quick-remix-posts-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/quick-remix-posts.webp" alt="The public Posts page, signed out, with a Login with GitHub button in the header and links to Hello from Remix, Loading posts and Sample notes." width="1440" height="900" loading="lazy" /></picture><figcaption>The public post list, signed out.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/quick-remix-post-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/quick-remix-post.webp" alt="The public page for the Loading posts post: a sentence about loaders, a three-line code block without syntax colors, and a sentence about useLoaderData, under a header with Login with GitHub and Posts." width="1440" height="900" loading="lazy" /></picture><figcaption>A post as readers see it. The page shows the rendered body without the title.</figcaption></figure>
</div>

## How it's built

It's Remix 1.0.4 with React 17 and TypeScript, served by the Remix App Server. Routes are files under `app/routes`, with loaders and actions that run on the server, and the post forms use Remix's `<Form>`. While a form submits, `useTransition` switches its button to "Creating..." or "Updating...". The starter's stylesheets set the look, including a dark theme that follows the system setting.

<figure>
  <picture><source srcset="/images/projects/quick-remix-auth-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/quick-remix-auth.webp" alt="Lines 9 to 35 of app/services/auth.server.ts: a remix-auth Authenticator created with the cookie session storage, three checks that throw if GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET or GITHUB_CALLBACK_URL is missing, and a GitHubStrategy configured from those variables that returns the profile's id and email as the user." width="1440" height="1077" loading="lazy" /></picture>
  <figcaption>The GitHub login in app/services/auth.server.ts.</figcaption>
</figure>

## Deployment attempts

The history shows two deployment setups added and removed on the first night: a pm2 config that builds and starts the app in production mode, and a Fly.io app called quickmix, with a Dockerfile on Node 16. The next morning, a commit named "test self deploy" changed the home page heading to "Welcome to Remix testing!", and the next commit changed it back. The repository doesn't record where it ended up running.

## Running it today

With Node 16, `npm install` still works (its `postinstall` runs `remix setup node`), and `npm run build` followed by `npm start` serves it on port 3000. The server needs `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` and `SESSION_SECRET`, which `.env.sample` lists, and signing in needs a GitHub OAuth app.

For the screenshots, those variables were local placeholders and nothing contacted GitHub. The admin pages were opened with a session cookie signed locally for a sample user, `demo@example.com`, and the three posts are samples created through the admin form.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally with sample posts and a locally signed session in place of the GitHub login, and the code card shows a real file from the repository.
