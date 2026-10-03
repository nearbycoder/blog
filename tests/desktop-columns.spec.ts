import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { columnsOf, selectedViews } from "../src/scripts/desktop-columns";
import type { TilingDesk } from "../src/scripts/desktop-tiling-state";
const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);
const area = (page: Page) => page.locator("[data-workspace]");
const tree = (page: Page) => page.locator("[data-tiling-canvas] .trellis");
const desk = (page: Page): Promise<TilingDesk> =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("desktop-tiling:v1")!).desks["desk-1"],
  );
async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
}
async function launch(page: Page, id: string) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(win(page, id)).toBeVisible();
  await expect(win(page, id).locator(".utility-loading")).toHaveCount(0);
}
async function enable(page: Page) {
  await page.locator("[data-tiling-toggle]").click();
  await expect(tree(page)).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Tiled layout", exact: true }),
  ).toHaveValue("columns");
  await expect(win(page, "notes")).toHaveAttribute("data-tiled", "true");
}
const width = async (page: Page, id: string) =>
  (await win(page, id).boundingBox())!.width;
const order = (value: TilingDesk) =>
  columnsOf(value.document!.root)
    .flatMap(selectedViews)
    .map((id) => value.document!.views[id].params?.key);

test("new apps extend the strip without squeezing windows; tall screens fill and widths persist", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await expect.poll(() => width(page, "notes")).toBeGreaterThan(650);
  const initial = await width(page, "notes");
  for (const id of ["json", "calculator", "tasks"]) {
    await launch(page, id);
    await expect.poll(() => width(page, "notes")).toBeCloseTo(initial, 0);
  }
  await expect
    .poll(() => area(page).evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(800);
  expect(await area(page).evaluate((el) => el.scrollWidth)).toBeGreaterThan(
    2600,
  );
  const stored = await desk(page);
  await page.reload();
  await expect(tree(page)).toBeVisible();
  await expect
    .poll(async () => (await desk(page)).columnWidths)
    .toEqual(stored.columnWidths);
  await expect.poll(() => width(page, "notes")).toBeCloseTo(initial, 0);
  await page.setViewportSize({ width: 1440, height: 1900 });
  await expect
    .poll(async () => (await win(page, "notes").boundingBox())!.height)
    .toBeGreaterThan(1600);
  expect(
    await area(page).evaluate((el) => el.scrollHeight - el.clientHeight),
  ).toBeLessThan(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tree(page)).toHaveCount(0);
  await expect(page.locator("[data-tiling-status]")).toContainText(
    "wider screen",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(tree(page)).toBeVisible();
  await expect.poll(() => width(page, "notes")).toBeCloseTo(initial, 0);
});

test("column navigation, width presets, full-width restore and keyboard reordering", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await launch(page, "json");
  await launch(page, "calculator");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Column width", exact: true })
    .selectOption("0.666667");
  await expect.poll(() => width(page, "notes")).toBeGreaterThan(900);
  const original = await width(page, "notes");
  await page.getByRole("button", { name: "Full width", exact: true }).click();
  await expect.poll(() => width(page, "notes")).toBeGreaterThan(1350);
  await expect(
    page.getByRole("button", { name: "Full width", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Control+Alt+f");
  await expect.poll(() => width(page, "notes")).toBeCloseTo(original, 0);
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(win(page, "json")).toHaveClass(/is-active/);
  await page.keyboard.press("Control+Alt+Shift+ArrowRight");
  await expect
    .poll(async () => order(await desk(page)))
    .toEqual(["notes", "calculator", "json"]);
  await expect
    .poll(async () => {
      const rect = (await win(page, "json").boundingBox())!;
      return rect.x >= 0 && rect.x + rect.width <= 1440;
    })
    .toBe(true);
  await page.reload();
  await expect(tree(page)).toBeVisible();
  await expect
    .poll(async () => order(await desk(page)))
    .toEqual(["notes", "calculator", "json"]);
});

test("native divider resizing commits on release without snapback and keeps other columns stable", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await launch(page, "json");
  const before = await desk(page);
  const divider = (await tree(page)
    .getByRole("separator", { name: "Resize panels" })
    .boundingBox())!;
  await page.mouse.move(divider.x + divider.width / 2, divider.y + 100);
  await page.mouse.down();
  await page.mouse.move(divider.x + 120, divider.y + 100, { steps: 12 });
  await page.waitForTimeout(350);
  expect((await desk(page)).columnWidths).toEqual(before.columnWidths);
  let preview = await width(page, "notes");
  await page.mouse.up();
  await expect
    .poll(async () => (await desk(page)).columnWidths)
    .not.toEqual(before.columnWidths);
  await expect.poll(() => width(page, "notes")).toBeCloseTo(preview, 0);
  // An intentionally narrow manual size must not jump back to the preset minimum.
  const resizedDivider = (await tree(page)
    .getByRole("separator", { name: "Resize panels" })
    .boundingBox())!;
  await page.mouse.move(
    resizedDivider.x + resizedDivider.width / 2,
    resizedDivider.y + 100,
  );
  await page.mouse.down();
  await page.mouse.move(220, resizedDivider.y + 100, { steps: 12 });
  await page.waitForTimeout(100);
  preview = await width(page, "notes");
  expect(preview).toBeLessThan(300);
  await page.mouse.up();
  await expect.poll(() => width(page, "notes")).toBeCloseTo(preview, 0);
  await launch(page, "calculator");
  await expect.poll(() => width(page, "notes")).toBeCloseTo(preview, 0);
  await page.reload();
  await expect(tree(page)).toBeVisible();
  await expect.poll(() => width(page, "notes")).toBeCloseTo(preview, 0);
});

test("tab groups and vertical stacks remain usable inside scrolling columns", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await launch(page, "json");
  await tree(page)
    .getByRole("tab", { name: "Notes", exact: true })
    .dragTo(tree(page).getByRole("tab", { name: "JSON Desk", exact: true }));
  await expect(tree(page).getByRole("tablist")).toHaveCount(1);
  await tree(page).getByRole("tab", { name: "Notes", exact: true }).click();
  await expect(win(page, "notes")).toBeVisible();
  await page.getByRole("button", { name: "Stack below", exact: true }).click();
  await expect(tree(page).getByRole("tablist")).toHaveCount(2);
  await expect
    .poll(async () => columnsOf((await desk(page)).document!.root).length)
    .toBe(1);
  const notes = (await win(page, "notes").boundingBox())!;
  const json = (await win(page, "json").boundingBox())!;
  expect(notes.width).toBeCloseTo(json.width, 0);
  await expect
    .poll(async () => {
      const a = (await win(page, "notes").boundingBox())!;
      const b = (await win(page, "json").boundingBox())!;
      return a.y - b.y - b.height;
    })
    .toBeGreaterThan(0);
  await page.keyboard.press("Control+Alt+ArrowUp");
  await expect(win(page, "json")).toHaveClass(/is-active/);
  const results = await new AxeBuilder({ page })
    .include("[data-tiling-controls]")
    .analyze();
  expect(results.violations).toEqual([]);
  await page
    .getByRole("combobox", { name: "Column width", exact: true })
    .selectOption("0.666667");
  await expect.poll(() => width(page, "json")).toBeGreaterThan(900);
  const stackWidth = await width(page, "json");
  await tree(page)
    .getByRole("button", { name: "Close Notes", exact: true })
    .click();
  await expect(win(page, "notes")).toBeHidden();
  await expect.poll(() => width(page, "json")).toBeCloseTo(stackWidth, 0);
});

test("legacy squeezed layouts migrate to readable columns and retain all apps", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await launch(page, "json");
  await launch(page, "calculator");
  await page
    .getByRole("combobox", { name: "Tiled layout", exact: true })
    .selectOption("canvas");
  await page.evaluate(() => {
    const key = "desktop-tiling:v1";
    const value = JSON.parse(localStorage.getItem(key)!);
    const desk = value.desks["desk-1"];
    delete desk.flow;
    delete desk.columnWidths;
    desk.document.root.weights = [1, 1, 8];
    desk.document.root.children[0].id = "toString";
    sessionStorage.setItem("legacy-tiling", JSON.stringify(value));
  });
  // Emulate a previous release's record after the current page has flushed.
  await page.addInitScript(() => {
    const legacy = sessionStorage.getItem("legacy-tiling");
    if (legacy) {
      localStorage.setItem("desktop-tiling:v1", legacy);
      sessionStorage.removeItem("legacy-tiling");
    }
  });
  await page.reload();
  await expect(tree(page)).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Tiled layout", exact: true }),
  ).toHaveValue("columns");
  await expect.poll(async () => (await desk(page)).flow).toBe("columns");
  for (const id of ["notes", "json", "calculator"])
    await expect.poll(() => width(page, id)).toBeGreaterThan(650);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect.poll(() => area(page).evaluate((el) => el.scrollLeft)).toBe(0);
  const rect = (await area(page).boundingBox())!;
  await page.mouse.move(rect.x + 6, rect.y + 6);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => area(page).evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(300);
});

test("slow native tab tears can cancel without losing or duplicating a column", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await launch(page, "json");
  const before = await desk(page);
  const tab = (await tree(page)
    .getByRole("tab", { name: "Notes", exact: true })
    .boundingBox())!;
  await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
  await page.mouse.down();
  await page.mouse.move(tab.x + 160, tab.y + 230, { steps: 15 });
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-tiling-dragging",
    "",
  );
  await page.waitForTimeout(400);
  expect((await desk(page)).document).toEqual(before.document);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator("[data-desktop]")).not.toHaveAttribute(
    "data-tiling-dragging",
  );
  await expect
    .poll(async () => (await desk(page)).document)
    .toEqual(before.document);
  expect((await desk(page)).columnWidths).toEqual(before.columnWidths);
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "json")).toBeVisible();
});
