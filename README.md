# nearbycoder.com

Personal site for Josh Hamilton (`nearbycoder`) built with Astro. The app combines a portfolio, writing hub, layoff-era build log, and a `/uses` page into one static site.

## What the app includes

- Home page with a hero, latest articles, selected projects, recent layoff-log entries, and work history
- Article index and article detail pages powered by Astro content collections
- Project index and project detail pages with external links and stack metadata
- Layoff log index grouped by week plus detail pages for each shipped build update
- About and Uses pages driven by local data files
- Global command palette (`Cmd/Ctrl + K`) for pages, articles, projects, and theme switching
- Light, dark, and system theme support
- Automatically generated 1200 × 630 PNG social images, with existing SVG endpoints retained
- Article topic filters, heading navigation, related stories, and copy-link sharing
- Mobile navigation and an accessible search dialog, including layoff entries
- Optimized WebP cover images and a custom 404 page
- Experimental `/desktop` workspace with searchable content folders, movable and resizable reading windows, and a dock

## Stack

- Astro 6
- Tailwind CSS 4 via Vite
- React 19
- `astro:content` collections for structured Markdown content
- `astro-opengraph-images` for generated OG assets

## Content model

Most of the site is driven by content files and a couple of local data modules:

- `src/content/articles`
  Article posts with `title`, `description`, `date`, optional `publishedAt`, `tags`, `readTime`, `featured`, `accent`, and `draft`.
- `src/content/projects`
  Portfolio entries with `title`, `summary`, `role`, `year`, `stack`, optional `impact`, `link`, `githubLink`, `featured`, `accent`, and `draft`.
- `src/content/layoff`
  Weekly build-log entries with `title`, `summary`, `date`, optional `week` or `day`, `status`, `stack`, `repoUrl`, `siteUrl`, `accent`, and `draft`.
- `src/data/site.ts`
  Site metadata, navigation, socials, hero copy, newsletter copy, and work timeline.
- `src/data/uses.ts`
  The `/uses` page data for workstation, development, productivity, and AI tooling.

## Publishing behavior

- `draft: true` hides articles, projects, and layoff entries from the built site.
- Articles can be scheduled. In production, an article is published only when its `publishedAt` value is in the past, or when `date` is in the past if `publishedAt` is not set.
- In local development, scheduled articles are still visible so they can be previewed before launch.

## Important routes

- `/`
- `/about`
- `/articles`
- `/articles/[slug]`
- `/projects`
- `/projects/[slug]`
- `/layoff`
- `/layoff/[slug]`
- `/uses`
- `/og/site.svg`
- `/og/[slug].svg`
- `/card-art/[slug].svg`

## Local development

```sh
npm install
npm run dev
```

The dev server runs on `0.0.0.0:4321`.

## Commands

| Command                   | Action                               |
| :------------------------ | :----------------------------------- |
| `npm run dev`             | Start the local Astro dev server     |
| `npm run build`           | Build the production site            |
| `npm run preview`         | Preview the production build locally |
| `npm run astro -- --help` | Run Astro CLI commands               |

## Project structure

```text
/
├── public/                 # static assets, images, resume, favicon
├── src/
│   ├── components/         # shared UI components
│   ├── content/            # markdown content collections
│   ├── data/               # site metadata and uses-page data
│   ├── layouts/            # shared page layout
│   ├── lib/                # article helpers and SVG renderers
│   ├── pages/              # routes, including dynamic content pages and SVG endpoints
│   └── styles/             # global styles
├── astro.config.mjs
└── package.json
```

## Notes

### Experimental desktop

Visit `/desktop` (also linked in the footer and command palette) to browse the same published content as a desktop. The Library indexes articles, projects, layoff logs, postmortems, labs, reading paths, topics, technologies, and site pages at build time. It follows the existing draft and scheduled-publication rules; article and project bodies are searchable too.

Click a file to read the original interactive page in a window. Drag a title bar to move, drag a lower corner to resize, or use the minimize, maximize, and close controls. The bottom panel restores open pages, `Cmd/Ctrl + K` focuses Library search, and **Arrange windows** recovers the layout. On phones, the panel switches between full-width windows. **Open in a tab** and **Back to blog** provide ordinary browsing at any time.

The CachyOS/KDE-inspired shell opens onto an empty desktop. Open **Files** from the panel or use **Ctrl + Esc** for the application launcher. Search apps and all blog content, choose **Details** or **Icons** in Library, open the clock for a local calendar, or use **Show desktop** to hide and restore visible windows. The Terminal is also pinned to the panel on larger screens and available in the launcher everywhere. [Design and wallpaper notes](docs/desktop-design.md).

