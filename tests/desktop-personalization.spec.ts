import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  CUSTOMIZATION_KEY,
  customizationDefaults,
  validCustomization,
} from "../src/scripts/desktop-customization";
import {
  backupCategories,
  validateRecord,
  createBackup,
  parseBackup,
} from "../src/scripts/desktop-backup-data";

async function settings(page: Page) {
  await page.goto("/desktop");
  await page
    .getByRole("button", { name: "Open Settings", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "App content scale", exact: true }),
  ).toBeVisible();
  return page.locator(".settings-app");
}
async function range(page: Page, name: string, value: number) {
  await page.getByRole("slider", { name, exact: true }).fill(String(value));
}
async function openApp(page: Page, id: string) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]:visible`).first().click();
  await expect(page.locator(`[data-window="${id}"] .${id}-app`)).toBeVisible();
}

test("personalization validates strict bounds and belongs to appearance backups", () => {
  const value = customizationDefaults();
  expect(validCustomization(value)).toBe(true);
  for (const patch of [
    { contentScale: 59 },
    { contentScale: 201 },
    { contentScale: 100.1 },
    { wallpaper: "remote" },
    { idleMinutes: -1 },
    { saver: "unknown" },
    { saverMessage: "x".repeat(121) },
    { version: 2 },
    { extra: true },
  ])
    expect(validCustomization({ ...value, ...patch })).toBe(false);
  expect(validateRecord(CUSTOMIZATION_KEY, JSON.stringify(value))).toBe("");
  expect(backupCategories.find((c) => c.id === "appearance")!.keys).toContain(
    CUSTOMIZATION_KEY,
  );
  const backup = createBackup([
    {
      category: backupCategories.find((c) => c.id === "appearance")!,
      data: { [CUSTOMIZATION_KEY]: JSON.stringify(value) },
      bytes: 0,
      readable: true,
      issue: "",
    },
  ]);
  expect(parseBackup(backup).snapshots[0].data[CUSTOMIZATION_KEY]).toBe(
    JSON.stringify(value),
  );
});

test("scale extremes preserve live app state, window geometry, and persistence", async ({
  page,
}) => {
  const app = await settings(page);
  await openApp(page, "notes");
  const notes = page.locator('[data-window="notes"]');
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  const editor = notes.locator("textarea").first();
  await editor.fill("Keep this note while changing the desktop.");
  await editor.evaluate((el) => {
    el.setAttribute("data-identity", "original");
  });
  const before = await notes.boundingBox();
  await page
    .getByRole("button", { name: "Show Settings", exact: true })
    .click();
  for (const size of [60, 200, 137]) {
    await range(page, "App content scale", size);
    await expect(notes.locator(".desktop-app-content")).toHaveCSS(
      "zoom",
      String(size / 100),
    );
    await expect(app).toHaveCSS("zoom", "1");
    expect((await notes.boundingBox())!.width).toBeCloseTo(before!.width, 0);
    await expect(editor).toHaveValue(
      "Keep this note while changing the desktop.",
    );
    await expect(editor).toHaveAttribute("data-identity", "original");
  }
  await page.reload();
  await expect(
    page.locator('[data-window="notes"] .desktop-app-content'),
  ).toHaveCSS("zoom", "1.37");
});

test("floating window size and icon size reach their extremes without offscreen controls", async ({
  page,
}) => {
  await settings(page);
  await range(page, "Floating window size", 30);
  await openApp(page, "notes");
  const notes = page.locator('[data-window="notes"]');
  const small = await notes.boundingBox();
  await page
    .getByRole("button", { name: "Show Settings", exact: true })
    .click();
  await range(page, "Floating window size", 100);
  await page
    .getByRole("button", { name: "Resize open floating windows" })
    .click();
  expect((await notes.boundingBox())!.width).toBeGreaterThan(
    small!.width + 150,
  );
  await range(page, "Desktop icon size", 112);
  await expect(page.locator(".shortcut-art").first()).toHaveCSS(
    "height",
    "112px",
  );
  const icon = page.locator('[data-desktop-icon="notes"]');
  const position = await icon.evaluate((el) => el.style.left);
  await range(page, "Desktop icon size", 24);
  await expect(page.locator(".shortcut-art").first()).toHaveCSS(
    "height",
    "24px",
  );
  expect(await icon.evaluate((el) => el.style.left)).not.toBe(position);
  await page.getByRole("button", { name: "Reset sizes", exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "App content scale", exact: true }),
  ).toHaveValue("100");
});

test("wallpaper gallery, motion toggle, system motion and original controls work together", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const app = await settings(page);
  expect(await app.locator("[data-wallpaper]").count()).toBe(30);
  expect(await app.locator("[data-wallpaper] small").count()).toBe(8);
  await app
    .getByRole("button", { name: "Aurora Animated", exact: true })
    .click();
  const desktop = page.locator("[data-desktop]");
  await expect(desktop).toHaveAttribute("data-custom-wallpaper", "aurora");
  expect(
    await desktop.evaluate(
      (el) => getComputedStyle(el, "::before").animationName,
    ),
  ).toBe("desktop-wallpaper-flow");
  await app
    .getByRole("checkbox", { name: "Animate live wallpapers", exact: true })
    .uncheck();
  expect(
    await desktop.evaluate(
      (el) => getComputedStyle(el, "::before").animationPlayState,
    ),
  ).toBe("paused");
  await app
    .getByRole("checkbox", { name: "Animate live wallpapers", exact: true })
    .check();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await desktop.evaluate(
      (el) => getComputedStyle(el, "::before").animationName,
    ),
  ).toBe("none");
  await app.getByRole("radio", { name: "Drafting grid", exact: true }).check();
  await expect(desktop).toHaveAttribute("data-custom-wallpaper", "original");
  await expect(desktop).toHaveAttribute("data-desktop-wallpaper", "grid");
});

test("screensaver is customizable, traps focus, wakes without typing into an app, and restores focus", async ({
  page,
}) => {
  const app = await settings(page);
  await app
    .getByRole("combobox", { name: "Screensaver scene", exact: true })
    .selectOption("stars");
  await app
    .getByRole("combobox", { name: "Screensaver color", exact: true })
    .selectOption("amber");
  await app
    .getByRole("textbox", { name: "Screensaver message", exact: true })
    .fill("A quiet moment <script>");
  const start = app.getByRole("button", {
    name: "Start screensaver",
    exact: true,
  });
  await start.click();
  const saver = page.getByRole("dialog", { name: "Desktop screensaver" });
  await expect(saver).toBeVisible();
  await expect(saver).toHaveAttribute("data-scene", "stars");
  await expect(saver.locator(".saver-message")).toHaveText(
    "A quiet moment <script>",
  );
  await expect(
    saver.getByRole("button", { name: "Wake desktop" }),
  ).toBeFocused();
  expect(
    (await new AxeBuilder({ page }).include(".desktop-screensaver").analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("x");
  await expect(saver).toHaveCount(0);
  await expect(start).toBeFocused();
  await expect(
    app.getByRole("textbox", { name: "Screensaver message", exact: true }),
  ).toHaveValue("A quiet moment <script>");
  await app
    .getByRole("combobox", { name: "Screensaver scene", exact: true })
    .selectOption("blank");
  await start.click();
  await expect(saver.locator("time")).toBeHidden();
  await saver.getByRole("button", { name: "Wake desktop" }).click();
  await expect(saver).toHaveCount(0);
});

test("idle activity resets the timer and waking schedules a fresh interval", async ({
  page,
}) => {
  await page.clock.install();
  const app = await settings(page);
  await app
    .getByRole("combobox", { name: "Start after inactivity", exact: true })
    .selectOption("1");
  await page.clock.fastForward(45_000);
  await page.mouse.move(10, 10);
  await page.clock.fastForward(30_000);
  const saver = page.getByRole("dialog", { name: "Desktop screensaver" });
  await expect(saver).toHaveCount(0);
  await page.clock.fastForward(31_000);
  await expect(saver).toBeVisible();
  await page.keyboard.press("Escape");
  await page.clock.fastForward(30_000);
  await expect(saver).toHaveCount(0);
});

test("wallpaper rotation and dock settings are saved and applied", async ({
  page,
}) => {
  await page.clock.install();
  const app = await settings(page);
  await app.getByRole("button", { name: "Midnight", exact: true }).click();
  await app
    .getByRole("combobox", {
      name: "Rotate wallpaper automatically",
      exact: true,
    })
    .selectOption("1");
  await page.clock.fastForward(61_000);
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-custom-wallpaper",
    "charcoal",
  );
  await app
    .getByRole("checkbox", { name: "Show dock date", exact: true })
    .uncheck();
  await expect(page.locator("[data-panel-date]")).toBeHidden();
  await app
    .getByRole("checkbox", { name: "Show clock seconds", exact: true })
    .check();
  await expect(page.locator("[data-panel-time]")).toHaveText(/\d\d:\d\d:\d\d/);
  await app
    .getByRole("checkbox", { name: "Show shortcut labels", exact: true })
    .uncheck();
  await expect(
    page.locator('[data-desktop-icon="notes"]'),
  ).toHaveAccessibleName("Notes");
});

for (const width of [320, 1440])
  test(`settings are searchable and accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const app = await settings(page);
    await app
      .getByRole("searchbox", { name: "Find a setting" })
      .fill("screensaver");
    await expect(app.locator('[data-personal-section="sleep"]')).toBeVisible();
    await expect(app.locator('[data-personal-section="sizing"]')).toBeHidden();
    await app
      .getByRole("searchbox", { name: "Find a setting" })
      .fill("zzzzzzz");
    await expect(app.locator("[data-settings-empty]")).toBeVisible();
    await app.getByRole("searchbox", { name: "Find a setting" }).fill("");
    await range(page, "App content scale", 200);
    expect(
      await app.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include(".settings-app").analyze())
        .violations,
    ).toEqual([]);
  });

