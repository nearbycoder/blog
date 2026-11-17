---
title: "Chroma"
summary: "A free, open-source color picker for the Mac menu bar. Press Control-Option-Command-P, click any pixel, and paste it in one of 35 formats, with palettes, a contrast checker and color blindness previews."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "Swift",
    "SwiftUI",
    "AppKit",
    "Liquid Glass",
    "macOS 26",
    "ScreenCaptureKit",
    "App Intents",
    "XcodeGen",
    "Icon Composer",
    "dmgbuild",
    "notarytool",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/chroma/"
githubLink: "https://github.com/nearbycoder/chroma"
image: "/images/projects/chroma.webp"
imageAlt: "The Chroma banner on a dark background: the app icon with overlapping pink, green and blue circles, the name Chroma, the line “A color picker for macOS. Free and open source.”, and a screenshot of the loupe magnifying the edge of a coral swatch, labeled #FF7A59 Coral."
imageCaption: "The banner from the Chroma README, made by a repository script from the app icon and a screenshot of the loupe."
featured: false
accent: "rose"
draft: false
---

Chroma is a color picker that lives in the Mac's menu bar. Press ⌃⌥⌘P, click any pixel on screen, and the color is on the clipboard as hex, CSS, SwiftUI, Tailwind, Jetpack Compose or one of 30 other formats. It also keeps a history and palettes, checks contrast, and previews colors for color blindness.

It's free and open source under the MIT license, and it was inspired by [Sip](https://sipapp.io); its default shortcuts are Sip's, so muscle memory carries over. It needs macOS 26 Tahoe or later, runs on Apple silicon and Intel, and releases are signed with a Developer ID and notarized by Apple. Chroma has no network access, analytics or account. When you start picking, it takes one still image of each display, and it discards them when you finish.

<figure>
  <img src="/images/projects/chroma-picker.webp" alt="Chroma's loupe over a mock Moodboard design app on a purple and orange wallpaper: a circular magnifier shows the pixel grid at the edge of a coral swatch, with a label reading #FF7A59 Coral, and a bar at the bottom lists Click copy, Shift-click keep picking, Arrows nudge, Scroll zoom, Tab format and Esc cancel." width="1440" height="810" loading="lazy" />
  <figcaption>The loupe over a mock desktop, from the Chroma website. Repository scripts render that desktop and drive a debug build of the picker over it.</figcaption>
</figure>

## Features

- **A loupe that's exact.** The screen freezes and a magnifier follows the pointer, with the value and the color's name below it. Arrow keys move one pixel, scrolling zooms, and you can average a 3×3 or 5×5 square. ⇧-click picks several colors in a row, and they go on the clipboard one per line.
- **35 formats, plus your own.** Hex, CSS `rgb()`, `hsl()`, `oklch()` and `color(display-p3)`, the nearest Tailwind swatch, SwiftUI, UIColor, NSColor, CGColor, Jetpack Compose, Flutter, Android XML, React Native, .NET, Unity, OpenGL, CMYK and more. Custom formats use tokens like `{r}`, `{hex}` and `{name}`.
- **Smart formats.** Picks made in Xcode copy SwiftUI and picks in Android Studio copy Compose, and you can add a rule for any app. Tab cycles formats while picking.
- **History and palettes.** Every pick is saved. Palettes can be named, annotated, sorted by hue, lightness or name, merged, duplicated and locked. Select several colors to copy them together or turn them into a palette, and undo any change with ⌘Z.
- **Color Dock.** Your palettes in a glass strip at any screen edge. Click a color to copy it, or drag it into another app.
- **Contrast checker.** WCAG 2 ratios for normal text, large text and UI, plus APCA (Lc). Fix buttons find the nearest passing text or background color while keeping the hue.
- **Color blindness preview** for protanopia, deuteranopia, tritanopia and achromatopsia, for whole palettes and in the contrast checker.
- **Editor, harmonies and scales.** Edit in RGB, HSB, HSL or OKLCH, get complementary, analogous, triadic, split complementary and tetradic colors, and turn any color into a 50 to 950 scale.
- **Import and export.** Chroma reads Adobe Swatch Exchange, Apple Color Lists, GIMP and Sketch palettes, JSON, and any text with color codes in it. It writes those plus CSS variables, SCSS, a Tailwind v4 `@theme`, a SwiftUI extension, Android `colors.xml` and a PNG swatch sheet.
- **Sync through a folder.** The library is one readable `Library.json`. Put it in iCloud Drive or Dropbox, and Chroma reloads it when another Mac changes it.
- **Automation.** Shortcuts actions (Pick Color, Get Last Picked Color, Convert Color and Add Color to Palette) and a URL scheme, with links like `chroma://pick` or `chroma://contrast?text=%23333&background=%23fff`.

