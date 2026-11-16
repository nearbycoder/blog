---
title: "Thumb Potato"
summary: "A play-later companion for iPhone, iPad, Mac and Android. It keeps your backlog across Switch, PlayStation, Xbox, PC, Mac and mobile, watches for release dates, and helps you plan and pick what to play next."
role: "Creator"
createdAt: "2026-11-03"
year: "2026"
stack:
  [
    "Swift",
    "SwiftUI",
    "SwiftData",
    "CloudKit",
    "Kotlin",
    "Jetpack Compose",
    "Material 3",
    "Room",
    "XcodeGen",
    "Python",
    "GitHub Actions",
    "Wikidata",
    "Steam",
    "CheapShark",
  ]
link: "https://nearbycoder.github.io/thumb-potato/"
githubLink: "https://github.com/nearbycoder/thumb-potato"
image: "/images/projects/thumb-potato.webp"
imageAlt: "Thumb Potato on the Mac: a sidebar with Tonight, Backlog, Planner, Shuffle, Browse and the platforms Switch, PS5 and PC, a featured card for Super Mario Galaxy 2 with a Switch badge and Add to Backlog and Details buttons, and a New Releases row of box art."
imageCaption: "The Tonight screen on a Mac, from the Thumb Potato README."
featured: false
accent: "lime"
draft: false
---

Thumb Potato keeps track of the games you mean to play. It finds games across Nintendo Switch 2 and Switch, PlayStation 5 and 4, Xbox Series X|S and One, PC, Mac and mobile, shows where to buy them, and keeps your backlog in one place. It counts down to release dates, plans play sessions, and picks something for you when you can't decide.

It's the gaming sibling of [Couch Potato](/projects/couch-potato), my app for deciding what to watch, and it's built on the same structure: a native SwiftUI app for iPhone, iPad, iPhone Duo and Mac, and a Jetpack Compose app for Android. Like Couch Potato, it works without an account or an API key. It's free and open source under the MIT license, and the [website](https://nearbycoder.github.io/thumb-potato/) has the tour.

## Your backlog, sorted

The **Backlog** has four shelves: Want to Play, Playing, Beaten and Shelved. Each game records the platform you're playing it on, hours played, progress, whether you own it, a 5-star rating and notes. You can filter by platform or genre, and sort by date added, title, rating or release date. A card at the top counts the games you've beaten this year, the hours you've logged and the size of the backlog.

The **Planner** schedules play sessions on a week view, adds them to your calendar and reminds you. Below it, the **Release Radar** lists games you follow that aren't out yet. Each gets a countdown and a release-day alert.

<div class="project-media-gallery">
  <figure><img src="/images/projects/thumb-potato-backlog.webp" alt="The Backlog on iPhone: a stats card with 3 beaten this year, 312 hours logged and 8 in backlog, Want to Play 8, Playing 3 and Beaten 3 tabs, platform filters, and box art for Fable, Persona 4 Revival, Grand Theft Auto VI, Split Fiction, Death Stranding 2 and Ghost of Yōtei." width="600" height="1305" loading="lazy" /><figcaption>The backlog, with upcoming games showing their release dates.</figcaption></figure>
  <figure><img src="/images/projects/thumb-potato-planner.webp" alt="The Planner on iPhone for November 1 to 7, with a Hades II session today from 8:00 to 10:00 PM on PC with the note “Take on Chronos with the new staff” and a reminder, and a Release Radar listing Grand Theft Auto VI in 16 days and Fable in 2027." width="600" height="1305" loading="lazy" /><figcaption>A planned session and the Release Radar.</figcaption></figure>
</div>

## Finding the next game

The app opens on **Tonight**: a featured carousel, Continue Playing, New Releases, Coming Soon, "Top on …" rows for the platforms you own, Steam top sellers and PC deals.

Every platform has its own page. It sorts by popularity, newest, top rated or A to Z, and filters by release window, including games that aren't out yet, genre and critic score. **Moods** (Cozy, Adrenaline, Epic, Couch Co-op, Spooky and Brainy) are there for when you know the feeling but not the game.

<div class="project-media-gallery">
  <figure><img src="/images/projects/thumb-potato-platform.webp" alt="The Nintendo Switch page on iPhone, marked as one of your platforms, with Popular, Last 5 Years, Any Genre and Any Score filters and box art for Red Dead Redemption, No Man's Sky, Factorio, Fall Guys, The Legend of Zelda: Tears of the Kingdom and NieR: Automata." width="600" height="1305" loading="lazy" /><figcaption>A platform page, filtered to the last five years.</figcaption></figure>
  <figure><img src="/images/projects/thumb-potato-where.webp" alt="Where to Play for Clair Obscur: Expedition 33 on iPhone: store rows for Steam at $39.99, down from $49.99, Epic Games Store, GOG, PlayStation Store and Xbox Store, then PC prices from GameBillet, Green Man Gaming, Fanatical, Steam, Gamesplanet and WinGameStore with their discounts." width="600" height="1305" loading="lazy" /><figcaption>Where to Play, with live PC prices from CheapShark.</figcaption></figure>
</div>

