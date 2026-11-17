import React from "react";
import { readFileSync, readdirSync } from "node:fs";
import sharp from "sharp";
import artwork from "../data/article-artwork.json" with { type: "json" };
import projectImages from "../data/project-images.json" with { type: "json" };

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
const PANEL = { width: 390, height: 630, gap: 6, background: "#0b0914" };
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

// Pages without their own artwork get a Deco panel: a sunburst over the
// Nearby Building (or Josh's portrait in an octagonal medallion), and project
// pages show their screenshot in a gilt vitrine on the same sunburst.
const PW = 390,
  PH = 630;
function panelSvg({ tower = true, rayY = 470 } = {}) {
  const rays = Array.from({ length: 40 }, (_, i) => {
    const a = (i * Math.PI * 2) / 40;
    return `<path d="M195 ${rayY}L${(195 + 700 * Math.cos(a)).toFixed(1)} ${(rayY + 700 * Math.sin(a)).toFixed(1)}"/>`;
  }).join("");
  const building = tower
    ? `<path d="M120 630V420h22v-60h22v-62h18V170h26v128h18v62h22v60h22v210Z" fill="#f4e9d6"/>
       <g fill="#0b0914">${Array.from({ length: 6 }, (_, row) =>
         [150, 172, 194, 216, 238].map((x) => `<rect x="${x - 4}" y="${440 + row * 30}" width="8" height="16"/>`).join(""),
       ).join("")}<rect x="190" y="310" width="10" height="40"/><rect x="190" y="370" width="10" height="40"/></g>
       <rect x="192.5" y="120" width="5" height="52" fill="#f4e9d6"/>
       <circle cx="195" cy="114" r="9" fill="#ff5c7f"/>
       <circle cx="195" cy="114" r="22" fill="#ff5c7f" fill-opacity=".18"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f45"/><stop offset="1" stop-color="#0b0914"/></linearGradient>
    <radialGradient id="g" cx="195" cy="${rayY}" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc35a" stop-opacity=".45"/><stop offset="1" stop-color="#ffc35a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${PW}" height="${PH}" fill="url(#s)"/>
  <rect width="${PW}" height="${PH}" fill="url(#g)"/>
  <g stroke="#ffc35a" stroke-width="3" stroke-opacity=".5">${rays}</g>
  ${building}
  <rect y="600" width="${PW}" height="30" fill="#b03d24"/>
  <rect y="596" width="${PW}" height="3" fill="#ffc35a"/>
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
const octagon = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path d="M${size * 0.293} 0H${size * 0.707}L${size} ${size * 0.293}V${size * 0.707}L${size * 0.707} ${size}H${size * 0.293}L0 ${size * 0.707}V${size * 0.293}Z"/></svg>`,
  );
