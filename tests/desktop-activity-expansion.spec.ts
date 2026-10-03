import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const key = "nearby-desktop-activity-v1";
const initial = {
  version: 1,
  history: [],
  dnd: false,
  favorites: ["notes", "tasks", "focus"],
  recent: [],
};

async function openActivity(page: Page) {
  await page.locator('[data-open-app="activity"]').click();
  const app = page.locator('[data-window="activity"]');
  await expect(app.locator(".activity-app")).toBeVisible();
  return app;
}
async function notify(
  page: Page,
  message: string,
  kind: "app" | "system" | "reminder" = "system",
) {
  await page.evaluate(
    ({ message, kind }) =>
      document.dispatchEvent(
        new CustomEvent("desktop-notify", { detail: { message, kind } }),
      ),
    { message, kind },
  );
}
async function launch(page: Page, id: string) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(page.locator(`[data-window="${id}"]`)).toBeVisible();
}

test("activity history filters, dismisses, marks read, and keeps quiet notifications", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openActivity(page);
  if (await app.locator("[data-activity-clear]").isEnabled())
    await app.locator("[data-activity-clear]").click();
  await notify(page, "Workspace layout saved", "system");
  await notify(page, "Notebook imported", "app");
  await notify(page, "Time for a stretch", "reminder");
  await expect(page.locator("[data-activity-unread]")).toHaveText("3");
  await expect(app.locator("[data-activity-entry]")).toHaveCount(3);
  await expect(page.locator("[data-reminder-announcement]")).toHaveText(
    "Time for a stretch",
  );
  await app
    .getByRole("combobox", { name: "Filter notification type" })
    .selectOption("reminder");
  await expect(app.locator("[data-activity-entry]")).toHaveCount(1);
  await expect(app.locator("[data-activity-entry]")).toContainText(
    "Time for a stretch",
  );
  await app
    .getByRole("button", { name: "Dismiss: Time for a stretch", exact: true })
    .click();
  await expect(page.locator("[data-activity-unread]")).toHaveText("2");
  await expect(
    app.getByText("No notifications of this type.", { exact: true }),
  ).toBeVisible();
  await app
    .getByRole("combobox", { name: "Filter notification type" })
    .selectOption("all");
  await app.getByRole("checkbox", { name: /^Do not disturb/ }).check();
  await expect(page.locator(".desktop-notification")).toHaveCount(0);
  const message = '<img src=x onerror="window.activityInjected=true">';
  await notify(page, message, "reminder");
  await expect(page.locator(".desktop-notification")).toHaveCount(0);
  await expect(app.locator("[data-activity-entry]").first()).toContainText(
    message,
  );
  await expect(app.locator("[data-activity-history] img")).toHaveCount(0);
  await expect(page.locator("[data-activity-unread]")).toHaveText("3");
  await app.getByRole("button", { name: "Mark all read", exact: true }).click();
  await expect(page.locator("[data-activity-unread]")).toBeHidden();
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(stored.dnd).toBe(true);
  expect(stored.history).toHaveLength(3);
  expect(stored.history.every((entry: { read: boolean }) => entry.read)).toBe(
    true,
  );
  await page.reload();
  const restored = await openActivity(page);
  await expect(
    restored.getByRole("checkbox", { name: /^Do not disturb/ }),
  ).toBeChecked();
  await expect(restored.locator("[data-activity-history]")).toContainText(
    "Workspace layout saved",
  );
  await restored
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(restored.locator("[data-activity-entry]")).toHaveCount(0);
  await expect(page.locator("[data-activity-unread]")).toBeHidden();
});

