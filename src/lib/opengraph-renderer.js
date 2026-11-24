import React from "react";
import { readFileSync, readdirSync } from "node:fs";
import sharp from "sharp";
import artwork from "../data/article-artwork.json" with { type: "json" };
import projectImages from "../data/project-images.json" with { type: "json" };

const h = React.createElement;
const artCache = new Map();
async function coverData(src) {
  if (!artCache.has(src)) {
    artCache.set(
      src,
      sharp(readFileSync(new URL(`../../public${src}`, import.meta.url)))
        .resize(440, 630, { fit: "cover" })
        .png()
        .toBuffer()
        .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`),
    );
  }
  return artCache.get(src);
}

const PANEL = { width: 410, height: 630, gap: 6, background: "#050608" };
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

// Volcanic Ink & Liquid Glass right panel compositions
const PW = 410,
  PH = 630;
function causticPanelSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
  <defs>
    <radialGradient id="c1" cx="72%" cy="32%" r="60%">
      <stop offset="0%" stop-color="#c9ff3b" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="#9c88ff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c2" cx="28%" cy="76%" r="55%">
      <stop offset="0%" stop-color="#9c88ff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9ff3b" stop-opacity="0.72"/>
      <stop offset="50%" stop-color="#9c88ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="${PW}" height="${PH}" fill="#07080d"/>
  <rect width="${PW}" height="${PH}" fill="url(#c1)"/>
  <rect width="${PW}" height="${PH}" fill="url(#c2)"/>
  <path d="M350 -20 C 120 120, 390 280, 150 450 C 40 530, 180 610, 310 660" fill="none" stroke="url(#ribbon)" stroke-width="58" stroke-opacity="0.22" stroke-linecap="round"/>
  <path d="M365 -20 C 145 125, 405 280, 165 455 C 55 535, 195 610, 325 660" fill="none" stroke="#c9ff3b" stroke-width="2.2" stroke-opacity="0.72"/>
</svg>`;
}
const panelCache = new Map();
function cachedPanel(key, make) {
  if (!panelCache.has(key))
    panelCache.set(
      key,
      make().then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`),
    );
  return panelCache.get(key);
}
const circleMask = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
  );
function silkPanel() {
  return cachedPanel("silk", () =>
    sharp(Buffer.from(causticPanelSvg())).png().toBuffer(),
  );
}
const PORTRAIT = "/images/portrait.webp";
function portraitPanel() {
  return cachedPanel("portrait", async () => {
    const size = 248;
    const photo = await sharp(
      readFileSync(new URL(`../../public${PORTRAIT}`, import.meta.url)),
    )
      .resize(size - 12, size - 12, { fit: "cover" })
      .composite([{ input: circleMask(size - 12), blend: "dest-in" }])
      .png()
      .toBuffer();
    const ring = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="none" stroke="#c9ff3b" stroke-opacity="0.75" stroke-width="2.5"/>
      </svg>`,
    );
    return sharp(Buffer.from(causticPanelSvg()))
      .composite([
        { input: photo, left: Math.round(PW / 2 - (size - 12) / 2), top: Math.round(PH / 2 - (size - 12) / 2) },
        { input: ring, left: Math.round(PW / 2 - size / 2), top: Math.round(PH / 2 - size / 2) },
      ])
      .png()
      .toBuffer();
  });
}
function vitrinePanel(src) {
  return cachedPanel(`vitrine:${src}`, async () => {
    const shot = await sharp(readFileSync(new URL(`../../public${src}`, import.meta.url)))
      .resize(336, 430, { fit: "inside" })
      .png()
      .toBuffer();
    const { width, height } = await sharp(shot).metadata();
    const framed = await sharp({
      create: {
        width: width + 14,
        height: height + 14,
        channels: 4,
        background: { r: 24, g: 27, b: 36, alpha: 0.92 },
      },
    })
      .composite([{ input: shot, left: 7, top: 7 }])
      .png()
      .toBuffer();
    return sharp(Buffer.from(causticPanelSvg()))
      .composite([
        {
          input: framed,
          left: Math.round(PW / 2 - (width + 14) / 2),
          top: Math.round(PH / 2 - (height + 14) / 2),
        },
      ])
      .png()
      .toBuffer();
  });
}
const projectsDir = new URL("../../src/content/projects/", import.meta.url);
function projectCover(slug) {
  try {
    const source = readFileSync(new URL(`${slug}.md`, projectsDir), "utf8");
    const image = source.match(/^image:\s*"([^"]+)"/m)?.[1];
    if (image && !image.endsWith(".svg")) return image;
    const mapped = projectImages[slug];
    if (mapped)
      return mapped
        .replace("/images/", "/images/optimized/")
        .replace(/\.(png|jpe?g)$/, ".webp");
  } catch {}
  return undefined;
}

