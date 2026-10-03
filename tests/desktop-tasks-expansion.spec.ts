import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";

const storageKey = "nearby-desktop-tasks-v1";
const legacyTask = {
  id: "legacy",
  title: "Existing task",
  details: "Book a meeting",
  stage: "todo",
};

async function openTasks(page: Page, tasks: object[] = [legacyTask]) {
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, tasks }) =>
      localStorage.setItem(key, JSON.stringify({ version: 1, tasks })),
    { key: storageKey, tasks },
  );
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  const app = page.locator('[data-window="tasks"]');
  await expect(app.locator(".tasks-app")).toBeVisible();
  return app;
}

async function importBackup(app: Locator, value: unknown) {
  await app.locator("[data-tasks-file]").setInputFiles({
    name: "tasks.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      typeof value === "string" ? value : JSON.stringify(value),
    ),
  });
}

async function savedTasks(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).tasks,
    storageKey,
  );
}

test("priority, due dates, and search combine with stages and persist", async ({
  page,
}) => {
  const app = await openTasks(page, [
    legacyTask,
    {
      id: "urgent",
      title: "Ship release",
      details: "Book a launch meeting",
      stage: "doing",
      priority: "high",
      dueDate: "2000-01-01",
    },
    {
      id: "done",
      title: "Finished meeting",
      details: "",
      stage: "done",
      priority: "low",
      dueDate: "2000-01-01",
    },
  ]);
  await expect(app.locator(".is-overdue")).toHaveCount(1);
  await app.getByRole("searchbox", { name: "Search tasks" }).fill("MEETING");
  await expect(app.locator("[data-task-id]")).toHaveCount(3);
  await app
    .getByRole("combobox", { name: "Priority", exact: true })
    .selectOption("high");
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  await app.locator('[data-tasks-filter="todo"]').click();
  await expect(app.locator("[data-tasks-results]")).toContainText(
    "No matching tasks",
  );
  await app.locator('[data-tasks-filter="doing"]').click();
  await app
    .getByRole("button", { name: "Edit Ship release", exact: true })
    .click();
  await app
    .getByRole("combobox", { name: "Priority", exact: true })
    .selectOption("low");
  await app.getByLabel("Due date").fill("2099-04-23");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(app.locator('.tasks-card [datetime="2099-04-23"]')).toHaveText(
    "Due 2099-04-23",
  );
  expect(
    (await savedTasks(page)).find(
      (task: { id: string }) => task.id === "urgent",
    ),
  ).toMatchObject({ priority: "low", dueDate: "2099-04-23" });
  await page.reload();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  await expect(app.locator('[data-task-id="urgent"]')).toContainText(
    "Low priority",
  );
  await expect(app.locator(".is-overdue")).toHaveCount(0);
});

test("legacy records retain their shape and metadata survives delete undo", async ({
  page,
}) => {
  const app = await openTasks(page);
  await app
    .getByRole("combobox", { name: "Priority", exact: true })
    .selectOption("normal");
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  await app
    .getByRole("button", { name: "Edit Existing task", exact: true })
    .click();
  await expect(
    app.getByRole("combobox", { name: "Priority", exact: true }),
  ).toHaveValue("normal");
  await expect(app.getByLabel("Due date")).toHaveValue("");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  expect(await savedTasks(page)).toEqual([legacyTask]);
  await app
    .getByRole("button", { name: "Edit Existing task", exact: true })
    .click();
  await app
    .getByRole("combobox", { name: "Priority", exact: true })
    .selectOption("high");
  await app.getByLabel("Due date").fill("2099-01-01");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  await app
    .getByRole("button", { name: "Delete Existing task", exact: true })
    .click();
  await app.getByRole("button", { name: "Undo delete", exact: true }).click();
  expect(await savedTasks(page)).toEqual([
    { ...legacyTask, priority: "high", dueDate: "2099-01-01" },
  ]);
  await app
    .getByRole("button", { name: "Edit Existing task", exact: true })
    .click();
  await app
    .getByRole("combobox", { name: "Priority", exact: true })
    .selectOption("normal");
  await app.getByLabel("Due date").fill("");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  expect(await savedTasks(page)).toEqual([legacyTask]);
});

