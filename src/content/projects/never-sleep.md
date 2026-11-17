---
title: "Never Sleep"
summary: "A native macOS keep-awake utility written in Rust with the Rune UI framework. It keeps a Mac awake while it's plugged in, even with the lid closed, and lets it sleep as usual on battery."
role: "Creator"
createdAt: "2026-11-11"
year: "2026"
stack:
  [
    "Rust",
    "Rune",
    "AppKit",
    "IOKit",
    "Liquid Glass",
    "Sparkle",
    "notarytool",
    "dmgbuild",
    "GitHub Actions",
    "GitHub Pages",
  ]
link: "https://nearbycoder.github.io/never-sleep/"
githubLink: "https://github.com/nearbycoder/never-sleep"
image: "/images/projects/never-sleep.webp"
imageAlt: "The Never Sleep website's hero on a dark background: the headline “Stay awake. Stay in flow.” with “in flow.” in amber, a Download for Mac button with the note “Free. Open source. Apple silicon · macOS 14+” and “Developer ID signed & Apple notarized”, and beside it a settings window with the amber sun icon, the status “Keeping your Mac awake” and switches for Keep awake on power, Keep display awake and Show in Dock, above an Unplug power button."
imageCaption: "The hero of the Never Sleep website. The settings window there is an interactive HTML illustration on the site, not a screenshot of the app."
featured: false
accent: "amber"
draft: false
---

Never Sleep keeps a Mac awake while it's plugged in. Turn on one switch and it stops automatic idle sleep whenever macOS reports external power. Unplug and protection pauses; plug back in and it resumes. The window can stay closed, because a sun icon in the menu bar holds the power switches.

It's a native macOS app written in Rust. The interface is built with [Rune](https://github.com/anomalyco/rune), a pre-release Rust UI framework, and the menu bar item is AppKit. It's free and open source under the MIT license, it needs macOS 14 or later, and the download is built for Apple silicon, signed with a Developer ID and notarized by Apple. Versions 0.2.0 and 0.2.1 were both released on the day the repository was created.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/never-sleep-window-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/never-sleep-window.webp" alt="The Never Sleep settings window: the amber sun and power icon, the name Never Sleep, a green status reading Keeping your Mac awake above Power adapter connected, and four rows with switches. Keep awake on power, Keep awake with lid closed and Show in Dock are on, Keep display awake is off. A footer reads Always available in the menu bar, beside a Done button." width="920" height="1120" loading="lazy" /></picture><figcaption>Plugged in, with protection on. Rendered from the source with Rune's headless snapshot mode and the app's simulated <code>active</code> scene.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/never-sleep-battery-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/never-sleep-battery.webp" alt="The same window on battery: the status is gray and reads Ready when you plug in, above Running on battery, while the Keep awake on power switch stays on." width="920" height="1120" loading="lazy" /></picture><figcaption>On battery, protection waits for power. The simulated <code>battery</code> scene.</figcaption></figure>
</div>

The README documents a `--snap` flag that renders the interface to a PNG without opening a window, using scenes (`active`, `display`, `battery`, `off` and `unknown`) that simulate the power state and never touch real power settings. The two images above were made that way, on Linux. A local patch to `main.rs` removed its macOS-only build guard and stubbed out two references to the macOS menu bar code so it would compile there; the interface code is unchanged. Linux has no San Francisco, so the text falls back to another sans-serif font, and an offscreen render gets the window's opaque fallback background instead of Liquid Glass. Both follow this site's light or dark theme.

## Using it

The window has four switches:

- **Keep awake on power** prevents automatic idle sleep whenever macOS reports external power, including when the battery is full. It starts off.
- **Keep awake with lid closed** keeps the Mac running when you close the lid while protection is active, like closed-display mode. It starts on. Unplugging restores normal lid sleep within two seconds, so a closed Mac on battery sleeps as usual.
- **Keep display awake** also prevents display idle sleep while protection is active. On its own it doesn't turn protection on.
- **Show in Dock** can be turned off for a menu-bar-only app. The menu bar menu has the power switches, Show Never Sleep, Check for Updates and Quit.

⌘K toggles keep-awake, ⌘W closes the window and ⌘Q quits. Settings persist between launches in a small JSON file in Application Support. Choosing Sleep from the Apple menu and emergency thermal sleep still work, screen locking is unchanged, and Never Sleep doesn't register itself to launch at login.

