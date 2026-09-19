import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";

const library = '[data-window="library"]';
const reader = ".reader-window";

test("desktop indexes every published collection entry and opens real content", async ({
  page,
  request,
}) => {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All files");
  // Compare to the generated public routes, including every dynamic content family.
  const hrefs = await page
    .locator("[data-desktop-file]")
    .evaluateAll((links) =>
      links.map((link) =>
        new URL((link as HTMLAnchorElement).href).pathname.replace(/\/$/, ""),
      ),
    );
  for (const family of [
    "articles",
    "projects",
    "layoff",
    "postmortems",
    "lab",
    "start-here",
    "topics",
    "technologies",
  ]) {
    for (const item of readdirSync(`dist/${family}`, {
      withFileTypes: true,
    }).filter((item) => item.isDirectory())) {
      expect(hrefs, `${family}/${item.name}`).toContain(
        `/${family}/${item.name}`,
      );
    }
  }
  const index = await (await request.get("/search-index.json")).json();
  expect(hrefs.filter((href) => href.startsWith("/articles/"))).toHaveLength(
    index.length,
  );
  await page.locator('[data-folder="articles"]').click();
  await expect(page.locator("[data-file]:visible")).toHaveCount(index.length);
  const first = page.locator("[data-desktop-file]:visible").first();
  const title = await first.getAttribute("data-file-title");
  await first.click();
  await expect(page.locator(reader)).toBeVisible();
  await expect(page.locator(reader).locator("iframe")).toHaveAttribute(
    "title",
    title!,
  );
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toHaveText(title!);
  await expect(
    page.frameLocator("[data-desktop-reader]").locator(".site-header"),
  ).toBeHidden();
  await expect(
    page.locator(reader).getByRole("link", { name: "Open in a tab" }),
  ).toHaveAttribute("href", /\/articles\//);
});

test("search, empty state, folder selection, and keyboard launcher work", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search desktop files" });
  await page.keyboard.press("Control+k");
  await expect(search).toBeFocused();
  await search.fill("no-such-file-938274");
  await expect(
    page.getByRole("heading", { name: "No files found" }),
  ).toBeVisible();
  await expect(page.locator("[data-file-count]")).toHaveText("0 files");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator("[data-desktop-empty]")).toBeHidden();
  await page.locator('[data-folder="projects"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await search.fill("AGFS");
  await expect(page.locator("[data-file]:visible")).toHaveCount(1);
  await expect(page.locator("[data-file]:visible")).toContainText(/agfs/i);
  await page.locator('[data-folder="all"]').click();
  // Search the article body, not just its title/description.
  const text = readFileSync(
    "src/content/articles/gettting-started-with-react-and-vitejs.md",
    "utf8",
  );
  expect(text).toContain("vite");
  await search.fill("codesplit");
  await expect(
    page.locator('a[href="/articles/gettting-started-with-react-and-vitejs/"]'),
  ).toBeVisible();
});

