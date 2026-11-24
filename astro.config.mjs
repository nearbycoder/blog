// @ts-check
import { defineConfig } from "astro/config";
import { readFileSync } from "node:fs";

import tailwindcss from "@tailwindcss/vite";
import opengraphImages from "astro-opengraph-images";
import { renderNearbycoderOg } from "./src/lib/opengraph-renderer.js";
import { cachedSocialCards } from "./src/lib/social-card-cache.js";

// https://astro.build/config
export default defineConfig({
  // Preserve pre-Astro 7 whitespace semantics across existing templates.
  compressHTML: true,
  devToolbar: { enabled: false },
  site: "https://nearbycoder.com",
  integrations: [
    // Only cards whose inputs changed are drawn; see src/lib/social-card-cache.js.
    cachedSocialCards(
      opengraphImages({
        options: {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Newsreader",
              weight: 400,
              style: "normal",
              data: readFileSync(
                "node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff",
              ),
            },
            {
              name: "Newsreader",
              weight: 500,
              style: "normal",
              data: readFileSync(
                "node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff",
              ),
            },
            {
              name: "Newsreader",
              weight: 400,
              style: "italic",
              data: readFileSync(
                "node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff",
              ),
            },
            {
              name: "Jost",
              weight: 400,
              style: "normal",
              data: readFileSync(
                "node_modules/@fontsource/jost/files/jost-latin-400-normal.woff",
              ),
            },
            {
              name: "Jost",
              weight: 500,
              style: "normal",
              data: readFileSync(
                "node_modules/@fontsource/jost/files/jost-latin-500-normal.woff",
              ),
            },
            {
              name: "Jost",
              weight: 600,
              style: "normal",
              data: readFileSync(
                "node_modules/@fontsource/jost/files/jost-latin-600-normal.woff",
              ),
            },
          ],
        },
        render: renderNearbycoderOg,
      }),
    ),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Cache font subsets separately; avoid base64 in render-blocking CSS.
      assetsInlineLimit: (path) => (/\.woff2?$/.test(path) ? false : undefined),
      rollupOptions: {
        output: {
          // A lazy app must not import the executing desktop entry just to
          // access a small service or Vite's dynamic-import preload helper.
          // Keep these shared modules independent; app payload checks follow
          // their static imports and still count their full cost.
          codeSplitting: {
            groups: [
              {
                entriesAware: true,
                name(id) {
                  if (id.includes("vite/preload-helper"))
                    return "module-preload";
                  if (id.endsWith("/src/lib/desktop-apps.ts"))
                    return "desktop-app-registry";
                  const shared = id.match(
                    /\/src\/scripts\/(desktop-(?:host|local-state|window-layout|library-history|preferences|customization|wallpapers|spaces|activity-service))\.ts$/,
                  );
                  return shared?.[1] ?? null;
                },
              },
            ],
          },
        },
      },
    },
    server: {
      allowedHosts: ["nearbyserver"],
    },
  },
});
