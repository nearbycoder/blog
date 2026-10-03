import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { LayoutNode } from "@danfessler/trellis";
import type { TilingState } from "../src/scripts/desktop-tiling-state";

const storageKey = "desktop-tiling:v1";
const workspaceKey = "desktop-workspace:v1";
const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);
const area = (page: Page) => page.locator("[data-workspace]");
const toggle = (page: Page) => page.locator("[data-tiling-toggle]");
const tree = (page: Page) => page.locator("[data-tiling-canvas] .trellis");

async function ready(page: Page) {
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
}

async function open(page: Page, width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto("/desktop/");
  await ready(page);
}

async function launch(page: Page, id: string) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(win(page, id)).toBeVisible();
  await expect(win(page, id).locator(".utility-loading")).toHaveCount(0);
  return win(page, id);
}

async function enable(page: Page) {
  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(tree(page)).toBeVisible();
  await expect(page.locator("[data-tiling-controls]")).toBeVisible();
  await page.locator("[data-tiling-flow]").selectOption("canvas");
}

async function size(page: Page, width: number, height: number) {
  await page.locator("[data-tiling-width]").fill(String(width));
  await page.locator("[data-tiling-height]").fill(String(height));
  await page.locator("[data-tiling-apply-size]").click();
}

async function saved(page: Page): Promise<TilingState | null> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    storageKey,
  );
}

async function minimized(page: Page, id: string) {
  return page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key) ?? "{}").windows?.find(
        (item: { id: string }) => item.id === id,
      )?.minimized,
    { key: workspaceKey, id },
  );
}

function splits(
  node: LayoutNode | null | undefined,
): { axis: string; depth: number }[] {
  const result: { axis: string; depth: number }[] = [];
  const walk = (node: LayoutNode | null | undefined, depth: number) => {
    if (node?.kind === "stage") walk(node.child, depth);
    if (node?.kind === "split") {
      result.push({ axis: node.axis, depth });
      node.children.forEach((child) => walk(child, depth + 1));
    }
  };
  walk(node, 0);
  return result;
}

// These fixtures represent a previously saved visit. All subsequent interaction
// uses the real desktop, Trellis tab bars, and window controls.
async function seedTabs(page: Page, keys = ["notes", "json"]) {
  await page.addInitScript(
    ({ storageKey, workspaceKey, keys }) => {
      if (sessionStorage.getItem("desktop-tiling-test-seeded")) return;
      sessionStorage.setItem("desktop-tiling-test-seeded", "true");
      const placement = {
        left: "120px",
        top: "50px",
        width: "650px",
        height: "520px",
        minWidth: "",
        minHeight: "",
      };
      localStorage.setItem(
        workspaceKey,
        JSON.stringify({
          version: 1,
          windows: keys.map((id) => ({
            id,
            minimized: false,
            placement,
          })),
          active: keys[0],
        }),
      );
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          desks: {
            "desk-1": {
              enabled: true,
              flow: "canvas",
              width: 1200,
              height: 900,
              scrollX: 0,
              scrollY: 0,
              document: {
                schema: 1,
                root: {
                  kind: "panel",
                  id: "group-writing",
                  views: keys.map((key) => `view-${key}`),
                  selected: `view-${keys[0]}`,
                },
                floating: [],
                hidden: [],
                views: Object.fromEntries(
                  keys.map((key) => [
                    `view-${key}`,
                    { type: "desktop", params: { key } },
                  ]),
                ),
              },
            },
          },
        }),
      );
    },
    { storageKey, workspaceKey, keys },
  );
}

