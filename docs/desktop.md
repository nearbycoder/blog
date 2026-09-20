# Desktop guide

Open `/desktop/` for a browser workspace with the blog's Library, Arcade, terminals, and 24 small applications. The collection includes the original Notes, Calculator, Sketchpad, and Focus plus 20 additions. The 24 apps run in the browser.

## Launching and arranging apps

Press **Cmd+K** on Mac or **Ctrl+K** on other keyboards to open Desktop commands, or choose **Commands** in the application launcher's footer. Search apps, blog files, open windows, and desktop actions from one menu. Arrow keys select results, Enter runs a command, and Escape returns focus to your work. Commands include switching/minimizing/closing windows, half/quarter snapping, maximizing/restoring, arranging windows, showing the desktop, and changing the theme. Window layout actions appear on wide screens. The shortcut also works inside blog readers; Ghostty keeps **Ctrl+K** for shell editing while **Cmd+K** opens commands.

The command menu's implementation, styles, and catalog load only on its first invocation inside `/desktop/`. Searching uses local metadata and does not download app implementations; those still load when an app is opened.

Open the application launcher from the bottom panel or press **Ctrl+Esc**. Browse **All apps** or the **Work**, **Create**, **Tools**, **Play**, and **Unwind** categories. Search matches app names, descriptions, keywords, and blog files across all categories. Results show the first 12 matches; narrow the phrase if necessary. Enter opens the first result, arrow keys move through results, and Escape closes the launcher. Reopening starts at All apps.

