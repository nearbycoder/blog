import { test, expect, type Locator, type Page } from "@playwright/test";

const storageKey = "desktop-icons:v1";
const iconIds = [
  "articles",
  "projects",
  "lab",
  "pages",
  "arcade",
  "ghostty",
  "notes",
  "sketchpad",
] as const;
const icon = (page: Page, id: string) =>
  page.locator(`.desktop-shortcuts [data-desktop-icon="${id}"]`);

for (const viewport of [
  { width: 1440, height: 1000, profile: "wide" },
  { width: 390, height: 844, profile: "compact" },
]) {
  test(`saved ${viewport.profile} icons never paint in their default positions while scripts load`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(
      ({ key, profile }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            layouts: { [profile]: { articles: { column: 2, row: 1 } } },
          }),
        );
      },
      { key: storageKey, profile: viewport.profile },
    );
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/_astro/*.js", async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.goto("/desktop/", { waitUntil: "commit" });
      const shortcuts = page.locator(".desktop-shortcuts");
      await expect(shortcuts).toBeAttached();
      await expect(page.locator("html")).toHaveClass(/has-desktop-js/);
      await expect(shortcuts).toHaveCSS("visibility", "hidden");
      await expect(shortcuts).not.toHaveAttribute("data-icons-ready");
      release();
      await expect(shortcuts).toHaveAttribute("data-icons-ready", "true");
      await expect(icon(page, "articles")).toBeVisible();
      const expected = await shortcuts.evaluate((element) => {
        const style = getComputedStyle(element);
        const n = (name: string) => parseFloat(style.getPropertyValue(name));
        return {
          x: n("--desktop-icon-inset-x") + 2 * n("--desktop-icon-step-x"),
          y: n("--desktop-icon-inset-y") + n("--desktop-icon-step-y"),
        };
      });
      const workspace = (await page.locator("[data-workspace]").boundingBox())!;
      const box = (await icon(page, "articles").boundingBox())!;
      expect(box.x).toBe(workspace.x + expected.x);
      expect(box.y).toBe(workspace.y + expected.y);
      await icon(page, "articles").click();
      await expect(page.locator('[data-window="library"]')).toBeVisible();
    } finally {
      release();
    }
  });
}

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/desktop/");
  await expect(page.locator("[data-desktop-icon]")).toHaveCount(iconIds.length);
}

async function positions(page: Page) {
  return Promise.all(iconIds.map((id) => icon(page, id).boundingBox()));
}

async function stored(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), storageKey);
}

async function beginDrag(page: Page, source: Locator, x: number, y: number) {
  const bounds = (await source.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 10 });
}

async function dragOnto(page: Page, source: Locator, target: Locator) {
  const bounds = (await target.boundingBox())!;
  await beginDrag(
    page,
    source,
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.up();
}

async function expectReachable(page: Page) {
  const workspace = (await page.locator("[data-workspace]").boundingBox())!;
  const boxes = (await positions(page)).map((box) => box!);
  for (const box of boxes) {
    expect(box.x).toBeGreaterThanOrEqual(workspace.x);
    expect(box.y).toBeGreaterThanOrEqual(workspace.y);
    expect(box.x + box.width).toBeLessThanOrEqual(
      workspace.x + workspace.width,
    );
    expect(box.y + box.height).toBeLessThanOrEqual(
      workspace.y + workspace.height,
    );
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const overlapping =
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
      expect(overlapping, `${iconIds[i]} overlaps ${iconIds[j]}`).toBe(false);
    }
  }
}

test("dragging swaps occupied icon positions, persists on reload, and does not launch an application", async ({
  page,
}) => {
  await open(page);
  const articles = icon(page, "articles");
  const projects = icon(page, "projects");
  const articlePosition = await articles.boundingBox();
  const projectPosition = await projects.boundingBox();
  await dragOnto(page, articles, projects);
  expect(await articles.boundingBox()).toEqual(projectPosition);
  expect(await projects.boundingBox()).toEqual(articlePosition);
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  const saved = JSON.parse((await stored(page))!);
  expect(saved.version).toBe(1);
  expect(saved.layouts.wide.articles).toEqual({ column: 0, row: 1 });
  expect(saved.layouts.wide.projects).toEqual({ column: 0, row: 0 });
  await page.reload();
  expect(await articles.boundingBox()).toEqual(projectPosition);
  expect(await projects.boundingBox()).toEqual(articlePosition);

  // A real click after dragging still launches, as does keyboard activation.
  await articles.click();
  await expect(page.locator('[data-window="library"]')).toBeVisible();
  await expect(page.locator("[data-folder-title]")).toHaveText("Articles");
  await page
    .locator('[data-window="library"] [data-window-action="close"]')
    .click();
  await projects.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-window="library"]')).toBeVisible();
  await expect(page.locator("[data-folder-title]")).toHaveText("Projects");
});

test("Escape and pointer cancellation restore the icon layout without saving or launching", async ({
  page,
}) => {
  await open(page);
  const original = await positions(page);
  const originalStorage = await stored(page);
  const articles = icon(page, "articles");
  const target = (await icon(page, "projects").boundingBox())!;
  for (const cancel of ["Escape", "pointercancel"]) {
    await beginDrag(
      page,
      articles,
      cancel === "Escape"
        ? original[0]!.x + original[0]!.width / 2 + 10
        : target.x + target.width / 2,
      cancel === "Escape"
        ? original[0]!.y + original[0]!.height / 2
        : target.y + target.height / 2,
    );
    if (cancel === "Escape") {
      await page.keyboard.press("Escape");
      // Keep holding over the original icon beyond the old 700ms suppression
      // timeout: releasing a cancelled drag must never open the application.
      await page.waitForTimeout(800);
    } else await articles.dispatchEvent("pointercancel", { pointerId: 1 });
    await page.mouse.up();
    expect(await positions(page)).toEqual(original);
    expect(await stored(page)).toBe(originalStorage);
    await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  }
});

test("Alt and arrow keys move and swap focused icons; reset restores the current layout", async ({
  page,
}) => {
  await open(page);
  const original = await positions(page);
  const articles = icon(page, "articles");
  await articles.focus();
  await page.keyboard.press("Alt+ArrowRight");
  await expect(articles).toBeFocused();
  expect((await articles.boundingBox())!.x).toBeGreaterThan(original[0]!.x);
  expect(JSON.parse((await stored(page))!).layouts.wide.articles).toEqual({
    column: 1,
    row: 0,
  });
  await page.keyboard.press("Alt+ArrowDown");
  const emptyPosition = await articles.boundingBox();
  await page.keyboard.press("Alt+ArrowLeft");
  expect(await articles.boundingBox()).toEqual(original[1]);
  expect(await icon(page, "projects").boundingBox()).toEqual(emptyPosition);
  await expect(articles).toBeFocused();
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator("[data-reset-desktop-icons]").click();
  expect(await positions(page)).toEqual(original);
  await page.reload();
  expect(await positions(page)).toEqual(original);
});

test("cancellation from another pointer does not interrupt an icon drag", async ({
  page,
}) => {
  await open(page);
  const articles = icon(page, "articles");
  const projects = icon(page, "projects");
  const original = await articles.boundingBox();
  const target = (await projects.boundingBox())!;
  await beginDrag(
    page,
    articles,
    target.x + target.width / 2,
    target.y + target.height / 2,
  );
  for (const type of ["pointercancel", "lostpointercapture"]) {
    await projects.dispatchEvent(type, { pointerId: 2, isPrimary: false });
    await articles.dispatchEvent(type, { pointerId: 2, isPrimary: false });
    await expect(articles).toHaveClass(/is-icon-dragging/);
  }
  await page.mouse.up();
  expect(await articles.boundingBox()).toEqual(target);
  expect(await projects.boundingBox()).toEqual(original);
  expect(JSON.parse((await stored(page))!).layouts.wide.articles).toEqual({
    column: 0,
    row: 1,
  });
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
});

test("viewport reflow keeps all icons reachable without overwriting the saved wide layout", async ({
  page,
}) => {
  await open(page);
  const articles = icon(page, "articles");
  const workspace = (await page.locator("[data-workspace]").boundingBox())!;
  const before = (await articles.boundingBox())!;
  await beginDrag(
    page,
    articles,
    workspace.x + workspace.width - before.width / 2 - 8,
    before.y + before.height / 2,
  );
  await page.mouse.up();
  const preferredPosition = await articles.boundingBox();
  expect(preferredPosition!.x).toBeGreaterThan(workspace.width / 2);
  const preferredStorage = await stored(page);
  for (const viewport of [
    { width: 900, height: 480 },
    { width: 761, height: 420 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await expectReachable(page);
    expect(await stored(page)).toBe(preferredStorage);
  }
  expect(await articles.boundingBox()).toEqual(preferredPosition);
  await page.setViewportSize({ width: 900, height: 480 });
  await icon(page, "projects").focus();
  await page.keyboard.press("Alt+ArrowRight");
  expect(JSON.parse((await stored(page))!).layouts.wide.articles).toEqual(
    JSON.parse(preferredStorage!).layouts.wide.articles,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await articles.boundingBox()).toEqual(preferredPosition);
  await page.reload();
  expect(await articles.boundingBox()).toEqual(preferredPosition);
});

test("compact layouts persist independently, and resetting compact icons preserves wide preferences", async ({
  page,
}) => {
  await open(page);
  const articles = icon(page, "articles");
  await articles.focus();
  await page.keyboard.press("Alt+ArrowRight");
  const widePosition = await articles.boundingBox();
  const wideLayout = JSON.parse((await stored(page))!).layouts.wide;
  await page.setViewportSize({ width: 390, height: 844 });
  const compactDefault = await positions(page);
  await dragOnto(page, articles, icon(page, "projects"));
  const compactPosition = await articles.boundingBox();
  expect(compactPosition).toEqual(compactDefault[1]);
  const saved = JSON.parse((await stored(page))!);
  expect(saved.layouts.wide).toEqual(wideLayout);
  expect(saved.layouts.compact.articles).toEqual({ column: 0, row: 1 });
  await page.reload();
  expect(await articles.boundingBox()).toEqual(compactPosition);
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 740, height: 390 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expectReachable(page);
    expect(JSON.parse((await stored(page))!)).toEqual(saved);
  }
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator("[data-reset-desktop-icons]").click();
  expect(await positions(page)).toEqual(compactDefault);
  expect(JSON.parse((await stored(page))!).layouts.wide).toEqual(wideLayout);
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await articles.boundingBox()).toEqual(widePosition);
});

test.describe("touch input", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("a touch drag rearranges mobile icons without opening the app or scrolling", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/desktop/");
    const source = (await icon(page, "articles").boundingBox())!;
    const target = (await icon(page, "projects").boundingBox())!;
    const session = await context.newCDPSession(page);
    const x = source.x + source.width / 2;
    const y = source.y + source.height / 2;
    const endX = target.x + target.width / 2;
    const endY = target.y + target.height / 2;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: x + ((endX - x) * step) / 8, y: y + ((endY - y) * step) / 8 },
        ],
      });
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
    expect(await icon(page, "articles").boundingBox()).toEqual(target);
    expect(await icon(page, "projects").boundingBox()).toEqual(source);
    await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
    expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({
      x: 0,
      y: 0,
    });
    await page.reload();
    expect(await icon(page, "articles").boundingBox()).toEqual(target);
  });
});

test("very short viewports keep all icons distinct and let the final column scroll into view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 320 });
  await page.goto("/desktop/");
  const shortcuts = page.locator(".desktop-shortcuts");
  await expect(shortcuts).toHaveAttribute("data-overflow", "");
  const boxes = (await positions(page)).map((box) => box!);
  expect(new Set(boxes.map((box) => `${box.x},${box.y}`)).size).toBe(8);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      expect(
        a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y,
        `${iconIds[i]} overlaps ${iconIds[j]}`,
      ).toBe(true);
    }
  }
  const sketchpad = icon(page, "sketchpad");
  await sketchpad.scrollIntoViewIfNeeded();
  expect(
    await shortcuts.evaluate((element) => element.scrollLeft),
  ).toBeGreaterThan(0);
  const visible = (await sketchpad.boundingBox())!;
  expect(visible.x).toBeGreaterThanOrEqual(0);
  expect(visible.x + visible.width).toBeLessThanOrEqual(320);
  await sketchpad.click();
  await expect(page.locator('[data-window="sketchpad"]')).toBeVisible();
  await expect(page.locator('[data-window="sketchpad"] canvas')).toBeVisible();
});

test("keyboard movement keeps the focused icon visible in a scrolling layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 320 });
  await page.goto("/desktop/");
  const shortcuts = page.locator(".desktop-shortcuts");
  const articles = icon(page, "articles");
  await expect(shortcuts).toHaveAttribute("data-overflow", "");
  await articles.focus();
  for (let column = 0; column < 7; column++) {
    await page.keyboard.press("Alt+ArrowRight");
    await expect(articles).toBeFocused();
    const bounds = (await articles.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  }
  expect(
    await shortcuts.evaluate((element) => element.scrollLeft),
  ).toBeGreaterThan(0);
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-window="library"]')).toBeVisible();
});

for (const [name, corrupt] of [
  ["invalid JSON", "{not-a-layout"],
  [
    "invalid coordinates",
    JSON.stringify({
      version: 1,
      layouts: { wide: { articles: { column: -4, row: "outside" } } },
    }),
  ],
]) {
  test(`corrupt storage (${name}) falls back to usable icons and recovers on a move`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: storageKey, value: corrupt },
    );
    await open(page);
    await expectReachable(page);
    const target = await icon(page, "projects").boundingBox();
    await dragOnto(page, icon(page, "articles"), icon(page, "projects"));
    expect(await icon(page, "articles").boundingBox()).toEqual(target);
    expect(JSON.parse((await stored(page))!).version).toBe(1);
    expect(errors).toEqual([]);
  });
}

test("blocked local storage still allows rearranging icons for the current session", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((key) => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key)
        throw new DOMException("Storage disabled", "SecurityError");
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Storage disabled", "SecurityError");
      set.call(this, name, value);
    };
  }, storageKey);
  await open(page);
  const original = await positions(page);
  await dragOnto(page, icon(page, "articles"), icon(page, "projects"));
  expect(await icon(page, "articles").boundingBox()).toEqual(original[1]);
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await icon(page, "articles").click();
  await expect(page.locator('[data-window="library"]')).toBeVisible();
  expect(errors).toEqual([]);
});
