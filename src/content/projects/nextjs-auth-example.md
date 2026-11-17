---
title: "nextjs-auth-example"
summary: "An example Next.js app from June 2021: a task list behind GitHub sign-in. NextAuth keeps users and sessions in PostgreSQL through Prisma, and a GraphQL API inside a Next.js API route reads and changes only the signed-in user's tasks."
role: "Creator"
createdAt: "2021-06-17"
year: "2021"
stack:
  [
    "Next.js",
    "React",
    "NextAuth.js",
    "Prisma",
    "PostgreSQL",
    "GraphQL",
    "Apollo Server",
    "Apollo Client",
    "Tailwind CSS",
  ]
githubLink: "https://github.com/nearbycoder/nextjs-auth-example"
image: "/images/projects/nextjs-auth-example.webp"
imageAlt: "The Tasks page of nextjs-auth-example: an indigo navigation bar with a Workflow logo, a Search tasks field, Documentation and Support links and a round avatar, above a list of four tasks (Plan the team offsite, Renew the domain, Fix the leaky faucet and Finish the book club pick), each with a description and Edit and Delete buttons, between two empty dashed side panels."
imageCaption: "The Tasks page, from a local run with sample tasks. The session is a throwaway one inserted into the local database, so no GitHub account is involved."
featured: false
accent: "indigo"
draft: false
---

nextjs-auth-example is a task list that only opens after you sign in with GitHub. It's a Next.js app with NextAuth for sign-in, Prisma and PostgreSQL for storage, and a GraphQL API that runs inside the app as an API route. It was built in 22 commits between June 16 and 18, 2021, starting from Create Next App, and it hasn't changed since. The README is still the Create Next App default.

## What it does

Without a session, every page redirects to NextAuth's built-in sign-in page, which has a single button: Sign in with GitHub. Once you're in, the Tasks page lists your tasks, newest first, with a two-line preview of each description.

- **New Task** opens a form above the list. Formik and Yup require both a name and a description.
- **Edit** opens the same form inside the task's row and saves through an `updateTask` mutation.
- **Delete** removes the task and its subtasks in one Prisma transaction, and drops it from the Apollo cache.

The page sits in a three-column shell with an indigo navigation bar. Only part of it works: the profile menu's Logout signs you out, but the search field, the Documentation and Support links and the other menu items are placeholders, and the two dashed side columns are empty. On small screens the side columns hide and the links move into a menu. The API also models subtasks and a completion time on tasks and subtasks, but the interface doesn't show either.

<div class="project-media-gallery">
  <figure><img src="/images/projects/nextjs-auth-example-new-task.webp" alt="The New Task form open above the task list, with Order new running shoes in the Name field, a two-sentence description about the old pair in the Description field, a close button and a Save button." width="1440" height="900" loading="lazy" /><figcaption>New Task opens a form above the list. This draft wasn't saved.</figcaption></figure>
  <figure><img src="/images/projects/nextjs-auth-example-edit.webp" alt="The Renew the domain row expanded with an indigo outline and an edit form inside it, its Name and Description fields filled with the task's current values, and a Save button." width="1440" height="900" loading="lazy" /><figcaption>Edit opens the same form inside the task's row.</figcaption></figure>
</div>

## Sessions in the GraphQL API

NextAuth uses the GitHub provider and the Prisma adapter, so users, linked accounts and sessions live in PostgreSQL next to the tasks. The API in `pages/api/graphql.js` runs Apollo Server as a Next.js API route. For each request, its context reads the NextAuth session, finds the user by the session's email, and hands the user and the Prisma client to the resolvers.

<figure>
  <picture><source srcset="/images/projects/nextjs-auth-example-context-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/nextjs-auth-example-context.webp" alt="Lines 181 to 207 of pages/api/graphql.js: an ApolloServer created with typeDefs and resolvers and a context function that calls getSession, looks up the user by the session's email with Prisma, and returns the user and the Prisma client, followed by a playground setting that is false in production and otherwise sets request.credentials to include." width="1440" height="1077" loading="lazy" /></picture>
  <figcaption>The Apollo Server context in pages/api/graphql.js turns the NextAuth session into a user for the resolvers.</figcaption>
