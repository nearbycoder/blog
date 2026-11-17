---
title: "material.chef"
summary: "A Material Design recipe box from 2015, built with React 0.13 and Flux through Alt.js, with a small Express and MongoDB server for sign-up and login."
role: "Creator"
createdAt: "2015-08-01"
year: "2015"
stack:
  [
    "JavaScript",
    "React",
    "Flux",
    "Alt.js",
    "webpack",
    "Materialize",
    "Node.js",
    "Express",
    "MongoDB",
    "Mongoose",
    "Karma",
    "Jasmine",
  ]
githubLink: "https://github.com/nearbycoder/material.chef"
image: "/images/projects/material-chef.webp"
imageAlt: "material.chef's add recipe form: a red panel on a blue page with Chicken Tortilla Soup as the recipe name, a description, three ingredient rows (chicken breast 1 pound, black beans 1 can, corn tortillas 6), cooking instructions, an empty Image Url field and an Add Recipe button, with round buttons to close the form and to add or remove ingredient rows. A search icon and a Logout button sit in the blue bar above."
imageCaption: "Adding a recipe while signed in. Captured by running the project locally from its source, with a recipe typed in for the capture."
featured: false
accent: "blue"
draft: false
---

material.chef is a recipe box with a Material Design look. Recipes show as cards, View Recipe opens one with its ingredients and cooking instructions, and signed-in users can add their own. The README calls it "my first implementation of using flux with alt.js".

It was built over 28 commits in August 2015, from a webpack and Materialize starting point on August 2 to Karma tests on August 22, and it hasn't been touched since. The recipes are sample data hard-coded in the client, and new ones live only in the browser's memory. The server handles accounts and nothing else.

## What it does

- **Recipe cards.** Each card has an image area, a title, a description and a View Recipe button. Cards bounce in from the sides, fade out when the add form opens, and the single recipe view fades up, all with animate.css.
- **Search.** The box in the top bar filters the cards on every keystroke, matching titles, descriptions and instructions.
- **Accounts.** Sign up or log in from the Material Recipe card. The email and password rules are checked in the browser and again on the server, passwords are hashed with bcrypt, and the server returns a JSON Web Token that the client keeps in `localStorage`. Anyone can browse, but only signed-in users get the add button.
- **Adding recipes.** A red form with a name, a description, as many ingredient and measurement rows as you need, cooking instructions and an image URL. The name, description and instructions are required.
- **Errors.** If the API doesn't answer, the page shows "server is unreachable!" in place of the cards.

<div class="project-media-gallery">
  <figure><img src="/images/projects/material-chef-recipes.webp" alt="The recipe box scrolled to the bottom: blue cards for Supreme Pizza and Fudge Brownies with placeholder hipster-ipsum descriptions, then Chicken Tortilla Soup and Banana Bread with their own descriptions, each card with an empty image area at the top and an orange View Recipe button." width="1440" height="900" loading="lazy" /><figcaption>The bottom of the recipe box, with the two recipes added for the capture after the sample ones. The sample data links its photos from other sites, so the image areas are empty: two of those links are dead, and the other two were blocked for the capture.</figcaption></figure>
  <figure><img src="/images/projects/material-chef-recipe.webp" alt="The single recipe view for Chicken Tortilla Soup: one wide blue card with an empty image area, the description, an Ingredients list reading chicken breast : 1 pound, black beans : 1 can and corn tortillas : 6, and the cooking instructions, with a round close button above it." width="1440" height="758" loading="lazy" /><figcaption>One recipe, with its ingredients and cooking instructions.</figcaption></figure>
  <figure><img src="/images/projects/material-chef-signup.webp" alt="The Material Recipe card with cook@example.com in the Email field, a masked password, Login and Signup buttons, a light blue notice reading Please make sure your password is secured, and the line: Password must contain one capital letter, one lowercase letter, one symbold and must be between 6 and 20 characters long!" width="1440" height="578" loading="lazy" /><figcaption>Signing up with a weak password. The rules are checked before anything is sent to the server.</figcaption></figure>
</div>

## How it's built

The client is React 0.13, written with `React.createClass` and ES2015 classes and compiled by Babel 5 through webpack 1. Alt 0.17 is the Flux layer: three action classes (recipes, search and the user) and three stores, each of which maps actions to handlers with `bindListeners`. The user store calls the API with superagent. react-router 0.13 handles two hash routes, the recipe box at `/` and the login card at `/login`. The styles are materialize-sass 0.95 and animate.css, compiled with node-sass through webpack's sass-loader, and the page loads Materialize 0.97's JavaScript from cdnjs.

<figure>
  <picture><source srcset="/images/projects/material-chef-store-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/material-chef-store.webp" alt="Lines 2 to 31 of RecipeStore.js: it requires the Alt instance and RecipeActions, sets up recipes, fullrecipes, hidden, single and singlerecipe in the constructor, binds seven handlers to actions like FILTER_RECIPES, ADD_RECIPE and SELECT_RECIPE, and filters fullrecipes by title, info and instructions in handleRecipeSearch." width="1440" height="1185" loading="lazy" /></picture>
  <figcaption>The recipe store. Alt wires each recipe action to a handler, and the search handler filters the full list.</figcaption>
</figure>

The server is about 150 lines of Express 4.0, with `/signup` and `/login` routes and an `/api` route that checks the token. Users (an email and a bcryptjs hash) are stored in MongoDB through Mongoose 3.6, and tokens are signed with jsonwebtoken and expire after 24 hours. The token check is the same middleware as in [CarlPapa](/projects/carlpapa), the recipe app built with Carl Brown the month before.

The last two commits added tests: Karma 0.13 and Jasmine, with karma-webpack bundling the specs and isparta instrumenting the source for coverage. The two specs render the home and add-recipe components with React's TestUtils. The repository still holds the coverage report from that night, produced in Chrome 44 on OS X 10.11.

<figure><img src="/images/projects/material-chef-coverage.webp" alt="An Istanbul coverage report for all files: 71.01% of statements, 54.62% of branches, 58.25% of functions and 53.95% of lines, with rows for scripts, actions, components, configs and stores, and a footer reading Generated by istanbul at Sat Aug 22 2015 23:54:51 GMT-0500 (CDT)." width="1440" height="520" loading="lazy" /><figcaption>The coverage report committed to the repository on August 22, 2015.</figcaption></figure>

## Running it today

It still runs with tools from its time. With Node 6:

1. In `client`, install node-sass 3, which has prebuilt binaries for Node 6 (the package.json asks for any version), then run `npm install`.
2. Create `client/scripts/configs/config.js`, which git ignores, exporting the API's base `url`, such as `http://localhost:9090/`.
3. Build with `./node_modules/.bin/webpack` and serve the `client` folder with any static server.
4. In `server`, run `npm install`, copy `config.js.example` to `config.js`, and give it a MongoDB `db` URL and a `secret` for signing tokens. `node server.js` starts the API on port 9090. MongoDB 3.6 still works with the old Mongoose driver.
5. `./node_modules/karma/bin/karma start karma.conf.js` runs the specs in Chrome. In a headless Chromium today, both still pass.

Two bugs show up along the way. Searching after you add a recipe throws, because new recipes have no `instructions` field for the filter to read. Logging in with an unknown email crashes the server, because the login route reads the user's email before checking that the user exists.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the project locally from its source with Node 6 and MongoDB 3.6, the coverage report comes from the repository, and the code card shows the project's own source.
