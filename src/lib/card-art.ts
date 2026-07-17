export type CardAccent =
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

type Motif =
  | "stripes"
  | "halftone"
  | "grid"
  | "target"
  | "arrow"
  | "rings"
  | "checker"
  | "bars"
  | "burst"
  | "mono"
  | "barcode"
  | "corners"
  | "coordinates"
  | "nested"
  | "dashed"
  | "zigzag"
  | "iso"
  | "letter"
  | "dotline"
  | "bigX"
  | "diamond"
  | "tags"
  | "scanlines"
  | "stamp";

type Palette = {
  bg: string;
  fg: string;
  accent: string;
  /** a second non-bg color that's rarely used for subtle contrast */
  secondary: string;
};

const INK = "#17140e";
const PAPER = "#f5f1e6";
const BLUE_PAPER = "#e4dec9";
// Accent colors use CSS variable references so the SVG picks up the
// page's rotating accent when inlined. External /card-art/*.svg loads
// fall back to the hex literal.
const ACCENT = "var(--accent-light, #2743d9)";
const ACCENT_DARK = "var(--accent-dark, #4f66f0)";
const ACCENT_2 = "var(--accent-2, #2743d9)";
const ACCENT_3 = "var(--accent-3, #17140e)";

const palettes: Palette[] = [
  { bg: INK, fg: PAPER, accent: ACCENT_DARK, secondary: "#2e2a1d" },
  { bg: PAPER, fg: INK, accent: ACCENT, secondary: "#ddd6c0" },
  { bg: ACCENT_2, fg: PAPER, accent: INK, secondary: "#1d2f9e" },
  { bg: BLUE_PAPER, fg: INK, accent: ACCENT, secondary: "#d0c8ad" },
  { bg: ACCENT, fg: PAPER, accent: INK, secondary: "#1d2f9e" },
];

const allMotifs: Motif[] = [
  "stripes", "halftone", "grid", "target", "arrow", "rings", "checker",
  "bars", "burst", "mono", "barcode", "corners", "coordinates", "nested",
  "dashed", "zigzag", "iso", "letter", "dotline", "bigX", "diamond",
  "tags", "scanlines", "stamp",
];

const hashString = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const fmt = (value: number) => value.toFixed(2);

// ---------- Motif renderers ----------

const renderStripes = (rng: () => number, palette: Palette, w: number, h: number) => {
  const count = 6 + Math.floor(rng() * 6);
  const angles = [-45, -30, 30, 45, 60, -60, 0, 90];
  const angle = angles[Math.floor(rng() * angles.length)];
  const stripeW = (w * 2) / count;
  const elements: string[] = [];
  for (let i = -2; i < count + 2; i += 1) {
    const x = i * stripeW - w * 0.3;
    const useAccent = i % 2 === 0;
    if (!useAccent && rng() > 0.7) continue;
    const color = useAccent ? palette.accent : palette.fg;
    elements.push(
      `<rect x="${fmt(x)}" y="${fmt(-h * 0.5)}" width="${fmt(stripeW * (useAccent ? 1 : 0.3 + rng() * 0.4))}" height="${fmt(h * 2)}" fill="${color}" transform="rotate(${angle} ${fmt(w / 2)} ${fmt(h / 2)})" />`
    );
  }
  return elements.join("");
};

const renderHalftone = (rng: () => number, palette: Palette, w: number, h: number) => {
  const cols = 14 + Math.floor(rng() * 8);
  const rows = 8 + Math.floor(rng() * 4);
  const cellW = w / cols;
  const cellH = h / rows;
  const mode = Math.floor(rng() * 4); // 0: l-r, 1: r-l, 2: center-out, 3: t-b
  const circles: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      let progress: number;
      if (mode === 0) progress = col / cols;
      else if (mode === 1) progress = 1 - col / cols;
      else if (mode === 2) {
        const dx = (col - cols / 2) / cols;
        const dy = (row - rows / 2) / rows;
        progress = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
      }
      else progress = row / rows;
      const radius = Math.max(0.5, (Math.min(cellW, cellH) / 2) * (0.1 + progress * 0.85));
      const cx = col * cellW + cellW / 2;
      const cy = row * cellH + cellH / 2;
      const useAccent = progress > 0.55 && rng() > 0.6;
      circles.push(
        `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="${useAccent ? palette.accent : palette.fg}" />`
      );
    }
  }
  return circles.join("");
};