test("malformed personalization survives editing and reset without overwriting the original", async ({
  page,
}) => {
  await page.addInitScript(
    ([key, raw]) => localStorage.setItem(key, raw),
    [CUSTOMIZATION_KEY, '{"version":999}'],
  );
  const app = await settings(page);
  await app.getByRole("button", { name: "Huge", exact: true }).click();
  await app
    .getByRole("button", { name: "Reset personalization", exact: true })
    .click();
  await expect(app.locator("[data-personal-status]")).toContainText(
    "original is preserved",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CUSTOMIZATION_KEY),
  ).toBe('{"version":999}');
});

test("content scale preserves Trellis panels and nested app instances", async ({
  page,
}) => {
  await settings(page);
  await openApp(page, "notes");
  const notes = page.locator('[data-window="notes"]');
  await notes.locator("[data-notes-new]").first().click();
  const editor = notes.getByRole("textbox", { name: "Note text", exact: true });
  await editor.fill("Tiled work stays in place.");
  const original = await editor.elementHandle();
  await openApp(page, "json");
  await page.locator("[data-tiling-toggle]").click();
  await expect(notes).toHaveAttribute("data-tiled", "true");
  const before = await notes.boundingBox();
  await page
    .getByRole("button", { name: "Show Settings", exact: true })
    .click();
  for (const scale of [60, 200]) {
    await range(page, "App content scale", scale);
    await expect(notes.locator(".desktop-app-content")).toHaveCSS(
      "zoom",
      String(scale / 100),
    );
    expect(await notes.boundingBox()).toEqual(before);
    expect(await editor.evaluate((el, saved) => el === saved, original)).toBe(
      true,
    );
    await expect(editor).toHaveValue("Tiled work stays in place.");
  }
});

test("Reader activity resets idle sleep and resizing retains the document", async ({
  page,
}) => {
  await page.clock.install();
  await settings(page);
  await page
    .getByRole("combobox", { name: "Start after inactivity", exact: true })
    .selectOption("1");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="pages"]').click();
  await page.getByRole("link", { name: /^About Page/ }).click();
  const reader = page.locator("[data-desktop-reader]");
  const heading = page.frameLocator("[data-desktop-reader]").locator("h1");
  await expect(heading).toBeVisible();
  const original = await heading.elementHandle();
  await page.clock.fastForward(45_000);
  await heading.click();
  await page.clock.fastForward(30_000);
  await expect(
    page.getByRole("dialog", { name: "Desktop screensaver" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show Settings", exact: true })
    .click();
  await range(page, "App content scale", 200);
  await expect(reader).toHaveCSS("zoom", "2");
  expect(await heading.evaluate((el, saved) => el === saved, original)).toBe(
    true,
  );
  await page.clock.fastForward(61_000);
  await expect(
    page.getByRole("dialog", { name: "Desktop screensaver" }),
  ).toBeVisible();
});
