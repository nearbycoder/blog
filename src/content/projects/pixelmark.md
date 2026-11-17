---
title: "PixelMark"
summary: "A free, open-source screen ruler for macOS. Press Shift-Command-2 and it measures from the pointer to the nearest edges, snaps dragged boxes to the content inside, and shows spacing, padding, guides and colors."
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
    "XcodeGen",
    "Icon Composer",
    "dmgbuild",
    "notarytool",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/pixelmark/"
githubLink: "https://github.com/nearbycoder/pixelmark"
image: "/images/projects/pixelmark.webp"
imageAlt: "The PixelMark banner on a dark background: the app icon, a pink ruler inside white corner brackets, the name PixelMark, the line “A screen ruler for macOS. Free and open source.”, and a screenshot of a dashboard with a chart bar measured at 64 × 189, a New Project button measured at 140 × 44, and a loupe reading #5C54F2."
imageCaption: "The banner from the PixelMark README, made by a repository script from the app icon and a screenshot of the overlay."
demoVideos:
  - src: "https://nearbycoder.github.io/pixelmark/assets/demo.mp4"
    title: "PixelMark feature tour"
    caption: "The 85-second silent tour from the PixelMark website, in 22 chapters from Hover to Shortcuts. A repository script records it from a debug build that plays the walkthrough over a mock desktop while ScreenCaptureKit records only that window."
    poster: "/images/projects/pixelmark-demo-poster.webp"
featured: false
accent: "pink"
draft: false
---

PixelMark is a screen ruler for the Mac. Press ⇧⌘2 and point at anything: lines run from the pointer to the nearest edge in each direction, labeled with the width and height between them. Drag a box around an element and it shrinks to fit the content inside. It reads pixels rather than layout, so it works on apps, websites, design files, images and video alike.

It's free and open source under the MIT license, and it was inspired by [PixelSnap](https://pixelsnap.com). It needs macOS 26 Tahoe or later, runs on Apple silicon and Intel, and releases are signed with a Developer ID and notarized by Apple. PixelMark has no network access, analytics or account. Each time you start measuring, it takes one still image of each display and discards it when you finish. Versions 1.0 through 1.2.1 all came out on the day the repository was created, and 1.2 added fourteen measuring tools.

## Measuring

- **Hover to measure.** Lines run from the pointer to the nearest edge in each direction, labeled with the width and height.
- **Boxes that snap.** Drag around anything and the box shrinks to fit the content. Hold ⇧ for a free box. Aspect ratios (A) and positions (P) can be shown, and boxes of the same size get an = mark.
- **Spacing and padding.** Hold ⌥ over a box to see the gaps to its neighbors, or ⌃ to see the padding around the content inside it. Aligned boxes get alignment lines.
- **Point to point.** ⌘-drag measures the distance and angle between two points, with ⇧ for 45° steps.
- **Guides, rulers and grid.** H or V drops a guide (⇧ puts it through the middle of a box), R adds rulers along the screen edges, and G lays an 8 pt grid that starts at the hovered box.
- **Loupe and colors.** A magnified view of the pixels under the pointer, which Z zooms. C copies the color as hex, RGB, HSL or SwiftUI, and K checks the WCAG contrast between two colors.
- **Copy and save.** ⌘C copies a size as `320 × 48`, `320x48`, CSS or a SwiftUI `.frame`, and ⌥⌘C copies every measurement as a list. ⌘S saves and copies a screenshot with every measurement on it, and ⇧⌘S crops it to the measured area.
- **The rest.** Points or pixels (U), an adjustable edge tolerance ([ and ]), undo and redo for marks, a choice of mark color, and every connected display. Press ? to see every shortcut on screen, and Esc when you're done.

<div class="project-media-gallery">
  <figure><img src="/images/projects/pixelmark-measure.webp" alt="PixelMark over a mock Orbit dashboard: the tallest bar of a weekly activity chart measured at 64 × 189 with crosshair lines, a loupe above it reading #5C54F2, the New Project button pinned at 140 × 44, and a glass helper bar along the bottom listing Drag box, Click pin, Option spacing, Command-C copy, Command-S screenshot, ? all shortcuts, pt and Tolerance 12." width="1260" height="900" loading="lazy" /><figcaption>Hovering a chart bar, with the loupe and a pinned button.</figcaption></figure>
  <figure><img src="/images/projects/pixelmark-spacing.webp" alt="Three stat cards on the dashboard boxed in pink, with 24 pt gaps labeled between them, 124 above and 27.5 below the middle card, and two outer cards labeled 274.5 × 138." width="1260" height="900" loading="lazy" /><figcaption>Holding ⌥ shows the spacing between boxes.</figcaption></figure>
  <figure><img src="/images/projects/pixelmark-guides.webp" alt="Dashed pink guides across the dashboard's stat cards and the chart panel, measurements of 870 × 349 and 870 × 132.5 inside the chart, and a loupe over a white area reading #FFFFFF." width="1260" height="900" loading="lazy" /><figcaption>Guides through the cards and the chart.</figcaption></figure>
