---
title: "Unbind"
summary: "Share a local TCP or UDP service, or send a file, between two computers with an invite link, from a Rust CLI or a native desktop app for macOS, Windows and Linux. A rendezvous service introduces the peers, a secret in the link authenticates their WebRTC handshake, and the traffic then goes directly between them over an encrypted data channel."
role: "Creator"
createdAt: "2026-11-18"
year: "2026"
stack:
  [
    "Rust",
    "Tokio",
    "WebRTC",
    "yamux",
    "Axum",
    "Rune",
    "Docker",
    "Railway",
    "GitHub Actions",
    "Homebrew",
    "Scoop",
  ]
link: "https://unbind.dev/"
githubLink: "https://github.com/nearbycoder/unbind.dev"
image: "/images/projects/unbind-dev.webp"
imageAlt: "Unbind's Share page in a dark theme with salmon accents. A sidebar with the unbind logo lists Share, Connect, Files, Sessions and Settings above No active sessions and Version 0.3.0. The page, titled Share a service, has a Local service card with 3000 in Port or address, an Invite access card with One guest only and Approve each guest switched off and an Expires after (minutes) field reading No time limit, Create invite and Advanced sharing + buttons, and a Saved profiles card with a Profile name field and a Save profile button. A Connection path card on the right shows This computer, a Direct tunnel line and Guest computer, above Encrypted between peers."
imageCaption: "The desktop app's Share page, from the Unbind website, which also uses it as its social image."
featured: false
accent: "teal"
draft: false
---

Unbind shares a TCP or UDP service, or sends a file, from one computer to another over a direct, encrypted connection. The host runs `unbind share 3000` and gets an invite link. The guest runs `unbind connect '<link>' --listen 8080` and opens `http://127.0.0.1:8080`, which reaches port 3000 on the host. SSH, databases and other TCP services work the same way, through a port on the guest. Either side can use the command-line client or the desktop app, and by default anyone with the complete link can reach the service until the host stops sharing.

It's one Rust crate with three programs: `unbind`, the CLI; `unbind-web`, which serves the [unbind.dev](https://unbind.dev/) website, the installers and the rendezvous API that introduces the peers; and `unbind-desktop`, a native app for macOS, Windows and Linux built on [Rune](https://github.com/anomalyco/rune), the Rust UI framework that [Pointer](/projects/pointer/) also uses. The README says the share-link workflow is inspired by [Tailcat by Tailscale](https://github.com/tailscale/tailcat) and calls Unbind an independent Rust implementation using WebRTC and yamux. Version 0.3.0, the latest release, has CLI binaries and desktop builds for x86-64 and ARM64 on all three systems, signed release metadata, and Homebrew, Scoop and WinGet manifests.

## Shares, invites and files

<figure>
  <img src="/images/projects/unbind-dev-sessions.webp" alt="The Sessions page, with a Refresh button. A Connected card for 127.0.0.1:8080, session GWUfuG09rM, shows the path from (local) udp host ::1:54170 to (remote) udp host ::1:37962 and 320.6 KiB sent and 320.6 KiB received, with a Stop button. A Sharing card for 127.0.0.1:3000, session mZQnRBpLmq, has New invite and Stop buttons, invite OOscALqtOY accepting guests with a Revoke button, and peer 97Zoggo3iC connected. The sidebar reads 2 active sessions." width="1100" height="760" loading="lazy" />
  <figcaption>The Sessions page, from the website, with a share and a guest connection running on the same computer.</figcaption>
</figure>

Invites can be narrowed. `--expires-in 600` closes an invite and its connections after ten minutes, `--single-use` admits only the first guest that connects, and `--approve` makes each guest wait, for up to 25 seconds, until the host runs `unbind approve` or `unbind deny`. A guest can add `--identify` to prove a persistent Ed25519 device identity, and `unbind approve SHARE_ID PEER_ID --remember` lets that device skip approval on later shares. `unbind invite` issues another link for a running share, `unbind revoke` closes one and disconnects its guests, `--qr` prints an invite as a QR code, and `unbind status` lists shares, invites, peers, their network paths and traffic, with `--json` for scripts.

