import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const key = "desktop-spaces:v1";
const win = (page: Page, id: string) => page.locator(`[data-window="${id}"]`);
const card = (page: Page, name: string) =>
  win(page, "workspaces").getByRole("article", {
    name: `${name} desktop`,
    exact: true,
  });
async function open(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("/desktop/");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
}
async function launch(page: Page, id: string) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  await expect(win(page, id)).toBeVisible();
  await expect(win(page, id).locator(".utility-loading")).toHaveCount(0);
  return win(page, id);
}
async function create(page: Page, name: string) {
  await win(page, "workspaces").getByLabel("New desktop name").fill(name);
  await win(page, "workspaces")
    .getByRole("button", { name: "Create desktop", exact: true })
    .click();
  await expect(card(page, name)).toBeVisible();
}
async function switchTo(page: Page, name: string) {
  await card(page, name)
    .getByRole("button", { name: `Switch to ${name}`, exact: true })
    .click();
  await expect(page.locator("[data-active-space-label]")).toHaveText(name);
}

// Real window isolation, browser reload, keyboard operation, and storage failures
// are the risky boundary here; the existing workspace schema stays unchanged.
test("desktops isolate windows and tasks, preserve minimization, and restore after reload", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  const json = await launch(page, "json");
  await json
    .getByRole("button", { name: "Minimize JSON Desk", exact: true })
    .click();
  await launch(page, "workspaces");
  await create(page, "Reading");
  await switchTo(page, "Reading");
  await expect(win(page, "notes")).toBeHidden();
  await expect(win(page, "json")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Show Notes", exact: true }),
  ).toBeHidden();
  await expect(win(page, "workspaces")).toBeVisible();
  await launch(page, "calculator");
  await page
    .getByRole("button", { name: "Show Workspaces", exact: true })
    .click();
  await switchTo(page, "Desk 1");
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "json")).toBeHidden();
  await expect(win(page, "calculator")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Show JSON Desk", exact: true }),
  ).toBeVisible();
  await switchTo(page, "Reading");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("desktop-workspace:v1") ?? "{}",
          ).windows?.find((item: { id: string }) => item.id === "notes")
            ?.minimized,
      ),
    )
    .toBe(false);
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.reload();
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
  await expect(page.locator("[data-active-space-label]")).toHaveText("Reading");
  await expect(win(page, "calculator")).toBeVisible();
  await expect(win(page, "calculator").locator(".utility-loading")).toHaveCount(
    0,
  );
  await expect(win(page, "notes")).toBeHidden();
  expect(
    requested.some((url) => /\/desktop-notes(?:[.-]|\.ts)/.test(url)),
  ).toBe(false);
  await switchTo(page, "Desk 1");
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "notes").locator(".notes-app")).toBeVisible();
  expect(
    requested.some((url) => /\/desktop-notes(?:[.-]|\.ts)/.test(url)),
  ).toBe(true);
  await expect(win(page, "json")).toBeHidden();
});

test("rename, move, and remove keep the manager and app data available", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "workspaces");
  await create(page, "Reading");
  await card(page, "Reading").getByLabel("Name for Reading").fill("Research");
  await card(page, "Reading")
    .getByRole("button", { name: "Rename", exact: true })
    .click();
  const researchId = await card(page, "Research").getAttribute(
    "data-space-card",
  );
  await win(page, "workspaces")
    .getByLabel("Desktop for Notes")
    .selectOption(researchId!);
  await expect(win(page, "notes")).toBeHidden();
  await switchTo(page, "Research");
  await expect(win(page, "notes")).toBeVisible();
  await card(page, "Research")
    .getByRole("button", { name: "Remove desktop", exact: true })
    .click();
  await card(page, "Research")
    .getByRole("button", { name: "Remove and move windows", exact: true })
    .click();
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "workspaces")).toBeVisible();
  await expect(
    card(page, "Desk 1").getByRole("button", {
      name: "Remove desktop",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    win(page, "workspaces").getByLabel("Desktop for Notes"),
  ).toHaveValue("desk-1");
});

test("shortcuts switch desktops and move the active app without resetting it", async ({
  page,
}) => {
  await open(page);
  await launch(page, "notes");
  await launch(page, "workspaces");
  await create(page, "Play");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await page.keyboard.press("Control+Alt+Shift+PageDown");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Play");
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "notes")).toHaveClass(/is-active/);
  await page.keyboard.press("Control+Alt+PageUp");
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(win(page, "notes")).toBeHidden();
  await page.keyboard.press("Control+Alt+PageDown");
  await expect(win(page, "notes")).toBeVisible();
  await expect(win(page, "notes")).toHaveCount(1);
});

for (const raw of [
  "{broken",
  JSON.stringify({ version: 7, spaces: [] }),
  JSON.stringify({
    version: 1,
    active: "desk-1",
    spaces: [{ id: "desk-1", name: "Desk 1" }],
    assignments: [],
  }),
]) {
  test(`unreadable desktop data survives ordinary changes: ${raw.slice(0, 28)}`, async ({
    page,
  }) => {
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key,
      raw,
    });
    await open(page);
    await launch(page, "workspaces");
    await create(page, "Temporary");
    await switchTo(page, "Temporary");
    await expect(
      win(page, "workspaces").locator("[data-spaces-status]"),
    ).toContainText("original is preserved");
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
      raw,
    );
  });
}

