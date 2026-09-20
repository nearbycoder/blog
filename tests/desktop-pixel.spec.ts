import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const KEY = "nearby-desktop-pixel-v1";

async function openPixel(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="pixel"]').click();
  const app = page.locator('[data-window="pixel"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByRole("grid", { name: "Pixel drawing" })).toBeVisible();
  return app;
}

function cell(app: Locator, index: number) {
  return app.locator(`[data-pixel-cell="${index}"]`);
}

async function drawing(app: Locator) {
  return app
    .locator("[data-pixel-cell]")
    .evaluateAll((cells) =>
      cells.map((cell) => (cell as HTMLElement).dataset.color),
    );
}

test("Pixel Studio interpolates strokes and fills connected regions with undoable erase and clear", async ({
  page,
}) => {
  const app = await openPixel(page);
  const grid = app.getByRole("grid", { name: "Pixel drawing" });
  await grid.scrollIntoViewIfNeeded();
  const box = (await grid.boundingBox())!;
  await page.mouse.move(box.x + box.width / 32, box.y + box.height / 32);
  await page.mouse.down();
  await page.mouse.move(box.x + (box.width * 31) / 32, box.y + box.height / 32);
  await page.mouse.up();
  expect((await drawing(app)).slice(0, 16)).toEqual(Array(16).fill("#243447"));
  await expect(app.locator("[data-pixel-count]")).toHaveText("16 / 256 pixels");

  await app.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await drawing(app)).toEqual(Array(256).fill("transparent"));
  await app.getByRole("button", { name: "Redo", exact: true }).click();
  await app.getByRole("button", { name: "Erase", exact: true }).click();
  await cell(app, 7).click();
  await expect(cell(app, 7)).toHaveAttribute("data-color", "transparent");

  await app.getByRole("button", { name: "Red", exact: true }).click();
  await app.getByRole("button", { name: "Fill", exact: true }).click();
  await cell(app, 0).click();
  expect((await drawing(app)).slice(0, 7)).toEqual(Array(7).fill("#E24A4A"));
  await expect(cell(app, 7)).toHaveAttribute("data-color", "transparent");
  await expect(cell(app, 8)).toHaveAttribute("data-color", "#243447");
  await expect(cell(app, 16)).toHaveAttribute("data-color", "transparent");
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  const beforeClear = await drawing(app);
  await app.getByRole("button", { name: "Clear drawing", exact: true }).click();
  expect(await drawing(app)).toEqual(Array(256).fill("transparent"));
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await drawing(app)).toEqual(beforeClear);
});

test("captured strokes pause outside the board without painting edges or bridging the gap", async ({
  page,
}) => {
  const app = await openPixel(page);
  const grid = app.getByRole("grid", { name: "Pixel drawing" });
  await grid.scrollIntoViewIfNeeded();
  const box = (await grid.boundingBox())!;
  const x = box.x + (box.width * 4.5) / 16;
  await page.mouse.move(x, box.y + (box.height * 4.5) / 16);
  await page.mouse.down();
  await page.mouse.move(box.x - 10, box.y + (box.height * 4.5) / 16);
  await page.mouse.move(box.x - 10, box.y + (box.height * 10.5) / 16);
  await page.mouse.move(x, box.y + (box.height * 10.5) / 16);
  await page.mouse.up();
  const expected = Array.from({ length: 256 }, (_, index) =>
    index === 68 || index === 164 ? "#243447" : "transparent",
  );
  expect(await drawing(app)).toEqual(expected);
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await drawing(app)).toEqual(Array(256).fill("transparent"));
  await app.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await drawing(app)).toEqual(expected);
});

