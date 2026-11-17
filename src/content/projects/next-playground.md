---
title: "next-playground"
summary: "A one-commit experiment with Next.js 9 from July 2019: a GraphQL endpoint built with Apollo Server as a Next.js API route, and a page that signs in through it with graphql-hooks and keeps the token in a cookie."
role: "Creator"
createdAt: "2019-07-09"
year: "2019"
stack: ["Next.js", "React", "TypeScript", "GraphQL", "Apollo Server"]
githubLink: "https://github.com/nearbycoder/next-playground"
image: "/images/projects/next-playground.webp"
imageAlt: "GraphQL Playground at http://127.0.0.1:5162/api/graphql, with a signIn mutation that passes the username demo and the password example and asks for a token, and the response data.signIn.token: test."
imageCaption: "The signIn mutation in GraphQL Playground, which Apollo Server serves at the API route in development. Captured from a local run of the repository with Node 12."
featured: false
accent: "slate"
draft: false
---

next-playground puts a GraphQL API inside a Next.js app. It was pushed in a single commit in July 2019, within a day of the release of Next.js 9.0.0, which added API routes and built-in TypeScript support, and it uses both. It hasn't been touched since, apart from Dependabot's pull requests.

## What's in it

- **An API route.** `pages/api/graphql.ts` runs Apollo Server (apollo-server-micro 2.6) as a Next.js API route. Its schema has a `sayHello` query, which returns a value from the request context, and a `signIn` mutation, which returns a placeholder token, `"test"`, under a comment that reads "find user and create jwt". The context function logs the request's `jwt` cookie.
- **A sign-in page.** `pages/index.tsx` is a bare form with two text fields and a Submit button. Submitting runs the `signIn` mutation through graphql-hooks and saves the token in a `jwt` cookie with js-cookie. The fields aren't wired up yet: the mutation sends hard-coded values instead of what's typed.
- **Server-side rendering for queries.** A wrapper around the app creates a graphql-hooks client, runs the page's queries during server rendering with graphql-hooks-ssr, and hands the cached results to the browser through graphql-hooks-memcache.

There are also six empty page files, `1-think`, `2-group`, `3-vote`, `4-discuss`, `5-create-action-items` and `6-assign-action-items`. Their names read like the steps of a retrospective meeting, but none of them has any code.

<figure>
  <picture><source srcset="/images/projects/next-playground-api-route-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/next-playground-api-route.webp" alt="Lines 24 to 52 of pages/api/graphql.ts: a signIn resolver that logs made it and returns the token test under the comment find user and create jwt, an ApolloServer created with typeDefs, resolvers and a context function that logs req.cookies.jwt and returns myProperty and user, an exported config that turns off the API route's body parser, and a default export of apolloServer.createHandler for the path /api/graphql." width="1440" height="1149" loading="lazy" /></picture>
  <figcaption>The API route in pages/api/graphql.ts. Apollo Server reads the request body itself, so the route turns off Next.js's body parser.</figcaption>
</figure>

## How it's built

It uses Next.js 9.0.0 with React 16.8, TypeScript 3.5 for the page and the API route, and apollo-server-micro 2.6.7 with graphql 14. The client side is graphql-hooks 3.6, with js-cookie for the token.

## Running it today

It still installs from its lockfile and runs with Node 12. `npm install`, then `npm run dev`, serves the page on port 3000 and GraphQL Playground at `/api/graphql`. The page's GraphQL client points at `http://localhost:3000/api/graphql`, so it expects that port.

The creation date shown here is the GitHub repository's UTC creation date. The screenshot was captured from a local run of the repository with Node 12, and the code card shows the API route's real source.