test("launcher favorites are bounded, persist, and launch apps; recents can be cleared", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openActivity(page);
  await app
    .getByRole("button", { name: "Pin Calculator", exact: true })
    .click();
  await expect(
    app.getByRole("button", { name: "Unpin Calculator", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const name of ["Sketchpad", "Markdown Pad", "JSON Desk", "Converter"])
    await app.getByRole("button", { name: `Pin ${name}`, exact: true }).click();
  await expect(app.locator("[data-favorites-total]")).toHaveText(
    "8 / 8 pinned",
  );
  await expect(
    app.getByRole("button", { name: "Pin World Clock", exact: true }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Unpin Notes", exact: true }).click();
  await expect(
    app.getByRole("button", { name: "Pin World Clock", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  const pinned = page.locator('[data-quick-section="favorites"]');
  await expect(pinned.locator('[data-quick-app="calculator"]')).toBeVisible();
  await expect(pinned.locator('[data-quick-app="notes"]')).toHaveCount(0);
  await pinned.locator('[data-quick-app="calculator"]').click();
  await expect(page.locator('[data-window="calculator"]')).toBeVisible();
  await expect(page.locator("#desktop-launcher")).toBeHidden();
  await launch(page, "notes");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  const recent = page.locator('[data-quick-section="recent"]');
  await expect(recent.locator("[data-quick-app]").first()).toHaveAttribute(
    "data-quick-app",
    "notes",
  );
  await expect(recent.locator('[data-quick-app="calculator"]')).toHaveCount(1);
  await recent.locator('[data-quick-app="calculator"]').click();
  await expect(page.locator('[data-window="calculator"]')).toHaveCount(1);
  await page.reload();
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await expect(pinned.locator('[data-quick-app="calculator"]')).toBeVisible();
  await expect(recent.locator('[data-quick-app="calculator"]')).toBeVisible();
  await recent
    .getByRole("button", { name: "Clear recent apps", exact: true })
    .click();
  await expect(recent.locator("[data-quick-app]")).toHaveCount(0);
  expect(
    (await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key))
      .recent,
  ).toEqual([]);
});

test("future, malformed, and oversized activity state remains untouched", async ({
  page,
}) => {
  await page.goto("/desktop/");
  for (const raw of [
    "broken activity",
    JSON.stringify({ ...initial, version: 2 }),
    JSON.stringify({ ...initial, futureField: true }),
    JSON.stringify({ ...initial, favorites: ["notes", "notes"] }),
    JSON.stringify({ ...initial, recent: ["unknown-app"] }),
    "x".repeat(128 * 1024 + 1),
  ]) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key,
      raw,
    });
    await page.reload();
    const app = await openActivity(page);
    await expect(app.locator("[data-activity-status]")).toContainText(
      "the original is preserved",
    );
    await app.getByRole("checkbox", { name: /^Do not disturb/ }).check();
    await app
      .getByRole("button", { name: "Pin Calculator", exact: true })
      .click();
    await notify(page, "Only for this visit");
    await expect(app.locator("[data-activity-history]")).toContainText(
      "Only for this visit",
    );
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
      raw,
    );
  }
});

test("activity bounds stored history, caps recent apps, and safely rejects malformed events", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openActivity(page);
  await app.getByRole("checkbox", { name: /^Do not disturb/ }).check();
  await page.evaluate(() => {
    for (let index = 0; index < 110; index++)
      document.dispatchEvent(
        new CustomEvent("desktop-notify", {
          detail: { message: `Message ${index}`, kind: "system" },
        }),
      );
    for (const id of [
      "notes",
      "tasks",
      "focus",
      "calculator",
      "sketchpad",
      "markdown",
      "json",
      "converter",
      "worldclock",
      "colors",
      "colors",
    ])
      document.dispatchEvent(
        new CustomEvent("desktop-app-launched", { detail: { id } }),
      );
    for (const detail of [
      null,
      {},
      { message: "", kind: "system" },
      { message: "invalid", kind: "other" },
    ])
      document.dispatchEvent(new CustomEvent("desktop-notify", { detail }));
  });
  await expect(app.locator("[data-activity-entry]")).toHaveCount(100);
  await expect(app.locator("[data-activity-entry]").first()).toContainText(
    "Message 109",
  );
  await expect(app.locator("[data-activity-entry]").last()).toContainText(
    "Message 10",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.recent).toHaveLength(8);
  expect(new Set(saved.recent).size).toBe(8);
  expect(saved.recent[0]).toBe("colors");
  await app
    .getByRole("button", { name: "Close Activity", exact: true })
    .click();
  await notify(page, "Still listening once");
  const reopened = await openActivity(page);
  await expect(
    reopened
      .locator("[data-activity-entry]")
      .filter({ hasText: "Still listening once" }),
  ).toHaveCount(1);
});

test("long Unicode notifications evict oldest history within the byte budget", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(() => {
    for (let index = 0; index < 110; index++)
      document.dispatchEvent(
        new CustomEvent("desktop-notify", {
          detail: { message: `${index}: ${"界".repeat(496)}`, kind: "system" },
        }),
      );
  });
  const saved = await page.evaluate((key) => {
    const raw = localStorage.getItem(key)!;
    return { bytes: new TextEncoder().encode(raw).length, ...JSON.parse(raw) };
  }, key);
  expect(saved.bytes).toBeLessThanOrEqual(128 * 1024);
  expect(saved.history.length).toBeGreaterThan(50);
  expect(saved.history.length).toBeLessThan(100);
  expect(saved.history[0].message).toMatch(/^109:/);
  expect(saved.history.at(-1).message).not.toMatch(/^0:/);
  await page.reload();
  const app = await openActivity(page);
  await expect(app.locator("[data-activity-status]")).toHaveText(
    "Saved on this device.",
  );
  await expect(app.locator("[data-activity-history]")).toContainText("109:");
});

test("toast bodies let pointer input through and retain keyboard focus until dismissed", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/desktop/");
  const app = await openActivity(page);
  const filter = app.getByRole("combobox", {
    name: "Filter notification type",
  });
  await filter.focus();
  await notify(page, "A reminder over your work", "reminder");
  const toast = page.locator(".desktop-notification");
  expect(
    await toast.locator("p").evaluate((element) => {
      const box = element.getBoundingClientRect();
      return !element
        .closest("aside")!
        .contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        );
    }),
  ).toBe(true);
  await expect(filter).toBeFocused();
  const dismiss = toast.getByRole("button", { name: "Dismiss notification" });
  await dismiss.focus();
  await page.clock.fastForward(9000);
  await expect(dismiss).toBeVisible();
  await dismiss.press("Enter");
  await expect(toast).toHaveCount(0);
  await expect(filter).toBeFocused();
  await notify(page, "Another reminder", "reminder");
  await page.clock.fastForward(8001);
  await expect(toast).toHaveCount(0);
});

for (const width of [320, 1440]) {
  test(`Activity controls support touch and accessible navigation at ${width}px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(`${test.info().project.use.baseURL}/desktop/`);
    const app = await openActivity(page);
    await notify(page, "Readable notification", "system");
    await expect(app.locator("[data-activity-history]")).toContainText(
      "Readable notification",
    );
    const select = app.getByRole("combobox", {
      name: "Filter notification type",
    });
    expect(
      await select.evaluate((element) =>
        parseFloat(getComputedStyle(element).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);
    for (const control of await app
      .locator(".activity-app button:visible, .activity-app select:visible")
      .all())
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(
      await app
        .locator(".activity-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .include('[data-window="activity"]')
      .analyze();
    expect(results.violations).toEqual([]);
    await page
      .getByRole("button", { name: "Open application launcher", exact: true })
      .click();
    for (const button of await page
      .locator("[data-desktop-quick-apps] button:visible")
      .all())
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
}
