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
