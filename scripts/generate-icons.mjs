// Draws the Nearby Building favicon set: a stepped Deco tower in front of a
// gold sunburst on a lacquer tile. Run with `node scripts/generate-icons.mjs`.
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const rays = (count, inner, outer, cx = 32, cy = 58) =>
  Array.from({ length: count }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / (count - 1);
    const p = (r) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(inner)}L${p(outer)}`;
  }).join("");

// 64-unit artboard. `small` thickens strokes for 16–32px rendering.
function icon({ small = false, padded = false } = {}) {
  const ray = small ? 4.2 : 3;
  const inset = padded ? 6 : 0;
  const size = 64 - inset * 2;
  const r = padded ? 12 : 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241b3a"/>
      <stop offset="1" stop-color="#0b0914"/>
    </linearGradient>
    <clipPath id="tile"><rect x="${inset}" y="${inset}" width="${size}" height="${size}" rx="${r}"/></clipPath>
  </defs>
  <g clip-path="url(#tile)">
    <rect width="64" height="64" fill="url(#sky)"/>
    <path d="${rays(small ? 7 : 13, small ? 22 : 21, 60)}" stroke="#ffc35a" stroke-width="${ray}" stroke-linecap="round"/>
    <path d="M19 58V37h4v-8h4v-8h3V9h4v12h3v8h4v8h4v21Z" fill="#f4e9d6"/>
    <path d="M30.6 29h2.8v5h-2.8zM30.6 40h2.8v12h-2.8z" fill="#0b0914"/>
    <circle cx="32" cy="7.2" r="${small ? 3.6 : 3}" fill="#ff5c7f"/>
    <rect y="56" width="64" height="8" fill="#b03d24"/>
    <rect y="55" width="64" height="1.4" fill="#ffc35a"/>
  </g>
  ${small ? "" : `<rect x="${inset + 3}" y="${inset + 3}" width="${size - 6}" height="${size - 6}" rx="${r - 2.5}" fill="none" stroke="#ffc35a" stroke-opacity=".5" stroke-width="1.2"/>`}
</svg>
`;
}

writeFileSync("public/favicon.svg", icon());
const small = Buffer.from(icon({ small: true }));
const big = Buffer.from(icon());
const touch = Buffer.from(icon({ padded: true }));
const png = (svg, size) => sharp(svg, { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();

const sizes = { 16: small, 32: small, 48: small };
const pngs = await Promise.all(Object.entries(sizes).map(([s, svg]) => png(svg, +s)));
// A PNG-in-ICO container (supported by every current browser).
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
Object.keys(sizes).forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(+s, e);
  header.writeUInt8(+s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync("public/favicon.ico", Buffer.concat([header, ...pngs]));
writeFileSync("public/favicon.png", await png(big, 512));
writeFileSync("public/favicon-32.png", pngs[1]);
writeFileSync("public/apple-touch-icon.png", await png(touch, 180));
writeFileSync("public/icon-192.png", await png(touch, 192));
writeFileSync("public/icon-512.png", await png(touch, 512));
writeFileSync(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Josh Hamilton · Nearbycoder",
      short_name: "Nearbycoder",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
      theme_color: "#0d0b18",
      background_color: "#0d0b18",
      display: "browser",
    },
    null,
    2,
  ) + "\n",
);
console.log("Wrote favicon.svg, favicon.ico, favicon.png, favicon-32.png, apple-touch-icon.png, icon-192/512.png, site.webmanifest");
