---
title: "Slip"
summary: "Native file sharing for macOS, iOS, Android, Windows and Linux. Send photos, folders and text to nearby devices over your local network, with full compatibility with LocalSend."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "Swift",
    "SwiftUI",
    "SwiftNIO",
    "Kotlin",
    "Jetpack Compose",
    "OkHttp",
    "C#",
    "WinUI 3",
    "ASP.NET Core",
    "Rust",
    "GTK 4",
    "libadwaita",
    "Tokio",
    "Axum",
    "Flatpak",
    "XcodeGen",
    "LocalSend protocol v2",
  ]
link: "https://nearbycoder.github.io/slip/"
githubLink: "https://github.com/nearbycoder/slip"
image: "/images/projects/slip.webp"
imageAlt: "The Slip social card on a green gradient: the green S app icon, the headline “Send files to anything nearby.”, the line “Native, LocalSend-compatible sharing over your Wi-Fi. No cloud.”, and chips for macOS, iOS, Android, Windows and Linux."
imageCaption: "The Open Graph card from the Slip website."
featured: false
accent: "green"
draft: false
---

Slip sends files and text between devices on the same network. Open it on two devices, pick some photos, a folder or a message, tap the device you want, and the other side sees who's sending what and taps Accept. Nothing goes through a server or the internet, and there's no account.

There are five apps, and each one is native: Swift and SwiftUI on the Mac and iPhone, Kotlin and Jetpack Compose on Android, C# and WinUI 3 on Windows, and Rust with GTK 4 and libadwaita on Linux. They all speak the [LocalSend](https://localsend.org) protocol, so Slip works with every other Slip device and with anyone already running LocalSend.

It's free and open source under the MIT license. The [website](https://nearbycoder.github.io/slip/) has the overview and download links.

<figure>
  <picture><source srcset="/images/projects/slip-app-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/slip-app.webp" alt="A drawing of the Slip Mac window on its Send tab, with a Lisbon trip tray of 25 files and 184 MB, nearby devices Fresh Peach on iPhone, Kind Melon on Windows, Neat Lemon on a Pixel tagged LocalSend and Solid Pear on Fedora Linux, beside a phone on its Receive tab asking to accept 25 files from Clever Mango with Decline and Accept buttons." width="1120" height="650" loading="lazy" /></picture>
  <figcaption>Sending from a Mac and receiving on a phone. It's the illustration from the top of the Slip website, drawn in HTML, not a screenshot.</figcaption>
</figure>

The illustrations on this page follow this site's theme: switch between light and dark and they change with it.

## What it does

- **Finds devices on its own.** Nearby devices appear as soon as Slip opens. Each gets a friendly name like "Clever Mango" or "Solid Pear", which you can change in Settings.
- **Files, folders and text.** Send a single photo, a whole folder tree with its structure intact, or a snippet of text or a link. Text arrives as a message with a Copy button.
- **Accept, or don't ask.** Every incoming transfer shows the sender, the file list and the total size, and you can untick files you don't want. Quick Save accepts everything automatically.
- **PIN protection.** On a shared network you can require a PIN before anyone can send you anything.
- **Encrypted by default.** Transfers run over HTTPS. Each device makes its own self-signed certificate on first launch, and its fingerprint is that certificate's SHA-256. There's an optional plain HTTP mode in Settings.
- **Fast.** Files stream straight to disk, up to three at a time, and are checked against a SHA-256 when the sender provides one.
- **Send to an IP address.** If discovery can't see a device, you can type its address in by hand.

<figure>
  <picture><source srcset="/images/projects/slip-features-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/slip-features.webp" alt="Slip's feature cards: Finds your devices automatically, with the app icon in the middle of rings of nearby devices; Encrypted end to end, with protocol https and a fingerprint; Files, folders and text; Accept, or don't ask, with a Quick Save switch; PIN protection, with the digits 4, 8, 1 and 5; Never leaves your network; and As fast as your Wi-Fi, with three progress bars." width="1200" height="1110" loading="lazy" /></picture>
  <figcaption>The features section of the Slip website.</figcaption>
</figure>

## Speaking LocalSend

