import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const key = "nearby-desktop-preferences-v1";
const defaults = {
  version: 1,
  accent: "emerald",
  wallpaper: "glass",
  density: "comfortable",
  textSize: "standard",
  reduceMotion: false,
  reduceTransparency: false,
  showShortcuts: true,
};

async function openSettings(page: Page) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="settings"]:visible').first().click();
  const app = page.locator('[data-window="settings"]');
  await expect(app.locator(".settings-app")).toBeVisible();
  return app;
}

test("appearance settings apply immediately and restore before Settings is opened", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openSettings(page);
  const desktop = page.locator("[data-desktop]");
  await app.getByRole("radio", { name: "Blue", exact: true }).check();
  await app.getByRole("radio", { name: "Drafting grid", exact: true }).check();
  await app.getByRole("radio", { name: "Compact", exact: true }).check();
  await app.getByRole("radio", { name: "Larger", exact: true }).check();
  await app.getByRole("checkbox", { name: /^Reduce motion/ }).check();
  await app.getByRole("checkbox", { name: /^Reduce transparency/ }).check();
  await app
    .getByRole("checkbox", { name: /^Show desktop shortcuts/ })
    .uncheck();
  await expect(desktop).toHaveAttribute("data-desktop-accent", "blue");
  await expect(desktop).toHaveAttribute("data-desktop-wallpaper", "grid");
  await expect(desktop).toHaveAttribute("data-desktop-density", "compact");
  await expect(desktop).toHaveAttribute("data-desktop-text", "large");
  await expect(page.locator(".desktop-shortcuts")).toBeHidden();
  expect(
    await app
      .locator(".window-title")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("15px");
  expect(
    await page
      .locator(".desktop-dock")
      .evaluate((element) => getComputedStyle(element).backdropFilter),
  ).toBe("none");
  for (const selector of [".desktop-dock", ".desktop-session-tools"]) {
    expect(
      await page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);
        const sample = document.createElement("span");
        sample.style.backgroundColor = style.getPropertyValue("--desk-sidebar");
        element.append(sample);
        const solid = getComputedStyle(sample).backgroundColor;
        sample.remove();
        return style.backgroundColor === solid;
      }),
    ).toBe(true);
  }
  expect(
    await app.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  const expected = {
    ...defaults,
    accent: "blue",
    wallpaper: "grid",
    density: "compact",
    textSize: "large",
    reduceMotion: true,
    reduceTransparency: true,
    showShortcuts: false,
  };
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key),
  ).toEqual(expected);
  await page.reload();
  await expect(desktop).toHaveAttribute("data-desktop-accent", "blue");
  await expect(desktop).toHaveAttribute("data-desktop-wallpaper", "grid");
  await expect(page.locator(".desktop-shortcuts")).toBeHidden();
  const restored = await openSettings(page);
  await expect(
    restored.getByRole("radio", { name: "Blue", exact: true }),
  ).toBeChecked();
  await expect(
    restored.getByRole("checkbox", { name: /^Reduce motion/ }),
  ).toBeChecked();
});

test("compact preferences retain 44px Settings labels on a large touch screen", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${test.info().project.use.baseURL}/desktop/`);
  const app = await openSettings(page);
  await app.getByRole("radio", { name: "Compact", exact: true }).check();
  for (const label of await app.locator(".settings-choices label").all()) {
    expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await context.close();
});

test("comfort settings change live without replacing an open reader", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="pages"]').click();
  await page.getByRole("link", { name: /^About Page/ }).click();
  const reader = page.locator("[data-desktop-reader]");
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  await reader.evaluate((element) =>
    element.setAttribute("data-review-marker", "retained"),
  );
  const readerSource = await reader.getAttribute("src");
  const app = await openSettings(page);
  expect(
    await app.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("desktop-open");
  await app.getByRole("checkbox", { name: /^Reduce motion/ }).check();
  expect(
    await app.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await app
    .getByRole("checkbox", { name: /^Show desktop shortcuts/ })
    .uncheck();
  const shortcut = page.locator(".desktop-shortcuts button").first();
  expect(
    await shortcut.evaluate((element) => {
      (element as HTMLElement).focus();
      return document.activeElement === element;
    }),
  ).toBe(false);
  await app.getByRole("radio", { name: "Larger", exact: true }).check();
  await app.getByRole("radio", { name: "Amber", exact: true }).check();
  expect(
    await page
      .locator(".reader-toolbar")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("14px");
  await expect(reader).toHaveAttribute("src", readerSource!);
  await expect(reader).toHaveAttribute("data-review-marker", "retained");
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  await app.getByRole("checkbox", { name: /^Reduce motion/ }).uncheck();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await app.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

for (const theme of ["dark", "light"]) {
  test(`saved preferences apply in ${theme} before the Settings app loads`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, defaults, theme }) => {
        localStorage.setItem("theme-preference", theme);
        localStorage.setItem(
          key,
          JSON.stringify({
            ...defaults,
            accent: "violet",
            wallpaper: "plain",
            textSize: "large",
            reduceTransparency: true,
            showShortcuts: false,
          }),
        );
      },
      { key, defaults, theme },
    );
    await page.goto("/desktop/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator('[data-window="settings"]')).toHaveCount(0);
    await expect(page.locator("[data-desktop]")).toHaveAttribute(
      "data-desktop-accent",
      "violet",
    );
    await expect(page.locator(".desktop-shortcuts")).toBeHidden();
    expect(
      await page
        .locator("[data-desktop]")
        .evaluate(
          (element) => getComputedStyle(element, "::before").backgroundImage,
        ),
    ).toBe("none");
    expect(
      await page
        .locator(".desktop-dock")
        .evaluate((element) => getComputedStyle(element).backdropFilter),
    ).toBe("none");
    expect(
      await page
        .locator('[data-window="library"] .window-title')
        .evaluate((element) => getComputedStyle(element).fontSize),
    ).toBe("15px");
  });
}

for (const width of [320, 1440]) {
  test(`Settings palettes meet accessibility checks in both themes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/desktop/");
    const app = await openSettings(page);
    await app.getByRole("radio", { name: "Larger", exact: true }).check();
    for (const theme of ["dark", "light"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      for (const palette of ["Emerald", "Blue", "Violet", "Amber"]) {
        await app.getByRole("radio", { name: palette, exact: true }).check();
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(audit.violations, `${theme} ${palette} ${width}px`).toEqual([]);
      }
    }
  });
}