test("exports include the whole board and CSV escapes formulas, quotes, commas, and newlines", async ({
  page,
}) => {
  const tasks = [
    legacyTask,
    {
      id: "=id",
      title: '=HYPERLINK("bad")',
      details: '  @formula, "quoted"\nsecond line',
      stage: "doing",
      priority: "high",
      dueDate: "2099-01-01",
    },
  ];
  const app = await openTasks(page, tasks);
  await app
    .getByRole("searchbox", { name: "Search tasks" })
    .fill("nothing matches");
  await app.locator(".tasks-data-menu summary").click();
  const jsonPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Export JSON", exact: true }).click();
  const json = await jsonPromise;
  expect(json.suggestedFilename()).toMatch(
    /^desktop-tasks-\d{4}-\d{2}-\d{2}\.json$/,
  );
  expect(JSON.parse(await readFile((await json.path())!, "utf8"))).toEqual({
    version: 1,
    tasks,
  });
  const csvPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = await csvPromise;
  const content = await readFile((await csv.path())!, "utf8");
  expect(content).toContain(
    '"ID","Title","Details","Stage","Priority","Due date"\r\n',
  );
  expect(content).toContain(
    '"legacy","Existing task","Book a meeting","todo","normal",""',
  );
  expect(content).toContain(
    '"\'=id","\'=HYPERLINK(""bad"")","\'  @formula, ""quoted""\nsecond line","doing","high","2099-01-01"',
  );
});

test("backup preview is inert, cancellation preserves data, and merge keeps existing IDs", async ({
  page,
}) => {
  const app = await openTasks(page);
  const newTask = {
    id: "new",
    title: '<img src=x onerror="window.taskInjected=true">',
    details: "Imported",
    stage: "done",
    priority: "low",
    dueDate: "2099-02-28",
  };
  const backup = {
    version: 1,
    tasks: [{ ...legacyTask, title: "Changed elsewhere" }, newTask],
  };
  await importBackup(app, backup);
  await expect(app.locator("[data-tasks-import-summary]")).toHaveText(
    "1 new tasks to add. 1 existing task IDs will be skipped.",
  );
  await expect(app.locator("[data-tasks-import-preview]")).toContainText(
    newTask.title,
  );
  expect(await savedTasks(page)).toEqual([legacyTask]);
  expect(await page.evaluate(() => "taskInjected" in window)).toBe(false);
  await app.getByRole("button", { name: "Cancel import", exact: true }).click();
  expect(await savedTasks(page)).toEqual([legacyTask]);
  await importBackup(app, backup);
  await app.getByRole("button", { name: "Merge tasks", exact: true }).click();
  expect(await savedTasks(page)).toEqual([legacyTask, newTask]);
  await importBackup(app, backup);
  await expect(
    app.getByRole("button", { name: "Merge tasks", exact: true }),
  ).toBeDisabled();
  await expect(app.locator("[data-tasks-import-summary]")).toContainText(
    "0 new tasks",
  );
});

test("invalid imports and capacity overflow leave the current board unchanged", async ({
  page,
}) => {
  const app = await openTasks(page);
  const invalid = [
    "{bad",
    { version: 2, tasks: [] },
    { version: 1, tasks: [legacyTask, legacyTask] },
    { version: 1, tasks: [{ ...legacyTask, priority: "urgent" }] },
    { version: 1, tasks: [{ ...legacyTask, dueDate: "2026-02-30" }] },
    { version: 1, tasks: [{ ...legacyTask, dueDate: "0000-01-01" }] },
    { version: 1, tasks: [{ ...legacyTask, dueDate: "2025-02-29" }] },
    { version: 1, tasks: [{ ...legacyTask, dueDate: "2026-01-01T00:00:00Z" }] },
    { version: 1, tasks: [{ ...legacyTask, title: "x".repeat(161) }] },
    { version: 1, tasks: [{ ...legacyTask, details: "x".repeat(2001) }] },
  ];
  for (const backup of invalid) {
    await importBackup(app, backup);
    await expect(app.locator("[data-tasks-status]")).toContainText(
      "Import failed",
    );
    await expect(app.locator("[data-tasks-import-panel]")).toBeHidden();
    expect(await savedTasks(page)).toEqual([legacyTask]);
  }
  await importBackup(app, {
    version: 1,
    tasks: Array.from({ length: 300 }, (_, index) => ({
      ...legacyTask,
      id: `import-${index}`,
    })),
  });
  await expect(app.locator("[data-tasks-import-capacity]")).toContainText(
    "exceeds the 300-task limit",
  );
  await expect(
    app.getByRole("button", { name: "Merge tasks", exact: true }),
  ).toBeDisabled();
  expect(await savedTasks(page)).toEqual([legacyTask]);
});

