---
title: "Stitchcraft"
summary: "A browser app that turns any image into a printable counted cross-stitch pattern in real DMC floss colors. It builds the palette with k-means++ clustering in CIELAB and CIEDE2000 color matching, and everything from your account to your floss stash stays in the browser."
role: "Creator"
createdAt: "2025-12-30"
year: "2025"
stack: ["TypeScript", "React 19", "Vite", "HTML5 Canvas", "IndexedDB", "Railway"]
githubLink: "https://github.com/nearbycoder/cross-stitch"
image: "/images/projects/stitchcraft.webp"
imageAlt: "Stitchcraft's editor showing The Great Wave off Kanagawa as a cross-stitch pattern in the stitched preview, where every square is drawn as a small X of thread, with the Pattern tab open: size L at 150 by 101 stitches, 14-count Aida, 2 strands, fabric colors, a maximum of 30 colors, and CIEDE2000 color matching."
imageCaption: "Hokusai's The Great Wave off Kanagawa as a 150 by 101 stitch pattern with 28 DMC colors, in the stitched preview. Captured running locally from source."
featured: false
accent: "red"
draft: false
---

Stitchcraft turns an image into a counted cross-stitch pattern. Upload a photo or a drawing, crop and adjust it, choose a size, a fabric and how many colors to use, and it builds a chart in real DMC floss colors. You can edit the chart stitch by stitch, track your progress, and print it as a booklet with a cover, a floss key and numbered chart pages.

It all runs in the browser. Accounts, patterns and your floss stash are stored locally, and nothing is sent to a server. The repository was created on December 30, 2025, and its listed homepage, a Vercel address from that time, no longer answers. The code in it now comes from October 12, 2026: one commit that adds the whole app, and one that removes a Railway config file. No public deployment of this version is linked.

## Features

- **Upload** by drag and drop, the file picker or pasting. Transparent PNG backgrounds stay unstitched.
- **Image tools.** Crop with aspect presets, and adjust brightness, contrast, saturation and sharpening.
- **Pattern settings.** Sizes up to 500 by 500 stitches with an aspect lock, fabric counts from 11 to 32, strands, fabric color, a maximum number of colors, and an option to use only floss you already own. Colors match perceptually with CIEDE2000 or faster with CIE76, with optional dithering and cleanup of stray stitches and rarely used colors.
- **Chart views.** Color with symbols, color blocks, black-and-white symbols, and a stitched preview. Bold lines every 10 stitches, center markers, rulers, and zoom, pan and pinch.
- **Editing.** Paint, flood fill (Shift replaces a color everywhere), erase to bare fabric, an eyedropper, and undo and redo.
- **Palette.** Stitch and skein counts for each color. Highlight a color on the chart, swap its floss, change its symbol, or merge and remove colors.
- **Progress.** Mark stitches as done, or Shift-click to mark a whole area, with progress for each color and overall.
- **Accounts.** Local accounts with a pattern library, a floss stash, default settings, and backup and restore.

<div class="project-media-gallery">
  <figure><img src="/images/projects/stitchcraft-image.webp" alt="The Image tab: a thumbnail of the Great Wave with a crop box, crop presets Free, Original, 1:1, 4:5, 3:4, 5:7 and 16:9, sliders for brightness, contrast, saturation and sharpen, and transparency options Leave unstitched and Treat as white, beside the chart in color." width="1360" height="850" loading="lazy" /><figcaption>The image tools: crop presets, adjustments and transparency.</figcaption></figure>
  <figure><img src="/images/projects/stitchcraft-chart.webp" alt="The chart zoomed to 156% in Color + symbols mode, with each square showing a floss color and a symbol such as a triangle, star, square or club, bold lines every 10 stitches, rulers along the edges, a red center line, and a status bar reading Col 51, Row 33, DMC 796 Royal Blue Dark." width="1200" height="750" loading="lazy" /><figcaption>The chart editor in color with symbols, zoomed in on the crest of the wave.</figcaption></figure>
  <figure><img src="/images/projects/stitchcraft-colors.webp" alt="The Colors tab showing 28 colors, 15,150 stitches and 29 skeins, sorted by usage: DMC Ecru with 2,307 stitches and 2 skeins, DMC 677 Old Gold Very Light, DMC 739 Tan Ultra Very Light, DMC 927 Gray Green Light and more, each with a symbol, a stitch count and an eye button to highlight it on the chart." width="1360" height="850" loading="lazy" /><figcaption>The palette, with stitch and skein counts for each floss.</figcaption></figure>
</div>

## How a pattern is made

