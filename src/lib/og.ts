import { renderCardArtSvg } from "./card-art";

type OgAccent =
  | "amber"
  | "cyan"
  | "rose"
  | "mist"
  | "emerald"
  | "sky"
  | "violet"
  | "lime"
  | "teal"
  | "indigo"
  | "fuchsia"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "blue"
  | "slate"
  | "stone"
  | "zinc"
  | "neutral"
  | "purple"
  | "green"
  | "indigoDeep";

type OgInput = {
  title: string;
  description: string;
  eyebrow?: string;
  tags?: string[];
  accent?: OgAccent;
  footer?: string;
  artSeed?: string;
};

type Palette = { primary: string; secondary: string; glow: string };

const paletteMap: Record<OgAccent, Palette> = {
  amber: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  cyan: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  rose: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  mist: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  emerald: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  sky: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  violet: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  lime: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  teal: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  indigo: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  fuchsia: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  pink: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  orange: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  red: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  yellow: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  blue: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  slate: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  stone: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  zinc: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  neutral: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  purple: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  green: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
  indigoDeep: { primary: "#bd4a32", secondary: "#9d3c2a", glow: "#bd4a32" },
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const wrapText = (value: string, maxChars: number, maxLines: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxChars));
      current = word.slice(maxChars);
    }

    if (lines.length === maxLines) {
      return lines.slice(0, maxLines).map((line, index) =>
        index === maxLines - 1 ? `${line.replace(/\s+$/, "")}...` : line
      );
    }
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).map((line, index) =>
      index === maxLines - 1 ? `${line.replace(/\s+$/, "")}...` : line
    );
  }

  return lines;
};

export const renderOgSvg = ({
  title,
  description,
  eyebrow = "Nearbycoder",
  tags = [],
  accent = "cyan",
  footer,
  artSeed,
}: OgInput) => {
  const palette = paletteMap[accent] ?? paletteMap.cyan;
  const artwork = encodeURIComponent(
    renderCardArtSvg({
      slug: artSeed ?? `${title}-${tags.join("-") || "article"}`,
      tags,
      accent,
      width: 1200,
      height: 630,
    })
  );
  const titleLines = wrapText(title, 32, 2);
  const descriptionLines = wrapText(description, 60, 3);
  const tagsLine = tags.slice(0, 4).map((tag) => tag.toUpperCase()).join(" | ");

  const titleY = 250;
  const titleLineHeight = 64;
  const descriptionY = titleY + titleLines.length * titleLineHeight + 12;
  const descriptionLineHeight = 36;
  const tagsY = descriptionY + descriptionLines.length * descriptionLineHeight + 40;

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="artClip"><rect x="780" y="0" width="420" height="630" /></clipPath>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" stroke="#20211f" stroke-opacity="0.06" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#e9e4da" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <image href="data:image/svg+xml;utf8,${artwork}" width="1200" height="630" preserveAspectRatio="xMidYMid slice" clip-path="url(#artClip)" />
  <rect x="0" y="0" width="16" height="630" fill="${palette.primary}" />
  <line x1="60" y1="60" x2="1140" y2="60" stroke="#20211f" stroke-width="2" />
  <line x1="60" y1="570" x2="1140" y2="570" stroke="#20211f" stroke-width="2" />
  <circle cx="1110" cy="100" r="20" fill="none" stroke="#f4f0e7" stroke-width="2" />

  <text x="72" y="110" fill="${palette.primary}" font-family="Space Grotesk, Arial, sans-serif" font-size="16" letter-spacing="3" font-weight="700">
    ${escapeHtml(eyebrow.toUpperCase())}
  </text>

  <text x="72" y="${titleY}" fill="#20211f" font-family="Instrument Serif, Georgia, serif" font-size="64" font-weight="400">
    ${titleLines
      .map((line, index) => {
        const y = titleY + index * titleLineHeight;
        return `<tspan x="72" y="${y}">${escapeHtml(line)}</tspan>`;
      })
      .join("")}
  </text>

  <text x="72" y="${descriptionY}" fill="#65655e" font-family="Space Grotesk, Arial, sans-serif" font-size="23" font-weight="400">
    ${descriptionLines
      .map((line, index) => {
        const y = descriptionY + index * descriptionLineHeight;
        return `<tspan x="72" y="${y}">${escapeHtml(line)}</tspan>`;
      })
      .join("")}
  </text>

  ${
    tagsLine
      ? `<text x="72" y="${tagsY}" fill="#bd4a32" font-family="Space Grotesk, Arial, sans-serif" font-size="16" letter-spacing="2" font-weight="700">${escapeHtml(
          tagsLine
        )}</text>`
      : ""
  }
  ${
    footer
      ? `<text x="72" y="540" fill="#65655e" font-family="Space Grotesk, Arial, sans-serif" font-size="15" letter-spacing="2" font-weight="600">${escapeHtml(
          footer
        )}</text>`
      : ""
  }
</svg>
`;

  return svg.trim();
};
