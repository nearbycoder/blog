#!/usr/bin/env node
/**
 * Procedural Art Deco skyline wallpapers for /desktop ("The Penthouse").
 *
 * One seeded city is rendered twice: neon night and limestone daylight.
 * Everything is drawn from geometry here; no source artwork is traced or
 * copied. Run `node scripts/generate-deco-skyline.mjs` to regenerate:
 *
 *   public/images/desktop/deco-skyline-night.svg
 *   public/images/desktop/deco-skyline-day.svg
 *
 * Change CITY_SEED for a different skyline, LIGHT_SEED for different lit
 * windows and stars. Output is deterministic for a given pair of seeds.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CITY_SEED = 1926; // Route 66 was commissioned in 1926.
export const LIGHT_SEED = 66;

const W = 2560;
const H = 1440;
const HERO_X = 1660;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/images/desktop");

/* ---------- utilities ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = (v) => {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};
const between = (rand, lo, hi) => lo + rand() * (hi - lo);
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const poly = (pts) => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}Z`;

/* ---------- city geometry (shared by both moods) ---------- */
/**
 * A tower is a symmetric stack of setback tiers plus a crown.
 * `profile()` returns the right half, from the ground centre to the tip.
 */
function profile(t) {
  const pts = [[t.cx, H]];
  let y = H - (t.lift ?? 0);
  if (t.lift) pts.push([t.cx + t.tiers[0].hw, H]);
  for (const tier of t.tiers) {
    pts.push([t.cx + tier.hw, y]);
    y -= tier.h;
    pts.push([t.cx + tier.hw, y]);
  }
  const cap = t.cap ?? { type: "flat" };
  const top = t.tiers.at(-1).hw;
  if (cap.type === "spire") {
    pts.push([t.cx + cap.base, y], [t.cx + cap.base * 0.35, y - cap.h * 0.55]);
    pts.push([t.cx, y - cap.h]);
  } else if (cap.type === "mast") {
    pts.push([t.cx + cap.w, y], [t.cx + cap.w, y - cap.h], [t.cx, y - cap.h]);
  } else if (cap.type === "pyramid") {
    pts.push([t.cx, y - cap.h]);
  } else if (cap.type === "chevron") {
    pts.push([t.cx + top * 0.55, y - cap.h * 0.55], [t.cx, y - cap.h]);
  } else {
    pts.push([t.cx, y]);
  }
  return pts;
}
const mirror = (t, right) => [
  ...right,
  ...right
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [2 * t.cx - x, y]),
];
const towerTop = (t) =>
  H -
  (t.lift ?? 0) -
  t.tiers.reduce((sum, tier) => sum + tier.h, 0) -
  (t.cap && t.cap.type !== "flat" ? t.cap.h : 0);

/** Stepped tiers: each setback narrower and shorter than the last. */
function stepped(rand, hw, height, count, { taper = 0.8, steep = 0.62 } = {}) {
  const tiers = [];
  let remaining = height;
  let width = hw;
  for (let i = 0; i < count; i++) {
    const last = i === count - 1;
    const h = last
      ? remaining
      : remaining * between(rand, steep - 0.06, steep + 0.06);
    tiers.push({ hw: Math.round(width), h: Math.round(h) });
    remaining -= h;
    width *= between(rand, taper - 0.05, taper + 0.04);
  }
  return tiers;
}

