import React from "react";
import { readFileSync, readdirSync } from "node:fs";
import sharp from "sharp";
import artwork from "../data/article-artwork.json" with { type: "json" };

const h = React.createElement;
// Embedded local art keeps builds deterministic and independent of external image hosts.
const artCache = new Map();
async function coverData(src) {
  if (!artCache.has(src)) {
    artCache.set(
      src,
      sharp(readFileSync(new URL(`../../public${src}`, import.meta.url)))
        .resize(480, 630, { fit: "cover" })
        .png()
        .toBuffer()
        .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`),
    );
  }
  return artCache.get(src);
}

// Games get real screenshots instead of editorial art: a mosaic of the newest
// covers for the archive, and a game's own screenshots for its page.
const PANEL = { width: 390, height: 630, gap: 6, background: "#faf6ec" };
const gamesDir = new URL("../../src/content/games/", import.meta.url);
function gameImages(slug) {
  const source = readFileSync(new URL(`${slug}.md`, gamesDir), "utf8");
  const cover = source.match(/^image:\s*"([^"]+)"/m)?.[1];
  const body = source.slice(source.indexOf("\n---", 3) + 4);
  const shots = [
    ...body.matchAll(/src="(\/images\/[^"]+\.(?:webp|png|jpe?g))"/g),
  ]
    .map((match) => match[1])
    .filter((src) => src !== cover);
  return [cover, ...shots].filter(Boolean);
}
function newestGameCovers(count) {
  return readdirSync(gamesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = readFileSync(new URL(file, gamesDir), "utf8");
      return {
        createdAt: source.match(/^createdAt:\s*"([^"]+)"/m)?.[1] ?? "",
        cover: source.match(/^image:\s*"([^"]+)"/m)?.[1],
      };
    })
    .filter((game) => game.cover)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count)
    .map((game) => game.cover);
}
const mosaicCache = new Map();
/** Tile screenshots into the card's art panel, `columns` across. */
function mosaicData(srcs, columns) {
  const key = `${columns}:${srcs.join("|")}`;
  if (!mosaicCache.has(key)) {
    const rows = Math.ceil(srcs.length / columns);
    const { width, height, gap, background } = PANEL;
    const tileWidth = Math.floor((width - gap * (columns - 1)) / columns);
    const tileHeight = Math.floor((height - gap * (rows - 1)) / rows);
    mosaicCache.set(
      key,
      Promise.all(
        srcs.map((src) =>
          sharp(readFileSync(new URL(`../../public${src}`, import.meta.url)))
            .resize(tileWidth, tileHeight, { fit: "cover" })
            .toBuffer(),
        ),
      )
        .then((tiles) =>
          sharp({
            create: { width, height, channels: 3, background },
          })
            .composite(
              tiles.map((input, index) => ({
                input,
                left: (index % columns) * (tileWidth + gap),
                top: Math.floor(index / columns) * (tileHeight + gap),
              })),
            )
            .png()
            .toBuffer(),
        )
        .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`),
    );
  }
  return mosaicCache.get(key);
}

// The theme's contour map, inked in survey brown for the card background.
let contourCache;
function contourData() {
  contourCache ??= sharp(
    Buffer.from(
      readFileSync(
        new URL("../../public/images/contours.svg", import.meta.url),
        "utf8",
      ).replace('stroke="#000"', 'stroke="#8a6d4a"'),
    ),
  )
    .resize(1080, 608, { fit: "cover" })
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  return contourCache;
}

