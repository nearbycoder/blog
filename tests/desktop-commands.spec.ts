import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { desktopApps } from "../src/lib/desktop-apps";

const palette = (page: Page) =>
  page.getByRole("dialog", { name: "Desktop commands", exact: true });
const search = (page: Page) =>
  palette(page).getByRole("combobox", {
    name: "Search desktop commands",
    exact: true,
  });
const command = (page: Page, title: string) =>
  palette(page).getByRole("option", { name: title, exact: true });
const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);

async function open(page: Page, shortcut = "Control+k") {
  await page.keyboard.press(shortcut);
  await expect(palette(page)).toBeVisible();
  await expect(search(page)).toBeFocused();
}

async function run(page: Page, title: string) {
  await open(page);
  await search(page).fill(title);
  await command(page, title).click();
  await expect(palette(page)).toBeHidden();
}

test("desktop commands load on demand and searching every app downloads no app implementations", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  const appCode = new RegExp(
    `desktop-(?:${desktopApps.map((app) => app.id).join("|")})\\.[\\w-]+\\.js`,
  );
  for (const path of [
    "/",
    "/articles/gettting-started-with-react-and-vitejs/",
    "/desktop/",
  ]) {
    await page.goto(path);
    expect(
      requests.filter((url) =>
        /desktop-commands\.[\w-]+\.(?:js|css)/.test(url),
      ),
    ).toEqual([]);
    expect(requests.filter((url) => appCode.test(url))).toEqual([]);
  }
  await expect(
    page.locator('style[data-desktop-app-style="commands"]'),
  ).toHaveCount(0);
  await open(page);
  await expect(
    page.locator('style[data-desktop-app-style="commands"]'),
  ).toHaveCount(1);
  expect(requests.some((url) => /desktop-commands\.[\w-]+\.js/.test(url))).toBe(
    true,
  );
  for (const app of desktopApps) {
    await search(page).fill(app.title);
    await expect(command(page, app.title)).toBeVisible();
  }
  expect(requests.filter((url) => appCode.test(url))).toEqual([]);
  await expect(page.locator(".utility-window")).toHaveCount(0);
  await search(page).fill("JSON Desk");
  await search(page).press("Enter");
  await expect(palette(page)).toBeHidden();
  await expect(win(page, "json").locator(".json-app")).toBeVisible();
  expect(requests.filter((url) => appCode.test(url))).toHaveLength(1);
  expect(requests.filter((url) => appCode.test(url))[0]).toMatch(
    /desktop-json\./,
  );
  expect(errors).toEqual([]);
});

test("keyboard selection, composition, empty search, and dismissal preserve editor focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await run(page, "Notes");
  const editor = win(page, "notes").locator("textarea");
  await win(page, "notes")
    .getByRole("button", { name: "Create your first note", exact: true })
    .click();
  await editor.fill("Keep this draft while using desktop commands.");
  await editor.focus();
  await open(page, "Meta+k");
  await search(page).fill("studio");
  const selected = palette(page).locator(
    '[role="option"][aria-selected="true"]',
  );
  await expect(selected).toHaveCount(1);
  const firstId = await selected.getAttribute("id");
  await search(page).press("ArrowDown");
  await expect(selected).not.toHaveAttribute("id", firstId!);
  await expect(search(page)).toHaveAttribute(
    "aria-activedescendant",
    (await selected.getAttribute("id"))!,
  );
  await search(page).press("ArrowUp");
  await expect(selected).toHaveAttribute("id", firstId!);
  await expect(search(page)).toBeFocused();

  await search(page).fill("JSON Desk");
  await search(page).dispatchEvent("keydown", {
    key: "Enter",
    isComposing: true,
  });
  await expect(palette(page)).toBeVisible();
  await expect(win(page, "json")).toHaveCount(0);
  await search(page).fill("no-command-matches-847289");
  await expect(palette(page).getByRole("option")).toHaveCount(0);
  await search(page).press("Enter");
  await expect(palette(page)).toBeVisible();
  await search(page).press("Escape");
  await expect(palette(page)).toBeHidden();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue(
    "Keep this draft while using desktop commands.",
  );

  await open(page);
  await page.keyboard.press("Control+k");
  await expect(palette(page)).toBeHidden();
  await expect(editor).toBeFocused();
  await open(page);
  const dialogBounds = (await palette(page).boundingBox())!;
  await page.mouse.click(
    dialogBounds.x / 2,
    dialogBounds.y + dialogBounds.height / 2,
  );
  await expect(palette(page)).toBeHidden();
  await expect(editor).toBeFocused();
});

