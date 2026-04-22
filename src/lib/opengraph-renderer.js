import React from "react";

const INK = "#0a0a0a";
const CREAM = "#f4f0e8";

// Accent palette — must stay in sync with the client-side accent rotation
// in BaseLayout.astro. Each entry has a saturated (light) tone used on
// cream and a brighter (dark) tone used on ink.
const ACCENTS = [
  { light: "#7c3aed", dark: "#a78bfa" }, // purple
  { light: "#2563eb", dark: "#60a5fa" }, // blue
  { light: "#db2777", dark: "#f472b6" }, // pink
  { light: "#ea580c", dark: "#fb923c" }, // orange
  { light: "#65a30d", dark: "#a3e635" }, // lime
  { light: "#dc2626", dark: "#f87171" }, // red
  { light: "#ca8a04", dark: "#facc15" }, // yellow
  { light: "#0891b2", dark: "#22d3ee" }, // cyan
  { light: "#a16207", dark: "#fde047" }, // gold
  { light: "#16a34a", dark: "#4ade80" }, // green
];

const SECTION_THEME = {
  article: { eyebrow: "§ Article" },
  project: { eyebrow: "§ Project" },
  layoff: { eyebrow: "§ Layoff Log" },
  page: { eyebrow: "§ Nearbycoder" },
};

// The structural variant controls which areas are ink/cream/accent.
// `accent` is injected per-page from ACCENTS based on the pathname hash.
const PALETTE_VARIANTS = [
  (accent) => ({ bg: CREAM, fg: INK, accent: accent.light, panelBg: INK, panelFg: CREAM, panelAccent: accent.dark }),
  (accent) => ({ bg: CREAM, fg: INK, accent: accent.light, panelBg: accent.light, panelFg: CREAM, panelAccent: INK }),
  (accent) => ({ bg: INK, fg: CREAM, accent: accent.dark, panelBg: CREAM, panelFg: INK, panelAccent: accent.light }),
  (accent) => ({ bg: CREAM, fg: INK, accent: accent.light, panelBg: CREAM, panelFg: INK, panelAccent: accent.light }),
];

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) return value ?? "";
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizePathname(pathname) {
  if (!pathname) return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function getTheme(pathname) {
  if (pathname.startsWith("/articles/")) return SECTION_THEME.article;
  if (pathname.startsWith("/projects/")) return SECTION_THEME.project;
  if (pathname.startsWith("/layoff/")) return SECTION_THEME.layoff;
  return SECTION_THEME.page;
}

function getUrlLabel(pathname) {
  if (pathname === "/") return "nearbycoder.com";
  return truncate(`nearbycoder.com${pathname.replace(/\/$/, "")}`, 52);
}

function getDisplayTitle(rawTitle, pathname) {
  if (pathname === "/") return "Josh Hamilton / Nearbycoder";
  const base = rawTitle.split(" · ")[0].trim();
  return truncate(base || rawTitle, 72);
}

function getTitleSize(displayTitle) {
  if (displayTitle.length <= 24) return 100;
  if (displayTitle.length <= 40) return 82;
  if (displayTitle.length <= 56) return 68;
  if (displayTitle.length <= 72) return 58;
  return 50;
}

// ---------- Motif panels (right-side decorations) ----------

const h = React.createElement;

function motifStripes(rng, variant, panelW, panelH) {
  const count = 7;
  const items = [];
  for (let i = 0; i < count * 2; i += 1) {
    const isAccent = i % 2 === 0;
    items.push(
      h("div", {
        key: `s${i}`,
        style: {
          position: "absolute",
          top: -panelH * 0.5,
          left: i * (panelW / count) * 0.9 - panelW * 0.2,
          width: (panelW / count) * 0.6,
          height: panelH * 2,
          backgroundColor: isAccent ? variant.panelAccent : variant.panelFg,
          transform: "rotate(-25deg)",
          transformOrigin: "center",
        },
      })
    );
  }
  return items;
}

function motifGrid(rng, variant, panelW, panelH) {
  const cols = 4;
  const rows = 5;
  const cellW = panelW / cols;
  const cellH = panelH / rows;
  const items = [];
  const accentCount = 4;
  const accentSet = new Set();
  while (accentSet.size < accentCount) accentSet.add(Math.floor(rng() * cols * rows));
  for (let i = 0; i < cols * rows; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const isAccent = accentSet.has(i);
    items.push(
      h("div", {
        key: `g${i}`,
        style: {
          position: "absolute",
          left: col * cellW + cellW * 0.1,
          top: row * cellH + cellH * 0.1,
          width: cellW * 0.8,
          height: cellH * 0.8,
          backgroundColor: isAccent ? variant.panelAccent : variant.panelFg,
        },
      })
    );
  }
  return items;
}

function motifHalftone(rng, variant, panelW, panelH) {
  const cols = 10;
  const rows = 12;
  const cellW = panelW / cols;
  const cellH = panelH / rows;
  const items = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const progress = c / cols;
      const maxR = Math.min(cellW, cellH) * 0.45;
      const radius = Math.max(2, maxR * (0.15 + progress * 0.9));
      const isAccent = progress > 0.65 && rng() > 0.6;
      items.push(
        h("div", {
          key: `h${r}-${c}`,
          style: {
            position: "absolute",
            left: c * cellW + cellW / 2 - radius,
            top: r * cellH + cellH / 2 - radius,
            width: radius * 2,
            height: radius * 2,
            backgroundColor: isAccent ? variant.panelAccent : variant.panelFg,
            borderRadius: "50%",
          },
        })
      );
    }
  }
  return items;
}

