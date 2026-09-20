import { expect, test, type Page } from "@playwright/test";

async function openFocus(page: Page) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="focus"]').click();
  const app = page.locator('[data-window="focus"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  return app;
}

test("Focus preserves unreadable saved timers through edits, completion and close", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/desktop/");
  for (const saved of [
    "broken timer",
    '{"mode":"Focus","duration":-1}',
    "x".repeat(4097),
  ]) {
    await page.evaluate(
      (value) => localStorage.setItem("nearby-desktop-focus-v1", value),
      saved,
    );
    const app = await openFocus(page);
    await expect(app.locator("[data-focus-message]")).toContainText(
      "original data is unchanged",
    );
    await app.getByLabel("Minutes", { exact: true }).fill("1");
    await app.getByRole("button", { name: "Set timer", exact: true }).click();
    await app.getByRole("button", { name: "Start timer", exact: true }).click();
    await page.clock.fastForward(60000);
    await expect(app.getByRole("timer")).toHaveText("00:00");
    await expect(app.locator("[data-focus-message]")).toContainText(
      "original data is unchanged",
    );
    await app.getByRole("button", { name: "Close Focus", exact: true }).click();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("nearby-desktop-focus-v1"),
      ),
    ).toBe(saved);
  }
});

test("Focus does not overwrite a timer when its initial storage read is blocked", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const saved = JSON.stringify({
    mode: "Short break",
    duration: 300,
    remaining: 123,
    deadline: null,
    completed: 4,
  });
  await page.evaluate((value) => {
    localStorage.setItem("nearby-desktop-focus-v1", value);
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      if (key === "nearby-desktop-focus-v1") {
        Storage.prototype.getItem = original;
        throw new DOMException("Read unavailable", "SecurityError");
      }
      return original.call(this, key);
    };
  }, saved);
  const app = await openFocus(page);
  await expect(app.locator("[data-focus-message]")).toContainText(
    "Changes stay in this session",
  );
  await app.getByRole("button", { name: "Start timer", exact: true }).click();
  await app.getByRole("button", { name: "Close Focus", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("nearby-desktop-focus-v1")),
  ).toBe(saved);
  const restored = await openFocus(page);
  await expect(restored.getByRole("timer")).toHaveText("02:03");
});