const renderGrid = (rng: () => number, palette: Palette, w: number, h: number) => {
  const cols = 4 + Math.floor(rng() * 4);
  const rows = 3 + Math.floor(rng() * 3);
  const pad = w * 0.06;
  const cellW = (w - pad * 2) / cols;
  const cellH = (h - pad * 2) / rows;
  const gap = Math.min(cellW, cellH) * (0.08 + rng() * 0.12);
  const accentCount = 2 + Math.floor(rng() * 4);
  const accentCells = new Set<number>();
  while (accentCells.size < accentCount) {
    accentCells.add(Math.floor(rng() * cols * rows));
  }
  const rects: string[] = [];
  for (let i = 0; i < cols * rows; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * cellW + gap / 2;
    const y = pad + row * cellH + gap / 2;
    const isAccent = accentCells.has(i);
    const color = isAccent ? palette.accent : palette.fg;
    rects.push(
      `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(cellW - gap)}" height="${fmt(cellH - gap)}" fill="${color}" />`
    );
  }
  return rects.join("");
};

const renderTarget = (rng: () => number, palette: Palette, w: number, h: number) => {
  const offsetX = w * (0.35 + rng() * 0.3);
  const offsetY = h * (0.35 + rng() * 0.3);
  const maxR = Math.min(w, h) * (0.45 + rng() * 0.15);
  const rings = 4 + Math.floor(rng() * 3);
  const elements: string[] = [];
  for (let i = rings; i >= 0; i -= 1) {
    const r = (maxR / rings) * i;
    const color = i % 2 === 0 ? palette.fg : palette.accent;
    elements.push(`<circle cx="${fmt(offsetX)}" cy="${fmt(offsetY)}" r="${fmt(r)}" fill="${color}" />`);
  }
  const stroke = Math.max(4, w * 0.005);
  elements.push(
    `<line x1="${fmt(offsetX)}" y1="0" x2="${fmt(offsetX)}" y2="${fmt(h)}" stroke="${palette.bg}" stroke-width="${fmt(stroke)}" />`,
    `<line x1="0" y1="${fmt(offsetY)}" x2="${fmt(w)}" y2="${fmt(offsetY)}" stroke="${palette.bg}" stroke-width="${fmt(stroke)}" />`
  );
  return elements.join("");
};

const renderArrow = (rng: () => number, palette: Palette, w: number, h: number) => {
  const orient = Math.floor(rng() * 4); // 0 right, 1 left, 2 up, 3 down
  const shaftW = (orient < 2 ? w : h) * 0.55;
  const shaftH = (orient < 2 ? h : w) * 0.2;
  let elements = "";

  const makeHoriz = (dir: number) => {
    const sx = dir > 0 ? w * 0.1 : w * 0.35;
    const sy = h / 2 - shaftH / 2;
    const tipX = dir > 0 ? sx + shaftW : sx;
    const tipSize = h * 0.42;
    const pts = dir > 0
      ? `${fmt(tipX)},${fmt(h / 2 - tipSize)} ${fmt(tipX + tipSize * 0.9)},${fmt(h / 2)} ${fmt(tipX)},${fmt(h / 2 + tipSize)}`
      : `${fmt(tipX)},${fmt(h / 2 - tipSize)} ${fmt(tipX - tipSize * 0.9)},${fmt(h / 2)} ${fmt(tipX)},${fmt(h / 2 + tipSize)}`;
    return `
      <rect x="${fmt(sx)}" y="${fmt(sy)}" width="${fmt(shaftW)}" height="${fmt(shaftH)}" fill="${palette.fg}" />
      <polygon points="${pts}" fill="${palette.accent}" />`;
  };

  const makeVert = (dir: number) => {
    const sx = w / 2 - shaftH / 2;
    const sy = dir > 0 ? h * 0.25 : h * 0.15;
    const tipY = dir > 0 ? sy + shaftW : sy;
    const tipSize = w * 0.32;
    const pts = dir > 0
      ? `${fmt(w / 2 - tipSize)},${fmt(tipY)} ${fmt(w / 2)},${fmt(tipY + tipSize * 0.9)} ${fmt(w / 2 + tipSize)},${fmt(tipY)}`
      : `${fmt(w / 2 - tipSize)},${fmt(tipY)} ${fmt(w / 2)},${fmt(tipY - tipSize * 0.9)} ${fmt(w / 2 + tipSize)},${fmt(tipY)}`;
    return `
      <rect x="${fmt(sx)}" y="${fmt(sy)}" width="${fmt(shaftH)}" height="${fmt(shaftW)}" fill="${palette.fg}" />
      <polygon points="${pts}" fill="${palette.accent}" />`;
  };

  if (orient === 0) elements = makeHoriz(1);
  else if (orient === 1) elements = makeHoriz(-1);
  else if (orient === 2) elements = makeVert(-1);
  else elements = makeVert(1);
  return elements;
};