Windows last for the current visit; refreshing resets the workspace. Only the existing theme preference is saved. Without JavaScript, the Library still provides ordinary links to every indexed page. Run `npx playwright test tests/desktop.spec.ts tests/desktop-shell.spec.ts` after a build for the desktop interaction and accessibility checks.

### Arcade and desktop secrets

Open **Arcade** from the desktop shortcut or the gamepad in the dock. **Memory** has six pairs, a move counter, and a fresh-deal button. **Bug Sweep** is an 8×8 board with ten bugs, a safe first reveal, flood clearing, and flags via right-click or the touch-friendly Flag mode. Arrow keys move between squares; Enter plays. Games retain their state when minimized or switched, and reset when the Arcade window closes or the page reloads.

**Snake**, **Pong**, and **15 Puzzle** are also available in Arcade and launcher search. Snake uses arrow keys or direction buttons; Pong uses up/down keys or held buttons and ends at seven points. Start explicitly, use Space or Pause to pause, and choose New game to reset. Both pause when their activity or window becomes hidden/inactive, the tab is hidden, or the browser loses focus. The sliding puzzle supports tap/click, arrow keys to move the gap, undo, and solvable shuffled deals. These three games run locally without downloads from external services.

Loading stays inside `/desktop`: its route script dynamically imports Arcade when the window opens, then imports Snake, Pong, 15 Puzzle, or the DOOM player only when selected. DOOM's emulator and shareware still wait for Play. Keep game imports out of shared layouts and site-wide scripts. `tests/desktop-classics.spec.ts` checks all built regular pages, browser network requests, loading failures/races, game rules, controls, and mobile accessibility. Game CSS belongs to the desktop route too.

The **Terminal** is a pretend shell: it never runs system commands or sends input anywhere. Try `help`, `sudo make coffee`, `cat README.txt`, `42`, or `party`. The last command toggles the after-hours wallpaper. The classic **↑ ↑ ↓ ↓ ← → ← → B A** sequence also toggles it on the desktop, outside inputs and games. The terminal’s expandable hint makes the surprises available to touch and assistive-technology users too. Memory, Bug Sweep, and the terminal secrets use no sound, flashing effects, or background game loops.

Run `npx playwright test tests/desktop-arcade.spec.ts tests/desktop-classics.spec.ts tests/desktop-doom.spec.ts tests/desktop.spec.ts` after a build to check game rules, complete Memory play, restart/minimize behavior, the secrets, keyboard controls, and both-theme mobile accessibility.

### Content

- `easyaccessqr-com` is placed last in the projects archive, preserving the existing archive order.
- The articles page has its own client-side search input in addition to the global command palette.
- Site metadata and canonical URL settings are configured for `https://nearbycoder.com`.

## Verification and redesign

```sh
npx playwright install chromium
npm run verify
```

`verify` runs Astro type checks, a production build, and browser regression tests against the built site. `npm test` expects an existing production build. Images are optimized automatically before development and production builds.

See [the redesign notes and screenshot gallery](docs/redesign.md) for the visual direction, route coverage, accessibility scope, and measured performance.

### DOOM in the desktop

Open **Arcade → DOOM → Play DOOM**, or search **DOOM** in the desktop launcher. This runs the original v1.9 shareware Episode One through js-dos 8.4.1. The emulator is loaded from jsDelivr only after Play; the complete shareware bundle is hosted with the site. The first launch needs an internet connection.

Arrow keys move/turn, Ctrl fires, Space opens doors, Shift runs, 1–7 select weapons, and Escape opens the game menu. On-screen buttons support touch controls. Sound starts muted and can be enabled with **Sound on**. Switching activities, minimizing, switching windows, or hiding the browser tab pauses the game; **Resume** continues. **Stop game**, closing Arcade, or reloading discards the game session and releases the emulator. In-game saves are limited to that session.

Source, credits, release checksum, and reproduction notes are in [`public/games/doom/README.txt`](public/games/doom/README.txt). Existing desktop tests cover lazy loading, retries, controls, and lifecycle through a stubbed emulator; actual emulator boot and gameplay are also checked manually in-browser before release.

### Connected Ghostty terminal

Open **Ghostty** from the `/desktop` shortcut or launcher search for a real terminal with tabs and split panes. It connects over authenticated WebSockets to the included shell/SSH bridge; its engine and WASM load only when opened. Each pane has independent input, output, and sizing. Tokens stay in memory, and closing ends connections. A production endpoint must be configured before connecting to your own server. See [terminal setup and verification](docs/desktop-terminal.md).
