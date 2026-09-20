import { expect, test, type Page } from "@playwright/test";

async function openLife(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="life"]').click();
  const app = page.locator('[data-window="life"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("grid", { name: "Game of Life, 30 columns by 20 rows" }),
  ).toBeVisible();
  return app;
}

test("Life evolves an oscillator correctly and undoes a cleared board", async ({
  page,
}) => {
  const app = await openLife(page);
  await app
    .getByRole("combobox", { name: "Pattern", exact: true })
    .selectOption("blinker");
  await app.getByRole("button", { name: "Load pattern", exact: true }).click();
  const liveCells = app.locator('[data-life-cell][data-alive="true"]');
  const original = await liveCells.evaluateAll((cells) =>
    cells.map((cell) => (cell as HTMLElement).dataset.lifeCell),
  );
  expect(original).toEqual(["283", "284", "285"]);
  await app.getByRole("button", { name: "Step", exact: true }).click();
  await expect(app.locator("[data-life-generation]")).toHaveText("1");
  await expect(app.locator("[data-life-population]")).toHaveText("3");
  expect(
    await liveCells.evaluateAll((cells) =>
      cells.map((cell) => (cell as HTMLElement).dataset.lifeCell),
    ),
  ).toEqual(["254", "284", "314"]);
  await app.getByRole("button", { name: "Step", exact: true }).click();
  expect(
    await liveCells.evaluateAll((cells) =>
      cells.map((cell) => (cell as HTMLElement).dataset.lifeCell),
    ),
  ).toEqual(original);
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(liveCells).toHaveCount(0);
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(liveCells).toHaveCount(3);
  await expect(app.locator("[data-life-generation]")).toHaveText("2");
});

test("Life supports pointer drawing, keyboard editing and bounded edges", async ({
  page,
}) => {
  const app = await openLife(page);
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  const first = app.locator('[data-life-cell="0"]');
  await first.click();
  await expect(first).toHaveAttribute("data-alive", "true");
  await first.press("ArrowLeft");
  await expect(first).toBeFocused();
  await first.press("ArrowRight");
  const second = app.locator('[data-life-cell="1"]');
  await expect(second).toBeFocused();
  await second.press("Space");
  await second.press("ArrowDown");
  await app.locator('[data-life-cell="31"]').press("Enter");
  await expect(app.locator("[data-life-population]")).toHaveText("3");
  await app.getByRole("button", { name: "Step", exact: true }).click();
  await expect(app.locator("[data-life-population]")).toHaveText("4");
  await expect(app.locator('[data-life-cell="30"]')).toHaveAttribute(
    "data-alive",
    "true",
  );
  await expect(app.locator('[data-life-cell="599"]')).toHaveAttribute(
    "data-alive",
    "false",
  );
  await app.getByRole("button", { name: "Step", exact: true }).click();
  await expect(app.locator("[data-life-status]")).toContainText("still life");
});

test("Life keeps interrupted and off-board strokes in a single undo entry", async ({
  page,
}) => {
  const app = await openLife(page);
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  const grid = app.getByRole("grid");
  await grid.evaluate((element) => {
    element.addEventListener(
      "pointerdown",
      (event) => {
        (element as HTMLElement).dataset.testPointer = String(
          (event as PointerEvent).pointerId,
        );
      },
      { once: true },
    );
  });
  const moveToCell = async (index: number) => {
    const cell = (await app
      .locator(`[data-life-cell="${index}"]`)
      .boundingBox())!;
    await page.mouse.move(cell.x + cell.width / 2, cell.y + cell.height / 2);
  };
  await moveToCell(155);
  await page.mouse.down();
  await moveToCell(160);
  await app.locator('[data-life-cell="400"]').dispatchEvent("pointerdown", {
    pointerId: 999,
    isPrimary: false,
    button: 0,
  });
  await grid.dispatchEvent("pointercancel", { pointerId: 999 });
  await grid.dispatchEvent("lostpointercapture", { pointerId: 999 });
  await moveToCell(162);
  const bounds = (await grid.boundingBox())!;
  await page.mouse.move(bounds.x - 8, bounds.y + bounds.height / 2);
  await moveToCell(175);
  const pointerId = Number(await grid.getAttribute("data-test-pointer"));
  await grid.dispatchEvent("pointercancel", { pointerId });
  await moveToCell(176);
  await page.mouse.up();
  expect(
    await app
      .locator('[data-life-cell][data-alive="true"]')
      .evaluateAll((cells) =>
        cells.map((cell) => Number((cell as HTMLElement).dataset.lifeCell)),
      ),
  ).toEqual([155, 156, 157, 158, 159, 160, 161, 162, 175]);
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(app.locator("[data-life-population]")).toHaveText("0");
  await app.locator('[data-life-cell="176"]').click();
  await expect(app.locator("[data-life-population]")).toHaveText("1");
});