const renderRings = (rng: () => number, palette: Palette, w: number, h: number) => {
  const elements: string[] = [];
  const concentric = rng() > 0.5;
  if (concentric) {
    const cx = w * (0.3 + rng() * 0.4);
    const cy = h * (0.3 + rng() * 0.4);
    const rings = 4 + Math.floor(rng() * 4);
    for (let i = 0; i < rings; i += 1) {
      const r = Math.min(w, h) * (0.06 + i * 0.08);
      const stroke = Math.max(3, w * 0.007);
      const color = i % 2 === 0 ? palette.fg : palette.accent;
      elements.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="${color}" stroke-width="${fmt(stroke)}" />`);
    }
  } else {
    const count = 4 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i += 1) {
      const cx = w * (0.1 + rng() * 0.8);
      const cy = h * (0.1 + rng() * 0.8);
      const r = Math.min(w, h) * (0.08 + rng() * 0.22);
      const stroke = Math.max(4, w * 0.008);
      const color = rng() > 0.3 ? palette.fg : palette.accent;
      const filled = rng() > 0.75;
      if (filled) {
        elements.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="${color}" />`);
      } else {
        elements.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="${color}" stroke-width="${fmt(stroke)}" />`);
      }
    }
  }
  return elements.join("");
};

const renderChecker = (rng: () => number, palette: Palette, w: number, h: number) => {
  const cols = 6 + Math.floor(rng() * 4);
  const rows = 4 + Math.floor(rng() * 2);
  const cellW = w / cols;
  const cellH = h / rows;
  const rects: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if ((row + col) % 2 === 0) continue;
      const x = col * cellW;
      const y = row * cellH;
      const isAccent = rng() > 0.75;
      rects.push(
        `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(cellW)}" height="${fmt(cellH)}" fill="${isAccent ? palette.accent : palette.fg}" />`
      );
    }
  }
  return rects.join("");
};

const renderBars = (rng: () => number, palette: Palette, w: number, h: number) => {
  const count = 5 + Math.floor(rng() * 6);
  const pad = w * 0.08;
  const areaW = w - pad * 2;
  const barW = (areaW / count) * 0.7;
  const gap = (areaW - barW * count) / (count - 1);
  const baseY = h * 0.88;
  const maxBarH = h * 0.72;
  const accentIdx = Math.floor(rng() * count);
  const bars: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const barH = maxBarH * (0.2 + rng() * 0.8);
    const x = pad + i * (barW + gap);
    const y = baseY - barH;
    bars.push(
      `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(barW)}" height="${fmt(barH)}" fill="${i === accentIdx ? palette.accent : palette.fg}" />`
    );
  }
  bars.push(
    `<line x1="${fmt(pad)}" y1="${fmt(baseY)}" x2="${fmt(pad + areaW)}" y2="${fmt(baseY)}" stroke="${palette.fg}" stroke-width="${fmt(Math.max(4, w * 0.006))}" />`
  );
  return bars.join("");
};

const renderBurst = (rng: () => number, palette: Palette, w: number, h: number) => {
  const corners = [[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]];
  const [cx, cy] = corners[Math.floor(rng() * corners.length)];
  const rays = 14 + Math.floor(rng() * 8);
  const maxLen = Math.sqrt(w * w + h * h) * 1.2;
  const lines: string[] = [];
  const startAngle = rng() * Math.PI;
  const spread = cx === w / 2 && cy === h / 2 ? Math.PI * 2 : Math.PI;
  for (let i = 0; i < rays; i += 1) {
    const angle = startAngle + (spread * i) / rays;
    const x2 = cx + Math.cos(angle) * maxLen;
    const y2 = cy + Math.sin(angle) * maxLen;
    const isAccent = i % 3 === 0;
    const strokeW = isAccent ? w * 0.014 : w * 0.006;
    lines.push(
      `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${isAccent ? palette.accent : palette.fg}" stroke-width="${fmt(strokeW)}" />`
    );
  }
  return lines.join("");
};

const renderMono = (rng: () => number, palette: Palette, w: number, h: number) => {
  const symbols = ["A", "R", "C", "H", "01", "//", "×", "+", "#", "[ ]", "::"];
  const char = symbols[Math.floor(rng() * symbols.length)];
  const num = String(Math.floor(rng() * 99)).padStart(2, "0");
  return `
    <text x="${fmt(w * 0.08)}" y="${fmt(h * 0.85)}" font-family="Instrument Serif, Georgia, serif" font-weight="400" font-size="${fmt(h * 0.85)}" fill="${palette.fg}" letter-spacing="0">${num}</text>
    <text x="${fmt(w * 0.68)}" y="${fmt(h * 0.88)}" font-family="Instrument Serif, Georgia, serif" font-weight="400" font-size="${fmt(h * 0.82)}" fill="${palette.accent}">${char}</text>
  `;
};