<figure>
  <picture><source srcset="/images/projects/chroma-library-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/chroma-library.webp" alt="Chroma's library window: a sidebar with History and the palettes Orbit Brand, Sunset, Ocean and Apple System, a grid of the ten Orbit Brand swatches including Midnight, Deep Indigo, Iris, Coral, Marigold and Lagoon with their hex values, and an inspector for Iris (#6A5AE0) with a color editor, RGB fields and a list of formats." width="1040" height="660" loading="lazy" /></picture>
  <figcaption>The library, with palettes in the sidebar and an inspector for the selected color.</figcaption>
</figure>

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/chroma-contrast-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/chroma-contrast.webp" alt="The Contrast Checker window: a preview card with purple text on cream, text and background colors #7C5CFF and #F4F1EA, a ratio of 3.85 to 1 marked Large text only, AA and AAA badges for normal text, large text and icons, APCA Lc 61, and Fix Text, Fix Background and Save Pair to Palette buttons." width="664" height="532" loading="lazy" /></picture><figcaption>The contrast checker, with WCAG 2 and APCA scores.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/chroma-menu-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/chroma-menu.webp" alt="Chroma's menu bar panel: the last color, Fuchsia Blue #6A5AE0, buttons for Pick, Contrast, Library and Dock, a row of history swatches, and the Orbit Brand, Sunset, Ocean and Apple System palettes, with Settings and Quit at the bottom." width="320" height="541" loading="lazy" /></picture><figcaption>The menu bar panel: the last color, history and palettes.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/chroma-formats-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/chroma-formats.webp" alt="Chroma's Formats settings: Copy as Hex with uppercase hex on, smart formats that copy SwiftUI Color in Xcode and Jetpack Compose in Android Studio, an Add App button, and switches for each shown format such as Hex, Hex without # and CSS rgb()." width="560" height="708" loading="lazy" /></picture><figcaption>Formats settings, with smart formats for Xcode and Android Studio.</figcaption></figure>
</div>

The screenshots above come from the repository. Debug builds include a harness that opens each window with a demo library and its own settings, and a script captures them in light and dark. They follow this site's theme.

## The loupe in a browser

The [website](https://nearbycoder.github.io/chroma/#try) has a JavaScript version of the loupe that works on a sample picture. Scroll to zoom, nudge with the arrow keys, and click to copy. Each pick lands in a history, with its contrast on white and black and its value in each format. The site also has a live table where you type a color in any notation and see it in every format, using the same templates as the app.

<figure>
  <picture><source srcset="/images/projects/chroma-try-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/chroma-try.webp" alt="The loupe demo on the Chroma website: a sunset picture with a Summer palette card, a round magnifier over the sun's edge labeled #EFB999, and a side panel for the last pick, Tailwind teal-500 (#2EC4B6), with a history of five colors, contrast of 2.17:1 on white and 9.69:1 on black, and copyable Hex, CSS rgb(), hsl(), oklch(), display-p3 and Tailwind values." width="1440" height="838" loading="lazy" /></picture>
  <figcaption>The browser demo on the Chroma website, captured after picking five colors from the sample picture.</figcaption>
</figure>

## How it's built

Chroma is about 6,800 lines of Swift in SwiftUI and AppKit. The picker captures each display with ScreenCaptureKit, the global shortcuts go through Carbon's hot key API, and the Shortcuts actions are App Intents. The Color Dock, the picker's hint bar and the copy toast use Liquid Glass. Color names come from [Name That Color](https://chir.ag/projects/name-that-color/) by Chirag Mehta (CC BY 2.5), the Tailwind swatches are Tailwind CSS v4's default palette, and the color blindness simulation uses the matrices from Machado, Oliveira and Fernandes (2009). Nineteen unit tests cover the color math, the contrast fixer, every built-in format, and reading and writing the palette file formats.

The Xcode project is generated with [XcodeGen](https://github.com/yonaskolb/XcodeGen), and the icon is made with Icon Composer. A release script runs the tests, archives the app, signs it with a Developer ID, notarizes and staples it, and builds the DMG with [dmgbuild](https://github.com/dmgbuild/dmgbuild); `./Scripts/release.sh publish` also tags the version and creates the GitHub release. Another script regenerates every image on the website through the debug harness, including the mock desktop behind the picker and the social card. The website is a single HTML page on GitHub Pages.

[PixelMark](/projects/pixelmark), a screen ruler whose repository was created the same day, is built the same way, down to an identical release script.

## Try it

Download [Chroma.dmg](https://github.com/nearbycoder/chroma/releases/latest/download/Chroma.dmg) and drag Chroma to Applications. It needs macOS 26 Tahoe or later, and it asks for Screen Recording permission because it has to read the pixels on screen. To build it, install XcodeGen with `brew install xcodegen`, run `xcodegen generate`, and open `Chroma.xcodeproj` in Xcode 26 or later. The [website](https://nearbycoder.github.io/chroma/) has the browser demo, the format table and an FAQ, and the [README](https://github.com/nearbycoder/chroma) lists every shortcut.

The creation date shown here is the GitHub repository's UTC creation date. The banner and app screenshots on this page come from the project's repository and website, and the browser demo was captured from the live website.
