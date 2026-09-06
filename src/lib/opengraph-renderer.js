import React from "react";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const h = React.createElement;
// Embedded local art keeps builds deterministic and independent of external image hosts.
const art = `data:image/png;base64,${(
  await sharp(
    readFileSync(
      new URL("../../public/images/editorial-curiosity.webp", import.meta.url),
    ),
  )
    .resize(540, 630, { fit: "cover" })
    .png()
    .toBuffer()
).toString("base64")}`;

/** @type {import("astro-opengraph-images").RenderFunction} */
export async function renderNearbycoderOg({ title, description, pathname }) {
  const path =
    "/" + (pathname || "").replace(/^\/+/, "").replace(/index\.html$/, "");
  const home = path === "/";
  const displayTitle = home
    ? "Always curious. Still building."
    : title.replace(/ · Josh Hamilton$/, "");
  const section = path.startsWith("/articles/")
    ? "Articles"
    : path.startsWith("/projects/")
      ? "Projects"
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
        background: "#f8f9fb",
        color: "#19202b",
        fontFamily: "Space Grotesk",
      },
    },
    [
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
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.7px",
                color: "#2743d9",
              },
            },
            "NEARBYCODER",
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
                color: "#596270",
              },
            },
            section.toUpperCase(),
          ),
          h(
            "div",
            {
              key: "title",
              style: {
                display: "flex",
                marginTop: 17,
                fontWeight: 500,
                fontSize: size,
                lineHeight: 1.06,
                letterSpacing: "-2.4px",
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
                color: "#596270",
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
                borderTop: "1px solid #d3d8e1",
                fontSize: 17,
                color: "#596270",
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
        style: { objectFit: "cover" },
      }),
    ],
  );
}
