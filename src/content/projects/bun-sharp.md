---
title: "bun-sharp"
summary: "A small image server on Bun that fetches an image by URL and resizes, crops, filters and re-encodes it with sharp, controlled by query parameters. An optional allow-list limits which hosts it will fetch from."
role: "Creator"
createdAt: "2025-08-12"
year: "2025"
stack: ["TypeScript", "Bun", "sharp"]
githubLink: "https://github.com/nearbycoder/bun-sharp"
image: "/images/projects/bun-sharp.webp"
imageAlt: "A terminal session: bun-sharp starts on port 5145 with RESTRICTED_DOMAINS=127.0.0.1 and prints Image server running on http://localhost:5145; a get helper wraps curl, and requests for a square WebP crop, a letterboxed WebP, a grayscale WebP and a blurred AVIF each return 200 with their content type and size; a request for an image on example.com returns the JSON error Forbidden: example.com is not allowed."
imageCaption: "The server running locally with Bun 1.4, answering four transform requests for an image from this site and refusing a host that isn't on its allow-list."
featured: false
accent: "yellow"
draft: false
---

bun-sharp is a single-file image service. Give its `/image` endpoint the URL of an image and a few query parameters, and it fetches the image, transforms it with [sharp](https://sharp.pixelplumbing.com/), and sends back the result with cache and CORS headers. It's TypeScript on Bun's built-in `Bun.serve`, and the root path answers with a JSON description of every parameter and an example request.

It was set up with `bun init` on August 12, 2025 (UTC), in two commits: the server, and eight minutes later an allow-list for source domains. It hasn't changed since.

## Parameters

| Parameter                                | What it does                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `url`                                    | The source image, required, http or https only                                                                      |
| `w`, `h`, `dpr`                          | Target width and height in pixels (1 to 10,000), and a multiplier for both (0.1 to 5)                               |
| `fit`, `position`, `background`          | How the image fits the box (`cover` by default, or `contain`, `fill`, `inside`, `outside`), the crop gravity, and the padding color |
| `format`, `q`                            | JPEG, PNG, WebP, AVIF, TIFF or HEIF output, with a quality from 1 to 100                                            |
| `grayscale`, `rotate`, `blur`, `sharpen` | Grayscale, a rotation in degrees, a blur sigma from 0.3 to 100, and sharpening that's either on or a sigma from 0.1 to 10 |
| `cacheSeconds`                           | The `Cache-Control` max-age, an hour by default                                                                     |

Out-of-range numbers are clamped and values that don't parse are ignored. With `q` but no `format`, it keeps the source's format when that's JPEG, PNG, WebP or AVIF, and otherwise switches to WebP.

<figure>
  <picture><source srcset="/images/projects/bun-sharp-params-dark.webp" media="(prefers-color-scheme: dark)" data-theme-dark /><img src="/images/projects/bun-sharp-params.webp" alt="Lines 195 to 216 of index.ts: width and height parsed as integers clamped to 1 through 10000, dpr as a float from 0.1 to 5 defaulting to 1, fit and format through their own parsers, quality from 1 to 100, background, grayscale as a boolean, rotate from 0 to 360, blur from 0.3 to 100, sharpen as either a boolean or a number from 0.1 to 10, position, and cacheSeconds from 0 to 31536000 defaulting to 3600." width="1440" height="897" loading="lazy" /></picture>
  <figcaption>Reading the transform parameters from the query string, in index.ts.</figcaption>
</figure>

<div class="project-media-gallery">
  <figure><img src="/images/projects/bun-sharp-square.webp" alt="A 400 by 400 square crop of an image of a blue metal ribbon sculpture shaped like a figure eight, with a small chrome ball, on a white surface in angled sunlight." width="400" height="400" loading="lazy" /><figcaption><code>w=400&amp;h=400&amp;fit=cover&amp;format=webp</code>: a square crop, 8,142 bytes.</figcaption></figure>
  <figure><img src="/images/projects/bun-sharp-letterbox.webp" alt="The same image scaled to fit inside a 600 by 300 box, with dark navy bars filling the space on the left and right." width="600" height="300" loading="lazy" /><figcaption><code>fit=contain</code> with a <code>#111827</code> background, letterboxed to 600 by 300: 6,306 bytes.</figcaption></figure>
  <figure><img src="/images/projects/bun-sharp-gray.webp" alt="The image at 600 by 400 in grayscale, the ribbon now dark gray against the white wall and floor." width="600" height="400" loading="lazy" /><figcaption><code>grayscale=1&amp;sharpen=1&amp;q=75</code> at 600 pixels wide: 6,988 bytes.</figcaption></figure>
</div>

## How it works

The handler fetches the source with a 15-second timeout, following redirects and asking for AVIF or WebP first. It then runs one sharp pipeline: rotation, grayscale, the resize, sharpening, blur, and the encoder, which defaults to quality 80 for JPEG (with mozjpeg), PNG, WebP and TIFF, and 60 for AVIF and HEIF. Responses carry `Cache-Control: public, max-age=…, immutable`, `Vary: Origin, Accept, DPR` and `Access-Control-Allow-Origin: *`. Errors come back as JSON with a 400, 403, 404 or 500 status.

`RESTRICTED_DOMAINS` takes a comma-separated list of hostnames. When it's set, a source on any other host gets a 403 before anything is fetched. When it isn't, the server fetches any http or https URL it's given. The committed `example.env` sets it to `google.com`. sharp is also created with `unlimited: true`, which turns off its limit on input pixels.

[smush.lol](/projects/smush-lol), from August 2026, is a later and much larger Bun image project. It uses Bun.Image rather than sharp.

## Running it

```sh
bun install
bun run index.ts
```

It listens on port 3000 unless `PORT` is set. Then request something like `localhost:3000/image?url=<an image URL>&w=800&format=webp`.

The creation date shown here is the GitHub repository's UTC creation date. The terminal capture comes from running the server locally with Bun 1.4.2, the three transformed images are its actual responses for an image from this site served by a local static server, and the code card shows a real file from the repository.
