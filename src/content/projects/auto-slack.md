---
title: "auto-slack"
summary: "A small Node.js bot from 2017 that reacts to messages in one Slack channel. Greetings get a random greeting emoji, talk of lunch gets a random food, and every reaction arrives after a random delay of up to a minute."
role: "Creator"
createdAt: "2017-07-06"
year: "2017"
stack: ["Node.js", "JavaScript", "Slack API", "Babel"]
githubLink: "https://github.com/nearbycoder/auto-slack"
image: "/images/projects/auto-slack.webp"
imageAlt: "A terminal capture titled auto-slack on Node 8.17.0, offline. Sample messages in #munstersuniversity get picks like :eye: for Good morning everyone!, :fried_shrimp: for a lunch question, and :wave: plus :taco: for a message with both hello and lunch, each with a random delay. A deploy message matches nothing and a message in #general is ignored. At the end, four reactions.add calls fire between 13.9 and 49.5 seconds."
imageCaption: "Sample messages run locally through the bot's compiled message handler on Node 8, with no network. The Slack client and the reactions.add request are stubbed to print what would be sent."
featured: false
accent: "amber"
draft: false
---

auto-slack watches one Slack channel, #munstersuniversity, and adds emoji reactions to messages there. A message with the word "morning" or "hello" gets one emoji picked at random from seven: wave, coffee, zzz, sleeping, point_up, eye and spock-hand. "Lunch" or "break" gets one of fourteen foods, from pizza and tacos to ramen and ice cream, and a message can get one of each. The bot waits a random time of up to a minute before it reacts, and it never posts messages of its own.

It was written in ten commits between June and September 2017 and hasn't changed since. There's no README. A `sample.env` file lists the one setting it needs, the bot's `API_TOKEN`.

<figure><picture><source srcset="/images/projects/auto-slack-emoji-parser-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/auto-slack-emoji-parser.webp" alt="A code card of auto-slack's lib/EmojiParser.js, lines 45 to 70: run() lowercases the message, matches whole words with a regular expression, keeps each emoji set whose matchers include one of the words, and picks one emoji at random from each set. buildRequest() waits a random time of up to 60,000 milliseconds, then calls Slack's reactions.add for each emoji." width="1440" height="1041" loading="lazy" /></picture><figcaption>Matching words and picking emoji in lib/EmojiParser.js.</figcaption></figure>

## How it changed

The first version reacted with `wave` to greetings and `pizza` to lunch. It found words by splitting the message on spaces, so its matchers also had to list "morning!" and "hello!". In July a commit added the random delay. In September the words were matched with a regular expression instead, each set of matchers got a list of emoji to pick from, and "break" moved from the greetings to the food.

## How it's built

It's ES2015 JavaScript with stage-0 features, compiled by Babel 6 into `dist/` when the package installs. The slackbots library connects to Slack's real-time messaging API and loads the channel and user lists at startup. Reactions go straight to Slack's `reactions.add` method through node-fetch, and a Procfile runs the compiled server under forever.

The package and its `EmojiParser` class have the same structure as [Afterhours Bot](/projects/slackbot-afterhours), which was started five days earlier. `package.json` still lists that bot's Express and Yahoo YQL dependencies, though auto-slack doesn't use them.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the repository's compiled code locally on Node 8 with sample messages and stubs in place of Slack, and the code card is rendered from its source.
