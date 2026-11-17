---
title: "ReactPoll"
summary: "A StrawPoll clone from 2017, with a React and Redux front end and an Express and MongoDB API. You write a question and options, share the poll's short link, and the results page updates live over socket.io as votes come in."
role: "Creator"
createdAt: "2017-02-07"
year: "2017"
stack:
  [
    "JavaScript",
    "React",
    "Redux",
    "React Router",
    "Create React App",
    "Node.js",
    "Express",
    "Socket.IO",
    "MongoDB",
    "Mongoose",
  ]
githubLink: "https://github.com/nearbycoder/ReactPoll"
image: "/images/projects/reactpoll.webp"
imageAlt: "ReactPoll's results screen for What should we order for the team lunch?: Tacos with 5 votes at 41.67%, Pizza and Pho with 3 votes at 25.00% each, and Sandwiches with 1 vote at 8.33%, each with a red bar on a yellow lined sheet, under the ReactPoll title on a dark page, with a New Poll button."
imageCaption: "Results for a sample poll with 12 votes, captured from a local run of the client, the API and MongoDB."
featured: false
accent: "yellow"
draft: false
---

ReactPoll is a clone of StrawPoll, the quick poll site, built with React and Redux. Write a question and some options, create the poll, and share its short link. Voters tick an answer and see the results, and a results page that's already open updates by itself as each vote arrives. The repository's description calls it a “StrawPoll.me clone built in react using redux”.

The repository's eight commits were made within 80 minutes of each other in February 2017, and it hasn't changed since. Its homepage, reactpoll.tk, is gone.

## How it works

There are three screens, each a yellow lined sheet on a dark page:

- **New Poll**: a question box that grows as you type, and option fields that add a blank one once every field has text. Two checkboxes allow multiple answers and turn on IP duplicate checking. Create Poll needs a question and at least one option, then opens the poll at its own address, like `/tu9jO`.
- **Vote**: the options as checkboxes. Unless the poll allows multiple answers, ticking one clears the others. See Results sends the vote.
- **Results**: a bar for each option with its votes and percentage. The bars grow to their width over two seconds, and New Poll starts over.

An address that doesn't match a poll leads to a 404 page.

<div class="project-media-gallery">
  <figure><img src="/images/projects/reactpoll-create.webp" alt="The New Poll screen: the ReactPoll title in a sketchy white font on a dark page, and a yellow lined sheet with the question What should we order for the team lunch?, options Tacos, Pizza, Pho and Sandwiches, an empty Enter poll option field, unchecked Multiple Poll Answers and IP Duplication Checking boxes, and a red Create Poll button." width="1440" height="1207" loading="lazy" /><figcaption>Creating the sample poll. A blank option appears once the others are filled.</figcaption></figure>
  <figure><img src="/images/projects/reactpoll-vote.webp" alt="The Vote screen for the same question, with Tacos ticked with a red check, Pizza, Pho and Sandwiches unticked, and a red See Results button." width="1440" height="1197" loading="lazy" /><figcaption>Voting. Without multiple answers, ticking one option clears the others.</figcaption></figure>
</div>

The server is a small Express API. Creating a poll gives it a random five-character ID of letters and digits and drops any empty options. Each vote is a `PUT` with the IDs of the ticked options. With IP checking on, the server records the voter's address and ignores later votes from it. After saving, it broadcasts the updated poll on a socket.io event named for the poll, `vote:<id>`, and every results page for that poll is listening. In the capture run, a results page left open while the votes were cast went from zero to the final counts without a reload.

<figure>
  <picture><source srcset="/images/projects/reactpoll-code-results-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/reactpoll-code-results.webp" alt="Lines 4 to 33 of client/src/containers/ResultsPoll/ResultsPoll.js: the constructor loads the poll and subscribes to the socket.io event vote: plus the poll ID, replacing the poll when it fires, and renderOptions draws each option's vote count and a bar whose width is its share of the total votes." width="1440" height="1257" loading="lazy" /></picture>
  <figcaption>The results screen subscribes to its poll's votes, in client/src/containers/ResultsPoll/ResultsPoll.js.</figcaption>
</figure>

## How it's built

`client/` is Create React App (react-scripts 0.8.5) with React 15.4, Redux 3.6 and redux-thunk, React Router 3 with react-router-redux, react-textarea-autosize and the socket.io client, with Redux DevTools wired in for development. It also has a tiny Express server that serves the production build and answers every path with `index.html`, so a link like `/tu9jO/r` works on reload. The client finds the API through `REACT_APP_SERVER_URL`, which is baked in when it's built.

`server/` is Express 4.14 with Mongoose 4.8 on MongoDB and socket.io 1.7, and it reads `MONGO_URL` from a `.env` file.

## Running it today

The client and the API both still run on Node 8. The repository has no lockfile, so the dependencies were installed as they resolved in February 2017. For the screenshots, the API ran against a local MongoDB 3.4, from the same era as Mongoose 4.8's driver, and the client's own Express server served the build. A script made the sample poll and its 12 votes through the app's screens.

[QikPoll](/projects/qikpoll), from 2026, is a later StrawPoll-style poll app on this site, also with live results.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the client, the API and MongoDB locally from the repository's source with a sample poll, and the code card shows a real source file.