test("merging a deleted ID retires its undo and preserves a valid board after reload", async ({
  page,
}) => {
  const app = await openTasks(page);
  await app
    .getByRole("button", { name: "Delete Existing task", exact: true })
    .click();
  await expect(
    app.getByRole("button", { name: "Undo delete", exact: true }),
  ).toBeVisible();
  const restoredTask = {
    ...legacyTask,
    title: "Restored from backup",
    priority: "high",
  };
  await importBackup(app, { version: 1, tasks: [restoredTask] });
  await app.getByRole("button", { name: "Merge tasks", exact: true }).click();
  await expect(
    app.getByRole("button", { name: "Undo delete", exact: true }),
  ).toBeHidden();
  expect(await savedTasks(page)).toEqual([restoredTask]);
  await page.reload();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  await expect(app.locator("[data-tasks-status]")).toHaveText(
    "Saved on this device",
  );
});

test("closing Tasks during a file read cannot open a stale preview in a reopened window", async ({
  page,
}) => {
  const app = await openTasks(page);
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      return new Promise<string>((resolve, reject) => {
        Object.assign(window, {
          finishTaskImport: () => original.call(this).then(resolve, reject),
        });
      });
    };
  });
  await importBackup(app, {
    version: 1,
    tasks: [{ ...legacyTask, id: "late", title: "Late import" }],
  });
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "Reading task backup",
  );
  await app.getByRole("button", { name: "Close Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  await expect(app.locator(".tasks-app")).toBeVisible();
  await page.evaluate(async () => {
    await (
      window as unknown as { finishTaskImport: () => Promise<void> }
    ).finishTaskImport();
  });
  await expect(app.locator("[data-tasks-import-panel]")).toBeHidden();
  await expect(app.locator("[data-tasks-status]")).toHaveText(
    "Saved on this device",
  );
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  expect(await savedTasks(page)).toEqual([legacyTask]);
});

test("an import that exceeds browser storage remains usable and saves on the next change", async ({
  page,
}) => {
  const app = await openTasks(page);
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    let rejectNext = true;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && rejectNext) {
        rejectNext = false;
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      return original.call(this, name, value);
    };
  }, storageKey);
  const imported = { ...legacyTask, id: "imported", title: "Imported task" };
  await importBackup(app, { version: 1, tasks: [imported] });
  await app.getByRole("button", { name: "Merge tasks", exact: true }).click();
  await expect(app.locator("[data-tasks-status]")).toContainText("Not saved");
  await expect(app.locator("[data-task-id]")).toHaveCount(2);
  expect(await savedTasks(page)).toEqual([legacyTask]);
  await app
    .getByRole("combobox", { name: "Stage for Imported task", exact: true })
    .selectOption("done");
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "Saved on this device",
  );
  expect(await savedTasks(page)).toEqual([
    legacyTask,
    { ...imported, stage: "done" },
  ]);
});

test("import preserves malformed original storage and controls fit a 320px window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  const original = '{"version":1,"tasks":[{"title":"keep this original"}]}';
  await page.evaluate(
    ({ key, original }) => localStorage.setItem(key, original),
    { key: storageKey, original },
  );
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  const app = page.locator('[data-window="tasks"]');
  await expect(app.locator(".tasks-app")).toBeVisible();
  await importBackup(app, { version: 1, tasks: [legacyTask] });
  await app.getByRole("button", { name: "Merge tasks", exact: true }).click();
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "original data is unchanged",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(original);
  await app.locator(".tasks-data-menu summary").click();
  await expect(
    app.getByRole("button", { name: "Export JSON", exact: true }),
  ).toBeVisible();
  expect(
    await app
      .locator(".tasks-app")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await app.getByRole("button", { name: "+ New task", exact: true }).click();
  await app.getByLabel("Due date").fill("2099-01-01");
  expect(
    await app
      .locator(".tasks-editor")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
});
