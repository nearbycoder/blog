---
title: "AGFS: make the handoff part of the product"
description: "A recap of the remote artifact workflow: the problem, the web-and-CLI solution, and the tradeoff that kept the scope focused."
date: "2026-03-30"
project: "agfs-dev"
sources: ["building-agfs-dev-to-make-remote-agent-files-easy-to-share"]
---

This recap draws from the original AGFS build notes linked below.

## What shipped

A web interface for browsing files, a CLI for remote agents, and signed share URLs. The implementation combines a TanStack Start application on Cloudflare Workers with R2 storage, D1 metadata, GitHub authentication, and shared Zod contracts.

## What was getting in the way

Retrieving screenshots, logs, and reports from remote environments repeatedly interrupted the workflow. SCP commands, temporary HTTP servers, port forwarding, and improvised storage all required extra work at the point of review.

## Where AI fit

The CLI is the interface an agent can use to upload an artifact and return a link. The value is in the complete handoff to the human, not simply in moving bytes into storage.

## The tradeoff

Git remains useful for source history, but temporary artifacts do not all belong in the repository. AGFS gives those files a separate workflow. The original post describes a useful primitive for sharing context between agents without claiming to solve every context-management problem.

## The takeaway

The bar for success was deliberately concrete: upload the file, return a signed link, and let the human inspect it. The source does not report an incident or a next-iteration commitment; this is a scope and workflow retrospective.