A game's page has hero art, the critic score, Steam Deck status, screenshots and trailers. **Where to Play** links to the stores for every platform the game is on, yours first, and lists live PC prices across Steam, GOG, Humble, Epic and more.

<figure>
  <img src="/images/projects/thumb-potato-mac-detail.webp" alt="The Hades II page on a Mac: a wide hero image of Melinoë, the box art, 2025, Roguelike, Supergiant Games, a critic score of 94, a Deck Verified badge, platform badges for NS2, NS, PS5, XS, PC and MAC, Add to Backlog, Plan a Session and Trailer buttons, and an About paragraph." width="1280" height="860" loading="lazy" />
  <figcaption>A game page on the Mac.</figcaption>
</figure>

**Shuffle** is for when nothing jumps out. Pick a mood, how long you've got and which console you're on, and the deck picks from your backlog or from what's popular. Play it now, plan a session for later, or shuffle again.

<div class="project-media-gallery">
  <figure><img src="/images/projects/thumb-potato-shuffle.webp" alt="Shuffle on iPhone: a fanned deck of game art with Split Fiction on top, a lime Shuffle button, and a Tonight's pick card for Split Fiction, a 2025 adventure, with Play Now, Plan a Session and Shuffle Again buttons." width="600" height="1305" loading="lazy" /><figcaption>Shuffle, with tonight's pick.</figcaption></figure>
  <figure><img src="/images/projects/thumb-potato-android.webp" alt="The Android app's Tonight screen, with Super Mario Galaxy 2 featured over its box art, a 2025 platformer with Metacritic 97 and a Switch badge, an Add to Backlog button, a Continue Playing row with Stardew Valley at 42.5 hours, and a bottom bar for Tonight, Browse, Backlog, Planner and Shuffle." width="600" height="1346" loading="lazy" /><figcaption>Tonight in the Android app.</figcaption></figure>
</div>

## Sync

On Apple devices, the backlog and sessions sync through iCloud with SwiftData and CloudKit, and settings sync through iCloud key-value storage. Handoff carries the game you're looking at from one device to another. Android keeps everything on the device, and both apps export and import the same JSON backup, which merges so the newest changes win.

The layouts follow the screen. The iPad and Mac get a sidebar of your platforms, phones get a tab bar, and the iPhone Duo uses its side-mounted tab bar both folded and unfolded. On Android, phones get a bottom bar and wide or unfolded screens get a navigation rail.

## Where the data comes from

Out of the box, Thumb Potato uses its own catalog of about 4,700 games across nine platforms. A GitHub Action rebuilds it every day with a Python script that uses only the standard library, and publishes it with the website on GitHub Pages as [JSON files](https://nearbycoder.github.io/thumb-potato/catalog/v1/index.json). It's built from:

- **[Wikidata](https://www.wikidata.org)**: platforms, release dates, genres, studios and critic scores (CC0).
- **[Wikipedia](https://en.wikipedia.org)**: box art and descriptions.
- **Steam**: library art, hero backdrops and Steam Deck ratings.

The apps also use live data. Wikipedia provides full descriptions and search, Steam provides top sellers, new releases, screenshots, trailers, reviews and prices for PC and Mac games, and [CheapShark](https://www.cheapshark.com) provides PC prices and deals across stores. A free [RAWG](https://rawg.io/apidocs) key in Settings adds live search and browsing across RAWG's full database.

Thumb Potato isn't affiliated with Nintendo, Sony, Microsoft, Valve or any store. Platform and store names appear as text and monograms, not logos.

## How it's built

The structure mirrors Couch Potato. The repository's [spec](https://github.com/nearbycoder/thumb-potato/blob/main/SPEC.md) maps one to the other: services become platforms, the watchlist becomes the backlog, episode progress becomes hours played, and upcoming episodes become the Release Radar. Couch Potato's TMDB key becomes an optional RAWG key, and its TVmaze and iTunes data become the game catalog, Wikipedia, Steam and CheapShark.

The Apple app is one multiplatform SwiftUI target for iPhone, iPad and Mac. The Android app uses Kotlin, Jetpack Compose and Material 3, with Room, DataStore, OkHttp and Coil. Its [design system](https://github.com/nearbycoder/thumb-potato/blob/main/DESIGN.md) shares Couch Potato's structure but has its own lime accent called Volt, trophy-gold for beaten games, its own moods and its own icon. Both apps open the same deep links, like `thumbpotato://backlog` or a `thumbpotato://game/…` link for a specific game.

## Try it

There are no prebuilt downloads yet, so you build it yourself from the [repository](https://github.com/nearbycoder/thumb-potato):

- **Apple**: Xcode 26 or later, iOS and iPadOS 26 or later, macOS 26 or later, and [XcodeGen](https://github.com/yonaskolb/XcodeGen). Run `xcodegen`, open `ThumbPotato.xcodeproj`, and run the ThumbPotato scheme. iCloud sync needs a signed build with your own team and CloudKit container. Unsigned and simulator builds use a local store.
- **Android**: Android Studio Ladybug or later, or JDK 17 or later, and Android SDK 37. Run `./gradlew :app:installDebug` in the `android` folder.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots come from the Thumb Potato README and website.
