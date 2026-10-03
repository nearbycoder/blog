import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  backupCategories,
  createBackup,
  inspectCategory,
  parseBackup,
  readCategories,
  replaceCategories,
  validateRecord,
} from "../src/scripts/desktop-backup-data";

const noteKey = "desktop-notes:v1";
const taskKey = "nearby-desktop-tasks-v1";
const note = (body: string) =>
  JSON.stringify({
    version: 1,
    activeId: "note-a",
    notes: [{ id: "note-a", title: "A note", body, updatedAt: 1 }],
  });
const task = JSON.stringify({
  version: 1,
  tasks: [{ id: "task-a", title: "A task", details: "", stage: "todo" }],
});
function envelope(categories: Record<string, Record<string, string>>) {
  return JSON.stringify({
    app: "nearby-desktop",
    version: 1,
    createdAt: "2026-10-03T12:00:00Z",
    categories,
  });
}
function memory(initial: Record<string, string>) {
  const records = new Map(Object.entries(initial));
  return {
    records,
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
    removeItem: (key: string) => {
      records.delete(key);
    },
  };
}
async function openBackup(page: Page) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="backup"]:visible').first().click();
  const app = page.locator('[data-window="backup"]');
  await expect(app.locator("[data-backup-total]")).toContainText("across");
  return app;
}
async function upload(page: Page, raw: string) {
  const app = await openBackup(page);
  await app
    .getByRole("button", { name: "Import a backup", exact: true })
    .click();
  await app.locator("[data-backup-file]").setInputFiles({
    name: "desktop-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  return app;
}

test("backup parser rejects arbitrary keys and prototype names; known incompatible records are preview-only", () => {
  for (const raw of [
    envelope({ unknown: {} }),
    envelope({ notes: { "theme-preference": "dark" } }),
    '{"app":"nearby-desktop","version":1,"createdAt":"2026-10-03T12:00:00Z","categories":{"__proto__":{}}}',
    envelope({ notes: { [noteKey]: note("x") } }).replace(
      '"version":1',
      '"version":2',
    ),
  ])
    expect(() => parseBackup(raw)).toThrow();
  for (const raw of [
    '{"version":2,"notes":[]}',
    '{"version":1,"activeId":null,"notes":[{}]}',
    '{"version":1,"activeId":null,"notes":[],"__proto__":{}}',
    "bad JSON",
  ]) {
    const preview = parseBackup(
      envelope({ notes: { [noteKey]: raw }, tasks: { [taskKey]: task } }),
    );
    expect(preview.snapshots[0].issue).not.toBe("");
    expect(preview.snapshots[1].issue).toBe("");
  }
  expect(() => parseBackup(" ".repeat(16 * 1024 * 1024 + 1))).toThrow(/16 MiB/);
  expect(
    validateRecord(
      taskKey,
      JSON.stringify({
        version: 1,
        tasks: [
          {
            id: "x",
            title: "Invalid date",
            details: "",
            stage: "todo",
            dueDate: "2026-02-30",
          },
        ],
      }),
    ),
  ).not.toBe("");
});

test("full and selected backups include only allowlisted records and preserve damaged originals", () => {
  const storage = memory({
    [noteKey]: "damaged",
    [taskKey]: task,
    "desktop-ghostty:v1": "secret",
    "theme-preference": "light",
    "desktop-notes:v1:recovery": "recovery",
  });
  const snapshots = readCategories(storage);
  const full = JSON.parse(createBackup(snapshots));
  expect(
    Object.values(full.categories).flatMap((value) =>
      Object.keys(value as object),
    ),
  ).toEqual(expect.arrayContaining([noteKey, taskKey]));
  expect(JSON.stringify(full)).not.toContain("secret");
  expect(JSON.stringify(full)).not.toContain("theme-preference");
  expect(JSON.stringify(full)).not.toContain("recovery");
  expect(full.categories.notes[noteKey]).toBe("damaged");
  const selected = JSON.parse(
    createBackup(snapshots.filter((item) => item.category.id === "tasks")),
  );
  expect(Object.keys(selected.categories)).toEqual(["tasks"]);
  expect(storage.getItem(noteKey)).toBe("damaged");
});

test("Library backup validation agrees with its canonical favorites and recent paths", () => {
  const library = {
    version: 1,
    folder: "all",
    query: "",
    view: "list",
    sort: "original",
    stars: ["/projects/clank"],
  };
  expect(validateRecord("desktop-library:v1", JSON.stringify(library))).toBe(
    "",
  );
  for (const path of [
    "/projects/clank/",
    "//example.com",
    "/x?query=1",
    "/x\\y",
  ]) {
    expect(
      validateRecord(
        "desktop-library:v1",
        JSON.stringify({ ...library, stars: [path] }),
      ),
    ).not.toBe("");
    expect(
      validateRecord(
        "desktop-library-recent:v1",
        JSON.stringify({ version: 1, paths: [path] }),
      ),
    ).not.toBe("");
  }
});

test("multi-category restore rolls back earlier writes when storage rejects a later write", () => {
  const storage = memory({
    [noteKey]: note("original"),
    [taskKey]: task,
    unrelated: "keep",
  });
  const incoming = parseBackup(
    envelope({
      notes: { [noteKey]: note("replacement") },
      tasks: { [taskKey]: JSON.stringify({ version: 1, tasks: [] }) },
    }),
  ).snapshots;
  const result = replaceCategories(
    {
      ...storage,
      setItem(key, value) {
        if (key === taskKey)
          throw new DOMException("Full", "QuotaExceededError");
        storage.setItem(key, value);
      },
    },
    incoming,
  );
  expect(result.ok).toBe(false);
  expect(result.message).toContain("Original records were restored");
  expect(storage.getItem(noteKey)).toBe(note("original"));
  expect(storage.getItem(taskKey)).toBe(task);
  expect(storage.getItem("unrelated")).toBe("keep");
  const damaged = inspectCategory(
    backupCategories.find((item) => item.id === "notes")!,
    { [noteKey]: "broken" },
  );
  expect(replaceCategories(storage, [damaged]).ok).toBe(false);
  expect(replaceCategories(storage, [damaged], true).ok).toBe(true);
  expect(storage.getItem(noteKey)).toBe(null);
});

test("unreadable storage prevents mutation and rollback failure is reported honestly", () => {
  const snapshots = parseBackup(
    envelope({ notes: { [noteKey]: note("new") }, tasks: {} }),
  ).snapshots;
  let writes = 0;
  const unavailable = {
    getItem: () => {
      throw new DOMException("Denied", "SecurityError");
    },
    setItem: () => {
      writes++;
    },
    removeItem: () => {
      writes++;
    },
  };
  expect(replaceCategories(unavailable, snapshots).message).toContain(
    "Nothing was changed",
  );
  expect(writes).toBe(0);
  expect(() => createBackup(readCategories(unavailable))).toThrow(
    "cannot be read",
  );
  const storage = memory({ [noteKey]: note("original"), [taskKey]: task });
  const result = replaceCategories(
    {
      ...storage,
      setItem(key, value) {
        if (value === note("original"))
          throw new DOMException("Still denied", "SecurityError");
        storage.setItem(key, value);
      },
      removeItem() {
        throw new DOMException("Denied", "SecurityError");
      },
    },
    snapshots,
  );
  expect(result.ok).toBe(false);
  expect(result.message).toContain("some originals could not be restored");
  expect(storage.getItem(noteKey)).toBe(note("new"));
  expect(storage.getItem(taskKey)).toBe(task);
});

test("Data Center downloads selected saved data, previews restore, and requires explicit confirmation", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, value, taskKey, task }) => {
      localStorage.setItem(key, value);
      localStorage.setItem(taskKey, task);
      localStorage.setItem("desktop-ghostty:v1", "keep-secret");
    },
    { key: noteKey, value: note("Original body"), taskKey, task },
  );
  const app = await openBackup(page);
  await app
    .getByRole("checkbox", { name: "Select Notes", exact: true })
    .check();
  const downloading = page.waitForEvent("download");
  await app
    .getByRole("button", { name: "Export selected", exact: true })
    .click();
  const download = await downloading;
  const parsed = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(Object.keys(parsed.categories)).toEqual(["notes"]);
  expect(parsed.categories.notes[noteKey]).toBe(note("Original body"));
  await app
    .getByRole("button", { name: "Import a backup", exact: true })
    .click();
  await app.locator("[data-backup-file]").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      envelope({ notes: { [noteKey]: note("Restored body") } }),
    ),
  });
  await expect(app.locator("[data-backup-status]")).toContainText(
    "Preview ready",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("Original body"),
  );
  await app
    .getByRole("checkbox", { name: "Restore Notes", exact: true })
    .check();
  await app
    .getByRole("button", { name: "Review selected restore…", exact: true })
    .click();
  const commit = app.getByRole("button", {
    name: "Restore selected and reload",
    exact: true,
  });
  await expect(commit).toBeDisabled();
  await app.getByRole("checkbox", { name: /I understand/ }).check();
  await Promise.all([page.waitForEvent("load"), commit.click()]);
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("Restored body"),
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), taskKey)).toBe(
    task,
  );
  expect(
    await page.evaluate(() => localStorage.getItem("desktop-ghostty:v1")),
  ).toBe("keep-secret");
});

