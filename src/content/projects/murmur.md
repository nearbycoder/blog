---
title: "Murmur"
summary: "A free, open-source BitTorrent client for macOS, built with SwiftUI and Liquid Glass. Its engine, MurmurKit, is written from scratch in Swift with no third-party dependencies."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "Swift",
    "SwiftUI",
    "Liquid Glass",
    "macOS 26",
    "Network.framework",
    "CryptoKit",
    "BitTorrent",
    "App Intents",
    "XcodeGen",
    "Icon Composer",
    "dmgbuild",
  ]
link: "https://nearbycoder.github.io/murmur/"
githubLink: "https://github.com/nearbycoder/murmur"
image: "/images/projects/murmur.webp"
imageAlt: "The Murmur banner on a purple gradient: an app icon with a down arrow inside a ring of dots, the name Murmur, the line “A native torrent client for macOS. Free and open source.”, and the app's dark-mode window listing transfers like ubuntu-25.10-desktop-amd64.iso, Big Buck Bunny 4K and Sintel."
imageCaption: "The banner from the Murmur README."
featured: false
accent: "purple"
draft: false
---

Murmur is a BitTorrent client for the Mac. Click a magnet link, pick the files you want, and watch the swarm do the rest. It's built natively with SwiftUI and Liquid Glass, and its engine, MurmurKit, is written from scratch in Swift with no third-party dependencies.

It's free and open source under the MIT license, with no ads, no bundled offers, no account and no analytics. It needs macOS 26 Tahoe or later, and releases are signed with a Developer ID and notarized by Apple. Murmur doesn't include any search or content: it's a general-purpose tool for things you have the right to share, like Linux distributions, open movies and public domain works.

<figure>
  <picture><source srcset="/images/projects/murmur-overview-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/murmur-overview.webp" alt="Murmur's main window: a sidebar with All Transfers, Downloading, Seeding, Completed and Paused and a live speed graph; a list of eight transfers with progress bars, including Ubuntu, Debian, Fedora and Arch ISOs and Blender open movies; and an inspector for the Ubuntu download at 64% with a piece map, a speed graph and transfer stats." width="1240" height="760" loading="lazy" /></picture>
  <figcaption>The main window, with the inspector's Overview tab. The screenshots on this page follow this site's light or dark theme.</figcaption>
</figure>

## Features

- **Magnet links and .torrent files.** Open them from your browser or Finder (one click makes Murmur the default app), drop them on the window, or paste them. Murmur notices magnet links on the clipboard and offers to add them.
- **File selection.** Choose files and a location before adding, or change them any time. Set priorities, and download in order to preview media while it arrives.
- **Finding peers.** HTTP(S) and UDP trackers, the mainline DHT for trackerless torrents, peer exchange, local peer discovery and HTTP web seeds. NAT-PMP or UPnP opens your port on the router, and you can add your own extra trackers to every public torrent.
- **Encrypted connections.** BitTorrent protocol encryption is on by default, so your provider can't single out torrent traffic. You can prefer it, require it, or turn it off.
- **An inspector.** Speed graphs, a piece map, connected peers with their client, progress and speeds, and the status of every tracker.
- **Speed limits and Slow Mode.** Global and per-transfer limits, plus a tortoise button (⇧⌘T) for alternative limits that can turn on by itself on a schedule, say weekdays 9 to 5.
- **Queue and seeding rules.** Drag transfers to reorder the queue, limit simultaneous downloads, stop seeding at a ratio, and move finished downloads to another folder automatically.
- **VPN binding.** Bind to an interface such as your VPN's `utun`, and Murmur stops transferring whenever it disconnects.
- **Creating torrents** from any file or folder, with your trackers, and seeding them right away.
- **At home on the Mac.** A menu bar extra with live speeds, Dock progress and a Dock menu, notifications, Shortcuts actions, a watch folder, keep-awake while downloading, Quick Look with Space, and full keyboard control.
- **Resuming.** Progress is saved continuously and checked against your files on launch, so nothing is downloaded twice.

<div class="project-media-gallery">
  <figure><picture><source srcset="/images/projects/murmur-files-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/murmur-files.webp" alt="The inspector's Files tab for Big Buck Bunny 4K, with checkboxes beside an Extras folder, two MP4 files and a README, each with its own progress bar, and 5 of 6 files selected." width="1240" height="760" loading="lazy" /></picture><figcaption>Choosing files in the inspector.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/murmur-peers-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/murmur-peers.webp" alt="The inspector's Peers tab listing connected clients like aria2, Deluge, µTorrent, qBittorrent, Transmission, libtorrent and Murmur, each with an address, flags, a progress ring and download and upload speeds." width="1240" height="760" loading="lazy" /></picture><figcaption>Connected peers, with their clients and speeds.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/murmur-trackers-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/murmur-trackers.webp" alt="The inspector's Trackers tab: DHT with 412 nodes, Peer Exchange, Local Discovery, a releases.ubuntu.com web seed, two working trackers with seed and leecher counts, and one timed-out tracker, with Add Trackers and Ask for More Peers buttons." width="1240" height="760" loading="lazy" /></picture><figcaption>Every way of finding peers: trackers, the DHT, peer exchange, local discovery and a web seed.</figcaption></figure>
  <figure><picture><source srcset="/images/projects/murmur-settings-network-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/murmur-settings-network.webp" alt="Murmur's Network settings: a listening port open via NAT-PMP, a switch to open the port on the router, encryption set to Prefer encryption, switches for DHT, peer exchange and local peer discovery, an Extra trackers button, and a network interface picker for binding to a VPN." width="540" height="677" loading="lazy" /></picture><figcaption>Network settings: port mapping, encryption, peer discovery and VPN binding.</figcaption></figure>