One share can offer up to 16 services, with named TCP and UDP routes such as `--tcp web=3000 --tcp api=8081 --udp dns=5353`, and the guest picks a local port for each name. Profiles in `unbind.toml` save a share's routes and access settings, `unbind start dev` runs one in the background, and `--at-login` also registers it as a systemd user service, a macOS LaunchAgent or a Windows `Run` entry. `ssh -o "ProxyCommand=unbind connect '<link>' --stdio" user@host` runs SSH through the tunnel without a local port. If a connected tunnel drops, the guest keeps its local port and reconnects, waiting half a second at first and doubling up to 15 seconds, and applications reopen the TCP connections they lost.

`unbind send ./report.pdf` makes a file invite for one recipient, and `unbind receive '<link>' ./report.pdf` saves the file. The receiver writes to a temporary file next to the destination, checks the SHA-256 that the sender transmits after the data, and only then moves it into place, never over an existing file. The two sides confirm the receipt before they disconnect.

## The desktop app

<div class="project-media-gallery">
  <figure><img src="/images/projects/unbind-dev-connect.webp" alt="The Connect page, titled Connect to a service, with an empty Invite link field reading Paste an invite URL and a Paste button, a Local access card with Listen on set to 8080, an Identify this device to the host switch turned off and a Reconnect after an interruption switch turned on, and Connect and Named routes + buttons." width="1100" height="760" loading="lazy" /><figcaption>Connect, for joining with an invite.</figcaption></figure>
  <figure><img src="/images/projects/unbind-dev-files.webp" alt="The Files page, titled Transfer files. A Send a file card has a File to send field with a Choose file button and a Create file invite button. A Receive a file card, which says Unbind checks the file's SHA-256 before saving it, has a File invite link field with Paste, a Save as field with Choose location, an Identify this device to the sender switch and a Receive file button." width="1100" height="760" loading="lazy" /><figcaption>Files, for sending and receiving one file.</figcaption></figure>
</div>

The app has five pages, Share, Connect, Files, Sessions and Settings, and runs the same client library as the CLI. Share has the access switches, an expiry in minutes, Advanced sharing for named routes and a LAN-only mode, and saved profiles. Create invite shows the link with Copy invite and a QR code. Sessions refreshes every second from the per-user state directory, so it also lists shares and connections the CLI started, and it handles approvals, new invites, revoking and stopping. After Settings → Enable desktop links, the join page's Open in Unbind button opens the invite in the app, which asks you to review it before connecting.

The macOS build needs macOS 13 or later and is signed ad hoc, so macOS may ask you to approve it in Privacy & Security. The Windows build is a portable `Unbind.exe` without a publisher signature. The Linux build targets Ubuntu 24.04 or a compatible glibc distribution, needs X11 or Wayland and Vulkan graphics, and comes with an optional per-user install script.

## How it connects

The host's client opens a room with three random 32-byte values: a room ID, the invite's secret, and a host key that only the host presents to the rendezvous service. The link is `https://unbind.dev/join#v1.<room>.<secret>`. Browsers don't send the part after `#` to servers, the clients never send the secret anywhere, and the join page sets a no-referrer policy. The rendezvous API is six POST endpoints over rooms kept in memory, so the README asks for a single replica. The host registers its room and polls it every 0.9 seconds. Each attempt to connect gets a new random peer ID, under which the guest posts its WebRTC offer and polls for the answer for up to 35 seconds. A room expires 60 seconds after its host's last poll, and the server limits the number of rooms and pending offers and caps each SDP at 32 KiB.

<figure>
  <picture><source srcset="/images/projects/unbind-dev-signaling-code-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/unbind-dev-signaling-code.webp" alt="Lines 85 to 128 of unbind.dev/src/bin/client/signaling.rs. link sets the path to /join and the fragment to v1, the room and the base64url-encoded secret. authenticator decodes the room and peer IDs, checks that the SDP is not empty and within the size limit, keys an HMAC with SHA-256 using the secret, and feeds it the label unbind/v1/sdp, a 0 for an offer or a 1 for an answer, the room, the peer and the SDP. sign returns the SDP with its base64url MAC, and verify recomputes the MAC and fails with The peer could not prove it has the invite." width="1440" height="1584" loading="lazy" /></picture>
  <figcaption>Building the invite link and authenticating offers and answers, in <code>src/bin/client/signaling.rs</code>.</figcaption>
