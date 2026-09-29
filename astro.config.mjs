// @ts-check
import { defineConfig } from "astro/config";
import { readFileSync } from "node:fs";

import tailwindcss from "@tailwindcss/vite";
import opengraphImages from "astro-opengraph-images";
import { renderNearbycoderOg } from "./src/lib/opengraph-renderer.js";

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
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["nearbyserver"],
    },
  },
});
