---
title: "When AI in an interview fails you"
description: "I used AI heavily in a technical interview, felt great about the build, and still got rejected because the team could not gauge enough of my understanding."
date: "2026-03-07"
publishedAt: "2026-03-07T00:00:00Z"
tags: ["ai", "interviews", "career", "build-in-public", "react", "typescript"]
readTime: "6 min read"
featured: false
accent: "orange"
draft: false
---

I recently got the chance to do a technical interview with a large company that is very publicly on the front edge of AI adoption.

What made it more interesting was that the interviewers explicitly said full AI usage was allowed, and not just allowed, but strongly encouraged.

That changed how I approached the session.

The exercise was a staged Roomba-style challenge. You had a board made of squares and needed to support a Roomba that could move forward or turn right. It was approachable on purpose, but the interview was broken into multiple steps, each adding another layer of behavior.

I took the prompt document they gave me, scaffolded a blank Vite + React + TypeScript app, and dropped the interview instructions into Codex in plan mode so I could structure the work before touching implementation.

That part honestly went well.

Codex started by getting the first step passing, then we walked through the code together. I explained what had been scaffolded, how state was being modeled, and how the UI was rendering the board and the robot state. Then we moved through the remaining steps one by one until all four were complete.

By the end of the call, I felt pretty good.

The implementation worked. I felt like I could explain the major pieces. The conversation with the engineers felt solid. Nothing about the interview made me think I had missed badly.

Then a few days passed and I got the feedback.

They said they were not able to gauge enough of my understanding of the code, so I was passed up.

That was not what I expected, and if I am being honest, it still stings.

## Where AI helped and where it hurt

The strange part is that AI absolutely helped me finish the task.

It accelerated the scaffolding, kept momentum high, and made it easier to move through each stage of the exercise without getting stuck in syntax or boilerplate. In that sense, it did exactly what it was supposed to do.

But it also introduced a different problem.

When AI is doing a meaningful percentage of the typing and structure generation, you cannot assume the interviewer can automatically see your understanding. You have to make that understanding visible on purpose.

That means slowing down enough to:

- explain the model before the code
- call out what the AI generated versus what you changed
- describe why a given implementation is correct
- point out edge cases and tradeoffs without being prompted

I do not think I did enough of that.

I was focused on shipping the solution and keeping the session moving. In a real engineering environment, that can be a strength. In an interview, it can read like borrowed confidence unless you keep narrating your judgment.

So in that sense, AI did not fail because the code was bad.

It failed because I let the tool compress too much of the visible thinking.

## The interview build

This was the version that came out of the interview process:

<video controls preload="metadata" playsinline style="width: 100%; height: auto;" src="https://dz3hejmfbr.ufs.sh/f/LfZ3RwMGeY0bD2OszfbW0qo5NzgPiwJXZjmSId6bafCFl1Y8">
  Your browser does not support the video tag.
</video>

It solved the prompt, but looking back, it also reflects the tradeoff I keep thinking about now.

Shipping quickly is not the same thing as demonstrating mastery clearly enough for an interview panel.

## What I built after

That experience stuck with me, so I spent a few hours today pushing the same Roomba idea further and making it feel more like a playful product instead of a bare interview exercise.

The result is [Roomba Wars](https://github.com/nearbycoder/roomba-wars), and the production version is live at [roomba.nerb.dev](https://roomba.nerb.dev).

![Roomba Wars screenshot one](/images/roomba-1.png)

![Roomba Wars screenshot two](/images/roomba-2.png)

Roomba Wars turns that simple interview setup into a multiplayer browser game with a lot more personality.

Instead of a fixed board, the game runs on an infinite procedural dirt field where players join with a name, pick a custom Roomba color, and compete to clean efficiently without boxing themselves in. Every move matters because cleaned tiles become temporary blockers, dirt grows back over time, and the arena keeps shifting under everyone playing.

It also adds enough systems to make the whole thing feel like an actual game instead of a coding exercise. There is score tracking, a persistent leaderboard, dust bunny enemies that create pressure and combat moments, and a benchmark mode for pushing the simulation harder locally.

Technically, it is a much more complete build too: a React 19 + Vite frontend, a 3D scene powered by React Three Fiber and `three`, and a Cloudflare Worker with Durable Objects acting as the multiplayer game server. That takes the original Roomba concept and turns it into something that touches rendering, realtime state, persistence, and gameplay design all at once.

This is the version I worked on today:

<video controls preload="metadata" playsinline style="width: 100%; height: auto;" src="https://dz3hejmfbr.ufs.sh/f/LfZ3RwMGeY0bTKi02qaAmqBupVzXRZ6CS5sl7hi9dy2LxjvD">
  Your browser does not support the video tag.
</video>

One other part of this rework mattered a lot to me: benchmarking.

One of the big questions that came up in the interview was what would happen if the board scaled to something like a million by million cells. That is the kind of question where the toy version of the app stops being enough, so I wanted the follow-up project to take scale more seriously.

That is why I added a benchmark arena.

It let me test hypotheses around different player counts and rendering loads without pretending it was a perfect one-to-one simulation of real websocket traffic. It does not fully replicate multiplayer network conditions, but it does surface the rendering constraints and performance ceilings that start to matter once the game gets more crowded.

I felt good about that addition because it pushed the project beyond "here is a nicer version of the interview app" and into "here is how I would actually investigate whether this idea holds up under pressure."

## What I am taking from this

I still believe AI belongs in modern interviews if companies are serious about evaluating how engineers actually work now.

But this experience made one thing very clear to me:

If AI is allowed, then communication has to become a much bigger part of the bar.

It is not enough to get to a working answer. You have to expose your reasoning, your verification process, and your ability to challenge or reshape what the model gives you.

That is the part I would handle differently next time.

I would still use AI.

I would just spend more energy proving that the system behind the code is mine, even when some of the keystrokes are not.