test("window commands reflect the active app and switch, snap, restore, minimize, and close it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await run(page, "Notes");
  const notes = win(page, "notes");
  await expect(notes.locator(".notes-app")).toBeVisible();
  const floating = await notes.boundingBox();
  for (const [title, layout] of [
    ["Snap left", "left"],
    ["Snap right", "right"],
    ["Snap top left", "top-left"],
    ["Snap top right", "top-right"],
    ["Snap bottom left", "bottom-left"],
    ["Snap bottom right", "bottom-right"],
  ]) {
    await run(page, title);
    await expect(notes).toHaveAttribute("data-snap", layout);
  }
  await run(page, "Maximize window");
  await expect(notes).toHaveClass(/is-maximized/);
  await run(page, "Restore window");
  await expect(notes).not.toHaveAttribute("data-snap");
  expect(await notes.boundingBox()).toEqual(floating);
  await run(page, "Minimize window");
  await expect(notes).toBeHidden();
  await open(page);
  await search(page).fill("Close window");
  await expect(command(page, "Close window")).toHaveCount(0);
  await search(page).fill("Switch to Notes");
  await command(page, "Switch to Notes").click();
  await expect(palette(page)).toBeHidden();
  await expect(notes).toBeVisible();
  await expect(notes).toHaveClass(/is-active/);
  await run(page, "Close window");
  await expect(notes).toHaveCount(0);
  await open(page);
  await search(page).fill("Switch to Notes");
  await expect(command(page, "Switch to Notes")).toHaveCount(0);
});

test("desktop actions open Library, toggle the theme, arrange windows, and show the desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  const initialTheme = await page.locator("html").getAttribute("data-theme");
  const launcher = page.getByRole("button", {
    name: "Open application launcher",
    exact: true,
  });
  await launcher.click();
  await page
    .getByRole("button", { name: "Open desktop commands", exact: true })
    .click();
  await search(page).fill("Toggle color theme");
  await command(page, "Toggle color theme").click();
  await expect(launcher).toBeFocused();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-theme",
    initialTheme!,
  );
  await run(page, "Open Library");
  await expect(win(page, "library")).toBeVisible();
  await run(page, "Notes");
  const notes = win(page, "notes");
  await run(page, "Snap right");
  await expect(notes).toHaveAttribute("data-snap", "right");
  await run(page, "Arrange windows");
  await expect(notes).not.toHaveAttribute("data-snap");
  await expect(win(page, "library")).toBeVisible();
  await run(page, "Show desktop");
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await run(page, "Switch to Notes");
  await expect(notes).toBeVisible();
});

test("file results open real content and Ctrl K inside a reader opens desktop commands", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await run(page, "Cast a local vote");
  const reader = page.locator(".reader-window");
  await expect(reader).toBeVisible();
  const content = page.frameLocator("[data-desktop-reader]");
  await expect(content.locator("h1")).toHaveText("Cast a local vote");
  await content
    .getByRole("radio", { name: "It solves my own problem" })
    .focus();
  await open(page);
  await search(page).fill("Calculator");
  await search(page).press("Enter");
  await expect(win(page, "calculator")).toBeVisible();
  await expect(reader).toHaveCount(1);
});

test("Ctrl K remains terminal input while Cmd K opens desktop commands from Ghostty", async ({
  page,
}) => {
  const inputs: string[] = [];
  await page.routeWebSocket("ws://127.0.0.1:9876/terminal", (socket) => {
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "auth")
        socket.send(
          JSON.stringify({ type: "ready", title: "Command palette test" }),
        );
      else if (message.type === "input") inputs.push(message.data);
    });
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await page
    .getByLabel("Terminal service URL")
    .fill("ws://127.0.0.1:9876/terminal");
  await page
    .getByLabel("Access token", { exact: true })
    .fill("command-palette-test-token-0123456789");
  await page
    .getByRole("form", { name: "Connect a terminal" })
    .getByRole("button", { name: "Connect", exact: true })
    .click();
  const surface = page.locator(".ghostty-surface textarea");
  await expect(
    win(page, "ghostty").getByText("Connected", { exact: true }),
  ).toBeVisible();
  await surface.press("Control+k");
  await expect.poll(() => inputs.join("")).toContain("\x0b");
  await expect(palette(page)).toBeHidden();
  await expect(surface).toBeFocused();
  await open(page, "Meta+k");
  await search(page).press("Escape");
  await expect(surface).toBeFocused();
});

