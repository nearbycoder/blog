---
title: "Who's Up Next"
summary: "The start of an app for keeping track of whose turn is next among groups of people, from April 2019. It's a GraphQL API built with Apollo Server and TypeORM over people, categories and events, with the plan sketched in the README."
role: "Creator"
createdAt: "2019-04-19"
year: "2019"
stack: ["TypeScript", "Node.js", "TypeORM", "Apollo Server", "GraphQL", "PostgreSQL"]
githubLink: "https://github.com/nearbycoder/whos-up-next"
image: "/images/projects/whos-up-next.webp"
imageAlt: "GraphQL Playground at http://127.0.0.1:5166/ with a query for categories and the title, first name and last name of their people, and the response starting with the Kids category and its people Alex Kim, Jordan Lee and Riley."
imageCaption: "A query for every category and its people in GraphQL Playground, from a local run of the server with Node 10. The database is SQLite instead of PostgreSQL (a temporary change to ormconfig.json), and the people are sample data."
featured: false
accent: "teal"
draft: false
---

Who's Up Next is the start of an app for keeping track of whose turn is next. The README sketches the idea in a few lines: a list of people in a set order, grouped into categories such as kids, friends, family and manager, and events ordered by when they were completed, then a short worked example of three people in order, each paired with an event. Its last line is "Who's up next".

The code that exists is the server, a GraphQL API with Apollo Server and TypeORM over four entities. It was pushed in a single commit in April 2019 and hasn't changed since, so the ordering and completion dates from the README never made it into the model, and there's no client.

## The API

- **Entities.** `User` has an email and a name. `Category` has a title, a description and its people. `Person` has a name, a description, one category and many events. `Event` has a title, a description and many people, through a join table. The relations are lazy, typed as promises, so TypeORM only loads them when they're read.
- **Queries.** `users`, `categories`, `events` and `people` each return every row, and nested fields like an event's people or a person's category resolve straight from the lazy relations.
- **Mutations.** `createUser`, `createCategory`, `createEvent` and `createPerson` each return a payload with the new record or an error message.

<figure>
  <picture><source srcset="/images/projects/whos-up-next-person-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/whos-up-next-person.webp" alt="Lines 20 to 49 of Person.ts: a TypeORM entity class with static create and new helpers, a generated id, firstName, lastName and a text description column, a many-to-one category typed as Promise of Category, and a many-to-many events relation typed as Promise of an Event array." width="1440" height="1185" loading="lazy" /></picture>
  <figcaption>The Person entity, with its lazy relations to Category and Event.</figcaption>
</figure>

It's unfinished in a few places. `createPerson` has no description argument, but the column is required, so creating a person always fails. Passing `people` to `createCategory` echoes them back without saving them, because the relation doesn't cascade. The schema file also still carries comments about books from Apollo Server's getting-started example.

<figure>
  <picture><source srcset="/images/projects/whos-up-next-create-person-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/whos-up-next-create-person.webp" alt="GraphQL Playground running a createPerson mutation with the first name Alex and the last name Kim, asking for the person's id and the error, and the response with person: null and the error SQLITE_CONSTRAINT: NOT NULL constraint failed: person.description." width="1440" height="806" loading="lazy" /></picture>
  <figcaption>createPerson fails on the required description column. From the local run against SQLite. PostgreSQL would refuse the row the same way.</figcaption>
</figure>

## How it's built

The server started from the project that `typeorm init` generates, and its README and package description are still the template's. It's TypeScript 2.5 run with ts-node, TypeORM 0.2.16 on PostgreSQL through `pg`, and Apollo Server 2.4 with graphql 14. `createConnection()` reads `ormconfig.json`, which has `synchronize` turned on, so TypeORM creates the tables from the entities.

## Running it today

It still installs with Yarn 1 and starts with Node 10: `yarn` in the `server` folder, then `npm start`. Apollo Server listens on port 4000 and serves GraphQL Playground there, and the server expects a local PostgreSQL database called `whos_up_next`. For this page, `ormconfig.json` pointed at a SQLite file instead, with the `sqlite3` package added. The categories and events were created through the API, and the sample people and their event links were inserted into the database directly, since the API can't create them.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from running the server locally with that SQLite change and sample data, and the code card shows a real file from the repository.