const renderBarcode = (rng: () => number, palette: Palette, w: number, h: number) => {
  const pad = w * 0.06;
  const area = w - pad * 2;
  const lines: string[] = [];
  let x = pad;
  while (x < w - pad) {
    const barW = area * (0.005 + rng() * 0.025);
    const gap = area * (0.004 + rng() * 0.014);
    const isAccent = rng() > 0.82;
    const topPad = h * (0.08 + rng() * 0.08);
    const bottomPad = h * (0.08 + rng() * 0.08);
    lines.push(
      `<rect x="${fmt(x)}" y="${fmt(topPad)}" width="${fmt(barW)}" height="${fmt(h - topPad - bottomPad)}" fill="${isAccent ? palette.accent : palette.fg}" />`
    );
    x += barW + gap;
  }
  return lines.join("");
};

const renderCorners = (rng: () => number, palette: Palette, w: number, h: number) => {
  const size = Math.min(w, h) * (0.25 + rng() * 0.15);
  const thick = Math.max(8, w * 0.015);
  const c = palette.fg;
  const a = palette.accent;
  const corners = [
    { x: 0, y: 0, hx: size, hy: thick, vx: thick, vy: size, c: c },
    { x: w - size, y: 0, hx: size, hy: thick, vx: w - thick, vy: size, c: rng() > 0.5 ? a : c },
    { x: 0, y: h - thick, hx: size, hy: thick, vx: thick, vy: h - size, c: rng() > 0.5 ? a : c },
    { x: w - size, y: h - thick, hx: size, hy: thick, vx: w - thick, vy: h - size, c: c },
  ];
  const parts: string[] = [];
  for (const k of corners) {
    parts.push(
      `<rect x="${fmt(k.x)}" y="${fmt(k.y)}" width="${fmt(k.hx)}" height="${fmt(k.hy)}" fill="${k.c}" />`,
      `<rect x="${fmt(k.vx)}" y="${fmt(k.vy - (k.vy === 0 ? 0 : (k.vy === h - size ? 0 : 0)))}" width="${fmt(thick)}" height="${fmt(size)}" fill="${k.c}" />`
    );
  }
  // center mark
  const cx = w / 2;
  const cy = h / 2;
  const markSize = Math.min(w, h) * 0.08;
  parts.push(
    `<rect x="${fmt(cx - markSize / 2)}" y="${fmt(cy - thick / 2)}" width="${fmt(markSize)}" height="${fmt(thick)}" fill="${a}" />`,
    `<rect x="${fmt(cx - thick / 2)}" y="${fmt(cy - markSize / 2)}" width="${fmt(thick)}" height="${fmt(markSize)}" fill="${a}" />`
  );
  return parts.join("");
};

const renderCoordinates = (rng: () => number, palette: Palette, w: number, h: number) => {
  const parts: string[] = [];
  const margin = w * 0.08;
  const thick = Math.max(3, w * 0.004);
  // axes
  parts.push(
    `<line x1="${fmt(margin)}" y1="${fmt(h - margin)}" x2="${fmt(w - margin)}" y2="${fmt(h - margin)}" stroke="${palette.fg}" stroke-width="${fmt(thick)}" />`,
    `<line x1="${fmt(margin)}" y1="${fmt(margin)}" x2="${fmt(margin)}" y2="${fmt(h - margin)}" stroke="${palette.fg}" stroke-width="${fmt(thick)}" />`
  );
  // ticks
  const tickCount = 10;
  for (let i = 0; i <= tickCount; i += 1) {
    const x = margin + ((w - margin * 2) / tickCount) * i;
    const y = margin + ((h - margin * 2) / tickCount) * i;
    parts.push(
      `<line x1="${fmt(x)}" y1="${fmt(h - margin)}" x2="${fmt(x)}" y2="${fmt(h - margin + 14)}" stroke="${palette.fg}" stroke-width="${fmt(thick)}" />`,
      `<line x1="${fmt(margin - 14)}" y1="${fmt(y)}" x2="${fmt(margin)}" y2="${fmt(y)}" stroke="${palette.fg}" stroke-width="${fmt(thick)}" />`
    );
  }
  // plot points
  const pts = 4 + Math.floor(rng() * 4);
  const plotPts: Array<[number, number]> = [];
  for (let i = 0; i < pts; i += 1) {
    const px = margin + rng() * (w - margin * 2);
    const py = margin + rng() * (h - margin * 2);
    plotPts.push([px, py]);
  }
  // connect with lines
  for (let i = 0; i < plotPts.length - 1; i += 1) {
    parts.push(
      `<line x1="${fmt(plotPts[i][0])}" y1="${fmt(plotPts[i][1])}" x2="${fmt(plotPts[i + 1][0])}" y2="${fmt(plotPts[i + 1][1])}" stroke="${palette.accent}" stroke-width="${fmt(thick * 2)}" />`
    );
  }
  for (const [x, y] of plotPts) {
    parts.push(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(w * 0.012)}" fill="${palette.accent}" />`);
  }
  return parts.join("");
};