function buildCity() {
  const rand = mulberry32(CITY_SEED);
  const far = [];
  const mid = [];
  const front = [];

  // Far layer: a dense, low-contrast band of slabs and spires.
  for (let x = -40; x < W + 60;) {
    const hw = between(rand, 26, 62);
    const leftCalm = x < 760 ? 0.62 : 1;
    const height = between(rand, 170, 470) * leftCalm;
    const tiers = stepped(rand, hw, height, 1 + Math.floor(rand() * 3), {
      steep: 0.72,
    });
    const roll = rand();
    far.push({
      cx: x + hw,
      tiers,
      cap:
        roll < 0.18
          ? { type: "spire", base: 6, h: between(rand, 40, 90) }
          : roll < 0.3
            ? { type: "pyramid", h: between(rand, 16, 36) }
            : { type: "flat" },
    });
    x += hw * 2 + between(rand, -18, 10);
  }

  // Mid layer: setback towers with lit windows, kept low on the icon side.
  for (let x = 120; x < W + 40;) {
    const hw = between(rand, 44, 92);
    const cx = x + hw;
    const nearHero = Math.abs(cx - HERO_X) < 230;
    const leftCalm = cx < 700 ? 0.5 : cx < 1000 ? 0.78 : 1;
    const height = between(rand, 290, 640) * leftCalm * (nearHero ? 0.82 : 1);
    const roll = rand();
    mid.push({
      cx,
      tiers: stepped(rand, hw, height, 2 + Math.floor(rand() * 3)),
      cap:
        roll < 0.22
          ? { type: "spire", base: 7, h: between(rand, 50, 120) }
          : roll < 0.42
            ? { type: "mast", w: 3, h: between(rand, 30, 70) }
            : roll < 0.55
              ? { type: "chevron", h: between(rand, 24, 46) }
              : { type: "flat" },
    });
    x += hw * 2 + between(rand, 30, 120);
  }

  // Front layer: three composed towers and a band of low street blocks.
  const hero = {
    id: "hero",
    cx: HERO_X,
    tiers: [
      { hw: 152, h: 400 },
      { hw: 124, h: 220 },
      { hw: 100, h: 150 },
      { hw: 78, h: 104 },
      { hw: 58, h: 70 },
      { hw: 42, h: 46 },
      { hw: 28, h: 34 },
    ],
    cap: { type: "spire", base: 13, h: 196 },
  };
  const east = {
    id: "east",
    cx: 2215,
    tiers: [
      { hw: 128, h: 430 },
      { hw: 104, h: 150 },
      { hw: 82, h: 82 },
      { hw: 62, h: 48 },
      { hw: 44, h: 32 },
    ],
    cap: { type: "chevron", h: 54 },
  };
  const west = {
    id: "west",
    cx: 1190,
    tiers: [
      { hw: 104, h: 352 },
      { hw: 82, h: 136 },
      { hw: 62, h: 72 },
      { hw: 44, h: 40 },
    ],
    cap: { type: "mast", w: 4, h: 96 },
  };
  const street = [];
  for (let x = 560; x < W + 80;) {
    const hw = between(rand, 60, 130);
    const cx = x + hw;
    if (
      ![hero, east, west].some(
        (t) => Math.abs(t.cx - cx) < t.tiers[0].hw + hw - 40,
      )
    )
      street.push({
        cx,
        tiers: stepped(
          rand,
          hw,
          between(rand, 96, 210),
          1 + Math.floor(rand() * 2),
          {
            steep: 0.78,
            taper: 0.86,
          },
        ),
        cap: { type: "flat" },
        street: true,
      });
    x += hw * 2 + between(rand, 4, 40);
  }
  front.push(west, east, hero, ...street);
  return { far, mid, front, hero, east, west };
}

/* ---------- moods ---------- */
const NIGHT = {
  name: "night",
  sky: [
    [0, "#06051c"],
    [0.4, "#110c31"],
    [0.66, "#23164a"],
    [0.85, "#3f1b52"],
    [1, "#62234f"],
  ],
  glow: "#ff5c7f",
  glowOpacity: 0.34,
  rays: "#ffc35a",
  rayOpacity: 0.1,
  rings: "#ffc35a",
  far: ["#33235a", "#2a1d4c"],
  mid: ["#1d1638", "#151029"],
  front: ["#120e24", "#0b0918"],
  street: ["#0d0a1a", "#090713"],
  piers: "#c9b8ff",
  piersOpacity: 0.06,
  haze: "#2b1746",
  ledge: "#ffc35a",
  ledgeOpacity: 0.32,
};
const DAY = {
  name: "day",
  sky: [
    [0, "#f6eedf"],
    [0.45, "#f3e2c6"],
    [0.75, "#f0d0a8"],
    [1, "#eab68a"],
  ],
  glow: "#fff4dc",
  glowOpacity: 0.55,
  rays: "#c3922f",
  rayOpacity: 0.12,
  rings: "#a87b2a",
  far: ["#ead2b2", "#dfc19e"],
  mid: ["#d9b28d", "#c69873"],
  front: {
    hero: ["#b4532f", "#8f3d22"],
    east: ["#2f7564", "#1f5a4c"],
    west: ["#c8a274", "#a8835a"],
  },
  street: ["#b98a63", "#9c6f4c"],
  piers: "#3a1d10",
  piersOpacity: 0.07,
  haze: "#f3dcbd",
  ledge: "#8c6418",
  ledgeOpacity: 0.55,
};

