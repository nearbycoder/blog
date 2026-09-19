import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const launcher = "#desktop-launcher";
const library = '[data-window="library"]';

test("boots to wallpaper; launcher searches content and opens applications", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Keep the nested video pending: shell controls must not wait for its load event.
  let finishVideo!: () => void;
  const videoGate = new Promise<void>((resolve) => {
    finishVideo = resolve;
  });
  await page.route("https://www.youtube.com/**", async (route) => {
    await videoGate;
    await route.fulfill({ contentType: "text/html", body: "Video fixture" });
  });
  await page.goto("/desktop/");
  await expect(page.locator(library)).toBeHidden();
  expect((await request.get("/images/desktop/emerald-glass.webp")).ok()).toBe(
    true,
  );
  await page.keyboard.press("Control+Escape");
  const search = page.getByRole("searchbox", {
    name: "Search applications and files",
  });
  await expect(search).toBeFocused();
  await search.fill("does-not-exist-238342");
  await expect(page.locator("[data-launcher-count]")).toContainText(
    "No results",
  );
  await search.fill("codesplit");
  const result = page
    .locator("[data-launcher-results] button")
    .filter({ hasText: "React and Vite" })
    .first();
  await expect(result).toBeVisible();
  await search.press("ArrowDown");
  await expect(
    page.locator("[data-launcher-results] button").first(),
  ).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(search).toBeFocused();
  await result.click();
  await expect(page.locator(launcher)).toBeHidden();
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toContainText("React and Vite");
  await expect(page.locator("[data-reader-loading]")).toBeHidden();
  // The shell shortcut also works while focus is inside the embedded blog.
  await page.frameLocator("[data-desktop-reader]").locator("h1").click();
  await page.keyboard.press("Control+Escape");
  await search.fill("terminal");
  await search.press("Enter");
  await expect(page.locator(".pocket-terminal")).toBeVisible();
  await expect(page.locator(launcher)).toBeHidden();
  finishVideo();
  expect(errors).toEqual([]);
});

test("launcher dismissal, places, and detail/icon views work", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const toggle = page.getByRole("button", {
    name: "Open application launcher",
  });
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.locator("[data-workspace]").click({ position: { x: 700, y: 10 } });
  await expect(page.locator(launcher)).toBeHidden();
  await toggle.click();
  await page.locator('[data-launch-folder="projects"]').click();
  await expect(page.locator("[data-folder-title]")).toHaveText("Projects");
  await expect(page.locator("[data-breadcrumb]")).toHaveText("Projects");
  const count = await page.locator("[data-file]:visible").count();
  await page.getByRole("button", { name: "Icons view" }).click();
  await expect(
    page.getByRole("button", { name: "Icons view" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-file]:visible")).toHaveCount(count);
  await expect(page.locator(".file-list-head")).toBeHidden();
  await page.locator("[data-desktop-file]:visible").first().click();
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  await toggle.click();
  await page.frameLocator("[data-desktop-reader]").locator("h1").click();
  await expect(page.locator(launcher)).toBeHidden();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.getByRole("button", { name: "Details view" }).click();
  await expect(page.locator(".file-list-head")).toBeVisible();
  await page.getByRole("button", { name: "Go to all files" }).click();
  await expect(page.locator("[data-folder-title]")).toHaveText("All files");
});

test("show desktop restores the visible windows and keeps minimized windows minimized", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="projects"]').click();
  await page.locator("[data-desktop-file]:visible").first().click();
  const reader = page.locator(".reader-window");
  await reader.getByRole("button", { name: /Minimize/ }).click();
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  const card = page.locator(".memory-board button").first();
  await card.click();
  const show = page.getByRole("button", { name: "Show desktop", exact: true });
  await show.click();
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await expect(show).toHaveAttribute("aria-pressed", "true");
  await show.click();
  await expect(page.locator(library)).toBeVisible();
  await expect(page.locator(".arcade-window")).toBeVisible();
  await expect(card).toHaveAttribute("data-state", "face-up");
  await expect(reader).toBeHidden();
  // Opening an app during Show desktop ends that mode without resurrecting windows.
  await show.click();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(show).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".arcade-window")).toBeHidden();
});

test("calendar uses local dates, handles year boundaries and stays exclusive with launcher", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(2026, 11, 31, 14, 5) });
  await page.goto("/desktop/");
  await expect(page.locator("[data-panel-time]")).toHaveText("14:05");
  await page
    .getByRole("button", { name: "Open calendar", exact: true })
    .click();
  await expect(page.locator("[data-calendar-month]")).toHaveText(
    "December 2026",
  );
  await expect(
    page.locator('.calendar-days [aria-current="date"]'),
  ).toHaveAttribute("datetime", "2026-12-31");
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.locator("[data-calendar-month]")).toHaveText(
    "January 2027",
  );
  await expect(page.locator(".calendar-days time")).toHaveCount(31);
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.locator("[data-calendar-month]")).toHaveText(
    "December 2026",
  );
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.locator(".calendar-days time")).toHaveCount(30);
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(page.locator("[data-calendar-month]")).toHaveText(
    "December 2026",
  );
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await expect(page.locator("#desktop-calendar")).toBeHidden();
  await page
    .getByRole("button", { name: "Open calendar", exact: true })
    .click();
  await expect(page.locator(launcher)).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open calendar", exact: true }),
  ).toBeFocused();
});

test("shell popups fit mobile and pass accessibility checks in both themes", async ({
  page,
}) => {
  await page.goto("/desktop/");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      for (const [name, selector] of [
        ["Open application launcher", launcher],
        ["Open calendar", "#desktop-calendar"],
      ]) {
        await page.getByRole("button", { name, exact: true }).click();
        const bounds = (await page.locator(selector).boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        expect(bounds.y).toBeGreaterThanOrEqual(0);
        expect(bounds.y + bounds.height).toBeLessThan(850);
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(result.violations).toEqual([]);
        await page.keyboard.press("Escape");
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
});
