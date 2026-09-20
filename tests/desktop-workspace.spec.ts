import { test, expect, type Locator, type Page } from "@playwright/test";

const storageKey = "desktop-workspace:v1";
const desktop = (page: Page) => page.locator("[data-desktop]");
const windowFor = (page: Page, id: string) =>
  page.locator(`[data-window="${id}"]`);

async function ready(page: Page) {
  await expect(desktop(page)).toHaveAttribute("data-workspace-ready", "true");
}

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await ready(page);
}

async function launch(page: Page, id: string) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  const win = windowFor(page, id);
  await expect(win).toBeVisible();
  await expect(win.locator(".utility-loading")).toHaveCount(0);
  return win;
}

async function move(page: Page, win: Locator, dx: number, dy: number) {
  const bar = (await win.locator("[data-drag-handle]").boundingBox())!;
  await page.mouse.move(bar.x + 120, bar.y + 20);
  await page.mouse.down();
  await page.mouse.move(bar.x + 120 + dx, bar.y + 20 + dy, { steps: 8 });
  await page.mouse.up();
}

async function resize(page: Page, win: Locator, dx: number, dy: number) {
  const grip = (await win.locator('[data-resize="se"]').boundingBox())!;
  const x = grip.x + grip.width / 2;
  const y = grip.y + grip.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
}

async function saved(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    storageKey,
  );
}

const placement = {
  left: "460px",
  top: "120px",
  width: "580px",
  height: "450px",
  minWidth: "",
  minHeight: "",
};

// These tests complement the pure storage validator: exercise actual windows,
// browser lifecycle events, lazy imports, and restored layout before painting.
test("open apps retain dragged and resized geometry, focus, and stacking after reload", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await move(page, notes, 155, 92);
  await resize(page, notes, -130, -110);
  const notesBox = await notes.boundingBox();
  const json = await launch(page, "json");
  await move(page, json, 280, 125);
  await resize(page, json, -100, -80);
  const jsonBox = await json.boundingBox();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active).toBe("notes");
  expect(
    (await saved(page)).windows.map((win: { id: string }) => win.id),
  ).toEqual(["json", "notes"]);

  await page.reload();
  await ready(page);
  await expect(notes).toBeVisible();
  await expect(json).toBeVisible();
  expect(await notes.boundingBox()).toEqual(notesBox);
  expect(await json.boundingBox()).toEqual(jsonBox);
  await expect(notes).toHaveClass(/is-active/);
  await expect(
    page.getByRole("button", { name: "Show Notes", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await notes.evaluate((element) =>
      Number((element as HTMLElement).style.zIndex),
    ),
  ).toBeGreaterThan(
    await json.evaluate((element) =>
      Number((element as HTMLElement).style.zIndex),
    ),
  );
  await launch(page, "notes");
  await expect(notes).toHaveCount(1);
});

test("snapped and maximized windows restore their original floating bounds after reload", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await move(page, notes, 180, 85);
  await resize(page, notes, -160, -120);
  const floating = await notes.boundingBox();
  for (const layout of ["left", "maximized"] as const) {
    await page.keyboard.press(
      layout === "left" ? "Control+Alt+ArrowLeft" : "Control+Alt+ArrowUp",
    );
    await expect(notes).toHaveAttribute("data-snap", layout);
    const snapped = await notes.boundingBox();
    await page.reload();
    await ready(page);
    await expect(notes).toHaveAttribute("data-snap", layout);
    expect(await notes.boundingBox()).toEqual(snapped);
    await notes
      .locator("[data-drag-handle]")
      .click({ position: { x: 120, y: 20 } });
    await page.keyboard.press("Control+Alt+ArrowDown");
    await expect(notes).not.toHaveAttribute("data-snap");
    expect(await notes.boundingBox()).toEqual(floating);
  }
});

