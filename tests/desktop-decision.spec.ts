import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "nearby-desktop-decision-v1";

async function openDecision(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="decision"]').click();
  const app = page.locator('[data-window="decision"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("button", { name: "Spin the wheel", exact: true }),
  ).toBeVisible();
  return app;
}

test("rejection sampling picks the expected line and renders text safely", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    let calls = 0;
    Object.defineProperty(crypto, "getRandomValues", {
      value: (values: ArrayBufferView) => {
        if (values instanceof Uint32Array && values.length === 1) {
          values[0] = calls++ === 0 ? 0xffffffff : 1;
          return values;
        }
        return original(values);
      },
    });
  });
  const app = await openDecision(page);
  await app
    .getByLabel("Choices, one per line", { exact: true })
    .fill("First\n<img src=x onerror=alert(1)>\nThird");
  await app
    .getByRole("button", { name: "Spin the wheel", exact: true })
    .click();
  await expect(app.locator("[data-decision-result]")).toHaveText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(app.locator("[data-decision-result-label]")).toHaveText(
    "Choice 2",
  );
  expect(
    await app
      .locator("[data-decision-wheel]")
      .evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe("rotate(180deg)");
  await expect(
    app.locator("[data-decision-legend] li.is-chosen"),
  ).toContainText("<img src=x onerror=alert(1)>");
  await expect(app.locator(".decision-app img")).toHaveCount(0);
  for (let i = 0; i < 10; i++)
    await app
      .getByRole("button", { name: "Spin the wheel", exact: true })
      .click();
  await expect(app.locator("[data-decision-history] li")).toHaveCount(10);
  expect(
    await app
      .locator("[data-decision-wheel]")
      .evaluate((el) => el.getAnimations().length),
  ).toBe(0);
});

test("bounded choices save, reject invalid edits, and clear with undo", async ({
  page,
}) => {
  let app = await openDecision(page);
  const editor = app.getByLabel("Choices, one per line", { exact: true });
  await editor.fill("Tea\nCoffee");
  await app.getByRole("button", { name: "Save choices", exact: true }).click();
  for (const invalid of [
    "One",
    Array.from({ length: 21 }, (_, i) => `Choice ${i}`).join("\n"),
    `${"x".repeat(81)}\nShort`,
  ]) {
    await editor.fill(invalid);
    await app
      .getByRole("button", { name: "Save choices", exact: true })
      .click();
    await expect(editor).toHaveAttribute("aria-invalid", "true");
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).choices,
        STORAGE_KEY,
      ),
    ).toEqual(["Tea", "Coffee"]);
  }
  await editor.fill("Tea\nCoffee");
  await app.getByRole("button", { name: "Save choices", exact: true }).click();
  await app.getByRole("button", { name: "Clear choices", exact: true }).click();
  await expect(editor).toHaveValue("");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).choices,
      STORAGE_KEY,
    ),
  ).toEqual([]);
  await app.getByRole("button", { name: "Undo clear", exact: true }).click();
  await expect(editor).toHaveValue("Tea\nCoffee");
  app = await openDecision(page);
  await expect(
    app.getByLabel("Choices, one per line", { exact: true }),
  ).toHaveValue("Tea\nCoffee");
  await expect(app.locator("[data-decision-history] li")).toHaveCount(0);
});

test("malformed saved data stays intact while session choices remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    (key) => localStorage.setItem(key, '{"choices":broken'),
    STORAGE_KEY,
  );
  const app = await openDecision(page);
  await expect(app.locator("[data-decision-storage]")).toContainText(
    "original data is untouched",
  );
  await app
    .getByLabel("Choices, one per line", { exact: true })
    .fill("North\nSouth");
  await app.getByRole("button", { name: "Save choices", exact: true }).click();
  await expect(app.locator("[data-decision-status]")).toContainText(
    "Saving is unavailable",
  );
  await app
    .getByRole("button", { name: "Spin the wheel", exact: true })
    .click();
  await expect(app.locator("[data-decision-result]")).toHaveText(
    /^(North|South)$/,
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe('{"choices":broken');
});

test("phone themes fit and minimizing settles a pending spin once", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const app = await openDecision(page);
  for (const theme of ["light", "dark"]) {
    await page
      .locator("html")
      .evaluate(
        (element, value) => element.setAttribute("data-theme", value),
        theme,
      );
    expect(
      await app
        .locator(".decision-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
  }
  await app
    .getByRole("button", { name: "Spin the wheel", exact: true })
    .click();
  await app.locator('[data-window-action="minimize"]').click();
  await expect(app).toBeHidden();
  await expect(app.locator("[data-decision-history] li")).toHaveCount(1);
  expect(
    await app
      .locator("[data-decision-wheel]")
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  await page.locator('[data-task="decision"]').click();
  await expect(
    app.getByRole("button", { name: "Spin the wheel", exact: true }),
  ).toBeEnabled();
  await expect(app.locator("[data-decision-history] li")).toHaveCount(1);
});

test("changing choices resets the current pick and an empty draft can clear the saved wheel", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let app = await openDecision(page);
  const editor = app.getByLabel("Choices, one per line", { exact: true });
  await editor.fill("Tea\nCoffee");
  await app
    .getByRole("button", { name: "Spin the wheel", exact: true })
    .click();
  await expect(app.locator("[data-decision-result]")).toHaveText(
    /^(Tea|Coffee)$/,
  );

  await editor.fill("North\nSouth");
  await app.getByRole("button", { name: "Save choices", exact: true }).click();
  await expect(app.locator("[data-decision-result]")).toHaveText(
    "Give the wheel a spin.",
  );
  await expect(app.locator("[data-decision-legend] li.is-chosen")).toHaveCount(
    0,
  );
  await expect(app.locator("[data-decision-history] li")).toHaveCount(1);

  await editor.fill("");
  await app.getByRole("button", { name: "Clear choices", exact: true }).click();
  await expect(app.locator("[data-decision-count]")).toHaveText("0 choices");
  await expect(app.locator("[data-decision-result]")).toHaveText(
    "Add at least two choices.",
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).choices,
      STORAGE_KEY,
    ),
  ).toEqual([]);

  await app.getByRole("button", { name: "Undo clear", exact: true }).click();
  await expect(editor).toHaveValue("");
  await expect(app.locator("[data-decision-count]")).toHaveText("2 choices");
  await expect(app.locator("[data-decision-draft]")).toContainText(
    "unsaved edits are restored",
  );
  app = await openDecision(page);
  await expect(
    app.getByLabel("Choices, one per line", { exact: true }),
  ).toHaveValue("North\nSouth");
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  expect(
    await app.locator(".decision-body").evaluate((element) => {
      const result = element.querySelector(".decision-result")!;
      return (
        result.getBoundingClientRect().bottom <=
        element.getBoundingClientRect().bottom
      );
    }),
  ).toBe(true);
});
