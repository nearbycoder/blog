# Desktop expansion · October 2026

Sixty additions to the existing desktop, bringing the application catalog to 30.
Existing apps, snapping, themes, search, and saved window geometry are the
baseline, not counted as new features. Checked items are implemented and have
been independently reviewed against the focused coverage linked below. Final
release verification is tracked separately at the end of this document.

## Feature ledger

### Notes

- [x] 01. Search note titles and bodies.
- [x] 02. Pin important notes above ordinary notes.
- [x] 03. Duplicate a note.
- [x] 04. Import a plain-text document.
- [x] 05. Export the entire notebook as JSON.
- [x] 06. Preview and merge a validated notebook backup.

### Tasks

- [x] 07. Assign and filter task priorities.
- [x] 08. Set due dates and identify overdue tasks.
- [x] 09. Search task titles and details.
- [x] 10. Export the task board as JSON.
- [x] 11. Export spreadsheet-safe CSV.
- [x] 12. Preview and merge a task backup.

### Markdown Pad

- [x] 13. Format selections with a toolbar.
- [x] 14. Apply formatting with scoped keyboard shortcuts.
- [x] 15. Import Markdown with replacement confirmation.
- [x] 16. Find and replace text.
- [x] 17. Navigate a document outline.
- [x] 18. Export a safe standalone HTML document.

### Library

- [x] 19. Sort files by name, type, or date in either direction.
- [x] 20. Star files and browse Favorites.
- [x] 21. Browse recent files and clear that history.
- [x] 22. Navigate folders and searches with Back/Forward.
- [x] 23. Inspect file details and copy its link.
- [x] 24. Restore folder, search, and view preferences.

### Settings

- [x] 25. Select a desktop accent palette.
- [x] 26. Choose a wallpaper treatment.
- [x] 27. Switch between compact and comfortable controls.
- [x] 28. Set a larger interface text size.
- [x] 29. Reduce desktop motion and transparency.
- [x] 30. Show or hide desktop shortcuts.

### Window tools

- [x] 31. Switch windows with a browser-safe keyboard switcher.
- [x] 32. Manage windows in an overview.
- [x] 33. Keep selected windows above ordinary windows.
- [x] 34. Minimize all other windows.
- [x] 35. Choose a snap layout from a visible picker.
- [x] 36. Reopen the most recently closed app or reader.

### Virtual desktops

- [x] 37. Create and remove virtual desktops.
- [x] 38. Give desktops meaningful names.
- [x] 39. Switch between isolated workspaces.
- [x] 40. Move a window to another desktop.
- [x] 41. Restore desktop names and window assignments after reload.
- [x] 42. Switch desktops or move the active window with shortcuts.

### Activity and launcher

- [x] 43. Browse desktop notifications and dismiss entries.
- [x] 44. See unread activity in the panel.
- [x] 45. Silence interruptions with Do Not Disturb.
- [x] 46. Filter activity by type.
- [x] 47. Pin favorite launcher apps.
- [x] 48. Reopen recent apps and clear app history.

### Data center

- [x] 49. Inspect storage usage by desktop data category.
- [x] 50. Download a backup of all supported saved desktop-data categories.
- [x] 51. Export only selected categories.
- [x] 52. Validate an imported backup and preview its contents.
- [x] 53. Restore selected categories with explicit replacement confirmation.
- [x] 54. Reset selected local data with confirmation.

### Agenda

- [x] 55. Browse a calendar with event indicators.
- [x] 56. Create local dated events.
- [x] 57. Edit and delete events.
- [x] 58. Search an upcoming-events view.
- [x] 59. Export events as an ICS calendar.
- [x] 60. Receive due-event reminders while Agenda is running.

## Delivery constraints

Keep the Plasma-inspired shell, local data, accessible controls, and phone layout.
No account, cloud sync, OS file access, or background execution is implied.
No terminal credentials belong in a backup. Apps remain loaded on demand.
Unreadable existing data must survive inspection and ordinary edits.

## Agent roster

The environment supports three concurrent worker agents plus the coordinator.
Thirty specialists work in batches. Assignments cover implementation and
independent review; they are not thirty simultaneous edits to shared shell files.

1. Shell audit
2. App and data audit
3. Experience audit
4. Notes implementation
5. Tasks implementation
6. Markdown implementation
7. Library implementation
8. Settings implementation
9. Window tools implementation
10. Virtual desktops implementation
11. Activity and launcher implementation
12. Data Center implementation
13. Agenda implementation
14. Independent Notes review
15. Loading isolation and performance review
16. Independent Tasks review
17. Independent Markdown review
18. Independent Library review
19. Independent Settings review
20. Independent window tools review
21. Independent virtual desktops review
22. Independent Activity and launcher review
23. Independent Data Center review
24. Independent Agenda review
25. Existing desktop regression review
26. Mobile and accessibility review
27. Adversarial storage review
28. Keyboard and lifecycle review
29. Human experience walkthrough and documentation audit
30. Independent release review

