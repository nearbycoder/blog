import { test, expect, type Page } from "@playwright/test";

async function openWorldClock(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="worldclock"]').click();
  const app = page.locator('[data-window="worldclock"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator(".worldclock-app")).toBeVisible();
  return app;
}

test.describe("World Clock", () => {
  test.use({ timezoneId: "America/New_York" });

  test("meeting preview uses the local timezone and handles seasonal DST offsets and next-day dates", async ({
    page,
  }) => {
    const app = await openWorldClock(page);
    await app.getByRole("button", { name: "Add city", exact: true }).click();
    await app.getByRole("searchbox").fill("Kathmandu");
    await app
      .getByRole("button", { name: "Add Kathmandu", exact: true })
      .click();
    await app.getByLabel("Meeting date", { exact: true }).fill("2026-01-15");
    await app.getByLabel("Meeting time", { exact: true }).fill("19:00");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.locator('[data-city="local"] time')).toHaveText(
      "19:00:00",
    );
    await expect(app.locator('[data-city="london"] time')).toHaveText(
      "00:00:00",
    );
    await expect(
      app.locator('[data-city="tokyo"] .worldclock-date'),
    ).toHaveText("Fri, Jan 16, 2026");
    await expect(app.locator('[data-city="kathmandu"] time')).toHaveText(
      "05:45:00",
    );
    await expect(
      app.locator('[data-city="london"] .worldclock-period'),
    ).toContainText("Next day");
    await app.getByLabel("Meeting date", { exact: true }).fill("2026-03-15");
    await app.getByLabel("Meeting time", { exact: true }).fill("12:00");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.locator('[data-city="london"] time')).toHaveText(
      "16:00:00",
    );
    await app.getByLabel("Time format", { exact: true }).selectOption("12");
    await expect(app.locator('[data-city="london"] time')).toHaveText(
      "04:00:00 PM",
    );
    await app
      .getByRole("button", { name: "Reset to live", exact: true })
      .click();
    await expect(app.locator(".worldclock-app")).toHaveAttribute(
      "data-mode",
      "live",
    );
  });

  test("rejects a daylight saving gap and dates outside the meeting range", async ({
    page,
  }) => {
    const app = await openWorldClock(page);
    await app.getByLabel("Meeting date", { exact: true }).fill("2026-03-08");
    await app.getByLabel("Meeting time", { exact: true }).fill("02:30");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.getByRole("alert")).toContainText("does not exist");
    await expect(app.locator(".worldclock-app")).toHaveAttribute(
      "data-mode",
      "live",
    );
    await app.getByLabel("Meeting date", { exact: true }).fill("1999-12-31");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.getByRole("alert")).toContainText("2000 through 2100");
    await app.getByLabel("Meeting date", { exact: true }).fill("2026-03-08");
    await app.getByLabel("Meeting time", { exact: true }).fill("03:30");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.getByRole("alert")).toBeHidden();
    await expect(app.locator('[data-city="london"] time')).toHaveText(
      "07:30:00",
    );
  });

  test("searches IANA zones, caps saved clocks at six, and restores removed clocks", async ({
    page,
  }) => {
    let app = await openWorldClock(page);
    await app.getByRole("button", { name: "Add city", exact: true }).click();
    for (const [term, city] of [
      ["America/New_York", "New York"],
      ["India", "Mumbai"],
      ["Australia/Sydney", "Sydney"],
    ]) {
      await app.getByRole("searchbox").fill(term);
      await app
        .getByRole("button", { name: `Add ${city}`, exact: true })
        .click();
    }
    await expect(app.locator(".worldclock-card")).toHaveCount(6);
    await app.getByRole("searchbox").fill("Paris");
    await expect(
      app.getByRole("button", { name: "Add Paris", exact: true }),
    ).toBeDisabled();
    await app
      .getByRole("button", { name: "Remove Mumbai", exact: true })
      .click();
    await expect(app.locator(".worldclock-card")).toHaveCount(5);
    await app.getByRole("button", { name: "Undo remove", exact: true }).click();
    await expect(app.locator('[data-city="mumbai"]')).toBeVisible();
    await app.getByLabel("Time format", { exact: true }).selectOption("12");
    app = await openWorldClock(page);
    await expect(app.locator(".worldclock-card")).toHaveCount(6);
    await expect(app.locator('[data-city="sydney"]')).toBeVisible();
    await expect(app.getByLabel("Time format", { exact: true })).toHaveValue(
      "12",
    );
  });

  test("preserves malformed storage and fits a 320px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.addInitScript(() =>
      localStorage.setItem("nearby-desktop-worldclock-v1", "{broken"),
    );
    const app = await openWorldClock(page);
    await expect(app.locator("[data-worldclock-status]")).toContainText(
      "original data is unchanged",
    );
    await app.getByLabel("Time format", { exact: true }).selectOption("12");
    expect(
      await page.evaluate(() =>
        localStorage.getItem("nearby-desktop-worldclock-v1"),
      ),
    ).toBe("{broken");
    await app.getByLabel("Meeting date", { exact: true }).fill("2026-01-15");
    await app.getByLabel("Meeting time", { exact: true }).fill("13:45");
    await app
      .getByRole("button", { name: "Preview time", exact: true })
      .click();
    await expect(app.locator('[data-city="local"] time')).toHaveText(
      "01:45:00 PM",
    );
    expect(
      await app
        .locator(".worldclock-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await app
        .getByLabel("Meeting time", { exact: true })
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(16);
  });
});
