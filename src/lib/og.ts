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
  eyebrow = "Nearby Atelier",
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
  const size = displayTitle.length > 85 ? 46 : 58;
  const lines = wrap(displayTitle, size === 46 ? 30 : 24);
  const descriptionY = 214 + lines.length * (size + 6) + 22;
  // Volcanic Ink & Liquid Glass standalone SVG fallback; canonical PNGs come from opengraph-renderer.js.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><radialGradient id="c" cx="65%" cy="18%" r="55%"><stop offset="0%" stop-color="#c9ff3b" stop-opacity=".18"/><stop offset="55%" stop-color="#9c88ff" stop-opacity=".12"/><stop offset="100%" stop-color="#050608" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="#050608"/><rect width="1200" height="630" fill="url(#c)"/><image href="${art}" x="790" y="0" width="410" height="630" preserveAspectRatio="xMidYMid slice"/><rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="1.5"/><line x1="790" y1="20" x2="790" y2="610" stroke="#ffffff" stroke-opacity=".12" stroke-width="1.5"/><g font-family="Georgia,'Times New Roman',serif"><text x="62" y="88" fill="#f5f2eb" font-size="30">Nearby<tspan fill="#c9ff3b" font-style="italic">coder</tspan></text><text x="738" y="86" text-anchor="end" fill="#c9ff3b" font-size="14" font-family="system-ui,sans-serif" letter-spacing="2.5">NEARBYCODER.COM</text><text x="62" y="150" fill="#c9ff3b" font-size="14" font-family="system-ui,sans-serif" letter-spacing="3">${escape(eyebrow.toUpperCase())}</text>${lines.map((line, index) => `<text x="62" y="${214 + index * (size + 6)}" fill="#f5f2eb" font-size="${size}">${escape(line)}</text>`).join("")}${wrap(
    description,
    56,
  )
    .slice(0, 2)
    .map(
      (line, index) =>
        `<text x="62" y="${descriptionY + index * 30}" fill="#a6a39c" font-size="21" font-family="system-ui,sans-serif">${escape(line)}</text>`,
    )
    .join(
      "",
    )}<line x1="62" y1="548" x2="738" y2="548" stroke="#ffffff" stroke-opacity=".14"/><text x="62" y="586" fill="#f5f2eb" font-size="14" font-family="system-ui,sans-serif" letter-spacing="2">${escape((footer || "Josh Hamilton").toUpperCase())}</text></g></svg>`;
}
