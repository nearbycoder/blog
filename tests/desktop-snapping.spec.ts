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

test("pane boundaries distinguish halves, quarters, top maximize and free space", () => {
  const target = (left: number, top: number, width = 600, height = 400) =>
    edgeLayout({ left, top, width, height }, 1440, 900);
  expect(target(8, 200)).toBe("left");
  expect(target(832, 200)).toBe("right");
  expect(target(8, 8)).toBe("top-left");
  expect(target(832, 8)).toBe("top-right");
  expect(target(8, 492)).toBe("bottom-left");
  expect(target(832, 492)).toBe("bottom-right");
  expect(target(300, 8)).toBe("maximized");
  expect(target(300, 492)).toBeUndefined();
  expect(target(300, 200)).toBeUndefined();
  expect(target(8, 8, 1424, 400)).toBe("maximized");
});

test("two windows snap side by side, match their preview, resize, and drag back to floating size", async ({
  page,
}) => {
  const win = await open(page);
  const original = (await win.boundingBox())!;
  await beginDrag(page, win, 2, 150);
  await expect(page.locator(preview)).toHaveAttribute("data-snap", "left");
  const target = (await page.locator(preview).boundingBox())!;
  await page.mouse.up();
  await expect(page.locator(preview)).toBeHidden();
  expect(await win.boundingBox()).toEqual(target);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  const arcade = page.locator('[data-window="arcade"]');
  await arcade.locator(".memory-board button").first().click();
  await beginDrag(page, arcade, 1438, 150);
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
  await beginDrag(page, win, 250, 150);
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
  await beginDrag(page, win, 350, 2);
  await page.mouse.up();
  await expect(win).toHaveClass(/is-maximized/);
  await expect(
    win.getByRole("button", { name: "Restore Library" }),
  ).toHaveAttribute("aria-pressed", "true");
  await beginDrag(page, win, 250, 150);
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

async function dragPaneTo(page: Page, win: Locator, left: number, top: number) {
  await beginDrag(page, win, left + 100, top + 21);
}

test("pane contact shows every quarter preview while the cursor stays away from the screen edges", async ({
  page,
}) => {
  const win = await open(page);
  const bounds = (await page.locator("[data-workspace]").boundingBox())!;
  for (const corner of [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ]) {
    await page.keyboard.press("Control+Alt+ArrowDown");
    const rect = (await win.boundingBox())!;
    const left = corner.endsWith("left") ? 8 : bounds.width - rect.width - 8;
    const top = corner.startsWith("top") ? 8 : bounds.height - rect.height - 8;
    // Click in the middle of the title bar: the cursor never approaches the side.
    const bar = (await win.locator("[data-drag-handle]").boundingBox())!;
    const anchor = bar.width / 2;
    await page.mouse.move(bar.x + anchor, bar.y + 30);
    await page.mouse.down();
    await page.mouse.move(left + 1 + anchor, top + 31, { steps: 8 });
    const highlight = page.locator(preview);
    await expect(highlight).toHaveAttribute("data-snap", corner);
    await expect(highlight).toHaveText("¼");
    const target = (await highlight.boundingBox())!;
    expect(target.width).toBe(bounds.width / 2 - 12);
    expect(target.height).toBe(bounds.height / 2 - 12);
    expect(target.x).toBe(corner.endsWith("left") ? 8 : bounds.width / 2 + 4);
    expect(target.y).toBe(
      bounds.y + (corner.startsWith("top") ? 8 : bounds.height / 2 + 4),
    );
    await page.mouse.up();
    expect(await win.boundingBox()).toEqual(target);
  }
  await page.keyboard.press("Control+Alt+ArrowDown");
  await dragPaneTo(page, win, 8, 130);
  await expect(page.locator(preview)).toHaveAttribute("data-snap", "left");
  await page.mouse.move(300, 151);
  await expect(page.locator(preview)).toBeHidden();
  await page.mouse.up();
});

test("all four edges and four corners resize with the opposite bounds fixed", async ({
  page,
}) => {
  const win = await open(page);
  for (const direction of ["n", "e", "s", "w", "ne", "se", "sw", "nw"]) {
    await page.getByRole("button", { name: "Arrange windows" }).click();
    const before = (await win.boundingBox())!;
    const grip = (await win
      .locator(`[data-resize="${direction}"]`)
      .boundingBox())!;
    const x = grip.x + grip.width / 2,
      y = grip.y + grip.height / 2;
    const dx = direction.includes("w") ? -30 : direction.includes("e") ? 30 : 0;
    const dy = direction.includes("n") ? -30 : direction.includes("s") ? 30 : 0;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 5 });
    await expect(win.locator(`[data-resize="${direction}"]`)).toHaveCSS(
      "cursor",
      direction.length === 1
        ? dx
          ? "ew-resize"
          : "ns-resize"
        : ["ne", "sw"].includes(direction)
          ? "nesw-resize"
          : "nwse-resize",
    );
    await page.mouse.up();
    const after = (await win.boundingBox())!;
    expect(after.x).toBe(before.x + (direction.includes("w") ? dx : 0));
    expect(after.y).toBe(before.y + (direction.includes("n") ? dy : 0));
    expect(after.width).toBe(before.width + Math.abs(dx));
    expect(after.height).toBe(before.height + Math.abs(dy));
    await expect(page.locator(preview)).toBeHidden();
  }
});

