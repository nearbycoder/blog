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
  | "nodes"
  | "rise"
  | "blocks"
  | "orbits"
  | "signal"
  | "shards"
  | "rings"
  | "dunes"
  | "lattice"
  | "pulse";

type Palette = {
  primary: string;
  secondary: string;
  glow: string;
};

const paletteMap: Record<CardAccent, Palette> = {
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

const motifs: Motif[] = [
  "nodes",
  "rise",
  "blocks",
  "orbits",
  "signal",
  "shards",
  "rings",
  "dunes",
  "lattice",
  "pulse",
];

const keywordMotifs: Array<{ keywords: string[]; motifs: Motif[] }> = [
  { keywords: ["ai", "automation", "workflow", "codex", "claude"], motifs: ["orbits", "signal", "pulse", "rings"] },
  { keywords: ["career", "job", "layoff", "resume", "mindset"], motifs: ["rise", "dunes", "shards", "signal"] },
  { keywords: ["react", "frontend", "vite", "tooling"], motifs: ["blocks", "lattice", "signal", "rings"] },
  { keywords: ["backend", "api", "redis", "debug", "opensource"], motifs: ["nodes", "lattice", "pulse", "blocks"] },
  { keywords: ["product", "saas", "ship", "build"], motifs: ["signal", "nodes", "shards", "rings"] },
  { keywords: ["rate", "performance", "speed"], motifs: ["pulse", "rings", "nodes", "signal"] },
  { keywords: ["pair", "collaboration", "team"], motifs: ["lattice", "nodes", "blocks", "rings"] },
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

const format = (value: number) => value.toFixed(2);

const toX = (ratio: number, width: number) => width * ratio;
const toY = (ratio: number, height: number) => height * ratio;

const pickRelevantMotifs = (slug: string, tags: string[]) => {
  const lowerSlug = slug.toLowerCase();
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  const found: Motif[] = [];

  for (const rule of keywordMotifs) {
    const matched = rule.keywords.some(
      (keyword) => lowerSlug.includes(keyword) || lowerTags.some((tag) => tag.includes(keyword))
    );
    if (matched) {
      for (const motif of rule.motifs) {
        if (!found.includes(motif)) found.push(motif);
      }
    }
  }

  return found;
};

const pickMotifSet = (slug: string, tags: string[], rng: () => number) => {
  const relevant = pickRelevantMotifs(slug, tags);
  const chosen: Motif[] = [];
  const maxLayers = 3 + Math.floor(rng() * 2);

  const add = (motif: Motif) => {
    if (!chosen.includes(motif)) chosen.push(motif);
  };

  if (relevant.length > 0 && rng() > 0.16) {
    add(relevant[Math.floor(rng() * relevant.length)] ?? "signal");
  } else {
    add(motifs[Math.floor(rng() * motifs.length)] ?? "signal");
  }

  while (chosen.length < maxLayers) {
    const source = relevant.length > 0 && rng() > 0.52 ? relevant : motifs;
    add(source[Math.floor(rng() * source.length)] ?? "signal");
  }

  return chosen;
};

type AmbientMode = "bubbles" | "streaks" | "dots" | "panels";

const renderAmbientBubbles = (rng: () => number, palette: Palette, width: number, height: number) => {
  const circles = Array.from({ length: 10 }).map(() => {
    const cx = toX(0.06 + rng() * 0.88, width);
    const cy = toY(0.08 + rng() * 0.84, height);
    const radius = width * (0.03 + rng() * 0.14);
    const opacity = 0.05 + rng() * 0.12;
    const color = rng() > 0.5 ? palette.primary : palette.secondary;
    return `<circle cx="${format(cx)}" cy="${format(cy)}" r="${format(radius)}" fill="${color}" opacity="${format(opacity)}" />`;
  });

  const arcs = Array.from({ length: 8 }).map(() => {
    const x = toX(0.1 + rng() * 0.8, width);
    const y = toY(0.1 + rng() * 0.8, height);
    const rx = width * (0.07 + rng() * 0.18);
    const ry = height * (0.05 + rng() * 0.12);
    const rotation = -50 + rng() * 100;
    const opacity = 0.08 + rng() * 0.12;
    return `<ellipse cx="${format(x)}" cy="${format(y)}" rx="${format(rx)}" ry="${format(ry)}" transform="rotate(${format(
      rotation
    )} ${format(x)} ${format(y)})" fill="none" stroke="${palette.glow}" stroke-width="${format(
      1 + rng() * 1.1
    )}" opacity="${format(opacity)}" />`;
  });

  return [...circles, ...arcs].join("");
};

const renderAmbientStreaks = (rng: () => number, palette: Palette, width: number, height: number) => {
  return Array.from({ length: 20 })
    .map(() => {
      const x1 = toX(-0.1 + rng() * 1.2, width);
      const y1 = toY(rng() * 1.1, height);
      const length = width * (0.12 + rng() * 0.26);
      const angle = -45 + rng() * 90;
      const radians = (angle * Math.PI) / 180;
      const x2 = x1 + Math.cos(radians) * length;
      const y2 = y1 + Math.sin(radians) * length;
      const color = rng() > 0.5 ? palette.primary : palette.secondary;
      return `<line x1="${format(x1)}" y1="${format(y1)}" x2="${format(x2)}" y2="${format(
        y2
      )}" stroke="${color}" stroke-opacity="${format(0.08 + rng() * 0.16)}" stroke-width="${format(
        0.8 + rng() * 2.1
      )}" stroke-linecap="round" />`;
    })
    .join("");
};

const renderAmbientDots = (rng: () => number, palette: Palette, width: number, height: number) => {
  return Array.from({ length: 180 })
    .map(() => {
      const cx = toX(rng(), width);
      const cy = toY(rng(), height);
      const radius = width * (0.0008 + rng() * 0.0024);
      const color = rng() > 0.55 ? palette.primary : palette.secondary;
      return `<circle cx="${format(cx)}" cy="${format(cy)}" r="${format(radius)}" fill="${color}" fill-opacity="${format(
        0.07 + rng() * 0.22
      )}" />`;
    })
    .join("");
};

const renderAmbientPanels = (rng: () => number, palette: Palette, width: number, height: number) => {
  return Array.from({ length: 18 })
    .map(() => {
      const panelWidth = width * (0.05 + rng() * 0.2);
      const panelHeight = height * (0.05 + rng() * 0.24);
      const x = toX(-0.05 + rng() * 1.05, width);
      const y = toY(-0.05 + rng() * 1.05, height);
      const rotation = -22 + rng() * 44;
      const color = rng() > 0.5 ? palette.primary : palette.secondary;
      return `<rect x="${format(x)}" y="${format(y)}" width="${format(panelWidth)}" height="${format(
        panelHeight
      )}" rx="${format(8 + rng() * 18)}" transform="rotate(${format(rotation)} ${format(x)} ${format(
        y
      )})" fill="${color}" fill-opacity="${format(0.06 + rng() * 0.14)}" />`;
    })
    .join("");
};

const renderAmbientShapes = (rng: () => number, palette: Palette, width: number, height: number) => {
  const modes: AmbientMode[] = ["bubbles", "streaks", "dots", "panels"];
  const first = modes[Math.floor(rng() * modes.length)] ?? "bubbles";
  const secondPool = modes.filter((mode) => mode !== first);
  const second = rng() > 0.45 ? secondPool[Math.floor(rng() * secondPool.length)] : undefined;

  const renderByMode = (mode: AmbientMode) => {
    if (mode === "bubbles") return renderAmbientBubbles(rng, palette, width, height);
    if (mode === "streaks") return renderAmbientStreaks(rng, palette, width, height);
    if (mode === "dots") return renderAmbientDots(rng, palette, width, height);
    return renderAmbientPanels(rng, palette, width, height);
  };

  return `${renderByMode(first)}${second ? renderByMode(second) : ""}`;
};

const renderNodes = (rng: () => number, palette: Palette, width: number, height: number) => {
  const points = Array.from({ length: 12 }).map(() => ({
    x: toX(0.1 + rng() * 0.8, width),
    y: toY(0.16 + rng() * 0.68, height),
    r: width * (0.0025 + rng() * 0.0055),
  }));

  const lines: string[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    lines.push(
      `<line x1="${format(current.x)}" y1="${format(current.y)}" x2="${format(next.x)}" y2="${format(
        next.y
      )}" stroke="${palette.secondary}" stroke-opacity="${format(0.24 + rng() * 0.22)}" stroke-width="${format(
        1 + rng() * 1.5
      )}" />`
    );
  }

  const extraLinks = Array.from({ length: 8 }).map(() => {
    const a = points[Math.floor(rng() * points.length)];
    const b = points[Math.floor(rng() * points.length)];
    return `<line x1="${format(a.x)}" y1="${format(a.y)}" x2="${format(b.x)}" y2="${format(
      b.y
    )}" stroke="${palette.primary}" stroke-opacity="${format(0.1 + rng() * 0.15)}" stroke-width="${format(
      0.9 + rng() * 0.8
    )}" />`;
  });

  const nodes = points.map(
    (point) =>
      `<circle cx="${format(point.x)}" cy="${format(point.y)}" r="${format(point.r)}" fill="${palette.primary}" fill-opacity="${format(
        0.34 + rng() * 0.28
      )}" />`
  );

  return [...lines, ...extraLinks, ...nodes].join("");
};

const renderRise = (rng: () => number, palette: Palette, width: number, height: number) => {
  let x = toX(0.1, width);
  const bars = Array.from({ length: 8 }).map((_, index) => {
    const barWidth = width * (0.045 + rng() * 0.02);
    const barHeight = height * (0.16 + index * 0.052 + rng() * 0.06);
    const y = height - barHeight - height * 0.03;
    const radius = 12 + rng() * 12;
    const bar = `<rect x="${format(x)}" y="${format(y)}" width="${format(barWidth)}" height="${format(
      barHeight
    )}" rx="${format(radius)}" fill="${palette.secondary}" fill-opacity="${format(0.12 + rng() * 0.14)}" />`;
    x += barWidth + width * (0.015 + rng() * 0.01);
    return bar;
  });

  const points = Array.from({ length: 7 }).map((_, index) => ({
    x: toX(0.12 + index * 0.125 + rng() * 0.02, width),
    y: toY(0.76 - index * 0.09 + (rng() * 0.04 - 0.02), height),
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${format(point.x)} ${format(point.y)}`)
    .join(" ");
  const arrow = points[points.length - 1];

  return `
    ${bars.join("")}
    <path d="${path}" fill="none" stroke="${palette.primary}" stroke-width="${format(
      2.6 + rng() * 1.6
    )}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.86" />
    <path d="M ${format(arrow.x - width * 0.028)} ${format(arrow.y + height * 0.014)} L ${format(
      arrow.x
    )} ${format(arrow.y)} L ${format(arrow.x - width * 0.012)} ${format(
      arrow.y + height * 0.034
    )}" fill="none" stroke="${palette.primary}" stroke-width="${format(
      2.6 + rng() * 1.3
    )}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.86" />
  `.trim();
};

const renderBlocks = (rng: () => number, palette: Palette, width: number, height: number) => {
  const columns = 4;
  const rows = 4;
  const blocks = Array.from({ length: columns * rows }).map((_, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const blockWidth = width * (0.11 + rng() * 0.08);
    const blockHeight = height * (0.08 + rng() * 0.06);
    const x = width * (0.08 + col * 0.22 + rng() * 0.018);
    const y = height * (0.14 + row * 0.19 + rng() * 0.015);
    const color = rng() > 0.45 ? palette.primary : palette.secondary;
    const opacity = 0.1 + rng() * 0.2;
    return `<rect x="${format(x)}" y="${format(y)}" width="${format(blockWidth)}" height="${format(
      blockHeight
    )}" rx="${format(14 + rng() * 12)}" fill="${color}" fill-opacity="${format(opacity)}" stroke="#ffffff" stroke-opacity="0.08" />`;
  });

  const rails = Array.from({ length: 7 }).map(() => {
    const y = toY(0.12 + rng() * 0.78, height);
    return `<line x1="${format(toX(0.06, width))}" y1="${format(y)}" x2="${format(
      toX(0.94, width)
    )}" y2="${format(y)}" stroke="${palette.secondary}" stroke-opacity="0.14" stroke-width="1" />`;
  });

  return [...rails, ...blocks].join("");
};

