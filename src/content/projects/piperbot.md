---
title: "PiperBot"
summary: "A Slack bot written in Elixir in 2017. Messages that start with |> run commands for the weather, xkcd comics, jokes and quotes, and a Trello sign-in lists the cards assigned to you."
role: "Creator"
createdAt: "2017-03-25"
year: "2017"
stack: ["Elixir", "Slack API", "Maru", "Trello", "OpenWeatherMap"]
githubLink: "https://github.com/nearbycoder/PiperBot"
image: "/images/projects/piperbot.webp"
imageAlt: "A dark code card of PiperBot's lib/piper_bot/parser.ex, lines 1 to 24: parse_command clauses that match the prefixes weather:, game:, quote:, comic:, joke: and trello: and pass the rest of the command to PiperBot.Weather, Games, Quotes, Comics, Jokes and Trello."
imageCaption: "The command parser, rendered from lib/piper_bot/parser.ex in the repository."
featured: false
accent: "violet"
draft: false
---

PiperBot is a Slack bot written in Elixir. It connects to Slack's real-time messaging API, reads the messages in the channels it's in, and treats a message that starts with `|>` (Elixir's pipe operator) as a list of commands. Each command is a category and an argument, like `weather:<zip>` or `comic:xkcd`, and one message can chain several: `|> joke:random |> comic:xkcd` tells a joke and then posts a comic.

The repository is a single commit from March 25, 2017, and its README is still the template Mix generates. Some of the services it called are gone. The Chuck Norris and random-joke APIs no longer answer, while xkcd's JSON feed and the Ron Swanson quotes API still do.

## Commands

- `weather:<zip>` posts the current temperature for a five-digit US ZIP code from OpenWeatherMap, under a "Weather" name that includes the conditions.
- `joke:random` tells a random joke.
- `quote:chuck`, `quote:ron`, `quote:dwight` and `quote:michael` post a quote under the character's name and picture. The Chuck Norris and Ron Swanson quotes come from public APIs, and the Dwight Schrute and Michael Scott quotes are lists in the source.
- `comic:xkcd` posts a random xkcd strip as an attachment, and `comic:xkcd:today` posts the latest one.
- `trello:login`, `trello:me`, `trello:assigned` and `trello:assigned:random` connect your Slack account to Trello and list your cards.
- `help:all` lists every command, and `help:<category>` lists one group.
- `game:` is a stub that echoes back whatever follows it.

Anything else gets "Didn't understand that try `|> help:all`". One trigger works without the pipe: any message containing "yeppers" gets a random Michael Scott quote.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/piperbot-brain-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/piperbot-brain.webp" alt="A code card of lib/piper_bot/brain.ex, lines 9 to 33: a handle_event clause that matches messages starting with |&amp;gt; and splits off the commands, a second clause that posts a Michael Scott quote when the text contains yeppers, and a recursive run_command that strips each command and pipes it into PiperBot.Parser.parse_command." width="1440" height="1077" loading="lazy" /></picture><figcaption>The message handler in lib/piper_bot/brain.ex. Slack escapes <code>&gt;</code> as <code>&amp;gt;</code>, so commands start with <code>|&amp;gt;</code>, and <code>run_command</code> parses them one at a time.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/piperbot-help-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/piperbot-help.webp" alt="A code card of lib/piper_bot/help.ex, lines 4 to 43: Slack-formatted help text with sections for Trello, Weather, Jokes, Quotes and Comics, listing commands such as trello:login, weather:[:zipcode], joke:random, quote:chuck, quote:dwight, quote:michael, quote:ron, comic:xkcd and comic:xkcd:today with a short description of each." width="1440" height="1545" loading="lazy" /></picture><figcaption>The command list in lib/piper_bot/help.ex, written in Slack's formatting. <code>help:all</code> posts all of it.</figcaption></figure>
</div>

## Trello sign-in

`trello:login` sends you a direct message with a Trello authorization link. Trello returns the token in the URL fragment, which never reaches a server, so the return URL points at a small API that PiperBot runs with Maru on port 8880. That API serves a page whose script reads the fragment and calls `/trello/auth/<user>/<token>`, and the route stores the token in an Agent keyed by your Slack user ID.

After that, `trello:me` says who you're signed in as, and `trello:assigned` fetches your cards and boards and posts each card as an attachment with its board, list, description and labels. The return URL is hardcoded to `127.0.0.1:8880`, and the tokens live only in the Agent's memory, so a restart forgets every sign-in.

<figure><picture><source srcset="/images/projects/piperbot-trello-auth-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/piperbot-trello-auth.webp" alt="A code card of lib/api/router.ex, lines 1 to 22: a Maru router with a trello namespace, optional user and token params, a GET auth/:user/:token route that calls TrelloAuthStore.put and returns JSON, and a GET auth/:user route that serves lib/api/auth.html." width="1440" height="897" loading="lazy" /></picture><figcaption>The Maru routes for the Trello sign-in in lib/api/router.ex. One stores the token, the other serves the page that reads it from the fragment.</figcaption></figure>

## How it's built

PiperBot is an OTP application for Elixir 1.4. Its supervisor starts two workers: the bot process from [Elixir-Slack](https://github.com/BlakeWilliams/Elixir-Slack) 0.9, with `PiperBot.Brain` as its handler, and the Agent that holds Trello tokens. HTTPoison 0.9 and Poison 3 call the APIs and decode their JSON, Maru 0.10 serves the sign-in routes, and dotenv reads the Slack, OpenWeatherMap and Trello keys from a `.env` file. Most replies post under their own name and picture (Chuck Norris, xkcd, Trello and so on) rather than the bot's.

A year later, [Twitch Stream Cache](/projects/twitch-stream-cache) was built from the same parts: Maru, HTTPoison, Poison and dotenv.

The creation date shown here is the GitHub repository's UTC creation date. The images are code cards rendered from the repository's source files, with their real line numbers.
