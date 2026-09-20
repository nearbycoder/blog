import { test, expect, type Page } from "@playwright/test";

const storageKey = "nearby-desktop-tasks-v1";
async function openTasks(page: Page) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="tasks"]').click();
  const app = page.locator('[data-window="tasks"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator(".tasks-app")).toBeVisible();
  return app;
}

test("tasks move between stages, filter correctly, and restore after deletion", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openTasks(page);
  await expect(
    app.getByRole("heading", { name: "A little plan goes a long way." }),
  ).toBeVisible();
  await app
    .getByRole("button", { name: "Add your first task", exact: true })
    .click();
  await app.getByRole("textbox", { name: "Task title" }).fill("Plan a walk");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(
    app.locator('[data-tasks-column="todo"] [data-task-id]'),
  ).toHaveCount(1);
  await app
    .getByRole("combobox", { name: "Stage for Plan a walk" })
    .selectOption("doing");
  await expect(
    app.locator('[data-tasks-column="doing"] [data-task-id]'),
  ).toHaveCount(1);
  await app.locator('[data-tasks-filter="todo"]').click();
  await expect(app.locator("[data-task-id]")).toHaveCount(0);
  await app.locator('[data-tasks-filter="doing"]').click();
  await app
    .getByRole("combobox", { name: "Stage for Plan a walk" })
    .selectOption("done");
  await expect(app.locator("[data-tasks-total]")).toHaveText("1 of 1 complete");
  await app.locator('[data-tasks-filter="done"]').click();
  await app
    .getByRole("button", { name: "Delete Plan a walk", exact: true })
    .click();
  await expect(app.locator("[data-task-id]")).toHaveCount(0);
  await app.getByRole("button", { name: "Undo delete", exact: true }).click();
  await expect(
    app.locator('[data-tasks-column="done"] [data-task-id]'),
  ).toHaveCount(1);
  await expect(app.locator("[data-tasks-total]")).toHaveText("1 of 1 complete");
});

test("task title, details, and stage edits persist after a reload", async ({
  page,
}) => {
  await page.goto("/desktop/");
  let app = await openTasks(page);
  await app.getByRole("button", { name: "+ New task", exact: true }).click();
  await app.getByRole("textbox", { name: "Task title" }).fill("Read a chapter");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await app
    .getByRole("button", { name: "Edit Read a chapter", exact: true })
    .click();
  await app
    .getByRole("textbox", { name: "Task title" })
    .fill("Read two chapters");
  const details =
    '<img src=x onerror="window.taskInjected=true">\nBring a notebook.';
  await app.getByRole("textbox", { name: "Details" }).fill(details);
  await app
    .getByRole("combobox", { name: "Stage", exact: true })
    .selectOption("doing");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.reload();
  app = await openTasks(page);
  await expect(
    app.getByRole("heading", { name: "Read two chapters", exact: true }),
  ).toBeVisible();
  await expect(
    app.locator('[data-tasks-column="doing"] .tasks-card-details'),
  ).toHaveText(details);
  await expect(app.locator("[data-tasks-status]")).toHaveText(
    "Saved on this device",
  );
  expect(await page.evaluate(() => "taskInjected" in window)).toBe(false);
});

test("empty titles are rejected and malformed saved data is preserved", async ({
  page,
}) => {
  const original = '{"version":1,"tasks":[{"title":"Important original"}]}';
  await page.goto("/desktop/");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: storageKey,
    value: original,
  });
  const app = await openTasks(page);
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "could not be read",
  );
  await app.getByRole("button", { name: "+ New task", exact: true }).click();
  await app.getByRole("textbox", { name: "Task title" }).fill("   ");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(app.getByRole("alert")).toHaveText(
    "Give this task a title before saving.",
  );
  await expect(
    app.getByRole("textbox", { name: "Task title" }),
  ).toHaveAttribute("aria-invalid", "true");
  await app.getByRole("textbox", { name: "Task title" }).fill("Session task");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(
    app.getByRole("heading", { name: "Session task", exact: true }),
  ).toBeVisible();
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "Changes stay in this session",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(original);
});