/* ---------- drawing ---------- */
function towerPaths(towers, colors, mood) {
  let light = "";
  let shade = "";
  const tint = (t) =>
    Array.isArray(colors) ? colors : (colors[t.id] ?? colors.hero);
  const custom = towers.filter((t) => !Array.isArray(colors));
  if (custom.length) {
    return towers
      .map((t) => {
        const [a, b] = tint(t);
        const right = profile(t);
        return `<path fill="${a}" d="${poly(mirror(t, right))}"/><path fill="${b}" d="${poly(right)}"/>`;
      })
      .join("");
  }
  for (const t of towers) {
    const right = profile(t);
    light += poly(mirror(t, right));
    shade += poly(right);
  }
  return `<path fill="${colors[0]}" d="${light}"/><path fill="${colors[1]}" d="${shade}"/>`;
}

/** Vertical piers per tier: the deco skyscraper's strongest gesture. */
function piers(towers, spacing, mood, width = 1.6) {
  let d = "";
  for (const t of towers) {
    let y = H - (t.lift ?? 0);
    for (const tier of t.tiers) {
      const top = y - tier.h;
      const count = Math.floor((tier.hw * 2 - 10) / spacing);
      const start = t.cx - ((count - 1) * spacing) / 2;
      for (let i = 0; i < count; i++)
        d += `M${n(start + i * spacing)} ${n(y)}V${n(top + 6)}`;
      y = top;
    }
  }
  return `<path stroke="${mood.piers}" stroke-opacity="${mood.piersOpacity}" stroke-width="${width}" d="${d}"/>`;
}

/** Setback ledges: thin gilt lines at each step. */
function ledges(towers, mood, opacity = mood.ledgeOpacity) {
  let d = "";
  for (const t of towers) {
    let y = H - (t.lift ?? 0);
    for (const tier of t.tiers) {
      y -= tier.h;
      d += `M${n(t.cx - tier.hw)} ${n(y + 1)}H${n(t.cx + tier.hw)}`;
    }
  }
  return `<path stroke="${mood.ledge}" stroke-opacity="${opacity}" stroke-width="2" d="${d}"/>`;
}

function windows(towers, rand, opts) {
  const groups = new Map();
  const add = (color, x, y, w, h) => {
    const key = color;
    groups.set(
      key,
      (groups.get(key) ?? "") + `M${n(x)} ${n(y)}h${w}v${h}h-${w}z`,
    );
  };
  for (const t of towers) {
    const density = between(rand, opts.min, opts.max);
    let y = H - (t.lift ?? 0);
    for (const tier of t.tiers) {
      const top = y - tier.h;
      const cols = Math.floor((tier.hw * 2 - 12) / opts.col);
      const start = t.cx - ((cols - 1) * opts.col) / 2 - opts.w / 2;
      for (let row = top + 12; row < y - opts.row; row += opts.row) {
        if (row > H - opts.floor) continue;
        const floorLit = rand() < 0.16 ? 2.4 : rand() < 0.35 ? 0 : 1;
        for (let c = 0; c < cols; c++) {
          if (rand() > density * floorLit) continue;
          const x = start + c * opts.col;
          const shade = x > t.cx ? 1 : 0;
          add(pick(rand, opts.colors[shade]), x, row, opts.w, opts.h);
        }
      }
      y = top;
    }
  }
  return [...groups]
    .map(([color, d]) => {
      const [fill, opacity] = color.split("@");
      return `<path fill="${fill}"${opacity ? ` fill-opacity="${opacity}"` : ""} d="${d}"/>`;
    })
    .join("");
}

