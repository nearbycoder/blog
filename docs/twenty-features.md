# Twenty additions without additional services

Each feature is built and verified separately, with its own pull request and merge. Everything uses the existing Astro build or browser capabilities. Private reading data stays on the device.

1. Topic directory: published-only topic pages, counts, and linked article tags.
2. Date archive: year/month browsing with stable anchors and exact publication dates.
3. Reading-time discovery: time budgets, sorting, and shareable article filters.
4. Surprise me: discover an eligible article with time/topic choices and a no-repeat session.
5. Full-text search: search the body of published writing, with contextual excerpts.
6. Adjacent articles: chronological previous/next navigation with boundary states.
7. Reading appearance: persistent text size, line spacing, and column width.
8. Focus mode: hide supporting UI with an obvious exit and keyboard escape.
9. Print edition: legible article-only printing with source attribution.
10. Markdown downloads: portable published article text with metadata and canonical links.
11. Citations: copy plain-text, Markdown, and BibTeX citations with manual fallback.
12. Image viewer: keyboard-accessible enlarged article images and captions.
13. Private notes: per-article notes, explicit save/delete, and storage failure feedback.
14. Reading backups: validated export/import of saves and history with a review step.
15. Reading statistics: honest local counts, completed reading estimates, and reset links.
16. Reading queue: order saved unread articles with accessible move controls.
17. Glossary: concise technical definitions connected to real published articles.
18. Technology explorer: browse projects by their declared stack.
19. Keyboard help: discoverable, input-safe navigation shortcuts with an accessible dialog.
20. Feed collection: topic RSS, JSON Feed, and an OPML subscription export.

Related articles already exist; full-text search adds a new capability in slot 5.

## Operation and verification

All twenty additions use existing build output or browser APIs. No new provider, account, database, or paid service is required. Reading saves, notes, appearance, queue order, and keyboard preferences are device-local. The backup flow transfers saves, positions, and notes; appearance and queue order remain device-specific. Private files should be kept private. Clearing browser data removes local records.

Topic pages, archives, neighboring article links, Markdown files, glossary definitions, project technology collections, and feeds are generated from published content. Interactive features have empty/error states and avoid inventing crowds, reading activity, or search intelligence.

The JSON output follows the [JSON Feed 1.1 specification](https://www.jsonfeed.org/version/1.1/). Topic RSS and OPML are escaped XML. Feed items use excerpts and canonical article links. The existing newsletter archive baseline is unchanged.

Each feature PR runs `npm run verify` before merging, then waits for Vercel Preview and Production checks and verifies its production route. The final pass also audits expanded article controls, reading-list panels, and dialogs in both themes.