</figure>

Each offer and answer carries an HMAC-SHA256 keyed with the secret, over a label, whether it's an offer or an answer, the room, the peer ID and the whole SDP. The host drops an offer that fails the check, and the guest rejects an answer that fails it. The SDP includes each side's DTLS certificate fingerprint, so the rendezvous service, which never sees the secret, can't substitute its own offer or answer. What it does see is the room and peer IDs and the SDPs, with each peer's candidate addresses. With `--identify`, the guest also signs the room, its peer ID and its offer with an Ed25519 key kept in its state directory, and the host sees the key's SHA-256 fingerprint, which `unbind identity` prints for comparison.

ICE then looks for a direct UDP path. By default the clients ask Google's and Cloudflare's public STUN servers for their public addresses. Unbind refuses relay candidates, so there's no TURN fallback, and when no direct UDP path exists, the connection fails. Everything travels over a single WebRTC data channel, encrypted with DTLS like every WebRTC data channel, and yamux runs on top of it, so each TCP connection, UDP flow or file transfer gets its own stream. With named routes, a stream starts with a protocol byte and the route's name, and UDP datagrams travel inside it with a two-byte length. An established tunnel doesn't need the rendezvous service anymore.

## Other networks

<figure>
  <img src="/images/projects/unbind-dev-settings.webp" alt="The Settings page. A Network card has Rendezvous server set to https://unbind.dev and STUN servers set to stun:stun.l.google.com:19302,stun:stun.cloudflare.com:3478, then Local UDP bind, Public UDP endpoint and PCP gateway fields with the placeholder examples 0.0.0.0:40000, 198.51.100.2:40000 and 192.168.1.1, a note to leave them blank for automatic address discovery, and a Save settings button. Below are a Connection diagnostics card with Run diagnostics and a Desktop links card with Enable desktop links." width="1100" height="760" loading="lazy" />
  <figcaption>Settings, with the rendezvous and STUN servers, the manual UDP options and diagnostics.</figcaption>
</figure>

When automatic discovery isn't enough, `--udp-bind 0.0.0.0:40000 --public-endpoint PUBLIC_IP:40000` advertises an existing UDP port forward as an extra candidate, and `--map-port ROUTER_IP` asks a router that supports PCP for a two-minute UDP mapping, renews it at half its lifetime and asks the router to remove it on exit. `unbind share 3000 --lan` runs the rendezvous API inside the host's own process on a private address, so two computers on one network can connect without internet access. `unbind doctor` checks that the rendezvous service answers and asks the STUN servers for this computer's address over IPv4 and IPv6. `--server` (or `UNBIND_SERVER`) points a share at another rendezvous service, whose address the invite carries, and `--stun` (or `UNBIND_STUN`) sets other STUN servers or `none`.

## Running it locally

The README describes a fully local test: run `unbind-web` on a local port, share a service with `--stun none` and `--server` pointing at it, and connect with the printed link. For this page, version 0.3.0 was built from the repository's source and the test was run inside a Linux network namespace with only a loopback interface, so nothing could reach unbind.dev or a STUN server. In the same setup, all 14 of the repository's tests passed, among them a share and connect through a LAN rendezvous, named TCP and UDP forwarding, a verified file transfer, the signature check on release metadata and a PCP mapping against a fake router.

<figure>
  <img src="/images/projects/unbind-dev-local-test.webp" alt="Three terminal windows. In the host window, unbind --stun none share 5195 --server http://127.0.0.1:5193 prints Sharing 127.0.0.1:5195. Keep this command running., a share ID and an invite ID, a link that starts http://127.0.0.1:5193/join#v1. followed by two long base64url strings, and Peer connected directly. In the guest window, unbind --stun none connect with that link and --listen 5196 prints Connecting to the peer directly… and Direct connection ready. Listening on 127.0.0.1:5196. In a second guest window, curl -s http://127.0.0.1:5196/hello.txt prints Hello from the host on port 5195., and unbind status lists the connect session and the share with its invite and peer, both connected between two UDP host candidates on 127.0.0.1, one side reporting 135 bytes sent and 268 received and the other the reverse." width="1253" height="939" loading="lazy" />
  <figcaption>The README's local test, captured for this page. The repository's <code>unbind-web</code> served the rendezvous API on port 5193, and Python's built-in HTTP server stood in for the shared service on port 5195.</figcaption>