const renderNested = (rng: () => number, palette: Palette, w: number, h: number) => {
  const count = 5 + Math.floor(rng() * 5);
  const thick = Math.max(3, w * 0.004);
  const parts: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const inset = ((Math.min(w, h) * 0.45) / count) * i + w * 0.05;
    const color = i === 0 ? palette.accent : i % 2 === 0 ? palette.fg : palette.secondary;
    parts.push(
      `<rect x="${fmt(inset)}" y="${fmt(inset * (h / w))}" width="${fmt(w - inset * 2)}" height="${fmt(h - inset * 2 * (h / w))}" fill="none" stroke="${color}" stroke-width="${fmt(thick * (i === 0 ? 2.5 : 1))}" />`
    );
  }
  return parts.join("");
};

const renderDashed = (rng: () => number, palette: Palette, w: number, h: number) => {
  const segments = 28 + Math.floor(rng() * 12);
  const perim = 2 * (w + h);
  const step = perim / segments;
  const dashLen = step * (0.55 + rng() * 0.25);
  const thick = Math.max(6, w * 0.01);
  const parts: string[] = [];
  let d = 0;
  let index = 0;
  while (d < perim) {
    const isAccent = index % 4 === 0;
    const color = isAccent ? palette.accent : palette.fg;
    // determine which edge & draw dash
    if (d < w) {
      parts.push(`<rect x="${fmt(d)}" y="0" width="${fmt(Math.min(dashLen, w - d))}" height="${fmt(thick)}" fill="${color}" />`);
    } else if (d < w + h) {
      const y = d - w;
      parts.push(`<rect x="${fmt(w - thick)}" y="${fmt(y)}" width="${fmt(thick)}" height="${fmt(Math.min(dashLen, h - y))}" fill="${color}" />`);
    } else if (d < 2 * w + h) {
      const x = w - (d - (w + h));
      parts.push(`<rect x="${fmt(x - dashLen)}" y="${fmt(h - thick)}" width="${fmt(Math.min(dashLen, x))}" height="${fmt(thick)}" fill="${color}" />`);
    } else {
      const y = h - (d - (2 * w + h));
      parts.push(`<rect x="0" y="${fmt(y - dashLen)}" width="${fmt(thick)}" height="${fmt(Math.min(dashLen, y))}" fill="${color}" />`);
    }
    d += step;
    index += 1;
  }
  // central giant dot
  parts.push(`<circle cx="${fmt(w / 2)}" cy="${fmt(h / 2)}" r="${fmt(Math.min(w, h) * 0.12)}" fill="${palette.accent}" />`);
  return parts.join("");
};

const renderZigzag = (rng: () => number, palette: Palette, w: number, h: number) => {
  const rows = 4 + Math.floor(rng() * 4);
  const segments = 8 + Math.floor(rng() * 4);
  const thick = Math.max(3, w * 0.005);
  const parts: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    const baseY = h * (0.1 + r * (0.8 / rows));
    const amp = h * 0.04;
    const points: string[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const x = (w / segments) * i;
      const y = baseY + (i % 2 === 0 ? -amp : amp);
      points.push(`${i === 0 ? "M" : "L"} ${fmt(x)} ${fmt(y)}`);
    }
    const color = r % 2 === 0 ? palette.fg : palette.accent;
    parts.push(`<path d="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="${fmt(thick)}" />`);
  }
  return parts.join("");
};