const renderOrbits = (rng: () => number, palette: Palette, width: number, height: number) => {
  const centerX = toX(0.5 + (rng() * 0.08 - 0.04), width);
  const centerY = toY(0.5 + (rng() * 0.08 - 0.04), height);

  const rings = Array.from({ length: 6 }).map((_, index) => {
    const rx = width * (0.09 + index * 0.056 + rng() * 0.014);
    const ry = height * (0.08 + index * 0.04 + rng() * 0.014);
    const rotation = -32 + index * 12 + rng() * 10;
    return `<ellipse cx="${format(centerX)}" cy="${format(centerY)}" rx="${format(rx)}" ry="${format(
      ry
    )}" transform="rotate(${format(rotation)} ${format(centerX)} ${format(
      centerY
    )})" fill="none" stroke="${palette.primary}" stroke-opacity="${format(
      0.13 + index * 0.07
    )}" stroke-width="${format(1.3 + rng() * 0.8)}" />`;
  });

  const satellites = Array.from({ length: 14 }).map(() => {
    const angle = rng() * Math.PI * 2;
    const radiusX = width * (0.06 + rng() * 0.32);
    const radiusY = height * (0.05 + rng() * 0.22);
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    const r = width * (0.003 + rng() * 0.006);
    return `<circle cx="${format(x)}" cy="${format(y)}" r="${format(r)}" fill="${palette.secondary}" fill-opacity="${format(
      0.42 + rng() * 0.36
    )}" />`;
  });

  return [...rings, ...satellites].join("");
};