test("resizing enforces limits, cancels cleanly, and detaches snapped panes without jumping", async ({
  page,
}) => {
  const win = await open(page);
  async function resize(direction: string, dx: number, dy: number) {
    const grip = (await win
      .locator(`[data-resize="${direction}"]`)
      .boundingBox())!;
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      grip.x + grip.width / 2 + dx,
      grip.y + grip.height / 2 + dy,
      { steps: 5 },
    );
  }
  await resize("se", -900, -600);
  await page.mouse.up();
  expect((await win.boundingBox())!.width).toBe(360);
  expect((await win.boundingBox())!.height).toBe(280);
  await resize("nw", -1000, -1000);
  await page.mouse.up();
  expect((await win.boundingBox())!.x).toBe(8);
  expect((await win.boundingBox())!.y).toBe(8);
  await resize("se", 2000, 2000);
  await page.mouse.up();
  const bounds = (await page.locator("[data-workspace]").boundingBox())!;
  expect((await win.boundingBox())!.width).toBe(bounds.width - 16);
  expect((await win.boundingBox())!.height).toBe(bounds.height - 16);
  await page.getByRole("button", { name: "Arrange windows" }).click();
  const floating = await win.boundingBox();
  await page.keyboard.press("Control+Alt+ArrowRight");
  const snapped = (await win.boundingBox())!;
  for (const cancel of ["Escape", "pointercancel", "lostpointercapture"]) {
    await resize("w", -50, 0);
    expect((await win.boundingBox())!.width).toBe(snapped.width + 50);
    if (cancel === "Escape") await page.keyboard.press("Escape");
    else
      await win
        .locator('[data-resize="w"]')
        .dispatchEvent(cancel, { pointerId: 1 });
    await page.mouse.up();
    await expect(win).toHaveAttribute("data-snap", "right");
    expect(await win.boundingBox()).toEqual(snapped);
    await expect(page.locator("[data-desktop]")).not.toHaveClass(/is-resizing/);
  }
  await page.keyboard.press("Control+Alt+ArrowDown");
  expect(await win.boundingBox()).toEqual(floating);
  await page.keyboard.press("Control+Alt+ArrowRight");
  await resize("w", -50, 0);
  await page.mouse.up();
  await expect(win).not.toHaveAttribute("data-snap");
  expect((await win.boundingBox())!.x).toBe(snapped.x - 50);
  expect((await win.boundingBox())!.width).toBe(snapped.width + 50);
  expect((await win.boundingBox())!.height).toBe(snapped.height);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(win.locator('[data-resize="w"]')).toBeHidden();
  expect((await win.boundingBox())!.width).toBe(378);
  await page.setViewportSize({ width: 320, height: 700 });
  expect((await win.boundingBox())!.width).toBe(308);
});

test("small quarters override floating resize minimums and stay stable when resized", async ({
  page,
}) => {
  const win = await open(page);
  const grip = (await win.locator('[data-resize="se"]').boundingBox())!;
  await page.mouse.move(grip.x + 7, grip.y + 7);
  await page.mouse.down();
  await page.mouse.move(grip.x - 353, grip.y - 273);
  await page.mouse.up();
  await page.setViewportSize({ width: 1000, height: 550 });
  await beginDrag(page, win, 2, 2);
  await expect(page.locator(preview)).toHaveAttribute("data-snap", "top-left");
  const target = (await page.locator(preview).boundingBox())!;
  await page.mouse.up();
  expect(await win.boundingBox()).toEqual(target);
  expect(target.height).toBeLessThan(280);
  const se = (await win.locator('[data-resize="se"]').boundingBox())!;
  await page.mouse.move(se.x + 7, se.y + 7);
  await page.mouse.down();
  await page.mouse.move(se.x + 27, se.y + 27);
  await page.mouse.up();
  expect((await win.boundingBox())!.height).toBe(target.height + 20);
});

test("cancellation from another pointer leaves the active drag and resize intact", async ({
  page,
}) => {
  const win = await open(page);
  const handle = win.locator("[data-drag-handle]");
  await beginDrag(page, win, 2, 150);
  await expect(page.locator(preview)).toHaveAttribute("data-snap", "left");
  for (const event of ["pointercancel", "lostpointercapture"]) {
    await handle.dispatchEvent(event, { pointerId: 99 });
    await expect(page.locator(preview)).toBeVisible();
    await expect(page.locator("[data-desktop]")).toHaveClass(/is-dragging/);
  }
  await page.mouse.up();
  await expect(win).toHaveAttribute("data-snap", "left");

  const before = (await win.boundingBox())!;
  const grip = win.locator('[data-resize="e"]');
  const rect = (await grip.boundingBox())!;
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 30, y, { steps: 5 });
  for (const event of ["pointercancel", "lostpointercapture"]) {
    await grip.dispatchEvent(event, { pointerId: 99 });
    await expect(page.locator("[data-desktop]")).toHaveClass(/is-resizing/);
    await expect(win).not.toHaveAttribute("data-snap");
  }
  await page.mouse.move(x + 50, y, { steps: 5 });
  await page.mouse.up();
  expect((await win.boundingBox())!.width).toBe(before.width + 50);
  expect((await win.boundingBox())!.x).toBe(before.x);
  await expect(page.locator("[data-desktop]")).not.toHaveClass(/is-resizing/);
});