function sunburst(cx, cy, mood, { count = 40, radius = 2300, open = 0 } = {}) {
  let d = "";
  const step = Math.PI / count;
  for (let i = 0; i < count; i += 2) {
    const a1 = Math.PI + i * step;
    const a2 = a1 + step * (1 - open);
    d += `M${cx} ${cy}L${n(cx + Math.cos(a1) * radius)} ${n(cy + Math.sin(a1) * radius)}L${n(cx + Math.cos(a2) * radius)} ${n(cy + Math.sin(a2) * radius)}Z`;
  }
  return d;
}

function stars(rand) {
  let d = "";
  let bright = "";
  for (let i = 0; i < 130; i++) {
    const x = rand() * W;
    const y = Math.pow(rand(), 1.4) * 820;
    // Keep the icon corner calm.
    if (x < 820 && y < 640 && rand() < 0.7) continue;
    const r = rand() < 0.1 ? 1.7 : between(rand, 0.6, 1.2);
    const dot = `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 -${n(2 * r)} 0`;
    if (r > 1.5) bright += dot;
    else d += dot;
  }
  return `<path fill="#f4e9d6" fill-opacity=".55" d="${d}"/><path fill="#ffe7b8" fill-opacity=".9" d="${bright}"/>`;
}

/** Four-point twinkle: a small deco star, used sparingly. */
const sparkle = (x, y, r, fill, opacity) =>
  `<path fill="${fill}" fill-opacity="${opacity}" d="M${x} ${y - r}Q${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y}Q${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r}Q${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y}Q${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r}Z"/>`;

function neon(city) {
  const { hero, east, west } = city;
  const rose = "#ff5c7f";
  const teal = "#3fe6c8";
  const gold = "#ffc35a";
  const lines = [];
  // Hero: teal streamline at three setbacks, rose crown outline, gold tip.
  let y = H;
  hero.tiers.forEach((tier, i) => {
    y -= tier.h;
    if (i === 1 || i === 2 || i === 3)
      lines.push([
        teal,
        `M${hero.cx - tier.hw} ${y}H${hero.cx + tier.hw}`,
        2.6,
      ]);
    if (i === 4)
      lines.push([
        rose,
        `M${hero.cx - tier.hw} ${y + tier.h}V${y}H${hero.cx + tier.hw}V${y + tier.h}`,
        2.6,
      ]);
  });
  const heroRight = profile(hero);
  const crown = heroRight.slice(-9);
  lines.push([
    rose,
    `M${crown.map(([x, yy]) => `${n(x)} ${n(yy)}`).join("L")}`,
    2.2,
  ]);
  lines.push([
    rose,
    `M${crown.map(([x, yy]) => `${n(2 * hero.cx - x)} ${n(yy)}`).join("L")}`,
    2.2,
  ]);
  // East: rose chevron crown.
  const er = profile(east);
  const ec = er.slice(-5);
  lines.push([
    rose,
    `M${[
      ...ec.map(([x, yy]) => [2 * east.cx - x, yy]).reverse(),
      ...ec.slice(1),
    ]
      .map(([x, yy]) => `${n(x)} ${n(yy)}`)
      .join("L")}`,
    2.4,
  ]);
  // West: teal band under the mast.
  let wy = H;
  west.tiers.forEach((tier, i) => {
    wy -= tier.h;
    if (i === 2)
      lines.push([
        teal,
        `M${west.cx - tier.hw} ${wy}H${west.cx + tier.hw}`,
        2.4,
      ]);
  });
  const glow = lines
    .map(
      ([c, d, w]) =>
        `<path stroke="${c}" stroke-width="${w * 4}" stroke-opacity=".45" d="${d}"/>`,
    )
    .join("");
  const core = lines
    .map(([c, d, w]) => `<path stroke="${c}" stroke-width="${w}" d="${d}"/>`)
    .join("");
  const tips = [
    [hero.cx, towerTop(hero)],
    [west.cx, towerTop(west)],
  ];
  const beacons = tips
    .map(
      ([x, yy]) =>
        `<circle cx="${n(x)}" cy="${n(yy)}" r="14" fill="url(#beacon)"/><circle cx="${n(x)}" cy="${n(yy)}" r="2.6" fill="${gold}"/>`,
    )
    .join("");
  return `<g fill="none" stroke-linecap="square" stroke-linejoin="miter"><g filter="url(#blur)">${glow}</g>${core}</g>${beacons}`;
}

