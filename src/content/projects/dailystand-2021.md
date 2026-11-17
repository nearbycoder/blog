---
title: "DailyStand (2021)"
summary: "A small task tracker from early 2021: a React client built with Vite and Apollo Client, and a Rails API that answers GraphQL queries. It shares its name with the later dailystand.dev, but it's a separate codebase."
role: "Creator"
createdAt: "2021-01-28"
year: "2021"
stack:
  [
    "React",
    "Vite",
    "Apollo Client",
    "Tailwind CSS",
    "Formik",
    "Jest",
    "React Testing Library",
    "Ruby on Rails",
    "GraphQL Ruby",
    "PostgreSQL",
  ]
githubLink: "https://github.com/nearbycoder/dailystand-client"
image: "/images/projects/dailystand-2021.webp"
imageAlt: "DailyStand's All Tasks page: a sidebar with the DailyStand wordmark, All Tasks and Projects links, and a demo user with a placeholder avatar and a Logout link, beside a list of five sample tasks such as Write landing page copy and Fix crash on the login screen, each with a description, its project and how long ago it was created, and a New Task button."
imageCaption: "The All Tasks page, captured by running the client locally from its source against a stand-in for the Rails API, with sample data."
featured: false
accent: "indigo"
draft: false
---

DailyStand is a small web app for keeping a list of tasks, grouped by project. You register with an email and password, add projects, and add tasks to them from a panel that slides in from the right. It's split across two repositories: [dailystand-client](https://github.com/nearbycoder/dailystand-client), a React app built with Vite, and [dailystand-server](https://github.com/nearbycoder/dailystand-server), a Rails API that answers GraphQL queries.

The client was written in 16 commits between January 27 and February 5, 2021, and the server was pushed in a single commit on February 4. Neither has changed since. The name came back in 2026 for [dailystand.dev](/projects/dailystand-dev), an async standup platform, which is a separate codebase on a different stack.

## What it does

- **Accounts.** Register and log in with an email and password. The server checks the password with bcrypt and returns a JSON Web Token that lasts 12 hours. The client keeps the token in `localStorage` and sends it as a bearer token with every request. Errors come back as a list of fields and messages, and the form lists them above the inputs.
- **Tasks.** All Tasks lists every task with its description, its project and how long ago it was created. New Task opens a form with a name, a description and a project picker. Clicking a task opens the same form to update or delete it.
- **Projects.** The Projects page works the same way, with a name and a description for each project.

On narrow screens, the sidebar moves behind a menu button. There's no standup screen yet. The server also models subtasks, with their own queries and mutations, and a completion time on tasks and subtasks, but the client doesn't use either.

<figure>
  <img src="/images/projects/dailystand-2021-login.webp" alt="The Login to your account page with a Register link, a red box reading There were 1 error with your submission and the error email or password does not match, an email field filled in with demo@example.com, a masked password and a Login button." width="1440" height="900" loading="lazy" />
  <figcaption>A failed login, with the error list the API returns. Local run against the stand-in API, with sample data.</figcaption>
</figure>

<div class="project-media-gallery">
  <figure><img src="/images/projects/dailystand-2021-new-task.webp" alt="The New Task panel open over the task list, with the task name Review the onboarding emails, the description Check the copy and links before Friday., and the project picker open on Website redesign, Mobile app and Internal tools, above Cancel and Create buttons." width="1440" height="900" loading="lazy" /><figcaption>Creating a task, with the project picker open. Local run with sample data.</figcaption></figure>
  <figure><img src="/images/projects/dailystand-2021-projects.webp" alt="The Projects page listing Website redesign, Mobile app and Internal tools with their descriptions and created and updated times, and the Update Project panel open for Mobile app, with name and description fields and Delete, Cancel and Update buttons." width="1440" height="900" loading="lazy" /><figcaption>Editing a project. The same panel deletes it. Local run with sample data.</figcaption></figure>
</div>

## How it's built

The client was built on a beta of Vite 2.0 (2.0.0-beta.51 in the lockfile), with React 17 and React Router 5, and each page loads lazily. Apollo Client 3.3 talks to the API, and a few small helpers write each created, updated or deleted record straight into Apollo's cache instead of fetching the list again. Forms use Formik with Yup validation. Styling is Tailwind CSS 2 with its forms plugin, Headless UI runs the panel and menu transitions, and date-fns writes the "Created 2 days" labels.

The server is an API-only Rails 6.0 app with a single route, `POST /graphql`. GraphQL Ruby 1.12 defines the schema, with Relay-style connections for lists and mutations that each take one `input` object, and graphql-batch loaders fetch related users, projects and tasks in batches. Records live in PostgreSQL, passwords use `has_secure_password`, tokens are signed with the jwt gem, and rack-cors lets the client call the API from another origin.

<figure>
  <picture><source srcset="/images/projects/dailystand-2021-login-mutation-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/dailystand-2021-login-mutation.webp" alt="Lines 1 to 28 of login_mutation.rb: a LoginMutation class with required email and password arguments and a TokenType result, whose resolve method finds the user by email and either returns the user with a token or returns an errors list with the field email or password and the message does not match, and a private token method that calls TokenService.encode with the user's id and email." width="1440" height="989" loading="lazy" /></picture>
  <figcaption>The login mutation in dailystand-server, which returns either a token or the error shown above.</figcaption>
</figure>

The client has 18 test files with 43 tests, written with Jest and React Testing Library. Twelve of them render components inside Apollo's `MockedProvider`, so they need no server. They all still pass.

<figure>
  <img src="/images/projects/dailystand-2021-tests.webp" alt="A terminal running npx jest in dailystand-client: 18 PASS lines for test files such as LoginPage.test.jsx, TasksPage.test.jsx and UpdateOrDeleteProject.test.jsx, then Test Suites: 18 passed, 18 total and Tests: 43 passed, 43 total." width="1061" height="920" loading="lazy" />
  <figcaption>The client's test suite, run locally with Node 14.</figcaption>
</figure>

## Running it today

The client still installs from its lockfile and runs with Node 14: `npm install`, then `npm run dev`. It expects the API at `http://localhost:3000/graphql`, which is set in its `.env` file. The server's README covers `bundle install`, `rails db:create`, `rails db:migrate` and `rails s`, which need Ruby 2.6.3 and PostgreSQL, and the server also reads a `JWT_SECRET` environment variable.

Ruby wasn't available for the screenshots on this page, so the client ran against a stand-in: a small Node.js GraphQL server written from the Rails app's schema and resolvers, holding sample data in memory.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from running the client locally against that stand-in with sample data, the code card shows a real file from the server, and the test run is real terminal output.
