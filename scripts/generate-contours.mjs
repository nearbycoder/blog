// Generates the topographic contour artwork used across the blog theme.
// Run with `node scripts/generate-contours.mjs`; output is committed to /public/images.
import { writeFileSync } from "node:fs";

function field(seed, width, height) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  // A handful of soft hills and basins makes believable terrain.
  const bumps = Array.from({ length: 14 }, () => ({
    x: rand() * width,
    y: rand() * height,
    r: 120 + rand() * 260,
    h: (rand() - 0.35) * 2,
  }));
  return (x, y) =>
    bumps.reduce(
      (sum, b) =>
        sum + b.h * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / b.r ** 2),
      0.18 * Math.sin(x / 190) + 0.14 * Math.cos(y / 150),
    );
}

function contours({ seed, width, height, step = 8, levels = 22 }) {
  const f = field(seed, width, height);
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const grid = [];
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const v = f(i * step, j * step);
      grid.push(v);
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  const at = (i, j) => grid[j * cols + i];
  const paths = [];
  for (let l = 1; l < levels; l++) {
    const t = min + ((max - min) * l) / levels;
    let d = "";
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < cols - 1; i++) {
        const v = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
        const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
        const pts = [];
        for (let e = 0; e < 4; e++) {
          const a = v[e];
          const b = v[(e + 1) % 4];
          if ((a < t) !== (b < t)) {
            const k = (t - a) / (b - a);
            const [x1, y1] = c[e];
            const [x2, y2] = c[(e + 1) % 4];
            pts.push([
              (x1 + (x2 - x1) * k) * step,
              (y1 + (y2 - y1) * k) * step,
            ]);
          }
        }
        for (let p = 0; p + 1 < pts.length; p += 2)
          d += `M${pts[p][0].toFixed(1)} ${pts[p][1].toFixed(1)}L${pts[p + 1][0].toFixed(1)} ${pts[p + 1][1].toFixed(1)}`;
      }
    // Every fifth line is an index contour, drawn heavier like a survey map.
    if (d) paths.push(`<path d="${d}"${l % 5 === 0 ? ' stroke-width="1.6"' : ""}/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="#000" stroke-width="0.8" stroke-linecap="round">${paths.join("")}</svg>`;
}

writeFileSync(
  "public/images/contours.svg",
  contours({ seed: 36154, width: 1600, height: 900 }),
);
writeFileSync(
  "public/images/contours-tall.svg",
  contours({ seed: 95993, width: 900, height: 1200, levels: 18 }),
);