function motifBars(rng, variant, panelW, panelH) {
  const count = 5;
  const pad = panelW * 0.1;
  const areaW = panelW - pad * 2;
  const barW = (areaW / count) * 0.7;
  const gap = (areaW - barW * count) / (count - 1);
  const baseY = panelH * 0.88;
  const maxBarH = panelH * 0.72;
  const accentIdx = Math.floor(rng() * count);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const barH = maxBarH * (0.25 + rng() * 0.75);
    items.push(
      h("div", {
        key: `b${i}`,
        style: {
          position: "absolute",
          left: pad + i * (barW + gap),
          top: baseY - barH,
          width: barW,
          height: barH,
          backgroundColor: i === accentIdx ? variant.panelAccent : variant.panelFg,
        },
      })
    );
  }
  items.push(
    h("div", {
      key: "baseline",
      style: {
        position: "absolute",
        left: pad,
        top: baseY,
        width: areaW,
        height: 6,
        backgroundColor: variant.panelFg,
      },
    })
  );
  return items;
}

function motifChecker(rng, variant, panelW, panelH) {
  const cols = 6;
  const rows = 7;
  const cellW = panelW / cols;
  const cellH = panelH / rows;
  const items = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if ((r + c) % 2 === 0) continue;
      const isAccent = rng() > 0.78;
      items.push(
        h("div", {
          key: `c${r}-${c}`,
          style: {
            position: "absolute",
            left: c * cellW,
            top: r * cellH,
            width: cellW,
            height: cellH,
            backgroundColor: isAccent ? variant.panelAccent : variant.panelFg,
          },
        })
      );
    }
  }
  return items;
}

function motifBigMark(rng, variant, panelW, panelH) {
  const symbols = ["§", "◼", "●", "▲", "◆", "+", "×", "★"];
  const sym = symbols[Math.floor(rng() * symbols.length)];
  const num = String(Math.floor(rng() * 99)).padStart(2, "0");
  return [
    h("div", {
      key: "num",
      style: {
        position: "absolute",
        left: panelW * 0.08,
        top: panelH * 0.1,
        fontSize: panelH * 0.45,
        fontWeight: 700,
        color: variant.panelFg,
        fontFamily: "Space Grotesk",
        lineHeight: 1,
        letterSpacing: -4,
      },
      children: num,
    }),
    h("div", {
      key: "sym",
      style: {
        position: "absolute",
        left: panelW * 0.15,
        top: panelH * 0.4,
        fontSize: panelH * 0.55,
        fontWeight: 700,
        color: variant.panelAccent,
        fontFamily: "Space Grotesk",
        lineHeight: 1,
      },
      children: sym,
    }),
  ];
}

function motifScanlines(rng, variant, panelW, panelH) {
  const count = 14;
  const thick = (panelH / count) * 0.45;
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const y = (panelH / count) * i;
    const color = i % 4 === 0 ? variant.panelAccent : variant.panelFg;
    items.push(
      h("div", {
        key: `sl${i}`,
        style: {
          position: "absolute",
          left: 0,
          top: y,
          width: panelW,
          height: thick,
          backgroundColor: color,
        },
      })
    );
  }
  // central bar
  items.push(
    h("div", {
      key: "center",
      style: {
        position: "absolute",
        left: 0,
        top: panelH * (0.3 + rng() * 0.4),
        width: panelW,
        height: panelH * 0.08,
        backgroundColor: variant.panelAccent,
      },
    })
  );
  return items;
}

