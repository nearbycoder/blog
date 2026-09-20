import { expect, test, type Page } from "@playwright/test";

async function openDice(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="dice"]').click();
  const app = page.locator('[data-window="dice"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("button", { name: "Roll dice", exact: true }),
  ).toBeVisible();
  return app;
}

test("every die type rolls twelve in-range values and the matching total", async ({
  page,
}) => {
  const app = await openDice(page);
  await app.getByLabel("Dice count", { exact: true }).fill("12");
  for (const sides of [4, 6, 8, 10, 12, 20, 100]) {
    await app
      .getByRole("combobox", { name: "Die type", exact: true })
      .selectOption(String(sides));
    await app.getByRole("button", { name: "Roll dice", exact: true }).click();
    const faces = app.locator("[data-dice-value]");
    await expect(faces).toHaveCount(12);
    const values = (await faces.allTextContents()).map(Number);
    expect(
      values.every(
        (value) => Number.isInteger(value) && value >= 1 && value <= sides,
      ),
    ).toBe(true);
    await expect(app.locator("[data-dice-total]")).toHaveText(
      String(values.reduce((sum, value) => sum + value, 0)),
    );
    await expect(app.locator("[data-dice-label]")).toHaveText(`12d${sides}`);
  }
});

test("invalid counts preserve the result and recover through keyboard submit", async ({
  page,
}) => {
  const app = await openDice(page);
  const count = app.getByLabel("Dice count", { exact: true });
  await app.getByRole("button", { name: "Roll dice", exact: true }).click();
  const originalTotal = await app.locator("[data-dice-total]").textContent();
  for (const invalid of ["", "0", "13", "1.5", "-1"]) {
    await count.fill(invalid);
    await app.getByRole("button", { name: "Roll dice", exact: true }).click();
    await expect(app.locator("[data-dice-status]")).toHaveText(
      "Enter a whole number of dice from 1 to 12.",
    );
    await expect(count).toHaveAttribute("aria-invalid", "true");
    await expect(app.locator("[data-dice-history] li")).toHaveCount(1);
    await expect(app.locator("[data-dice-total]")).toHaveText(originalTotal!);
  }
  await count.fill("1");
  await count.press("Enter");
  await expect(count).toHaveAttribute("aria-invalid", "false");
  await expect(app.locator("[data-dice-value]")).toHaveCount(1);
  await expect(app.locator("[data-dice-history] li")).toHaveCount(2);
});

test("phone coin flips keep ten results and clearing history can be undone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const app = await openDice(page);
  const flip = app.getByRole("button", { name: "Flip a coin", exact: true });
  for (let index = 0; index < 12; index++) await flip.click();
  await expect(app.locator("[data-dice-coin-result]")).toHaveText(
    /^(Heads|Tails)$/,
  );
  await expect(app.locator("[data-dice-history] li")).toHaveCount(10);
  await expect(app.locator("[data-dice-total-label]")).toBeHidden();
  await app.getByRole("button", { name: "Clear history", exact: true }).click();
  await expect(app.locator("[data-dice-history] li")).toHaveCount(0);
  await expect(
    app.getByRole("button", { name: "Clear history", exact: true }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Undo clear", exact: true }).click();
  await expect(app.locator("[data-dice-history] li")).toHaveCount(10);
  expect(
    await app
      .locator(".dice-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  const count = app.getByLabel("Dice count", { exact: true });
  expect(
    await count.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
});
