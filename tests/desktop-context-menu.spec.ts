import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const menuSelector = "[data-desktop-context-menu]";
const librarySelector = '[data-window="library"]';

async function backgroundMenu(page: Page) {
  const workspace = (await page.locator("[data-workspace]").boundingBox())!;
  await page.mouse.click(workspace.x + workspace.width - 20, workspace.y + 20, {
    button: "right",
  });
  await expect(page.locator(menuSelector)).toBeVisible();
  return page.locator(menuSelector);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
});

test("desktop context actions open apps, arrange windows, and change the theme", async ({
  page,
}) => {
  let menu = await backgroundMenu(page);
  await expect(menu).toHaveAttribute("aria-label", "Desktop actions");
  await menu
    .getByRole("menuitem", { name: "Open Library", exact: true })
    .click();
  const library = page.locator(librarySelector);
  await expect(library).toBeVisible();
  await expect(menu).toBeHidden();
  await page.keyboard.press("Control+Alt+ArrowLeft");
  await expect(library).toHaveAttribute("data-snap", "left");
  menu = await backgroundMenu(page);
  await menu.getByRole("menuitem", { name: "Arrange windows" }).click();
  await expect(library).not.toHaveAttribute("data-snap");
  const theme = await page.locator("html").getAttribute("data-theme");
  menu = await backgroundMenu(page);
  await menu.getByRole("menuitem", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    theme === "light" ? "dark" : "light",
  );
  menu = await backgroundMenu(page);
  await menu.getByRole("menuitem", { name: "Open Notes", exact: true }).click();
  await expect(page.locator('[data-window="notes"]')).toBeVisible();
  menu = await backgroundMenu(page);
  await menu
    .getByRole("menuitem", { name: "Open Ghostty", exact: true })
    .click();
  await expect(page.locator('[data-window="ghostty"]')).toBeVisible();
});

test("icon menus open the selected app and restore its own saved position", async ({
  page,
}) => {
  const icon = page.locator('[data-desktop-icon="articles"]');
  const initial = (await icon.boundingBox())!;
  await page.mouse.move(initial.x + initial.width / 2, initial.y + 25);
  await page.mouse.down();
  await page.mouse.move(initial.x + 370, initial.y + 180, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(async () => (await icon.boundingBox())!.x)
    .toBeGreaterThan(initial.x + 200);
  await icon.click({ button: "right" });
  const menu = page.locator(menuSelector);
  await expect(menu).toHaveAttribute("aria-label", "Articles actions");
  await menu
    .getByRole("menuitem", { name: "Reset icon position", exact: true })
    .click();
  await expect
    .poll(async () => (await icon.boundingBox())!.x)
    .toBeCloseTo(initial.x, 0);
  await expect
    .poll(async () => (await icon.boundingBox())!.y)
    .toBeCloseTo(initial.y, 0);
  await page.reload();
  await expect
    .poll(async () => (await icon.boundingBox())!.x)
    .toBeCloseTo(initial.x, 0);
  await icon.click({ button: "right" });
  await menu
    .getByRole("menuitem", { name: "Open Articles", exact: true })
    .click();
  await expect(page.locator(librarySelector)).toBeVisible();
  await expect(page.locator("[data-folder-title]")).toHaveText("Articles");
});

test("window titlebar menu activates the pane and uses its existing controls", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const win = page.locator(librarySelector);
  const title = win.locator("[data-drag-handle]");
  await title.click({ button: "right", position: { x: 150, y: 20 } });
  const menu = page.locator(menuSelector);
  await expect(menu).toHaveAttribute("aria-label", "Library window actions");
  await menu.getByRole("menuitem", { name: "Maximize", exact: true }).click();
  await expect(win).toHaveClass(/is-maximized/);
  await title.click({ button: "right", position: { x: 150, y: 20 } });
  await menu.getByRole("menuitem", { name: "Restore", exact: true }).click();
  await expect(win).not.toHaveClass(/is-maximized/);
  await title.click({ button: "right", position: { x: 150, y: 20 } });
  await menu.getByRole("menuitem", { name: "Minimize", exact: true }).click();
  await expect(win).toBeHidden();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await win.focus();
  await page.keyboard.press("Shift+F10");
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: "Close", exact: true }).click();
  await expect(win).toBeHidden();
});

