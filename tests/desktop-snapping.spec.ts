import { test, expect, type Page, type Locator } from "@playwright/test";
import { edgeLayout } from "../src/scripts/desktop-window-layout";

const library = '[data-window="library"]';
const preview = ".desktop-snap-preview";
async function beginDrag(page: Page, win: Locator, x: number, y: number) {
  const bar = (await win.locator("[data-drag-handle]").boundingBox())!;
  await page.mouse.move(bar.x + Math.min(100, bar.width / 3), bar.y + 20);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 8 });
}
async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  return page.locator(library);
}

test("edge targets distinguish halves, corners, top maximize and free space", () => {
  expect(edgeLayout(5, 400, 1440, 900)).toBe("left");
  expect(edgeLayout(1435, 400, 1440, 900)).toBe("right");
  expect(edgeLayout(40, 5, 1440, 900)).toBe("top-left");
  expect(edgeLayout(1400, 5, 1440, 900)).toBe("top-right");
  expect(edgeLayout(40, 895, 1440, 900)).toBe("bottom-left");
  expect(edgeLayout(1400, 895, 1440, 900)).toBe("bottom-right");
  expect(edgeLayout(700, 5, 1440, 900)).toBe("maximized");
  expect(edgeLayout(700, 895, 1440, 900)).toBeUndefined();
  expect(edgeLayout(700, 400, 1440, 900)).toBeUndefined();
});

test("two windows snap side by side, match their preview, resize, and drag back to floating size", async ({
  page,
}) => {
  const win = await open(page);
  const original = (await win.boundingBox())!;
  await beginDrag(page, win, 2, 400);
  await expect(page.locator(preview)).toHaveAttribute("data-snap", "left");
  const target = (await page.locator(preview).boundingBox())!;
  await page.mouse.up();
  await expect(page.locator(preview)).toBeHidden();
  expect(await win.boundingBox()).toEqual(target);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  const arcade = page.locator('[data-window="arcade"]');
  await arcade.locator(".memory-board button").first().click();
  await beginDrag(page, arcade, 1438, 400);
  await page.mouse.up();
  await expect(arcade).toHaveAttribute("data-snap", "right");
  expect((await arcade.boundingBox())!.x).toBeGreaterThan(
    target.x + target.width,
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  const bounds = (await page.locator("[data-workspace]").boundingBox())!;
  await expect
    .poll(async () => (await win.boundingBox())!.width)
    .toBe(bounds.width / 2 - 12);
  expect((await arcade.boundingBox())!.x).toBe(bounds.width / 2 + 4);
  await expect(arcade.locator(".memory-board button").first()).toHaveAttribute(
    "data-state",
    "face-up",
  );
  await beginDrag(page, win, 650, 230);
  await page.mouse.up();
  await expect(win).not.toHaveAttribute("data-snap");
  expect((await win.boundingBox())!.width).toBe(original.width);
  expect((await win.boundingBox())!.height).toBe(original.height);
});

test("corners create quarters, top maximizes, and Escape or pointer cancellation restores the starting layout", async ({
  page,
}) => {
  const win = await open(page);
  const bounds = (await page.locator("[data-workspace]").boundingBox())!;
  for (const [layout, x, y] of [
    ["top-left", 2, 2],
    ["top-right", 1438, 2],
    ["bottom-right", 1438, bounds.height - 2],
    ["bottom-left", 2, bounds.height - 2],
  ] as const) {
    await beginDrag(page, win, x, y);
    await expect(page.locator(preview)).toHaveAttribute("data-snap", layout);
    await page.mouse.up();
    await expect(win).toHaveAttribute("data-snap", layout);
    expect((await win.boundingBox())!.height).toBe(bounds.height / 2 - 12);
  }
  const before = await win.boundingBox();
  await beginDrag(page, win, 1438, 400);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator(preview)).toBeHidden();
  await expect(win).toHaveAttribute("data-snap", "bottom-left");
  expect(await win.boundingBox()).toEqual(before);
  await beginDrag(page, win, 1438, 400);
  await win
    .locator("[data-drag-handle]")
    .dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  expect(await win.boundingBox()).toEqual(before);
  await beginDrag(page, win, 720, 2);
  await page.mouse.up();
  await expect(win).toHaveClass(/is-maximized/);
  await expect(
    win.getByRole("button", { name: "Restore Library" }),
  ).toHaveAttribute("aria-pressed", "true");
  await beginDrag(page, win, 600, 200);
  await page.mouse.up();
  await expect(win).not.toHaveClass(/is-maximized/);
  await expect(win).not.toHaveAttribute("data-snap");
});

test("keyboard layouts, minimize, arrange and mobile transitions keep windows usable", async ({
  page,
}) => {
  const win = await open(page);
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(win).toHaveAttribute("data-snap", "right");
  await win.getByRole("button", { name: "Minimize Library" }).click();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(win).toHaveAttribute("data-snap", "right");
  await page.keyboard.press("Control+Alt+ArrowUp");
  await expect(win).toHaveClass(/is-maximized/);
  await page.keyboard.press("Control+Alt+ArrowDown");
  await expect(win).not.toHaveAttribute("data-snap");
  await page.keyboard.press("Control+Alt+ArrowLeft");
  await page.getByRole("button", { name: "Arrange windows" }).click();
  await expect(win).not.toHaveAttribute("data-snap");
  await page.keyboard.press("Control+Alt+ArrowRight");
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await win.boundingBox())!.width).toBe(378);
  await page.keyboard.press("Control+Alt+ArrowLeft");
  await expect(win).toHaveAttribute("data-snap", "right");
  await beginDrag(page, win, 2, 300);
  await page.mouse.up();
  await expect(page.locator(preview)).toBeHidden();
  expect((await win.boundingBox())!.width).toBe(378);
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect((await win.boundingBox())!.x).toBe(724);
});

test("Escape cancels a reader drag while keyboard focus remains in its iframe", async ({
  page,
}) => {
  await open(page);
  await page.locator('[data-folder="lab"]').click();
  await page.getByRole("link", { name: /Cast a local vote/ }).click();
  const reader = page.locator(".reader-window");
  await page.frameLocator("[data-desktop-reader]").locator("h1").click();
  const before = await reader.boundingBox();
  await beginDrag(page, reader, 2, 400);
  await expect(page.locator(preview)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator(preview)).toBeHidden();
  await expect(reader).not.toHaveAttribute("data-snap");
  expect(await reader.boundingBox()).toEqual(before);
});
