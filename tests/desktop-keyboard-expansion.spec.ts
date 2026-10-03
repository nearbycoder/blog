import { expect, test, type Page } from "@playwright/test";

const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);
const switcher = (page: Page) =>
  page.getByRole("dialog", { name: "Switch windows", exact: true });
const commands = (page: Page) =>
  page.getByRole("dialog", { name: "Desktop commands", exact: true });

async function launch(page: Page, id: string) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(win(page, id).locator(".utility-loading")).toHaveCount(0);
  return win(page, id);
}
async function prepare(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
}

test("MRU modal isolates commands, launcher, layouts and desktops while retaining cycling", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "desktop-spaces:v1",
      JSON.stringify({
        version: 1,
        active: "desk-1",
        spaces: [
          { id: "desk-1", name: "Desk 1" },
          { id: "desk-2", name: "Reading" },
        ],
        assignments: {},
      }),
    ),
  );
  await prepare(page);
  await launch(page, "calculator");
  await launch(page, "notes");
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  const original = await page
    .locator(".desktop-window.is-active")
    .getAttribute("data-window");
  await page.keyboard.press("Control+k");
  await expect(commands(page)).toBeHidden();
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(win(page, original!)).not.toHaveAttribute("data-snap");
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await page.keyboard.press("Control+Shift+Space");
  await expect(
    switcher(page).locator('[data-switch-window="notes"]'),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Shift+Space");
  await page.keyboard.press("Control+Escape");
  await expect(page.locator("#desktop-launcher")).toBeHidden();
  await expect(commands(page)).toBeHidden();
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await expect(commands(page)).toBeVisible();
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Escape");
  await expect(commands(page)).toBeHidden();
  await expect(page.locator("#desktop-launcher")).toBeVisible();
});

test("composing and held shortcut events cannot switch or dismiss MRU selection", async ({
  page,
}) => {
  await prepare(page);
  await launch(page, "calculator");
  await launch(page, "notes");
  await page.locator("[data-desktop]").dispatchEvent("keydown", {
    key: " ",
    code: "Space",
    ctrlKey: true,
    shiftKey: true,
    isComposing: true,
  });
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Shift+Space");
  const selected = switcher(page).locator('[data-switch-window="calculator"]');
  await expect(selected).toBeFocused();
  await selected.dispatchEvent("keydown", {
    key: "ArrowDown",
    isComposing: true,
  });
  await expect(selected).toBeFocused();
  await selected.dispatchEvent("keydown", { key: "Escape", keyCode: 229 });
  await expect(switcher(page)).toBeVisible();
  await selected.dispatchEvent("keydown", {
    key: " ",
    code: "Space",
    ctrlKey: true,
    shiftKey: true,
    repeat: true,
  });
  await expect(selected).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(switcher(page)).toHaveCount(0);
});

test("Escape cancels a pending lazy switcher request without a late modal", async ({
  page,
}) => {
  let release!: () => void;
  let requested!: () => void;
  const started = new Promise<void>((resolve) => (requested = resolve));
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route(
    /\/desktop-windows(?:\.[\w-]+\.js|\.ts)(?:\?|$)/,
    async (route) => {
      requested();
      await gate;
      await route.continue();
    },
  );
  await prepare(page);
  await launch(page, "calculator");
  await page.keyboard.press("Control+Shift+Space");
  await started;
  await page.keyboard.press("Escape");
  release();
  await expect(
    page.locator('style[data-desktop-app-style="windows"]'),
  ).toHaveCount(1);
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: true }),
    ),
  );
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/");
  await page.goBack();
  await expect(switcher(page)).toHaveCount(0);
});

test("Ghostty receives new desktop key combinations and still offers Command K", async ({
  page,
}) => {
  const inputs: string[] = [];
  await page.addInitScript(() =>
    localStorage.setItem(
      "desktop-spaces:v1",
      JSON.stringify({
        version: 1,
        active: "desk-1",
        spaces: [
          { id: "desk-1", name: "Desk 1" },
          { id: "desk-2", name: "Shell" },
        ],
        assignments: {},
      }),
    ),
  );
  await page.routeWebSocket("ws://127.0.0.1:9876/terminal", (socket) => {
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "auth")
        socket.send(
          JSON.stringify({ type: "ready", title: "Keyboard review" }),
        );
      else if (message.type === "input") inputs.push(message.data);
    });
  });
  await prepare(page);
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await page
    .getByLabel("Terminal service URL")
    .fill("ws://127.0.0.1:9876/terminal");
  await page
    .getByLabel("Access token", { exact: true })
    .fill("keyboard-regression-test-token-12345");
  await page
    .getByRole("form", { name: "Connect a terminal" })
    .getByRole("button", { name: "Connect", exact: true })
    .click();
  await expect(
    win(page, "ghostty").getByText("Connected", { exact: true }),
  ).toBeVisible();
  const surface = page.locator(".ghostty-surface textarea");
  await surface.press("Control+Shift+Space");
  await expect.poll(() => inputs.join("")).toContain("\x00");
  await expect(switcher(page)).toHaveCount(0);
  await surface.press("Control+Alt+PageDown");
  await expect(surface).toBeFocused();
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await surface.press("Control+k");
  await expect.poll(() => inputs.join("")).toContain("\x0b");
  await surface.press("Meta+k");
  await expect(commands(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(surface).toBeFocused();
});

