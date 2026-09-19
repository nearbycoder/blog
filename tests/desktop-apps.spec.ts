import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ids = ["notes", "calculator", "sketchpad", "focus"] as const;
async function launch(page: import("@playwright/test").Page, id: string) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  const win = page.locator(`[data-window="${id}"]`);
  await expect(win.locator(".utility-loading")).toHaveCount(0);
  return win;
}

test("utility applications load individually and remain absent from the blog and desktop boot", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const appCode = (url: string) =>
    /desktop-(apps|notes|calculator|sketchpad|focus)\.[\w-]+\.(js|css)/.test(
      url,
    );
  await page.goto("/");
  expect(requests.filter(appCode)).toEqual([]);
  await page.goto("/desktop/");
  expect(requests.filter(appCode)).toEqual([]);
  await expect(page.locator("style[data-desktop-app-style]")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      [...document.styleSheets].some((sheet) => {
        try {
          return [...sheet.cssRules].some((rule) =>
            /\.(notes|calculator|sketchpad|focus)-app/.test(rule.cssText),
          );
        } catch {
          return false;
        }
      }),
    ),
  ).toBe(false);
  for (const id of ids) {
    expect(
      requests.some((url) =>
        new RegExp(`desktop-${id}\\.[\\w-]+\\.js`).test(url),
      ),
    ).toBe(false);
    const win = await launch(page, id);
    await expect(
      page.locator(`style[data-desktop-app-style="${id}"]`),
    ).toHaveCount(1);
    expect(
      requests.some((url) =>
        new RegExp(`desktop-${id}\\.[\\w-]+\\.js`).test(url),
      ),
    ).toBe(true);
    await win.locator('[data-window-action="close"]').click();
  }
});

test("utility apps use one window each, support launcher search, snapping and task restoration", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  const win = await launch(page, "notes");
  await page.keyboard.press("Control+Alt+ArrowLeft");
  await expect(win).toHaveAttribute("data-snap", "left");
  await win.getByRole("button", { name: "Minimize Notes" }).click();
  await expect(win).toBeHidden();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(win).toBeVisible();
  await launch(page, "notes");
  await expect(page.locator('[data-window="notes"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page
    .getByRole("searchbox", { name: "Search applications and files" })
    .fill("calculator");
  await page.locator("[data-launcher-results] button").first().click();
  await expect(page.locator('[data-window="calculator"]')).toBeVisible();
  await expect(
    page.locator('[data-window="calculator"] .utility-loading'),
  ).toHaveCount(0);
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(page.locator('[data-window="calculator"]')).toHaveAttribute(
    "data-snap",
    "right",
  );
});

test("late and failed app downloads recover without creating closed windows", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/desktop-focus.*.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="focus"]').click();
  await page.getByRole("button", { name: "Close Focus", exact: true }).click();
  release();
  await expect(page.locator('[data-window="focus"]')).toHaveCount(0);
  await launch(page, "focus");
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await page.route("**/desktop-calculator.*.js", (route) => route.abort());
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="calculator"]').click();
  await expect(
    page.locator('[data-window="calculator"] [role="status"]'),
  ).toContainText("couldn’t load");
  await page.unroute("**/desktop-calculator.*.js");
  await page
    .getByRole("link", {
      name: "Reload the desktop to try again.",
      exact: true,
    })
    .click();
  await launch(page, "calculator");
  await expect(
    page.locator('[data-window="calculator"] .utility-loading'),
  ).toHaveCount(0);
});

test("focus timer stays accurate across minimize, pause, completion and reopen", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/desktop/");
  const win = await launch(page, "focus");
  await win.getByLabel("Minutes", { exact: true }).fill("1");
  await win.getByRole("button", { name: "Set timer", exact: true }).click();
  await win.getByRole("button", { name: "Start timer", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(win.getByRole("timer")).toHaveText("00:50");
  await win.getByRole("button", { name: "Pause timer", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(win.getByRole("timer")).toHaveText("00:50");
  await win.getByRole("button", { name: "Resume timer", exact: true }).click();
  await win
    .getByRole("button", { name: "Minimize Focus", exact: true })
    .click();
  await page.clock.fastForward(50000);
  await page.getByRole("button", { name: "Show Focus", exact: true }).click();
  await expect(win.getByRole("timer")).toHaveText("00:00");
  await expect(win.locator("[data-focus-message]")).toContainText(
    "Custom complete",
  );
  await expect(win.locator(".focus-completed")).toHaveText(
    "1 focus session completed",
  );
  await win.getByRole("button", { name: "Start again", exact: true }).click();
  await page.clock.fastForward(20000);
  await win.getByRole("button", { name: "Close Focus", exact: true }).click();
  await page.clock.fastForward(20000);
  await launch(page, "focus");
  await expect(win.getByRole("timer")).toHaveText("00:40");
  await expect(
    win.getByRole("button", { name: "Resume timer", exact: true }),
  ).toBeVisible();
});

test("new apps fit phones and pass accessibility in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const id of ids) {
      const win = await launch(page, id);
      expect((await win.boundingBox())!.width).toBe(308);
      for (const input of await win
        .locator(
          'input:not([type="range"]):not([type="color"]), textarea, select',
        )
        .all()) {
        if (await input.isVisible())
          expect(
            parseFloat(
              await input.evaluate((el) => getComputedStyle(el).fontSize),
            ),
          ).toBeGreaterThanOrEqual(16);
      }
      const results = await new AxeBuilder({ page })
        .include(`[data-window="${id}"]`)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await win.locator('[data-window-action="close"]').click();
    }
  }
});

test("calculator keypad and focus controls fit quarter-screen windows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  for (const id of ["calculator", "focus"]) {
    const win = await launch(page, id);
    const bar = (await win.locator("[data-drag-handle]").boundingBox())!;
    await page.mouse.move(bar.x + 100, bar.y + 20);
    await page.mouse.down();
    await page.mouse.move(id === "calculator" ? 1438 : 2, 2, { steps: 8 });
    await page.mouse.up();
    await expect(win).toHaveAttribute(
      "data-snap",
      id === "calculator" ? "top-right" : "top-left",
    );
    const control =
      id === "calculator"
        ? win.getByRole("button", { name: "Calculate result", exact: true })
        : win.getByRole("button", { name: "Set timer", exact: true });
    const bounds = (await win.boundingBox())!;
    await expect
      .poll(async () => {
        const box = (await control.boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThan(bounds.y + bounds.height - 8);
  }
});

test("a calculator finishing its download does not steal focus from another app", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/desktop-calculator.*.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="calculator"]').click();
  const notes = await launch(page, "notes");
  await notes.getByRole("button", { name: "Create your first note" }).click();
  const title = notes.getByLabel("Note title", { exact: true });
  await title.fill("Keep my focus");
  release();
  await expect(
    page.locator('[data-window="calculator"] .utility-loading'),
  ).toHaveCount(0);
  await expect(notes).toHaveClass(/is-active/);
  await expect(title).toBeFocused();
});
