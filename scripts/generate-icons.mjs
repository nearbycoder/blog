// Draws the Nearby Atelier favicon set: folded smoked-glass monogram with a
// molten chartreuse spark on volcanic obsidian. Run with `node scripts/generate-icons.mjs`.
import { writeFileSync } from "node:fs";
import sharp from "sharp";

function icon({ small = false, padded = false } = {}) {
  const stroke = small ? 5.6 : 4.4;
  const inset = padded ? 5 : 0;
  const size = 64 - inset * 2;
  const r = padded ? 14 : 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="caustic" cx="76%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#c9ff3b" stop-opacity="0.34"/>
      <stop offset="48%" stop-color="#9c88ff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#050608" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14161e"/>
      <stop offset="100%" stop-color="#050608"/>
    </linearGradient>
    <linearGradient id="ribbon" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c9ff3b"/>
      <stop offset="55%" stop-color="#9c88ff"/>
      <stop offset="100%" stop-color="#f5f2eb" stop-opacity="0.35"/>
    </linearGradient>
    <clipPath id="tile"><rect x="${inset}" y="${inset}" width="${size}" height="${size}" rx="${r}"/></clipPath>
  </defs>
  <g clip-path="url(#tile)">
    <rect width="64" height="64" fill="url(#bg)"/>
    <rect width="64" height="64" fill="url(#caustic)"/>
    <path d="M18 46V18.5c0-1.1 1.4-1.7 2.2-.8L43.8 45.3c.8.9 2.2.3 2.2-.8V18" fill="none" stroke="#f5f2eb" stroke-opacity="0.9" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 46C26 37 38 27 46 18" fill="none" stroke="url(#ribbon)" stroke-width="${stroke}" stroke-linecap="round"/>
    <circle cx="46" cy="18" r="${small ? 4.8 : 4.2}" fill="#c9ff3b"/>
  </g>
  ${small ? "" : `<rect x="${inset + 1.5}" y="${inset + 1.5}" width="${size - 3}" height="${size - 3}" rx="${r - 1.5}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.4"/>`}
</svg>
`;
}

writeFileSync("public/favicon.svg", icon());
const small = Buffer.from(icon({ small: true }));
const big = Buffer.from(icon());
const touch = Buffer.from(icon({ padded: true }));
const png = (svg, size) =>
  sharp(svg, { density: 72 * (size / 64) * 2 })
    .resize(size, size)
    .png()
    .toBuffer();

const sizes = { 16: small, 32: small, 48: small };
const pngs = await Promise.all(
  Object.entries(sizes).map(([s, svg]) => png(svg, +s)),
);
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
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      theme_color: "#050608",
      background_color: "#050608",
      display: "browser",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Wrote Nearby Atelier favicon.svg, favicon.ico, favicon.png, favicon-32.png, apple-touch-icon.png, icon-192/512.png, site.webmanifest",
);