Each app has one window: launching it again brings that window forward. Use its panel task button to return to it after minimizing. Drag a title bar to move a window, use the edges or corners to resize it, or drag to a workspace edge/corner to preview a half/quarter snap. **Ctrl+Alt+Left/Right** snaps, **Up** maximizes, and **Down** restores. **Show desktop** hides the visible windows and restores that set on the next click. **Arrange windows** resets their layout. On phones, apps fill the workspace and panel tasks switch between them. See [desktop design](desktop-design.md#window-snapping) for gesture details.

## Application catalog

| Category | App            | What it does                                                                                                                  |
| -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Work     | Notes          | Multiple plain-text notes, undo delete, and text downloads.                                                                   |
| Work     | Focus          | Focus/break presets, custom countdowns, and completed-session count.                                                          |
| Work     | Tasks          | To do, Doing, and Done stages with editable tasks, filters, and undo delete.                                                  |
| Work     | Markdown Pad   | Draft with editor/preview views and download `.md`; supports headings, lists, emphasis, links, and code. Raw HTML stays text. |
| Work     | Stopwatch      | Start/pause, laps, undo reset, and CSV lap export.                                                                            |
| Create   | Sketchpad      | Freehand drawing, eraser, undo/redo, and PNG export.                                                                          |
| Create   | Color Studio   | HEX/RGB/HSL conversion, contrast comparison, and saved swatches.                                                              |
| Create   | Pixel Studio   | 16×16 pixel art with draw/erase/fill, undo/redo, and PNG export.                                                              |
| Create   | Beat Lab       | Three-voice, 8-step synthesized rhythms, tempo, presets, and a saved pattern.                                                 |
| Create   | Orbit Studio   | Adjustable geometric curves, presets, randomization, and PNG export.                                                          |
| Tools    | Calculator     | Arithmetic with precedence, parentheses, percentages, session history, and copy.                                              |
| Tools    | JSON Desk      | Validate, format, minify, copy, and download JSON.                                                                            |
| Tools    | Converter      | Unit conversion with labeled definitions, including temperature and volume.                                                   |
| Tools    | World Clock    | A curated city list, local time/date, and comparison time. Uses the browser's timezone data.                                  |
| Tools    | Text Workshop  | Counts, case changes, literal replacement, URL/Unicode Base64 conversion, undo, copy, and text download.                      |
| Play     | Dice Table     | Roll 1–12 dice from d4 through d100, flip a coin, and view recent results.                                                    |
| Play     | Sudoku         | Curated puzzles, conflicts, hints, undo, and saved progress.                                                                  |
| Play     | Four in a Row  | Local two-player play or a simple computer opponent.                                                                          |
| Play     | Reversi        | Local two-player play or a simple computer opponent, legal moves, and automatic passes.                                       |
| Play     | Word Search    | Themed puzzles with pointer or keyboard start/end selection.                                                                  |
| Play     | Type Sprint    | Original practice passages, speed/accuracy results, and a local best.                                                         |
| Unwind   | Soundscapes    | Synthesized white/pink/brown noise and a gentle tone, mix controls, and a sleep timer.                                        |
| Unwind   | Life Lab       | Conway's Game of Life with drawing, presets, random seeds, step/play, and undo.                                               |
| Unwind   | Decision Wheel | Saved choices, a random selection, and recent spin results.                                                                   |

Library, Arcade, the pocket Terminal, and Ghostty remain separate launcher favorites. [Terminal documentation](desktop-terminal.md) covers Ghostty's existing connections and setup.

## Saving, exports, and background behavior

The desktop automatically remembers open apps and blog readers, window positions and sizes, half/quarter snaps, maximized and minimized windows, stacking order, and the active window. Returning to `/desktop/` in the same browser profile on the same device restores that workspace. Closing a window removes it from the saved workspace; minimizing keeps it. Show desktop returns as minimized windows after a reload. Phone layouts retain the saved desktop placement for when the viewport becomes wide again, and positions are kept reachable on smaller screens.

Restoring a workspace restores its windows, not every app's running session or unsaved content. Each app follows the saving rules below. Minimized apps and readers wait until opened before loading their code or content. Audio still requires Play, and Ghostty requires a new connection; terminal tokens and live sessions are never included in the workspace save. Window placement is applied before the windows appear, so saved windows do not flash at their default locations. Workspace saves belong to this browser and site origin, with no cross-device sync.

Browser storage keeps Notes, Focus state, Tasks, the Markdown draft, World Clock choices, Color Studio swatches, Pixel Studio artwork, the explicitly saved Beat Lab pattern, Soundscapes preferences, Sudoku progress, Type Sprint's best, and Decision Wheel choices. Other work and histories last only for the open window. Beat Lab's **Save pattern** and Decision Wheel's **Save choices** make their save behavior explicit; spinning also uses and saves edited choices.

Storage belongs to this browser profile and site origin. There is no account, cross-device sync, shared editing, or general backup/import facility. Clearing site data removes local saves. When storage is blocked or full, a save may fail; use an app's displayed storage status and export important work where an export exists. Saved data has size and shape limits. Notes and Markdown offer recovery downloads for unreadable stored data; recovery behavior differs in other apps.

Downloads are local files: Notes/Text Workshop produce text, Markdown Pad produces Markdown, JSON Desk produces JSON, Sketchpad/Pixel Studio/Orbit Studio produce PNGs, and Stopwatch produces lap CSVs. Tasks, palettes, beat patterns, and other local settings have no general file export. Sketchpad, Orbit Studio, JSON Desk, Text Workshop, and Stopwatch should be exported before closing if their output matters. Clipboard and download support depend on browser permissions and capabilities.

Beat Lab and Soundscapes create audio only after **Play**. Minimizing them, choosing Show desktop, hiding the browser tab, or closing their window stops playback; returning requires Play again. They synthesize sound locally and do not download recordings. Life Lab and Type Sprint pause while hidden and require an explicit resume. Focus continues its countdown while minimized/backgrounded and pauses/saves when closed. Stopwatch counts elapsed time while hidden but stops display updates; closing it discards the session. Orbit Studio redraws on changes rather than running an idle animation loop.

The 20 additions introduce no external data services, accounts, dependencies, or remote APIs. This scope excludes existing Ghostty connections and Arcade resources. App chunks load from the site when opened. Following a Markdown link navigates to that link; it is not fetched to render the preview.

## Maintaining the collection

[`src/lib/desktop-apps.ts`](../src/lib/desktop-apps.ts) holds only small launcher metadata. [`src/pages/desktop.astro`](../src/pages/desktop.astro) includes one shared app-window template. [`src/scripts/desktop.ts`](../src/scripts/desktop.ts) creates a window and imports the loader only after launch. [`desktop-apps.ts`](../src/scripts/desktop-apps.ts) dynamically imports the chosen app and returns its mount function; the host checks disposal before mounting after an asynchronous download. Closing calls the app's cleanup.

App styles use `import css from "../styles/desktop-ID.css?inline"` and `installAppStyle(ID, css)`. The helper installs a single style element on first use; that small stylesheet remains available for reopening. Ordinary CSS imports in lazy modules can be hoisted into the page by the build, so keep this inline pattern. The shared app styles are also deferred until first launch. Shell styles belong to `/desktop`; app implementations and styles must stay out of desktop startup and normal blog pages. The Tailwind source exclusions in [`global.css`](../src/styles/global.css) prevent desktop-only class tokens from growing the shared blog stylesheet.

To add an app:

1. Add metadata with a unique ID, category, title, description, subtitle, search keywords, and existing or newly mapped icon. Add a case to the exhaustive loader switch.
2. Add a scoped `desktop-ID.ts`/`.css` pair. Export `mountApp(root): () => void`, install CSS with the inline helper, and keep selectors scoped to the app.
3. Return cleanup for listeners, observers, timers, animation frames, object URLs, and audio. Guard asynchronous work against closure and handle hidden windows explicitly. Start sound only through a user gesture. Keep keyboard handling within the app's controls.
4. Validate and bound stored/input data, render user text safely, show save failures, and preserve usable controls in narrow windows, both themes, reduced motion, and touch layouts. Editable mobile fields must use at least 16px text.
5. Add focused functional and regression coverage in `tests/desktop-ID.spec.ts`. The registry-driven collection, mobile, accessibility, and budget checks should cover new entries without a second app list.

Run `npm run verify` for type checking, a production build, and Playwright tests against the built preview. Do not replace `dist` while preview tests are running. Collection coverage checks individual app loading, launcher categories/search, all-app multitasking, mobile layout, and themes/accessibility; existing window, icon, context-menu, Arcade, terminal, and blog tests remain relevant. Review visible layouts and actual browser audio as well as automated checks.

[`tests/desktop-performance.spec.ts`](../tests/desktop-performance.spec.ts) measures uncompressed emitted JS/CSS, including static imports. Its ceilings are 65,547 bytes for the homepage, 79,277 bytes for the representative article (including its static dependencies), 160 KiB for desktop startup, 8 KiB for the deferred shared app loader, and 24 KiB for each app with its static dependencies. These are bundle regression budgets, not page-load timing claims; images, fonts, and HTML are outside those totals. Network checks also verify that browsing the launcher starts no app audio, media, or WASM work and that only launched app chunks are requested.

The expansion used 50 delegated tasks: 20 app builders, 20 individual app reviewers, and 10 cross-cutting audits covering loading/budgets, launcher, windows, icons, context menus, mobile, lifecycle, stored data, accessibility, and documentation. Release checks include the final integrated check/build/test run and verification of the deployed revision.
