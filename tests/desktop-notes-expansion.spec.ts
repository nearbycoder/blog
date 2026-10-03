import { test, expect, type Page, type Download } from "@playwright/test";

const storageKey = "desktop-notes:v1";
const original = {
  version: 1,
  activeId: "alpha",
  notes: [
    { id: "alpha", title: "Alpha", body: "A quiet garden", updatedAt: 1000 },
    { id: "beta", title: "Beta", body: "Train tickets", updatedAt: 2000 },
  ],
};

async function openNotes(page: Page, saved = JSON.stringify(original)) {
  await page.goto("/desktop/");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: storageKey,
    value: saved,
  });
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="notes"]').click();
  const notes = page.locator('[data-window="notes"]');
  await expect(notes).toBeVisible();
  return notes;
}

async function downloadText(download: Download) {
  const chunks: Buffer[] = [];
  for await (const chunk of (await download.createReadStream())!) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString();
}

test("search matches titles and bodies, pins persist, and duplicated notes are independent", async ({
  page,
}) => {
  const notes = await openNotes(page);
  const search = notes.getByRole("searchbox", { name: "Search notes" });
  await search.fill("GARDEN");
  await expect(notes.locator("[data-note-id]")).toHaveCount(1);
  await expect(notes.locator("[data-note-id]")).toHaveAttribute(
    "data-note-id",
    "alpha",
  );
  await search.fill("beta");
  await notes
    .getByRole("button", { name: "Open note: Beta", exact: true })
    .click();
  await notes.getByRole("button", { name: "Pin", exact: true }).click();
  await search.fill("missing");
  await expect(
    notes.getByText("No matching notes.", { exact: true }),
  ).toBeVisible();
  await search.fill("");
  await expect(notes.locator("[data-note-id]").first()).toHaveAttribute(
    "data-note-id",
    "beta",
  );
  await notes.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(
    notes.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Beta (copy)");
  await notes
    .getByRole("textbox", { name: "Note text", exact: true })
    .fill("Changed copy");
  await notes
    .getByRole("button", { name: "Open note: Beta", exact: true })
    .click();
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("Train tickets");
  await notes.locator('[data-window-action="close"]').click();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="notes"]').click();
  await expect(
    notes.getByRole("button", { name: "Unpin", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const book = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(book.notes).toHaveLength(3);
  expect(
    book.notes.find((note: { id: string }) => note.id === "beta").pinned,
  ).toBe(true);
  expect(new Set(book.notes.map((note: { id: string }) => note.id)).size).toBe(
    3,
  );
});

test("plain text imports safely and notebook export keeps all note fields", async ({
  page,
}) => {
  const notes = await openNotes(page);
  const contents = "<script>window.notesInjected = true</script>\nCoffee ☕\n";
  await notes.locator("[data-notes-text-file]").setInputFiles({
    name: "Travel.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(contents),
  });
  await expect(
    notes.getByRole("textbox", { name: "Note title", exact: true }),
  ).toHaveValue("Travel");
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue(contents);
  await notes.getByRole("button", { name: "Pin", exact: true }).click();
  await notes.locator("[data-notes-files] summary").click();
  const downloadPromise = page.waitForEvent("download");
  await notes
    .getByRole("button", { name: "Export notebook", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Notebook.json");
  const exported = JSON.parse(await downloadText(download));
  expect(exported.version).toBe(1);
  expect(exported.notes).toHaveLength(3);
  expect(exported.notes[0]).toMatchObject({
    title: "Travel",
    body: contents,
    pinned: true,
  });
  expect(exported.activeId).toBe(exported.notes[0].id);
  expect(await page.evaluate(() => "notesInjected" in window)).toBe(false);
});

test("backup preview can be canceled and merging preserves changed notes without duplicating repeats", async ({
  page,
}) => {
  const notes = await openNotes(page);
  const incoming = {
    version: 1,
    activeId: "alpha",
    notes: [
      original.notes[1],
      { ...original.notes[0], body: "An older garden draft" },
      {
        id: "gamma",
        title: "<img src=x onerror=alert(1)>",
        body: "New idea",
        updatedAt: 3000,
        pinned: true,
      },
    ],
  };
  const file = {
    name: "Notebook.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(incoming)),
  };
  await notes.locator("[data-notes-backup-file]").setInputFiles(file);
  await expect(
    notes.getByRole("region", { name: "Notebook import preview" }),
  ).toBeVisible();
  await expect(notes.locator("[data-notes-import-summary]")).toContainText(
    "2 new notes; 1 identical note skipped",
  );
  await expect(notes.locator("[data-notes-import-summary]")).toContainText(
    "both versions",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(JSON.stringify(original));
  await expect(notes.locator("[data-notes-import-titles] img")).toHaveCount(0);
  await notes
    .getByRole("button", { name: "Cancel import", exact: true })
    .click();
  await expect(notes.locator("[data-note-id]")).toHaveCount(2);
  await notes.locator("[data-notes-backup-file]").setInputFiles(file);
  await notes.getByRole("button", { name: "Merge notes", exact: true }).click();
  await expect(notes.locator("[data-note-id]")).toHaveCount(4);
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("A quiet garden");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(
    saved.notes.find((note: { id: string }) => note.id === "alpha").body,
  ).toBe("A quiet garden");
  expect(
    saved.notes.some(
      (note: { id: string; body: string }) =>
        note.id !== "alpha" && note.body === "An older garden draft",
    ),
  ).toBe(true);
  await notes.locator("[data-notes-backup-file]").setInputFiles(file);
  await expect(notes.locator("[data-notes-import-summary]")).toContainText(
    "0 new notes; 3 identical notes skipped",
  );
  await expect(
    notes.getByRole("button", { name: "Merge notes", exact: true }),
  ).toBeDisabled();
});

test("malformed and excessive imports never change stored notes", async ({
  page,
}) => {
  const notes = await openNotes(page);
  const invalid = [
    "not JSON",
    JSON.stringify({
      ...original,
      notes: [{ ...original.notes[0], pinned: "yes" }],
    }),
    JSON.stringify({
      ...original,
      notes: [original.notes[0], original.notes[0]],
    }),
    JSON.stringify({
      ...original,
      notes: [{ ...original.notes[0], body: "x".repeat(100_001) }],
    }),
    JSON.stringify({
      ...original,
      notes: Array.from({ length: 201 }, (_, index) => ({
        ...original.notes[0],
        id: String(index),
      })),
    }),
  ];
  for (const data of invalid) {
    await notes.locator("[data-notes-backup-file]").setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(data),
    });
    await expect(notes.locator("[data-notes-file-message]")).toContainText(
      "Import failed:",
    );
    await expect(notes.locator("[data-notes-import-preview]")).toBeHidden();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), storageKey),
    ).toBe(JSON.stringify(original));
  }
  await notes.locator("[data-notes-text-file]").setInputFiles({
    name: "large.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(400_001, "x"),
  });
  await expect(notes.locator("[data-notes-file-message]")).toContainText(
    "at most 400 KB",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(JSON.stringify(original));
});

test("a full notebook previews backups but never partially merges beyond its limit", async ({
  page,
}) => {
  const full = {
    ...original,
    notes: Array.from({ length: 200 }, (_, index) => ({
      id: `note-${index}`,
      title: `Note ${index}`,
      body: String(index),
      updatedAt: 1000,
    })),
  };
  const notes = await openNotes(page, JSON.stringify(full));
  await notes.locator("[data-notes-backup-file]").setInputFiles({
    name: "extra.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await expect(notes.locator("[data-notes-import-summary]")).toContainText(
    "Not enough space",
  );
  await expect(
    notes.getByRole("button", { name: "Merge notes", exact: true }),
  ).toBeDisabled();
  await expect(
    notes.getByRole("button", { name: "Duplicate", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(JSON.stringify(full));
});

test("backup merging preserves unreadable storage when its recovery write fails", async ({
  page,
}) => {
  const broken = '{"version":99,"notes":["original data"]}';
  const notes = await openNotes(page, broken);
  await page.evaluate((key) => {
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name.startsWith(key))
        throw new DOMException("Full", "QuotaExceededError");
      originalSet.call(this, name, value);
    };
  }, storageKey);
  await notes.locator("[data-notes-backup-file]").setInputFiles({
    name: "good.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await notes.getByRole("button", { name: "Merge notes", exact: true }).click();
  await expect(notes.locator("[data-notes-status]")).toContainText("Not saved");
  await expect(notes.locator("[data-note-id]")).toHaveCount(2);
  await expect(
    notes.getByRole("button", { name: "Download backup", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(broken);
});

test("undo keeps both versions when a backup restores the deleted note ID", async ({
  page,
}) => {
  const notes = await openNotes(page);
  await notes.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    notes.getByRole("button", { name: "Undo delete", exact: true }),
  ).toBeFocused();
  await notes.locator("[data-notes-backup-file]").setInputFiles({
    name: "older.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...original,
        notes: [{ ...original.notes[0], body: "An older garden" }],
      }),
    ),
  });
  await expect(
    notes.getByRole("button", { name: "Cancel import", exact: true }),
  ).toBeFocused();
  await notes.getByRole("button", { name: "Merge notes", exact: true }).click();
  await notes.getByRole("button", { name: "Undo delete", exact: true }).click();
  await expect(
    notes.getByRole("textbox", { name: "Note title", exact: true }),
  ).toBeFocused();
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("A quiet garden");
  const book = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(book.notes).toHaveLength(3);
  expect(new Set(book.notes.map((note: { id: string }) => note.id)).size).toBe(
    3,
  );
  expect(
    book.notes.find((note: { id: string }) => note.id === "alpha").body,
  ).toBe("An older garden");
  await page.reload();
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="notes"]').click();
  await expect(notes.locator("[data-note-id]")).toHaveCount(3);
  await expect(
    notes.getByRole("textbox", { name: "Note text", exact: true }),
  ).toHaveValue("A quiet garden");
});

test("invalid UTF-8 and binary text imports leave the notebook unchanged", async ({
  page,
}) => {
  const notes = await openNotes(page);
  for (const buffer of [
    Buffer.from([0xc3, 0x28]),
    Buffer.from("note\0binary"),
  ]) {
    await notes.locator("[data-notes-text-file]").setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer,
    });
    await expect(notes.locator("[data-notes-file-message]")).toContainText(
      "Import failed:",
    );
    expect(
      await page.evaluate((key) => localStorage.getItem(key), storageKey),
    ).toBe(JSON.stringify(original));
    await expect(notes.locator("[data-note-id]")).toHaveCount(2);
  }
});

test("expanded file controls and preview fit a 320px screen and remain reachable in a short window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const notes = await openNotes(page);
  const search = notes.getByRole("searchbox", { name: "Search notes" });
  expect(
    await search.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  await search.focus();
  await expect(search).toBeFocused();
  await notes.locator("[data-notes-files] summary").click();
  for (const name of ["Import text", "Export notebook", "Restore notebook"]) {
    const control = notes.getByRole("button", { name, exact: true });
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeInViewport();
  }
  await notes.locator("[data-notes-backup-file]").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...original,
        notes: [{ ...original.notes[0], id: "new", title: "A new note" }],
      }),
    ),
  });
  expect(
    await notes.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await notes.getByRole("button", { name: "Merge notes", exact: true }).click();
  await page.setViewportSize({ width: 1200, height: 900 });
  await notes.evaluate((element) => {
    element.style.width = "300px";
    element.style.height = "300px";
  });
  await notes.locator("[data-notes-files] summary").click();
  const restore = notes.getByRole("button", {
    name: "Restore notebook",
    exact: true,
  });
  await restore.scrollIntoViewIfNeeded();
  await expect(restore).toBeInViewport();
  const body = notes.getByRole("textbox", { name: "Note text", exact: true });
  await body.scrollIntoViewIfNeeded();
  await expect(body).toBeInViewport();
  expect(
    await notes.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});
