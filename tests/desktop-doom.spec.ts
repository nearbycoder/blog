import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const runtime = "https://cdn.jsdelivr.net/npm/js-dos@8.4.1/dist/js-dos.js";
const fakeRuntime = `
window.doomProbe = { paused: false, muted: true, keys: [], stopped: false };
window.Dos = (host, options) => {
  host.innerHTML = '<canvas width="320" height="200"></canvas>';
  const ci = {
    pause: () => { doomProbe.paused = true; }, resume: () => { doomProbe.paused = false; },
    mute: () => { doomProbe.muted = true; }, unmute: () => { doomProbe.muted = false; },
    sendKeyEvent: (code, pressed) => doomProbe.keys.push([code, pressed]),
    events: () => ({ onExit: () => {} })
  };
  setTimeout(() => options.onEvent('ci-ready', ci), 20);
  return { setNoCloud: () => {}, setVolume: () => {}, stop: async () => { doomProbe.stopped = true; } };
};`;

test.beforeEach(async ({ page }) => {
  await page.route(
    "https://cdn.jsdelivr.net/npm/js-dos@8.4.1/dist/js-dos.css",
    (route) => route.fulfill({ body: "", contentType: "text/css" }),
  );
});
async function openDoom(page: import("@playwright/test").Page) {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page
    .getByRole("searchbox", { name: "Search applications and files" })
    .fill("doom");
  await page.locator("[data-launcher-results] button").first().click();
  await expect(
    page.getByRole("heading", { name: "Yes, it runs DOOM." }),
  ).toBeVisible();
}

test("Doom loads on demand, pauses when hidden, resumes, and disposes on stop or close", async ({
  page,
}) => {
  let loads = 0;
  await page.route(runtime, (route) => {
    loads++;
    return route.fulfill({ body: fakeRuntime, contentType: "text/javascript" });
  });
  await openDoom(page);
  expect(loads).toBe(0);
  await expect(page.locator("[data-doom-host] iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Play DOOM", exact: true }).click();
  await expect(page.locator("[data-doom-status]")).toContainText(
    "DOOM is running",
  );
  expect(loads).toBe(1);
  const frame = page.frameLocator("[data-doom-host] iframe");
  const probe = () =>
    frame.locator("body").evaluate(() => (window as any).doomProbe);
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await expect.poll(async () => (await probe()).muted).toBe(false);
  await page.getByRole("button", { name: "Memory", exact: true }).click();
  await expect.poll(async () => (await probe()).paused).toBe(true);
  await page.getByRole("button", { name: "DOOM", exact: true }).click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(async () => (await probe()).paused).toBe(false);
  await page
    .getByRole("button", { name: "Minimize Arcade", exact: true })
    .click();
  await expect.poll(async () => (await probe()).paused).toBe(true);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await frame.locator("canvas").click();
  await page.keyboard.press("Control+Escape");
  await expect(
    page.getByRole("searchbox", { name: "Search applications and files" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await frame.locator("canvas").click();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("combobox", { name: "Search desktop commands" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Stop game", exact: true }).click();
  await expect(page.locator("[data-doom-host] iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Play DOOM", exact: true }).click();
  await expect(page.locator("[data-doom-status]")).toContainText(
    "DOOM is running",
  );
  await page.getByRole("button", { name: "Close Arcade", exact: true }).click();
  await expect(page.locator("[data-doom-host] iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await page.getByRole("button", { name: "DOOM", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play DOOM", exact: true }),
  ).toBeVisible();
});

test("failed runtime loads can be retried and loading can be cancelled", async ({
  page,
}) => {
  await page.route(runtime, (route) => route.abort());
  await openDoom(page);
  await page.getByRole("button", { name: "Play DOOM", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Retry DOOM", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-doom-status]")).toContainText(
    "Check your connection",
  );
  await page.unroute(runtime);
  await page.route(runtime, (route) =>
    route.fulfill({ body: fakeRuntime, contentType: "text/javascript" }),
  );
  await page.getByRole("button", { name: "Retry DOOM", exact: true }).click();
  await expect(page.locator("[data-doom-status]")).toContainText(
    "DOOM is running",
  );
  await page.getByRole("button", { name: "Stop game", exact: true }).click();
  await page.unroute(runtime);
  await page.route(runtime, (route) =>
    route.fulfill({
      body: "window.Dos = () => ({ setNoCloud() {}, stop: async () => {} });",
      contentType: "text/javascript",
    }),
  );
  await page.getByRole("button", { name: "Play DOOM", exact: true }).click();
  await page.getByRole("button", { name: "Stop game", exact: true }).click();
  await expect(page.locator("[data-doom-host] iframe")).toHaveCount(0);
});

test("mobile controls send held keys, release them, and keep the panel accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.route(runtime, (route) =>
    route.fulfill({ body: fakeRuntime, contentType: "text/javascript" }),
  );
  await openDoom(page);
  await page.getByRole("button", { name: "Play DOOM", exact: true }).click();
  await expect(page.locator("[data-doom-status]")).toContainText(
    "DOOM is running",
  );
  const fire = page.getByRole("button", { name: "Fire", exact: true });
  await fire.scrollIntoViewIfNeeded();
  const box = (await fire.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  const frame = page.frameLocator("[data-doom-host] iframe");
  await expect
    .poll(() =>
      frame.locator("body").evaluate(() => (window as any).doomProbe.keys),
    )
    .toEqual([
      [341, true],
      [341, false],
    ]);
  await page.getByRole("button", { name: "Move forward", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      frame
        .locator("body")
        .evaluate(() => (window as any).doomProbe.keys.slice(-2)),
    )
    .toEqual([
      [265, true],
      [265, false],
    ]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (theme) => (document.documentElement.dataset.theme = theme),
      theme,
    );
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});
