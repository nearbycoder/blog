import { expect, test, type Locator, type Page } from "@playwright/test";

async function openConnect(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="connect"]').click();
  const app = page.locator('[data-window="connect"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("group", { name: "Four in a Row board", exact: true }),
  ).toBeVisible();
  return app;
}

async function drop(app: Locator, column: number) {
  await app
    .getByRole("button", { name: `Drop in column ${column}`, exact: true })
    .click();
}

test("four in a row detects every win direction and a completely filled draw", async ({
  page,
}) => {
  const app = await openConnect(page);
  const diagonal = [1, 2, 2, 3, 7, 3, 3, 4, 7, 4, 6, 4, 4];
  for (const sequence of [
    [1, 7, 2, 7, 3, 6, 4],
    [1, 2, 1, 2, 1, 3, 1],
    diagonal,
    diagonal.map((column) => 8 - column),
  ]) {
    await app.getByRole("button", { name: "Restart", exact: true }).click();
    for (const column of sequence) await drop(app, column);
    await expect(app.locator("[data-connect-status]")).toContainText(
      "Red wins!",
    );
    await expect(app.locator(".connect-cell.is-winning")).toHaveCount(4);
    await expect(app.locator(".connect-columns button:disabled")).toHaveCount(
      7,
    );
  }
  await app.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(app.locator('[data-connect-piece="empty"]')).toHaveCount(42);
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Red's turn",
  );
  const draw = [
    3, 1, 4, 5, 4, 3, 3, 5, 3, 6, 3, 3, 6, 6, 5, 4, 5, 4, 5, 4, 2, 1, 4, 5, 1,
    6, 7, 6, 7, 7, 6, 1, 2, 7, 2, 7, 1, 2, 7, 2, 1, 2,
  ];
  for (const column of draw) await drop(app, column);
  await expect(app.locator("[data-connect-status]")).toContainText("Draw!");
  await expect(app.locator("[data-connect-moves]")).toHaveText("42 / 42");
  await expect(app.locator(".connect-cell.is-winning")).toHaveCount(0);
  await expect(app.locator(".connect-columns button:disabled")).toHaveCount(7);
});

test("keyboard selection follows focus, ignores held Enter, and preserves the turn on a full column", async ({
  page,
}) => {
  const app = await openConnect(page);
  const first = app.getByRole("button", {
    name: "Drop in column 1",
    exact: true,
  });
  const second = app.getByRole("button", {
    name: "Drop in column 2",
    exact: true,
  });
  await first.focus();
  await first.press("ArrowRight");
  await expect(second).toBeFocused();
  await second.press("Space");
  await expect(
    app.locator('[data-connect-row="5"][data-connect-col="1"]'),
  ).toHaveAttribute("data-connect-piece", "red");
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await expect(app.locator("[data-connect-moves]")).toHaveText("2 / 42");
  await app.getByRole("button", { name: "Restart", exact: true }).click();
  for (let disc = 0; disc < 6; disc++) await drop(app, 1);
  await expect(
    app.getByRole("button", { name: "Drop in column 1", exact: true }),
  ).toBeDisabled();
  await expect(
    app.locator('[data-connect-col="0"][data-connect-piece="red"]'),
  ).toHaveCount(3);
  await expect(
    app.locator('[data-connect-col="0"][data-connect-piece="yellow"]'),
  ).toHaveCount(3);
  const board = app.getByRole("group", {
    name: "Four in a Row board",
    exact: true,
  });
  await board.focus();
  await board.press("Enter");
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Column 1 is full",
  );
  await expect(app.locator("[data-connect-moves]")).toHaveText("6 / 42");
  await board.press("ArrowRight");
  await board.press("Enter");
  await expect(
    app.locator('[data-connect-row="5"][data-connect-col="1"]'),
  ).toHaveAttribute("data-connect-piece", "red");
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Yellow's turn",
  );
});