test("minimized apps, Arcade, and Ghostty restore shells without downloading their implementations", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await notes.getByRole("button", { name: "Minimize Notes" }).click();
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  const arcade = windowFor(page, "arcade");
  await expect(arcade.locator(".arcade-loading")).toHaveCount(0);
  await arcade.locator('[data-arcade-select="sweep"]').click();
  await arcade.getByRole("button", { name: "Minimize Arcade" }).click();
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  const ghostty = windowFor(page, "ghostty");
  await expect(
    ghostty.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
  await ghostty.getByRole("button", { name: "Minimize Ghostty" }).click();
  await expect.poll(async () => (await saved(page))?.windows.length).toBe(3);

  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.reload();
  await ready(page);
  for (const [id, title] of [
    ["notes", "Notes"],
    ["arcade", "Arcade"],
    ["ghostty", "Ghostty"],
  ]) {
    await expect(windowFor(page, id)).toBeAttached();
    await expect(windowFor(page, id)).toBeHidden();
    await expect(
      page.getByRole("button", { name: `Show ${title}`, exact: true }),
    ).toBeVisible();
  }
  const implementation =
    /desktop-(?:apps|notes|arcade|ghostty)\.[\w-]+\.js|\.wasm(?:$|\?)/;
  expect(requests.filter((url) => implementation.test(url))).toEqual([]);
  await page.getByRole("button", { name: "Show Arcade", exact: true }).click();
  await expect(arcade.locator('[data-arcade-select="sweep"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(arcade.locator('[data-arcade-panel="sweep"]')).toBeVisible();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes.locator(".notes-app")).toBeVisible();
  await page.getByRole("button", { name: "Show Ghostty", exact: true }).click();
  await expect(
    ghostty.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
});

test("closing removes saved apps including Library while Show desktop keeps minimized apps", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "json");
  await windowFor(page, "json")
    .getByRole("button", { name: "Close JSON Desk" })
    .click();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  const library = windowFor(page, "library");
  await library.getByRole("button", { name: "Minimize Library" }).click();
  await page.reload();
  await ready(page);
  await expect(library).toBeHidden();
  await expect
    .poll(
      async () =>
        (await saved(page))?.windows.find(
          (win: { id: string }) => win.id === "library",
        )?.minimized,
    )
    .toBe(true);
  await expect(windowFor(page, "json")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await library.getByRole("button", { name: "Close Library" }).click();
  await page.getByRole("button", { name: "Show desktop", exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active).toBeNull();
  expect(
    (await saved(page)).windows.map(
      (win: { id: string; minimized: boolean }) => ({
        id: win.id,
        minimized: win.minimized,
      }),
    ),
  ).toEqual([{ id: "notes", minimized: true }]);
  await page.reload();
  await ready(page);
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(windowFor(page, "notes")).toBeVisible();
  expect(
    (await saved(page)).windows.some(
      (win: { id: string }) => win.id === "library",
    ),
  ).toBe(false);
});

test("a mobile reload keeps the desktop placement and windows stay reachable on smaller screens", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await move(page, notes, 330, 140);
  await resize(page, notes, -160, -130);
  const wide = await notes.boundingBox();
  await expect
    .poll(async () => (await saved(page))?.windows[0]?.placement.width)
    .toBe(`${wide!.width}px`);
  const desktopPlacement = (await saved(page)).windows[0].placement;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await ready(page);
  await expect(notes).toBeVisible();
  expect((await notes.boundingBox())!.width).toBe(378);
  expect((await saved(page)).windows[0].placement).toEqual(desktopPlacement);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await ready(page);
  expect(await notes.boundingBox()).toEqual(wide);
  await page.setViewportSize({ width: 900, height: 700 });
  await page.reload();
  await ready(page);
  const workspace = (await page.locator("[data-workspace]").boundingBox())!;
  const small = (await notes.boundingBox())!;
  expect(small.x).toBeGreaterThanOrEqual(workspace.x);
  expect(small.y).toBeGreaterThanOrEqual(workspace.y);
  expect(small.x + small.width).toBeLessThanOrEqual(
    workspace.x + workspace.width,
  );
  expect(small.y + small.height).toBeLessThanOrEqual(
    workspace.y + workspace.height,
  );
});

test("committed movement survives an immediate switch to mobile before the save timer runs", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await expect.poll(async () => (await saved(page))?.active).toBe("notes");
  await move(page, notes, 210, 100);
  await resize(page, notes, -110, -80);
  const bounds = await notes.boundingBox();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await ready(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await ready(page);
  expect(await notes.boundingBox()).toEqual(bounds);
});

test("oversized saved minimums stay bounded when restoring a maximized window", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, placement }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          windows: [
            {
              id: "notes",
              minimized: false,
              placement: {
                ...placement,
                left: "100000px",
                top: "100000px",
                width: "100000px",
                height: "100000px",
                minWidth: "100000px",
                minHeight: "100000px",
                layout: "maximized",
              },
            },
          ],
          active: "notes",
        }),
      );
    },
    { key: storageKey, placement },
  );
  await open(page);
  await windowFor(page, "notes")
    .getByRole("button", { name: "Restore Notes", exact: true })
    .click();
  const win = (await windowFor(page, "notes").boundingBox())!;
  const area = (await page.locator("[data-workspace]").boundingBox())!;
  expect(win.x).toBeGreaterThanOrEqual(area.x);
  expect(win.y).toBeGreaterThanOrEqual(area.y);
  expect(win.x + win.width).toBeLessThanOrEqual(area.x + area.width);
  expect(win.y + win.height).toBeLessThanOrEqual(area.y + area.height);
});