const renderSignal = (rng: () => number, palette: Palette, width: number, height: number) => {
  const makePath = (offset: number, amplitude: number, phase: number) => {
    const steps = 14;
    const points: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = toX(0.06 + (0.88 / steps) * i, width);
      const y =
        toY(offset, height) +
        Math.sin(i * 0.72 + phase) * height * amplitude +
        (rng() * height * 0.025 - height * 0.0125);
      points.push(`${i === 0 ? "M" : "L"} ${format(x)} ${format(y)}`);
    }
    return points.join(" ");
  };

  const waves = [
    { offset: 0.28, amplitude: 0.05, width: 2.2, opacity: 0.36, color: palette.primary },
    { offset: 0.4, amplitude: 0.07, width: 2.7, opacity: 0.44, color: palette.secondary },
    { offset: 0.54, amplitude: 0.08, width: 2.2, opacity: 0.3, color: palette.primary },
    { offset: 0.68, amplitude: 0.06, width: 1.8, opacity: 0.25, color: palette.secondary },
  ];

  const signals = waves.map((wave) => {
    const phase = rng() * 1.2;
    return `<path d="${makePath(wave.offset, wave.amplitude, phase)}" fill="none" stroke="${
      wave.color
    }" stroke-width="${wave.width}" stroke-opacity="${wave.opacity}" stroke-linecap="round" />`;
  });

  const pulses = Array.from({ length: 10 }).map(() => {
    const cx = toX(0.08 + rng() * 0.84, width);
    const cy = toY(0.14 + rng() * 0.7, height);
    const radius = width * (0.015 + rng() * 0.03);
    return `<circle cx="${format(cx)}" cy="${format(cy)}" r="${format(radius)}" fill="none" stroke="${
      palette.glow
    }" stroke-width="1.1" stroke-opacity="${format(0.1 + rng() * 0.2)}" />`;
  });

  return [...signals, ...pulses].join("");
};

