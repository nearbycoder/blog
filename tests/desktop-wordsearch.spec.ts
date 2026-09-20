import { expect, test, type Locator, type Page } from "@playwright/test";

async function openWordSearch(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="wordsearch"]').click();
  const app = page.locator('[data-window="wordsearch"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("grid", { name: "Word search grid" }),
  ).toBeVisible();
  return app;
}

async function findWord(app: Locator, word: string) {
  const letters = await app.locator("[data-wordsearch-cell]").allTextContents();
  for (let start = 0; start < letters.length; start += 1) {
    for (const dr of [-1, 0, 1]) {
      for (const dc of [-1, 0, 1]) {
        if (!dr && !dc) continue;
        const row = Math.floor(start / 9);
        const column = start % 9;
        const endRow = row + dr * (word.length - 1);
        const endColumn = column + dc * (word.length - 1);
        if (endRow < 0 || endRow >= 9 || endColumn < 0 || endColumn >= 9)
          continue;
        const match = [...word].every(
          (letter, offset) =>
            letters[(row + dr * offset) * 9 + column + dc * offset] === letter,
        );
        if (match) return { start, end: endRow * 9 + endColumn, dr, dc };
      }
    }
  }
  throw new Error(`The visible grid does not contain ${word}`);
}

async function tapWord(app: Locator, word: string, reverse = false) {
  const path = await findWord(app, word);
  await app
    .locator(`[data-wordsearch-cell="${reverse ? path.end : path.start}"]`)
    .click();
  await app
    .locator(`[data-wordsearch-cell="${reverse ? path.start : path.end}"]`)
    .click();
}

test("Word Search supports keyboard endpoints, cancellation, and reversed words", async ({
  page,
}) => {
  const app = await openWordSearch(page);
  const path = await findWord(app, "BIRCH");
  const start = app.locator(`[data-wordsearch-cell="${path.start}"]`);
  await start.focus();
  await start.press("Enter");
  await expect(start).toHaveAttribute("data-anchor", "true");
  await start.press("Escape");
  await expect(start).toHaveAttribute("data-anchor", "false");
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "Selection cancelled",
  );
  await start.press("Space");
  for (let offset = 1; offset < "BIRCH".length; offset += 1) {
    if (path.dr)
      await page.keyboard.press(path.dr > 0 ? "ArrowDown" : "ArrowUp");
    if (path.dc)
      await page.keyboard.press(path.dc > 0 ? "ArrowRight" : "ArrowLeft");
  }
  await expect(
    app.locator(`[data-wordsearch-cell="${path.end}"]`),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(app.locator('[data-wordsearch-word="BIRCH"]')).toHaveAttribute(
    "data-found",
    "true",
  );
  await expect(app.locator("[data-wordsearch-count]")).toHaveText("1 / 6");
  await tapWord(app, "BIRCH", true);
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "already found",
  );
  await expect(app.locator("[data-wordsearch-count]")).toHaveText("1 / 6");
  await tapWord(app, "FERN", true);
  await expect(app.locator('[data-wordsearch-word="FERN"]')).toHaveAttribute(
    "data-found",
    "true",
  );
});

test("Word Search recognizes pointer drags and completion of every listed word", async ({
  page,
}) => {
  const app = await openWordSearch(page);
  const path = await findWord(app, "BIRCH");
  const start = (await app
    .locator(`[data-wordsearch-cell="${path.start}"]`)
    .boundingBox())!;
  const end = (await app
    .locator(`[data-wordsearch-cell="${path.end}"]`)
    .boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(app.locator('[data-wordsearch-word="BIRCH"]')).toHaveAttribute(
    "data-found",
    "true",
  );
  for (const word of ["FERN", "MOSS", "PINE", "OWL", "FOX"])
    await tapWord(app, word);
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "All 6 words found!",
  );
  await expect(app.locator("[data-wordsearch-progress]")).toHaveAttribute(
    "value",
    "6",
  );
  await expect(
    app.locator('[data-wordsearch-word][data-found="true"]'),
  ).toHaveCount(6);
  await expect(app.getByRole("grid")).toHaveAttribute("data-complete", "true");
});

