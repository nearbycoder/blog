import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { resolveNewsletterUrl } from "../src/lib/newsletter";

test("signup configuration rejects unsafe destinations and self-redirects", () => {
  expect(resolveNewsletterUrl("")).toBeNull();
  expect(resolveNewsletterUrl("https://newsletter.example.com/josh")).toBe(
    "https://newsletter.example.com/josh",
  );
  for (const value of [
    "javascript:alert(1)",
    "http://example.com",
    "https://user:secret@example.com",
    "https://localhost/josh",
    "https://nearbycoder.com/subscribe/",
  ])
    expect(() => resolveNewsletterUrl(value)).toThrow();
});

test("unconfigured email has a working feed and no false signup flow", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/subscribe/");
  await expect(
    page.getByRole("heading", { name: "Email updates are on the way." }),
  ).toBeVisible();
  await expect(page.locator("[data-email-signup]")).toHaveCount(0);
  await expect(page.locator("input[type=email]")).toHaveCount(0);
  await page.getByRole("button", { name: "Copy feed URL" }).click();
  await expect(page.locator("#feed-status")).toHaveText("Feed URL copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://nearbycoder.com/rss.xml",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: async () => {
        throw new Error("blocked");
      },
    }),
  );
  await page.getByRole("button", { name: "Copy feed URL" }).click();
  await expect(page.locator("#feed-status")).toContainText(
    "Clipboard unavailable",
  );
  await page
    .getByRole("link", { name: "Get the RSS feed", exact: true })
    .click();
  await expect(page).toHaveURL(/\/rss.xml$/);
});

test("configured build shows the real signup destination and works without JavaScript", async ({
  page,
  browser,
}) => {
  mkdirSync("test-results", { recursive: true });
  const output = mkdtempSync(
    join(process.cwd(), "test-results", "newsletter-"),
  );
  try {
    execFileSync(
      process.execPath,
      ["node_modules/astro/bin/astro.mjs", "build", "--outDir", output],
      {
        env: {
          ...process.env,
          NEWSLETTER_SIGNUP_URL: "https://newsletter.example.com/josh",
        },
        stdio: "pipe",
        timeout: 60000,
      },
    );
    const html = readFileSync(join(output, "subscribe/index.html"), "utf8");
    await page.route("**/subscribe/", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto("/subscribe/");
    await expect(page.locator("[data-email-signup]")).toHaveAttribute(
      "href",
      "https://newsletter.example.com/josh",
    );
    await expect(
      page.getByRole("heading", { name: "A new post, in your inbox." }),
    ).toBeVisible();
    await expect(
      page.getByText("Email signups aren’t open yet.", { exact: false }),
    ).toHaveCount(0);
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.screenshot({
      path: "test-results/newsletter-configured-mobile.png",
      fullPage: true,
    });
    const context = await browser.newContext({ javaScriptEnabled: false });
    const plain = await context.newPage();
    await plain.route("**/subscribe/", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await plain.goto("http://127.0.0.1:4322/subscribe/");
    await expect(plain.locator("[data-email-signup]")).toHaveAttribute(
      "href",
      "https://newsletter.example.com/josh",
    );
    await context.close();
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