test("tiling is opt-in, preserves app instances, and restores floating placement", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const engineRequest = (url: string) =>
    /(?:desktop-tiling(?:-runtime)?[.](?!state)|danfessler.*trellis)/.test(url);
  await open(page);
  const notes = await launch(page, "notes");
  await notes.locator("[data-notes-new]").first().click();
  const editor = notes.getByRole("textbox", { name: "Note text", exact: true });
  await editor.fill("A draft survives changing the way windows are arranged.");
  const originalEditor = await editor.elementHandle();
  const floating = await notes.boundingBox();
  await launch(page, "json");
  expect(requests.filter(engineRequest)).toEqual([]);
  await expect(page.locator("[data-tiling-controls]")).toBeHidden();

  await enable(page);
  await expect.poll(() => requests.some(engineRequest)).toBe(true);
  await expect(notes).toHaveAttribute("data-tiled", "true");
  await expect(win(page, "json")).toHaveAttribute("data-tiled", "true");
  await expect(
    tree(page).getByRole("tab", { name: "Notes", exact: true }),
  ).toBeVisible();
  await expect(
    tree(page).getByRole("separator", { name: "Resize panels" }),
  ).toHaveCount(1);
  expect(
    await notes.evaluate((el) => el.parentElement?.matches("[data-workspace]")),
  ).toBe(true);
  await expect(editor).toHaveValue(
    "A draft survives changing the way windows are arranged.",
  );
  expect(
    await editor.evaluate((el, original) => el === original, originalEditor),
  ).toBe(true);

  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(notes).not.toHaveAttribute("data-tiled", "true");
  expect(await notes.boundingBox()).toEqual(floating);
  await expect(editor).toHaveValue(
    "A draft survives changing the way windows are arranged.",
  );
  expect(
    await editor.evaluate((el, original) => el === original, originalEditor),
  ).toBe(true);
  await originalEditor?.dispose();
});

test("nested horizontal and vertical panels resize from the keyboard and retain their tree", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "json");
  await launch(page, "calculator");
  await enable(page);
  await size(page, 1200, 900);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await page
    .getByRole("button", { name: "Show JSON Desk", exact: true })
    .click();
  await page.locator('[data-tiling-split="bottom"]').click();
  await page
    .getByRole("button", { name: "Show Calculator", exact: true })
    .click();
  await page.locator('[data-tiling-split="right"]').click();
  await expect
    .poll(async () => {
      const layout = splits(
        (await saved(page))?.desks["desk-1"]?.document?.root,
      );
      return {
        axes: [...new Set(layout.map((entry) => entry.axis))].sort(),
        nested: layout.some((entry) => entry.depth > 0),
      };
    })
    .toEqual({ axes: ["x", "y"], nested: true });

  const divider = tree(page)
    .getByRole("separator", { name: "Resize panels" })
    .first();
  const before = JSON.stringify(
    (await saved(page))?.desks["desk-1"].document?.root,
  );
  const direction = await divider.getAttribute("aria-orientation");
  await divider.focus();
  await divider.press(direction === "vertical" ? "ArrowRight" : "ArrowDown");
  await expect
    .poll(async () =>
      JSON.stringify((await saved(page))?.desks["desk-1"].document?.root),
    )
    .not.toBe(before);
  const after = (await saved(page))!.desks["desk-1"].document!.root;
  for (const id of ["notes", "json", "calculator"]) {
    const bounds = (await win(page, id).boundingBox())!;
    expect(bounds.width).toBeGreaterThan(100);
    expect(bounds.height).toBeGreaterThan(100);
  }
  await page.reload();
  await ready(page);
  await expect(tree(page)).toBeVisible();
  await expect
    .poll(async () => (await saved(page))?.desks["desk-1"].document?.root)
    .toEqual(after);
  await expect(
    tree(page).getByRole("separator", { name: "Resize panels" }),
  ).toHaveCount(2);
});