const renderIso = (rng: () => number, palette: Palette, w: number, h: number) => {
  const size = Math.min(w, h) * 0.13;
  const cols = Math.ceil(w / (size * 1.7)) + 1;
  const rows = Math.ceil(h / (size * 0.95)) + 1;
  const parts: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (rng() > 0.55) continue;
      const cx = c * size * 1.7 + (r % 2 === 1 ? size * 0.85 : 0);
      const cy = r * size * 0.95;
      // isometric cube: three rhombi
      const topPts = `${fmt(cx)},${fmt(cy - size)} ${fmt(cx + size * 0.87)},${fmt(cy - size * 0.5)} ${fmt(cx)},${fmt(cy)} ${fmt(cx - size * 0.87)},${fmt(cy - size * 0.5)}`;
      const rightPts = `${fmt(cx)},${fmt(cy)} ${fmt(cx + size * 0.87)},${fmt(cy - size * 0.5)} ${fmt(cx + size * 0.87)},${fmt(cy + size * 0.5)} ${fmt(cx)},${fmt(cy + size)}`;
      const leftPts = `${fmt(cx)},${fmt(cy)} ${fmt(cx - size * 0.87)},${fmt(cy - size * 0.5)} ${fmt(cx - size * 0.87)},${fmt(cy + size * 0.5)} ${fmt(cx)},${fmt(cy + size)}`;
      const useAccent = rng() > 0.7;
      parts.push(
        `<polygon points="${topPts}" fill="${useAccent ? palette.accent : palette.fg}" />`,
        `<polygon points="${rightPts}" fill="${palette.secondary}" />`,
        `<polygon points="${leftPts}" fill="${palette.fg}" opacity="0.6" />`
      );
    }
  }
  return parts.join("");
};

const renderLetter = (rng: () => number, palette: Palette, w: number, h: number) => {
  const letters = ["A", "B", "E", "K", "M", "N", "Q", "R", "S", "T", "X", "Z", "&", "?", "!"];
  const char = letters[Math.floor(rng() * letters.length)];
  const size = h * 1.05;
  const x = w * (0.05 + rng() * 0.1);
  return `
    <text x="${fmt(x)}" y="${fmt(h * 0.92)}" font-family="Instrument Serif, Georgia, serif" font-weight="400" font-size="${fmt(size)}" fill="${palette.fg}" letter-spacing="0">${char}</text>
    <rect x="${fmt(w * 0.55)}" y="${fmt(h * 0.15)}" width="${fmt(w * 0.35)}" height="${fmt(h * 0.12)}" fill="${palette.accent}" />
    <rect x="${fmt(w * 0.55)}" y="${fmt(h * 0.72)}" width="${fmt(w * 0.25)}" height="${fmt(h * 0.08)}" fill="${palette.fg}" />
  `;
};

const renderDotline = (rng: () => number, palette: Palette, w: number, h: number) => {
  const rows = 5 + Math.floor(rng() * 4);
  const cols = 10 + Math.floor(rng() * 8);
  const padY = h * 0.1;
  const padX = w * 0.06;
  const spaceX = (w - padX * 2) / (cols - 1);
  const spaceY = (h - padY * 2) / (rows - 1);
  const parts: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cx = padX + c * spaceX;
      const cy = padY + r * spaceY;
      const useAccent = rng() > 0.85;
      const radius = Math.min(spaceX, spaceY) * (0.18 + rng() * 0.14);
      parts.push(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="${useAccent ? palette.accent : palette.fg}" />`);
    }
  }
  return parts.join("");
};

const renderBigX = (rng: () => number, palette: Palette, w: number, h: number) => {
  const thick = Math.min(w, h) * 0.1;
  const pad = w * 0.1;
  void rng;
  return `
    <line x1="${fmt(pad)}" y1="${fmt(pad * (h / w))}" x2="${fmt(w - pad)}" y2="${fmt(h - pad * (h / w))}" stroke="${palette.fg}" stroke-width="${fmt(thick)}" stroke-linecap="square" />
    <line x1="${fmt(w - pad)}" y1="${fmt(pad * (h / w))}" x2="${fmt(pad)}" y2="${fmt(h - pad * (h / w))}" stroke="${palette.accent}" stroke-width="${fmt(thick)}" stroke-linecap="square" />
    <circle cx="${fmt(w / 2)}" cy="${fmt(h / 2)}" r="${fmt(Math.min(w, h) * 0.1)}" fill="${palette.fg}" />
  `;
};

const renderDiamond = (rng: () => number, palette: Palette, w: number, h: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.42;
  const count = 4 + Math.floor(rng() * 3);
  const parts: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const r = (maxR / count) * (i + 1);
    const pts = `${fmt(cx)},${fmt(cy - r)} ${fmt(cx + r)},${fmt(cy)} ${fmt(cx)},${fmt(cy + r)} ${fmt(cx - r)},${fmt(cy)}`;
    const color = i % 2 === 0 ? palette.fg : palette.accent;
    parts.push(`<polygon points="${pts}" fill="${color}" />`);
  }
  return parts.join("");
};

const renderTags = (rng: () => number, palette: Palette, w: number, h: number) => {
  const tagLabels = ["INDEX", "LOG", "BETA", "DRAFT", "BUILD", "SHIP", "NOTE", "DATA", "v01", "2026", "§§", "READ"];
  const count = 4 + Math.floor(rng() * 3);
  const parts: string[] = [];
  const shuffled = [...tagLabels].sort(() => rng() - 0.5).slice(0, count);
  let y = h * 0.15;
  for (let i = 0; i < shuffled.length; i += 1) {
    const label = shuffled[i];
    const x = w * (0.08 + rng() * 0.15);
    const width = label.length * h * 0.065 + h * 0.1;
    const isAccent = i === 0;
    const height = h * 0.12;
    parts.push(
      `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" fill="${isAccent ? palette.accent : palette.bg}" stroke="${palette.fg}" stroke-width="${fmt(Math.max(3, w * 0.004))}" />`,
      `<text x="${fmt(x + height * 0.4)}" y="${fmt(y + height * 0.72)}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${fmt(height * 0.55)}" fill="${isAccent ? palette.bg : palette.fg}" letter-spacing="0">${label}</text>`
    );
    y += height + h * 0.04;
  }
  return parts.join("");
};