## How it works

Power is checked every two seconds, including while the window is closed. Never Sleep reads the source that's actually supplying the Mac through IOKit, and only AC power counts: battery, UPS, unknown power and failed reads all release protection.

While protected, the app holds IOKit power assertions, `PreventUserIdleSystemSleep` and, if selected, `PreventUserIdleDisplaySleep`. They're owned by the process, so quitting releases them. Nothing needs administrator rights, there's no helper daemon, and no `pmset` setting is changed.

The lid is harder. macOS ignores power assertions when the lid closes, so the lid option asks the kernel's power manager to skip clamshell sleep instead. That switch is system-wide and outlives the process. Never Sleep clears it whenever protection ends and at every launch, and it starts a watchdog, a second copy of the same binary run with `--lid-override-watchdog`. The watchdog blocks on a pipe from the app. When the app quits or crashes, the pipe closes and the watchdog restores normal lid sleep.

<figure>
  <picture><source srcset="/images/projects/never-sleep-watchdog-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/never-sleep-watchdog.webp" alt="Lines 246 to 279 of never-sleep/src/power.rs: a static WATCHDOG mutex holding the child's stdin, an ensure_watchdog function that spawns the current executable with LID_WATCHDOG_ARG and a piped stdin and never waits on it, and run_lid_watchdog, which reads stdin until it ends, then calls clear_lid_override and exits." width="1440" height="1329" loading="lazy" /></picture>
  <figcaption>The lid watchdog in <code>src/power.rs</code>. The app never writes to the pipe, so any return from the read means it's gone.</figcaption>
</figure>

## How it's built

The interface is a little over 300 lines in `src/ui.rs`: Rune elements with animated switches that carry accessibility roles and labels, light and dark appearances, and the system accent color. On macOS 26 and later the window uses native Liquid Glass, earlier versions get a native popover material, and Reduce Transparency switches to an opaque background. Rune's tray API doesn't support macOS yet, so the menu bar item is written against AppKit through the `objc2` crates. The power code calls IOKit and Core Foundation directly through Rust's foreign function interface. Rust 1.99.1 and Rune's Git revision are pinned for reproducible builds.

The power policy sits in a controller with swappable backends, so it's testable without real hardware. Tests cover unplugging and replugging, unknown power, assertion failures and retries, saving preferences, and clicks through the real Rune interface. Tests that take real IOKit assertions are opt-in.

Updates use [Sparkle 2](https://sparkle-project.org/). The app checks a signed appcast on GitHub Pages and verifies each update with an Ed25519 public key embedded in the app. Automatic checks and installs are on by default and can be changed from the menu bar. Version 0.2.0 was the first release with the updater.

Releases are built on a Mac with scripts. One builds the app bundle, one signs it through Xcode's cloud-managed Developer ID signing, one notarizes and staples it with `notarytool`, and one packages a drag-to-Applications disk image with [dmgbuild](https://github.com/dmgbuild/dmgbuild), which is notarized too. The publish script checks the source commit, versions, signatures and stapled tickets, mounts the disk image to validate the app inside, signs the appcast, and uploads the DMG, the appcast and a checksum file to a GitHub release. Signing keys stay in the Mac's Keychain. GitHub Actions runs formatting, Clippy and the tests on a macOS runner, and deploys the website with the latest signed appcast. Another script builds an Apple Installer package with custom welcome, information and completion screens.

The amber sun-and-power icon was made with an image generation tool, and the prompt is committed next to it in `assets/app-icon-prompt.txt`.

## Try it

Download [Never-Sleep.dmg](https://github.com/nearbycoder/never-sleep/releases/latest/download/Never-Sleep.dmg), open it, and drag Never Sleep to Applications. It needs macOS 14 or later on an Apple silicon Mac. To build it yourself, you need the Xcode Command Line Tools and Rust 1.99.1, which `rust-toolchain.toml` pins. Run `cargo run --locked`, or `./scripts/build-app.sh` for an app bundle. The [website](https://nearbycoder.github.io/never-sleep/) has an interactive preview, and [RELEASE.md](https://github.com/nearbycoder/never-sleep/blob/main/RELEASE.md) walks through the release process.

The creation date shown here is the GitHub repository's UTC creation date. The cover is a capture of the project's website, the window images were rendered from the source with Rune's headless snapshot mode on Linux, and the code excerpt is from `src/power.rs`.
