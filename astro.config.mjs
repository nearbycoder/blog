// @ts-check
import { defineConfig } from "astro/config";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import tailwindcss from "@tailwindcss/vite";
import opengraphImages from "astro-opengraph-images";
import { renderNearbycoderOg } from "./src/lib/opengraph-renderer.js";

// The generated social cards are full-color PNGs; a palette keeps them about
// 70% smaller with no visible change. Runs after astro-opengraph-images.
const compressSocialCards = {
  name: "compress-social-cards",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const cards = readdirSync(root, { recursive: true })
        .map(String)
        .filter((file) => file === "index.png" || file.endsWith("/index.png"));
      let before = 0;
      let after = 0;
      for (const file of cards) {
        const path = `${root}${file}`;
        const source = readFileSync(path);
        const output = await sharp(source)
          .png({ palette: true, quality: 85, effort: 10 })
          .toBuffer();
        before += source.length;
        if (output.length < source.length) writeFileSync(path, output);
        after += Math.min(output.length, source.length);
      }
      logger.info(
        `Compressed ${cards.length} social cards: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`,
      );
    },
  },
};

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  site: "https://nearbycoder.com",
  integrations: [
    opengraphImages({
      options: {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Space Grotesk",
            weight: 500,
            style: "normal",
            data: readFileSync(
              "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff",
            ),
          },
          {
            name: "Space Grotesk",
            weight: 700,
            style: "normal",
            data: readFileSync(
              "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff",
            ),
          },
          {
            name: "Fraunces",
            weight: 400,
            style: "normal",
            data: readFileSync(
              "node_modules/@fontsource/fraunces/files/fraunces-latin-400-normal.woff",
            ),
          },
          {
            name: "Fraunces",
            weight: 300,
            style: "italic",
            data: readFileSync(
              "node_modules/@fontsource/fraunces/files/fraunces-latin-300-italic.woff",
            ),
          },
          {
            name: "JetBrains Mono",
            weight: 700,
            style: "normal",
            data: readFileSync(
              "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff",
            ),
          },
        ],
      },
      render: renderNearbycoderOg,
    }),
    compressSocialCards,
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // A lazy app must not import the executing desktop entry just to
          // access a small service or Vite's dynamic-import preload helper.
          // Keep these shared modules independent; app payload checks follow
          // their static imports and still count their full cost.
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (id.includes("vite/preload-helper")) return "module-preload";
            if (id.endsWith("/src/lib/desktop-apps.ts"))
              return "desktop-app-registry";
            const shared = id.match(
              /\/src\/scripts\/(desktop-(?:host|local-state|window-layout|library-history|preferences|customization|wallpapers|spaces|activity-service))\.ts$/,
            );
            return shared?.[1];
          },
        },
      },
    },
    server: {
      allowedHosts: ["nearbyserver"],
    },
  },
});
