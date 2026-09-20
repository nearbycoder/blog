import { expect, test, type Page } from "@playwright/test";

async function openConverter(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="converter"]').click();
  const app = page.locator('[data-window="converter"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("textbox", { name: "Amount", exact: true }),
  ).toBeVisible();
  return app;
}

test("converter handles known values across categories and distinguishes binary data", async ({
  page,
}) => {
  const app = await openConverter(page);
  const category = app.getByRole("combobox", { name: "Conversion category" });
  const amount = app.getByRole("textbox", { name: "Amount", exact: true });
  const result = app.locator("[data-converter-result]");
  const from = app.getByRole("combobox", { name: "From unit", exact: true });
  const to = app.getByRole("combobox", { name: "To unit", exact: true });
  for (const [kind, source, target, input, expected] of [
    ["length", "mi", "km", "1", "1.609344"],
    ["mass", "lb", "g", "2", "907.18474"],
    ["volume", "usgal", "l", "1", "3.785411784"],
    ["speed", "kmh", "ms", "36", "10"],
    ["data", "mib", "kb", "1", "1048.576"],
    ["data", "b", "bit", "1", "8"],
  ]) {
    await category.selectOption(kind);
    await from.selectOption(source);
    await to.selectOption(target);
    await amount.fill(input);
    await expect(result).toHaveText(expected);
  }
  await expect(app.locator("[data-converter-note]")).toContainText("1,024");
});

test("temperature converts with offsets and swapping preserves a round trip", async ({
  page,
}) => {
  const app = await openConverter(page);
  await app
    .getByRole("combobox", { name: "Conversion category" })
    .selectOption("temperature");
  const amount = app.getByRole("textbox", { name: "Amount", exact: true });
  const result = app.locator("[data-converter-result]");
  await amount.fill("100");
  await expect(result).toHaveText("212");
  await app.getByRole("button", { name: "Swap units", exact: true }).click();
  await expect(amount).toHaveValue("212");
  await expect(result).toHaveText("100");
  await expect(
    app.getByRole("combobox", { name: "From unit", exact: true }),
  ).toHaveValue("f");
  await amount.fill("-40");
  await expect(result).toHaveText("-40");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("k");
  await amount.fill("32");
  await expect(result).toHaveText("273.15");
  await app.getByRole("button", { name: "Swap units", exact: true }).click();
  await expect(result).toHaveText("32");
  await app
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("f");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("c");
  await amount.fill("32");
  await expect(result).toHaveText("0");
  await app
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("c");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("k");
  await amount.fill("-273.15");
  await expect(result).toHaveText("0");
});

test("invalid and overflowing amounts recover and clipboard denial is handled", async ({
  page,
}) => {
  const app = await openConverter(page);
  const amount = app.getByRole("textbox", { name: "Amount", exact: true });
  const result = app.locator("[data-converter-result]");
  const status = app.locator("[data-converter-status]");
  const copy = app.getByRole("button", { name: "Copy result", exact: true });
  for (const value of [
    "bad",
    "12kg",
    "Infinity",
    "1e309",
    "1e308",
    "1e-999",
    "-1e-999",
  ]) {
    await amount.fill(value);
    await expect(result).toHaveText("—");
    await expect(amount).toHaveAttribute("aria-invalid", "true");
    await expect(copy).toBeDisabled();
  }
  await expect(status).toContainText("amount is too small");
  await amount.fill("0e-999");
  await expect(result).toHaveText("0");
  await expect(copy).toBeEnabled();
  await app
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("mm");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("km");
  await amount.fill("1e-320");
  await expect(result).toHaveText("—");
  await expect(status).toContainText("result is too small");
  await expect(copy).toBeDisabled();
  await amount.fill("1e-300");
  await expect(result).toHaveText("1e-306");
  await expect(amount).toHaveAttribute("aria-invalid", "false");
  await app
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("m");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("ft");
  await amount.fill("");
  await expect(status).toHaveText("Enter an amount to convert.");
  await expect(amount).toHaveAttribute("aria-invalid", "false");
  await amount.fill("1e3");
  await expect(result).toHaveText("3280.83989501");
  await expect(copy).toBeEnabled();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("Permission denied")),
      },
    });
  });
  await copy.click();
  await expect(status).toHaveText(
    "Copy is unavailable. Select the result and copy it manually.",
  );
  await expect(result).toHaveText("3280.83989501");
});

test("converter remains operable without horizontal overflow at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openConverter(page);
  await app
    .getByRole("combobox", { name: "Conversion category" })
    .selectOption("volume");
  await app
    .getByRole("combobox", { name: "From unit", exact: true })
    .selectOption("impgal");
  await app
    .getByRole("combobox", { name: "To unit", exact: true })
    .selectOption("l");
  const amount = app.getByRole("textbox", { name: "Amount", exact: true });
  await amount.fill("2");
  await expect(app.locator("[data-converter-result]")).toHaveText("9.09218");
  await app.getByRole("button", { name: "Swap units", exact: true }).click();
  await expect(app.locator("[data-converter-result]")).toHaveText("2");
  expect(
    await amount.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await app
      .locator(".converter-body")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const box = (await app.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});