const renderScanlines = (rng: () => number, palette: Palette, w: number, h: number) => {
  const count = 16 + Math.floor(rng() * 14);
  const thick = h / count * 0.45;
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const y = (h / count) * i;
    const color = i % 5 === 0 ? palette.accent : palette.fg;
    parts.push(`<rect x="0" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(thick)}" fill="${color}" />`);
  }
  // a horizontal bar / marker
  const markerY = h * (0.3 + rng() * 0.4);
  parts.push(`<rect x="0" y="${fmt(markerY)}" width="${fmt(w)}" height="${fmt(h * 0.06)}" fill="${palette.accent}" />`);
  return parts.join("");
};

const renderStamp = (rng: () => number, palette: Palette, w: number, h: number) => {
  const cx = w * (0.3 + rng() * 0.4);
  const cy = h * (0.4 + rng() * 0.2);
  const r = Math.min(w, h) * 0.34;
  const thick = Math.max(6, w * 0.012);
  const words = ["ORIGINAL", "CERTIFIED", "APPROVED", "VOID", "DRAFT", "BUILD-LOG", "NEARBYCODER"];
  const word = words[Math.floor(rng() * words.length)];
  const parts: string[] = [
    `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(thick)}" />`,
    `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r * 0.78)}" fill="none" stroke="${palette.accent}" stroke-width="${fmt(thick * 0.6)}" />`,
  ];
  // middle text
  parts.push(
    `<text x="${fmt(cx)}" y="${fmt(cy + h * 0.03)}" font-family="JetBrains Mono, monospace" font-weight="800" font-size="${fmt(r * 0.5)}" fill="${palette.accent}" text-anchor="middle" letter-spacing="0">${word}</text>`,
    `<text x="${fmt(cx)}" y="${fmt(cy + r * 0.55)}" font-family="JetBrains Mono, monospace" font-weight="500" font-size="${fmt(r * 0.18)}" fill="${palette.fg}" text-anchor="middle" letter-spacing="0">${new Date().getFullYear()}</text>`
  );
  // stray slash line
  const angle = rng() * Math.PI;
  const x1 = cx + Math.cos(angle) * r * 1.3;
  const y1 = cy + Math.sin(angle) * r * 1.3;
  const x2 = cx - Math.cos(angle) * r * 1.3;
  const y2 = cy - Math.sin(angle) * r * 1.3;
  parts.push(
    `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${palette.accent}" stroke-width="${fmt(thick * 0.5)}" opacity="0.8" />`
  );
  return parts.join("");
};

const renderMotif = (motif: Motif, rng: () => number, palette: Palette, w: number, h: number) => {
  switch (motif) {
    case "stripes": return renderStripes(rng, palette, w, h);
    case "halftone": return renderHalftone(rng, palette, w, h);
    case "grid": return renderGrid(rng, palette, w, h);
    case "target": return renderTarget(rng, palette, w, h);
    case "arrow": return renderArrow(rng, palette, w, h);
    case "rings": return renderRings(rng, palette, w, h);
    case "checker": return renderChecker(rng, palette, w, h);
    case "bars": return renderBars(rng, palette, w, h);
    case "burst": return renderBurst(rng, palette, w, h);
    case "mono": return renderMono(rng, palette, w, h);
    case "barcode": return renderBarcode(rng, palette, w, h);
    case "corners": return renderCorners(rng, palette, w, h);
    case "coordinates": return renderCoordinates(rng, palette, w, h);
    case "nested": return renderNested(rng, palette, w, h);
    case "dashed": return renderDashed(rng, palette, w, h);
    case "zigzag": return renderZigzag(rng, palette, w, h);
    case "iso": return renderIso(rng, palette, w, h);
    case "letter": return renderLetter(rng, palette, w, h);
    case "dotline": return renderDotline(rng, palette, w, h);
    case "bigX": return renderBigX(rng, palette, w, h);
    case "diamond": return renderDiamond(rng, palette, w, h);
    case "tags": return renderTags(rng, palette, w, h);
    case "scanlines": return renderScanlines(rng, palette, w, h);
    case "stamp": return renderStamp(rng, palette, w, h);
  }
};