test("Life playback pauses on minimize and closing leaves no simulation", async ({
  page,
}) => {
  const app = await openLife(page);
  await app
    .getByRole("combobox", { name: "Pattern", exact: true })
    .selectOption("blinker");
  await app.getByRole("button", { name: "Load pattern", exact: true }).click();
  await app
    .getByRole("slider", { name: "Generations per second" })
    .press("End");
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await expect(app.locator("[data-life-generation]")).not.toHaveText("0");
  await app.locator('[data-window-action="minimize"]').click();
  await expect(app).toBeHidden();
  const generation = await app.locator("[data-life-generation]").textContent();
  await page.waitForTimeout(300);
  await expect(app.locator("[data-life-generation]")).toHaveText(generation!);
  await page.locator('[data-task="life"]').click();
  await expect(
    app.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await expect(app.locator("[data-life-status]")).toContainText(
    "Paused while hidden",
  );
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await app.locator('[data-window-action="close"]').click();
  await expect(app).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="life"]').click();
  await expect(
    page.locator('[data-window="life"] [data-life-generation]'),
  ).toHaveText("0");
  await expect(
    page.locator('[data-window="life"] [data-life-play]'),
  ).toHaveText("Play");
});

test("Life fits a 320px window in both themes with accessible cell controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const app = await openLife(page);
  await expect(app.getByRole("gridcell")).toHaveCount(600);
  for (const theme of ["light", "dark"]) {
    await page
      .locator("html")
      .evaluate(
        (element, value) => element.setAttribute("data-theme", value),
        theme,
      );
    const grid = app.getByRole("grid");
    const bounds = (await grid.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    expect(
      await app
        .locator(".life-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
  }
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  await app.getByRole("button", { name: "Toggle cell", exact: true }).click();
  await expect(app.locator("[data-life-population]")).toHaveText("1");
  await app
    .getByRole("button", { name: "Select cell right", exact: true })
    .click();
  await app.getByRole("button", { name: "Toggle cell", exact: true }).click();
  await expect(app.locator("[data-life-population]")).toHaveText("2");
});

test("Life shows the entire grid in quarter panes and scrolls to keyboard selection in shorter panes", async ({
  page,
}) => {
  const app = await openLife(page);
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  const scroll = app.locator(".life-scroll");
  const grid = app.getByRole("grid");
  const board = (await grid.boundingBox())!;
  const viewport = (await scroll.boundingBox())!;
  expect(board.width).toBeGreaterThanOrEqual(300);
  expect(board.width).toBeLessThan(660);
  expect(board.y).toBeGreaterThanOrEqual(viewport.y);
  expect(board.y + board.height).toBeLessThanOrEqual(
    viewport.y + viewport.height,
  );
  await app.evaluate((element) => {
    element.style.height = "300px";
  });
  await app.locator('[data-life-cell="0"]').focus();
  for (let row = 1; row < 20; row += 1) await page.keyboard.press("ArrowDown");
  const selected = app.locator('[data-life-cell="570"]');
  await expect(selected).toBeFocused();
  expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );
  const focused = (await selected.boundingBox())!;
  const shortViewport = (await scroll.boundingBox())!;
  expect(focused.y).toBeGreaterThanOrEqual(shortViewport.y - 1);
  expect(focused.y + focused.height).toBeLessThanOrEqual(
    shortViewport.y + shortViewport.height + 1,
  );
  expect(
    await scroll.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