</div>

## The engine

MurmurKit is a standalone Swift package built on Network.framework, CryptoKit and POSIX sockets. It implements these specs:

| Spec                                                                                                                       | What it covers                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [BEP 3](https://www.bittorrent.org/beps/bep_0003.html)                                                                     | Peer wire protocol, rarest-first piece picking, endgame mode, tit-for-tat choking with optimistic unchokes |
| [BEP 5](https://www.bittorrent.org/beps/bep_0005.html)                                                                     | Mainline DHT: iterative `get_peers` lookups, `announce_peer`, and answering other nodes' queries          |
| [BEP 9](https://www.bittorrent.org/beps/bep_0009.html), [BEP 10](https://www.bittorrent.org/beps/bep_0010.html)            | Magnet links and metadata exchange over the extension protocol                                            |
| [BEP 11](https://www.bittorrent.org/beps/bep_0011.html)                                                                    | Peer exchange (`ut_pex`)                                                                                  |
| [BEP 12](https://www.bittorrent.org/beps/bep_0012.html), [BEP 15](https://www.bittorrent.org/beps/bep_0015.html)           | Multiple trackers, HTTP(S) and UDP                                                                        |
| [BEP 7](https://www.bittorrent.org/beps/bep_0007.html), [BEP 23](https://www.bittorrent.org/beps/bep_0023.html)            | Compact IPv4 and IPv6 peer lists                                                                          |
| [BEP 14](https://www.bittorrent.org/beps/bep_0014.html)                                                                    | Local Service Discovery over multicast                                                                    |
| [BEP 19](https://www.bittorrent.org/beps/bep_0019.html)                                                                    | HTTP web seeds, fetched with range requests                                                               |
| [BEP 47](https://www.bittorrent.org/beps/bep_0047.html)                                                                    | Padding files (hybrid v1/v2 torrents work through their v1 data)                                          |
| MSE/PE                                                                                                                     | Protocol encryption: 768-bit Diffie-Hellman and RC4, with plaintext fallback                              |
| [RFC 6886](https://www.rfc-editor.org/rfc/rfc6886), UPnP IGD                                                               | Port mapping                                                                                              |

Every piece is verified against its SHA-1 hash before it's written, peers that send bad data are banned, and paths inside torrents are sanitized so a malicious torrent can't write outside its folder. File handles, hashing and disk I/O run off the networking queue, with token-bucket rate limiting shared across connections.

The engine is tested with unit tests, swarms of sessions on localhost (magnet to metadata to download to resume, with encryption required and disabled), a download from web seeds alone, downloads from real swarms checked against published checksums (including trackerless magnets through the DHT only), and transfers in both directions with [aria2](https://aria2.github.io), in plaintext and with aria2 requiring encryption. µTP, the fast extension and v2-only torrents aren't supported yet.

MurmurKit also has a small command-line client, `murmur-cli`, for downloading a magnet link or creating a torrent from a folder without the app.

## How it's built

The app is SwiftUI, with an inspector, speed charts, a piece map, and a murmuration of starlings animating in the empty state. It uses App Intents for its Shortcuts actions, and its icon is made with Icon Composer. The Xcode project is generated with [XcodeGen](https://github.com/yonaskolb/XcodeGen).

The screenshots come from a demo mode with sample transfers and no networking, captured by a script for each scene in light and dark. Other Swift scripts render the social card, the icon PNGs and the DMG background, and a release script archives the app, signs it with a Developer ID, notarizes it and packages the DMG.

## Try it

Download [Murmur.dmg](https://github.com/nearbycoder/murmur/releases/latest/download/Murmur.dmg), open it, and drag Murmur into Applications. It needs macOS 26 Tahoe or later. The [releases page](https://github.com/nearbycoder/murmur/releases) has the changelog for each version, the [website](https://nearbycoder.github.io/murmur/) has the features and screenshots, and the [README](https://github.com/nearbycoder/murmur) covers keyboard shortcuts and building from source with Xcode 26.

The creation date shown here is the GitHub repository's UTC creation date. The images on this page come from the project's README and website.