/** @type {import("astro-opengraph-images").RenderFunction} */
export async function renderNearbycoderOg({ title, description, pathname }) {
  const path =
    "/" + (pathname || "").replace(/^\/+/, "").replace(/index\.html$/, "");
  const home = path === "/";
  const articleId = path.match(/^\/articles\/([^/]+)\/?$/)?.[1];
  const articleArt = articleId
    ? artwork[decodeURIComponent(articleId)]
    : undefined;
  const gameId = path.match(/^\/games\/([^/]+)\/?$/)?.[1];
  const shots = gameId ? gameImages(decodeURIComponent(gameId)) : [];
  const art =
    path === "/games/"
      ? await mosaicData(newestGameCovers(8), 2)
      : shots.length > 1
        ? await mosaicData(shots.slice(0, 2), 1)
        : await coverData(
            shots[0] ?? articleArt?.src ?? "/images/editorial-curiosity.webp",
          );
  const contours = await contourData();
  const displayTitle = home
    ? "Always curious. Still building."
    : title.replace(/ · Josh Hamilton$/, "");
  const section = path.startsWith("/articles/")
    ? "Articles"
    : path.startsWith("/projects/")
      ? "Projects"
      : path.startsWith("/games/")
        ? "Games"
        : path.startsWith("/layoff/")
          ? "Layoff Log"
          : "Nearbycoder";
  // Fit the longest published title without truncating its meaning.
  const size =
    displayTitle.length > 105
      ? 43
      : displayTitle.length > 78
        ? 48
        : displayTitle.length > 52
          ? 54
          : 66;
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#f3ecdc",
        color: "#1c2620",
        fontFamily: "Space Grotesk",
      },
    },
    [
      h("img", {
        key: "contours",
        src: contours,
        width: 1080,
        height: 608,
        style: { position: "absolute", left: -120, top: 22, opacity: 0.32 },
      }),
      h(
        "div",
        {
          key: "copy",
          style: {
            width: 810,
            height: "100%",
            padding: "44px 48px",
            display: "flex",
            flexDirection: "column",
          },
        },
        [
          h(
            "div",
            {
              key: "brand",
              style: {
                display: "flex",
                alignItems: "center",
                fontFamily: "Fraunces",
                fontSize: 26,
                letterSpacing: "-0.6px",
              },
            },
            [
              h("div", {
                key: "pin",
                style: {
                  width: 14,
                  height: 14,
                  marginRight: 12,
                  borderRadius: 7,
                  background: "#a8390b",
                  boxShadow: "0 0 0 5px #f5dfcb",
                },
              }),
              h("span", { key: "near" }, "Nearby"),
              h(
                "span",
                {
                  key: "coder",
                  style: {
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "#a8390b",
                  },
                },
                "coder",
              ),
            ],
          ),
          h(
            "div",
            {
              key: "section",
              style: {
                display: "flex",
                marginTop: 47,
                fontFamily: "JetBrains Mono",
                fontSize: 15,
                letterSpacing: "1.5px",
                color: "#a8390b",
              },
            },
            `${section.toUpperCase()}  ·  36.154° N 95.993° W`,
          ),
          h(
            "div",
            {
              key: "title",
              style: {
                display: "flex",
                marginTop: 17,
                fontFamily: "Fraunces",
                fontWeight: 400,
                fontSize: size,
                lineHeight: 1.04,
                letterSpacing: "-1.6px",
              },
            },
            displayTitle,
          ),
          h(
            "div",
            {
              key: "description",
              style: {
                display: "flex",
                marginTop: 22,
                fontSize: 20,
                lineHeight: 1.4,
                color: "#5a5545",
              },
            },
            home
              ? "Engineering, AI, and the human side of making software."
              : description?.length > 145
                ? description.slice(0, 142).trimEnd() + "…"
                : description,
          ),
          h(
            "div",
            {
              key: "footer",
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginTop: "auto",
                paddingTop: 18,
                borderTop: "2px dashed #cdbf9f",
                fontSize: 17,
                color: "#5a5545",
              },
            },
            [
              h("span", { key: "author" }, "Josh Hamilton"),
              h("span", { key: "url" }, "nearbycoder.com"),
            ],
          ),
        ],
      ),
      h("img", {
        key: "image",
        src: art,
        width: 390,
        height: 630,
        style: { objectFit: "cover", borderLeft: "10px solid #faf6ec" },
      }),
    ],
  );
}