Generation runs in a Web Worker, so the page stays responsive while it works.

1. Apply the image adjustments, then convert every pixel to CIELAB, a color space built around how people see differences in color. Mostly transparent pixels stay unstitched (or count as white, if you choose), and partly transparent ones are blended over white.
2. Cluster the colors with k-means++. It asks for about 1.6 times as many clusters as the color limit, because several clusters often land on the same floss.
3. Snap each cluster to the nearest of 454 DMC colors with CIEDE2000 (or CIE76), weighted by how many pixels it covers. The least-used floss merges into its nearest neighbor until the palette fits the limit, and three refinement passes reassign pixels and re-snap each floss to the mean of its pixels.
4. Map every stitch to the palette, either directly or with Floyd–Steinberg, Atkinson or ordered Bayer dithering, which the app calls Smooth, Crisp and Pattern. Error diffusion scans in a serpentine order to reduce streaks.
5. Clean up confetti, replacing a stitch with no same-colored neighbor by the most common color around it. Then merge colors with too few stitches into their nearest neighbor and sort the legend by usage.

Skein counts come from a model of an 8-meter skein of six-strand floss, the fabric count, the number of strands, and an allowance for waste. The cut fabric size adds 3 inches on every side for framing.

## Printing and export

**Export & print** opens a booklet in a new window for the browser's print dialog, where you can save it as a PDF. It has a cover with a stitched preview and the finished size, a floss key with skein counts and a checkbox for each floss, and chart pages numbered on a page map, in black-and-white symbols or color. The chart also exports as a single PNG, the floss as a CSV shopping list, and the whole project as a file you can import again.

<div class="project-media-gallery">
  <figure><img src="/images/projects/stitchcraft-export.webp" alt="The Export and print dialog over the editor: a printable pattern section with a chart style choice of Black and white symbols or Color and symbols, Standard 50 by 70 squares per page making 6 chart pages, cover page options and a Print / Save as PDF button, and an image section with a style menu, a grid lines option, Download PNG, Floss shopping list (CSV) and Project file (re-importable)." width="1360" height="850" loading="lazy" /><figcaption>Export options: the printable booklet, a PNG, a CSV shopping list and a project file.</figcaption></figure>
  <figure><img src="/images/projects/stitchcraft-print-cover.webp" alt="The printed cover page: the title The Great Wave off Kanagawa, Counted cross stitch pattern, DMC stranded cotton, a stitched preview, boxes for design size 150 by 101 stitches, 14-count Aida, finished size 10.7 by 7.2 inches, cut fabric 16.7 by 13.2 inches, 28 colors, 15,150 stitches, 2 strands and about 105 hours, a six-page layout map, and instructions to start at the center." width="912" height="803" loading="lazy" /><figcaption>The booklet's cover.</figcaption></figure>
  <figure><img src="/images/projects/stitchcraft-floss-key.webp" alt="The printed floss key listing 28 DMC colors with 2 strands on 14-count fabric, each row showing a color swatch, its chart symbol, the DMC number, a name such as Ecru, Old Gold Vy Lt or Royal Blue Dark, a stitch count, a skein count and a Have checkbox." width="912" height="960" loading="lazy" /><figcaption>The floss key, with a checkbox for each floss.</figcaption></figure>
  <figure><img src="/images/projects/stitchcraft-print-chart.webp" alt="Page 1 of 6 of the printed chart, columns 1 to 50 and rows 1 to 70, in black-and-white symbols with bold lines every 10 stitches, a red center line at row 50, and a small page map in the corner." width="912" height="1007" loading="lazy" /><figcaption>The first of six chart pages.</figcaption></figure>
</div>

## How it's built

Stitchcraft is React 19 and TypeScript 7, built with Vite 8, and it has no other runtime dependencies. The color conversion, clustering, floss matching, dithering, chart rendering on a canvas, and the exporters are all its own code, along with the table of DMC colors. Passwords for the local accounts are salted and hashed with PBKDF2 through the Web Crypto API and kept in localStorage with the account list, and patterns are saved in IndexedDB. A small Node.js server serves the built files in production, and the repository was set up to deploy on Railway.

## Running it

With Node.js 20 or later, run `npm install` and `npm run dev` for the Vite dev server. `npm run build` type-checks and builds into `dist/`, and `npm start` serves it on `$PORT`.

The creation date shown here is the GitHub repository's UTC creation date. The screenshots were captured by running the app locally from its source, with a pattern made from the Metropolitan Museum of Art's public-domain scan of Hokusai's The Great Wave off Kanagawa, downloaded from Wikimedia Commons.
