import { expect, test, type Page } from "@playwright/test";

async function openColors(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="colors"]').click();
  const app = page.locator('[data-window="colors"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByLabel("Hex color", { exact: true })).toBeVisible();
  return app;
}

test("color conversion, harmony and WCAG contrast use real color values", async ({
  page,
}) => {
  const app = await openColors(page);
  await app.getByLabel("Hex color", { exact: true }).fill("#f00");
  await expect(
    app.getByRole("button", { name: "Copy RGB code", exact: true }),
  ).toHaveText("rgb(255, 0, 0)");
  await expect(
    app.getByRole("button", { name: "Copy HSL code", exact: true }),
  ).toHaveText("hsl(0, 100%, 50%)");
  await expect(
    app.getByRole("button", {
      name: "Copy complementary #00FFFF",
      exact: true,
    }),
  ).toBeVisible();
  await expect(app.locator("[data-colors-ratio]")).toHaveText("21.00:1");
  await expect(app.locator("[data-colors-aa-normal]")).toHaveText(
    "AA normal: Pass",
  );
  await app.getByLabel("Foreground", { exact: true }).fill("#777777");
  await expect(app.locator("[data-colors-ratio]")).toHaveText("4.48:1");
  await expect(app.locator("[data-colors-aa-normal]")).toHaveText(
    "AA normal: Fail",
  );
  await expect(app.locator("[data-colors-aa-large]")).toHaveText(
    "AA large: Pass",
  );
  await app.getByLabel("Background", { exact: true }).fill("#777777");
  await expect(app.locator("[data-colors-ratio]")).toHaveText("1.00:1");
  await expect(app.locator("[data-colors-aa-large]")).toHaveText(
    "AA large: Fail",
  );
});

test("invalid hex cannot be saved and clipboard errors offer a usable code", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    }),
  );
  const app = await openColors(page);
  const hex = app.getByLabel("Hex color", { exact: true });
  await hex.fill("#GGGGGG");
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await expect(
    app.getByRole("button", { name: "Save swatch", exact: true }),
  ).toBeDisabled();
  await expect(app.locator("[data-colors-status]")).toContainText(
    "Enter 3 or 6 hexadecimal digits",
  );
  await app.getByLabel("Foreground", { exact: true }).fill("rgba(0,0,0,0)");
  await expect(app.locator("[data-colors-ratio]")).toHaveText("—");
  await expect(app.locator("[data-colors-aa-normal]")).toHaveText(
    "Enter valid hex colors.",
  );
  await hex.fill("abc");
  await expect(hex).toHaveAttribute("aria-invalid", "false");
  await app.getByRole("button", { name: "Copy hex code", exact: true }).click();
  await expect(app.locator("[data-colors-status]")).toHaveText(
    "Clipboard unavailable. Copy manually: #AABBCC",
  );
});

test("saved palettes survive reload, stay bounded, support undo and preserve corrupt storage", async ({
  page,
}) => {
  let app = await openColors(page);
  for (let i = 0; i < 12; i++) {
    await app
      .getByLabel("Hex color", { exact: true })
      .fill(`#${i.toString(16).padStart(6, "0")}`);
    await app.getByRole("button", { name: "Save swatch", exact: true }).click();
  }
  await app.getByLabel("Hex color", { exact: true }).fill("#FFFFFF");
  await app.getByRole("button", { name: "Save swatch", exact: true }).click();
  await expect(app.locator("[data-colors-status]")).toContainText(
    "Palette is full",
  );
  app = await openColors(page);
  await expect(app.locator("[data-colors-count]")).toHaveText("12 / 12");
  await app
    .getByRole("button", { name: "Remove saved #000000", exact: true })
    .click();
  await expect(app.locator("[data-colors-count]")).toHaveText("11 / 12");
  const undo = app.getByRole("button", { name: "Undo removal", exact: true });
  await expect(undo).toBeFocused();
  await undo.press("Enter");
  await expect(app.locator("[data-colors-count]")).toHaveText("12 / 12");
  await expect(
    app.getByRole("button", { name: "Use saved #000000", exact: true }),
  ).toBeFocused();
  await expect(undo).toBeDisabled();
  await page.evaluate(() =>
    localStorage.setItem("nearby-desktop-colors-v1", "{broken"),
  );
  app = await openColors(page);
  await expect(app.locator("[data-colors-storage]")).toContainText(
    "Original data is preserved",
  );
  await app.getByRole("button", { name: "Save swatch", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("nearby-desktop-colors-v1")),
  ).toBe("{broken");
});

test("phone layout remains usable when local storage is blocked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.addInitScript(() => {
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "nearby-desktop-colors-v1")
        throw new DOMException("Blocked", "SecurityError");
      return originalGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "nearby-desktop-colors-v1")
        throw new DOMException("Blocked", "SecurityError");
      return originalSet.call(this, key, value);
    };
  });
  const app = await openColors(page);
  await app.getByLabel("Hex color", { exact: true }).fill("#123456");
  await app.getByRole("button", { name: "Save swatch", exact: true }).click();
  await expect(app.locator("[data-colors-status]")).toContainText(
    "this session",
  );
  await app
    .getByRole("button", { name: "Use color as text", exact: true })
    .click();
  await expect(app.getByLabel("Foreground", { exact: true })).toHaveValue(
    "#123456",
  );
  const scroll = app.locator(".colors-scroll");
  expect(
    await scroll.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await app
      .getByLabel("Hex color", { exact: true })
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});