## Feature coverage

Each group has an implementation review and focused regression coverage. The
tests below describe the behavior being checked; this table does not substitute
for the final integrated test run.

| Features                    | Coverage                                                                | Important cases                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 01–06 Notes                 | [Notes expansion tests](../tests/desktop-notes-expansion.spec.ts)       | Search, pins, independent duplicates, text and notebook imports, merge conflicts, undo, unreadable storage, narrow windows.                 |
| 07–12 Tasks                 | [Tasks expansion tests](../tests/desktop-tasks-expansion.spec.ts)       | Combined filters, priorities and dates, exports, CSV formula escaping, inert import preview, merge/undo interaction, storage failures.      |
| 13–18 Markdown              | [Markdown expansion tests](../tests/desktop-markdown-expansion.spec.ts) | Selection-aware formatting, scoped shortcuts, confirmed imports, literal replacement, outline navigation, escaped HTML export.              |
| 19–24 Library               | [Library expansion tests](../tests/desktop-library-expansion.spec.ts)   | Bidirectional sorting, remembered choices, favorites/recents, history navigation, inspector copying and fallback, lazy-load races.          |
| 25–30 Settings              | [Settings expansion tests](../tests/desktop-settings-expansion.spec.ts) | Immediate and restored appearance, palette contrast, intact readers, mobile text/touch controls, malformed and blocked storage.             |
| 31–36 Window tools          | [Window expansion tests](../tests/desktop-windows-expansion.spec.ts)    | Overview actions, focus restoration, recently used order, pins across reload, minimized and off-desktop windows, reopening, phone controls. |
| 37–42 Virtual desktops      | [Spaces expansion tests](../tests/desktop-spaces-expansion.spec.ts)     | Isolation, moving and removing desktops, persistence, shortcuts, capacity, existing minimization, unreadable storage.                       |
| 43–48 Activity and launcher | [Activity expansion tests](../tests/desktop-activity-expansion.spec.ts) | History, unread state, DND, filters, favorites, recent apps, storage bounds, inert notification text, accessible toast behavior.            |
| 49–54 Data Center           | [Backup expansion tests](../tests/desktop-backup-expansion.spec.ts)     | Allowlisted full/selected exports, validation, preview, confirmed restore/reset, write rollback, layout restoration, credential exclusions. |
| 55–60 Agenda                | [Agenda expansion tests](../tests/desktop-agenda-expansion.spec.ts)     | Calendar indicators and CRUD, upcoming search, ICS escaping/folding, local-time and daylight-saving cases, reminders and persisted markers. |

Cross-cutting coverage includes [storage failures and future records](../tests/desktop-storage-expansion.spec.ts),
[all-app loading](../tests/desktop-collection.spec.ts),
[phone layouts](../tests/desktop-mobile-collection.spec.ts),
[accessibility](../tests/desktop-accessibility-collection.spec.ts),
[keyboard and lifecycle](../tests/desktop-keyboard-expansion.spec.ts), and
[bundle isolation and budgets](../tests/desktop-performance.spec.ts), alongside the
existing window, reader, terminal, Arcade, and blog regression tests.

The manual walkthrough exercised writing a note, creating a named desktop,
moving that note's window, switching desktops, snapping and pinning the window,
changing appearance, opening apps through launcher search, and creating an Agenda
event. Desktop, 390px, and 320px layouts were inspected in both themes. The 320px
Agenda page stayed within the viewport and saved the event; the integrated browser
session reported no script errors.

## Release verification

The integrated release checks completed on October 3, 2026:

- `npm run check`: zero errors and zero warnings; eight nonblocking hints.
- `npm run build`: 222 generated pages.
- `npm test -- --workers=2`: all 473 tests passed against the production preview in 5.9 minutes.
- The full suite includes all 30 apps, both themes, 320px/390px layouts, keyboard and audio lifecycle, delayed imports, storage failures, restore rollback, and existing blog/terminal/Arcade behavior.
- Production-preview browser inspection confirmed usable side-by-side windows and phone controls, with no browser script errors.

Final uncompressed asset measurements, including static dependencies:

| Surface                |   Bytes | Ceiling |
| ---------------------- | ------: | ------: |
| Homepage               |  87,167 |  87,167 |
| Representative article | 100,897 | 100,897 |
| Desktop startup        | 133,716 | 163,840 |
| Deferred app loader    |   7,553 |   8,192 |
| Largest app (Tasks)    |  24,547 |  24,576 |

The site publishes from `main` through Vercel. The release procedure checks the deployed revision and the live desktop after publishing.

The desktop budgets remain 160 KiB for startup, 8 KiB for the deferred shared
loader, and 24 KiB per app including static dependencies. Ordinary-page budgets
match the independently rebuilt pre-expansion revision
`01730a61da6cc63c5a59e61d38df5d9738d81b6d`: 87,167 bytes for the homepage and
100,897 bytes for the representative article. No desktop implementation or style
is added to ordinary blog pages.
