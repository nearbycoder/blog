# Field Survey theme

The blog is styled as a surveyor's field notebook for somewhere nearby. “Nearby” suggests a map, so the theme borrows the language of topographic survey sheets. `/desktop` is excluded: it keeps its own `--desk-*` palette, wallpaper, and system fonts.

## Ingredients

- **Paper and ink.** Warm map paper (`--bg #f3ecdc`), forest ink (`--fg #1c2620`), and one trail-marker orange (`--accent`). Dark mode is the night edition: deep green-black paper, bone ink, and a glowing orange accent.
- **Trail blazes.** Each site section has its own blaze colour: Read is orange, Workshop is water blue, and About is moss green. `[data-section]` sets `--blaze`, which colours the header underline, the section strip, and the home page's trailhead cards.
- **Contour lines.** `scripts/generate-contours.mjs` draws the artwork with marching squares over a seeded height field and writes `public/images/contours.svg` and `contours-tall.svg`. The SVGs are used as CSS masks, so the lines take `--contour` from the active theme. They appear in the home hero, page intros, section menus, doors, the footer, and social cards.
- **Type.** Fraunces Variable (optical sizes, italics) sets display headings and long-form article text. Instrument Sans Variable handles the interface, and JetBrains Mono is used for metadata. All fonts are self-hosted through Fontsource.
- **Map furniture.**
  - Scale bars sit on section rules.
  - Tulsa's coordinates appear in the hero and footer.
  - The portrait is framed by a compass ring.
  - Article cards are numbered as plates (“Fig. 01”).
  - Project screenshots sit on survey grid paper with crop marks.
  - The layoff log and work history are drawn as dashed trails with waypoints.
  - The article table of contents marks the current heading with a “you are here” dot.
- **Footer.** The footer is always printed in the night palette, like a map legend.
- **Social cards.** `src/lib/opengraph-renderer.js` renders the same paper, contours, Fraunces title, and coordinates. It uses the static `@fontsource/fraunces` files because Satori cannot read variable woff2.

Motion is limited to a slow compass drift, card lifts, and the existing entrance animation. All of it is disabled when reduced motion is preferred.

To regenerate the contours, run `node scripts/generate-contours.mjs`. Change the seeds to get a different landscape.
