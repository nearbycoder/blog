# Desktop design

The `/desktop` shell takes its direction from [CachyOS's KDE and Emerald screenshots](https://wiki.cachyos.org/installation/desktop_environments/#screenshots): compact Breeze-style window controls, charcoal surfaces, emerald selection, an application launcher, and one bottom task panel. This is an original web interpretation, not an official CachyOS product or a full operating system.

The desktop starts with no windows open. File Manager, Arcade, and Terminal launch from the panel or application menu. The clock/calendar, application/content search, icon/detail views, and Show desktop control are functional. Existing content remains in embedded reader windows. On small screens, windows fill the workspace and the panel switches between them.

## Wallpaper provenance

- Asset: [`public/images/desktop/emerald-glass.webp`](../public/images/desktop/emerald-glass.webp)
- Mode: original text-to-image generation with the built-in image generation tool, then WebP conversion with Sharp at quality 88.
- References: no source images supplied; the wallpaper is original and contains no CachyOS branding.
- Prompt:

> Use case: stylized-concept. Asset type: original Linux desktop wallpaper for a CachyOS-inspired KDE Plasma web desktop. Create a polished 2560x1440 landscape wallpaper, edge-to-edge. Deep midnight navy and dark petroleum teal background with broad angular folded glass ribbons and faceted crystalline planes sweeping diagonally from lower left to upper right. Subtle luminous emerald and turquoise edges, atmospheric dark depth, clean mathematical geometry, restrained contrast and lots of quiet negative space for desktop icons and windows. The focal geometry is on the right half; keep the upper-left quadrant dark and calm. Premium abstract operating-system wallpaper, crisp and elegant, no grain or dots, no starfield, no UI, no computer, no text, no letters, no logos, no watermark. Do not reproduce an existing wallpaper.

Dark is the default desktop appearance when the site's theme preference is System; an explicit Light preference is respected. The panel theme toggle retains the site's existing preference behavior. After-hours mode recolors only the wallpaper, without flashing or continuously running animations.

## September styling refresh

References were found and visually reviewed with Mobbin's MCP screen search:

- [ElevenLabs file browser](https://mobbin.com/screens/d67a0f4d-6324-48fd-9a86-1938b9e8946d): a quiet folder sidebar, clear file-list heading, and generous row spacing informed the Library layout.
- [Bolt workspace](https://mobbin.com/screens/38707e43-1f98-49b6-9d21-7c607db610d3): restrained pane separators and compact tabs informed the Ghostty chrome.

The shell retains its original wallpaper and Plasma-style bottom panel. Shared slate surfaces, emerald selection, consistent window controls, and larger interface text connect all the apps. Light mode uses the same hierarchy with white content and pale sidebars. Desktop shortcut tiles use the existing Tabler icons; no reference artwork is copied.

Arcade uses a game sidebar in wide windows and a compact game grid in narrow ones. Ghostty uses named icon controls, a centered connection form, and a visible launcher favorite. Container queries adapt both apps when their windows are resized, as well as on phones. Editable mobile text remains at least 16px to avoid focus zoom.

All styling belongs to `/desktop`. Game engines and Ghostty still load only when their respective apps or games are opened. The normal blog does not import desktop styles or scripts.

## Complete desktop themes

Light mode uses a paired daylight wallpaper, pale icon tiles with darker colored glyphs, dark shortcut labels, and softer window/popup shadows. Dark mode retains the midnight wallpaper and illuminated glyphs. Desktop shortcuts, task-panel apps, launcher favorites, and file icons share theme tokens, including the after-hours wallpaper caption. Native controls and scrollbars use the matching `color-scheme`.

- Light asset: [`public/images/desktop/emerald-glass-light.webp`](../public/images/desktop/emerald-glass-light.webp).
- Provenance: built-in image generation, editing the original `emerald-glass.webp` without replacing it; converted to WebP with Sharp at quality 88.
- Edit brief: preserve the folded glass planes and diagonal composition; replace midnight lighting with pale glacier blue, pearly white, misty mint, emerald edges, soft daylight and translucent frosted glass. Keep the left side light and quiet, with no text, icons, logos or additional objects.

Only the active wallpaper is requested by the desktop's CSS. Both assets stay outside the normal blog bundle; the chosen theme persists through the existing preference setting.

## Window snapping

Drag a title bar until the pane touches the left or right desktop boundary for a half-screen window, two boundaries at a corner for a quarter-screen window, or only the top boundary to maximize. Contact is measured from the pane’s edges, not the cursor, with a 4px tolerance around the desktop’s 8px gutter. An emerald preview shows the exact release bounds, labeled ½, ¼, or Full screen. Drag a snapped/maximized window away to restore its floating size. Escape or a canceled pointer gesture restores the starting layout; minimizing keeps the chosen layout and Arrange windows clears it.

Every window can be resized from all four edges and four corners. Resizing a snapped pane detaches it at its current size, keeps the opposite edge fixed, and respects minimum sizes and workspace bounds. Escape, pointer cancellation, or loss of focus restores the original geometry and snap state. Resize handles are hidden on phones.

Ctrl+Alt+Left/Right snaps the active window to a half, Up maximizes, and Down restores. Connected terminal input retains its own keyboard events. Layouts resize with the workspace; narrow Library and Arcade windows adapt their controls. Phones keep their full-screen app switching behavior, and returning to a desktop-sized viewport restores the chosen layout.

## Everyday applications

The launcher contains 30 applications, including six system and planning tools added in the October expansion. Five categories—Work, Create, Tools, Play, and Unwind—organize the collection, with an All apps view and search across applications and blog files. Notes and Sketchpad retain desktop shortcuts; shortcuts wrap into another column on shorter displays. Every app uses the existing window controls, task buttons, snapping, and eight-direction resizing. Phones use full-workspace windows with task switching.

The collection combines local writing and task tools, unit and text utilities, drawing and sound experiments, puzzles, and quiet simulations. [The desktop guide](desktop.md#application-catalog) lists every app and explains saving, exports, keyboard controls, and background behavior. Data stays in the current browser where an app supports saving; other state lasts for its window session. Beat Lab and Soundscapes require Play and stop when hidden. Focus and Stopwatch retain elapsed-time semantics while minimized; their close behavior differs.

Desktop startup includes launcher metadata, one reusable app-window template, and the shell services needed to apply saved appearance, window assignments, and activity. The shared app styles and each app's implementation/styles load on demand. CSS is imported as an inline string and installed by the lazy module to prevent build-time hoisting. Desktop source is excluded from the shared Tailwind scan, and normal blog pages import no desktop implementations or styles. Form fields remain at least 16px on mobile and coarse pointers. Both themes use the desktop's shared colors.

The earlier 20-app expansion added no external data service or package dependency. Its review process assigned 20 app builders, 20 individual reviewers, and 10 cross-cutting audits. Registry-driven integration checks cover loading, mobile layouts, themes/accessibility, and bundle budgets alongside individual app tests; the guide describes the maintainer invariants and release verification steps.

## October workspace expansion

The [60-feature ledger](desktop-expansion-2026-10.md) records the current expansion. A small upper-right toolbar exposes workspace management, window overview, notifications, and settings without crowding the bottom task panel. The existing wallpaper, desktop shortcuts, and window chrome remain the visual foundation. New tools use the same desktop tokens and lazily installed application styles.

Virtual desktops distinguish an out-of-view window from a user-minimized window. They keep the existing app visibility lifecycle, so moving away pauses sound and simulation activity. Layout restoration still defers apps that are not visible. A narrow shared host adapter lets overview and backup tools use the established close, focus, and save behavior instead of duplicating it.

The October work uses 30 specialist assignments across implementation, independent feature reviews, and integrated release checks. The environment runs at most three workers beside the coordinator, so assignments proceed in batches. The ledger records all 60 additions and links their regression coverage; its release section distinguishes implementation from final build, test, and deployment verification.

## The Penthouse (November 2026)

The blog is now themed as the Nearby Building, a Tulsa Art Deco skyscraper. `/desktop` is its top floor, the Penthouse. In dark mode the shell uses lacquer-black and plum surfaces with brass hairlines over a neon night skyline. In light mode it uses limestone and ivory surfaces with gilt hairlines over a daylight skyline. Hex values come from the blog's tokens: night uses `#0d0b18`, `#1a1628`, `#3a3150`, ink `#f4e9d6`, neon rose `#ff5c7f`, neon teal `#3fe6c8` and bulb gold `#ffc35a`; day uses limestone `#efe6d4`/`#f7f1e4`, ink `#1b1714`, terracotta `#b23f26`, jade `#1d6b5b` and gilt `#a87b2a`/`#8c6418`.

- **Type.** Jost (`--desk-font-ui`) is the interface font. Big Shoulders Display (`--desk-font-display`) sets window titles, headings, the clock and the calendar month as tracked uppercase signage. Limelight (`--desk-font-brand`) appears only on the plaque and the launcher medallion. The Fontsource CSS is imported in `src/pages/desktop.astro` alone, so normal blog pages load none of it. Code views keep their monospace fonts.
- **Windows.** Each title bar is a three-column grid, so the title stays centred on the window. Triple gilt speed lines flank the title. A gilt double rule sits under the bar and becomes stronger on the active window. Controls are quiet glyphs with a round hover chip, and the close chip is terracotta.
- **Panel.** The bottom panel is an elevator-lobby strip with a brass double rule on top. The launcher button is a brass octagon holding an original sunburst glyph (`sunburst` in `DesktopIcon.astro`). Running apps are marked with a small diamond. The clock uses deco numerals.
- **Shortcuts.** Desktop shortcuts are octagonal medallions with a brass frame (`--desk-icon-frame`) around a lacquer or ivory face. Glyphs use themed colours: teal/jade, rose/terracotta, gold/brass and ink. Labels sit on small plaques so they stay readable over the busy skyline.
- **Popups.** The launcher, calendar, context menu, command palette, window switcher and notifications share the brass top rule. The launcher header has a faint sunburst. Today in the calendar is a brass octagon.
- **Wallpaper plaque.** The old "nearby DESKTOP" caption is now a lobby plaque: a "PH" floor medallion, _nearby_ in Limelight, and THE PENTHOUSE between speed lines. The after-hours easter egg still swaps the brand text.
- **Preferences.** Settings has two new defaults: the **Brass** accent (`#ffc35a` dark, `#845414` light, which is AA on ivory and on the selected wash) and the **Deco skyline** wallpaper. Emerald, Blue, Violet and Amber keep their exact values. Emerald glass, Quiet solid and Drafting grid are still available. The stored preference schema is still `version: 1`, and older saved values remain valid.
- **Unchanged.** The lazy architecture is the same: app styles are still installed on demand, and only the active wallpaper is requested.

### Skyline wallpaper provenance

- Assets: [`deco-skyline-night.svg`](../public/images/desktop/deco-skyline-night.svg) (~52 KB) and [`deco-skyline-day.svg`](../public/images/desktop/deco-skyline-day.svg) (~36 KB).
- Generator: [`scripts/generate-deco-skyline.mjs`](../scripts/generate-deco-skyline.mjs). Run `node scripts/generate-deco-skyline.mjs` to regenerate both files. Output is deterministic for `CITY_SEED = 1926` (the year Route 66 was commissioned), which lays out the city, and `LIGHT_SEED = 66`, which places the lit windows and stars.
- Method: the art is entirely procedural and was made for this site; no reference artwork was traced or copied. One city is built from symmetric stepped-setback towers in three depth layers. Three front towers are composed by hand: the hero spire right of centre, a chevron-crowned east tower, and a mast-topped west tower. The far and mid layers and a band of low street blocks are seeded. Both moods render that same city:
  - **Night:** an indigo sky, a faint gold sunburst and halo rings rising behind the hero, and two crossing searchlights. Setbacks are floodlit, windows glow amber, and rooftops carry rose and teal neon. There are a few stars and a marquee of bulbs on a street block.
  - **Day:** a limestone and peach sky with a gilt sunburst and a streamlined sun disc. The hero tower is terracotta with a jade copper-patina crown and a gilt spire, the east tower is jade, and the distance fades into atmospheric haze.
- Composition: the upper left stays calm for shortcuts, because rays fade out toward that corner and the buildings there are low. On phones, `--desk-wallpaper-position: 68% center` keeps the hero tower in view.
