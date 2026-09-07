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

A follow-up capacity check prevents note saves and backup imports from silently evicting older records. Notes and reading imports have a 100-entry limit. An over-capacity operation is refused while existing records and unsaved note text remain available.

## Merged feature pull requests

| Feature                | Pull request                                       |
| ---------------------- | -------------------------------------------------- |
| Topic directory        | [#10](https://github.com/nearbycoder/blog/pull/10) |
| Date archive           | [#11](https://github.com/nearbycoder/blog/pull/11) |
| Reading-time discovery | [#12](https://github.com/nearbycoder/blog/pull/12) |
| Surprise me            | [#13](https://github.com/nearbycoder/blog/pull/13) |
| Full-text search       | [#14](https://github.com/nearbycoder/blog/pull/14) |
| Adjacent articles      | [#15](https://github.com/nearbycoder/blog/pull/15) |
| Reading appearance     | [#16](https://github.com/nearbycoder/blog/pull/16) |
| Focus mode             | [#17](https://github.com/nearbycoder/blog/pull/17) |
| Print edition          | [#18](https://github.com/nearbycoder/blog/pull/18) |
| Markdown downloads     | [#19](https://github.com/nearbycoder/blog/pull/19) |
| Citations              | [#20](https://github.com/nearbycoder/blog/pull/20) |
| Image viewer           | [#21](https://github.com/nearbycoder/blog/pull/21) |
| Private notes          | [#22](https://github.com/nearbycoder/blog/pull/22) |
| Reading backups        | [#23](https://github.com/nearbycoder/blog/pull/23) |
| Reading statistics     | [#24](https://github.com/nearbycoder/blog/pull/24) |
| Reading queue          | [#25](https://github.com/nearbycoder/blog/pull/25) |
| Glossary               | [#26](https://github.com/nearbycoder/blog/pull/26) |
| Technology explorer    | [#27](https://github.com/nearbycoder/blog/pull/27) |
| Keyboard help          | [#28](https://github.com/nearbycoder/blog/pull/28) |
| Feed collection        | [#29](https://github.com/nearbycoder/blog/pull/29) |