test("large escaped task details survive editing, saving, and reopening", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const details = "\u0001".repeat(2000);
  const tasks = Array.from({ length: 130 }, (_, index) => ({
    id: `escaped-${index}`,
    title: `Escaped task ${index}`,
    details,
    stage: "todo",
  }));
  const original = JSON.stringify({ version: 1, tasks });
  expect(original.length).toBeGreaterThan(1_500_000);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: storageKey,
    value: original,
  });
  let app = await openTasks(page);
  await expect(app.locator("[data-task-id]")).toHaveCount(130);
  await app
    .getByRole("button", { name: "Edit Escaped task 0", exact: true })
    .click();
  await expect(app.getByRole("textbox", { name: "Details" })).toHaveValue(
    details,
  );
  await app
    .getByRole("textbox", { name: "Task title" })
    .fill("Updated escaped task");
  await app.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "Saved on this device",
  );

  await page.reload();
  app = await openTasks(page);
  await expect(app.locator("[data-task-id]")).toHaveCount(130);
  await expect(
    app.getByRole("heading", { name: "Updated escaped task", exact: true }),
  ).toBeVisible();
  await expect(app.locator("[data-tasks-status]")).toHaveText(
    "Saved on this device",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(saved).toEqual({
    version: 1,
    tasks: tasks.map((task, index) =>
      index === 0 ? { ...task, title: "Updated escaped task" } : task,
    ),
  });
});

test("tasks remain usable without horizontal overflow at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  const app = await openTasks(page);
  await app.getByRole("button", { name: "+ New task", exact: true }).click();
  const title = app.getByRole("textbox", { name: "Task title" });
  await title.fill("A very long task title ".repeat(6));
  expect(
    await title.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(app.locator("[data-task-id]")).toHaveCount(1);
  expect(
    await app.evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(
    await app
      .locator(".tasks-board")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await app.locator("[data-task-stage]").selectOption("done");
  await expect(app.locator("[data-tasks-total]")).toHaveText("1 of 1 complete");
});

test("a full board retains keyboard focus after saving, cancelling, and undoing", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        tasks: Array.from({ length: 299 }, (_, index) => ({
          id: String(index),
          title: `Saved task ${index}`,
          details: "",
          stage: "todo",
        })),
      }),
    );
  }, storageKey);
  const app = await openTasks(page);
  const newTask = app.getByRole("button", { name: "+ New task", exact: true });
  const title = app.getByRole("textbox", { name: "Task title" });
  await newTask.click();
  await title.fill("Last available task");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  const edit = app.getByRole("button", {
    name: "Edit Last available task",
    exact: true,
  });
  await expect(newTask).toBeDisabled();
  await expect(edit).toBeFocused();
  await edit.click();
  await app.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(edit).toBeFocused();

  await app
    .getByRole("button", { name: "Delete Last available task", exact: true })
    .click();
  await newTask.click();
  await title.fill("Unfinished draft");
  await app.getByRole("button", { name: "Undo delete", exact: true }).click();
  await expect(title).toBeFocused();
  await expect(title).toHaveValue("Unfinished draft");
  await app.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(app.locator('[data-tasks-filter="all"]')).toBeFocused();
  await expect(app.locator("[data-task-id]")).toHaveCount(300);
});

test("a failed storage write keeps tasks usable and the next change retries saving", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const original = JSON.stringify({
    version: 1,
    tasks: [{ id: "saved", title: "Saved task", details: "", stage: "todo" }],
  });
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
      const setItem = Storage.prototype.setItem;
      let rejectNextWrite = true;
      Storage.prototype.setItem = function (storageKey, storageValue) {
        if (storageKey === key && rejectNextWrite) {
          rejectNextWrite = false;
          throw new DOMException("Storage is full", "QuotaExceededError");
        }
        return setItem.call(this, storageKey, storageValue);
      };
    },
    { key: storageKey, value: original },
  );
  const app = await openTasks(page);
  await app.getByRole("button", { name: "+ New task", exact: true }).click();
  await app.getByRole("textbox", { name: "Task title" }).fill("Session task");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(app.locator("[data-task-id]")).toHaveCount(2);
  await expect(app.locator("[data-tasks-status]")).toContainText("Not saved");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(original);
  await app
    .getByRole("combobox", { name: "Stage for Session task", exact: true })
    .selectOption("done");
  await expect(app.locator("[data-tasks-status]")).toContainText(
    "Saved on this device",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(saved.tasks).toHaveLength(2);
  expect(saved.tasks[1]).toMatchObject({
    title: "Session task",
    stage: "done",
  });
});