for (const theme of ["light", "dark"]) {
  test(`${theme} commands are accessible and usable at 320px without input zoom`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/desktop/");
    if ((await page.locator("html").getAttribute("data-theme")) !== theme) {
      await page
        .getByRole("button", { name: "Toggle color theme", exact: true })
        .click();
    }
    // The visible control keeps the palette available without a hardware keyboard.
    await page
      .getByRole("button", { name: "Open application launcher", exact: true })
      .click();
    const toggle = page
      .locator("[data-command-palette-toggle]:visible")
      .first();
    await expect(toggle).toHaveAccessibleName("Open desktop commands");
    await toggle.click();
    await expect(palette(page)).toBeVisible();
    await expect(search(page)).toBeFocused();
    expect(
      await search(page).evaluate((element) =>
        parseFloat(getComputedStyle(element).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);
    const bounds = (await palette(page).boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    const result = await new AxeBuilder({ page })
      .include("dialog[open]")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await search(page).fill("Notes");
    await command(page, "Notes").click();
    await expect(win(page, "notes")).toBeVisible();
    await page
      .getByRole("button", { name: "Open application launcher", exact: true })
      .click();
    await page.locator("[data-command-palette-toggle]:visible").first().click();
    await search(page).fill("Snap");
    await expect(
      palette(page).getByRole("option", { name: /^Snap / }),
    ).toHaveCount(0);
    await search(page).fill("Maximize window");
    await expect(command(page, "Maximize window")).toHaveCount(0);
    await search(page).fill("Minimize window");
    await command(page, "Minimize window").click();
    await expect(win(page, "notes")).toBeHidden();
  });
}

test("a cancelled lazy command download never opens late and can be opened again", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let downloads = 0;
  await page.route("**/desktop-commands.*.js", async (route) => {
    downloads++;
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/desktop/");
    const launcher = page.getByRole("button", {
      name: "Open application launcher",
      exact: true,
    });
    await launcher.click();
    await page
      .getByRole("button", { name: "Open desktop commands", exact: true })
      .click();
    await expect.poll(() => downloads).toBe(1);
    await page.keyboard.press("Escape");
    release();
    // A loaded but cancelled palette installs its style without showing a dialog.
    await expect(
      page.locator('style[data-desktop-app-style="commands"]'),
    ).toHaveCount(1);
    await expect(palette(page)).toBeHidden();
    await expect(launcher).toBeFocused();
    await open(page);
    await search(page).fill("JSON Desk");
    await search(page).press("Enter");
    await expect(win(page, "json")).toBeVisible();
    expect(downloads).toBe(1);
  } finally {
    release();
  }
});

test("closing commands restores usable focus after launcher and reader entry points", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const launcher = page.getByRole("button", {
    name: "Open application launcher",
    exact: true,
  });
  await launcher.click();
  await page
    .getByRole("button", { name: "Open desktop commands", exact: true })
    .click();
  await expect(palette(page)).toBeVisible();
  await expect(page.locator("#desktop-launcher")).toBeHidden();
  await search(page).press("Escape");
  await expect(launcher).toBeFocused();
  await run(page, "Cast a local vote");
  const radio = page
    .frameLocator("[data-desktop-reader]")
    .getByRole("radio", { name: "It solves my own problem" });
  await radio.focus();
  await open(page);
  await search(page).press("Escape");
  await expect(radio).toBeFocused();
  await radio.press("Space");
  await expect(radio).toBeChecked();
});

test("palette keyboard input cannot snap background windows and Ctrl Escape returns to the launcher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await run(page, "Notes");
  const notes = win(page, "notes");
  await expect(notes.locator(".notes-app")).toBeVisible();
  const before = await notes.boundingBox();
  await open(page);
  await search(page).press("Control+Alt+ArrowRight");
  await expect(palette(page)).toBeVisible();
  await expect(notes).not.toHaveAttribute("data-snap");
  expect(await notes.boundingBox()).toEqual(before);
  await search(page).dispatchEvent("keydown", {
    key: "k",
    ctrlKey: true,
    repeat: true,
  });
  await expect(palette(page)).toBeVisible();
  await search(page).press("Control+Escape");
  await expect(palette(page)).toBeHidden();
  await expect(page.locator("#desktop-launcher")).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search applications and files" }),
  ).toBeFocused();
});
