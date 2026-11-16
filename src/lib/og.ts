import { readFileSync } from "node:fs";
const art = `data:image/webp;base64,${readFileSync("public/images/editorial-curiosity.webp").toString("base64")}`;
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
function wrap(text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}
export function renderOgSvg({
  title,
  description,
  eyebrow = "Nearbycoder",
  footer,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  footer?: string;
  tags?: string[];
  accent?: string;
  artSeed?: string;
}) {
  const displayTitle =
    title.length > 130 ? "Always curious. Still building." : title;
  const size = displayTitle.length > 85 ? 52 : 66;
  const lines = wrap(displayTitle, size === 52 ? 30 : 24);
  const descriptionY = 214 + lines.length * (size + 4) + 26;
  const rays = Array.from({ length: 30 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 29;
    return `<path d="M405 700L${(405 + 900 * Math.cos(a)).toFixed(1)} ${(700 + 900 * Math.sin(a)).toFixed(1)}"/>`;
  }).join("");
  // The Nearby Building's night edition, drawn with system fonts so the SVG
  // stands alone. The PNG cards (src/lib/opengraph-renderer.js) are canonical.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1430"/><stop offset="1" stop-color="#0b0914"/></linearGradient></defs><rect width="1200" height="630" fill="url(#s)"/><g stroke="#ffc35a" stroke-opacity=".12" stroke-width="2">${rays}</g><image href="${art}" x="810" y="0" width="390" height="630" preserveAspectRatio="xMidYMid slice"/><path d="M810 0V630" stroke="#ffc35a" stroke-width="6"/><rect x="16" y="16" width="1168" height="598" fill="none" stroke="#ffc35a" stroke-width="2"/><rect x="24" y="24" width="1152" height="582" fill="none" stroke="#ffc35a" stroke-opacity=".5"/><g font-family="'Futura','Jost','Century Gothic',Arial,sans-serif"><text x="62" y="86" fill="#f4e9d6" font-size="28" font-family="Georgia,serif">Nearby<tspan fill="#ff5c7f">coder</tspan></text><text x="748" y="84" text-anchor="end" fill="#ffc35a" font-size="15" letter-spacing="3">NEARBYCODER.COM</text><text x="62" y="150" fill="#ffc35a" font-size="16" letter-spacing="4">${escape(eyebrow.toUpperCase())}</text>${lines.map((line, index) => `<text x="62" y="${214 + index * (size + 4)}" fill="#f4e9d6" font-size="${size}" font-weight="700" font-family="'Big Shoulders Display','Arial Narrow',Impact,sans-serif">${escape(line)}</text>`).join("")}${wrap(
    description,
    56,
  )
    .slice(0, 2)
    .map(
      (line, index) =>
        `<text x="62" y="${descriptionY + index * 30}" fill="#bcb0c2" font-size="22" font-style="italic" font-family="Georgia,serif">${escape(line)}</text>`,
    )
    .join(
      "",
    )}<path d="M62 546H748" stroke="#ffc35a" stroke-opacity=".6"/><path d="M62 550H748" stroke="#ffc35a" stroke-width="2"/><text x="62" y="590" fill="#f4e9d6" font-size="15" letter-spacing="2">${escape((footer || "Josh Hamilton").toUpperCase())}</text></g></svg>`;
}
