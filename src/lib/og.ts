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
  const size = displayTitle.length > 85 ? 45 : 56;
  const lines = wrap(displayTitle, size === 45 ? 29 : 24);
  const descriptionY = 192 + lines.length * (size + 5) + 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f8f9fb"/><image href="${art}" x="810" y="0" width="390" height="630" preserveAspectRatio="xMidYMid slice"/><g font-family="Arial,sans-serif"><text x="48" y="65" fill="#2743d9" font-size="21" font-weight="700">NEARBYCODER</text><text x="48" y="130" fill="#596270" font-size="16">${escape(eyebrow.toUpperCase())}</text>${lines.map((line, index) => `<text x="48" y="${192 + index * (size + 5)}" fill="#19202b" font-size="${size}" letter-spacing="-2">${escape(line)}</text>`).join("")}${wrap(
    description,
    58,
  )
    .slice(0, 2)
    .map(
      (line, index) =>
        `<text x="48" y="${descriptionY + index * 28}" fill="#596270" font-size="21">${escape(line)}</text>`,
    )
    .join(
      "",
    )}<path d="M48 550H760" stroke="#d3d8e1"/><text x="48" y="592" fill="#596270" font-size="17">${escape(footer || "Josh Hamilton")}</text><text x="760" y="592" text-anchor="end" fill="#596270" font-size="17">nearbycoder.com</text></g></svg>`;
}