</figure>

## Releases and packages

Each push to `main` runs a GitHub Actions workflow that builds the six CLI binaries, cross-compiling the Linux and Windows ones with Zig and `cargo-zigbuild`, and uploads them with the source to Railway, which builds the `Dockerfile` and runs `unbind-web`. The workflow then checks the live health endpoint and the published checksums, installs the CLI with `install.sh`, and makes sure `--verify` rejects the binary once a few bytes are appended to it. A version tag also builds the desktop app on native runners for all six targets and publishes a GitHub release. Its `release.json` lists each binary's size and SHA-256 and is signed with Ed25519, after the workflow checks that the signing key matches the public key pinned in the repository, and the desktop archives' checksum file is signed with the same key. The same job generates the Homebrew formula, the Scoop manifest and a WinGet manifest bundle, and a last job validates and installs that bundle with a current WinGet client on Windows.

The installers, `install.sh` and `install.ps1`, download the checksum list and the right binary from unbind.dev over HTTPS and compare the hash before installing to `~/.local/bin` or `%LOCALAPPDATA%\Programs\unbind`, and `--verify` (`-Verify` in PowerShell) checks an installed binary against the current list. `unbind update` downloads the signed `release.json`, verifies it with the public key compiled into the binary, and checks the new binary's size and SHA-256 before replacing itself, keeping the previous executable for `unbind rollback`. The 0.3.0 release's `release.json` and desktop checksum file both verify against the pinned key with the OpenSSL commands in `release/README.md`.

The [Homebrew tap](https://github.com/nearbycoder/homebrew-unbind) and the [Scoop bucket](https://github.com/nearbycoder/scoop-unbind) hold the formula and the manifest generated for 0.3.0, byte for byte, and point at the versioned downloads on unbind.dev, which redirect to the GitHub release. The WinGet bundle installs from local manifest files, which an administrator has to allow first with `winget settings --enable LocalManifestFiles`. A WinGet community package for version 0.2.0 was submitted to `microsoft/winget-pkgs` as [pull request 483028](https://github.com/microsoft/winget-pkgs/pull/483028). It has passed validation but hasn't been merged, so Unbind isn't in the WinGet community source yet.

## How it was made

The repository has nine commits, all dated November 17, 2026, within two hours. The first holds a README stub and the icon. The second, at version 0.1.0, shares TCP services, adds the website with checksum-checking installers, and deploys it to Railway. Version 0.2.0 adds named TCP and UDP routes, file transfers, invite controls and signed releases, 0.2.1 refreshes the branding, and 0.3.0 adds the desktop app. The last commit builds out the website and the guide. The repository has no license file, and its WinGet manifest lists the license as Unspecified.

## Try it

Get the desktop app for your system from [the downloads page](https://unbind.dev/downloads/) and open it on both computers, or install the CLI with `curl -fsSL https://unbind.dev/install.sh | sh` on Linux and macOS or `irm https://unbind.dev/install.ps1 | iex` in PowerShell. With Homebrew, run `brew tap nearbycoder/unbind`, `brew trust --formula nearbycoder/unbind/unbind` and `brew install nearbycoder/unbind/unbind`. With Scoop, run `scoop bucket add unbind https://github.com/nearbycoder/scoop-unbind` and `scoop install unbind/unbind`. Then run `unbind share 3000` on the host and `unbind connect '<link>' --listen 8080` on the guest. The two computers need a direct UDP path to each other. From source, `cargo build --locked --release` builds the CLI, `--features web` adds `unbind-web`, and the desktop app needs `--no-default-features --features desktop` and Rust 1.99.1 to match its pinned Rune revision.

[Browse the source on GitHub](https://github.com/nearbycoder/unbind.dev). The creation date shown here is the GitHub repository's UTC creation date. The cover and the Sessions, Connect, Files and Settings pictures are the Unbind website's own screenshots of the desktop app. The cover is cropped by 27 rows of empty background to fit, and the others are unchanged. The terminal capture was made for this page by building the repository's latest commit and running the README's local test in an isolated network namespace, and the code excerpt is from `src/bin/client/signaling.rs`, in light and dark versions that follow this site's theme.