test("windows drag, resize, minimize, restore, maximize, and close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const win = page.locator(library);
  const before = (await win.boundingBox())!;
  const bar = (await win.locator("[data-drag-handle]").boundingBox())!;
  await page.mouse.move(bar.x + 180, bar.y + 20);
  await page.mouse.down();
  await page.mouse.move(bar.x + 280, bar.y + 90, { steps: 8 });
  await page.mouse.up();
  const moved = (await win.boundingBox())!;
  expect(moved.x).toBeGreaterThan(before.x + 80);
  expect(moved.y).toBeGreaterThan(before.y + 50);
  await page.mouse.move(moved.x + moved.width - 7, moved.y + moved.height - 7);
  await page.mouse.down();
  await page.mouse.move(
    moved.x + moved.width + 43,
    moved.y + moved.height + 43,
    { steps: 8 },
  );
  await page.mouse.up();
  expect((await win.boundingBox())!.width).toBeGreaterThan(moved.width + 30);
  await win.getByRole("button", { name: "Maximize Library" }).click();
  await expect(win).toHaveClass(/is-maximized/);
  await win.getByRole("button", { name: "Restore Library" }).click();
  await expect(win).not.toHaveClass(/is-maximized/);
  await win.getByRole("button", { name: "Minimize Library" }).click();
  await expect(win).toBeHidden();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(win).toBeVisible();
  await page.locator('[data-folder="lab"]').click();
  await page.getByRole("link", { name: /Cast a local vote/ }).click();
  const poll = page.frameLocator("[data-desktop-reader]");
  await poll.getByRole("radio", { name: "It solves my own problem" }).check();
  await poll.getByRole("button", { name: "Cast vote", exact: true }).click();
  await expect(poll.locator('[data-votes="0"]')).toHaveText("1 vote");
  await page
    .locator(reader)
    .getByRole("button", { name: /Minimize/ })
    .click();
  await expect(page.locator(reader)).toBeHidden();
  await page.getByRole("button", { name: "Show Cast a local vote" }).click();
  await expect(poll.locator('[data-votes="0"]')).toHaveText("1 vote");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.getByRole("link", { name: /Cast a local vote/ }).click();
  await expect(page.locator(reader)).toHaveCount(1);
  await page.locator(reader).getByRole("button", { name: /Close/ }).click();
  await expect(page.locator(reader)).toHaveCount(0);
  await expect(page.locator("[data-desktop-tasks] button")).toHaveCount(0);
  await page.getByRole("button", { name: "Arrange windows" }).click();
  expect((await win.boundingBox())!.x).toBe(before.x);
});

test("mobile can switch windows, read content, and recover an empty desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="projects"]').click();
  await page.locator("[data-desktop-file]:visible").first().click();
  await expect(page.locator(library)).toBeHidden();
  await expect(page.locator(reader)).toBeVisible();
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(page.locator(library)).toBeVisible();
  await expect(page.locator(reader)).toBeHidden();
  await page.locator('[data-folder="articles"]').click();
  await page.locator("[data-desktop-file]:visible").first().click();
  await expect(page.locator(reader)).toHaveCount(2);
  await page
    .locator(".reader-window.is-active")
    .getByRole("button", { name: /Close/ })
    .click();
  await expect(page.locator(library)).toBeVisible();
  await page
    .locator(library)
    .getByRole("button", { name: "Close Library" })
    .click();
  await expect(page.locator(reader)).toBeVisible();
  await page.locator(reader).getByRole("button", { name: /Close/ }).click();
  await expect(
    page.getByRole("navigation", { name: "Desktop shortcuts" }),
  ).toBeVisible();
  await page.locator('[data-open-folder="lab"]').click();
  await expect(page.locator(library)).toBeVisible();
  await expect(page.locator("[data-folder-title]")).toHaveText("Lab");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("desktop is accessible in both themes and works without browser storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
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
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator('[data-folder="pages"]').click();
  await page.getByRole("link", { name: /^About Page/ }).click();
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("without JavaScript the library still links to every page", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322/desktop/");
  await expect(page.locator(".desktop-shortcuts")).toBeVisible();
  await expect(page.locator(".desktop-noscript")).toContainText(
    "All file links still open normally",
  );
  const first = page.locator("[data-desktop-file]").first();
  const href = await first.getAttribute("href");
  await first.click();
  expect(new URL(page.url()).pathname).toBe(href);
  await context.close();
});

test("reader navigation updates its window and the search shortcut escapes the frame", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="pages"]').click();
  await page.locator('[data-desktop-file][href="/articles"]').click();
  const frame = page.frameLocator("[data-desktop-reader]");
  await frame.locator(".article-card").first().click();
  await expect(page.locator("[data-reader-location]")).toHaveText(
    /\/articles\/.+/,
  );
  const title = await frame.locator("h1").innerText();
  await expect(page.locator("[data-reader-title]")).toHaveText(title);
  await expect(page.locator("[data-reader-original]")).toHaveAttribute(
    "href",
    /\/articles\/.+/,
  );
  await frame.locator("h1").click();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("searchbox", { name: "Search desktop files" }),
  ).toBeFocused();
  await expect(
    frame.getByRole("dialog", { name: "Search this site" }),
  ).toBeHidden();
  await page.locator('[data-folder="articles"]').click();
  await page
    .locator("[data-desktop-file]")
    .filter({ hasText: title })
    .first()
    .click();
  await expect(page.locator(reader)).toHaveCount(1);
});