test("keyboard menus navigate, restore focus, and dismiss without trapping Tab", async ({
  page,
}) => {
  const icon = page.locator('[data-desktop-icon="projects"]');
  await icon.focus();
  await page.keyboard.press("Shift+F10");
  const menu = page.locator(menuSelector);
  const first = menu.getByRole("menuitem", {
    name: "Open Projects",
    exact: true,
  });
  const last = menu.getByRole("menuitem", {
    name: "Reset icon position",
    exact: true,
  });
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(last).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(first).toBeFocused();
  await page.keyboard.press("End");
  await expect(last).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(icon).toBeFocused();
  await page.keyboard.press("ContextMenu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(menu).toBeHidden();
  await expect(page.locator('[data-desktop-icon="lab"]')).toBeFocused();
  await backgroundMenu(page);
  await page.mouse.click(800, 700);
  await expect(menu).toBeHidden();
  await backgroundMenu(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(menu).toBeHidden();
  await backgroundMenu(page);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(menu).toBeHidden();
  await backgroundMenu(page);
  await page.keyboard.press("Control+k");
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("searchbox", { name: "Search desktop files" }),
  ).toBeFocused();
  await backgroundMenu(page);
  await page.keyboard.press("Control+Escape");
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("searchbox", { name: "Search applications and files" }),
  ).toBeFocused();
});

test("titlebar keyboard menus preserve their invoker and pass through window shortcuts", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const win = page.locator(librarySelector);
  const minimize = win.locator('[data-window-action="minimize"]');
  const maximize = win.locator('[data-window-action="maximize"]');
  const menu = page.locator(menuSelector);
  await minimize.focus();
  await page.keyboard.press("Shift+F10");
  await expect(menu).toHaveAttribute("aria-label", "Library window actions");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(minimize).toBeFocused();

  await page.keyboard.press("ContextMenu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(menu).toBeHidden();
  await expect(maximize).toBeFocused();

  await page.keyboard.press("Shift+F10");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Control+Alt+ArrowUp");
  await expect(menu).toBeHidden();
  await expect(win).toHaveClass(/is-maximized/);
  await expect(maximize).toBeFocused();

  await page.keyboard.press("ContextMenu");
  await expect(
    menu.getByRole("menuitem", { name: "Restore", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Control+Alt+ArrowDown");
  await expect(menu).toBeHidden();
  await expect(win).not.toHaveClass(/is-maximized/);
  await expect(maximize).toBeFocused();
});

test("app content, editable fields, links, selections and the panel keep native menus", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const selectors = [
    "[data-desktop-search]",
    "[data-desktop-file]",
    ".library-content",
    "[data-show-library]",
  ];
  for (const selector of selectors) {
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((element) =>
          element.dispatchEvent(
            new MouseEvent("contextmenu", {
              bubbles: true,
              cancelable: true,
              clientX: 300,
              clientY: 300,
            }),
          ),
        ),
    ).toBe(true);
    await expect(page.locator(menuSelector)).toBeHidden();
  }
  await page.locator('[data-window-action="close"]').first().click();
  const icon = page.locator('[data-desktop-icon="articles"]');
  expect(
    await icon.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      window.getSelection()?.addRange(range);
      return element.dispatchEvent(
        new MouseEvent("contextmenu", { bubbles: true, cancelable: true }),
      );
    }),
  ).toBe(true);
  await expect(page.locator(menuSelector)).toBeHidden();
});

test("menus remain inside short and mobile viewports and accessible in both themes", async ({
  page,
}) => {
  const menu = page.locator(menuSelector);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 320 },
    { width: 220, height: 320 },
  ]) {
    await page.setViewportSize(viewport);
    const workspace = (await page.locator("[data-workspace]").boundingBox())!;
    await page.mouse.click(
      workspace.x + workspace.width - 2,
      workspace.y + workspace.height - 2,
      { button: "right" },
    );
    await expect(menu).toBeVisible();
    const rect = (await menu.boundingBox())!;
    expect(rect.x).toBeGreaterThanOrEqual(7);
    expect(rect.y).toBeGreaterThanOrEqual(7);
    expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width - 7);
    expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height - 7);
    for (const theme of ["dark", "light"]) {
      await page.evaluate(
        (value) => (document.documentElement.dataset.theme = value),
        theme,
      );
      const audit = await new AxeBuilder({ page })
        .include(menuSelector)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(audit.violations).toEqual([]);
    }
    await page.keyboard.press("End");
    await expect(
      menu.getByRole("menuitem", { name: "Toggle color theme" }),
    ).toBeInViewport();
    await page.keyboard.press("Escape");
  }
});