test("incompatible categories stay disabled and malformed imports never overwrite current notes", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: noteKey,
    value: note("safe"),
  });
  const app = await upload(
    page,
    envelope({
      notes: { [noteKey]: '{"version":8}' },
      tasks: { [taskKey]: task },
    }),
  );
  await expect(
    app.getByRole("checkbox", { name: "Restore Notes", exact: true }),
  ).toBeDisabled();
  await expect(
    app.getByRole("checkbox", { name: "Restore Tasks", exact: true }),
  ).toBeEnabled();
  await app.locator("[data-backup-file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(envelope({ notes: { "other-site-key": "bad" } })),
  });
  await expect(app.locator("[data-backup-preview]")).toBeHidden();
  await expect(app.locator("[data-backup-status]")).toContainText(
    "unsupported category or storage key",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("safe"),
  );
});

test("malformed UTF-8 is rejected without silently replacing a note's text", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: noteKey,
    value: note("Original Unicode: café 🌿"),
  });
  const app = await upload(
    page,
    envelope({ notes: { [noteKey]: note("valid preview") } }),
  );
  await expect(app.locator("[data-backup-preview]")).toBeVisible();
  // A bad byte inside a JSON string still produces parseable JSON with File.text().
  const bytes = Buffer.from(envelope({ notes: { [noteKey]: note("marker") } }));
  bytes[bytes.indexOf("marker")] = 0xff;
  await app.locator("[data-backup-file]").setInputFiles({
    name: "corrupt.json",
    mimeType: "application/json",
    buffer: bytes,
  });
  await expect(app.locator("[data-backup-preview]")).toBeHidden();
  await expect(app.locator("[data-backup-status]")).toContainText(
    "not valid UTF-8",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("Original Unicode: café 🌿"),
  );
  // UTF-8 BOMs and escaped markup are valid data, displayed only as text.
  await app.locator("[data-backup-file]").setInputFiles({
    name: "unicode.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      `\ufeff${envelope({ notes: { [noteKey]: note('café 🌿 <img src=x onerror="alert(1)">') } })}`,
    ),
  });
  await expect(app.locator("[data-backup-status]")).toContainText(
    "Preview ready",
  );
  await expect(
    app.getByRole("checkbox", { name: "Restore Notes", exact: true }),
  ).toBeEnabled();
  await expect(app.locator("img")).toHaveCount(0);
});

