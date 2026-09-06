# Blog feature releases

## Discovery and build stories

- `/start-here` and three ordered reading paths. Edit `src/data/reading-paths.ts`; missing article IDs fail the build, while unpublished articles are excluded.
- Explicit project/article/build-log relationships in `src/data/project-stories.ts`. Project pages collect their story; article pages link to projects and the next article in a path.
- `/now` uses `src/data/now.ts`. Update the date with the copy; the build never changes its editorial timestamp.
- `/postmortems` uses a Markdown collection. Recaps reference published source article IDs and a project ID. The first three recaps summarize existing published notes rather than inventing new experiences.
- Run `npm run verify` before each release. GitHub workflow installation requires a connection with workflow-edit scope.

To add a postmortem, create `src/content/postmortems/<slug>.md` with `title`, `description`, `date`, `project`, and `sources` (article IDs). Use headings for what shipped, what proved difficult, where AI fit, tradeoffs, and what changes next time. Do not invent an incident or next step when the original notes do not contain one. Set `draft: true` while writing.

Validation: 68 pages; 10 browser tests; route and asset checks; 320/390/768/1440 px; new surfaces included in light/dark Axe checks.

## Interactive project lab

`src/data/labs.ts` connects three experiments to their real project pages. `/lab/roomba` is a deterministic command simulator with collision checks, one-time cleaning, bounded queues, replay, and cancellation. `/lab/poll` keeps one replaceable vote in tab memory; it never invents a crowd or sends votes to the live app. `/lab/agent` is explicitly scripted and includes tool failure/replanning. None of these demos calls paid APIs.

The lab appears on the homepage, in navigation/search, and on its related project pages. Each route receives the same generated social image and accessible layout as other pages. The lab tests exercise the underlying movement rules and complete interactive flows. Static instructions and project links remain available without JavaScript.

## Personal reading tools

Articles now offer independent saving and opt-in section bookmarks. `/reading-list` combines saved articles and reading history, lets readers remove individual entries or erase the entire list, and updates across tabs. Returning to an article offers a resume link without automatic scrolling; explicit URL fragments take priority. Marking an article as read stops position updates.

Data uses the versioned `nearbycoder:reading:v1` localStorage key with validation and a 100-entry limit. Titles, article URLs, and allowed heading anchors come from the current published content catalog, never from storage. Corrupt storage starts empty; blocked writes show an honest error. No reading data leaves the browser. Code blocks have copy buttons with success and failure feedback.

Validation includes saves and resume after navigation/reload, read completion, cross-tab updates, malformed and blocked storage, clearing data, exact clipboard contents, and clipboard errors, in addition to the complete route, social-image, responsive, and accessibility suite.