type RenderCardArtInput = {
  slug: string;
  tags?: string[];
  accent?: CardAccent;
  width?: number;
  height?: number;
};

// Motif family groups — motifs within the same group shouldn't co-occur.
const familyOf = (motif: Motif): string => {
  if (motif === "rings" || motif === "target" || motif === "diamond" || motif === "stamp") return "circular";
  if (motif === "stripes" || motif === "scanlines" || motif === "barcode") return "linear";
  if (motif === "grid" || motif === "checker" || motif === "dotline") return "grid";
  if (motif === "mono" || motif === "letter" || motif === "tags") return "type";
  if (motif === "arrow" || motif === "bigX" || motif === "burst") return "mark";
  if (motif === "corners" || motif === "dashed" || motif === "nested") return "frame";
  if (motif === "coordinates" || motif === "bars" || motif === "zigzag") return "chart";
  return "other";
};

export const renderCardArtSvg = ({
  slug,
  tags = [],
  accent = "purple",
  width = 1200,
  height = 680,
}: RenderCardArtInput) => {
  const seed = hashString(`${slug}:${tags.join(",")}:${accent}`);
  const rng = createRng(seed);
  const palette = palettes[Math.floor(rng() * palettes.length)] ?? palettes[0];

  // Pick a primary motif and an optional accent/overlay motif from a different family.
  const primary = allMotifs[Math.floor(rng() * allMotifs.length)] ?? "grid";
  const primaryFamily = familyOf(primary);
  const candidateOverlays = allMotifs.filter((m) => familyOf(m) !== primaryFamily && m !== primary);
  const shouldOverlay = rng() > 0.55;
  const overlay = shouldOverlay
    ? candidateOverlays[Math.floor(rng() * candidateOverlays.length)]
    : null;

  // Primary layer fills the card
  const primaryContent = renderMotif(primary, rng, palette, width, height);

  // Overlay layer is positioned as a corner panel / mark, not full-bleed
  let overlayContent = "";
  if (overlay) {
    const mode = Math.floor(rng() * 3);
    const scale = 0.35 + rng() * 0.15;
    const panelW = width * scale;
    const panelH = height * scale;
    const corners = [
      { x: 0, y: 0 },
      { x: width - panelW, y: 0 },
      { x: 0, y: height - panelH },
      { x: width - panelW, y: height - panelH },
    ];
    const spot = corners[Math.floor(rng() * corners.length)];
    const overlayPalette: Palette =
      mode === 0
        ? palette
        : mode === 1
          ? { ...palette, bg: palette.fg, fg: palette.bg }
          : { ...palette, bg: palette.accent, fg: palette.bg, accent: palette.fg };
    const inner = renderMotif(overlay, rng, overlayPalette, panelW, panelH);
    const borderW = Math.max(3, width * 0.004);
    overlayContent = `
      <g transform="translate(${fmt(spot.x)} ${fmt(spot.y)})">
        <rect x="0" y="0" width="${fmt(panelW)}" height="${fmt(panelH)}" fill="${overlayPalette.bg}" />
        ${inner}
        <rect x="${fmt(borderW / 2)}" y="${fmt(borderW / 2)}" width="${fmt(panelW - borderW)}" height="${fmt(panelH - borderW)}" fill="none" stroke="${palette.fg}" stroke-width="${fmt(borderW)}" />
      </g>
    `;
  }

  const borderW = Math.max(3, width * 0.003);
  const slugTag = slug.slice(0, 16).toUpperCase();

  return `
<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${palette.bg}" />
  ${primaryContent}
  ${overlayContent}
  <text x="${fmt(width - width * 0.03)}" y="${fmt(height - height * 0.035)}" font-family="JetBrains Mono, monospace" font-weight="500" font-size="${fmt(height * 0.035)}" fill="${palette.fg}" opacity="0.45" text-anchor="end" letter-spacing="0">${slugTag}</text>
  <rect x="${fmt(borderW / 2)}" y="${fmt(borderW / 2)}" width="${fmt(width - borderW)}" height="${fmt(height - borderW)}" fill="none" stroke="${palette.fg}" stroke-width="${fmt(borderW)}" />
</svg>
  `.trim();
};
