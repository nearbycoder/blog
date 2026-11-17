---
title: "next-auth-example"
summary: "A small Next.js app from 2021 with GitHub sign-in through NextAuth and Prisma: a Chakra UI form that saves posts through an API route, which checks the session and validates the body with the same Yup schema as the form."
role: "Creator"
createdAt: "2021-06-22"
year: "2021"
stack: ["Next.js", "React", "NextAuth.js", "Prisma", "PostgreSQL", "Chakra UI", "Formik"]
githubLink: "https://github.com/nearbycoder/next-auth-example"
image: "/images/projects/next-auth-example.webp"
imageAlt: "next-auth-example's page: a blue bar with a Sign out button above a form with a Title field containing Hello from a local run, a Body field containing This post is saved through the /api/posts route for the signed-in user., and a blue Submit button."
imageCaption: "The post form, filled in with sample text. Captured from a local run, signed in with a throwaway session."
featured: false
accent: "blue"
draft: false
---

next-auth-example signs you in with GitHub and gives you one form, for writing a post with a title and a body. Submitting it sends the post to an API route, which saves it for the signed-in user. There's no list of posts: the form clears when the save succeeds.

It was started in June 2021, five days after [nextjs-auth-example](/projects/nextjs-auth-example), from a fresh Create Next App rather than a copy of it. It was worked on in three short bursts, in June, August and September 2021, and it hasn't changed since. The README is the Create Next App default.

## How it works

Without a session, the app sends you to NextAuth's built-in sign-in page, which has a single GitHub button. Signed in, you get a blue bar with a Sign out button and the form. Formik validates the fields against a Yup schema, and once you leave a field or submit the form, Chakra UI marks the empty ones.

<figure>
  <img src="/images/projects/next-auth-example-validation.webp" alt="The same form after submitting it empty: the Title and Body fields have red borders, and each shows * Required in red below it." width="1440" height="690" loading="lazy" />
  <figcaption>Submitting the form empty. Both fields are required.</figcaption>
</figure>

The form posts JSON to `/api/posts`. The route reads the session with `getSession` and answers 401 without one. Otherwise it finds the session's row in the database by its access token, loads that session's user, and checks the body against the same Yup schema the form uses, which it imports from the form's component. A valid post is created with Prisma and returned. An invalid one gets a 500 with a short error.

<figure>
  <img src="/images/projects/next-auth-example-api.webp" alt="A terminal that sets API to http://127.0.0.1:5172/api/posts and CT to a JSON content type, then runs three curl POSTs. Without a cookie, the JSON answer is unauthorized: true with HTTP 401. With the session cookie and empty fields, it's error: validation error with HTTP 500. With the cookie, a title and a body, it's the new post's id, title, body, userId local-test-user and timestamps, with HTTP 200." width="1229" height="432" loading="lazy" />
  <figcaption>The API route's three answers: no session, an invalid body, and a saved post. Run against a local copy, where session.txt holds the throwaway session's cookie.</figcaption>
</figure>

## GitHub ids as strings

The first version stored the GitHub account id as an integer, as nextjs-auth-example does. A day later, a commit titled "fixes issue with GitHub Int" changed the column to a string and gave the GitHub provider a profile callback that converts the id with `toString()`, falling back to the GitHub login when there's no display name.

<figure>
  <picture><source srcset="/images/projects/next-auth-example-nextauth-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/next-auth-example-nextauth.webp" alt="Lines 6 to 31 of pages/api/auth/[...nextauth].js: NextAuth configured with the GitHub provider, whose profile callback, under the comment fixes issue where schema was changed to int, returns the id as profile.id.toString(), the name or else the login, the email and the avatar URL, followed by a JWT signing key from an environment variable, the database URL and the Prisma adapter." width="1440" height="1041" loading="lazy" /></picture>
  <figcaption>The NextAuth configuration in pages/api/auth/[...nextauth].js, with the profile callback from that fix.</figcaption>
</figure>

## How it changed

- **June:** GitHub sign-in, and a page that showed who you were signed in as. A second pass checked the session on the server in `getServerSideProps` and redirected to the sign-in page.
- **August:** the `Post` model, the `/api/posts` route and a plain HTML form.
- **September 7:** the route switched from finding the user by email to finding the session's row first, the form moved to Formik and Yup and then to Chakra UI, and a cleanup moved the sign-in check into an `Auth` component that wraps every page in the browser, replacing the server-side redirect.

## How it's built

It uses Next.js 11.0.0 with React 17, NextAuth 3.27 with a canary of its Prisma adapter, and Prisma 2.25 on PostgreSQL, with two migrations: NextAuth's tables, then posts. The interface is Chakra UI 1.6 on Emotion 11 and Framer Motion 4, with Formik 2.2 and Yup 0.32 for the form.

## Running it today

It still installs from its lockfile and runs with Node 14 and PostgreSQL: `yarn install`, `npx prisma migrate deploy`, then `yarn dev`. The settings go in `.env`, following `.env.example`, and signing in needs your own GitHub OAuth app. On Linux, Prisma 2.25's engines also need the OpenSSL 1.1 libraries.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots and the terminal capture come from running the project locally from its source with Node 14 and PostgreSQL, signed in with a throwaway user and session inserted into the database, with sample post text. The code card shows a real source file from the repository.