test("the whole board fits quarter panes and remains reachable in shorter panes", async ({
  page,
}) => {
  const app = await openPixel(page);
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  const content = app.locator(".pixel-app");
  const grid = app.getByRole("grid", { name: "Pixel drawing" });
  const board = (await grid.boundingBox())!;
  const viewport = (await content.boundingBox())!;
  expect(board.width).toBeGreaterThanOrEqual(192);
  expect(board.width).toBeLessThan(288);
  expect(board.y).toBeGreaterThanOrEqual(viewport.y);
  expect(board.y + board.height).toBeLessThanOrEqual(
    viewport.y + viewport.height,
  );
  await app.evaluate((element) => {
    element.style.height = "300px";
  });
  expect(
    await content.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await cell(app, 255).click();
  await expect(cell(app, 255)).toHaveAttribute("data-color", "#243447");
  expect(
    await content.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("keyboard editing persists actual pixels and malformed saved drawings remain untouched", async ({
  page,
}) => {
  let app = await openPixel(page);
  await app.getByLabel("Drawing color", { exact: true }).fill("#123456");
  await cell(app, 0).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(cell(app, 17)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(cell(app, 17)).toHaveAttribute("data-color", "#123456");
  await expect(app.locator("[data-pixel-storage]")).toHaveText(
    "Saved on this device.",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(saved).toEqual({
    version: 1,
    size: 16,
    pixels: Array.from({ length: 256 }, (_, index) =>
      index === 17 ? "#123456" : null,
    ),
  });

  app = await openPixel(page);
  await expect(cell(app, 17)).toHaveAttribute("data-color", "#123456");
  await expect(app.locator("[data-pixel-count]")).toHaveText("1 / 256 pixels");
  await page.evaluate(
    (key) =>
      localStorage.setItem(key, '{"version":1,"size":16,"pixels":["bad"]}'),
    KEY,
  );
  app = await openPixel(page);
  await expect(app.locator("[data-pixel-storage]")).toContainText(
    "Original data is preserved",
  );
  await cell(app, 0).press("Enter");
  await expect(cell(app, 0)).toHaveAttribute("data-color", "#243447");
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(
    '{"version":1,"size":16,"pixels":["bad"]}',
  );
});

test("native and enlarged PNG exports contain the drawing and real transparency", async ({
  page,
}) => {
  const app = await openPixel(page);
  await app.getByRole("button", { name: "Blue", exact: true }).click();
  await cell(app, 0).click();
  for (const size of [16, 256]) {
    await app
      .getByRole("combobox", { name: "PNG size", exact: true })
      .selectOption(String(size));
    const downloaded = page.waitForEvent("download");
    await app.getByRole("button", { name: "Export PNG", exact: true }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe(
      `pixel-studio-${size}x${size}.png`,
    );
    expect(await download.failure()).toBeNull();
    const png = await readFile((await download.path())!);
    const { data, info } = await sharp(png)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([info.width, info.height, info.channels]).toEqual([size, size, 4]);
    expect(Array.from(data.subarray(0, 4))).toEqual([67, 140, 226, 255]);
    const scale = size / 16;
    const inside = ((scale - 1) * size + scale - 1) * 4;
    expect(Array.from(data.subarray(inside, inside + 4))).toEqual([
      67, 140, 226, 255,
    ]);
    expect(Array.from(data.subarray(scale * 4, scale * 4 + 4))).toEqual([
      0, 0, 0, 0,
    ]);
    expect(Array.from(data.subarray(data.length - 4))).toEqual([0, 0, 0, 0]);
  }
  await expect(app.locator("[data-pixel-count]")).toHaveText("1 / 256 pixels");
});

test.describe("Pixel Studio on touch screens", () => {
  test.use({
    viewport: { width: 320, height: 800 },
    hasTouch: true,
    isMobile: true,
  });

  test("touch draws without scrolling, cancellation restores pixels, and blocked storage is honest", async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem;
      const set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (key) {
        if (key === "nearby-desktop-pixel-v1")
          throw new DOMException("Blocked", "SecurityError");
        return get.call(this, key);
      };
      Storage.prototype.setItem = function (key, value) {
        if (key === "nearby-desktop-pixel-v1")
          throw new DOMException("Blocked", "SecurityError");
        return set.call(this, key, value);
      };
    });
    const app = await openPixel(page);
    const grid = app.getByRole("grid", { name: "Pixel drawing" });
    await grid.scrollIntoViewIfNeeded();
    const box = (await grid.boundingBox())!;
    const content = app.locator(".pixel-app");
    const scrollBefore = await content.evaluate((element) => element.scrollTop);
    const session = await context.newCDPSession(page);
    const x = box.x + (box.width * 4.5) / 16;
    const y = box.y + (box.height * 4.5) / 16;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + (box.height * 6) / 16 }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(app.locator("[data-pixel-count]")).toHaveText(
      "7 / 256 pixels",
    );
    expect(await content.evaluate((element) => element.scrollTop)).toBe(
      scrollBefore,
    );
    await expect(app.locator("[data-pixel-storage]")).toContainText(
      "this session",
    );
    const beforeCancel = await drawing(app);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: x + box.width / 16, y }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    expect(await drawing(app)).toEqual(beforeCancel);
    await session.detach();
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      expect(
        await content.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      expect((await grid.boundingBox())!.width).toBeLessThan(308);
      await expect(grid.locator('[tabindex="0"]')).toHaveCount(1);
    }
  });
});
