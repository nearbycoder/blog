import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);
const card = (page: Page, id: string) =>
  page.locator(`[data-overview-window="${id}"]`);
const switcher = (page: Page) =>
  page.getByRole("dialog", { name: "Switch windows", exact: true });

async function launch(page: Page, id: string) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(win(page, id)).toBeVisible();
}

async function overview(page: Page) {
  await launch(page, "windows");
  await expect(
    win(page, "windows").locator(".window-overview-app"),
  ).toBeVisible();
}

test("overview manages real windows, remembers pins, and reopens a closed app", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await overview(page);
  const calculator = card(page, "calculator");
  await expect(calculator).toContainText("Calculator");
  await calculator
    .getByRole("button", { name: "Keep above", exact: true })
    .click();
  await expect(
    calculator.getByRole("button", { name: "Keep above", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(win(page, "calculator")).toHaveAttribute("data-pinned", "true");
  const layout = calculator.getByRole("combobox", {
    name: "Calculator window layout",
  });
  await layout.focus();
  await layout.selectOption("bottom-right");
  await expect(win(page, "calculator")).toHaveAttribute(
    "data-snap",
    "bottom-right",
  );
  await expect(layout).toBeFocused();
  await page.evaluate(() =>
    document.dispatchEvent(new CustomEvent("desktop-windows-changed")),
  );
  await expect(layout).toBeFocused();
  await calculator
    .getByRole("button", { name: "Minimize", exact: true })
    .click();
  await expect(win(page, "calculator")).toBeHidden();
  await expect(
    calculator.getByRole("button", { name: "Minimize", exact: true }),
  ).toBeDisabled();
  await calculator.getByRole("button", { name: "Show", exact: true }).click();
  await expect(win(page, "calculator")).toBeVisible();
  await overview(page);
  await calculator.getByRole("button", { name: "Close", exact: true }).click();
  await expect(win(page, "calculator")).toHaveCount(0);
  await expect(calculator).toHaveCount(0);
  const reopen = win(page, "windows").getByRole("button", {
    name: "Reopen last closed",
    exact: true,
  });
  await expect(reopen).toBeFocused();
  await reopen.click();
  await expect(win(page, "calculator")).toBeVisible();
  await expect(win(page, "calculator")).toHaveAttribute("data-pinned", "true");
});

test("MRU switcher restores editor focus, navigates by keyboard, and brings back minimized windows", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await launch(page, "notes");
  const firstNote = win(page, "notes").getByRole("button", {
    name: "Create your first note",
    exact: true,
  });
  await firstNote.click();
  const editor = win(page, "notes").getByRole("textbox", {
    name: "Note text",
    exact: true,
  });
  await editor.fill("Keep this draft while switching.");
  await launch(page, "calculator");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await editor.focus();
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(switcher(page)).toHaveCount(0);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue("Keep this draft while switching.");
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  await page.keyboard.press("Home");
  await expect(
    switcher(page).locator('[data-switch-window="notes"]'),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(win(page, "calculator")).toHaveClass(/is-active/);
  await win(page, "calculator")
    .getByRole("button", { name: "Minimize Calculator", exact: true })
    .click();
  await expect(win(page, "calculator")).toBeHidden();
  await page.keyboard.press("Control+Shift+Space");
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toContainText("Minimized");
  await page.keyboard.press("Enter");
  await expect(win(page, "calculator")).toBeVisible();
  await expect(win(page, "calculator")).toHaveClass(/is-active/);
});

test("Minimize others preserves open apps and the overview has a visible switcher", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await launch(page, "stopwatch");
  await overview(page);
  await win(page, "windows")
    .getByRole("button", { name: "Switch windows", exact: true })
    .click();
  await expect(switcher(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    win(page, "windows").getByRole("button", {
      name: "Switch windows",
      exact: true,
    }),
  ).toBeFocused();
  await card(page, "calculator")
    .getByRole("button", { name: "Minimize others", exact: true })
    .click();
  await expect(win(page, "calculator")).toBeVisible();
  await expect(win(page, "stopwatch")).toBeHidden();
  await expect(win(page, "stopwatch")).toHaveCount(1);
  await expect(win(page, "windows")).toBeHidden();
  await overview(page);
  await expect(card(page, "stopwatch")).toContainText("Minimized");
});

test("small screens use one active window, disable snapping, and expose an accessible switcher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await overview(page);
  await expect(card(page, "calculator").getByRole("combobox")).toBeDisabled();
  const size = await win(page, "windows")
    .locator(".window-overview-app")
    .evaluate((el) => ({ width: el.clientWidth, content: el.scrollWidth }));
  expect(size.content).toBeLessThanOrEqual(size.width + 1);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-window="windows"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await win(page, "windows")
    .getByRole("button", { name: "Switch windows", exact: true })
    .click();
  await expect(switcher(page)).toBeVisible();
  expect(
    await switcher(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .include(".desktop-window-switcher")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await switcher(page).locator('[data-switch-window="calculator"]').click();
  await expect(win(page, "calculator")).toHaveClass(/is-active/);
  await expect(win(page, "windows")).not.toHaveClass(/is-active/);
  expect(errors).toEqual([]);
});

test("keep-above survives reload while management and launcher controls remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await launch(page, "notes");
  await overview(page);
  await card(page, "calculator")
    .getByRole("button", { name: "Keep above", exact: true })
    .click();
  await card(page, "notes")
    .getByRole("button", { name: "Show", exact: true })
    .click();
  const z = async (id: string) =>
    win(page, id).evaluate((el) => Number(getComputedStyle(el).zIndex));
  expect(await z("calculator")).toBeGreaterThan(await z("notes"));
  await overview(page);
  expect(await z("windows")).toBeGreaterThan(await z("calculator"));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("desktop-workspace:v1") ?? "{}")
            .windows?.length,
      ),
    )
    .toBe(3);
  await page.reload();
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
  await expect(win(page, "calculator")).toHaveAttribute("data-pinned", "true");
  await overview(page);
  const pin = card(page, "calculator").getByRole("button", {
    name: "Keep above",
    exact: true,
  });
  await expect(pin).toHaveAttribute("aria-pressed", "true");
  await pin.click();
  await card(page, "notes")
    .getByRole("button", { name: "Show", exact: true })
    .click();
  expect(await z("notes")).toBeGreaterThan(await z("calculator"));
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("desktop-window-pins:v1")!).keys,
    ),
  ).toEqual([]);
});

