---
title: "Twitch Stream Cache"
summary: "A small Elixir service that asks Twitch every 10 seconds whether one streamer is live and serves the cached answer as JSON, so a website can check as often as it likes without being throttled by Twitch."
role: "Creator"
createdAt: "2018-02-07"
year: "2018"
stack: ["Elixir", "Maru", "Plug", "HTTPoison", "Twitch API"]
githubLink: "https://github.com/nearbycoder/TwitchStreamCache"
image: "/images/projects/twitch-stream-cache.webp"
imageAlt: "A dark code card of lines 1 to 22 of twitch_crawler.ex: the TwitchCrawler module uses GenServer, fetches once in init, schedules the next run with Process.send_after(self(), :work, 10000) and a comment reading 10 seconds, and in handle_info puts the streamer's data in TwitchStatusStore before scheduling the next run."
imageCaption: "The crawler, a GenServer that refetches every 10 seconds. Rendered from lib/integrations/twitch/twitch_crawler.ex."
featured: false
accent: "purple"
draft: false
---

Twitch Stream Cache keeps one Twitch streamer's live status in memory. On a 10-second timer it asks Twitch's API about the configured user and stores the answer, and a JSON endpoint hands that stored answer to anyone who asks. A website can poll it as often as it likes, while the app only goes to Twitch on its timer. The README states the goal: cache the response "to prevent throttling from twitch".

All four commits are from February 7, 2018. The request it makes to Twitch no longer works as written (see below).

## How it works

The application's supervisor starts two workers:

- **TwitchStatusStore**, an Agent holding a map from a Twitch user ID to the latest response.
- **TwitchCrawler**, a GenServer that fetches once when it starts, then sends itself a `:work` message every 10 seconds with `Process.send_after` and stores each new response.

The fetch itself is `TwitchFetch`. It calls the `streams` endpoint of Twitch's Helix API with HTTPoison, sending the app's Client-ID, and decodes the JSON with Poison. The request also carries the `Accept` header of Twitch's older v5 API.

<figure>
  <picture><source srcset="/images/projects/twitch-stream-cache-fetch-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/twitch-stream-cache-fetch.webp" alt="The 20-line twitch_fetch.ex: fetch_streamer_info runs handle_request for https://api.twitch.tv/helix/streams/?user_id= plus the ID inside Task.async and awaits it, and handle_request reads the client ID from the app config, calls HTTPoison.get with Client-ID and Accept application/vnd.twitchtv.v5+json headers, decodes a 200 response's body with Poison, and returns {:error, reason} on a connection error." width="1440" height="729" loading="lazy" /></picture>
  <figcaption>The request to Twitch, from <code>lib/integrations/twitch/twitch_fetch.ex</code>.</figcaption>
</figure>

The HTTP side is a [Maru](https://github.com/elixir-maru/maru) router on port 8080. `GET /twitch/:twitch_id` reads the store and returns `{"status": "ok", "data": [...]}`, passing along the `data` list from Twitch, which is empty while the streamer is offline. A user ID the crawler isn't tracking gets a 404 with `"user doesn't exist in memory"`. The last commit added the Corsica plug, so pages on any origin can call it.

<figure>
  <picture><source srcset="/images/projects/twitch-stream-cache-router-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/twitch-stream-cache-router.webp" alt="The 18-line router.ex: Twitch.Router uses Maru.Router, plugs Corsica with origins set to any, and in a twitch namespace defines an optional twitch_id string param and a GET route that reads the ID from TwitchStatusStore and responds with JSON holding status ok and the data list." width="1440" height="753" loading="lazy" /></picture>
  <figcaption>The whole HTTP API, from <code>lib/api/router.ex</code>.</figcaption>
</figure>

Configuration is two environment variables, `TWITCH_USER_ID` and `TWITCH_CLIENT_ID`. The README has you copy `sample.env` to `.env`, source it, and start the app with `iex -S mix`.

## How it's built

It's Elixir 1.6 with Maru 0.12, a REST-style framework built on Plug and Cowboy, plus HTTPoison 1.0, Poison 3.1 and Corsica 1.1. There's no database: the cache lives in the Agent and starts empty on every boot. The parts are the same ones [PiperBot](/projects/piperbot), a Slack bot from the year before, was built from: a Maru router, an Agent for state, HTTPoison and Poison for API calls, and dotenv for keys.

## Running it today

It won't work against Twitch as written. Since spring 2020, every Helix request needs an OAuth access token along with the Client-ID ([Twitch's announcement](https://discuss.dev.twitch.com/t/requiring-oauth-for-helix-twitch-api-endpoints/23916)), and this code only sends the Client-ID. The fetch only handles a 200 response or a connection error, so it has no branch for the 401 it would get back. The v5 API named in its `Accept` header was shut down in February 2022. Bringing it back would mean requesting an app access token and sending it as a Bearer token with each call.

The creation date shown here is the GitHub repository's UTC creation date. The code cards on this page are rendered from the repository's source.
