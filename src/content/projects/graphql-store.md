---
title: "GraphQL Store"
summary: "An online store with GraphQL on both sides: a Rails and GraphQL Ruby API with token auth, roles, carts and Pundit policies, and a React storefront on Apollo Client with search, pagination and sign-in. Both halves were written in one week in December 2017."
role: "Creator"
createdAt: "2017-12-18"
year: "2017"
stack: ["JavaScript", "React", "Create React App", "Apollo Client", "React Router", "styled-components", "GraphQL", "Ruby", "Ruby on Rails", "GraphQL Ruby", "Devise", "PostgreSQL"]
githubLink: "https://github.com/nearbycoder/graphql_store_client"
image: "/images/projects/graphql-store.webp"
imageAlt: "The GraphQL Store product list, signed in as shopper@example.com: a blue GRAPHQL STORE logo, a search box, a SignOut link, and a three-by-three grid of product cards such as Sample Pad Thai, Sample Ramen and Sample Pho, each with its ingredients, a Choose a variant menu and an Add to Cart button. On Sample Margherita Pizza the Regular $10.75 variant is picked and its button reads $10.75 Add to Cart."
imageCaption: "The product list, signed in. Captured by running the client locally from its source against a local stub of the server's GraphQL schema; the products and the account are made-up sample data."
featured: false
accent: "sky"
draft: false
---

GraphQL Store is an online store in two repositories: a Rails API that speaks GraphQL, [graphql_store_server](https://github.com/nearbycoder/graphql_store_server), and a React storefront, graphql_store_client, that talks to it through Apollo Client. Both were written between December 17 and 23, 2017, and neither has changed since.

The screenshots on this page come from the client running locally. The Rails server wasn't run for them. Instead, a small local stub, written from the server's GraphQL schema, answered the client's queries with made-up products.

## The storefront

The home page lists products nine at a time, with Next Page and Prev Page buttons that move the query's `offset`. The search box in the header filters by name as you type. Each card has a menu of variants with their prices. Signed out, its button reads "Please Login to Buy". Signed in, it reads Add to Cart and becomes clickable once you pick a variant, though it isn't wired to anything yet.

<figure><img src="/images/projects/graphql-store-search.webp" alt="The GraphQL Store header with ra typed into the search box and SignIn and SignUp links, above two product cards, Sample Ramen and Sample Falafel Wrap, each with a Choose a variant menu and a disabled Please Login to Buy button." width="830" height="400" loading="lazy" /><figcaption>Searching for "ra" while signed out. Running locally against the stub, with sample products.</figcaption></figure>

The rest of the client is accounts: sign up, sign in, sign out, a forgot-password form, and a reset page for the link in the email. Signing in returns devise_token_auth's `access-token`, `client` and `uid`. The client keeps them in localStorage, and an Apollo link adds them as headers to every request. Each route checks the stored token with a `validToken` query, and a banner across the top shows success and error messages for five seconds.

<div class="project-media-gallery">
  <figure><img src="/images/projects/graphql-store-signup.webp" alt="The sign-up form in a blue-bordered box on a pale diamond-patterned background, with the GRAPHQL STORE logo and fields for Full Name, Email, Password and Password Confirmation, a Sign In link and a disabled Sign Up button." width="750" height="600" loading="lazy" /><figcaption>Sign up.</figcaption></figure>
  <figure><img src="/images/projects/graphql-store-signin-error.webp" alt="The sign-in form filled in with shopper@example.com and a masked password, under a red banner reading Invalid Credentials, with Sign Up and Reset Password links and a Sign In button." width="750" height="600" loading="lazy" /><figcaption>A failed sign-in. The stub returns the same "Invalid Credentials" error the server does.</figcaption></figure>
  <figure><img src="/images/projects/graphql-store-forgot.webp" alt="The forgot-password form with the GRAPHQL STORE logo, one Email field, a Sign In link and a disabled Send Reset Email button." width="750" height="600" loading="lazy" /><figcaption>Forgot password.</figcaption></figure>
</div>

A product page at `/products/:id` exists too, but it only prints the product's name, description and image, with no styling yet.

## The API

The server is Rails 5.1 in API mode on PostgreSQL, with GraphQL Ruby 1.7 serving one `/graphql` endpoint. Its types cover users, products, variants, carts and cart items. Every list query is a search_object resolver with filters for IDs, timestamps and fields like name, plus ordering and `offset` and `limit`. The storefront's search box uses the `name` filter on products, which matches with `ILIKE`.

- **Accounts.** devise_token_auth on top of Devise, with mutations to register, sign in, sign out, update or delete your account, and reset a password. The reset email links back to the client's `/reset-password` page.
- **Permissions.** Roles come from rolify, and Pundit policies, checked in the resolvers and service objects, decide who can do what. Anyone can browse products, only admins can create, change or delete products and variants, and carts and cart items are open only to their owner or an admin.
- **Carts.** Each user gets an active cart, created on first use, and cart items point at a variant with a quantity.
- **Soft deletes and images.** Records are soft-deleted with paranoia, so types expose `deletedAt`. Products and variants have Paperclip images stored on S3, uploaded through the API as base64 strings.
- **Sample data.** A rake task creates 100 products named after Faker dishes, each with five variants and a random photo from Unsplash.

<figure>
  <picture><source srcset="/images/projects/graphql-store-schema-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/graphql-store-schema.webp" alt="The 29-line graphql_store_schema.rb: GraphqlStoreSchema defined with a query root and a mutation root, a GraphQL::Pundit instrumenter, a FieldNameCamelizer for fields and arguments, GraphQL::Batch with preloading, and a GraphQL::Errors block that turns RecordNotFound, RecordInvalid and Pundit::NotAuthorizedError into GraphQL errors, with a catch-all handler commented out." width="1440" height="1149" loading="lazy" /></picture>
  <figcaption>The schema definition, from <code>app/graphql/graphql_store_schema.rb</code> in the server.</figcaption>
</figure>

The server also has a REST-style `ProductsController` whose actions build GraphQL query strings and run them through the same schema, added as an example of using GraphQL from a Rails controller.

## How the client is built

The client is React 16.2 from Create React App 1.0, with Apollo Client 2 and react-apollo, React Router 4, styled-components 2 with styled-css-grid, react-final-form for the forms, and redux-zero to hold the search text. The list and detail queries share one GraphQL fragment for products. The API address, `localhost:3000/graphql`, is hardcoded.

The client still starts with Node 8 and Yarn 1, but the server is harder to bring back: besides PostgreSQL, its development config reads S3 settings from the environment.

Two months later, the demo server for the [GraphQL talk at TulsaRB](/projects/graphql-tulsarb-talk) reused this server's camelizing instrumenter.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the client locally from its source against a local stub of the server's GraphQL schema, with made-up sample data, and the code card shows the server's source.
