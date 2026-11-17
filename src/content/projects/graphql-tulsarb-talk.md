---
title: "GraphQL at TulsaRB 2018"
summary: "A talk introducing GraphQL, written for TulsaRB, Tulsa's Ruby user group, in 2018: why REST endpoints multiply as an app grows, and how one query can ask for exactly the data a client needs. It comes with a small Rails and GraphQL Ruby demo server for users, posts and votes."
role: "Speaker"
createdAt: "2018-02-19"
year: "2018"
stack: ["GraphQL", "Ruby", "Ruby on Rails", "GraphQL Ruby", "SQLite", "JavaScript", "React", "styled-components"]
githubLink: "https://github.com/nearbycoder/tulsarb-graphql-slides"
image: "/images/projects/graphql-tulsarb-talk.webp"
imageAlt: "The talk's first slide on a dark background: Graphql in large pink letters above A query language for your API in orange, with a 1 of 56 counter in the top right corner."
imageCaption: "The first slide, captured from the deck running locally from its source."
featured: false
accent: "fuchsia"
draft: false
---

These are the slides for a talk introducing GraphQL, written for TulsaRB, Tulsa's Ruby user group, in 2018. A companion repository, [tulsarb-graphql-server](https://github.com/nearbycoder/tulsarb-graphql-server), holds a small Rails app that serves a GraphQL API for users and posts. Both were pushed on February 19, 2018, and neither has changed since.

## The talk

The deck makes its case against REST with one growing example. A users resource needs five endpoints, and posts under users need five more. Then a feature request to upvote and downvote posts adds two routes and new controller code "for a simple boolean flip". Fetching nested data means either custom endpoints like `/users_with_posts/:id`, or responses full of links that take more requests to follow.

<figure><img src="/images/projects/graphql-tulsarb-talk-rest.webp" alt="Slide 14 of 56: two REST routes in white monospace text on a dark background, PUT /users/:id/posts/:post_id/upvote and PUT /users/:id/posts/:post_id/downvote." width="1280" height="800" loading="lazy" /><figcaption>Two more REST routes for one small feature.</figcaption></figure>

The rest of the deck answers with GraphQL. A query describes what you want back in the shape you want to receive it, and the response comes back in that shape. Aliases fetch two users in one request, a recursive query shows how deep nesting can go (a later slide says "Don't do this"), and further examples cover pagination, filtering and mutations.

<div class="project-media-gallery">
  <figure><img src="/images/projects/graphql-tulsarb-talk-query.webp" alt="Slide 27 of 56: a GraphQL query in large monospace text, user(id: 1) asking for id, firstName, lastName, email, and the user's posts with id, title and votes." width="1280" height="960" loading="lazy" /><figcaption>A query for one user and their posts.</figcaption></figure>
  <figure><img src="/images/projects/graphql-tulsarb-talk-response.webp" alt="Slide 28 of 56: the JSON response with data.user holding id 1, firstName Lafayette, lastName Jones, an email address, and a posts array with one post, id 89, the title Quia aut fuga voluptatem libero., and 96 votes." width="1280" height="960" loading="lazy" /><figcaption>The response, in the same shape. The names and the lorem ipsum title are sample data on the slide.</figcaption></figure>
</div>

The talk then breaks for a demo and code walkthrough, lists client frameworks and server languages that work with GraphQL, names what it didn't cover (fragments, caching, cursor pagination, Relay nodes and edges, and auth), and ends with links to graphql-ruby, Apollo and awesome-graphql.

## The demo server

The server is a Rails 5.1 app on SQLite with GraphQL Ruby 1.7, set up with the gem's `graphql:install` generator. It answers at `/graphql`, with GraphiQL at `/graphiql` in development. The schema has two object types, `User` and `Post`, with queries for lists (taking `offset` and `limit`) and single records, and mutations to create and update users and posts, and to upvote and downvote a post: the same feature that cost two new routes on the REST slides.

<figure>
  <picture><source srcset="/images/projects/graphql-tulsarb-talk-mutations-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/graphql-tulsarb-talk-mutations.webp" alt="Lines 52 to 73 of mutation_type.rb: an upvotePost field that finds a post by id and increments its votes, and a downvotePost field that decrements votes unless they're already zero, each returning the post." width="1440" height="897" loading="lazy" /></picture>
  <figcaption>Upvoting and downvoting as two mutations, from <code>app/graphql/types/mutation_type.rb</code> in the demo server.</figcaption>
</figure>

A small instrumenter renames Ruby's snake_case fields and arguments to camelCase (`first_name` becomes `firstName`). Associations are preloaded with graphql-preload, which batches them through graphql-batch, and graphql-errors turns validation failures into GraphQL errors and missing records into `null`. A `db:prepare` rake task resets the database and fills it with five Faker users with five posts each, and Rack::Cors accepts requests from any origin.

Not every slide matches this server. Its lists take `offset` and `limit`, for example, while the pagination slides use `first` and `skip`.

## How the deck is built

The deck reuses the React and styled-components slide code from the [Styled Components talk](/projects/styled-components-talk) at Tulsa TechFest the summer before, this time with 56 slides. It runs the same way: with Node 8 and Yarn 1, `yarn start` serves it, and each slide has its own URL. The demo server's camelizing instrumenter is the same one used by the [GraphQL Store](/projects/graphql-store), a larger Rails and GraphQL Ruby API with a React client from two months earlier.

The creation date shown here is the GitHub repository's UTC creation date. The slides were captured by running the deck locally from its source, and the code card shows the demo server's source.
