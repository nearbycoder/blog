import { expect, test, type Page } from "@playwright/test";

async function openTyping(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="typing"]').click();
  const app = page.locator('[data-window="typing"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(
    app.getByRole("button", { name: "Start sprint", exact: true }),
  ).toBeVisible();
  return app;
}

test("corrected mistakes count toward accuracy and a completed best survives reopening", async ({
  page,
}) => {
  const app = await openTyping(page);
  const passage = (await app.locator("[data-typing-target]").textContent())!;
  const input = app.getByLabel("Type the passage here", { exact: true });
  await app.getByRole("button", { name: "Start sprint", exact: true }).click();
  await input.press("x");
  await expect(app.locator("[data-typing-accuracy]")).toHaveText("0%");
  await input.press("Backspace");
  await expect(app.locator("[data-typing-accuracy]")).toHaveText("0%");
  await input.fill(passage);
  await expect(app.locator("[data-typing-result]")).toBeVisible();
  const expectedAccuracy =
    Math.round((passage.length / (passage.length + 1)) * 1000) / 10;
  await expect(app.locator("[data-typing-accuracy]")).toHaveText(
    `${expectedAccuracy}%`,
  );
  await expect(input).toHaveAttribute("readonly", "");
  const best = await app.locator("[data-typing-best]").textContent();
  expect(Number(best)).toBeGreaterThan(0);
  const reopened = await openTyping(page);
  await expect(reopened.locator("[data-typing-best]")).toHaveText(best!);
  await expect(reopened.locator("[data-typing-wpm]")).toHaveText("0");
});

test("pausing freezes active time, deletions reduce WPM, and reset preserves a sprint until confirmed", async ({
  page,
}) => {
  await page.clock.install();
  const app = await openTyping(page);
  const input = app.getByLabel("Type the passage here", { exact: true });
  const passage = (await app.locator("[data-typing-target]").textContent())!;
  await app.getByRole("button", { name: "Start sprint", exact: true }).click();
  await page.clock.runFor(2000);
  await expect(app.locator("[data-typing-time]")).toHaveText("0.0s");
  await input.fill(passage.slice(0, 10));
  await page.clock.runFor(60000);
  await expect(app.locator("[data-typing-wpm]")).toHaveText("2");
  await input.press("Backspace");
  await expect(app.locator("[data-typing-wpm]")).toHaveText("1.8");
  await app.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await app.locator("[data-typing-time]").textContent();
  await page.clock.runFor(20000);
  await expect(app.locator("[data-typing-time]")).toHaveText(paused!);
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Keep sprint", exact: true }).click();
  await expect(input).toHaveValue(passage.slice(0, 9));
  await app.getByRole("button", { name: "Reset", exact: true }).click();
  await app.getByRole("button", { name: "Reset sprint", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(app.locator("[data-typing-time]")).toHaveText("0.0s");
  await expect(app.locator("[data-typing-accuracy]")).toHaveText("100%");
});

test("phone layout remains usable and malformed saved scores are preserved", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.addInitScript(() =>
    localStorage.setItem("nearby-desktop-typing-v1", "broken saved score"),
  );
  const app = await openTyping(page);
  await expect(app.locator("[data-typing-storage]")).toContainText(
    "left untouched",
  );
  const input = app.getByLabel("Type the passage here", { exact: true });
  expect(
    await input.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  await app
    .getByRole("combobox", { name: "Passage", exact: true })
    .selectOption("garden");
  const passage = (await app.locator("[data-typing-target]").textContent())!;
  await app.getByRole("button", { name: "Start sprint", exact: true }).click();
  await input.dispatchEvent("paste");
  await expect(input).toHaveValue("");
  await expect(app.locator("[data-typing-status]")).toContainText(
    "pasting and dropping text are disabled",
  );
  await input.fill(passage);
  await expect(app.locator("[data-typing-summary]")).toContainText(
    "session best",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("nearby-desktop-typing-v1")),
  ).toBe("broken saved score");
  expect(
    await app
      .locator(".typing-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
});

test("Start reveals the input in quarter panes and IME text is scored only on commit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const app = await openTyping(page);
  await app.evaluate((element) => {
    element.style.width = "708px";
    element.style.height = "454px";
  });
  const input = app.getByLabel("Type the passage here", { exact: true });
  await expect(input).not.toBeFocused();
  await app.getByRole("button", { name: "Start sprint", exact: true }).click();
  await expect(input).toBeFocused();
  const viewport = (await app.locator(".typing-body").boundingBox())!;
  const inputBox = (await input.boundingBox())!;
  expect(inputBox.y).toBeGreaterThanOrEqual(viewport.y);
  expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(
    viewport.y + viewport.height + 1,
  );
  await input.dispatchEvent("compositionstart");
  await input.evaluate((element: HTMLTextAreaElement) => {
    element.value = "x";
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        isComposing: true,
        data: "x",
      }),
    );
    element.value = "M";
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        isComposing: true,
        data: "M",
      }),
    );
  });
  await expect(app.locator("[data-typing-accuracy]")).toHaveText("100%");
  await expect(app.locator("[data-typing-progress]")).toHaveAttribute(
    "value",
    "0",
  );
  await input.dispatchEvent("compositionend", { data: "M" });
  await input.dispatchEvent("input", { inputType: "insertText", data: "M" });
  await input.press("x");
  await expect(app.locator("[data-typing-accuracy]")).toHaveText("50%");

  const passage = (await app.locator("[data-typing-target]").textContent())!;
  await input.press("ControlOrMeta+a");
  await input.dispatchEvent("compositionstart");
  await input.evaluate((element: HTMLTextAreaElement, text) => {
    element.value = text;
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        isComposing: true,
        data: text,
      }),
    );
  }, passage);
  await expect(app.locator("[data-typing-result]")).toBeHidden();
  await input.dispatchEvent("compositionend", { data: passage });
  await expect(app.locator("[data-typing-result]")).toBeVisible();
  const expected =
    Math.round(((passage.length + 1) / (passage.length + 2)) * 1000) / 10;
  await expect(app.locator("[data-typing-accuracy]")).toHaveText(
    `${expected}%`,
  );
});