test("large canvases scroll natively on both axes and restore the viewport after reload", async ({
  page,
}) => {
  await open(page, 1280, 850);
  await launch(page, "notes");
  await launch(page, "json");
  await enable(page);
  await size(page, 2600, 2000);
  await expect
    .poll(async () => {
      const desk = (await saved(page))?.desks["desk-1"];
      return [desk?.width, desk?.height];
    })
    .toEqual([2600, 2000]);
  const overflow = await area(page).evaluate((el) => ({
    horizontal: el.scrollWidth > el.clientWidth,
    vertical: el.scrollHeight > el.clientHeight,
    x: getComputedStyle(el).overflowX,
    y: getComputedStyle(el).overflowY,
  }));
  expect(overflow).toMatchObject({ horizontal: true, vertical: true });
  expect(overflow.x).toMatch(/auto|scroll/);
  expect(overflow.y).toMatch(/auto|scroll/);
  await area(page).evaluate((el) =>
    el.scrollTo({ left: 600, top: 450, behavior: "instant" }),
  );
  await expect
    .poll(async () => {
      const desk = (await saved(page))?.desks["desk-1"];
      return [Math.round(desk?.scrollX ?? -1), Math.round(desk?.scrollY ?? -1)];
    })
    .toEqual([600, 450]);
  await page.reload();
  await ready(page);
  await expect
    .poll(() =>
      area(page).evaluate((el) => [
        Math.round(el.scrollLeft),
        Math.round(el.scrollTop),
      ]),
    )
    .toEqual([600, 450]);
  await page.locator("[data-tiling-home]").click();
  await expect
    .poll(() => area(page).evaluate((el) => [el.scrollLeft, el.scrollTop]))
    .toEqual([0, 0]);
  const showNotes = page.getByRole("button", {
    name: "Show Notes",
    exact: true,
  });
  await showNotes.click();
  await expect(
    tree(page).getByRole("tab", { name: "Notes", exact: true }),
  ).toBeInViewport();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const revealed = await area(page).evaluate((el) => [
    el.scrollLeft,
    el.scrollTop,
  ]);
  for (let repeat = 0; repeat < 3; repeat++) {
    await showNotes.click();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(
      await area(page).evaluate((el) => [el.scrollLeft, el.scrollTop]),
    ).toEqual(revealed);
  }
});

test("Show desktop reveals shortcuts and restores the same scrolled tiled viewport", async ({
  page,
}) => {
  await open(page, 1280, 850);
  await launch(page, "notes");
  await launch(page, "json");
  await enable(page);
  await size(page, 2600, 2000);
  await area(page).evaluate((el) =>
    el.scrollTo({ left: 600, top: 450, behavior: "instant" }),
  );
  await expect
    .poll(async () => {
      const desk = (await saved(page))?.desks["desk-1"];
      return [desk?.scrollX, desk?.scrollY];
    })
    .toEqual([600, 450]);
  const showDesktop = page.getByRole("button", {
    name: "Show desktop",
    exact: true,
  });
  await showDesktop.click();
  await expect(showDesktop).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-tiling-canvas]")).toBeHidden();
  await expect(
    page.locator('.desktop-shortcuts [data-desktop-icon="notes"]'),
  ).toBeVisible();
  await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  await showDesktop.click();
  await expect(showDesktop).toHaveAttribute("aria-pressed", "false");
  await expect(tree(page)).toBeVisible();
  await expect
    .poll(() =>
      area(page).evaluate((el) => [
        Math.round(el.scrollLeft),
        Math.round(el.scrollTop),
      ]),
    )
    .toEqual([600, 450]);
  await expect
    .poll(async () => {
      const desk = (await saved(page))?.desks["desk-1"];
      return [Math.round(desk?.scrollX ?? -1), Math.round(desk?.scrollY ?? -1)];
    })
    .toEqual([600, 450]);
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "json")).toBeVisible();
});