const MOTIFS = [motifStripes, motifGrid, motifHalftone, motifBars, motifChecker, motifBigMark, motifScanlines];

// ---------- Main renderer ----------

export async function renderNearbycoderOg({ title, description, pathname }) {
  const normalizedPath = normalizePathname(pathname);
  const theme = getTheme(normalizedPath);
  const safeTitle = getDisplayTitle(title, normalizedPath);
  const safeDescription = truncate(description ?? "", 130);
  const urlLabel = getUrlLabel(normalizedPath);
  const titleSize = getTitleSize(safeTitle);

  const seed = hashString(normalizedPath);
  const rng = createRng(seed);
  const accent = ACCENTS[Math.floor(rng() * ACCENTS.length)];
  const variantFn = PALETTE_VARIANTS[Math.floor(rng() * PALETTE_VARIANTS.length)];
  const variant = variantFn(accent);
  const motifFn = MOTIFS[Math.floor(rng() * MOTIFS.length)];

  const WIDTH = 1200;
  const HEIGHT = 630;
  const BORDER = 14;
  const PANEL_W = 420;
  const PANEL_H = HEIGHT - BORDER * 2;
  const TEXT_W = WIDTH - BORDER * 2 - PANEL_W;

  return h("div", {
    style: {
      height: "100%",
      width: "100%",
      display: "flex",
      position: "relative",
      backgroundColor: variant.bg,
      color: variant.fg,
      fontFamily: "Space Grotesk",
      overflow: "hidden",
    },
    children: [
      // outer border
      h("div", {
        key: "outer-border",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `${BORDER}px solid ${variant.fg}`,
          display: "flex",
        },
      }),
      // Text column (left)
      h("div", {
        key: "text-col",
        style: {
          position: "absolute",
          top: BORDER,
          left: BORDER,
          width: TEXT_W,
          height: PANEL_H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          color: variant.fg,
        },
        children: [
          h("div", {
            key: "top",
            style: { display: "flex", flexDirection: "column", gap: 18 },
            children: [
              h("div", {
                key: "eyebrow",
                style: {
                  fontSize: 22,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: variant.fg,
                  fontWeight: 700,
                  borderBottom: `4px solid ${variant.fg}`,
                  paddingBottom: 8,
                  alignSelf: "flex-start",
                },
                children: theme.eyebrow,
              }),
            ],
          }),
          h("div", {
            key: "middle",
            style: { display: "flex", flexDirection: "column", gap: 22 },
            children: [
              h("div", {
                key: "title",
                style: {
                  fontSize: titleSize,
                  lineHeight: 0.98,
                  fontWeight: 700,
                  color: variant.fg,
                  letterSpacing: -3,
                  maxWidth: "100%",
                  display: "flex",
                },
                children: safeTitle,
              }),
              h("div", {
                key: "desc",
                style: {
                  fontSize: 26,
                  lineHeight: 1.28,
                  color: variant.fg,
                  maxWidth: "92%",
                  fontWeight: 500,
                  display: "flex",
                },
                children:
                  safeDescription ||
                  "Member of Technical Staff · writing through layoffs, building, and adaptation.",
              }),
            ],
          }),
          h("div", {
            key: "footer",
            style: {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `4px solid ${variant.fg}`,
              paddingTop: 20,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: variant.fg,
            },
            children: [
              h("div", {
                key: "brand",
                style: { display: "flex", gap: 14, alignItems: "center" },
                children: [
                  h("span", {
                    key: "mark",
                    style: {
                      backgroundColor: variant.accent,
                      color: variant.bg,
                      padding: "6px 12px",
                      fontWeight: 700,
                      fontSize: 22,
                      border: `3px solid ${variant.fg}`,
                    },
                    children: "JH",
                  }),
                  h("span", {
                    key: "name",
                    style: { color: variant.fg, fontWeight: 700, fontSize: 22 },
                    children: "@nearbycoder",
                  }),
                ],
              }),
              h("div", {
                key: "url",
                style: {
                  color: variant.fg,
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: "none",
                },
                children: urlLabel,
              }),
            ],
          }),
        ],
      }),
      // Motif panel (right)
      h("div", {
        key: "panel",
        style: {
          position: "absolute",
          top: BORDER,
          left: BORDER + TEXT_W,
          width: PANEL_W,
          height: PANEL_H,
          backgroundColor: variant.panelBg,
          borderLeft: `4px solid ${variant.fg}`,
          display: "flex",
          overflow: "hidden",
        },
        children: motifFn(rng, variant, PANEL_W, PANEL_H),
      }),
    ],
  });
}
