---
title: "Use your git history to write a resume that reflects real work"
description: "A practical workflow for using `.git` with Claude or Codex to turn shipped commits into accurate, role-tailored resume bullets."
date: "2026-02-18"
tags: ["career", "resume", "git", "ai", "workflow"]
readTime: "7 min read"
featured: false
accent: "teal"
---

Whenever I update my resume, I run into the same problem.

I remember the big launches, but I forget the work that actually made those launches possible.

Auth rewrites. Billing fixes. Production incident cleanup. API hardening. The stuff that made the product reliable usually gets lost because it did not come with a flashy announcement.

That is why I started using `.git` as my source of truth, then using Claude or Codex to turn that history into resume bullets grounded in what I actually shipped.

## Memory is biased, `.git` is evidence

Resumes get weak when they are based on memory and vague summaries.

Commit history gives you a better starting point:

- exact dates
- exact files
- exact change scope
- exact language from commit subjects and PR messages

You are no longer guessing what you did. You are curating from evidence.

## Step 1: Export the right slice of your history

Start with a 6-12 month window and filter to your own commits.

```bash
git log \
  --since="2025-01-01" \
  --author="$(git config user.name)" \
  --no-merges \
  --date=short \
  --pretty=format:'%ad | %h | %s'
```

Then get file-level and change-size context:

```bash
git log \
  --since="2025-01-01" \
  --author="$(git config user.name)" \
  --no-merges \
  --numstat \
  --date=short \
  --pretty=format:'commit %H%nDate: %ad%nSubject: %s%n'
```

That second output is usually what I give to Claude or Codex.

It has enough signal to infer themes: migrations, feature ownership, performance work, reliability work, and cross-team infra changes.

## Step 2: Ask for themes before asking for bullets

If you jump straight to final bullets, the model tends to produce generic career language.

I get better output with a 2-pass flow.

Pass 1 prompt:

```text
Analyze this git history and cluster the work into 4-6 themes.
For each theme, list:
1) what was built or improved
2) which files or areas were touched repeatedly
3) why this likely mattered to users or the business
4) where evidence is strong vs weak

Do not invent metrics.
```

This gives you a clean map of your real work.

## Step 3: Convert themes into resume bullets with proof

After themes look right, run pass 2.

```text
Using these themes, write resume bullets for a senior software engineer role.
Constraints:
- one line per bullet
- start with a strong action verb
- include system/feature + outcome
- include tech context when helpful
- no fake numbers
- if impact is unclear, write a conservative outcome

After each bullet, include evidence in parentheses with commit hashes.
```

That last line matters. The evidence tag helps you quickly audit claims before they land on your actual resume.

## Step 4: Tailor for each role in minutes

Once you have a "truth set" of bullets, tailoring gets much easier.

Drop in the job description and ask Claude or Codex to select and reorder only the relevant bullets.

```text
Given this job description, select the 6 most relevant bullets from my evidence-backed set.
Keep only accurate claims.
Prioritize backend systems, production reliability, and developer tooling.
Return:
1) selected bullets
2) why each maps to the role
3) bullets to remove for this version
```

Now you are tailoring without rewriting your history every time.

## Claude vs Codex in this workflow

Both work, but I use them differently:

- Claude: strong for synthesis across lots of commits and for turning noisy history into coherent themes.
- Codex: strong when you want repo-aware detail and direct references to real paths, diffs, and implementation context.

I usually use both. Claude for narrative shape, Codex for technical precision.

## Keep one source file for future updates

I keep a `resume-evidence.md` file with:

- theme summaries
- vetted bullets
- linked commit hashes
- optional metrics I can defend

Then every new resume edit starts from that file instead of a blank page.

## The real benefit

This process does more than improve writing.

It changes confidence.

When your resume is anchored to shipped work inside `.git`, you stop sounding vague because you are not guessing anymore. You are describing what you actually accomplished.

And in a market where everyone sounds polished, grounded specificity stands out.