test("each desktop remembers its own tiling mode, dimensions, and panel tree", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "json");
  await enable(page);
  await size(page, 2100, 1800);
  const manager = await launch(page, "workspaces");
  await expect(manager).not.toHaveAttribute("data-tiled", "true");
  await manager.getByLabel("New desktop name").fill("Research");
  await manager
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  const research = manager.getByRole("article", {
    name: "Research desktop",
    exact: true,
  });
  const researchId = (await research.getAttribute("data-space-card"))!;
  await research
    .getByRole("button", { name: "Switch to Research", exact: true })
    .click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(win(page, "notes")).toBeHidden();
  await launch(page, "calculator");
  await expect(win(page, "calculator")).not.toHaveAttribute(
    "data-tiled",
    "true",
  );
  await enable(page);
  await size(page, 1800, 1400);
  await page.keyboard.press("Control+Alt+PageUp");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-tiling-width]")).toHaveValue("2100");
  await expect(win(page, "notes")).toHaveAttribute("data-tiled", "true");
  await expect(win(page, "calculator")).toBeHidden();
  await expect
    .poll(async () => {
      const state = await saved(page);
      return Object.fromEntries(
        Object.entries(state?.desks ?? {}).map(([id, desk]) => [
          id,
          {
            enabled: desk.enabled,
            width: desk.width,
            windows: Object.values(desk.document?.views ?? {})
              .map((view) => view.params?.key)
              .sort(),
          },
        ]),
      );
    })
    .toEqual({
      "desk-1": { enabled: true, width: 2100, windows: ["json", "notes"] },
      [researchId]: { enabled: true, width: 1800, windows: ["calculator"] },
    });
  await toggle(page).click();
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await ready(page);
  await expect(win(page, "calculator")).toHaveAttribute("data-tiled", "true");
  await expect(page.locator("[data-tiling-width]")).toHaveValue("1800");
  await page.keyboard.press("Control+Alt+PageUp");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(win(page, "notes")).toBeVisible();
});

test("dragging native panel tabs groups apps without replacing their content", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await notes.locator("[data-notes-new]").first().click();
  const editor = notes.getByRole("textbox", { name: "Note text", exact: true });
  await editor.fill("Group this draft with JSON Desk.");
  const original = await editor.elementHandle();
  await launch(page, "json");
  await enable(page);
  await size(page, 1200, 900);
  const notesTab = tree(page).getByRole("tab", { name: "Notes", exact: true });
  const jsonTab = tree(page).getByRole("tab", {
    name: "JSON Desk",
    exact: true,
  });
  await notesTab.dragTo(jsonTab);
  await expect(tree(page).getByRole("tablist")).toHaveCount(1);
  await expect(tree(page).getByRole("tab")).toHaveCount(2);
  await expect(
    tree(page).getByRole("separator", { name: "Resize panels" }),
  ).toHaveCount(0);
  await notesTab.click();
  await expect(editor).toHaveValue("Group this draft with JSON Desk.");
  expect(
    await editor.evaluate((element, old) => element === old, original),
  ).toBe(true);
  await jsonTab.click();
  await expect(notes).toBeHidden();
  await expect(win(page, "json")).toBeVisible();
  await expect.poll(() => minimized(page, "notes")).toBe(false);
  await original?.dispose();
});

test("readers keep the same loaded document while toggling and rearranging panels", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await page.locator('[data-desktop-file][href="/start-here"]').click();
  const reader = page.locator(".reader-window");
  const iframe = reader.locator("[data-desktop-reader]");
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  const original = await iframe.elementHandle();
  await iframe.evaluate((element: HTMLIFrameElement) => {
    const frame = element as HTMLIFrameElement & {
      subsequentLoads: number;
      originalDocument: Document | null;
    };
    frame.subsequentLoads = 0;
    frame.originalDocument = frame.contentDocument;
    frame.addEventListener("load", () => frame.subsequentLoads++);
  });
  await enable(page);
  await size(page, 1600, 1100);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  const title = (await reader.getAttribute("data-title"))!;
  await page
    .getByRole("button", { name: `Show ${title}`, exact: true })
    .click();
  await page.locator('[data-tiling-split="bottom"]').click();
  await toggle(page).click();
  await expect(reader).toBeVisible();
  expect(await iframe.evaluate((el, old) => el === old, original)).toBe(true);
  expect(
    await iframe.evaluate((element) => {
      const frame = element as HTMLIFrameElement & {
        subsequentLoads: number;
        originalDocument: Document | null;
      };
      return {
        loads: frame.subsequentLoads,
        sameDocument: frame.contentDocument === frame.originalDocument,
      };
    }),
  ).toEqual({ loads: 0, sameDocument: true });
  await expect(
    page.frameLocator("[data-desktop-reader]").locator("h1"),
  ).toBeVisible();
  await original?.dispose();
});