test("unreadable or future preference data survives changes and restoring defaults", async ({
  page,
}) => {
  await page.goto("/desktop/");
  for (const raw of [
    "broken preferences",
    JSON.stringify({ ...defaults, version: 2 }),
    JSON.stringify({ ...defaults, accent: "magenta" }),
    JSON.stringify({ ...defaults, futureField: true }),
    "x".repeat(2049),
  ]) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key,
      raw,
    });
    await page.reload();
    const app = await openSettings(page);
    await expect(app.locator("[data-settings-status]")).toContainText(
      "the original is preserved",
    );
    await app.getByRole("radio", { name: "Violet", exact: true }).check();
    await expect(page.locator("[data-desktop]")).toHaveAttribute(
      "data-desktop-accent",
      "violet",
    );
    await app
      .getByRole("button", { name: "Restore default appearance", exact: true })
      .click();
    await expect(
      app.getByRole("radio", { name: "Emerald", exact: true }),
    ).toBeChecked();
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
      raw,
    );
  }
});

test("a blocked initial read cannot overwrite an existing preference record", async ({
  page,
}) => {
  const raw = JSON.stringify({ ...defaults, accent: "amber" });
  await page.addInitScript(
    ({ key, raw }) => {
      localStorage.setItem(key, raw);
      const read = Storage.prototype.getItem;
      Storage.prototype.getItem = function (candidate: string) {
        if (candidate === key)
          throw new DOMException("Read blocked", "SecurityError");
        return read.call(this, candidate);
      };
      (
        window as unknown as { originalStorageRead: typeof read }
      ).originalStorageRead = read;
    },
    { key, raw },
  );
  await page.goto("/desktop/");
  const app = await openSettings(page);
  await app.getByRole("radio", { name: "Blue", exact: true }).check();
  await expect(app.locator("[data-settings-status]")).toContainText(
    "the original is preserved",
  );
  expect(
    await page.evaluate(
      (key) =>
        (
          window as unknown as {
            originalStorageRead: typeof Storage.prototype.getItem;
          }
        ).originalStorageRead.call(localStorage, key),
      key,
    ),
  ).toBe(raw);
});

test("palette and wallpaper treatments adapt to both blog themes", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openSettings(page);
  const desktop = page.locator("[data-desktop]");
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const palette of ["Blue", "Violet", "Amber", "Emerald"]) {
      await app.getByRole("radio", { name: palette, exact: true }).check();
      const color = await desktop.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--desk-accent").trim(),
      );
      const expected =
        theme === "light"
          ? {
              Blue: "#235fa1",
              Violet: "#73499b",
              Amber: "#805b12",
              Emerald: "#11775a",
            }
          : {
              Blue: "#9ecaff",
              Violet: "#d4b5ff",
              Amber: "#f3ce80",
              Emerald: "#83dfbd",
            };
      expect(color).toBe(expected[palette as keyof typeof expected]);
    }
    await app.getByRole("radio", { name: "Quiet solid", exact: true }).check();
    expect(
      await desktop.evaluate(
        (element) => getComputedStyle(element, "::before").backgroundImage,
      ),
    ).toBe("none");
    await app
      .getByRole("radio", { name: "Drafting grid", exact: true })
      .check();
    expect(
      await desktop.evaluate(
        (element) => getComputedStyle(element, "::before").backgroundImage,
      ),
    ).toContain("linear-gradient");
    await app
      .getByRole("radio", { name: "Emerald glass", exact: true })
      .check();
    expect(
      await desktop.evaluate(
        (element) => getComputedStyle(element, "::before").backgroundImage,
      ),
    ).toContain(
      theme === "light" ? "emerald-glass-light.webp" : "emerald-glass.webp",
    );
  }
});

test("larger text fits a 320px window and compact retains touch-sized controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  const app = await openSettings(page);
  await app.getByRole("radio", { name: "Larger", exact: true }).check();
  await app.getByRole("radio", { name: "Compact", exact: true }).check();
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    expect(
      await app
        .locator(".settings-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const reset = app.getByRole("button", {
    name: "Restore default appearance",
    exact: true,
  });
  await reset.scrollIntoViewIfNeeded();
  expect((await reset.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await reset.click();
  await expect(page.locator(".desktop-shortcuts")).toBeVisible();
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key),
  ).toEqual(defaults);
});
