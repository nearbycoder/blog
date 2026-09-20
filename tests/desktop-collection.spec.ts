import { test, expect } from "@playwright/test";
import { desktopApps } from "../src/lib/desktop-apps";

test("the expanded app collection loads one app at a time and adds no app code to the blog", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  const appPattern = new RegExp(
    `desktop-(${desktopApps.map((app) => app.id).join("|")})\\.[\\w-]+\\.js`,
  );
  for (const path of [
    "/",
    "/articles/gettting-started-with-react-and-vitejs/",
    "/desktop/",
  ]) {
    await page.goto(path);
    expect(requests.filter((url) => appPattern.test(url))).toEqual([]);
  }
  await expect(page.locator("style[data-desktop-app-style]")).toHaveCount(0);
  const opened: string[] = [];
  for (const app of desktopApps) {
    await page
      .getByRole("button", { name: "Open application launcher" })
      .click();
    await page.locator(`[data-launch-app="${app.id}"]`).click();
    const win = page.locator(`[data-window="${app.id}"]`);
    await expect(win.locator(".utility-loading")).toHaveCount(0);
    await expect(win).toHaveAttribute("aria-label", `${app.title} window`);
    await expect(
      page.locator(`style[data-desktop-app-style="${app.id}"]`),
    ).toHaveCount(1);
    opened.push(app.id);
    const downloaded = new Set(
      requests.flatMap((url) => appPattern.exec(url)?.[1] ?? []),
    );
    expect([...downloaded].sort()).toEqual([...opened].sort());
    await win
      .getByRole("button", { name: `Close ${app.title}`, exact: true })
      .click();
    await expect(win).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("launcher categories filter the collection while search spans every category", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await expect(page.locator("[data-launch-app]:visible")).toHaveCount(
    desktopApps.length,
  );
  await expect(page.locator("[data-app-count]")).toHaveText(
    `${desktopApps.length} applications`,
  );
  for (const category of ["work", "create", "tools", "play", "unwind"]) {
    await page.locator(`[data-app-category="${category}"]`).click();
    const count = desktopApps.filter((app) => app.category === category).length;
    await expect(page.locator("[data-launch-app]:visible")).toHaveCount(count);
    await expect(page.locator("[data-app-count]")).toHaveText(
      `${count} applications`,
    );
    await expect(
      page.locator(`[data-app-category="${category}"]`),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('[data-app-category][aria-pressed="true"]'),
    ).toHaveCount(1);
  }
  const search = page.getByRole("searchbox", {
    name: "Search applications and files",
  });
  await search.fill("JSON Desk");
  await expect(page.locator("[data-launcher-default]")).toBeHidden();
  await expect(page.locator("[data-launcher-results] button")).toHaveCount(1);
  await search.fill("");
  await expect(page.locator("[data-launcher-results]")).toBeHidden();
  await expect(page.locator('[data-app-category="unwind"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("[data-launch-app]:visible")).toHaveCount(
    desktopApps.filter((app) => app.category === "unwind").length,
  );
  await search.fill("JSON Desk");
  await search.press("Enter");
  await expect(page.locator('[data-window="json"]')).toBeVisible();
  await expect(page.locator("#desktop-launcher")).toBeHidden();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await expect(page.locator("[data-launch-app]:visible")).toHaveCount(
    desktopApps.length,
  );
  await expect(page.locator('[data-app-category="all"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("launcher restores its starting position and supports keyboard search without interrupting composition", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 650 });
  await page.goto("/desktop/");
  const toggle = page.getByRole("button", {
    name: "Open application launcher",
  });
  const launcher = page.locator("#desktop-launcher");
  const defaults = page.locator("[data-launcher-default]");
  const search = page.getByRole("searchbox", {
    name: "Search applications and files",
  });
  await toggle.click();
  await defaults.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(
    await defaults.evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await toggle.press("Enter");
  await expect(search).toBeFocused();
  expect(await defaults.evaluate((element) => element.scrollTop)).toBe(0);

  await search.fill("a");
  const resultsPanel = page.locator("[data-launcher-results]");
  await resultsPanel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(
    await resultsPanel.evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  await search.fill("studio");
  expect(await resultsPanel.evaluate((element) => element.scrollTop)).toBe(0);
  const results = page.locator("[data-launcher-results] button");
  await expect(results).toHaveCount(3);
  await search.press("ArrowDown");
  await expect(results.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(results.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(search).toBeFocused();

  await search.fill("JSON Desk");
  await search.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(launcher).toBeVisible();
  await expect(page.locator('[data-window="json"]')).toHaveCount(0);
  await search.press("Enter");
  await expect(launcher).toBeHidden();
  await expect(page.locator('[data-window="json"]')).toBeFocused();
});

test("launcher ignores unknown app identifiers without closing or raising an error", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  const notes = page.locator('[data-launch-app="notes"]');
  await notes.evaluate((button) => {
    (button as HTMLElement).dataset.launchApp = "unknown-application";
  });
  const invalid = page.locator('[data-launch-app="unknown-application"]');
  await invalid.click();
  await expect(page.locator("#desktop-launcher")).toBeVisible();
  await expect(page.locator(".utility-window")).toHaveCount(0);
  expect(errors).toEqual([]);
});
