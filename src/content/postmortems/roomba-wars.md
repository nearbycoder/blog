---
title: "Roomba Wars: a working answer is only part of the story"
description: "A recap of an AI-assisted interview, the game built afterward, and the lesson about making engineering judgment visible."
date: "2026-03-07"
project: "roomba-wars"
sources: ["when-ai-in-an-interview-fails-you"]
---

This recap draws from the original interview and Roomba Wars writeup linked below.

## What shipped

The interview exercise progressed through four stages. Afterward, the idea became a multiplayer browser game with a procedural dirt field, temporary blockers, scoring, dust bunny enemies, a leaderboard, and a benchmark arena.

## What did not work

Despite a working interview implementation, the feedback was that the interviewers could not gauge enough understanding of the code. Finishing the exercise did not make the reasoning sufficiently visible.

## Where AI helped

Codex accelerated scaffolding and the staged implementation. It reduced time spent on syntax and boilerplate, but also compressed the visible thinking that the interviewers needed to evaluate.

## What would change next time

The original writeup is explicit: explain the model before the code, distinguish generated work from personal changes, discuss correctness and edge cases, and narrate tradeoffs without waiting to be asked. AI would still be part of the workflow.

## A useful limit

The follow-up benchmark explored rendering load and player counts. It was not a complete simulation of real WebSocket traffic. Keeping that distinction visible makes the performance conclusions more useful.