test("Word Search cancels interrupted gestures and ignores cancellation from another pointer", async ({
  page,
}) => {
  const app = await openWordSearch(page);
  const grid = app.getByRole("grid", { name: "Word search grid" });
  const path = await findWord(app, "BIRCH");
  const first = app.locator(`[data-wordsearch-cell="${path.start}"]`);
  const last = app.locator(`[data-wordsearch-cell="${path.end}"]`);
  const start = (await first.boundingBox())!;
  const end = (await last.boundingBox())!;
  const moveToStart = () =>
    page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  const moveToEnd = () =>
    page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
      steps: 8,
    });

  await moveToStart();
  await page.mouse.down();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "Selection cancelled",
  );
  await expect(grid.locator('[data-anchor="true"]')).toHaveCount(0);
  await expect(
    app.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeDisabled();

  await moveToStart();
  await page.mouse.down();
  await moveToEnd();
  const bounds = (await grid.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width + 5,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.up();
  await expect(grid.locator('[data-anchor="true"]')).toHaveCount(0);
  await expect(app.locator("[data-wordsearch-count]")).toHaveText("0 / 6");

  await moveToStart();
  await page.mouse.down();
  await moveToEnd();
  await grid.dispatchEvent("pointercancel", {
    pointerId: 999,
    isPrimary: false,
  });
  await grid.dispatchEvent("lostpointercapture", {
    pointerId: 999,
    isPrimary: false,
  });
  await expect(first).toHaveAttribute("data-anchor", "true");
  await page.mouse.up();
  await expect(app.locator('[data-wordsearch-word="BIRCH"]')).toHaveAttribute(
    "data-found",
    "true",
  );
});

test("Word Search rejects crooked selections and restores progress after puzzle or theme changes", async ({
  page,
}) => {
  const app = await openWordSearch(page);
  await app.locator('[data-wordsearch-cell="0"]').click();
  await app.locator('[data-wordsearch-cell="11"]').click();
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "Use a straight line",
  );
  await expect(app.locator("[data-wordsearch-count]")).toHaveText("0 / 6");
  await tapWord(app, "FOX");
  const original = await app
    .locator("[data-wordsearch-cell]")
    .allTextContents();
  await app.getByRole("button", { name: "New puzzle", exact: true }).click();
  await expect(app.locator("[data-wordsearch-count]")).toHaveText("0 / 6");
  expect(
    await app.locator("[data-wordsearch-cell]").allTextContents(),
  ).not.toEqual(original);
  await app.getByRole("button", { name: "Undo puzzle", exact: true }).click();
  expect(await app.locator("[data-wordsearch-cell]").allTextContents()).toEqual(
    original,
  );
  await expect(app.locator('[data-wordsearch-word="FOX"]')).toHaveAttribute(
    "data-found",
    "true",
  );
  await app
    .getByRole("combobox", { name: "Puzzle theme" })
    .selectOption({ label: "Seaside" });
  await expect(app.locator('[data-wordsearch-word="CORAL"]')).toBeVisible();
  await tapWord(app, "CORAL");
  await expect(app.locator('[data-wordsearch-word="CORAL"]')).toHaveAttribute(
    "data-found",
    "true",
  );
  await app.getByRole("button", { name: "Undo puzzle", exact: true }).click();
  await expect(app.getByRole("combobox", { name: "Puzzle theme" })).toHaveValue(
    "0",
  );
  await expect(app.locator('[data-wordsearch-word="FOX"]')).toHaveAttribute(
    "data-found",
    "true",
  );
});

test("Word Search fits a 320px viewport and gives every letter an accessible location", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const app = await openWordSearch(page);
  const grid = app.getByRole("grid", { name: "Word search grid" });
  await expect(grid.getByRole("gridcell")).toHaveCount(81);
  await expect(
    grid.getByRole("gridcell", { name: /^Row 1, column 1, [A-Z]$/ }),
  ).toBeVisible();
  const bounds = (await grid.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(
    await app
      .locator(".wordsearch-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await tapWord(app, "MOSS");
  await expect(app.locator('[data-wordsearch-word="MOSS"]')).toHaveAttribute(
    "aria-label",
    "MOSS, found",
  );
  await expect(app.locator("[data-wordsearch-status]")).toContainText(
    "MOSS found!",
  );
});