test("inactive tabs remain open while explicit minimization survives reload and task restoration", async ({
  page,
}) => {
  await seedTabs(page);
  await open(page);
  const notes = win(page, "notes");
  const json = win(page, "json");
  await expect(tree(page).getByRole("tab")).toHaveCount(2);
  await expect(notes).toBeVisible();
  await expect(json).toBeHidden();
  await expect.poll(() => minimized(page, "json")).toBe(false);
  await notes.locator("[data-notes-new]").first().click();
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Keep my hidden tab draft.");
  const draft = await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .elementHandle();
  await tree(page).getByRole("tab", { name: "JSON Desk", exact: true }).click();
  await expect(json).toBeVisible();
  await expect(notes).toBeHidden();
  await expect.poll(() => minimized(page, "notes")).toBe(false);
  await tree(page).getByRole("tab", { name: "Notes", exact: true }).click();
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Keep my hidden tab draft.");
  expect(
    await notes
      .getByRole("textbox", { name: "Note text", exact: true })
      .evaluate((el, old) => el === old, draft),
  ).toBe(true);
  await tree(page)
    .getByRole("button", { name: "Minimize Notes", exact: true })
    .click();
  await expect(notes).toBeHidden();
  await expect.poll(() => minimized(page, "notes")).toBe(true);
  await expect(json).toBeVisible();
  await page.reload();
  await ready(page);
  await expect(tree(page)).toBeVisible();
  await expect(notes).toBeHidden();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes).toBeVisible();
  await expect(notes).toHaveAttribute("data-tiled", "true");
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Keep my hidden tab draft.");
  await expect.poll(() => minimized(page, "notes")).toBe(false);
  await draft?.dispose();
});

test("small screens keep apps usable and restore the saved tiled layout on a wide screen", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await notes.locator("[data-notes-new]").first().click();
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Continue this on my phone.");
  await launch(page, "json");
  await enable(page);
  await size(page, 2000, 1600);
  const before = (await saved(page))!.desks["desk-1"].document!.root;
  await page.setViewportSize({ width: 320, height: 720 });
  await page.reload();
  await ready(page);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes).toBeVisible();
  await expect(notes).not.toHaveAttribute("data-tiled", "true");
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Continue this on my phone.");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  const phone = (await notes.boundingBox())!;
  expect(phone.x).toBeGreaterThanOrEqual(0);
  expect(phone.x + phone.width).toBeLessThanOrEqual(320);
  expect((await saved(page))!.desks["desk-1"].document!.root).toEqual(before);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(notes).toHaveAttribute("data-tiled", "true");
  await expect(page.locator("[data-tiling-width]")).toHaveValue("2000");
  await expect
    .poll(async () => (await saved(page))?.desks["desk-1"].document?.root)
    .toEqual(before);
});

test("floating desktop tools stay reachable and draggable above a scrolled canvas", async ({
  page,
}) => {
  await open(page, 1440, 1100);
  await launch(page, "notes");
  await launch(page, "json");
  await enable(page);
  await size(page, 3000, 2400);
  await area(page).evaluate((el) =>
    el.scrollTo({ left: 900, top: 750, behavior: "instant" }),
  );
  const manager = await launch(page, "workspaces");
  await expect(manager).not.toHaveAttribute("data-tiled", "true");
  const viewport = (await area(page).boundingBox())!;
  const before = (await manager.boundingBox())!;
  expect(before.x).toBeGreaterThanOrEqual(viewport.x);
  expect(before.y).toBeGreaterThanOrEqual(viewport.y);
  expect(before.x + before.width).toBeLessThanOrEqual(
    viewport.x + viewport.width,
  );
  expect(before.y + before.height).toBeLessThanOrEqual(
    viewport.y + viewport.height,
  );
  const handle = (await manager.locator("[data-drag-handle]").boundingBox())!;
  await page.mouse.move(handle.x + 120, handle.y + 18);
  await page.mouse.down();
  await page.mouse.move(handle.x + 180, handle.y + 58, { steps: 5 });
  await page.mouse.up();
  const moved = (await manager.boundingBox())!;
  expect(moved.x).toBeCloseTo(before.x + 60, 0);
  expect(moved.y).toBeCloseTo(before.y + 40, 0);
  const grip = (await manager.locator('[data-resize="se"]').boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    grip.x + grip.width / 2 + 40,
    grip.y + grip.height / 2 + 30,
    { steps: 5 },
  );
  await page.mouse.up();
  const resized = (await manager.boundingBox())!;
  expect(resized.width).toBeCloseTo(moved.width + 40, 0);
  expect(resized.height).toBeCloseTo(moved.height + 30, 0);
  await manager.getByLabel("New desktop name").fill("From this viewport");
  await manager
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await expect(
    manager.getByRole("article", {
      name: "From this viewport desktop",
      exact: true,
    }),
  ).toBeVisible();
});

