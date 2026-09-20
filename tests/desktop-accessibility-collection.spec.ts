import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { desktopApps } from "../src/lib/desktop-apps";

type DesktopApp = (typeof desktopApps)[number];
type Theme = "light" | "dark";

// One app from each category exercises the compact layout without repeating
// the collection's separate phone sizing, text size, and overflow coverage.
const compactAppIds = new Set([
  "tasks",
  "colors",
  "converter",
  "sudoku",
  "soundscape",
]);

async function openDesktop(page: Page, theme: Theme, compact: boolean) {
  await page.setViewportSize(
    compact ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
  );
  await page.goto("/desktop/");
  if ((await page.locator("html").getAttribute("data-theme")) !== theme) {
    await page
      .getByRole("button", { name: "Toggle color theme", exact: true })
      .click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

async function checkWindowControls(
  page: Page,
  win: Locator,
  app: DesktopApp,
  compact: boolean,
) {
  await expect(win).toHaveRole("region");
  await expect(win).toHaveAccessibleName(`${app.title} window`);

  const maximize = win.locator('[data-window-action="maximize"]');
  await expect(maximize).toHaveAttribute("aria-pressed", "false");
  if (compact) {
    await expect(maximize).toBeHidden();
    await expect(maximize).toHaveAttribute(
      "aria-label",
      `Maximize ${app.title}`,
    );
  } else await expect(maximize).toHaveAccessibleName(`Maximize ${app.title}`);

  // Start at the named window and use real Tab presses so a styled but
  // keyboard-unreachable control cannot satisfy the focus assertions.
  await win.focus();
  for (const action of compact
    ? ["Minimize", "Close"]
    : ["Minimize", "Maximize", "Close"]) {
    const control = win.getByRole("button", {
      name: `${action} ${app.title}`,
      exact: true,
    });
    await expect(control).toBeVisible();
    await expect(control).toBeEnabled();
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    const focusStyle = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        visible: element.matches(":focus-visible"),
        style: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
        color: style.outlineColor,
      };
    });
    expect(focusStyle.visible).toBe(true);
    expect(focusStyle.style).not.toBe("none");
    expect(focusStyle.width).toBeGreaterThanOrEqual(2);
    expect(focusStyle.color).not.toMatch(/^(transparent|rgba\(.*?, 0\))$/);
  }
}

async function auditApp(
  page: Page,
  app: DesktopApp,
  theme: Theme,
  compact: boolean,
) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${app.id}"]`).click();
  const selector = `[data-window="${app.id}"]`;
  const win = page.locator(selector);
  await expect(win).toBeVisible();
  await expect(win.locator(".utility-loading")).toHaveCount(0);
  await expect(win.locator(".desktop-app-content")).not.toBeEmpty();
  await checkWindowControls(page, win, app, compact);

  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  // Keep auditing the remaining apps after an axe failure so the collection
  // report identifies every affected app in both themes in one run.
  expect
    .soft(
      results.violations,
      `${app.title}: ${theme} theme, ${compact ? "compact" : "desktop"} layout`,
    )
    .toEqual([]);

  await win
    .getByRole("button", { name: `Close ${app.title}`, exact: true })
    .press("Enter");
  await expect(win).toHaveCount(0);
}

for (const theme of ["light", "dark"] as const) {
  test(`every desktop app has accessible content and keyboard window controls in the ${theme} theme`, async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await openDesktop(page, theme, false);
    for (const app of desktopApps) {
      await test.step(app.title, () => auditApp(page, app, theme, false));
    }
  });

  test(`representative compact apps remain accessible in the ${theme} theme`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openDesktop(page, theme, true);
    for (const app of desktopApps.filter((app) => compactAppIds.has(app.id))) {
      await test.step(app.title, () => auditApp(page, app, theme, true));
    }
  });
}