const renderShards = (rng: () => number, palette: Palette, width: number, height: number) => {
  return Array.from({ length: 16 })
    .map(() => {
      const x1 = toX(0.06 + rng() * 0.88, width);
      const y1 = toY(0.06 + rng() * 0.88, height);
      const x2 = x1 + width * (0.03 + rng() * 0.1);
      const y2 = y1 + height * (0.02 + rng() * 0.12);
      const x3 = x1 + width * (-0.02 + rng() * 0.08);
      const y3 = y1 + height * (0.06 + rng() * 0.1);
      const color = rng() > 0.4 ? palette.primary : palette.secondary;
      return `<polygon points="${format(x1)},${format(y1)} ${format(x2)},${format(y2)} ${format(x3)},${format(
        y3
      )}" fill="${color}" fill-opacity="${format(0.12 + rng() * 0.22)}" />`;
    })
    .join("");
};

const renderRings = (rng: () => number, palette: Palette, width: number, height: number) => {
  return Array.from({ length: 11 })
    .map(() => {
      const cx = toX(0.1 + rng() * 0.8, width);
      const cy = toY(0.14 + rng() * 0.72, height);
      const outer = width * (0.018 + rng() * 0.07);
      const inner = outer * (0.35 + rng() * 0.4);
      return `
        <circle cx="${format(cx)}" cy="${format(cy)}" r="${format(outer)}" fill="none" stroke="${palette.primary}" stroke-opacity="${format(
          0.16 + rng() * 0.22
        )}" stroke-width="${format(1.1 + rng() * 1.1)}" />
        <circle cx="${format(cx)}" cy="${format(cy)}" r="${format(inner)}" fill="${palette.secondary}" fill-opacity="${format(
          0.08 + rng() * 0.18
        )}" />
      `.trim();
    })
    .join("");
};