test("desktop manager remains usable and accessible at 320 pixels", async ({
  page,
}) => {
  await open(page, 320);
  await launch(page, "workspaces");
  await create(page, "A very long but readable desktop name");
  await switchTo(page, "A very long but readable desktop name");
  const overflow = await win(page, "workspaces").evaluate(
    (root) =>
      [
        ...root.querySelectorAll<HTMLElement>(
          ".workspaces-app, .spaces-card, .spaces-create",
        ),
      ].filter((element) => element.scrollWidth > element.clientWidth + 1)
        .length,
  );
  expect(overflow).toBe(0);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-window="workspaces"]')
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("closing the Library from another desktop does not reopen it when returning", async ({
  page,
}) => {
  await open(page);
  await page.locator("[data-show-library]").click();
  await launch(page, "workspaces");
  await create(page, "Reading");
  await switchTo(page, "Reading");
  await launch(page, "windows");
  await expect(win(page, "library")).toHaveAttribute(
    "data-space-hidden",
    "true",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("desktop-workspace:v1") ?? "{}",
          ).windows?.find((item: { id: string }) => item.id === "library")
            ?.minimized,
      ),
    )
    .toBe(false);
  await win(page, "windows")
    .locator('[data-overview-window="library"] [data-overview-close]')
    .click();
  await page
    .getByRole("button", { name: "Show Workspaces", exact: true })
    .click();
  await switchTo(page, "Desk 1");
  await expect(win(page, "library")).toBeHidden();
  await win(page, "workspaces")
    .getByRole("button", { name: "Close Workspaces", exact: true })
    .click();
  await expect(win(page, "library")).toBeHidden();
  await page.locator("[data-show-library]").click();
  await expect(win(page, "library")).toBeVisible();
});

test("capacity, canceled removal, and renamed desktops survive reload without changing note text", async ({
  page,
}) => {
  await open(page);
  const notes = await launch(page, "notes");
  await notes.locator("[data-notes-new]").first().click();
  await notes
    .getByLabel("Note text", { exact: true })
    .fill("Keep this draft through every desktop change.");
  await launch(page, "workspaces");
  for (let index = 2; index <= 8; index++) await create(page, `Desk ${index}`);
  await expect(
    win(page, "workspaces").getByRole("button", {
      name: "Create desktop",
      exact: true,
    }),
  ).toBeDisabled();
  await card(page, "Desk 8")
    .getByRole("button", { name: "Remove desktop", exact: true })
    .click();
  await card(page, "Desk 8")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(
    win(page, "workspaces").locator("[data-space-card]"),
  ).toHaveCount(8);
  await expect(
    card(page, "Desk 8").getByRole("button", {
      name: "Remove desktop",
      exact: true,
    }),
  ).toBeFocused();
  await card(page, "Desk 8").getByLabel("Name for Desk 8").fill("Writing");
  await card(page, "Desk 8")
    .getByRole("button", { name: "Rename", exact: true })
    .click();
  const writingId = await card(page, "Writing").getAttribute("data-space-card");
  await win(page, "workspaces")
    .getByLabel("Desktop for Notes")
    .selectOption(writingId!);
  await switchTo(page, "Writing");
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes.getByLabel("Note text", { exact: true })).toHaveValue(
    "Keep this draft through every desktop change.",
  );
  await page.reload();
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-workspace-ready",
    "true",
  );
  await expect(page.locator("[data-active-space-label]")).toHaveText("Writing");
  await expect(notes.getByLabel("Note text", { exact: true })).toHaveValue(
    "Keep this draft through every desktop change.",
  );
  await page
    .getByRole("button", { name: "Show Workspaces", exact: true })
    .click();
  await expect(
    win(page, "workspaces").locator("[data-space-card]"),
  ).toHaveCount(8);
  await card(page, "Writing")
    .getByRole("button", { name: "Remove desktop", exact: true })
    .click();
  await card(page, "Writing")
    .getByRole("button", { name: "Remove and move windows", exact: true })
    .click();
  await expect(page.locator("[data-active-space-label]")).toHaveText("Desk 1");
  await expect(
    win(page, "workspaces").getByRole("button", {
      name: "Create desktop",
      exact: true,
    }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes.getByLabel("Note text", { exact: true })).toHaveValue(
    "Keep this draft through every desktop change.",
  );
});

test("a minimized app stays minimized after its desktop is removed", async ({
  page,
}) => {
  await open(page);
  await launch(page, "workspaces");
  await create(page, "Reading");
  await switchTo(page, "Reading");
  const notes = await launch(page, "notes");
  await notes
    .getByRole("button", { name: "Minimize Notes", exact: true })
    .click();
  await card(page, "Reading")
    .getByRole("button", { name: "Remove desktop", exact: true })
    .click();
  await card(page, "Reading")
    .getByRole("button", { name: "Remove and move windows", exact: true })
    .click();
  await expect(notes).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Show Notes", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  await expect(notes).toBeVisible();
  await expect(notes).toHaveAttribute("data-space", "desk-1");
});

test("storage failure keeps desktop changes usable for the current visit", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Storage is full", "QuotaExceededError");
      return original.call(this, name, value);
    };
  }, key);
  await open(page);
  await launch(page, "workspaces");
  await create(page, "Temporary work");
  await switchTo(page, "Temporary work");
  await expect(
    win(page, "workspaces").locator("[data-spaces-status]"),
  ).toContainText("Changes last for this visit");
  const notes = await launch(page, "notes");
  await expect(notes).toBeVisible();
  await page
    .getByRole("button", { name: "Show Workspaces", exact: true })
    .click();
  await switchTo(page, "Desk 1");
  await expect(notes).toBeHidden();
  await switchTo(page, "Temporary work");
  await expect(notes).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
});
