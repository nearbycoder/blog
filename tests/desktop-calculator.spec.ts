import { test, expect, type Page } from "@playwright/test";

async function openCalculator(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="calculator"]').click();
  const calculator = page.locator('[data-window="calculator"]');
  await expect(
    calculator.locator("[data-calculator-expression]"),
  ).toBeVisible();
  return calculator;
}

test("calculator evaluates typed arithmetic with precedence, parentheses, decimals, negatives and percent", async ({
  page,
}) => {
  const calculator = await openCalculator(page);
  const input = calculator.getByRole("textbox", {
    name: "Expression",
    exact: true,
  });
  const result = calculator.locator("[data-calculator-result]");
  for (const [expression, expected] of [
    ["2 + 3 * 4", "14"],
    ["(2 + 3) * 4", "20"],
    ["-2 * (3 + 1.5)", "-9"],
    ["0.1 + 0.2", "0.3"],
    ["200 * 15%", "30"],
    ["1e3 / 4", "250"],
    ["1000000000000 + 1", "1000000000001"],
  ]) {
    await input.fill(expression);
    await input.press("Enter");
    await expect(result).toHaveText(expected);
  }
  await expect(calculator.locator("[data-calculator-history] li")).toHaveCount(
    7,
  );
  await calculator
    .getByRole("button", { name: "Reuse (2 + 3) * 4 equals 20", exact: true })
    .click();
  await expect(input).toHaveValue("(2 + 3) * 4");
  await expect(result).toHaveText("20");
  await calculator
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(calculator.locator("[data-calculator-history] li")).toHaveCount(
    0,
  );
  await input.fill("");
  await input.pressSequentially("12+3");
  await input.press("Enter");
  await expect(result).toHaveText("15");
  await input.press("+");
  await input.press("4");
  await input.press("Enter");
  await expect(result).toHaveText("19");
});

test("keypad supports result chaining, deletion, a fresh calculation and clear", async ({
  page,
}) => {
  const calculator = await openCalculator(page);
  const key = (name: string) =>
    calculator.getByRole("button", { name, exact: true }).click();
  const result = calculator.locator("[data-calculator-result]");
  await key("7");
  await key("Multiply");
  await key("8");
  await key("Calculate result");
  await expect(result).toHaveText("56");
  await key("Add");
  await key("4");
  await key("Calculate result");
  await expect(result).toHaveText("60");
  await key("9");
  await key("8");
  await key("Delete last character");
  await key("Calculate result");
  await expect(result).toHaveText("9");
  await key("Clear calculation");
  await expect(calculator.locator("[data-calculator-expression]")).toHaveValue(
    "",
  );
  await expect(result).toHaveText("0");
  await expect(
    calculator.getByRole("button", { name: "Copy result", exact: true }),
  ).toBeDisabled();
});

test("invalid expressions show readable errors, recover, copy and keep shell shortcuts", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const calculator = await openCalculator(page);
  const input = calculator.locator("[data-calculator-expression]");
  const status = calculator.locator("[data-calculator-status]");
  for (const [expression, message] of [
    ["3 / 0", "Cannot divide by zero."],
    ["(3 + 2", "Add a closing parenthesis."],
    ["2 + window.alert(1)", "Check the numbers and operators."],
    ["1e309", "The result is too large."],
  ]) {
    await input.fill(expression);
    await input.press("Enter");
    await expect(status).toHaveText(message);
    await expect(input).toHaveAttribute("aria-invalid", "true");
  }
  await input.fill("81 / 9");
  await input.press("Enter");
  await expect(calculator.locator("[data-calculator-result]")).toHaveText("9");
  await expect(input).toHaveAttribute("aria-invalid", "false");
  await calculator
    .getByRole("button", { name: "Copy result", exact: true })
    .click();
  await expect(status).toHaveText("Result copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("9");
  await input.focus();
  await input.press("Control+Alt+ArrowRight");
  await expect(calculator).toHaveAttribute("data-snap", "right");
  await expect(input).toHaveValue("81 / 9");
  await input.press("Escape");
  await expect(input).toHaveValue("");
});

test("calculator remains usable at phone width with readable input size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const calculator = await openCalculator(page);
  const input = calculator.locator("[data-calculator-expression]");
  await input.fill("(12 + 8) / 4");
  await input.press("Enter");
  await expect(calculator.locator("[data-calculator-result]")).toHaveText("5");
  expect(
    await input.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  const bounds = (await calculator.boundingBox())!;
  const button = (await calculator
    .getByRole("button", { name: "Calculate result", exact: true })
    .boundingBox())!;
  expect(button.x).toBeGreaterThanOrEqual(bounds.x);
  expect(button.x + button.width).toBeLessThanOrEqual(bounds.x + bounds.width);
});
