import { test, expect } from "@playwright/test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// A quick check that the built site renders. Run `npm run build` first.

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}

// A local URL path resolves the way the static host serves it.
function served(path: string) {
  const file = join("dist", decodeURIComponent(path));
  return (
    (existsSync(file) && statSync(file).isFile()) ||
    existsSync(join(file, "index.html")) ||
    existsSync(`${file}.html`)
  );
}

test("every page has one heading, a social card, and local links that resolve", () => {
  const problems: string[] = [];
  const links = new Map<string, string>();
  const pages = files("dist").filter((name) => name.endsWith(".html"));
  expect(pages.length, "built pages").toBeGreaterThan(100);
  for (const file of pages) {
    const route = file.slice("dist".length).replace(/index\.html$/, "");
    const html = readFileSync(file, "utf8");
    const headings = html.match(/<h1[\s>]/g)?.length ?? 0;
    if (headings !== 1) problems.push(`${route}: ${headings} <h1> elements`);
    const card = html.match(
      /<meta property="og:image" content="https:\/\/nearbycoder\.com(\/[^"]+\.png)"/,
    )?.[1];
    if (!card || !served(card))
      problems.push(`${route}: no social card (${card})`);
    for (const [, path] of html.matchAll(
      /(?:href|src|srcset|poster)="(\/(?!\/)[^"#?\s,]*)/g,
    ))
      if (!links.has(path)) links.set(path, route);
  }
  for (const [path, route] of links)
    if (!served(path)) problems.push(`${route}: broken local link ${path}`);
  expect(problems).toEqual([]);
});

// One page of each kind, in a real browser.
const samples = [
  "/",
  "/about/",
  "/articles/",
  "/articles/building-agfs-dev-on-my-wifes-green-macbook-neo-with-ai/",
  "/projects/",
  "/projects/soloagent-dev/",
  "/games/",
  "/games/dusk-station/",
  "/technologies/webgl2/",
  "/topics/ai/",
  "/start-here/",
  "/lab/roomba/",
  "/postmortems/roomba-wars/",
  "/layoff/",
  "/search/",
  "/subscribe/",
  "/desktop/",
  "/404.html",
];

for (const path of samples) {
  test(`${path} renders without errors at desktop and phone widths`, async ({
    page,
    baseURL,
  }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) =>
      problems.push(`script error: ${error.message}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(baseURL!))
        problems.push(`${response.status()} ${response.url()}`);
    });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, `wider than ${width}px`).toBe(false);
    }
    expect(problems).toEqual([]);
  });
}