const renderDunes = (rng: () => number, palette: Palette, width: number, height: number) => {
  const band = (offset: number, variance: number, opacity: number, color: string) => {
    const steps = 10;
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = toX((1 / steps) * i, width);
      const y = toY(offset + Math.sin(i * 0.55 + rng() * 0.3) * variance, height);
      top.push(`${i === 0 ? "M" : "L"} ${format(x)} ${format(y)}`);
    }
    for (let i = steps; i >= 0; i -= 1) {
      const x = toX((1 / steps) * i, width);
      const y = toY(offset + 0.16 + Math.sin(i * 0.45 + rng() * 0.3) * variance, height);
      bottom.push(`L ${format(x)} ${format(y)}`);
    }
    return `<path d="${[...top, ...bottom, "Z"].join(" ")}" fill="${color}" fill-opacity="${format(opacity)}" />`;
  };

  return [
    band(0.26, 0.03, 0.14 + rng() * 0.08, palette.primary),
    band(0.44, 0.03, 0.12 + rng() * 0.08, palette.secondary),
    band(0.61, 0.028, 0.1 + rng() * 0.07, palette.primary),
  ].join("");
};

const renderLattice = (rng: () => number, palette: Palette, width: number, height: number) => {
  const cols = 9;
  const rows = 5;
  const points: Array<{ x: number; y: number }> = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      points.push({
        x: toX(0.12 + col * 0.095 + (rng() * 0.02 - 0.01), width),
        y: toY(0.2 + row * 0.14 + (rng() * 0.018 - 0.009), height),
      });
    }
  }

  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const idx = row * cols + col;
      const current = points[idx];
      if (col < cols - 1) {
        const right = points[idx + 1];
        lines.push(
          `<line x1="${format(current.x)}" y1="${format(current.y)}" x2="${format(right.x)}" y2="${format(
            right.y
          )}" stroke="${palette.primary}" stroke-opacity="${format(0.14 + rng() * 0.16)}" stroke-width="1" />`
        );
      }
      if (row < rows - 1) {
        const down = points[idx + cols];
        lines.push(
          `<line x1="${format(current.x)}" y1="${format(current.y)}" x2="${format(down.x)}" y2="${format(
            down.y
          )}" stroke="${palette.secondary}" stroke-opacity="${format(0.11 + rng() * 0.18)}" stroke-width="1" />`
        );
      }
    }
  }

  const nodes = points.map(
    (point) =>
      `<circle cx="${format(point.x)}" cy="${format(point.y)}" r="${format(
        width * (0.0018 + rng() * 0.0026)
      )}" fill="${palette.glow}" fill-opacity="${format(0.34 + rng() * 0.4)}" />`
  );

  return [...lines, ...nodes].join("");
};

