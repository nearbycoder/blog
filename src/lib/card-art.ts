import { readFileSync } from "node:fs";
const art = `data:image/webp;base64,${readFileSync("public/images/editorial-curiosity.webp").toString("base64")}`;
/** Retain the established artwork endpoint for existing links and feed consumers. */
export function renderCardArtSvg(_input: {
  slug: string;
  tags?: string[];
  accent?: string;
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><image href="${art}" width="1200" height="800" preserveAspectRatio="xMidYMid slice"/></svg>`;
}