Every Slip client implements [LocalSend protocol v2](https://github.com/localsend/protocol), and the repository keeps a [mirror of the spec](https://github.com/nearbycoder/slip/blob/main/protocol/localsend-v2.md). Behaviour that has to match across all five apps is written down once, in [`protocol/IMPLEMENTATION.md`](https://github.com/nearbycoder/slip/blob/main/protocol/IMPLEMENTATION.md), and each platform follows it.

**Discovery.** Each app joins the multicast group `224.0.0.167` on port 53317 on every IPv4 interface and announces itself three times, at about 100 ms, 500 ms and 2 seconds, because packets get dropped. When a peer announces, Slip answers with a `POST /register` to that peer, and falls back to a multicast reply if the request fails. If multicast is blocked, Slip scans the local /24 subnet over HTTP, at most 50 hosts at once with a one-second timeout. That runs when you tap Refresh, and on its own when no peers have shown up after a few seconds. LocalSend apps only announce when they start, so Slip re-announces every 30 seconds or so to keep the list fresh. A peer that goes quiet is probed directly before it's removed, and never while a transfer with it is running.

**Transfers.** The sender posts the file list to `prepare-upload`. The receiver holds that request open while you decide, for up to 60 seconds. Accept and it returns a session with a token for each file you kept. Then the files upload in parallel, each streamed to a partial file and renamed into place when it's done. Paths from the sender are sanitised, so a folder can't write outside the save folder, and a name that's already taken gets a ` (1)` suffix. The file's modified time is kept.

<figure>
  <picture><source srcset="/images/projects/slip-localsend-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/slip-localsend.webp" alt="The Slip website's compatibility section, headed “Speaks LocalSend, fluently.”, listing multicast discovery on 224.0.0.167:53317, REST over HTTPS and Open and tested, beside a Slip and LocalSend pairing and a prepare-upload request with its 200 OK response." width="1200" height="600" loading="lazy" /></picture>
  <figcaption>The compatibility section of the Slip website, with a sample <code>prepare-upload</code> exchange.</figcaption>
</figure>

Each platform's protocol code lives in a core library with no UI: SlipKit for Apple, a `:core` module for Android, Slip.Core for Windows and `slip-core` for Linux. Each one also has a headless `slip-cli` with `receive`, `send` and `discover` commands. The CLIs let the five cores be tested against each other and against the official LocalSend app, in both directions, over HTTPS and HTTP.

A few parts of LocalSend aren't implemented yet. The download API, where a device serves files to a browser, isn't supported, and Slip doesn't pin a peer's certificate to its fingerprint.

## Five native apps

| Platform | Built with                                 | Notes                                                                                                                                                         |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS    | Swift, SwiftUI, SwiftNIO                   | macOS 14 or later, Apple silicon and Intel. A sidebar window, drag and drop onto a device, and a menu bar extra that keeps receiving after the window closes. |
| iOS      | Swift, SwiftUI, SwiftNIO                   | iOS 17 or later. Send from Photos or Files. Received files appear in the Files app under On My iPhone › Slip.                                                 |
| Android  | Kotlin, Jetpack Compose, Material 3        | Android 8 or later. A system share target, and a foreground service that keeps Slip discoverable. Files are saved to Download/Slip.                           |
| Windows  | C#, WinUI 3, Kestrel                       | Windows 10 1809 or later, x64 and ARM64. Mica, Fluent controls, toast notifications, and drag and drop from Explorer.                                          |
| Linux    | Rust, GTK 4, libadwaita, tokio, axum       | GNOME 46 or newer. A libadwaita app with a Flatpak manifest.                                                                                                  |

Each app follows its own platform's conventions while keeping the same four sections: Receive, Send, Transfers and Settings. On iOS, Slip only receives while it's in the foreground, because iOS suspends apps in the background, but it asks for extra time to finish a transfer that's already running.

Multicast on an iPhone needs an entitlement that Apple has to approve, so the default iOS build leaves it out and finds devices with the subnet scan instead. LocalSend peers that see Slip's `/register` calls add it to their lists too.

## Download

The Mac app is on the [releases page](https://github.com/nearbycoder/slip/releases). [Slip.dmg](https://github.com/nearbycoder/slip/releases/latest/download/Slip.dmg) is a universal app for Apple silicon and Intel Macs running macOS 14 Sonoma or later. It's signed with a Developer ID and notarized by Apple. Open the disk image, drag Slip into Applications, and choose Allow when macOS asks to let it find devices on your local network.

Version 1.0.0 came out on 7 November 2026, and 1.0.1 followed the same day. It fixed a freeze on the first launch on Macs that had never run Slip, and added a disk image that opens to a custom installer window, built with [dmgbuild](https://github.com/dmgbuild/dmgbuild). A zip is still attached to each release, with a `SHA256SUMS.txt`.

The Windows, Linux, Android and iOS apps don't have published builds yet. You can build them from source, and each platform's folder in the [repository](https://github.com/nearbycoder/slip) has a guide: [`apple/`](https://github.com/nearbycoder/slip/tree/main/apple) uses XcodeGen and Xcode, [`android/`](https://github.com/nearbycoder/slip/tree/main/android) uses Gradle, [`windows/`](https://github.com/nearbycoder/slip/tree/main/windows) uses the .NET SDK, and [`linux/`](https://github.com/nearbycoder/slip/tree/main/linux) uses Cargo or Flatpak. GitHub Actions builds and tests each platform when its folder changes.

Slip uses port 53317 for TCP and UDP, the same as LocalSend. On Windows and Linux the firewall has to allow it. On Windows, if LocalSend is running too, it already holds that TCP port, so change Slip's port in Settings.

## License

Slip is MIT licensed. LocalSend is a separate open-source project, and Slip isn't affiliated with it.

The creation date shown here is the GitHub repository's UTC creation date. The cover is the website's social card, and the other images are rendered from the Slip website.
