import { test, expect, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function openSketchpad(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="sketchpad"]').click();
  const win = page.locator('[data-window="sketchpad"]');
  await expect(
    win.getByRole("img", { name: "Sketchpad drawing canvas" }),
  ).toBeVisible();
  return win;
}

async function stroke(page: Page, canvas: Locator) {
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, {
    steps: 12,
  });
  await page.mouse.up();
}

async function pixels(canvas: Locator) {
  return canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
}

test("Sketchpad draws, erases, undoes, redoes, clears and exports a PNG", async ({
  page,
}) => {
  const win = await openSketchpad(page);
  const canvas = win.locator("canvas");
  const blank = await pixels(canvas);
  await win.getByRole("button", { name: "Blue", exact: true }).click();
  await stroke(page, canvas);
  const drawn = await pixels(canvas);
  expect(drawn).not.toBe(blank);
  await expect(win.locator("[data-sketch-status]")).toHaveText(
    "1 stroke · Session only",
  );
  await win.getByRole("button", { name: "Eraser", exact: true }).click();
  await win.getByRole("slider", { name: "Brush size" }).fill("40");
  await stroke(page, canvas);
  expect(await pixels(canvas)).toBe(blank);
  await win.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await pixels(canvas)).toBe(drawn);
  await win.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await pixels(canvas)).toBe(blank);
  await win.getByRole("button", { name: "Undo", exact: true }).click();
  await win.getByRole("button", { name: "Clear", exact: true }).click();
  expect(await pixels(canvas)).toBe(blank);
  await win.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await pixels(canvas)).toBe(drawn);

  const downloadEvent = page.waitForEvent("download");
  await win.getByRole("button", { name: "Export PNG", exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(
    /^sketchpad-\d{4}-\d{2}-\d{2}\.png$/,
  );
  expect(await download.failure()).toBeNull();
  const png = await readFile((await download.path())!);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1000, 700]);
  expect(await pixels(canvas)).toBe(drawn);
});

test("resizing and snapping preserve artwork and keyboard history remains usable", async ({
  page,
}) => {
  const win = await openSketchpad(page);
  const canvas = win.locator("canvas");
  const blank = await pixels(canvas);
  await stroke(page, canvas);
  const drawn = await pixels(canvas);
  const before = (await canvas.boundingBox())!;
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(win).toHaveAttribute("data-snap", "right");
  await expect
    .poll(async () => (await canvas.boundingBox())!.width)
    .not.toBe(before.width);
  expect(await pixels(canvas)).toBe(drawn);
  const grip = (await win.locator('[data-resize="w"]').boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + 120, grip.y + grip.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(win).not.toHaveAttribute("data-snap");
  expect(await pixels(canvas)).toBe(drawn);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => (await canvas.boundingBox())!.width)
    .toBeLessThan(390);
  expect(await pixels(canvas)).toBe(drawn);
  await expect(
    win.getByRole("button", { name: "Export PNG", exact: true }),
  ).toBeInViewport();
  await canvas.focus();
  await page.keyboard.press("Control+z");
  expect(await pixels(canvas)).toBe(blank);
  await page.keyboard.press("Control+Shift+z");
  expect(await pixels(canvas)).toBe(drawn);
});

test("cancelled drawing is discarded and a newly opened Sketchpad starts clean", async ({
  page,
}) => {
  const win = await openSketchpad(page);
  const canvas = win.locator("canvas");
  const blank = await pixels(canvas);
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 150, box.y + 80, { steps: 5 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await pixels(canvas)).toBe(blank);
  await expect(
    win.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await stroke(page, canvas);
  await win
    .getByRole("button", { name: "Close Sketchpad", exact: true })
    .click();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="sketchpad"]').click();
  await expect(win.locator("canvas")).toBeVisible();
  expect(await pixels(win.locator("canvas"))).toBe(blank);
});