const renderPulse = (rng: () => number, palette: Palette, width: number, height: number) => {
  const centerX = toX(0.5 + (rng() * 0.06 - 0.03), width);
  const centerY = toY(0.54 + (rng() * 0.06 - 0.03), height);

  const rings = Array.from({ length: 8 }).map((_, index) => {
    const radius = width * (0.03 + index * 0.032 + rng() * 0.008);
    return `<circle cx="${format(centerX)}" cy="${format(centerY)}" r="${format(radius)}" fill="none" stroke="${
      index % 2 === 0 ? palette.primary : palette.secondary
    }" stroke-opacity="${format(0.08 + (8 - index) * 0.03)}" stroke-width="${format(
      1 + rng() * 1.2
    )}" />`;
  });

  const rays = Array.from({ length: 16 }).map(() => {
    const angle = rng() * Math.PI * 2;
    const inner = width * (0.04 + rng() * 0.08);
    const outer = width * (0.14 + rng() * 0.22);
    const x1 = centerX + Math.cos(angle) * inner;
    const y1 = centerY + Math.sin(angle) * inner;
    const x2 = centerX + Math.cos(angle) * outer;
    const y2 = centerY + Math.sin(angle) * outer;
    return `<line x1="${format(x1)}" y1="${format(y1)}" x2="${format(x2)}" y2="${format(
      y2
    )}" stroke="${palette.glow}" stroke-opacity="${format(0.1 + rng() * 0.2)}" stroke-width="${format(
      1 + rng() * 1.6
    )}" />`;
  });

  return [...rings, ...rays].join("");
};

const renderMotif = (
  motif: Motif,
  rng: () => number,
  palette: Palette,
  width: number,
  height: number
) => {
  if (motif === "nodes") return renderNodes(rng, palette, width, height);
  if (motif === "rise") return renderRise(rng, palette, width, height);
  if (motif === "blocks") return renderBlocks(rng, palette, width, height);
  if (motif === "orbits") return renderOrbits(rng, palette, width, height);
  if (motif === "signal") return renderSignal(rng, palette, width, height);
  if (motif === "shards") return renderShards(rng, palette, width, height);
  if (motif === "rings") return renderRings(rng, palette, width, height);
  if (motif === "dunes") return renderDunes(rng, palette, width, height);
  if (motif === "lattice") return renderLattice(rng, palette, width, height);
  return renderPulse(rng, palette, width, height);
};

type LayerLayout = "free" | "top-band" | "diagonal" | "center-focus";

const renderTransformedLayer = (
  content: string,
  rng: () => number,
  width: number,
  height: number,
  opacity: number,
  clipId?: string
) => {
  const tx = width * (rng() * 0.1 - 0.05);
  const ty = height * (rng() * 0.1 - 0.05);
  const rotation = rng() * 24 - 12;
  const scale = 0.9 + rng() * 0.25;
  const cx = width / 2;
  const cy = height / 2;
  return `<g opacity="${format(opacity)}" ${
    clipId ? `clip-path="url(#${clipId})"` : ""
  } transform="translate(${format(tx)} ${format(ty)}) translate(${format(cx)} ${format(
    cy
  )}) rotate(${format(rotation)}) scale(${format(scale)} ${format(scale)}) translate(${format(
    -cx
  )} ${format(-cy)})">${content}</g>`;
};

type RenderCardArtInput = {
  slug: string;
  tags?: string[];
  accent?: CardAccent;
  width?: number;
  height?: number;
};

