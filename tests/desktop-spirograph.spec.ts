import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

async function openOrbit(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="spirograph"]').click();
  const app = page.locator('[data-window="spirograph"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator("canvas")).toBeVisible();
  return app;
}

async function image(app: Locator) {
  return app
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

async function setRange(app: Locator, label: string, value: number) {
  await app.getByLabel(label, { exact: true }).evaluate((element, next) => {
    (element as HTMLInputElement).value = String(next);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test("Orbit Studio draws distinct presets, parameter changes, and bounded closed curves", async ({
  page,
}) => {
  const app = await openOrbit(page);
  const before = await image(app);
  await app.getByLabel("Starting shape", { exact: true }).selectOption("bloom");
  await expect(app.getByLabel("Fixed radius", { exact: true })).toHaveValue(
    "120",
  );
  await expect(app.getByLabel("Rolling radius", { exact: true })).toHaveValue(
    "45",
  );
  await expect(app.locator("[data-orbit-status]")).toContainText(
    "3 revolutions",
  );
  expect(await image(app)).not.toBe(before);
  const bloom = await image(app);
  await setRange(app, "Pen offset", 0);
  await expect(app.getByLabel("Starting shape", { exact: true })).toHaveValue(
    "custom",
  );
  expect(await image(app)).not.toBe(bloom);
  await setRange(app, "Fixed radius", 159);
  await setRange(app, "Rolling radius", 73);
  await app.getByLabel("Curve family", { exact: true }).selectOption("outside");
  await expect(app.locator("canvas")).toHaveAttribute(
    "aria-label",
    /Epitrochoid.*fixed radius 159.*rolling radius 73/,
  );
  const segments = Number(
    (await app.locator("[data-orbit-status]").textContent())!
      .split("·")[1]
      .replace(/\D/g, ""),
  );
  expect(segments).toBeLessThanOrEqual(18000);
  expect(segments).toBeGreaterThan(0);
});

test("export contains actual full resolution PNG artwork and its selected paper color", async ({
  page,
}) => {
  const app = await openOrbit(page);
  await app.getByLabel("Starting shape", { exact: true }).selectOption("star");
  const downloaded = page.waitForEvent("download");
  await app.getByRole("button", { name: "Export PNG", exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("orbit-studio-140-60-60.png");
  expect(await download.failure()).toBeNull();
  const png = await readFile((await download.path())!);
  expect(Array.from(png.subarray(0, 8))).toEqual([
    137, 80, 78, 71, 13, 10, 26, 10,
  ]);
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect([info.width, info.height, info.channels]).toEqual([2048, 2048, 4]);
  expect(Array.from(data.subarray(0, 4))).toEqual([250, 248, 242, 255]);
  let ink = 0;
  for (let i = 0; i < data.length; i += 4)
    if (data[i] < 150 && data[i + 2] > 150) ink++;
  expect(ink).toBeGreaterThan(1000);
  await expect(app.locator("[data-orbit-status]")).toHaveText(
    "PNG exported · 2048 × 2048 pixels",
  );
});

test("rotation works by keyboard and resizing preserves geometry on narrow screens", async ({
  page,
}) => {
  const app = await openOrbit(page);
  await app.getByLabel("Starting shape", { exact: true }).selectOption("bloom");
  const canvas = app.locator("canvas");
  await canvas.focus();
  await canvas.press("Shift+ArrowRight");
  await expect(app.getByLabel("Rotation", { exact: true })).toHaveValue("105");
  await canvas.press("ArrowLeft");
  await expect(app.getByLabel("Rotation", { exact: true })).toHaveValue("104");
  const description = await canvas.getAttribute("aria-label");
  await page.setViewportSize({ width: 320, height: 800 });
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const root = app.locator(".spirograph-app");
    expect(
      await root.evaluate(
        (element) => element.scrollWidth - element.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(canvas).toHaveAttribute("aria-label", description!);
    const { ink, width } = await canvas.evaluate(
      (surface: HTMLCanvasElement) => {
        const data = surface
          .getContext("2d")!
          .getImageData(0, 0, surface.width, surface.height).data;
        let ink = 0;
        for (let i = 0; i < data.length; i += 4) if (data[i] > 60) ink++;
        return { ink, width: surface.getBoundingClientRect().width };
      },
    );
    expect(width).toBeLessThanOrEqual(308);
    expect(ink).toBeGreaterThan(300);
  }
});

test("unrelated pointer endings preserve the active drag and cancellation stops it", async ({
  page,
}) => {
  const app = await openOrbit(page);
  const canvas = app.locator("canvas");
  const rotation = app.getByLabel("Rotation", { exact: true });
  const bounds = (await canvas.boundingBox())!;
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await canvas.dispatchEvent("pointerdown", {
    pointerId: 2,
    pointerType: "touch",
    clientX: x,
    clientY: y,
    button: 0,
  });

  for (const [index, type] of [
    "pointerup",
    "pointercancel",
    "lostpointercapture",
  ].entries()) {
    await canvas.dispatchEvent(type, { pointerId: 2, pointerType: "touch" });
    await page.mouse.move(x + (index + 1) * 20, y);
    await expect(rotation).toHaveValue(String((index + 1) * 12));
  }

  await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.move(x + 80, y);
  await expect(rotation).toHaveValue("36");
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.move(x + 100, y);
  await expect(rotation).toHaveValue("48");
  await page.mouse.up();
  await page.mouse.move(x + 120, y);
  await expect(rotation).toHaveValue("48");
});