const W = 1200,
  H = 630;
const backgroundSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g1" cx="68%" cy="18%" r="54%">
      <stop offset="0%" stop-color="#c9ff3b" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="#9c88ff" stop-opacity="0.11"/>
      <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="12%" cy="92%" r="48%">
      <stop offset="0%" stop-color="#9c88ff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#050608"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>
</svg>`;

const frameSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.5"/>
  <line x1="790" y1="20" x2="790" y2="${H - 20}" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
</svg>`;

const markSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="96" height="96">
  <rect x="2.5" y="2.5" width="27" height="27" rx="8" fill="#11131a" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.2"/>
  <path d="M9.5 23.5V9.2c0-.7.8-1 1.3-.5l11.4 12.6c.5.5 1.3.2 1.3-.5V8.5" fill="none" stroke="#f5f2eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.5 23.5C13.5 19.2 18.5 12.8 22.5 8.5" fill="none" stroke="#c9ff3b" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="22.5" cy="8.5" r="2.2" fill="#c9ff3b"/>
</svg>`;

const ornaments = {};
function ornament(name, svg) {
  ornaments[name] ??= sharp(Buffer.from(svg()))
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  return ornaments[name];
}

function sectionFor(path) {
  if (path === "/") return "Nearby Atelier · Tulsa, Oklahoma";
  const read = ["/articles", "/start-here", "/topics", "/archive", "/discover", "/search", "/reading-list", "/glossary"];
  const workshop = ["/projects", "/games", "/layoff", "/lab", "/postmortems", "/technologies"];
  const about = ["/about", "/now", "/uses", "/subscribe", "/feeds"];
  const label = path.startsWith("/articles/")
    ? "Essays"
    : path.startsWith("/projects/")
      ? "Projects"
      : path.startsWith("/games/")
        ? "Games"
        : path.startsWith("/layoff/")
          ? "Layoff Log"
          : undefined;
  const on = (list) => list.some((root) => path === root || path.startsWith(`${root}/`));
  if (on(read)) return `01 · Read${label ? ` · ${label}` : ""}`;
  if (on(workshop)) return `02 · Workshop${label ? ` · ${label}` : ""}`;
  if (on(about)) return "03 · About";
  return "Nearby Atelier";
}

const IVORY = "#f5f2eb",
  CHARTREUSE = "#c9ff3b",
  MUTED = "#a6a39c";

const cardPath = (pathname) =>
  "/" + (pathname || "").replace(/^\/+/, "").replace(/index\.html$/, "");

export function cardArt(pathname) {
  const path = cardPath(pathname);
  const articleId = path.match(/^\/articles\/([^/]+)\/?$/)?.[1];
  const articleArt = articleId
    ? artwork[decodeURIComponent(articleId)]
    : undefined;
  const gameId = path.match(/^\/games\/([^/]+)\/?$/)?.[1];
  const shots = gameId ? gameImages(decodeURIComponent(gameId)) : [];
  const projectId = path.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const projectShot = projectId
    ? projectCover(decodeURIComponent(projectId))
    : undefined;
  if (path === "/games/")
    return { kind: "mosaic", columns: 2, srcs: newestGameCovers(8) };
  if (shots.length > 1)
    return { kind: "mosaic", columns: 1, srcs: shots.slice(0, 2) };
  if (shots[0] || articleArt)
    return { kind: "cover", srcs: [shots[0] ?? articleArt.src] };
  if (projectShot) return { kind: "vitrine", srcs: [projectShot] };
  if (path === "/" || path.startsWith("/about"))
    return { kind: "portrait", srcs: [PORTRAIT] };
  return { kind: "silk", srcs: [] };
}

function artData({ kind, columns, srcs }) {
  if (kind === "mosaic") return mosaicData(srcs, columns);
  if (kind === "cover") return coverData(srcs[0]);
  if (kind === "vitrine") return vitrinePanel(srcs[0]);
  if (kind === "portrait") return portraitPanel();
  return silkPanel();
}

/** @type {import("astro-opengraph-images").RenderFunction} */
export async function renderNearbycoderOg({ title, description, pathname }) {
  const path = cardPath(pathname);
  const home = path === "/";
  const art = await artData(cardArt(pathname));
  const [background, frame, mark] = await Promise.all([
    ornament("background", backgroundSvg),
    ornament("frame", frameSvg),
    ornament("mark", markSvg),
  ]);
  const displayTitle = home
    ? "Always curious."
    : title.replace(/ · Josh Hamilton$/, "");
  const size =
    displayTitle.length > 95
      ? 42
      : displayTitle.length > 68
        ? 48
        : displayTitle.length > 42
          ? 56
          : displayTitle.length > 24
            ? 64
            : 78;
  const deck = home
    ? "Engineering, AI, and the human side of making software."
    : description?.length > 112
      ? description.slice(0, 110).trimEnd() + "…"
      : description;

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#050608",
        color: IVORY,
        fontFamily: "Jost",
      },
    },
    [
      h("img", {
        key: "background",
        src: background,
        width: W,
        height: H,
        style: { position: "absolute", left: 0, top: 0 },
      }),
      h("img", {
        key: "art",
        src: art,
        width: 410,
        height: 630,
        style: { position: "absolute", left: 790, top: 0, objectFit: "cover" },
      }),
      h("img", {
        key: "frame",
        src: frame,
        width: W,
        height: H,
        style: { position: "absolute", left: 0, top: 0 },
      }),
      h(
        "div",
        {
          key: "copy",
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 790,
            height: H,
            padding: "54px 62px 52px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        },
        [
          h(
            "div",
            {
              key: "brand",
              style: { display: "flex", alignItems: "center" },
            },
            [
              h("img", {
                key: "mark",
                src: mark,
                width: 40,
                height: 40,
                style: { marginRight: 14 },
              }),
              h(
                "span",
                {
                  key: "word",
                  style: { fontFamily: "Newsreader", fontSize: 30, fontWeight: 500 },
                },
                "Nearby",
              ),
              h(
                "span",
                {
                  key: "coder",
                  style: {
                    fontFamily: "Newsreader",
                    fontStyle: "italic",
                    fontSize: 30,
                    color: CHARTREUSE,
                  },
                },
                "coder",
              ),
            ],
          ),
          h(
            "div",
            {
              key: "pill",
              style: {
                display: "flex",
                alignSelf: "flex-start",
                flexShrink: 0,
                marginTop: 28,
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid rgba(201, 255, 59, 0.4)",
                background: "rgba(201, 255, 59, 0.1)",
                color: CHARTREUSE,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              },
            },
            sectionFor(path),
          ),
          h(
            "div",
            {
              key: "title",
              style: {
                display: "flex",
                flexDirection: "column",
                marginTop: 24,
                fontFamily: "Newsreader",
                fontWeight: 400,
                fontSize: home ? 86 : size,
                flexShrink: 0,
                lineHeight: 1.02,
                letterSpacing: "-2px",
                color: IVORY,
              },
            },
            home
              ? [
                  h("span", { key: "a" }, displayTitle),
                  h(
                    "span",
                    {
                      key: "b",
                      style: {
                        fontStyle: "italic",
                        color: CHARTREUSE,
                      },
                    },
                    "Still building.",
                  ),
                ]
              : displayTitle,
          ),
          h(
            "div",
            {
              key: "description",
              style: {
                display: "flex",
                marginTop: 20,
                flexShrink: 0,
                fontFamily: "Jost",
                fontWeight: 400,
                fontSize: 22,
                lineHeight: 1.45,
                color: MUTED,
              },
            },
            deck,
          ),
          h(
            "div",
            {
              key: "footer",
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: 18,
                borderTop: "1px solid rgba(255, 255, 255, 0.14)",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "2.2px",
                textTransform: "uppercase",
                color: MUTED,
              },
            },
            [
              h("span", { key: "author", style: { color: IVORY } }, "Josh Hamilton"),
              h("span", { key: "url", style: { color: CHARTREUSE } }, "nearbycoder.com"),
            ],
          ),
        ],
      ),
    ],
  );
}