test("computer blocks, wins, pauses while hidden, and cancels pending turns on reset and close", async ({
  page,
}) => {
  const app = await openConnect(page);
  const now = new Date("2026-09-20T12:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  const mode = app.getByRole("combobox", { name: "Game mode", exact: true });
  await mode.selectOption("computer");
  for (let turn = 0; turn < 3; turn++) {
    await drop(app, 1);
    await expect(app.locator("[data-connect-status]")).toContainText(
      "Computer is choosing",
    );
    await page.clock.fastForward(400);
    await expect(app.locator("[data-connect-status]")).toContainText(
      "Red's turn",
    );
  }
  await expect(
    app.locator('[data-connect-row="2"][data-connect-col="0"]'),
  ).toHaveAttribute("data-connect-piece", "yellow");
  await app.getByRole("button", { name: "Restart", exact: true }).click();
  for (const column of [1, 2, 6, 7]) {
    await drop(app, column);
    await page.clock.fastForward(400);
  }
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Computer (Yellow) wins!",
  );
  await app.getByRole("button", { name: "Restart", exact: true }).click();
  await drop(app, 1);
  await app.getByRole("button", { name: "Restart", exact: true }).click();
  await page.clock.fastForward(500);
  await expect(app.locator('[data-connect-piece="empty"]')).toHaveCount(42);
  await drop(app, 1);
  await mode.selectOption("local");
  await page.clock.fastForward(500);
  await expect(app.locator('[data-connect-piece="empty"]')).toHaveCount(42);
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Red's turn",
  );
  await mode.selectOption("computer");
  await drop(app, 1);
  await app.locator('[data-window-action="minimize"]').click();
  await expect(app).toBeHidden();
  await expect(app.locator("[data-connect-status]")).toContainText("paused");
  await page.clock.fastForward(1000);
  await expect(app.locator("[data-connect-moves]")).toHaveText("1 / 42");
  await page.locator('[data-task="connect"]').click();
  await expect(app.locator("[data-connect-status]")).toContainText(
    "Computer is choosing",
  );
  await page.clock.fastForward(400);
  await expect(app.locator("[data-connect-moves]")).toHaveText("2 / 42");
  await drop(app, 1);
  await app.locator('[data-window-action="close"]').click();
  await expect(app).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="connect"]').click();
  await expect(app.locator("[data-connect-moves]")).toHaveText("0 / 42");
  await page.clock.fastForward(1000);
  await expect(app.locator('[data-connect-piece="empty"]')).toHaveCount(42);
});

test("phone layout supports keyboard and column buttons without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openConnect(page);
  const board = app.getByRole("group", {
    name: "Four in a Row board",
    exact: true,
  });
  await board.focus();
  await board.press("ArrowLeft");
  await board.press("Enter");
  await expect(
    app.locator('[data-connect-row="5"][data-connect-col="2"]'),
  ).toHaveAttribute("data-connect-piece", "red");
  await drop(app, 7);
  await expect(
    app.locator('[data-connect-row="5"][data-connect-col="6"]'),
  ).toHaveAttribute("data-connect-piece", "yellow");
  await expect(
    app.getByRole("button", { name: /^Drop in column/ }),
  ).toHaveCount(7);
  expect(
    await app
      .locator(".connect-body")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const box = (await app.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 320, height: 430 });
  const body = app.locator(".connect-body");
  expect(
    await body.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  const lastCell = app.locator('[data-connect-row="5"][data-connect-col="6"]');
  await lastCell.scrollIntoViewIfNeeded();
  const lastCellBox = (await lastCell.boundingBox())!;
  const bodyBox = (await body.boundingBox())!;
  expect(lastCellBox.y).toBeGreaterThanOrEqual(bodyBox.y);
  expect(lastCellBox.y + lastCellBox.height).toBeLessThanOrEqual(
    bodyBox.y + bodyBox.height,
  );
  expect(
    await body.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});

test("all six board rows fit a quarter pane with readable drop controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const app = await openConnect(page);
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  const body = (await app.locator(".connect-body").boundingBox())!;
  const board = (await app.locator(".connect-play").boundingBox())!;
  expect(board.width).toBeGreaterThanOrEqual(252);
  expect(board.width).toBeLessThan(360);
  expect(board.y).toBeGreaterThanOrEqual(body.y);
  expect(board.y + board.height).toBeLessThanOrEqual(body.y + body.height);
  const control = (await app
    .locator(".connect-columns button")
    .first()
    .boundingBox())!;
  expect(control.width).toBeGreaterThanOrEqual(28);
  expect(control.height).toBeGreaterThanOrEqual(34);
});