/** Floodlights on the setbacks wash each tier from below. */
function floodlights(towers, fromTier = 1) {
  let out = "";
  for (const t of towers) {
    let y = H - (t.lift ?? 0);
    t.tiers.forEach((tier, i) => {
      const top = y - tier.h;
      if (i >= fromTier) {
        const h = Math.min(tier.h, 150);
        out += `<rect x="${n(t.cx - tier.hw)}" y="${n(y - h)}" width="${tier.hw * 2}" height="${n(h)}" fill="url(#flood)"/>`;
      }
      y = top;
    });
  }
  return out;
}

/** A marquee: a row of bulbs on a low street block. */
function marquee(city, mood, rand) {
  const block = city.front
    .filter((t) => t.street && t.cx > 820 && t.cx < 1460)
    .sort((a, b) => b.tiers[0].hw - a.tiers[0].hw)[0];
  if (!block) return "";
  const tier = block.tiers[0];
  const y = H - tier.h + 18;
  let bulbs = "";
  for (let x = block.cx - tier.hw + 10; x < block.cx + tier.hw - 8; x += 12)
    bulbs += `M${n(x - 1.8)} ${y}a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0`;
  const band = `<rect x="${n(block.cx - tier.hw + 4)}" y="${y + 8}" width="${n(tier.hw * 2 - 8)}" height="20" fill="${mood.name === "night" ? "#ff5c7f" : "#b23f26"}" fill-opacity="${mood.name === "night" ? 0.22 : 0.5}"/>`;
  if (mood.name === "night")
    return `${band}<path fill="#ffc35a" filter="url(#blur-sm)" d="${bulbs}"/><path fill="#ffe2a0" d="${bulbs}"/>`;
  return `${band}<path fill="#f3dfb1" d="${bulbs}"/>`;
}