test("a rejected browser write rolls back earlier categories and keeps the desktop usable", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(
    ({ noteKey, note, taskKey, task }) => {
      localStorage.setItem(noteKey, note);
      localStorage.setItem(taskKey, task);
      localStorage.setItem("unrelated", "preserve me");
    },
    { noteKey, note: note("original"), taskKey, task },
  );
  const replacementTasks = JSON.stringify({ version: 1, tasks: [] });
  const app = await upload(
    page,
    envelope({
      notes: { [noteKey]: note("replacement") },
      tasks: { [taskKey]: replacementTasks },
    }),
  );
  await app
    .getByRole("checkbox", { name: "Restore Notes", exact: true })
    .check();
  await app
    .getByRole("checkbox", { name: "Restore Tasks", exact: true })
    .check();
  await app
    .getByRole("button", { name: "Review selected restore…", exact: true })
    .click();
  await app.getByRole("checkbox", { name: /I understand/ }).check();
  await page.evaluate(
    ({ key, replacement }) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key && value === replacement) {
          Storage.prototype.setItem = original;
          throw new DOMException(
            "Simulated full storage",
            "QuotaExceededError",
          );
        }
        original.call(this, name, value);
      };
    },
    { key: taskKey, replacement: replacementTasks },
  );
  await app
    .getByRole("button", { name: "Restore selected and reload", exact: true })
    .click();
  await expect(app.locator("[data-backup-status]")).toContainText(
    "Original records were restored",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("original"),
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), taskKey)).toBe(
    task,
  );
  expect(await page.evaluate(() => localStorage.getItem("unrelated"))).toBe(
    "preserve me",
  );
  await app
    .getByRole("button", { name: "On this device", exact: true })
    .click();
  await app.getByRole("button", { name: "Refresh usage", exact: true }).click();
  await expect(app.locator("[data-backup-status]")).toContainText(
    "Storage usage refreshed",
  );
});

