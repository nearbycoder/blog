---
title: "Scrub"
summary: "A free, open-source Mac cleaner and optimizer built natively for macOS Tahoe with Liquid Glass. It cleans caches and junk, uninstalls apps completely, maps your disk, runs maintenance and shows your Mac's activity live."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "Swift",
    "SwiftUI",
    "Liquid Glass",
    "macOS 26",
    "XcodeGen",
    "Icon Composer",
    "dmgbuild",
    "notarytool",
    "GitHub Actions",
  ]
link: "https://nearbycoder.github.io/scrub/"
githubLink: "https://github.com/nearbycoder/scrub"
image: "/images/projects/scrub.webp"
imageAlt: "Scrub's Overview screen in dark mode: a MacBook Pro with its chip, memory and macOS version, a Macintosh HD storage bar, live tiles for CPU, memory, network and battery, and recommendations to look for junk files, find old build folders, restart, and allow Full Disk Access."
imageCaption: "The Overview screen, from the Scrub README."
demoVideos:
  - src: "https://nearbycoder.github.io/scrub/media/scrub-demo.mp4"
    title: "Scrub demo"
    caption: "The 84-second demo from the Scrub site: Smart Clean, Space Lens, Applications, Project Purge, Maintenance and Activity. It was recorded with Scrub's built-in demo mode, which plays a captioned tour of the app and never cleans real files."
    poster: "/images/projects/scrub-demo-poster.webp"
featured: false
accent: "sky"
draft: false
---

Scrub is a Mac cleaner and optimizer, built natively for macOS Tahoe. It cleans caches and junk, uninstalls apps along with everything they leave behind, maps where your disk space went, runs maintenance tasks, and shows what your Mac is doing right now.

It's free and open source under the MIT license. It was inspired by [Mole](https://github.com/tw93/Mole) and the commercial Mac cleaners, and it's an independent implementation written from scratch. Releases are signed with a Developer ID and notarized by Apple.

## What it does

| Feature           | What it does                                                                                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Smart Clean       | System and user caches, logs, crash reports, temporary files, browser caches, developer junk like Xcode DerivedData and package-manager caches, chat and AI app caches, old installers, leftovers from deleted apps, and the Trash. Every file is listed first. |
| Applications      | A sortable table of your apps. The inspector lists everything an app leaves behind, and you can uninstall it or just reset its data. Everything goes to the Trash.                                                                                             |
| Space Lens        | A treemap of any folder or drive, with back and forward navigation, a path bar, and a largest-files table.                                                                                                                                                     |
| Maintenance       | Rebuilds the Quick Look and Launch Services caches, repairs damaged preference files, resets font caches, compacts Mail's index, flushes DNS, reindexes Spotlight and more. Admin tasks share one password prompt.                                             |
| Touch ID for sudo | One switch writes `/etc/pam.d/sudo_local`, which survives macOS updates.                                                                                                                                                                                       |
| Activity          | CPU per core, memory and pressure, swap, disk I/O, network, GPU, battery health and a process table you can quit processes from.                                                                                                                              |
| Project Purge     | Finds `node_modules`, `target`, `.build`, `dist`, `.next`, `__pycache__`, `venv`, `Pods` and other build folders across your projects.                                                                                                                         |
| Installers        | Finds `.dmg`, `.pkg`, `.iso`, `.xip` and installer `.zip` files in Downloads, Desktop, Documents, iCloud Drive, Mail and the Homebrew cache.                                                                                                                   |
| Menu bar          | Live meters, Smart Scan and Free Up Memory.                                                                                                                                                                                                                    |
| History           | A log of every cleanup: what was removed, from where, and how much space it freed.                                                                                                                                                                            |

Smart Clean covers Safari, Chrome, Edge, Brave, Arc, Firefox, Opera and Vivaldi, and developer caches from Homebrew, npm, Yarn, pnpm, Bun, pip, uv, CocoaPods, Gradle, Cargo and Go. Each category shows its app's icon, a plain-language explanation, a safety rating and a sortable list of every file. Project Purge shows each project as a card with its stack, when it last changed, and a toggle for each build folder.

