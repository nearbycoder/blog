import { expect, test, type Page } from "@playwright/test";

async function openStopwatch(page: Page) {
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="stopwatch"]').click();
  const app = page.locator('[data-window="stopwatch"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByRole("timer", { name: "Elapsed time" })).toBeVisible();
  await page.clock.pauseAt(new Date("2030-01-01T01:00:00Z"));
  return app;
}

test("stopwatch excludes paused time, keeps lap splits, and restores a reset", async ({
  page,
}) => {
  const app = await openStopwatch(page);
  const timer = app.getByRole("timer", { name: "Elapsed time" });
  const lap = app.getByRole("button", { name: "Lap", exact: true });
  await expect(lap).toBeDisabled();
  await expect(
    app.getByRole("button", { name: "Reset", exact: true }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Start", exact: true }).click();
  await lap.click();
  await app.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(app.locator("[data-stopwatch-state]")).toHaveText("Paused");
  await expect(
    app.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Undo reset", exact: true }).click();
  await expect(app.locator("[data-stopwatch-state]")).toHaveText("Paused");
  await expect(app.locator("[data-stopwatch-laps] td")).toHaveText([
    "1",
    "00:00.00",
    "00:00.00",
  ]);
  await expect(
    app.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    app.getByRole("button", { name: "Undo reset", exact: true }),
  ).toBeHidden();
  await page.clock.runFor(1250);
  await expect(timer).toHaveText("00:01.25");
  await lap.click();
  await app.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(lap).toBeDisabled();
  await page.clock.runFor(5000);
  await expect(timer).toHaveText("00:01.25");
  await app.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.setSystemTime(new Date("2031-01-01T00:00:00Z"));
  await page.clock.runFor(750);
  await lap.click();
  await app.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(timer).toHaveText("00:02.00");
  const rows = app.locator("[data-stopwatch-laps] tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator("td")).toHaveText([
    "2",
    "00:00.75",
    "00:02.00",
  ]);
  await expect(rows.nth(1).locator("td")).toHaveText([
    "1",
    "00:01.25",
    "00:01.25",
  ]);
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(timer).toHaveText("00:00.00");
  await expect(rows).toHaveCount(0);
  await app.getByRole("button", { name: "Undo reset", exact: true }).click();
  await expect(timer).toHaveText("00:02.00");
  await expect(rows).toHaveCount(2);
  await expect(
    app.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.clock.runFor(3000);
  await expect(timer).toHaveText("00:02.00");
});

test("stopwatch stops hidden rendering, catches up on restore, and closes cleanly", async ({
  page,
}) => {
  const app = await openStopwatch(page);
  const timer = app.locator("[data-stopwatch-time]");
  await app.getByRole("button", { name: "Start", exact: true }).click();
  await page.clock.runFor(1000);
  await app.locator('[data-window-action="minimize"]').click();
  await expect(app).toBeHidden();
  await expect(timer).toHaveText("00:01.00");
  await page.clock.runFor(5000);
  await expect(timer).toHaveText("00:01.00");
  await page.locator('[data-task="stopwatch"]').click();
  await expect(timer).toHaveText("00:06.00");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(4000);
  await expect(timer).toHaveText("00:06.00");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(timer).toHaveText("00:10.00");
  await app.locator('[data-window-action="close"]').click();
  await expect(app).toHaveCount(0);
  await page.clock.runFor(5000);
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="stopwatch"]').click();
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(timer).toHaveText("00:00.00");
  await expect(
    app.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
});

test("stopwatch downloads chronological CSV data and releases each download URL", async ({
  page,
}) => {
  const app = await openStopwatch(page);
  await page.evaluate(() => {
    const urls = { created: [] as string[], revoked: [] as string[] };
    Object.defineProperty(window, "stopwatchDownloadUrls", { value: urls });
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      urls.created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      urls.revoked.push(url);
      revoke(url);
    };
  });
  await app.getByRole("button", { name: "Start", exact: true }).click();
  await page.clock.runFor(1250);
  await app.getByRole("button", { name: "Lap", exact: true }).click();
  await page.clock.runFor(2500);
  await app.getByRole("button", { name: "Lap", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await app
    .getByRole("button", { name: "Export laps .csv", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("stopwatch-laps.csv");
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString("utf8")).toBe(
    "Lap,Split seconds,Total seconds\r\n1,1.250,1.250\r\n2,2.500,3.750",
  );
  await page.clock.runFor(1000);
  const readUrls = () =>
    page.evaluate(
      () =>
        (
          window as unknown as Window & {
            stopwatchDownloadUrls: { created: string[]; revoked: string[] };
          }
        ).stopwatchDownloadUrls,
    );
  let urls = await readUrls();
  expect(urls.created).toHaveLength(1);
  expect(urls.revoked).toEqual(urls.created);
  const secondDownload = page.waitForEvent("download");
  await app
    .getByRole("button", { name: "Export laps .csv", exact: true })
    .click();
  await secondDownload;
  await app.locator('[data-window-action="close"]').click();
  urls = await readUrls();
  expect(urls.created).toHaveLength(2);
  expect(urls.revoked).toEqual(urls.created);
  await page.clock.runFor(2000);
  expect((await readUrls()).revoked).toEqual(urls.revoked);
});

test("stopwatch fits phones in both themes and supports keyboard controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openStopwatch(page);
  await app.getByRole("button", { name: "Start", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.clock.fastForward(3_661_250);
  await expect(app.getByRole("timer", { name: "Elapsed time" })).toHaveText(
    "01:01:01.25",
  );
  await app.getByRole("button", { name: "Lap", exact: true }).press("Space");
  await expect(app.locator("[data-stopwatch-laps] tr")).toHaveCount(1);
  await app.getByRole("button", { name: "Pause", exact: true }).press("Enter");
  for (const theme of ["light", "dark"]) {
    await page
      .locator("html")
      .evaluate(
        (element, value) => element.setAttribute("data-theme", value),
        theme,
      );
    expect((await app.boundingBox())!.width).toBe(308);
    expect(
      await app
        .locator(".stopwatch-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    const clockBounds = (await app
      .getByRole("timer", { name: "Elapsed time" })
      .boundingBox())!;
    expect(clockBounds.x).toBeGreaterThanOrEqual(0);
    expect(clockBounds.x + clockBounds.width).toBeLessThanOrEqual(320);
    await expect(
      app.getByRole("button", { name: "Export laps .csv", exact: true }),
    ).toBeEnabled();
  }
});