function towerPanel() {
  return cachedPanel("tower", () => sharp(Buffer.from(panelSvg())).png().toBuffer());
}
const PORTRAIT = "/images/portrait.webp";
function portraitPanel() {
  return cachedPanel("portrait", async () => {
    const size = 236;
    const photo = await sharp(
      readFileSync(new URL(`../../public${PORTRAIT}`, import.meta.url)),
    )
      .resize(size - 16, size - 16, { fit: "cover" })
      .composite([{ input: octagon(size - 16), blend: "dest-in" }])
      .png()
      .toBuffer();
    const frame = await sharp({
      create: { width: size, height: size, channels: 4, background: "#ffc35a" },
    })
      .composite([{ input: octagon(size), blend: "dest-in" }])
      .png()
      .toBuffer();
    return sharp(Buffer.from(panelSvg({ tower: false, rayY: 300 })))
      .composite([
        { input: frame, left: 195 - size / 2, top: 300 - size / 2 },
        { input: photo, left: 195 - size / 2 + 8, top: 300 - size / 2 + 8 },
      ])
      .png()
      .toBuffer();
  });
}
function vitrinePanel(src) {
  return cachedPanel(`vitrine:${src}`, async () => {
    const shot = await sharp(readFileSync(new URL(`../../public${src}`, import.meta.url)))
      .resize(318, 420, { fit: "inside" })
      .png()
      .toBuffer();
    const { width, height } = await sharp(shot).metadata();
    const framed = await sharp({
      create: { width: width + 12, height: height + 12, channels: 4, background: "#ffc35a" },
    })
      .composite([{ input: shot, left: 6, top: 6 }])
      .png()
      .toBuffer();
    return sharp(Buffer.from(panelSvg({ tower: false, rayY: 330 })))
      .composite([
        {
          input: framed,
          left: Math.round(195 - (width + 12) / 2),
          top: Math.round(310 - (height + 12) / 2),
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
      return mapped.replace("/images/", "/images/optimized/").replace(/\.(png|jpe?g)$/, ".webp");
  } catch {}
  return undefined;
}

// Night-edition ornament for the card: midnight sky, a gold sunburst rising
// behind the title, and a gilt double frame with stepped Deco corners. The
// background sits under the art panel; the frame is drawn over it.
const W = 1200,
  H = 630;
function steppedFrame(inset, step) {
  const a = inset,
    b = W - inset,
    c = H - inset;
  return `M${a} ${a + step * 2}h${step}v${-step}h${step}v${-step}H${b - step * 2}v${step}h${step}v${step}h${step}V${c - step * 2}h${-step}v${step}h${-step}v${step}H${a + step * 2}v${-step}h${-step}v${-step}h${-step}Z`;
}
const backgroundSvg = () => {
  const rays = Array.from({ length: 34 }, (_, i) => {
    const angle = Math.PI + (i * Math.PI) / 33;
    const x = 405 + 900 * Math.cos(angle);
    const y = 700 + 900 * Math.sin(angle);
    return `<path d="M405 700 L${x.toFixed(1)} ${y.toFixed(1)}" />`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1430"/>
      <stop offset="1" stop-color="#0b0914"/>
    </linearGradient>
    <radialGradient id="glow" cx="405" cy="700" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffc35a" stop-opacity=".22"/>
      <stop offset="1" stop-color="#ffc35a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fade" cx="405" cy="700" r="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".9"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g stroke="#ffc35a" stroke-opacity=".16" stroke-width="2.2" mask="url(#m)">${rays}</g>
  <g fill="none" stroke="#ffffff" stroke-opacity=".035">
    ${Array.from({ length: 160 }, (_, i) => `<path d="M${i * 5 + 0.5} 0V${H}"/>`).join("")}
  </g>
</svg>`;
};
const frameSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <path d="${steppedFrame(16, 10)}" fill="none" stroke="#ffc35a" stroke-width="2"/>
  <path d="${steppedFrame(24, 10)}" fill="none" stroke="#ffc35a" stroke-opacity=".55" stroke-width="1"/>
  <path d="M810 0V${H}" stroke="#ffc35a" stroke-width="6"/>
  <path d="M818 0V${H}" stroke="#0b0914" stroke-width="4"/>
  <path d="M822 0V${H}" stroke="#ffc35a" stroke-width="1.5"/>
  <path d="M0 0h${W}v${H}H0Z${steppedFrame(16, 10)}" fill="#0b0914" fill-rule="evenodd"/>
  <path d="${steppedFrame(16, 10)}" fill="none" stroke="#ffc35a" stroke-width="2"/>
</svg>`;
const markSvg = () => {
  const rays = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 8;
    const p = (r) => `${(16 + r * Math.cos(a)).toFixed(2)} ${(29 + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(7.5)}L${p(14.5)}`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128">
  <path d="${rays}" stroke="#ffc35a" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M10 30V19h2v-4h2v-4h1.2V4h1.6v7H18v4h2v4h2v11Z" fill="#f4e9d6"/>
  <path d="M15.2 15h1.6v3h-1.6zM15.2 21h1.6v6h-1.6z" fill="#0b0914"/>
  <circle cx="16" cy="3.2" r="1.6" fill="#ff5c7f"/>
</svg>`;
};
const ornaments = {};
function ornament(name, svg) {
  ornaments[name] ??= sharp(Buffer.from(svg()))
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  return ornaments[name];
}

// Each part of the site is a floor of the Nearby Building.
function floorFor(path) {
  if (path === "/") return "The Lobby · Tulsa, Oklahoma";
  const read = ["/articles", "/start-here", "/topics", "/archive", "/discover", "/search", "/reading-list", "/glossary"];
  const workshop = ["/projects", "/games", "/layoff", "/lab", "/postmortems", "/technologies"];
  const about = ["/about", "/now", "/uses", "/subscribe", "/feeds"];
  const label = path.startsWith("/articles/")
    ? "Articles"
    : path.startsWith("/projects/")
      ? "Projects"
      : path.startsWith("/games/")
        ? "Games"
        : path.startsWith("/layoff/")
          ? "Layoff Log"
          : undefined;
  const on = (list) => list.some((root) => path === root || path.startsWith(`${root}/`));
  if (on(read)) return `Floor 01 · Read${label ? ` · ${label}` : ""}`;
  if (on(workshop)) return `Floor 02 · Workshop${label ? ` · ${label}` : ""}`;
  if (on(about)) return "Floor 03 · About";
  return "The Nearby Building";
}

const CREAM = "#f4e9d6",
  GOLD = "#ffc35a",
  NEON = "#ff5c7f",
  MUTED = "#bcb0c2";

/** A card's path, from a page's pathname as the build reports it. */
const cardPath = (pathname) =>
  "/" + (pathname || "").replace(/^\/+/, "").replace(/index\.html$/, "");

/**
 * The local art a page's card embeds: the kind of panel and the public images
 * it's drawn from. The build's card cache (src/lib/social-card-cache.js) keys
 * on this, so every image a card reads must be in `srcs`.
 */
export function cardArt(pathname) {
  const path = cardPath(pathname);
  const articleId = path.match(/^\/articles\/([^/]+)\/?$/)?.[1];
  const articleArt = articleId
    ? artwork[decodeURIComponent(articleId)]
    : undefined;
  const gameId = path.match(/^\/games\/([^/]+)\/?$/)?.[1];
  const shots = gameId ? gameImages(decodeURIComponent(gameId)) : [];
  const projectId = path.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const projectShot = projectId ? projectCover(decodeURIComponent(projectId)) : undefined;
  if (path === "/games/")
    return { kind: "mosaic", columns: 2, srcs: newestGameCovers(8) };
  if (shots.length > 1)
    return { kind: "mosaic", columns: 1, srcs: shots.slice(0, 2) };
  if (shots[0] || articleArt)
    return { kind: "cover", srcs: [shots[0] ?? articleArt.src] };
  if (projectShot) return { kind: "vitrine", srcs: [projectShot] };
  if (path === "/" || path.startsWith("/about"))
    return { kind: "portrait", srcs: [PORTRAIT] };
  return { kind: "tower", srcs: [] };
}

function artData({ kind, columns, srcs }) {
  if (kind === "mosaic") return mosaicData(srcs, columns);
  if (kind === "cover") return coverData(srcs[0]);
  if (kind === "vitrine") return vitrinePanel(srcs[0]);
  if (kind === "portrait") return portraitPanel();
  return towerPanel();
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
  // Big Shoulders is condensed, so long titles still fit without truncation.
  const size =
    displayTitle.length > 105
      ? 54
      : displayTitle.length > 78
        ? 60
        : displayTitle.length > 52
          ? 68
          : displayTitle.length > 28
            ? 84
            : 104;
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
        background: "#0b0914",
        color: CREAM,
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
        width: 390,
        height: 630,
        style: { position: "absolute", left: 810, top: 0, objectFit: "cover" },
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
            width: 810,
            height: H,
            padding: "52px 62px 50px",
            // Satori sizes boxes as content-box; without this the padding is
            // added to 810 × 630, so text runs into the divider and the footer
            // is pushed off the bottom of the card.
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
                width: 44,
                height: 44,
                style: { marginRight: 14 },
              }),
              h(
                "span",
                {
                  key: "word",
                  style: { fontFamily: "Limelight", fontSize: 30 },
                },
                "Nearby",
              ),
              h(
                "span",
                {
                  key: "coder",
                  style: { fontFamily: "Limelight", fontSize: 30, color: NEON },
                },
                "coder",
              ),
            ],
          ),
          h(
            "div",
            {
              key: "floor",
              style: {
                display: "flex",
                alignSelf: "flex-start",
                flexShrink: 0,
                marginTop: 30,
                padding: "7px 16px 8px",
                border: `1.5px solid ${GOLD}`,
                color: GOLD,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "4px",
                textTransform: "uppercase",
              },
            },
            floorFor(path),
          ),
          h(
            "div",
            {
              key: "title",
              style: {
                display: "flex",
                flexDirection: "column",
                marginTop: 22,
                fontFamily: "Big Shoulders Display",
                fontWeight: 800,
                fontSize: home ? 104 : size,
                flexShrink: 0,
                lineHeight: 0.92,
                textTransform: home ? "uppercase" : "none",
                color: home ? "#ffe2b8" : CREAM,
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
                        color: "#fff3f5",
                        textShadow: `0 0 12px ${NEON}, 0 0 30px ${NEON}`,
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
                marginTop: 18,
                flexShrink: 0,
                fontFamily: "Newsreader",
                fontStyle: "italic",
                fontSize: 25,
                lineHeight: 1.35,
                color: MUTED,
              },
            },
            deck,
          ),
          h("div", {
            key: "rule",
            style: {
              display: "flex",
              marginTop: "auto",
              height: 1,
              background: GOLD,
              opacity: 0.6,
            },
          }),
          h(
            "div",
            {
              key: "footer",
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 3,
                paddingTop: 16,
                borderTop: `2px solid ${GOLD}`,
                fontSize: 17,
                fontWeight: 500,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: CREAM,
              },
            },
            [
              h("span", { key: "author" }, "Josh Hamilton"),
              h("span", { key: "url", style: { color: GOLD } }, "nearbycoder.com"),
            ],
          ),
        ],
      ),
    ],
  );
}
