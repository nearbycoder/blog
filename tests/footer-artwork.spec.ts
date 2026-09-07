import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { site } from "../src/data/site";
const artwork = JSON.parse(
  readFileSync(
    new URL("../src/data/article-artwork.json", import.meta.url),
    "utf8",
  ),
) as Record<string, { src: string; alt: string; kind: string }>;

test("footer keeps every destination in compact responsive groups", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator(".site-footer");
  for (const link of [...site.nav, ...site.explore])
    await expect(footer.locator(`a[href="${link.href}"]`)).toHaveCount(1);
  await expect(
    footer.getByRole("navigation", { name: "Footer" }).locator(".footer-group"),
  ).toHaveCount(4);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await footer.scrollIntoViewIfNeeded();
    const bounds = await footer.boundingBox();
    expect(bounds!.height, `footer height at ${width}`).toBeLessThan(
      width <= 640 ? 850 : width <= 1050 ? 540 : 440,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const columns = await page
      .locator(".footer-navigation")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width < 768 ? 2 : 4);
  }
  await footer.getByRole("button", { name: "Keyboard shortcuts" }).click();
  await expect(
    page.getByRole("dialog", { name: "Keyboard shortcuts", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    footer.getByRole("button", { name: "Keyboard shortcuts" }),
  ).toBeFocused();
});

test("every article has unique cover bytes, consistent cards and hero art, and unique social artwork", async ({
  page,
  request,
}) => {
  await page.goto("/articles/");
  const cards = page.locator(".article-card");
  await expect(cards).toHaveCount(Object.keys(artwork).length);
  const sources = await cards
    .locator("img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("src")));
  expect(new Set(sources).size).toBe(sources.length);
  const coverHashes = new Set<string>(),
    socialHashes = new Set<string>();
  for (const [slug, art] of Object.entries(artwork)) {
    expect(sources).toContain(art.src);
    expect(art.src).not.toContain("editorial-curiosity");
    const bytes = readFileSync("public" + art.src);
    coverHashes.add(createHash("sha256").update(bytes).digest("hex"));
    if (art.kind === "generated") {
      expect(bytes.length).toBeLessThan(400_000);
      const meta = await sharp(bytes).metadata();
      expect(meta.width).toBe(1440);
    }
    await page.goto(`/articles/${slug}/`);
    await expect(page.locator(".reading-cover img")).toHaveAttribute(
      "src",
      art.src,
    );
    await expect(page.locator(".reading-cover img")).toHaveAttribute(
      "alt",
      art.alt,
    );
    const social = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const response = await request.get(new URL(social!).pathname);
    expect(response.ok()).toBe(true);
    const panel = await sharp(await response.body())
      .extract({ left: 810, top: 0, width: 390, height: 630 })
      .raw()
      .toBuffer();
    socialHashes.add(createHash("sha256").update(panel).digest("hex"));
  }
  expect(coverHashes.size).toBe(Object.keys(artwork).length);
  expect(socialHashes.size).toBe(Object.keys(artwork).length);
});
