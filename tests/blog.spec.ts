import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}
const htmlFiles = files("dist").filter((file) => file.endsWith(".html"));
const routes = htmlFiles.map(
  (file) => "/" + file.replace(/^dist\//, "").replace(/index\.html$/, ""),
);
const samples = [
  "/reading-list/",
  "/lab/",
  "/lab/roomba/",
  "/lab/poll/",
  "/lab/agent/",
  "/start-here/",
  "/start-here/building-with-ai/",
  "/now/",
  "/postmortems/",
  "/postmortems/roomba-wars/",
  "/",
  "/articles/",
  "/projects/",
  "/layoff/",
  "/about/",
  "/uses/",
  "/404.html",
  "/articles/building-agfs-dev-on-my-wifes-green-macbook-neo-with-ai/",
  "/articles/gettting-started-with-react-and-vitejs/",
  "/projects/agfs-dev/",
  "/layoff/week-003-2026-03-08-roomba-wars/",
];

test("every generated route has a single main heading, local canonical, working links, and 1200×630 social image", async ({
  page,
  request,
}) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1"), route).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/nearbycoder\.com\//);
    const social = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(social, route).toMatch(/^https:\/\/nearbycoder\.com\/.*\.png$/);
    const socialResponse = await request.get(new URL(social!).pathname);
    expect(socialResponse.ok(), social!).toBeTruthy();
    const metadata = await sharp(await socialResponse.body()).metadata();
    expect([metadata.width, metadata.height]).toEqual([1200, 630]);
    const brokenImages = await page
      .locator("img")
      .evaluateAll((images) =>
        images.map((image) => image.getAttribute("src")).filter((src) => !src),
      );
    expect(brokenImages, route).toEqual([]);
  }
  const assets = new Set<string>();
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(
      /(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g,
    ))
      assets.add(match[1]);
  }
  for (const asset of assets) {
    const response = await request.get(asset);
    expect(response.status(), asset).toBeLessThan(400);
  }
  const rss = await request.get("/rss.xml");
  expect(rss.ok()).toBeTruthy();
  expect(await rss.text()).toContain("<rss");
});

test("all pages fit phone and desktop widths without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBeFalsy();
    }
  }
  expect(errors).toEqual([]);
});

test("representative page families pass accessibility in light and dark themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.addInitScript(
      (value) => localStorage.setItem("theme-preference", value),
      theme,
    );
    for (const route of samples) {
      await page.goto(route);
      for (const frame of await page.locator("iframe").all()) {
        await expect(frame).toHaveAttribute("title", /.+/);
      }
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .exclude('iframe[src*="youtube.com"]')
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        `${theme} ${route}`,
      ).toEqual([]);
    }
  }
});

test("article search and topic filters combine, reset, and announce empty states", async ({
  page,
}) => {
  await page.goto("/articles/");
  const total = await page.locator("[data-article]").count();
  await page.getByRole("button", { name: "AI & agents", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "AI & agents", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("searchbox", { name: "Search articles" }).fill("AGFS");
  expect(await page.locator("[data-article]:visible").count()).toBeGreaterThan(
    0,
  );
  await page
    .getByRole("searchbox", { name: "Search articles" })
    .fill("a-title-that-does-not-exist");
  await expect(
    page.getByText("No articles match those filters."),
  ).toBeVisible();
  await expect(page.locator("#article-count")).toHaveText("0 articles");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("[data-article]:visible")).toHaveCount(total);
});

test("global search includes layoff entries, supports keyboard navigation, and restores focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open search" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("combobox").fill("Roomba");
  await expect(
    page.getByRole("option").filter({ hasText: "Layoff Build" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Uses");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/uses\/?$/);
});

test("theme controls and mobile navigation work by touch and keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await page.getByRole("button", { name: "Choose color theme" }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Open search" }).click();
  await page.getByRole("combobox").fill("Light mode");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Choose color theme" }).click();
  await expect(
    page.getByRole("button", { name: "Light", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open search" }).click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .exclude('iframe[src*="youtube.com"]')
    .analyze();
  expect(result.violations).toEqual([]);
});

test("article heading navigation and copy link share the canonical URL", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "/articles/building-agfs-dev-on-my-wifes-green-macbook-neo-with-ai/",
  );
  const first = page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link")
    .first();
  const href = await first.getAttribute("href");
  await first.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.locator("[data-copy-status]")).toContainText("Link copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://nearbycoder.com/articles/building-agfs-dev-on-my-wifes-green-macbook-neo-with-ai/",
  );
});

test("unknown routes show the designed 404 with a usable search action", async ({
  page,
}) => {
  const response = await page.goto("/this-page-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A wrong turn.",
  );
  await page.getByRole("button", { name: "Search the site" }).click();
  await expect(
    page.getByRole("dialog", { name: "Search this site" }),
  ).toBeVisible();
});