test("reader focus is restored and reader-native dialogs keep their own keyboard", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("nearbycoder:shortcuts:v1", "true"),
  );
  await prepare(page);
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-folder="pages"]').click();
  await page.locator('[data-desktop-file][href="/articles"]').click();
  const frame = page.frameLocator("[data-desktop-reader]");
  const searchButton = frame.locator(".article-card").first();
  await searchButton.focus();
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(searchButton).toBeFocused();
  await page.keyboard.press("?");
  const search = frame.getByRole("dialog", {
    name: "Keyboard shortcuts",
    exact: true,
  });
  await expect(search).toBeVisible();
  await page.keyboard.press("Control+Shift+Space");
  await expect(switcher(page)).toHaveCount(0);
  await page.keyboard.press("Control+Alt+ArrowRight");
  await expect(page.locator('[data-window^="reader-"]')).not.toHaveAttribute(
    "data-snap",
  );
  await page.keyboard.press("Escape");
  await expect(search).toBeHidden();
  await expect(searchButton).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(commands(page)).toBeVisible();
});

test("desktop shortcuts stop hidden audio and preserve settings without automatic restart", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const metrics = { opened: 0, closed: 0 };
    Object.assign(window, { desktopAudioMetrics: metrics });
    const NativeAudioContext = window.AudioContext;
    window.AudioContext = class extends NativeAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        metrics.opened++;
      }
      close() {
        metrics.closed++;
        return super.close();
      }
    };
  });
  await prepare(page);
  await launch(page, "workspaces");
  await win(page, "workspaces").getByLabel("New desktop name").fill("Quiet");
  await win(page, "workspaces")
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await launch(page, "soundscape");
  const app = win(page, "soundscape");
  await app
    .getByRole("button", { name: "Bright and even", exact: true })
    .click();
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "playing",
  );
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Quiet");
  await expect(app).toBeHidden();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { desktopAudioMetrics: { closed: number } })
            .desktopAudioMetrics.closed,
      ),
    )
    .toBe(1);
  await page.keyboard.press("Control+Alt+PageUp");
  await expect(app).toBeVisible();
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "stopped",
  );
  await expect(
    app.getByLabel("White noise volume", { exact: true }),
  ).toHaveValue("60");
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as {
            desktopAudioMetrics: { opened: number; closed: number };
          }
        ).desktopAudioMetrics,
    ),
  ).toEqual({ opened: 1, closed: 1 });
  await page
    .getByRole("button", { name: "Show Soundscapes", exact: true })
    .click();
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await page.keyboard.press("Control+Alt+Shift+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Quiet");
  await expect(app).toBeVisible();
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "playing",
  );
  await app
    .getByRole("button", { name: "Close Soundscapes", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { desktopAudioMetrics: { closed: number } })
            .desktopAudioMetrics.closed,
      ),
    )
    .toBe(2);
});

for (const modifier of ["Control", "Meta"]) {
  test(`${modifier} K inserts Markdown links in the editor and opens Commands outside it`, async ({
    page,
  }) => {
    await prepare(page);
    await launch(page, "markdown");
    const editor = win(page, "markdown").getByRole("textbox", {
      name: "Markdown source",
      exact: true,
    });
    await editor.fill("link me");
    await editor.evaluate((el: HTMLTextAreaElement) => el.select());
    await editor.press(`${modifier}+k`);
    await expect(editor).toHaveValue("[link me](https://example.com)");
    await expect(commands(page)).toBeHidden();
    await expect(editor).toBeFocused();
    await page.locator("[data-launcher-toggle]").focus();
    await expect(page.locator("[data-launcher-toggle]")).toBeFocused();
    await page.keyboard.press(`${modifier}+k`);
    await expect(commands(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-launcher-toggle]")).toBeFocused();
  });
}