</div>

These screenshots come from the PixelMark website. A debug build runs the overlay over a mock desktop that a repository script renders, and a scripted harness drives it, so the dashboard is sample content.

## In a browser

The [website](https://nearbycoder.github.io/pixelmark/#try) has a small version you can try without installing anything. It measures the page's own elements rather than pixels: hover for sizes, drag a box around something, or click to pin a measurement.

<figure>
  <picture><source srcset="/images/projects/pixelmark-try-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/pixelmark-try.webp" alt="The PixelMark website's demo: a small Orbit dashboard with the Open tasks card boxed at 249 × 121, the New Project button boxed at 102 × 36, and a crosshair over a chart bar measuring 40 × 98." width="1440" height="634" loading="lazy" /></picture>
  <figcaption>The browser demo on the PixelMark website, captured after snapping two boxes and hovering a chart bar.</figcaption>
</figure>

## How it works

Measuring starts with one ScreenCaptureKit image per display, frozen as an RGBA buffer. From the pixel under the pointer, PixelMark walks outward in each direction until a pixel differs from the starting color by more than the tolerance in any channel. The default tolerance is 12. Pressing ] raises it so subtle shadows and gradients are ignored, and [ lowers it so a faint 1 px border counts.

<figure>
  <picture><source srcset="/images/projects/pixelmark-span-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/pixelmark-span.webp" alt="Lines 67 to 94 of pixelmark/Sources/PixelMark/PixelBuffer.swift: a differs function that compares the red, green and blue channels of two packed colors against a tolerance, and a span function that walks left, right, up and down from a point while pixels match the starting color, then returns an EdgeSpan." width="1440" height="828" loading="lazy" /></picture>
  <figcaption>The edge search in <code>PixelBuffer.swift</code>.</figcaption>
</figure>

Snapping a box uses the same buffer. It takes the most common corner color as the background and shrinks the box to the tightest rectangle around anything that differs from it. Padding works from the inside: the box is inset past its border and rounded corners, the fill is sampled from the middle of each edge, and what's left is the content, such as a button's label. Fifteen unit tests cover the edge search, tolerance, content bounds, contrast ratios, aspect ratios, line angles and the copy formats.

## How it's built

PixelMark is about 4,000 lines of Swift. The measuring overlay is drawn with AppKit, and the helper bar, toasts and shortcut sheet floating over it are SwiftUI with Liquid Glass. The global shortcut is registered through Carbon's hot key API, and the app lives in the menu bar.

The Xcode project is generated with [XcodeGen](https://github.com/yonaskolb/XcodeGen), and the icon is made with Icon Composer. A release script runs the tests, archives the app, signs it with a Developer ID, notarizes and staples it, and builds the DMG with [dmgbuild](https://github.com/dmgbuild/dmgbuild); `./Scripts/release.sh publish` also tags the version and creates the GitHub release. Debug builds can drive the overlay from a script for screenshots without covering your screen, and `record-demo.sh` uses the same harness to record the feature tour, which FFmpeg encodes for the website. The website is a single HTML page on GitHub Pages.

[Chroma](/projects/chroma), a color picker whose repository was created the same day, shares this structure, down to an identical release script.

## Try it

Download [PixelMark.dmg](https://github.com/nearbycoder/pixelmark/releases/latest/download/PixelMark.dmg) and drag PixelMark to Applications. It needs macOS 26 Tahoe or later, and it asks for Screen Recording permission because it has to read the pixels on screen. To build it, install XcodeGen with `brew install xcodegen`, run `xcodegen generate`, and open `PixelMark.xcodeproj` in Xcode 26 or later. The [website](https://nearbycoder.github.io/pixelmark/) has the tour, the browser demo and an FAQ, and the [README](https://github.com/nearbycoder/pixelmark) lists every shortcut.

The creation date shown here is the GitHub repository's UTC creation date. The banner, screenshots and video on this page come from the project's repository and website, the browser demo was captured from the live website, and the code excerpt is from `PixelBuffer.swift`.