test("opening a launcher folder selects an existing inactive Library tab", async ({
  page,
}) => {
  await seedTabs(page, ["notes", "library"]);
  await open(page);
  await expect(tree(page).getByRole("tab")).toHaveCount(2);
  await expect(win(page, "library")).toBeHidden();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-folder="projects"]').click();
  await expect(win(page, "library")).toBeVisible();
  await expect(win(page, "library").locator("[data-folder-title]")).toHaveText(
    "Projects",
  );
  await expect(
    tree(page).getByRole("tab", { name: "Library", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(win(page, "notes")).toBeHidden();
  await expect.poll(() => minimized(page, "notes")).toBe(false);
  await expect(win(page, "library")).toHaveCount(1);
});

test("an explicitly floated app stays floating when switching desktops and reloading", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await notes.locator("[data-notes-new]").first().click();
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Keep this app outside my tiled panels.");
  await launch(page, "json");
  await enable(page);
  await size(page, 1200, 900);
  await tree(page)
    .getByRole("button", { name: "Float Notes", exact: true })
    .click();
  await expect(notes).not.toHaveAttribute("data-tiled", "true");
  await expect(win(page, "json")).toHaveAttribute("data-tiled", "true");
  const manager = await launch(page, "workspaces");
  await manager.getByLabel("New desktop name").fill("Other desk");
  await manager
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(notes).toBeHidden();
  await page.keyboard.press("Control+Alt+PageUp");
  await expect(notes).toBeVisible();
  await expect(notes).not.toHaveAttribute("data-tiled", "true");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await page.reload();
  await ready(page);
  await expect(tree(page)).toBeVisible();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(notes).toBeVisible();
  await expect(notes).not.toHaveAttribute("data-tiled", "true");
  await expect(win(page, "json")).toHaveAttribute("data-tiled", "true");
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Keep this app outside my tiled panels.");
});

test("tiled panels and their controls are accessible in light and dark themes", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "json");
  await enable(page);
  await size(page, 1200, 900);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    await expect(tree(page)).toHaveAttribute("data-theme", theme);
    const result = await new AxeBuilder({ page })
      .include("[data-tiling-canvas]")
      .include("[data-tiling-controls]")
      .analyze();
    expect(result.violations, `${theme} tiled interface`).toEqual([]);
  }
});

