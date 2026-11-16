# The Nearby Building theme

The blog is styled as an Art Deco tower in Tulsa, Oklahoma. Tulsa is one of America's Art Deco capitals and the birthplace of Route 66, so the theme borrows from both. The light theme is daylight on a limestone facade. The dark theme is the same building at night, with its neon signs lit. `/desktop` is the building's penthouse; it keeps its own `--desk-*` tokens (see [desktop-design.md](desktop-design.md)).

## Ingredients

- **Limestone and neon.** Tokens live in `src/styles/base.css`.
  - Day: limestone paper (`--bg #efe6d4`), warm ink (`--fg #1b1714`), terracotta (`--accent #b03d24`), jade (`--jade #1d6b5b`), and gilt (`--brass #a87b2a`, or `--brass-ink #82601a` for text).
  - Night: a midnight indigo sky (`--bg #0d0b18`), bulb-white ink, neon rose (`--accent #ff5c7f`), neon teal (`--jade #3fe6c8`), and bulb gold (`--brass #ffc35a`).
  - `--glow-accent`, `--glow-jade` and `--glow-brass` are neon text shadows; they are `none` in daylight.
- **Floors.** Each site section is a floor:
  - 01 Read is terracotta or rose.
  - 02 Workshop is jade or teal.
  - 03 About is brass.
  - Home is the lobby.

  `[data-section]` sets `--blaze`. `BaseLayout` puts the current floor on `<main>`, so page-intro sunbursts take that floor's colour.
- **Elevator dial.** `FloorDial.astro` draws a Deco floor indicator whose needle points at L, 1, 2 or 3. It appears in the header (the current floor), in the home lobby directory, and above each elevator door in "Three ways in". The needle swings into place on load.
- **Type.** All fonts are self-hosted through Fontsource; `src/styles/fonts.css` lists the variable Latin subsets.
  - Big Shoulders Display is tall, condensed signage, set in capitals for display headings.
  - Newsreader is used for long reading, decks and item titles.
  - Jost, a Futura-era geometric, handles the interface, with tracked uppercase labels.
  - Limelight is for the wordmark, plate numbers and drop caps.
  - JetBrains Mono is for code and coordinates.
- **Ornament.**
  - Sunburst rays (`repeating-conic-gradient`) sit behind the hero, page intros, section menus, project vitrines and the footer.
  - Plates have two-step setback corners (`--setback`, sized by `--step`).
  - Rules are double gilt hairlines (`3px double var(--brass)`).
  - Section heads carry a stepped crown.
  - Labels, H2 markers and the current header floor carry triple "streamline" speed lines (`--speed-lines`).
  - Medallions and markers are octagonal.
- **Signature pieces.**
  - The hero headline is inlaid with streamline stripes by day. At night it is a neon sign that flickers on once.
  - The portrait sits in an octagonal gilt medallion with a slowly turning ray ring.
  - The latest article is "Now showing" on a theatre marquee whose bulbs chase.
  - The work history is a setback tower: one floor per job, newest at the top, with a crown, spire and blinking beacon.
  - The footer is the lobby directory board, always printed at night.
- **Social cards.** `src/lib/opengraph-renderer.js` renders the night edition at 1200 × 630:
  - A midnight sky with a gold sunburst, a stepped gilt double frame, the Limelight wordmark, and a floor plaque.
  - The title is set in Big Shoulders.
  - The right panel holds the article's art, game screenshots, a project screenshot in a gilt vitrine, Josh's portrait medallion (home and About), or the tower.
  - Satori needs static `.woff` files, so the cards use `@fontsource/*` static weights.
  - Project screenshots without frontmatter `image` come from `src/data/project-images.json`, which `src/lib/media.ts` also uses.
- **Icons.** `node scripts/generate-icons.mjs` draws the favicon set: a stepped tower, a gold sunburst and a neon beacon on a lacquer tile, with a terracotta base. It writes `favicon.svg`, `favicon.ico` (16/32/48), `favicon.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest`. `BrandMark.astro` is the inline header and footer version.

## Motion

Motion is limited to the following:

- the dial needle settling
- the neon flicker
- the marquee chase
- the medallion's slow ray turn
- the tower beacon
- button lifts
- the entrance animation

All of it is disabled when reduced motion is preferred.
