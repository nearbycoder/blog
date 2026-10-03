import { expect, test, type Page } from "@playwright/test";
import { localState } from "../src/scripts/desktop-local-state";
import {
  defaultDesktopPreferences,
  validDesktopPreferences,
} from "../src/scripts/desktop-preferences";
import { validateRecord } from "../src/scripts/desktop-backup-data";

async function launch(page: Page, id: string) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  const app = page.locator(`[data-window="${id}"]`);
  await expect(app).toBeVisible();
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  return app;
}

test("shared saved state measures UTF-8 bytes and preserves oversized or unreadable originals", () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const key = "test-record";
  const initial = { version: 1, text: "" };
  const valid = (value: unknown): value is typeof initial =>
    !!value &&
    typeof value === "object" &&
    (value as typeof initial).version === 1 &&
    typeof (value as typeof initial).text === "string";
  const records = new Map<string, string>();
  let blocked = false;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(name: string) {
        if (blocked) throw new DOMException("Denied", "SecurityError");
        return records.get(name) ?? null;
      },
      setItem(name: string, value: string) {
        records.set(name, value);
      },
    },
  });
  try {
    const unicode = JSON.stringify({ version: 1, text: "🌿".repeat(50) });
    expect(unicode.length).toBeLessThan(160);
    expect(new TextEncoder().encode(unicode).length).toBeGreaterThan(160);
    records.set(key, unicode);
    const oversized = localState(key, initial, valid, 160);
    expect(oversized.writable).toBe(false);
    expect(oversized.save({ version: 1, text: "session only" })).toBe(false);
    expect(oversized.value.text).toBe("session only");
    expect(records.get(key)).toBe(unicode);

    const original = JSON.stringify({ version: 1, text: "preserved" });
    records.set(key, original);
    blocked = true;
    const unreadable = localState(key, initial, valid, 160);
    blocked = false;
    expect(unreadable.save({ version: 1, text: "still session only" })).toBe(
      false,
    );
    expect(records.get(key)).toBe(original);
    const writable = localState(key, initial, valid, 160);
    expect(writable.save(JSON.parse(unicode))).toBe(false);
    expect(writable.value.text).toBe("preserved");
    expect(records.get(key)).toBe(original);
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("a quota failure keeps current session preferences and permits a later successful retry", () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const initial = defaultDesktopPreferences();
  let stored = JSON.stringify(initial);
  let full = true;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => stored,
      setItem(_key: string, value: string) {
        if (full) throw new DOMException("Full", "QuotaExceededError");
        stored = value;
      },
    },
  });
  try {
    const state = localState(
      "preferences",
      initial,
      validDesktopPreferences,
      2048,
    );
    expect(state.save({ ...initial, accent: "blue" })).toBe(false);
    expect(state.value.accent).toBe("blue");
    expect(JSON.parse(stored).accent).toBe("emerald");
    expect(state.message).toContain("last for this visit");
    full = false;
    expect(state.save({ ...state.value, wallpaper: "plain" })).toBe(true);
    expect(JSON.parse(stored)).toMatchObject({
      accent: "blue",
      wallpaper: "plain",
    });
    expect(state.message).toBe("Saved on this device.");
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("future shell records survive changes and pagehide across cached services", async ({
  page,
}) => {
  const originals = {
    "nearby-desktop-preferences-v1": '{"version":42,"accent":"ultraviolet"}',
    "nearby-desktop-activity-v1": '{"version":42,"history":[]}',
    "desktop-spaces:v1": '{"version":42,"spaces":[]}',
    "desktop-window-pins:v1": '{"version":42,"keys":[]}',
    "desktop-library:v1": '{"version":42,"folder":"future"}',
    "desktop-library-recent:v1": '{"version":42,"paths":[]}',
  };
  await page.goto("/desktop/");
  await page.evaluate((records) => {
    for (const [key, value] of Object.entries(records))
      localStorage.setItem(key, value);
  }, originals);
  await page.reload();
  const settings = await launch(page, "settings");
  await settings.getByRole("radio", { name: "Blue", exact: true }).check();
  const activity = await launch(page, "activity");
  await activity
    .getByRole("checkbox", { name: "Do not disturb", exact: false })
    .check();
  const spaces = await launch(page, "workspaces");
  await spaces.getByLabel("New desktop name").fill("Temporary work");
  await spaces
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await launch(page, "calculator");
  await launch(page, "windows");
  await page
    .locator('[data-overview-window="calculator"]')
    .getByRole("button", { name: "Keep above", exact: true })
    .click();
  // Flush the shell's actual pagehide persistence, without re-seeding storage.
  await page.goto("/");
  expect(
    await page.evaluate(
      (keys) =>
        Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
      Object.keys(originals),
    ),
  ).toEqual(originals);
});

test("all storage reads blocked leaves shell controls usable without overwriting originals", async ({
  page,
}) => {
  const original = JSON.stringify({
    ...defaultDesktopPreferences(),
    accent: "amber",
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(
    ({ original }) => {
      localStorage.setItem("nearby-desktop-preferences-v1", original);
      const read = Storage.prototype.getItem;
      Object.assign(window, { storageAuditRead: read });
      Storage.prototype.getItem = function () {
        throw new DOMException("All reads blocked", "SecurityError");
      };
    },
    { original },
  );
  await page.goto("/desktop/");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
  const settings = await launch(page, "settings");
  await settings.getByRole("radio", { name: "Blue", exact: true }).check();
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-desktop-accent",
    "blue",
  );
  const spaces = await launch(page, "workspaces");
  await spaces.getByLabel("New desktop name").fill("Session desktop");
  await spaces
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await spaces
    .getByRole("button", { name: "Switch to Session desktop", exact: true })
    .click();
  await expect(page.locator("[data-active-space-label]")).toHaveText(
    "Session desktop",
  );
  const activity = await launch(page, "activity");
  await activity
    .getByRole("checkbox", { name: "Do not disturb", exact: false })
    .check();
  await expect(activity.locator("[data-activity-status]")).toContainText(
    "original is preserved",
  );
  expect(
    await page.evaluate(() =>
      (
        window as unknown as {
          storageAuditRead: typeof Storage.prototype.getItem;
        }
      ).storageAuditRead.call(localStorage, "nearby-desktop-preferences-v1"),
    ),
  ).toBe(original);
  expect(errors).toEqual([]);
});

test("a restored pin for a removed article does not disable saving new app pins", async ({
  page,
}) => {
  const key = "desktop-window-pins:v1";
  const stalePath = "/articles/no-longer-in-the-library";
  const raw = JSON.stringify({ version: 1, keys: [stalePath] });
  expect(validateRecord(key, raw)).toBe("");
  await page.goto("/desktop/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key,
    raw,
  });
  await page.reload();
  await launch(page, "calculator");
  await launch(page, "windows");
  await page
    .locator('[data-overview-window="calculator"]')
    .getByRole("button", { name: "Keep above", exact: true })
    .click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).keys,
      key,
    ),
  ).toContain("calculator");
  await page.reload();
  await expect(page.locator('[data-window="calculator"]')).toHaveAttribute(
    "data-pinned",
    "true",
  );
});