function render(mood, city) {
  const lightRand = mulberry32(LIGHT_SEED);
  const night = mood.name === "night";
  const sunY = night ? 1330 : 1050;
  const sky = mood.sky
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("");

  const defs = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${sky}</linearGradient>
<radialGradient id="glow" cx="${HERO_X}" cy="${H}" r="1500" gradientTransform="translate(0 ${H * 0.62}) scale(1 .38)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${mood.glow}" stop-opacity="${mood.glowOpacity}"/><stop offset="1" stop-color="${mood.glow}" stop-opacity="0"/></radialGradient>
<radialGradient id="rayfade" cx="${HERO_X}" cy="${sunY}" r="1700" gradientUnits="userSpaceOnUse"><stop offset=".12" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="calm" x1="0" y1="0" x2="1" y2="0"><stop offset=".08" stop-color="#000"/><stop offset=".45" stop-color="#fff"/></linearGradient>
<mask id="raymask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#rayfade)"/></mask>
<mask id="calmmask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#calm)"/></mask>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mood.haze}" stop-opacity="0"/><stop offset="1" stop-color="${mood.haze}" stop-opacity="${night ? 0.85 : 0.75}"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#05040c" : "#7a4a30"}" stop-opacity="0"/><stop offset="1" stop-color="${night ? "#05040c" : "#7a4a30"}" stop-opacity="${night ? 0.9 : 0.35}"/></linearGradient>
<linearGradient id="flood" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb35a" stop-opacity=".34"/><stop offset=".55" stop-color="#ff7f7f" stop-opacity=".08"/><stop offset="1" stop-color="#ff7f7f" stop-opacity="0"/></linearGradient>
<radialGradient id="beacon"><stop offset="0" stop-color="#ffc35a" stop-opacity=".8"/><stop offset="1" stop-color="#ffc35a" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#f9da8c"/><stop offset="1" stop-color="#e8a246"/></radialGradient>
<mask id="sunstripes" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${[
    0, 1, 2, 3, 4, 5,
  ]
    .map((i) => {
      const y = sunY - 70 + i * 50 - i * i * 2;
      const h = 6 + i * 4;
      return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="#000"/>`;
    })
    .join("")}</mask>
<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="blur-sm" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>`;

  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
  if (night) parts.push(stars(lightRand));
  // Sunburst behind the hero tower; faded toward the upper left.
  parts.push(
    `<g mask="url(#calmmask)"><g mask="url(#raymask)"><path fill="${mood.rays}" fill-opacity="${mood.rayOpacity}" d="${sunburst(HERO_X, sunY, mood, { count: 44 })}"/></g></g>`,
  );
  // Concentric halo rings (an octagonal medallion's echo) around the burst.
  parts.push(
    `<g fill="none" stroke="${mood.rings}" stroke-opacity="${night ? 0.16 : 0.22}" mask="url(#raymask)">${[
      420, 470, 560, 760,
    ]
      .map(
        (r, i) =>
          `<circle cx="${HERO_X}" cy="${sunY}" r="${r}" stroke-width="${i === 3 ? 1.2 : 2}"${i === 2 ? ' stroke-dasharray="2 14"' : ""}/>`,
      )
      .join("")}</g>`,
  );
  if (!night)
    parts.push(
      `<circle cx="${HERO_X}" cy="${sunY}" r="330" fill="url(#sun)" mask="url(#sunstripes)"/>`,
    );
  if (night) {
    // Two crossing searchlights, as at a premiere on the Mother Road.
    const beam = (x, y, angle, color, o) =>
      `<path transform="rotate(${angle} ${x} ${y})" fill="${color}" fill-opacity="${o}" d="M${x - 5} ${y}L${x - 70} ${y - 1500}L${x + 70} ${y - 1500}L${x + 5} ${y}Z" mask="url(#beammask)"/>`;
    parts.push(
      `<mask id="beammask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#rayfade)"/></mask>`,
      beam(2050, 1250, -24, "#3fe6c8", 0.1),
      beam(1300, 1280, 21, "#ff5c7f", 0.09),
    );
  }
  parts.push(`<rect width="${W}" height="${H}" fill="url(#glow)"/>`);

  // Far layer.
  parts.push(towerPaths(city.far, mood.far, mood));
  if (night)
    parts.push(
      windows(city.far, lightRand, {
        min: 0.02,
        max: 0.07,
        col: 9,
        row: 13,
        w: 3,
        h: 5,
        floor: 0,
        colors: [
          ["#ffc35a@.55", "#ffdf9a@.4"],
          ["#ffc35a@.35", "#ff9f6e@.3"],
        ],
      }),
    );
  parts.push(
    `<rect y="980" width="${W}" height="${H - 980}" fill="url(#haze)"/>`,
  );

  // Mid layer.
  parts.push(towerPaths(city.mid, mood.mid, mood));
  parts.push(piers(city.mid, 10, mood, 1.2));
  parts.push(ledges(city.mid, mood, mood.ledgeOpacity * 0.55));
  parts.push(
    night
      ? windows(city.mid, lightRand, {
          min: 0.05,
          max: 0.2,
          col: 10,
          row: 15,
          w: 4,
          h: 7,
          floor: 0,
          colors: [
            ["#ffc35a@.85", "#ffd98a@.75", "#ffb347@.6", "#ffe9bf@.7"],
            ["#ffc35a@.5", "#ff9f6e@.45", "#ffb347@.4"],
          ],
        })
      : windows(city.mid, lightRand, {
          min: 0.04,
          max: 0.12,
          col: 10,
          row: 15,
          w: 4,
          h: 7,
          floor: 0,
          colors: [
            ["#fff6e4@.7", "#fbe9c9@.55"],
            ["#7a4a33@.25", "#7a4a33@.18"],
          ],
        }),
  );
  parts.push(
    `<rect y="1150" width="${W}" height="${H - 1150}" fill="url(#haze)" opacity=".55"/>`,
  );

  // Front layer: composed towers, then the street.
  const towers = city.front.filter((t) => !t.street);
  const street = city.front.filter((t) => t.street);
  parts.push(towerPaths(towers, night ? mood.front : mood.front, mood));
  parts.push(piers(towers, 12, mood, 2));
  parts.push(ledges(towers, mood));
  if (!night) {
    // Copper-patina crowns and a gilt spire on the daytime hero.
    const { hero } = city;
    const right = profile(hero);
    const crownStart = right.findIndex(
      ([, y]) => y <= H - 400 - 220 - 150 - 104,
    );
    const crown = right.slice(crownStart);
    const base = crown[0][1];
    const crownRight = [[hero.cx, base], ...crown];
    parts.push(
      `<path fill="#2f7564" d="${poly(mirror(hero, crownRight))}"/><path fill="#1d5a4b" d="${poly(crownRight)}"/>`,
    );
    const spire = right.slice(-3);
    const spireRight = [[hero.cx, spire[0][1]], ...spire];
    parts.push(
      `<path fill="#d3a64e" d="${poly(mirror(hero, spireRight))}"/><path fill="#a87b2a" d="${poly(spireRight)}"/>`,
    );
    // Terracotta spandrel bands on the jade east tower.
    const { east } = city;
    let ey = H;
    let bands = "";
    for (const tier of east.tiers.slice(0, 2)) {
      for (let y = ey - 40; y > ey - tier.h + 20; y -= 46)
        bands += `M${east.cx - tier.hw + 8} ${y}H${east.cx + tier.hw - 8}`;
      ey -= tier.h;
    }
    parts.push(
      `<path stroke="#e8c58a" stroke-opacity=".35" stroke-width="3" d="${bands}"/>`,
    );
  }
  parts.push(
    night
      ? windows(towers, lightRand, {
          min: 0.1,
          max: 0.2,
          col: 12,
          row: 18,
          w: 5,
          h: 9,
          floor: 0,
          colors: [
            ["#ffc35a@.9", "#ffd98a@.85", "#ffe9bf@.8", "#ffb347@.7"],
            ["#ffc35a@.55", "#ff9f6e@.5", "#ffb347@.45"],
          ],
        })
      : windows(towers, lightRand, {
          min: 0.05,
          max: 0.1,
          col: 12,
          row: 18,
          w: 5,
          h: 9,
          floor: 0,
          colors: [["#fff3d6@.6", "#f8e0b0@.45"], ["#2a120a@.18"]],
        }),
  );
  if (night) {
    parts.push(
      floodlights([city.hero], 1),
      floodlights([city.east, city.west], 1),
    );
    parts.push(neon(city));
  } else {
    parts.push(sparkle(HERO_X, towerTop(city.hero) - 16, 18, "#fff8e6", 0.95));
  }

  parts.push(towerPaths(street, mood.street, mood));
  parts.push(piers(street, 14, mood, 1.6));
  parts.push(ledges(street, mood, mood.ledgeOpacity * 0.7));
  parts.push(
    night
      ? windows(street, lightRand, {
          min: 0.04,
          max: 0.12,
          col: 14,
          row: 20,
          w: 6,
          h: 8,
          floor: 0,
          colors: [["#ffc35a@.7", "#ffe9bf@.6"], ["#ffb347@.4"]],
        })
      : "",
  );
  parts.push(marquee(city, mood, lightRand));
  parts.push(`<rect y="1260" width="${W}" height="180" fill="url(#ground)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${defs}${parts.join("")}</svg>\n`;
}

const city = buildCity();
await mkdir(outDir, { recursive: true });
for (const mood of [NIGHT, DAY]) {
  const svg = render(mood, city);
  const file = resolve(outDir, `deco-skyline-${mood.name}.svg`);
  await writeFile(file, svg);
  console.log(
    `${file.replace(root + "/", "")} ${(svg.length / 1024).toFixed(1)} KB`,
  );
}