</figure>

The `tasks` query returns only that user's tasks. `updateTask`, `deleteTask` and `createSubtask` load the task first and throw `Unauthorized` if it belongs to someone else. In development, the same route serves GraphQL Playground with `request.credentials` set to `include`, so its requests carry the session cookie. An early commit turned the Playground off in production.

<figure>
  <img src="/images/projects/nextjs-auth-example-playground.webp" alt="GraphQL Playground at http://127.0.0.1:5171/api/graphql running a Tasks query for the viewer's email and each task's name and subtasks. The response shows test.user@example.com, Plan the team offsite with two subtasks (Book the venue and Send the activity survey), and Renew the domain and Fix the leaky faucet with none." width="1440" height="855" loading="lazy" />
  <figcaption>GraphQL Playground at the API route, answering as the signed-in user. The two subtasks were added through the createSubtask mutation, since the interface has no form for them.</figcaption>
</figure>

Running Apollo Server as a Next.js API route is the same setup as [next-playground](/projects/next-playground) from 2019. The Task and Subtask models, each with a name, a description and an optional completion time, have the same shape as the tables behind [DailyStand (2021)](/projects/dailystand-2021) from earlier that year, without the projects.

<div class="project-media-gallery">
  <figure><img src="/images/projects/nextjs-auth-example-mobile.webp" alt="The app on a phone-sized screen: the indigo bar with the logo, the search field and a menu button, the Tasks heading with a New Task button, and the four tasks with two-line descriptions and Edit and Delete buttons." width="600" height="1022" loading="lazy" /><figcaption>On a phone-sized screen, the side columns are hidden.</figcaption></figure>
  <figure><img src="/images/projects/nextjs-auth-example-mobile-menu.webp" alt="The phone layout with the menu open: Dashboard, Support, Your Profile, Settings and Sign out links on an indigo panel above the task list." width="600" height="1022" loading="lazy" /><figcaption>The mobile menu. Its links are placeholders.</figcaption></figure>
</div>

## How it's built

It uses Next.js 11.0.0 with React 17, NextAuth 3.27 with a canary of the Prisma adapter, and Prisma 2.25. The API is apollo-server-micro 2.25 with graphql 15, and the page talks to it with Apollo Client 3.3. Styling is Tailwind CSS 2.2 with its JIT engine, then still a preview, and the forms and line-clamp plugins, Headless UI 1.2 for the menu and the mobile disclosure, and Heroicons. Three Prisma migrations create NextAuth's tables, add tasks and subtasks, and then make the completion times optional. In this schema, the GitHub account id is stored as an integer.

A `Procfile` starts the app on `$PORT` and runs `prisma migrate deploy` as a release step. Before that, a short-lived `app.json` ran the same command as a Dokku predeploy hook.

Five days later, [next-auth-example](/projects/next-auth-example) started over from a fresh Create Next App, with Chakra UI, a REST route and the GitHub account id stored as a string.

## Running it today

It still installs from its lockfile and runs with Node 14 and PostgreSQL: `yarn install`, `npx prisma migrate deploy`, then `yarn dev`. The settings go in `.env`, following `.env.sample`, and signing in needs your own GitHub OAuth app. On Linux, Prisma 2.25's engines also need the OpenSSL 1.1 libraries.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source with Node 14 and PostgreSQL, signed in with a throwaway user and session inserted into the database (its avatar is GitHub's image for deleted accounts), with sample tasks created through the app. The Workflow logo the app loads from tailwindui.com now returns a 404, so the Wayback Machine's archived copy of that file was served in its place. The code card shows a real source file from the repository.
