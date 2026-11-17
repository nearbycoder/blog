---
title: "nearbycoder.tk"
summary: "Josh Hamilton's 2015 portfolio: a one-page AngularJS and Materialize site that types its introduction in a pixel font, then opens onto projects like React.Chat and node-pirate. A Ghost blog with the Decode theme went with it."
role: "Creator"
createdAt: "2015-08-28"
year: "2015"
stack: ["AngularJS", "Materialize", "Sass", "Bower", "Grunt", "Ghost"]
githubLink: "https://github.com/nearbycoder/oldnearbycoder.tk"
image: "/images/projects/nearbycoder-tk.webp"
imageAlt: "The nearbycoder.tk portfolio on a bright blue page: the logo Nearby</>Coder in a pixel font, the line I am a web developer with a passion to code. Currently I work with ruby on rails, php, and javascript frameworks such as angularjs and react, a collapsed menu with Who Am I?, Open Source Projects, Fun Stuff and Social Links, and a Skills card with progress bars for Ruby On Rails, Angularjs, React and PHP."
imageCaption: "The page after its typing intro, running locally from the repository's source with the Bower packages its version ranges resolved to in mid-2015."
featured: false
accent: "blue"
draft: false
---

nearbycoder.tk was Josh Hamilton's portfolio in the summer of 2015. It's a single page on a bright blue background where the logo, Nearby&lt;/&gt;Coder, types itself out in a pixel font, followed by a short introduction. Then a menu fades in with an about panel, open source projects, an embedded poll and social links, above a card of animated skill bars.

The commits run from July 7 to August 3, 2015, and the repository, oldnearbycoder.tk, went up on GitHub on August 28. The .tk domain no longer resolves. A companion repository created the same day, [ghost-blog](https://github.com/nearbycoder/ghost-blog), holds the Ghost blog for the site.

## The page

It's an AngularJS app scaffolded with Yeoman's Angular generator, using ui-router for its one route, Materialize for the components and TheaterJS for the typing. TheaterJS gives each "actor" an experience level that sets its speed and accuracy. The logo's actor is set to 0.5, so it types slowly and hits neighboring keys, then backspaces over them. The introduction's actor is set to 1 and types cleanly. A cookie skips the show on later visits and prints the text right away.

<figure><img src="/images/projects/nearbycoder-tk-typing.webp" alt="The Nearby&lt;/&gt;Coder logo in a pixel font over a blue background, with the introduction typed partway: I am a web developer with a passion to code. Currently I work with ruby on rails," width="1000" height="200" loading="lazy" /><figcaption>The introduction partway through typing, about 14 seconds after the page loads.</figcaption></figure>

The menu is a Materialize popout collapsible with four panels. Who Am I? has a Gravatar and a paragraph about working as a web developer at Fabricut with Ruby on Rails, AngularJS and an in-house PHP framework. Open Source Projects lists [React.Chat](/projects/react-chat), [Material Poll](https://github.com/nearbycoder/materialpoll) and [node-pirate](/projects/node-pirate), with GitHub, demo and npm links. Fun Stuff embeds a poll from Material Poll's demo site, and Social Links lists LinkedIn, GitHub, Twitter and an email address. When the typing ends, the Skills card fills its bars: Ruby on Rails 80%, AngularJS 60%, React 40%, PHP 85%, JavaScript 67%, Sass 50% and CSS 90%.

<div class="project-media-gallery">
  <figure><img src="/images/projects/nearbycoder-tk-projects.webp" alt="The Open Source Projects panel popped out of the menu: React.Chat with links to github.com/nearbycoder/react.chat and reactchat.tk, Material Poll with links to github.com/nearbycoder/materialpoll and matterialpoll.tk, and Node Pirate with links to GitHub and npmjs.com/package/node-pirate and the line How to install : npm install node-pirate -g, each with a round blue icon and a star." width="1280" height="800" loading="lazy" /><figcaption>Open Source Projects. The .tk demo sites are gone.</figcaption></figure>
  <figure><img src="/images/projects/nearbycoder-tk-about.webp" alt="The Who Am I? panel open: a round illustrated avatar beside a paragraph reading I am currently a web developer for Fabricut Inc., listing Ruby on Rails, AngularJS and an in-house PHP framework, and skills from HTML and CSS to Postgresql, Mysql and MongoDB, with the rest of the menu and the Skills card below." width="1280" height="800" loading="lazy" /><figcaption>Who Am I? The avatar loads live from Gravatar, so it shows today's picture.</figcaption></figure>
</div>

The commit messages read like a short diary. Material Poll went into Fun Stuff on the first day, and the Gruntfile's concurrent task came out "due to single core digital ocean droplet". On July 8 the skills widget arrived, and the Roboto font went in and came back out within ten minutes. node-pirate joined the projects on July 12, React.Chat and a React skill bar on July 30, and the CSS animations were removed on August 3.

## The blog

[ghost-blog](https://github.com/nearbycoder/ghost-blog) is a full Ghost 0.6.4 install, from when Ghost ran on Node 0.10 or 0.12. Its default Casper theme is swapped for Decode 0.7.2, an MIT-licensed theme by Scott Smith. The theme is close to stock: the footer drops its "Proudly published with Ghost" and theme credit lines, the gulpfile gets a separate Bower task, and the built CSS and JavaScript are committed. There are no posts in the repository, since Ghost keeps them in its database.

## Running it today

The portfolio still runs from its source, with stand-ins for some of the 2015 tooling. `npx bower install` fetches the front-end packages. Today the version ranges in `bower.json` resolve to AngularJS 1.8, which logs a ui-router transition error, so the screenshots pin the versions those ranges gave in August 2015: AngularJS 1.4.3, ui-router 0.2.15, Materialize 0.97.0, jQuery 2.1.4 and TheaterJS 1.4.2. The modern `sass` package compiles `main.scss` in place of Compass, and a small static server maps `/bower_components` beside `app/`, as `grunt serve` did. The Grunt build, the Karma tests and the Ghost install weren't run.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the portfolio locally from its source, with mid-2015 Bower packages and the Sass compiled by today's sass package.
