import React from "react";
import { readFileSync } from "node:fs";
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
  const art = await coverData(
    articleArt?.src ?? "/images/editorial-curiosity.webp",
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