test("windows on other desktops are labeled correctly and Minimize others acts on the chosen desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await launch(page, "notes");
  await launch(page, "workspaces");
  const spaces = win(page, "workspaces");
  await spaces.getByLabel("New desktop name").fill("Reading");
  await spaces
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await spaces
    .getByRole("button", { name: "Switch to Reading", exact: true })
    .click();
  await launch(page, "stopwatch");
  await overview(page);
  await expect(card(page, "calculator")).toContainText("On another desktop");
  await expect(card(page, "calculator")).not.toContainText("Minimized");
  await page.keyboard.press("Control+Shift+Space");
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toContainText("On another desktop");
  await switcher(page).locator('[data-switch-window="calculator"]').click();
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(win(page, "calculator")).toHaveClass(/is-active/);
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Reading");
  await overview(page);
  await card(page, "calculator")
    .getByRole("button", { name: "Minimize others", exact: true })
    .click();
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(win(page, "calculator")).toBeVisible();
  await expect(win(page, "notes")).toBeHidden();
  await expect(win(page, "notes")).not.toHaveAttribute(
    "data-space-hidden",
    "true",
  );
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Reading");
  await expect(win(page, "stopwatch")).toBeVisible();
});

test("switcher stays keyboard usable when a window closes and does not duplicate on repeated shortcuts", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await launch(page, "calculator");
  await launch(page, "notes");
  await page.keyboard.press("Control+Shift+Space");
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toBeFocused();
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toHaveCount(1);
  await expect(
    switcher(page).locator('[data-switch-window="notes"]'),
  ).toBeFocused();
  // A window may close through a host action while the modal is open.
  await win(page, "notes")
    .locator('[data-window-action="close"]')
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(
    switcher(page).locator('[data-switch-window="notes"]'),
  ).toHaveCount(0);
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toBeFocused();
  await win(page, "calculator")
    .locator('[data-window-action="close"]')
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(
    switcher(page).getByText("No open windows. Open an app from the launcher."),
  ).toBeVisible();
  await expect(
    switcher(page).getByRole("button", { name: "Close window switcher" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(switcher(page)).toHaveCount(0);
  await launch(page, "calculator");
  await page.keyboard.press("Control+Shift+Space");
  await expect(
    switcher(page).locator('[data-switch-window="calculator"]'),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(switcher(page)).toHaveCount(0);
  await expect(win(page, "calculator")).toBeFocused();
});