export const renderCardArtSvg = ({
  slug,
  tags = [],
  accent = "cyan",
  width = 1200,
  height = 680,
}: RenderCardArtInput) => {
  const palette = paletteMap[accent] ?? paletteMap.cyan;
  const seed = hashString(`${slug}:${tags.join(",")}:${accent}`);
  const rng = createRng(seed);
  const motifSet = pickMotifSet(slug, tags, rng);
  const gridSize = Math.round(36 + rng() * 22);
  const layoutOptions: LayerLayout[] = ["free", "top-band", "diagonal", "center-focus"];
  const layout = layoutOptions[Math.floor(rng() * layoutOptions.length)] ?? "free";

  const ambient = renderAmbientShapes(rng, palette, width, height);
  const primaryLayer = renderMotif(motifSet[0] as Motif, rng, palette, width, height);
  const secondaryLayer = renderMotif(motifSet[1] as Motif, rng, palette, width, height);
  const tertiaryLayer = motifSet[2]
    ? renderMotif(motifSet[2] as Motif, rng, palette, width, height)
    : "";
  const quaternaryLayer = motifSet[3]
    ? renderMotif(motifSet[3] as Motif, rng, palette, width, height)
    : "";

  const secondaryClip =
    layout === "top-band" ? "clipTopBand" : layout === "diagonal" ? "clipDiagonal" : undefined;
  const tertiaryClip = layout === "center-focus" ? "clipCenterFocus" : undefined;
  const quaternaryClip =
    layout === "free" ? undefined : layout === "top-band" ? "clipLowerBand" : "clipCenterFocus";

  const primaryLayerSvg = renderTransformedLayer(primaryLayer, rng, width, height, 0.52 + rng() * 0.24);
  const secondaryLayerSvg = renderTransformedLayer(
    secondaryLayer,
    rng,
    width,
    height,
    0.32 + rng() * 0.22,
    secondaryClip
  );
  const tertiaryLayerSvg = tertiaryLayer
    ? renderTransformedLayer(tertiaryLayer, rng, width, height, 0.24 + rng() * 0.18, tertiaryClip)
    : "";
  const quaternaryLayerSvg = quaternaryLayer
    ? renderTransformedLayer(
        quaternaryLayer,
        rng,
        width,
        height,
        0.18 + rng() * 0.14,
        quaternaryClip
      )
    : "";

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="base" x1="${format(width * 0.1)}" y1="${format(height * 0.08)}" x2="${format(
      width * 0.9
    )}" y2="${format(height * 0.92)}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f1626" />
      <stop offset="45%" stop-color="#0b121f" />
      <stop offset="100%" stop-color="#090e16" />
    </linearGradient>
    <linearGradient id="accentSweep" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.4" />
      <stop offset="50%" stop-color="${palette.secondary}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#070b13" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="glowA" cx="${format(0.15 + rng() * 0.14)}" cy="${format(
      0.1 + rng() * 0.1
    )}" r="0.72">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#070b13" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="${format(0.72 + rng() * 0.2)}" cy="${format(
      0.74 + rng() * 0.18
    )}" r="0.64">
      <stop offset="0%" stop-color="${palette.secondary}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#070b13" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1" />
    </pattern>
    <clipPath id="clipTopBand">
      <rect x="0" y="0" width="${width}" height="${format(height * 0.56)}" />
    </clipPath>
    <clipPath id="clipLowerBand">
      <rect x="0" y="${format(height * 0.4)}" width="${width}" height="${format(height * 0.6)}" />
    </clipPath>
    <clipPath id="clipDiagonal">
      <polygon points="0,0 ${width},0 ${width},${format(height * 0.82)} 0,${format(height * 0.58)}" />
    </clipPath>
    <clipPath id="clipCenterFocus">
      <ellipse cx="${format(width * 0.5)}" cy="${format(height * 0.52)}" rx="${format(
        width * 0.34
      )}" ry="${format(height * 0.34)}" />
    </clipPath>
    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="${format(18 + rng() * 22)}" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#base)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />
  <rect width="${width}" height="${height}" fill="url(#glowA)" />
  <rect width="${width}" height="${height}" fill="url(#glowB)" />
  <rect width="${width}" height="${height}" fill="url(#accentSweep)" />

  <g filter="url(#softBlur)" opacity="${format(0.34 + rng() * 0.24)}">
    <circle cx="${format(width * (0.12 + rng() * 0.08))}" cy="${format(height * (0.12 + rng() * 0.08))}" r="${format(
      width * (0.1 + rng() * 0.07)
    )}" fill="${palette.primary}" />
    <circle cx="${format(width * (0.8 + rng() * 0.12))}" cy="${format(height * (0.72 + rng() * 0.16))}" r="${format(
      width * (0.11 + rng() * 0.08)
    )}" fill="${palette.secondary}" />
  </g>

  <g opacity="${format(0.68 + rng() * 0.25)}">
    ${ambient}
  </g>

  ${secondaryLayerSvg}
  ${primaryLayerSvg}
  ${tertiaryLayerSvg}
  ${quaternaryLayerSvg}

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" stroke="rgba(255,255,255,0.08)" />
</svg>
`;

  return svg.trim();
};
