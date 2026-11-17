---
title: "Rumbrella"
summary: "The completed project from the book Programming Phoenix: an Elixir umbrella with Rumbl, a Phoenix app for annotating YouTube videos together in real time, and InfoSys, an OTP app that answers annotations with Wolfram Alpha."
role: "Developer"
createdAt: "2016-11-27"
year: "2016"
stack: ["Elixir", "Phoenix", "Ecto", "PostgreSQL", "WebSockets", "Wolfram Alpha"]
githubLink: "https://github.com/nearbycoder/rumbrella"
image: "/images/projects/rumbrella.webp"
imageAlt: "A dark code card of rumbrella/apps/rumbl/web/channels/video_channel.ex, lines 28 to 45: handle_in for new_annotation builds an annotation for the user and the socket's video, inserts it with Repo.insert, and on success broadcasts it, starts a Task to compute additional info and replies ok, or replies with the changeset errors."
imageCaption: "Handling a new annotation in Rumbl's video channel, rendered from apps/rumbl/web/channels/video_channel.ex."
featured: false
accent: "orange"
draft: false
---

Rumbrella is the finished tutorial project from *Programming Phoenix*, the book by Chris McCord, Bruce Tate and José Valim. The design is the book's. The repository's single commit, from November 27, 2016, is titled "Programming Phoenix Completed Project", and its database migrations were generated on November 26 and 27.

It's an Elixir umbrella project with two applications:

- **Rumbl**, a Phoenix app where people sign up, add YouTube videos and annotate them while they watch. Each annotation is pinned to a moment in the video and shows up for every viewer in real time.
- **InfoSys**, an OTP application that sends a question to outside services and returns the best answers. Its one backend is Wolfram Alpha.

The two meet in the video channel. Every new annotation also goes to InfoSys, and if Wolfram Alpha has an answer, it's posted on the video as an annotation from a user named "wolfram".

## Rumbl

Users register with a username and a password hashed with bcrypt, log in with a session, and manage their videos under `/manage`, which requires a login. A video has a URL, title, description and category, and a slug, so its watch page lives at an address like `/watch/12-my-video`.

The watch page embeds the video with YouTube's IFrame API next to an annotations panel. Posting a comment sends it over a Phoenix channel with the player's current time, and the server saves it with Ecto and PostgreSQL and broadcasts it to everyone watching. When you open a video, the channel sends its saved annotations and the page plays them back in step with the video, each one appearing when playback reaches its time. Clicking an annotation seeks to that moment, and after a reconnect the channel only sends annotations newer than the last one seen.

<figure><picture><source srcset="/images/projects/rumbrella-channel-info-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/rumbrella-channel-info.webp" alt="A code card of video_channel.ex, lines 47 to 68: broadcast_annotation preloads the user, renders annotation.json and broadcasts new_annotation. compute_additional_info runs InfoSys.compute on the annotation body with limit 1 and a 10_000 timeout, then inserts each result as an annotation from the user named after the backend and broadcasts it." width="1440" height="897" loading="lazy" /></picture><figcaption>Broadcasting an annotation, and turning an InfoSys answer into an annotation from the backend's own user.</figcaption></figure>

## InfoSys

`InfoSys.compute` starts one process per backend under a `simple_one_for_one` supervisor, monitors each, and waits up to a timeout (10 seconds by default) before killing any that haven't answered. The results come back sorted by score. The Wolfram backend sends the query to the Wolfram Alpha v2 API and pulls the "Result" or "Definitions" text out of the XML with SweetXml. Its tests swap in a local HTTP client that answers `1 + 1` with a recorded XML fixture, so they run without the network or a real app ID.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/rumbrella-compute-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/rumbrella-compute.webp" alt="A code card of apps/info_sys/lib/info_sys.ex, lines 18 to 43: compute maps each backend to spawn_query, awaits the results, sorts them by score and takes the limit. spawn_query starts a child under InfoSys.Supervisor and monitors it, and await_results sets a timer for the timeout, 10_000 by default, collects the results and cancels the timer." width="1440" height="1041" loading="lazy" /></picture><figcaption>InfoSys.compute: one supervised, monitored process per backend, with a shared timeout.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/rumbrella-supervisor-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/rumbrella-supervisor.webp" alt="A code card of apps/info_sys/lib/info_sys/supervisor.ex, lines 1 to 15: a Supervisor whose init declares one InfoSys worker with restart: :temporary and supervises it with the simple_one_for_one strategy." width="1440" height="645" loading="lazy" /></picture><figcaption>The supervisor that starts a temporary worker for each query.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/rumbrella-wolfram-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/rumbrella-wolfram.webp" alt="A code card of apps/info_sys/lib/info_sys/wolfram.ex, lines 1 to 35: start_link runs fetch in a Task. fetch requests the Wolfram Alpha v2 query API with the app ID and the encoded query, extracts the plaintext of the Result or Definitions pod with an xpath, and sends the owner a Result with backend wolfram and score 95, or an empty list. The HTTP client comes from config and defaults to :httpc." width="1440" height="1437" loading="lazy" /></picture><figcaption>The Wolfram Alpha backend.</figcaption></figure>
</div>

## How it's built

Rumbl uses Phoenix 1.2 with Phoenix channels over WebSockets, Ecto through phoenix_ecto 3 with Postgrex, Comeonin 2 for bcrypt, and Brunch 2.7 with Babel for the JavaScript. InfoSys depends only on SweetXml. Each app has its own config and tests, and the umbrella shares one build folder, deps folder and lockfile. Rumbl also keeps a small `Counter` GenServer that counts down once a second and raises "boom!" at zero. Nothing else in the app uses it.

The creation date shown here is the GitHub repository's UTC creation date. The images are code cards rendered from the repository's source files, with their real line numbers.