test("a delayed tiling download cannot overwrite a Data Center layout restore", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  let releaseEngine!: () => void;
  let releaseReload!: () => void;
  const engineGate = new Promise<void>((resolve) => {
    releaseEngine = resolve;
  });
  const reloadGate = new Promise<void>((resolve) => {
    releaseReload = resolve;
  });
  let engineRequested = false;
  let reloadRequested = false;
  let committing: Promise<void> | undefined;
  const scripts = new Set<string>();
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.add(request.url());
  });
  page.on("requestfinished", (request) => scripts.delete(request.url()));
  page.on("requestfailed", (request) => scripts.delete(request.url()));
  // The reloading document can stop accepting JavaScript evaluation before its
  // navigation finishes. Another tab sees the same saved data throughout.
  const observer = await page.context().newPage();
  await observer.goto("/");
  await page.route(
    /\/desktop-tiling\.(?:ts(?:\?.*)?|[\w-]+\.js)$/,
    async (route) => {
      engineRequested = true;
      await engineGate;
      await route.continue();
    },
  );
  await page.route("**/desktop/", async (route) => {
    if (
      route.request().isNavigationRequest() &&
      route.request().frame() === page.mainFrame()
    ) {
      reloadRequested = true;
      await reloadGate;
    }
    await route.continue();
  });
  const restored: TilingState = {
    version: 1,
    desks: {
      "desk-1": {
        enabled: false,
        width: 2200,
        height: 1600,
        scrollX: 0,
        scrollY: 0,
        document: null,
      },
    },
  };
  try {
    await toggle(page).click();
    await expect.poll(() => engineRequested).toBe(true);
    const backup = await launch(page, "backup");
    await backup
      .getByRole("button", { name: "Import a backup", exact: true })
      .click();
    await backup.locator("[data-backup-file]").setInputFiles({
      name: "tiling-restore.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          app: "nearby-desktop",
          version: 1,
          createdAt: "2026-10-03T12:00:00Z",
          categories: {
            layout: {
              [storageKey]: JSON.stringify(restored),
              [workspaceKey]: JSON.stringify({
                version: 1,
                windows: [],
                active: null,
              }),
            },
          },
        }),
      ),
    });
    await backup
      .getByRole("checkbox", {
        name: "Restore Windows & desktops",
        exact: true,
      })
      .check();
    await backup
      .getByRole("button", { name: "Review selected restore…", exact: true })
      .click();
    await backup.getByRole("checkbox", { name: /I understand/ }).check();
    committing = backup
      .getByRole("button", { name: "Restore selected and reload", exact: true })
      .click();
    await expect.poll(() => reloadRequested).toBe(true);
    // Complete the pending download after replacement data was committed and
    // while reload is waiting. Read shared storage outside the unloading page.
    releaseEngine();
    await expect.poll(() => scripts.size).toBe(0);
    expect(await saved(observer)).toEqual(restored);
    releaseReload();
    await committing;
    await ready(page);
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    expect(await saved(page)).toEqual(restored);
    await expect(page.locator("[data-tiling-canvas]")).toHaveCount(0);
    await expect(page.locator(".desktop-window:visible")).toHaveCount(0);
  } finally {
    releaseEngine();
    releaseReload();
    await committing?.catch(() => {});
    await observer.close().catch(() => {});
  }
});

for (const raw of [
  "{broken",
  JSON.stringify({ version: 9, desks: {} }),
  JSON.stringify({
    version: 1,
    desks: { "desk-1": { enabled: true, width: 1 } },
  }),
]) {
  test(`unreadable tiling data is preserved while the current visit remains usable: ${raw.slice(0, 32)}`, async ({
    page,
  }) => {
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: storageKey,
      raw,
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await open(page);
    await launch(page, "notes");
    await launch(page, "json");
    await enable(page);
    await size(page, 1800, 1400);
    await expect(win(page, "notes")).toHaveAttribute("data-tiled", "true");
    await toggle(page).click();
    await expect(win(page, "notes")).toBeVisible();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), storageKey),
    ).toBe(raw);
    expect(errors).toEqual([]);
  });
}

