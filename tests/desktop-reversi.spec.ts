import { expect, test, type Page } from "@playwright/test";

async function openReversi(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="reversi"]').click();
  const app = page.locator('[data-window="reversi"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByRole("grid", { name: "Reversi board" })).toBeVisible();
  return app;
}

test("opening hints, invalid moves, keyboard navigation, and directional flips", async ({
  page,
}) => {
  const app = await openReversi(page);
  await expect(app.locator('[data-legal="true"]')).toHaveCount(4);
  expect(
    await app
      .locator('[data-legal="true"]')
      .evaluateAll((cells) =>
        cells.map((cell) => (cell as HTMLElement).dataset.reversiCell),
      ),
  ).toEqual(["D3", "C4", "F5", "E6"]);
  await app.locator('[data-reversi-cell="A1"]').click({ force: true });
  await expect(app.locator("[data-reversi-status]")).toContainText(
    "does not capture any discs",
  );
  await expect(app.locator("[data-reversi-black]")).toHaveText("2");
  const c3 = app.locator('[data-reversi-cell="C3"]');
  await c3.focus();
  await c3.press("ArrowRight");
  const d3 = app.locator('[data-reversi-cell="D3"]');
  await expect(d3).toBeFocused();
  await d3.press("Enter");
  await expect(d3).toHaveAttribute("data-disc", "black");
  await expect(app.locator('[data-reversi-cell="D4"]')).toHaveAttribute(
    "data-disc",
    "black",
  );
  await expect(app.locator("[data-reversi-black]")).toHaveText("4");
  await expect(app.locator("[data-reversi-white]")).toHaveText("1");
  await expect(app.locator("[data-reversi-board]")).toHaveAttribute(
    "data-turn",
    "white",
  );
  await expect(app.locator('[data-reversi-cell][tabindex="0"]')).toHaveCount(1);
  await app.getByRole("button", { name: "New game", exact: true }).click();
  await expect(app.locator("[data-reversi-black]")).toHaveText("2");
  await expect(app.locator('[data-legal="true"]')).toHaveCount(4);
});

test("a complete local game automatically passes blocked players and counts the winner", async ({
  page,
}) => {
  const app = await openReversi(page);
  // This deterministic game forces Black to pass after moves 18, 19, 20, and 47.
  const moves =
    "D3,C3,B3,B2,B1,A1,C4,C1,C2,D2,D1,E1,A2,A3,F5,E2,F1,G1,F2,E3,B5,B4,A5,A4,C5,A6,F4,F3,G3,G2,H2,H1,H3,H4,G4,C6,G5,H5,B6,C7,D6,E6,F6,G6,H6,H7,A7,B7,A8,D7,E7,F7,G7,G8,B8,C8,D8,E8,F8,H8".split(
      ",",
    );
  for (const [index, move] of moves.entries()) {
    await app.locator(`[data-reversi-cell="${move}"]`).click();
    if ([18, 19, 20, 47].includes(index + 1)) {
      await expect(app.locator("[data-reversi-status]")).toContainText(
        "Black has no legal move and passes. White plays again.",
      );
      await expect(app.locator("[data-reversi-board]")).toHaveAttribute(
        "data-turn",
        "white",
      );
    }
  }
  await expect(app.locator("[data-reversi-status]")).toContainText(
    "Game over. White wins. Black 19, White 45.",
  );
  await expect(app.locator("[data-reversi-black]")).toHaveText("19");
  await expect(app.locator("[data-reversi-white]")).toHaveText("45");
  await expect(app.locator('[data-legal="true"]')).toHaveCount(0);
  await app.locator('[data-reversi-cell="A1"]').click({ force: true });
  await expect(app.locator("[data-reversi-board]")).toHaveAttribute(
    "data-turn",
    "finished",
  );
});

test("computer play fits a phone, pauses while hidden, and cancels on a new game", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openReversi(page);
  await page.clock.install();
  await app
    .getByRole("combobox", { name: "Opponent", exact: true })
    .selectOption("computer");
  await app.locator('[data-reversi-cell="D3"]').click();
  await app.evaluate((element) => {
    (element as HTMLElement).hidden = true;
  });
  await page.clock.fastForward(1500);
  await expect(app.locator("[data-reversi-white]")).toHaveText("1");
  await app.evaluate((element) => {
    (element as HTMLElement).hidden = false;
  });
  await page.clock.fastForward(500);
  await expect(app.locator("[data-reversi-white]")).toHaveText("3");
  await expect(app.locator("[data-reversi-black]")).toHaveText("3");
  await expect(app.locator("[data-reversi-board]")).toHaveAttribute(
    "data-turn",
    "black",
  );
  await app.getByRole("button", { name: "New game", exact: true }).click();
  await app.locator('[data-reversi-cell="D3"]').click();
  await app.getByRole("button", { name: "New game", exact: true }).click();
  await page.clock.fastForward(1500);
  await expect(app.locator("[data-reversi-white]")).toHaveText("2");
  await expect(app.locator("[data-reversi-black]")).toHaveText("2");
  expect(
    await app
      .locator(".reversi-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const board = (await app.locator("[data-reversi-board]").boundingBox())!;
  const lastCell = (await app
    .locator('[data-reversi-cell="H8"]')
    .boundingBox())!;
  expect(lastCell.y + lastCell.height).toBeLessThanOrEqual(
    board.y + board.height,
  );
  expect(Math.abs(lastCell.width - lastCell.height)).toBeLessThan(1);
});

test("the entire board fits a quarter pane and remains playable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const app = await openReversi(page);
  const titlebar = (await app.locator("[data-drag-handle]").boundingBox())!;
  await page.mouse.move(titlebar.x + 100, titlebar.y + 20);
  await page.mouse.down();
  await page.mouse.move(2, 2, { steps: 8 });
  await page.mouse.up();
  await expect(app).toHaveAttribute("data-snap", "top-left");
  await app.locator('[data-reversi-cell="D3"]').click();
  await expect(app.locator("[data-reversi-black]")).toHaveText("4");
  const body = app.locator(".reversi-body");
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBe(0);
  const visibleArea = (await body.boundingBox())!;
  const board = (await app.locator("[data-reversi-board]").boundingBox())!;
  expect(board.y).toBeGreaterThanOrEqual(visibleArea.y);
  expect(board.y + board.height).toBeLessThanOrEqual(
    visibleArea.y + visibleArea.height,
  );
  expect(board.width).toBeGreaterThanOrEqual(224);
  expect(Math.abs(board.width - board.height)).toBeLessThan(1);
});
