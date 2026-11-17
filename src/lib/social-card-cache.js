// Social cards are the slowest part of a build: drawing about 500 PNGs, then
// shrinking each one to a palette. Most deploys change a few pages, so each
// card is cached under a hash of everything it's drawn from, and a build only
// draws the cards whose inputs changed:
// - the page's path, title and summary (from its og:title and og:description)
// - the public images the card embeds, by content
// - the renderer, its data files, this file, the Astro config (which lists the
//   fonts) and package-lock.json (satori, resvg, sharp and the fonts)
//
// The cache lives in node_modules/.cache/social-cards, which Vercel keeps
// between builds along with node_modules. To draw every card again, delete
// that folder, or redeploy on Vercel without the build cache.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { cardArt } from "./opengraph-renderer.js";

// Bump to draw every card again after a change the inputs above don't capture.
const VERSION = 1;
const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const cacheDir = root("node_modules/.cache/social-cards");
const manifestFile = join(cacheDir, "manifest.json");
// Cards no build has used for two weeks are deleted.
const keepFor = 14 * 24 * 60 * 60 * 1000;
const sharedInputs = [
  "astro.config.mjs",
  "package-lock.json",
  "src/lib/opengraph-renderer.js",
  "src/lib/social-card-cache.js",
  "src/data/article-artwork.json",
  "src/data/project-images.json",
];

/** @param {(string | Buffer)[]} parts */
function hash(...parts) {
  const digest = createHash("sha256");
  for (const part of parts) digest.update(part).update("\0");
  return digest.digest("hex");
}

/** The HTML file for a page, found the way astro-opengraph-images finds it. */
function htmlFile(/** @type {string} */ dist, /** @type {string} */ pathname) {
  const nested = join(dist, pathname, "index.html");
  if (existsSync(nested)) return nested;
  return join(dist, `${pathname.replace(/\/$/, "")}.html`);
}

/** A meta tag's raw content attribute, or "" without one. */
function meta(/** @type {string} */ html, /** @type {string} */ property) {
  const tag = html.match(new RegExp(`<meta[^>]*property="${property}"[^>]*>`));
  return tag?.[0].match(/content="([^"]*)"/)?.[1] ?? "";
}

/**
 * Wraps astro-opengraph-images so its unchanged build hook only draws cards
 * that aren't cached, and compresses each new card before caching it.
 * @param {import("astro").AstroIntegration} integration
 * @returns {import("astro").AstroIntegration}
 */
export function cachedSocialCards(integration) {
  const draw = integration.hooks["astro:build:done"];
  if (!draw) throw new Error("Social-card build hook is missing");
  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      /** @param {Parameters<NonNullable<import("astro").AstroIntegration["hooks"]["astro:build:done"]>>[0]} context */
      "astro:build:done": async (context) => {
        const dist = fileURLToPath(context.dir);
        mkdirSync(cacheDir, { recursive: true });
        /** @type {Record<string, number>} */
        let lastUsed = {};
        try {
          lastUsed = JSON.parse(readFileSync(manifestFile, "utf8"));
        } catch {}
        const now = Date.now();
        const shared = hash(
          String(VERSION),
          ...sharedInputs.map((file) => readFileSync(root(file))),
        );
        /** @type {Map<string, string>} */
        const images = new Map();
        const image = (/** @type {string} */ src) => {
          if (!images.has(src))
            images.set(src, hash(readFileSync(root(`public${src}`))));
          return /** @type {string} */ (images.get(src));
        };

        /** @type {{ page: { pathname: string }, card: string, cached: string }[]} */
        const misses = [];
        for (const page of context.pages) {
          const html = htmlFile(dist, page.pathname);
          const source = readFileSync(html, "utf8");
          const art = cardArt(page.pathname);
          const key = hash(
            shared,
            page.pathname,
            meta(source, "og:title"),
            meta(source, "og:description"),
            JSON.stringify(art),
            ...art.srcs.map(image),
          );
          const card = html.replace(/\.html$/, ".png");
          const cached = join(cacheDir, `${key}.png`);
          lastUsed[key] = now;
          if (existsSync(cached)) copyFileSync(cached, card);
          else misses.push({ page, card, cached });
        }

        // The integration draws a batch's pages at once, which can exhaust
        // build memory, so it gets small batches.
        for (let i = 0; i < misses.length; i += 4)
          await draw({
            ...context,
            pages: misses.slice(i, i + 4).map((miss) => miss.page),
          });
        // A palette keeps the full-color PNGs about 70% smaller with no
        // visible change.
        for (const { card, cached } of misses) {
          let png = readFileSync(card);
          if (basename(card) === "index.png") {
            const smaller = await sharp(png)
              .png({ palette: true, quality: 85, effort: 10 })
              .toBuffer();
            if (smaller.length < png.length) {
              png = smaller;
              writeFileSync(card, png);
            }
          }
          // Write, then rename, so an interrupted build can't leave half a card.
          writeFileSync(`${cached}.tmp`, png);
          renameSync(`${cached}.tmp`, cached);
        }

        for (const [key, time] of Object.entries(lastUsed))
          if (now - time > keepFor) delete lastUsed[key];
        for (const file of readdirSync(cacheDir))
          if (file.endsWith(".png") && !(file.slice(0, -4) in lastUsed))
            rmSync(join(cacheDir, file));
        writeFileSync(manifestFile, JSON.stringify(lastUsed));
        context.logger.info(
          `Social cards: reused ${context.pages.length - misses.length}, drew ${misses.length}`,
        );
      },
    },
  };
}