test("saved windows stay hidden while scripts load and appear directly at their saved placement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(
    ({ key, placement }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          windows: [{ id: "library", minimized: false, placement }],
          active: "library",
        }),
      );
    },
    { key: storageKey, placement },
  );
  let release!: () => void;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_astro/*.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/desktop/", { waitUntil: "commit" });
    const library = windowFor(page, "library");
    await expect(library).toBeAttached();
    await expect(desktop(page)).not.toHaveAttribute("data-workspace-ready");
    await expect(library).toHaveCSS("visibility", "hidden");
    release();
    await ready(page);
    await expect(library).toBeVisible();
    await expect(library).toHaveCSS("animation-name", "none");
    const workspace = (await page.locator("[data-workspace]").boundingBox())!;
    expect(await library.boundingBox()).toEqual({
      x: workspace.x + 460,
      y: workspace.y + 120,
      width: 580,
      height: 450,
    });
  } finally {
    release();
  }
});

test("readers restore their current indexed destination and reject stored external or nested desktop URLs", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-desktop-file][href="/start-here"]').click();
  const reader = page.locator(".reader-window");
  const frame = page.frameLocator("[data-desktop-reader]");
  const destination = frame.locator(".path-card").first();
  await expect(destination).toBeVisible();
  const target = (await destination.getAttribute("href"))!.replace(/\/$/, "");
  await destination.click();
  await expect(reader).toHaveAttribute("data-source", target);
  await expect
    .poll(
      async () =>
        (await saved(page))?.windows.find(
          (win: { source?: string }) => win.source === target,
        )?.source,
    )
    .toBe(target);
  await page.reload();
  await ready(page);
  await expect(reader).toHaveCount(1);
  await expect(reader).toHaveAttribute("data-source", target);
  await expect(frame.locator("h1")).toBeVisible();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator(`[data-desktop-file][href="${target}/"]`).click();
  await expect(reader).toHaveCount(1);

  // Seed the next document so the old page's pagehide flush cannot replace it.
  await page.addInitScript(
    ({ key, placement }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          windows: [
            {
              id: "reader-1",
              minimized: false,
              placement,
              source: "https://example.com/private",
            },
            { id: "reader-2", minimized: false, placement, source: "/desktop" },
            {
              id: "reader-3",
              minimized: false,
              placement,
              source: "/not-a-library-file",
            },
          ],
          active: "reader-1",
        }),
      );
    },
    { key: storageKey, placement },
  );
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.reload();
  await ready(page);
  await expect(reader).toHaveCount(0);
  expect(
    requests.some(
      (url) =>
        url.includes("example.com/private") ||
        url.includes("not-a-library-file"),
    ),
  ).toBe(false);
  await launch(page, "notes");
});

test("pagehide flushes the latest drag without waiting for the save debounce", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await move(page, notes, 220, 105);
  const before = await notes.boundingBox();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  const entry = (await saved(page)).windows.find(
    (win: { id: string }) => win.id === "notes",
  );
  const workspace = (await page.locator("[data-workspace]").boundingBox())!;
  expect(parseFloat(entry.placement.left)).toBe(before!.x - workspace.x);
  expect(parseFloat(entry.placement.top)).toBe(before!.y - workspace.y);
  await page.reload();
  await ready(page);
  expect(await notes.boundingBox()).toEqual(before);
});

for (const mode of ["corrupt", "blocked"] as const) {
  test(`${mode} workspace storage does not prevent opening, moving, or closing apps`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, mode }) => {
        if (mode === "corrupt") localStorage.setItem(key, "{unreadable");
        else {
          const get = Storage.prototype.getItem;
          const set = Storage.prototype.setItem;
          Storage.prototype.getItem = function (name) {
            if (name === key) throw new Error("Storage unavailable");
            return get.call(this, name);
          };
          Storage.prototype.setItem = function (name, value) {
            if (name === key) throw new Error("Storage unavailable");
            return set.call(this, name, value);
          };
        }
      },
      { key: storageKey, mode },
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await open(page);
    const notes = await launch(page, "notes");
    const before = (await notes.boundingBox())!;
    await move(page, notes, 100, 60);
    expect((await notes.boundingBox())!.x).toBe(before.x + 100);
    await notes.getByRole("button", { name: "Close Notes" }).click();
    await expect(notes).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
