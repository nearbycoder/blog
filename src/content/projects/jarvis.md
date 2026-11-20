---
title: "Jarvis"
summary: "An open-source native iOS voice assistant you can fork. Whisper transcribes on device, the Pi agent harness reasons with your ChatGPT subscription and calls web search, MCP servers, memory and skills, and Reverb-TTS answers in a preset or cloned voice synthesized on device. It's SwiftUI with Liquid Glass, for iPhone and iPad on iOS 26 and later."
role: "Creator"
year: "2026"
createdAt: "2026-11-20"
stack:
  [
    "Swift",
    "SwiftUI",
    "SwiftData",
    "Liquid Glass",
    "AVFoundation",
    "WhisperKit",
    "ExecuTorch",
    "Reverb-TTS",
    "TypeScript",
    "Pi agent harness",
    "MCP",
    "OAuth",
    "XcodeGen",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/jarvis/"
githubLink: "https://github.com/nearbycoder/jarvis"
featured: false
accent: "indigo"
draft: false
image: "/images/projects/jarvis.webp"
imageAlt: "The Jarvis social card on a dark indigo background: a glowing blue app icon with a sound-wave mark, the headline Your voice. Your assistant., and the line Open-source iOS voice assistant. On-device voices, ChatGPT reasoning, MCP tools, ready to fork., beside a tilted iPhone showing a Jarvis conversation about the weather in Lisbon and seafood near the river, with a glowing microphone orb at the bottom."
imageCaption: "The social card from the Jarvis website."
---

Jarvis is an open-source, native iOS voice assistant, published as a GitHub template so you can fork it and make it your own. You talk, and Whisper transcribes on the device. The Pi agent harness reasons with your ChatGPT subscription and calls tools: web search, any MCP server, and the assistant's own memory and skills. Reverb-TTS answers in the voice you picked, synthesized on the device and streamed sentence by sentence. Your audio stays on the phone; the text of each request goes to ChatGPT and to whichever tools and MCP servers you've enabled.

It's a SwiftUI app with Liquid Glass for iPhone and iPad on iOS 26 or later. You can set up several assistants, each with its own prompt, voice, model, reasoning effort, tools, memory and skills. There's no backend and no API key: you sign in with a ChatGPT Plus or Pro plan, and the harness runs inside the app.

## The voice loop

WhisperKit handles speech recognition, with voice activity detection to tell when you've finished talking. The reply streams back from the model as text, and `SpeechPipeline` cuts it at sentence boundaries and synthesizes each sentence while the previous one plays, so Jarvis starts talking after the first sentence instead of waiting for the whole answer. The voices come from Reverb-TTS, which `Packages/ReverbKit` runs on ExecuTorch at 24 kHz. Its backbone runs on the CPU through XNNPACK, because the package notes that the model's published MLX programs were exported for Software Mansion's ExecuTorch fork and fail on upstream ExecuTorch.

There are 16 preset voices in seven languages, and you can clone one from 3 to 15 seconds of speech that you record or import: Whisper writes the transcript, and Reverb encodes the voice locally. The models download on first use, about 145 MB for Whisper, about 410 MB for the Reverb voices, and about 400 MB more for voice cloning.

<figure>
  <picture><source srcset="/images/projects/jarvis-pipeline-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jarvis-pipeline-code.webp" alt="Swift source, lines 4 to 43 of Jarvis/Services/Voice/SpeechPipeline.swift, under the comment Streams assistant text into speech: cuts the token stream at sentence boundaries and synthesizes each chunk while the previous one plays, so audio starts after one sentence. The class holds a voice service, a voice, a language, the shared audio engine hub, a sentence chunker and an async stream. Its initializer starts a task that, for each chunk in the stream, stops if the pipeline was cancelled, awaits the synthesized samples for that chunk and enqueues them on the audio hub. feed passes each text delta to the chunker and yields every complete sentence to the stream, and finish flushes the rest and closes the stream." width="1440" height="1257" loading="lazy" /></picture>
  <figcaption>Speaking a reply as it streams in, in <code>SpeechPipeline.swift</code>.</figcaption>
</figure>

## A harness in a hidden web view

The reasoning comes from Pi, an open-source agent harness written in TypeScript. `PiRuntime/` bundles its agent core, model and MCP packages with esbuild, and the app runs the bundle in a hidden `WKWebView`. Swift calls into the page with `callAsyncJavaScript`, and the page calls back into Swift through a script message handler that returns a reply, so tool calls and token requests are awaited in both directions. Every HTTP request Pi makes, to ChatGPT or to an MCP server, goes through a `fetch` shim that hands it to `URLSession` in Swift and streams the response back chunk by chunk. That sidesteps the web view's CORS rules and lets ChatGPT's streamed responses work from inside WebKit.

You sign in with ChatGPT using a device code, or through the browser with a loopback redirect, and the tokens are kept in the Keychain. The README says this sign-in uses the same OAuth client and Codex endpoint as the Codex CLI and Pi, that it's undocumented, and that it's intended for personal use with your own subscription. Native tools are Swift functions with a JSON schema for their parameters: the app ships web search, web fetch and the current date and time, plus the memory and skills tools.

## MCP Gallery

The MCP Gallery lists 38 remote MCP servers, each one verified live, grouped by category and into collections such as Instant Starters, Everyday Assistant and Research Desk, and you can add any server that speaks Streamable HTTP. Servers can take no sign-in, an API key in a header, or OAuth. For OAuth, Jarvis follows the MCP authorization spec from the server's 401 challenge through its protected-resource and authorization-server metadata, dynamic client registration, and an authorization code with PKCE, then refreshes tokens automatically. The redirect goes to a loopback address, because many servers reject custom URL schemes. Header values and OAuth tokens live in the Keychain, and SwiftData stores only the header names.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/jarvis-mcp-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jarvis-mcp.webp" alt="The MCP Gallery on an iPhone: a Collections row with Instant Starters and Everyday Assistant cards, then a Research and Knowledge section listing Exa Search, DeepWiki and Context7 with short descriptions and labels such as No sign-in and Optional key, and a Search servers field at the bottom." width="506" height="1100" loading="lazy" /></picture><figcaption>The MCP Gallery.</figcaption></figure>
  <figure><img src="/images/projects/jarvis-collection.webp" alt="The Everyday Assistant collection in dark mode, described as search, travel, tasks, notes and files, with an Add All to Every Assistant button above servers such as Exa Search, Kiwi.com Flights, Todoist and Notion, some marked No sign-in and some Sign in." width="506" height="1100" loading="lazy" /><figcaption>A collection, added to every assistant in one tap.</figcaption></figure>
  <figure><img src="/images/projects/jarvis-connect.webp" alt="The Linear server's sheet in dark mode: its endpoint, https://mcp.linear.app/mcp, a Sign In button, a note that you'll sign in with your Linear account in a secure browser sheet and that Jarvis stores the access token in your Keychain and refreshes it automatically, and Use With toggles for the Jarvis, Researcher and Coach assistants." width="506" height="1100" loading="lazy" /><figcaption>Signing in to Linear's MCP server, and choosing which assistants can use it.</figcaption></figure>
</div>

## Memory and skills

Each assistant keeps a persistent memory that it manages with its own tools, `remember`, `recall`, `update_memory` and `forget`, and the newest 60 facts go into its system prompt. You can read, edit or wipe every fact. Skills use the Agent Skills format: only each skill's name and description sit in the prompt, and the agent loads the full `SKILL.md` and its files when it needs them. Ask for "a skill for my morning briefing" and the agent writes one as numbered tool-call steps, or it can search and install skills from skills.sh through the same public endpoints the `skills` command-line tool uses. When an assistant's memory or skills change, Jarvis starts a fresh Pi session with the updated prompt.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/jarvis-chat-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jarvis-chat.webp" alt="A Jarvis conversation on an iPhone: asked about the weather in Lisbon this weekend, Jarvis uses web search and web fetch and answers that it'll be sunny on Saturday with a high around 24 degrees, then, asked about seafood near the river, recommends Cervejaria Ramiro, Sea Me in Chiado and Doca de Santo Amaro, above a glowing Tap to talk orb and a Message Jarvis field." width="506" height="1100" loading="lazy" /></picture><figcaption>A conversation, with the tools each answer used.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/jarvis-memory-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jarvis-memory.webp" alt="The Memory screen: a Remember across conversations switch turned on, a note that each assistant has its own memory, stored only on this device, and five memories, such as Usually wakes up at 6:30, Sister Ana lives in Lisbon and Prefers window seats and nonstop flights, each learned in conversation, with a Forget Everything button." width="506" height="1100" loading="lazy" /></picture><figcaption>An assistant's memory, every fact editable.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/jarvis-skills-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/jarvis-skills.webp" alt="The Skills screen: a Browse skills.sh row, a tip that you can ask an assistant to make a skill and it will write and save one, and one skill, morning-briefing, used when the user asks for their morning briefing or how their day looks, marked as created by the assistant." width="506" height="1100" loading="lazy" /></picture><figcaption>A skill the assistant wrote itself.</figcaption></figure>
</div>

## Native and adaptive

The app is SwiftUI with Liquid Glass throughout, and its icon is a Liquid Glass icon in Icon Composer's format. It adapts to iPad split view, has keyboard shortcuts, and handles the iPhone Duo's hinge: the website says that when you half-fold the phone, the orb rises above the hinge. Conversations, assistants, voices and MCP servers are stored with SwiftData.

## How it's built

The app is 9,405 lines of Swift in 51 files, and the ReverbKit package adds 2,324 lines in 12 more. The harness bundle is built from 703 lines of TypeScript, and a 147-line mock server stands in for ChatGPT's streaming endpoint and for MCP and OAuth servers in tests. The Xcode project is generated by XcodeGen from `project.yml`. `make test-reverb` runs ReverbKit's unit tests on macOS, and `make selftest` runs a debug-only self-test inside the app on a simulator against the mock servers. It covers Pi agent turns with native and MCP tool calls, MCP OAuth discovery, registration and token refresh, header auth, memory and skills through a real agent loop, a skills.sh install, Reverb synthesis, Whisper transcribing that speech back, and voice cloning.

To make it yours, the README points to `project.yml` for the name, `Jarvis/AppIcon.icon` for the icon, `DataSeeder.swift` for the default assistants and voices, `NativeTools.swift` for your own Swift tools, `MCPCatalog.swift` for the gallery, and `PiRuntime/src/main.ts` for the harness.

The code is MIT licensed, but the Reverb-TTS model weights are CC BY-NC 4.0, so they're for non-commercial use, and the Higgs Audio v2 codec and the Whisper models have their own licenses. The README asks you to check them before shipping anything commercial, and it says Jarvis isn't affiliated with OpenAI or Apple. The repository has two commits, both on November 20, 2026: the first holds a README stub and the icon, and the second adds the app, the packages, the harness, the tests and the website, co-authored by Claude.

## Try it

There's no App Store build: you build Jarvis yourself. It takes Xcode 27.1 or later, XcodeGen, an Apple Developer account to run it on a device, and a ChatGPT Plus or Pro subscription to talk to it. Click [Use this template](https://github.com/nearbycoder/jarvis/generate) on GitHub, or run `gh repo create my-jarvis --template nearbycoder/jarvis --clone`. Then `make bootstrap` asks for your Team ID and bundle ID, writes your signing settings and generates the project, and `make open` opens it in Xcode. Build for a real device or an Apple silicon simulator, because the ExecuTorch libraries are arm64 only. On first run, sign in with ChatGPT and download the on-device models from the setup cards or from Settings.

[Browse the source on GitHub](https://github.com/nearbycoder/jarvis), or read [the website](https://nearbycoder.github.io/jarvis/). The creation date shown here is the GitHub repository's UTC creation date. The cover is the website's social card, and the phone screenshots are the website's own, in light and dark versions where it has both, so they follow this site's theme. The code excerpt is from `Jarvis/Services/Voice/SpeechPipeline.swift`.