test("restored layout and desktops survive pagehide without the previous open windows overwriting them", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const placement = {
    left: "",
    top: "",
    width: "",
    height: "",
    minWidth: "",
    minHeight: "",
  };
  const layout = {
    "desktop-workspace:v1": JSON.stringify({
      version: 1,
      active: "calculator",
      windows: [
        { id: "calculator", minimized: false, placement },
        { id: "notes", minimized: true, placement },
      ],
    }),
    "desktop-spaces:v1": JSON.stringify({
      version: 1,
      active: "desk-review",
      spaces: [{ id: "desk-review", name: "Restored desktop" }],
      assignments: { calculator: "desk-review", notes: "desk-review" },
    }),
    "desktop-window-pins:v1": JSON.stringify({
      version: 1,
      keys: ["calculator"],
    }),
  };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: noteKey,
    value: note("still here"),
  });
  const app = await upload(page, envelope({ layout }));
  await app
    .getByRole("checkbox", { name: "Restore Windows & desktops", exact: true })
    .check();
  await app
    .getByRole("button", { name: "Review selected restore…", exact: true })
    .click();
  await app.getByRole("checkbox", { name: /I understand/ }).check();
  await Promise.all([
    page.waitForEvent("load"),
    app
      .getByRole("button", { name: "Restore selected and reload", exact: true })
      .click(),
  ]);
  await expect(page.locator('[data-window="calculator"]')).toBeVisible();
  await expect(page.locator('[data-window="calculator"]')).toHaveAttribute(
    "data-pinned",
    "true",
  );
  await expect(page.locator('[data-window="notes"]')).toBeHidden();
  await expect(page.locator('[data-window="backup"]')).toHaveCount(0);
  await expect(page.locator("[data-active-space-label]")).toHaveText(
    "Restored desktop",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("still here"),
  );
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("desktop-workspace:v1")!),
  );
  expect(saved.windows.map((item: { id: string }) => item.id).sort()).toEqual([
    "calculator",
    "notes",
  ]);
  expect(
    saved.windows.find((item: { id: string }) => item.id === "notes").minimized,
  ).toBe(true);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("desktop-window-pins:v1")!).keys,
    ),
  ).toEqual(["calculator"]);
});

test("selected reset closes active editors before removing data, reloads, and preserves other categories", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, value, taskKey, task }) => {
      localStorage.setItem(key, value);
      localStorage.setItem(taskKey, task);
    },
    { key: noteKey, value: note("Delete me"), taskKey, task },
  );
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="notes"]:visible').first().click();
  await expect(page.locator('[data-window="notes"] .notes-app')).toBeVisible();
  const app = await openBackup(page);
  await app
    .getByRole("checkbox", { name: "Select Notes", exact: true })
    .check();
  await app
    .getByRole("button", { name: "Reset selected…", exact: true })
    .click();
  await app.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    note("Delete me"),
  );
  await app
    .getByRole("button", { name: "Reset selected…", exact: true })
    .click();
  await app.getByRole("checkbox", { name: /I understand/ }).check();
  await Promise.all([
    page.waitForEvent("load"),
    app
      .getByRole("button", { name: "Reset selected and reload", exact: true })
      .click(),
  ]);
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    null,
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), taskKey)).toBe(
    task,
  );
});

test("Data Center fits 320px and both themes while leaving unreadable originals untouched", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  await page.evaluate(
    (key) => localStorage.setItem(key, "unreadable original"),
    noteKey,
  );
  const app = await openBackup(page);
  await expect(app.locator('[data-backup-category="notes"]')).toContainText(
    "Original text is preserved",
  );
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    expect(
      await app
        .locator(".backup-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await app.getByRole("button", { name: "Refresh usage", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), noteKey)).toBe(
    "unreadable original",
  );
});
