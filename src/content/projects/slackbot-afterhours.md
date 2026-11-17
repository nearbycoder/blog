---
title: "Afterhours Bot"
summary: "A Node.js Slack bot from 2017 that reacts to moods with emoji, answers weather questions by ZIP code, and welcomes people who join a channel. A contributor's pull request taught it to say goodbye too."
role: "Creator"
createdAt: "2017-06-25"
year: "2017"
stack: ["Node.js", "JavaScript", "Slack API", "Babel", "YQL"]
githubLink: "https://github.com/nearbycoder/SlackBotAfterhours"
image: "/images/projects/slackbot-afterhours.webp"
imageAlt: "A terminal capture titled SlackBotAfterhours on Node 8.17.0, offline. Sample messages in #general get a smile reaction for So happy it's Friday, a house_with_garden reaction and a weather reply for New York City for a message about working from home with ZIP code 10001, a Chicago weather reply for weather 60601, and a disappointed reaction for upset that the build broke again. The weather is nice gets no reply, a new user is welcomed, and a user who leaves gets Hey @everyone sample-user just left."
imageCaption: "Sample events run locally through the bot's compiled handler on Node 8, with no network. Slack and the reactions.add request are stubbed to print what would be sent, and since Yahoo's YQL is gone, a stub answers the weather query with current conditions fetched from Open-Meteo."
featured: false
accent: "indigo"
draft: false
---

Afterhours Bot is a small Slack bot written in Node.js in June 2017. It reads the messages in the channels it's in and does three things:

- **Reacts to moods.** "Happy", "happier" or "excited" gets a `:smile:` reaction, "sad", "upset" or "unhappy" gets `:disappointed:`, and "home" or "remote" gets `:house_with_garden:`.
- **Answers weather questions.** A message with the word "weather" and a five-digit ZIP code gets a reply like "The weather in Chicago, IL right now, is clear and 40 degrees."
- **Welcomes people.** When someone joins a channel, the bot posts "Welcome" and their name.

The weather replies came from Yahoo's YQL, which Yahoo has since shut down, so that part can't work anymore. The code hasn't changed since 2017.

<figure><picture><source srcset="/images/projects/slackbot-afterhours-weather-parser-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/slackbot-afterhours-weather-parser.webp" alt="A code card of SlackBotAfterhours/lib/WeatherParser.js, lines 11 to 43: getters that check for the word weather and a five-digit number in the message, a run() method that executes the query and posts The weather in city, region right now, is conditions and temp degrees to the channel, and a query getter that builds a YQL select from weather.forecast for the woeid of the place matching the ZIP code." width="1440" height="1365" loading="lazy" /></picture><figcaption>lib/WeatherParser.js. The bot replies only when a message has both the word "weather" and a ZIP code, and asks YQL's <code>weather.forecast</code> table for that place.</figcaption></figure>

## Saying goodbye

The repository's one outside contribution is a [pull request from jdungan](https://github.com/nearbycoder/SlackBotAfterhours/pull/1), merged in September 2017. It adds the opposite of the welcome: when someone leaves a channel, the bot posts "Hey @everyone" with their name and "just left".

<figure><picture><source srcset="/images/projects/slackbot-afterhours-server-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/slackbot-afterhours-server.webp" alt="A code card of SlackBotAfterhours/lib/server.js, lines 1 to 31: imports, a start handler that loads the channel and user lists, and a message handler that runs EmojiParser and WeatherParser on every message, posts Welcome and the member's name on member_joined_channel, and posts Hey @everyone, the member's name and just left on member_left_channel." width="1440" height="1221" loading="lazy" /></picture><figcaption>lib/server.js, the whole bot. The welcome is on lines 25 to 27, and jdungan's goodbye is on lines 28 to 30.</figcaption></figure>

## How it's built

It's ES2015 JavaScript with stage-0 features, compiled by Babel 6 into `dist/` when the package installs. The slackbots library connects to Slack's real-time messaging API, loads the channel and user lists at startup, and posts the replies. Reactions go to Slack's `reactions.add` method through node-fetch, and the weather query goes through the yql package. Both parsers split the message on spaces and compare whole words, so "happy," with a comma doesn't match.

[auto-slack](/projects/auto-slack), started five days later, reuses the same `EmojiParser` structure and request helper for a bot that reacts in a single channel.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the repository's compiled code locally on Node 8 with sample events and stubs in place of Slack and YQL, and the code cards are rendered from its source.
