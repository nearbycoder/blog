import { test, expect, type Page } from "@playwright/test";

const windowSelector = '[data-window="notes"]';
const storageKey = "desktop-notes:v1";

async function openNotes(page: Page) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="notes"]').click();
  const notes = page.locator(windowSelector);
  await expect(notes).toBeVisible();
  return notes;
}

test("notes are editable, selectable, and persist through window close and page reload", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const notes = await openNotes(page);
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Weekend ideas");
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Walk by the lake\nBuild a tiny desktop app");
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Reading list");
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("A book worth keeping");
  await notes
    .getByRole("button", { name: "Open note: Weekend ideas", exact: true })
    .click();
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Walk by the lake\nBuild a tiny desktop app");
  await notes.locator('[data-window-action="close"]').click();
  await openNotes(page);
  await expect(
    notes.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Weekend ideas");
  await page.reload();
  await openNotes(page);
  await expect(notes.locator("[data-note-id]")).toHaveCount(2);
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Walk by the lake\nBuild a tiny desktop app");
  await expect(notes.locator("[data-notes-status]")).toHaveText(
    "Saved on this device",
  );
});

test("delete can be undone and download preserves the note as plain text", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const notes = await openNotes(page);
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Recipe");
  const contents =
    "<script>window.unwanted = true</script>\nOne cup of coffee ☕";
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill(contents);
  await notes.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(notes.locator("[data-note-id]")).toHaveCount(0);
  await expect(
    notes.getByRole("heading", { name: "A little space to think." }),
  ).toBeVisible();
  await notes.getByRole("button", { name: "Undo delete", exact: true }).click();
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue(contents);
  const downloadPromise = page.waitForEvent("download");
  await notes.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Recipe.txt");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(`Recipe\n\n${contents}\n`);
  expect(await page.evaluate(() => "unwanted" in window)).toBe(false);
});

test("unreadable saved data is backed up before new notes replace it", async ({
  page,
}) => {
  const original = '{"version":99,"notes":[{"title":"Keep the original"}]}';
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, original }) => localStorage.setItem(key, original),
    { key: storageKey, original },
  );
  const notes = await openNotes(page);
  await expect(notes.locator("[data-notes-status]")).toContainText(
    "could not be read",
  );
  const downloadPromise = page.waitForEvent("download");
  await notes
    .getByRole("button", { name: "Download backup", exact: true })
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(original);
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Fresh start");
  const saved = await page.evaluate(
    (key) => ({
      backup: localStorage.getItem(`${key}:recovery`),
      notebook: JSON.parse(localStorage.getItem(key)!),
    }),
    storageKey,
  );
  expect(saved.backup).toBe(original);
  expect(saved.notebook.notes[0].title).toBe("Fresh start");
  await page.reload();
  await openNotes(page);
  await expect(
    notes.getByRole("button", { name: "Download backup", exact: true }),
  ).toBeVisible();
  await expect(
    notes.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Fresh start");
});

test("notes preserve unreadable original data if a recovery backup cannot be saved", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({ version: 1, notes: [{ id: "broken", body: 100 }] }),
    );
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name.startsWith(key))
        throw new DOMException("Storage full", "QuotaExceededError");
      setItem.call(this, name, value);
    };
  }, storageKey);
  await page.goto("/desktop/");
  const notes = await openNotes(page);
  await expect(notes.locator("[data-notes-status]")).toContainText(
    "could not be read",
  );
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Keep this locally");
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Still editable when storage is blocked");
  await expect(notes.locator("[data-notes-status]")).toContainText("Not saved");
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Still editable when storage is blocked");
  await expect(
    notes.getByRole("button", { name: "Download", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(JSON.stringify({ version: 1, notes: [{ id: "broken", body: 100 }] }));
  await expect(
    notes.getByRole("button", { name: "Download backup", exact: true }),
  ).toBeVisible();
});

test("mobile note inputs avoid focus zoom and content remains inside the window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/desktop/");
  const notes = await openNotes(page);
  await notes.getByRole("button", { name: "+ New note", exact: true }).click();
  await notes
    .getByRole("textbox", { name: "Note title", exact: true })
    .fill("Pocket notes");
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Writing on a small screen");
  for (const field of ["Note title", "Note text"]) {
    expect(
      await notes
        .getByRole("textbox", { name: field, exact: true })
        .evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).fontSize),
        ),
    ).toBeGreaterThanOrEqual(16);
  }
  expect(
    await notes.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});