<div class="project-media-gallery">
  <figure><img src="/images/projects/scrub-smart-clean.webp" alt="Scrub's Smart Clean screen: 8.59 GB selected of 39.6 GB found, categories for system junk, browsers and developer tools, with Google Chrome and Xcode skipped because they're open, and the User App Caches category marked Safe to remove with its folders listed by size." width="1280" height="864" loading="lazy" /><figcaption>Smart Clean lists every file in every category before anything is removed.</figcaption></figure>
  <figure><img src="/images/projects/scrub-space-lens.webp" alt="Scrub's Space Lens showing the Applications folder as a colorful treemap, with Unity, Xcode, Android Studio and Docker as the largest blocks, beside a list of apps sorted by size." width="1280" height="864" loading="lazy" /><figcaption>Space Lens maps a folder as a treemap, next to its largest items.</figcaption></figure>
  <figure><img src="/images/projects/scrub-applications.webp" alt="Scrub's Applications screen: a table of apps with version, last opened and size, and an inspector for Surfshark listing the files to remove, including HTTP storage, caches, application support, preferences and launch agent scripts, with Reset and Uninstall buttons. A caption reads Uninstall apps together with everything they leave behind." width="1280" height="800" loading="lazy" /><figcaption>Uninstalling an app with its leftovers. A frame from the demo.</figcaption></figure>
  <figure><img src="/images/projects/scrub-project-purge.webp" alt="Scrub's Project Purge screen with cards for rust-cli, weather-app, portfolio-site, ios-notes and ml-experiments, each showing its stack, when it last changed, and build folders like target, node_modules, .build and .venv. The recently active portfolio-site starts unselected." width="1280" height="864" loading="lazy" /><figcaption>Project Purge. The project changed 22 minutes ago starts unselected.</figcaption></figure>
  <figure><img src="/images/projects/scrub-maintenance.webp" alt="Scrub's Maintenance screen with a Use Touch ID for sudo switch, and toggles for tasks like Rebuild Quick Look Cache, Rebuild Launch Services, Remove Broken Launch Agents, Repair Preference Files, Reset Font Caches, Speed Up Mail and Homebrew Cleanup, with a Run Tasks button." width="1280" height="864" loading="lazy" /><figcaption>Maintenance tasks, with Touch ID for sudo at the top.</figcaption></figure>
</div>

## Built to be cautious

A cleaner is only useful if you can trust it, so most of the design is about not removing the wrong thing.

- **Preview first.** Nothing is removed until you review it and press the button.
- **A path guard.** It refuses `/System`, `/usr`, `/bin`, `/Library`, `/Applications`, your home folder, and top-level folders like Documents, Desktop, Downloads and `~/Library`. Symlinked parent folders are resolved before the check, walks never follow symlinks, and links that lead off the startup disk are skipped.
- **Running apps are skipped.** Caches of open apps, and browser caches while the browser is open, are left alone.
- **Protected items.** Right-click anything and choose _Always Protect This Item_.
- **The Trash when it matters.** Apps, leftovers, installers, backups and anything from Space Lens go to the Trash. Regenerable caches are deleted directly by default, and Settings can send them to the Trash instead.
- **Conservative defaults.** Package-manager caches, Xcode archives, device backups and leftovers of removed apps start unselected. Leftovers only show up when no installed app from the same vendor exists and nothing has written to them in 15 days. In Project Purge, folders git tracks are protected and recently active projects start unselected.

Without Full Disk Access, Scrub skips the locations where macOS would show a privacy prompt rather than interrupting you. Granting it lets Scrub include Safari, Mail and sandboxed app caches.

## Fast, and quiet when idle

The disk walker reads directories with `getattrlistbulk(2)`, which returns names, types, sizes and dates for a whole batch of entries in one system call, spread over a pool of threads. Mapping a 240 GB `~/Library` with about 900,000 files takes about 12 seconds in the README's measurement, against 35 seconds for an `fts` walk and 46 for `du`. Smart Clean lists every rule's candidates first and measures them together in a single parallel walk.

The treemap is drawn in one SwiftUI `Canvas`, with layout computed once per folder and size, so hovering only redraws a highlight. Live sampling runs only while Overview, Activity or the menu bar panel is open, and process stats come from `libproc` instead of spawning `ps`. With no window showing live data, Scrub sits at 0% CPU.

## Native by design

Scrub sticks to standard macOS building blocks: a source-list sidebar, unified toolbars, sortable `Table` outlines, inspectors and grouped forms. Liquid Glass appears only where macOS itself uses it, on the control layer: the toolbar, the sidebar, and floating controls like the action bar. Content stays plain and readable. The app icon is made with Icon Composer.

Cleanup rules live in one catalog file, [`CleanCatalog.swift`](https://github.com/nearbycoder/scrub/blob/main/Scrub/Features/Clean/CleanCatalog.swift), so adding support for another app is usually a few lines. The release script archives the app, signs it with a Developer ID, notarizes and staples both the app and the disk image, and builds the drag-to-install DMG with [dmgbuild](https://github.com/dmgbuild/dmgbuild).

## Try it

Download [Scrub.dmg](https://github.com/nearbycoder/scrub/releases/latest/download/Scrub.dmg) and drag Scrub to Applications, or install it with one line:

```sh
curl -fsSL https://raw.githubusercontent.com/nearbycoder/scrub/main/install.sh | bash
```

It needs macOS 26 Tahoe or later and runs natively on Apple silicon and Intel. Once installed, Scrub checks GitHub for new releases once a day and installs them in place, but only if the update is notarized by Apple and signed by the same developer. The [website](https://nearbycoder.github.io/scrub/) has the demo and screenshots, the [releases page](https://github.com/nearbycoder/scrub/releases) has the changelog, and the [README](https://github.com/nearbycoder/scrub) covers building from source with Xcode 26.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots and video on this page come from the project's README and website.