test("slow tab tears keep the committed layout intact until drop or cancel", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "json");
  await launch(page, "calculator");
  await enable(page);
  const notes = tree(page).getByRole("tab", { name: "Notes", exact: true });
  const json = tree(page).getByRole("tab", { name: "JSON Desk", exact: true });
  await notes.dragTo(json);
  await expect(tree(page).getByRole("tablist")).toHaveCount(2);
  await expect
    .poll(async () => (await saved(page))?.desks["desk-1"].document?.root?.kind)
    .toBe("split");
  const before = (await saved(page))!.desks["desk-1"].document;
  const start = (await notes.boundingBox())!;
  const target = (await tree(page)
    .getByRole("tab", { name: "Calculator", exact: true })
    .boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + 180, {
    steps: 12,
  });
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-tiling-dragging",
    "",
  );
  // Longer than the desktop's geometry, reconciliation, and save debounces.
  await page.waitForTimeout(500);
  expect((await saved(page))!.desks["desk-1"].document).toEqual(before);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(tree(page).getByRole("tablist")).toHaveCount(2);
  await expect
    .poll(async () => (await saved(page))!.desks["desk-1"].document)
    .toEqual(before);
  // A subsequent slow drop into another tab group commits exactly once.
  const again = (await notes.boundingBox())!;
  const calc = (await tree(page)
    .getByRole("tab", { name: "Calculator", exact: true })
    .boundingBox())!;
  await page.mouse.move(again.x + again.width / 2, again.y + again.height / 2);
  await page.mouse.down();
  await page.mouse.move(calc.x + calc.width / 2, calc.y + calc.height / 2, {
    steps: 12,
  });
  await page.waitForTimeout(500);
  expect((await saved(page))!.desks["desk-1"].document).toEqual(before);
  await page.mouse.up();
  await expect
    .poll(async () => (await saved(page))!.desks["desk-1"].document)
    .not.toEqual(before);
  await expect(tree(page).getByRole("tablist")).toHaveCount(2);
  await expect(tree(page).getByRole("tab")).toHaveCount(3);
  const after = (await saved(page))!.desks["desk-1"].document;
  await page.reload();
  await ready(page);
  await expect
    .poll(async () => (await saved(page))!.desks["desk-1"].document)
    .toEqual(after);
});

test("slow divider resizing after tab reordering commits only on release and survives reload", async ({
  page,
}) => {
  await open(page, 1800, 1100);
  await launch(page, "notes");
  await launch(page, "json");
  await launch(page, "calculator");
  await enable(page);
  // Reorder the traversal relative to app creation order, exposing false document differences.
  await tree(page)
    .getByRole("tab", { name: "Calculator", exact: true })
    .dragTo(tree(page).getByRole("tab", { name: "Notes", exact: true }));
  await expect(tree(page).getByRole("tablist")).toHaveCount(2);
  const before = (await saved(page))!.desks["desk-1"].document;
  const divider = (await tree(page)
    .getByRole("separator", { name: "Resize panels" })
    .first()
    .boundingBox())!;
  await page.mouse.move(divider.x + divider.width / 2, divider.y + 80);
  await page.mouse.down();
  await page.mouse.move(divider.x + 100, divider.y + 80, { steps: 12 });
  await page.waitForTimeout(500);
  expect((await saved(page))!.desks["desk-1"].document).toEqual(before);
  const moved = await win(page, "json").boundingBox();
  await page.mouse.up();
  await expect
    .poll(async () => (await saved(page))!.desks["desk-1"].document)
    .not.toEqual(before);
  await page.waitForTimeout(300);
  const settled = (await win(page, "json").boundingBox())!;
  expect(settled.width).toBeCloseTo(moved!.width, 0);
  const after = (await saved(page))!.desks["desk-1"].document;
  await page.reload();
  await ready(page);
  await expect
    .poll(async () => (await saved(page))!.desks["desk-1"].document)
    .toEqual(after);
  expect((await win(page, "json").boundingBox())!.width).toBeCloseTo(
    settled.width,
    0,
  );
});

test("canvas dimension drafts survive background window synchronization", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await enable(page);
  await page.locator("[data-tiling-width]").fill("2200");
  await page.locator("[data-tiling-height]").fill("1800");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await page.waitForTimeout(300);
  await expect(page.locator("[data-tiling-width]")).toHaveValue("2200");
  await expect(page.locator("[data-tiling-height]")).toHaveValue("1800");
  await page.locator("[data-tiling-apply-size]").click();
  await expect
    .poll(async () => {
      const desk = (await saved(page))!.desks["desk-1"];
      return [desk.width, desk.height];
    })
    .toEqual([2200, 1800]);
});
