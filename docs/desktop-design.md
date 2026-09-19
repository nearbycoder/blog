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
