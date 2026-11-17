---
title: "dadjokes-slack-bot"
summary: "A Slack bot from December 2021 that posts a dad joke to a channel every weekday. It's a single AWS Lambda function on a Serverless Framework schedule, which fetches a joke from icanhazdadjoke.com and posts it with Slack's Bolt SDK."
role: "Creator"
createdAt: "2021-12-10"
year: "2021"
stack: ["JavaScript", "Node.js", "Slack Bolt", "AWS Lambda", "Serverless Framework"]
githubLink: "https://github.com/nearbycoder/dadjokes-slack-bot"
image: "/images/projects/dadjokes-slack-bot.webp"
imageAlt: "A terminal running node --version (v14.21.3), exporting placeholder SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET values, and invoking the handler three times with a Slack stub preloaded. Each run prints that auth.test and chat.postMessage were intercepted and nothing was sent, then the message's channel, dadjokes, and its text: What does an angry pepper do? It gets jalapeño face. Why do crabs never give to charity? Because they're shellfish. Where do young cows eat lunch? In the calf-ateria."
imageCaption: "Three runs of the bot's handler on Node 14, with real jokes from icanhazdadjoke.com. A local stub intercepted the Slack calls, so nothing was posted."
featured: false
accent: "amber"
draft: false
---

dadjokes-slack-bot posts a dad joke to a Slack channel named `dadjokes` every weekday. The whole bot is one function: it asks [icanhazdadjoke.com](https://icanhazdadjoke.com/) for a joke in its Slack format and posts the text with Slack's Bolt SDK. It runs on AWS Lambda on a weekday schedule, both set up by the Serverless Framework.

The repository has four commits: the first on December 10, 2021, and three small changes on January 2, 2022. It hasn't changed since, and the README is still the Serverless Framework's template for a scheduled cron job. The joke API still answers in the same format, so the handler still runs.

## The handler

`joke.js` exports `run`, the Lambda handler. Each call creates a Bolt `App` with the bot token and signing secret from the environment, fetches `https://icanhazdadjoke.com/slack` with node-fetch, and posts the first attachment's text with `chat.postMessage`. Errors are logged, not retried. One of the January commits added the `await` in front of `postMessage`, so the function waits for Slack's reply before it returns.

<figure>
  <picture><source srcset="/images/projects/dadjokes-slack-bot-handler-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/dadjokes-slack-bot-handler.webp" alt="All 22 lines of joke.js: imports of fetch from node-fetch and App from @slack/bolt, and an exported async run function that creates an App from the SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET environment variables, fetches https://icanhazdadjoke.com/slack, reads the JSON and awaits app.client.chat.postMessage with the channel dadjokes and the text of the first attachment, logging any error." width="1440" height="897" loading="lazy" /></picture>
  <figcaption>The whole bot, joke.js.</figcaption>
</figure>

## The schedule

`serverless.yml` deploys one function, `jokeHandler`, to AWS on the Node.js 14 runtime. Its `schedule` event is `cron(0 16 ? * MON-FRI *)`: 16:00 UTC, Monday to Friday, which the comment above it calls 10am. The Slack token and signing secret come from Serverless Framework dashboard parameters, and the serverless-bundle plugin bundles the code, with its esbuild option on.

<figure>
  <picture><source srcset="/images/projects/dadjokes-slack-bot-serverless-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/dadjokes-slack-bot-serverless.webp" alt="All 26 lines of serverless.yml: org nearbycoder, app and service dadjokes-slack-bot, the serverless-bundle plugin, framework version 2, the aws provider with the nodejs14.x runtime, a jokeHandler function with handler joke.run, SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET taken from params, a schedule event of cron(0 16 ? * MON-FRI *) under the comment Invoke Lambda function every weekday at 10am, and a custom bundle setting with esbuild set to true." width="1440" height="1041" loading="lazy" /></picture>
  <figcaption>serverless.yml: one function on a weekday schedule.</figcaption>
</figure>

The code is ES modules, with @slack/bolt 3.8 and node-fetch 3.1, deployed with Serverless Framework 2.70 and serverless-bundle 5.2.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the repository's handler locally on Node 14, bundled with esbuild, with placeholder Slack credentials and a stub that blocks every connection to Slack and prints the calls instead, so nothing was posted. The jokes are real responses from icanhazdadjoke.com, and the code cards show real source files from the repository.
