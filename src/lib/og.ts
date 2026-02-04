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
};

type Palette = { primary: string; secondary: string; glow: string };

const paletteMap: Record<OgAccent, Palette> = {
  amber: { primary: "#fbbf24", secondary: "#f59e0b", glow: "#fbbf24" },
  cyan: { primary: "#67e8f9", secondary: "#22d3ee", glow: "#22d3ee" },
  rose: { primary: "#fb7185", secondary: "#f43f5e", glow: "#fb7185" },
  mist: { primary: "#e2e8f0", secondary: "#94a3b8", glow: "#e2e8f0" },
  emerald: { primary: "#6ee7b7", secondary: "#10b981", glow: "#34d399" },
  sky: { primary: "#7dd3fc", secondary: "#38bdf8", glow: "#7dd3fc" },
  violet: { primary: "#c4b5fd", secondary: "#8b5cf6", glow: "#c4b5fd" },
  lime: { primary: "#bef264", secondary: "#84cc16", glow: "#bef264" },
  teal: { primary: "#5eead4", secondary: "#14b8a6", glow: "#5eead4" },
  indigo: { primary: "#a5b4fc", secondary: "#6366f1", glow: "#a5b4fc" },
  fuchsia: { primary: "#f0abfc", secondary: "#d946ef", glow: "#f0abfc" },
  pink: { primary: "#f9a8d4", secondary: "#ec4899", glow: "#f9a8d4" },
  orange: { primary: "#fdba74", secondary: "#f97316", glow: "#fdba74" },
  red: { primary: "#fca5a5", secondary: "#ef4444", glow: "#fca5a5" },
  yellow: { primary: "#fde047", secondary: "#eab308", glow: "#fde047" },
  blue: { primary: "#93c5fd", secondary: "#3b82f6", glow: "#93c5fd" },
  slate: { primary: "#cbd5f5", secondary: "#64748b", glow: "#cbd5f5" },
  stone: { primary: "#d6d3d1", secondary: "#78716c", glow: "#d6d3d1" },
  zinc: { primary: "#d4d4d8", secondary: "#71717a", glow: "#d4d4d8" },
  neutral: { primary: "#e5e5e5", secondary: "#737373", glow: "#e5e5e5" },
  purple: { primary: "#d8b4fe", secondary: "#a855f7", glow: "#d8b4fe" },
  green: { primary: "#86efac", secondary: "#22c55e", glow: "#86efac" },
  indigoDeep: { primary: "#818cf8", secondary: "#4f46e5", glow: "#818cf8" },
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
}: OgInput) => {
  const palette = paletteMap[accent] ?? paletteMap.cyan;
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
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.5" />
      <stop offset="60%" stop-color="${palette.secondary}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0b0f14" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.2" r="0.65">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.35" />
      <stop offset="65%" stop-color="#0b0f14" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0b0f14" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect x="60" y="60" width="1080" height="510" rx="40" fill="#0f141b" stroke="#232b36" stroke-width="2" />
  <rect x="60" y="60" width="1080" height="510" rx="40" fill="url(#accent)" />

  <text x="120" y="170" fill="#9aa4b2" font-family="Space Grotesk, Arial, sans-serif" font-size="18" letter-spacing="6" font-weight="600">
    ${escapeHtml(eyebrow.toUpperCase())}
  </text>

  <text x="120" y="${titleY}" fill="#f8fafc" font-family="Space Grotesk, Arial, sans-serif" font-size="56" font-weight="700">
    ${titleLines
      .map((line, index) => {
        const y = titleY + index * titleLineHeight;
        return `<tspan x="120" y="${y}">${escapeHtml(line)}</tspan>`;
      })
      .join("")}
  </text>

  <text x="120" y="${descriptionY}" fill="#cbd5f5" font-family="Space Grotesk, Arial, sans-serif" font-size="26" font-weight="400">
    ${descriptionLines
      .map((line, index) => {
        const y = descriptionY + index * descriptionLineHeight;
        return `<tspan x="120" y="${y}">${escapeHtml(line)}</tspan>`;
      })
      .join("")}
  </text>

  ${
    tagsLine
      ? `<text x="120" y="${tagsY}" fill="#94a3b8" font-family="Space Grotesk, Arial, sans-serif" font-size="18" letter-spacing="2" font-weight="600">${escapeHtml(
          tagsLine
        )}</text>`
      : ""
  }
  ${
    footer
      ? `<text x="120" y="520" fill="#7c8aa1" font-family="Space Grotesk, Arial, sans-serif" font-size="16" letter-spacing="1" font-weight="500">${escapeHtml(
          footer
        )}</text>`
      : ""
  }
</svg>
`;

  return svg.trim();
};
