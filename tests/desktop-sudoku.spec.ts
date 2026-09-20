import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "nearby-desktop-sudoku-v1";
const SOLUTION =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

async function openSudoku(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="sudoku"]').click();
  const app = page.locator('[data-window="sudoku"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByRole("grid", { name: "Sudoku grid" })).toBeVisible();
  return app;
}

test("Sudoku validates duplicates and mistakes, supports keyboard entry and hints", async ({
  page,
}) => {
  const app = await openSudoku(page);
  const cell = app.locator('[data-sudoku-cell="2"]');
  await cell.click();
  await cell.press("5");
  await expect(cell).toHaveText("5");
  await expect(cell).toHaveAttribute("aria-invalid", "true");
  await app.getByRole("button", { name: "Check puzzle", exact: true }).click();
  await expect(app.locator("[data-sudoku-status]")).toContainText(
    "1 mistake is marked",
  );
  await app.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(cell).toHaveText("4");
  await expect(cell).toHaveAttribute("aria-invalid", "false");
  await cell.focus();
  await cell.press("ArrowRight");
  const next = app.locator('[data-sudoku-cell="3"]');
  await expect(next).toBeFocused();
  await next.press("6");
  await next.press("Backspace");
  await expect(next).toHaveText("");
  const given = app.locator('[data-sudoku-cell="0"]');
  await given.click();
  await given.press("8");
  await expect(given).toHaveText("5");
  await expect(
    app.getByRole("button", { name: "Hint", exact: true }),
  ).toBeDisabled();
});

test("Sudoku saves progress and allows cancel or undo of resets and puzzle changes", async ({
  page,
}) => {
  let app = await openSudoku(page);
  await app.locator('[data-sudoku-cell="2"]').click();
  await app.getByRole("button", { name: "Enter 4", exact: true }).click();
  app = await openSudoku(page);
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("4");
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("4");
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Reset entries", exact: true }).click();
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("");
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("4");
  await app.getByRole("button", { name: "New puzzle", exact: true }).click();
  await app
    .getByRole("button", { name: "Start next puzzle", exact: true })
    .click();
  await expect(app.locator("[data-sudoku-title]")).toContainText(
    "Garden break",
  );
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(app.locator("[data-sudoku-title]")).toContainText(
    "Morning paper",
  );
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("4");
});

test("Sudoku recognizes a completed puzzle and preserves malformed saved data", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, solution }) => {
      if (localStorage.getItem(key) !== null) return;
      const values = solution.split("").map(Number);
      values[2] = 0;
      localStorage.setItem(
        key,
        JSON.stringify({ puzzleId: "morning", values, selected: 2 }),
      );
    },
    { key: STORAGE_KEY, solution: SOLUTION },
  );
  let app = await openSudoku(page);
  await app.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(app.locator("[data-sudoku-status]")).toHaveText(
    "Puzzle complete. Well done!",
  );
  await expect(
    app.getByRole("button", { name: "Enter 1", exact: true }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(app.locator('[data-sudoku-cell="2"]')).toHaveText("");
  await page.evaluate(
    (key) => localStorage.setItem(key, "unreadable saved game"),
    STORAGE_KEY,
  );
  app = await openSudoku(page);
  await expect(app.locator("[data-sudoku-storage]")).toContainText(
    "left untouched",
  );
  await app.getByRole("button", { name: "Hint", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe("unreadable saved game");
});

test("Sudoku fits a 320px phone and labels every cell", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const app = await openSudoku(page);
  const grid = app.getByRole("grid", { name: "Sudoku grid" });
  await expect(grid.getByRole("gridcell")).toHaveCount(81);
  await expect(
    grid.getByRole("gridcell", {
      name: "Row 1, column 3, empty, editable",
      exact: true,
    }),
  ).toBeVisible();
  const bounds = (await grid.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(
    await app
      .locator(".sudoku-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await grid.locator('[data-sudoku-cell="2"]').click();
  await app.getByRole("button", { name: "Enter 4", exact: true }).click();
  await expect(grid.locator('[data-sudoku-cell="2"]')).toHaveText("4");
});

test("Sudoku keeps the whole board visible in quarter panes and scrolls to keyboard focus in shorter panes", async ({
  page,
}) => {
  const app = await openSudoku(page);
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  const scroll = app.locator(".sudoku-scroll");
  const grid = app.getByRole("grid", { name: "Sudoku grid" });
  const board = (await grid.boundingBox())!;
  const viewport = (await scroll.boundingBox())!;
  expect(board.width).toBeGreaterThanOrEqual(252);
  expect(board.width).toBeLessThan(370);
  expect(board.y).toBeGreaterThanOrEqual(viewport.y);
  expect(board.y + board.height).toBeLessThanOrEqual(
    viewport.y + viewport.height,
  );
  await app.evaluate((element) => {
    element.style.height = "300px";
  });
  await grid.locator('[data-sudoku-cell="2"]').focus();
  for (let row = 0; row < 8; row += 1) await page.keyboard.press("ArrowDown");
  const lastRowCell = grid.locator('[data-sudoku-cell="74"]');
  await expect(lastRowCell).toBeFocused();
  expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );
  const focused = (await lastRowCell.boundingBox())!;
  const shortViewport = (await scroll.boundingBox())!;
  expect(focused.y).toBeGreaterThanOrEqual(shortViewport.y);
  expect(focused.y + focused.height).toBeLessThanOrEqual(
    shortViewport.y + shortViewport.height,
  );
  expect(
    await scroll.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
