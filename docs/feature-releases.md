# Blog feature releases

## Discovery and build stories

- `/start-here` and three ordered reading paths. Edit `src/data/reading-paths.ts`; missing article IDs fail the build, while unpublished articles are excluded.
- Explicit project/article/build-log relationships in `src/data/project-stories.ts`. Project pages collect their story; article pages link to projects and the next article in a path.
- `/now` uses `src/data/now.ts`. Update the date with the copy; the build never changes its editorial timestamp.
- `/postmortems` uses a Markdown collection. Recaps reference published source article IDs and a project ID. The first three recaps summarize existing published notes rather than inventing new experiences.
- Run `npm run verify` before each release. GitHub workflow installation requires a connection with workflow-edit scope.

To add a postmortem, create `src/content/postmortems/<slug>.md` with `title`, `description`, `date`, `project`, and `sources` (article IDs). Use headings for what shipped, what proved difficult, where AI fit, tradeoffs, and what changes next time. Do not invent an incident or next step when the original notes do not contain one. Set `draft: true` while writing.

Validation: 68 pages; 10 browser tests; route and asset checks; 320/390/768/1440 px; new surfaces included in light/dark Axe checks.
