import { test, expect } from "@playwright/test";
import { mergeReadingBackup } from "../src/lib/reading-backup";
test("backup merging refuses overflow without modifying existing data", () => {
  const reading = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [
      `story-${i}`,
      { saved: true, completed: false, heading: "", updated: i + 1 },
    ]),
  );
  const before = JSON.stringify(reading);
  expect(() =>
    mergeReadingBackup(
      {
        reading: {
          new: { saved: true, completed: false, heading: "", updated: 101 },
        },
        notes: {},
      },
      { reading, notes: {} },
    ),
  ).toThrow("100-entry");
  expect(JSON.stringify(reading)).toBe(before);
  const merged = mergeReadingBackup(
    {
      reading: {
        "story-99": { saved: false, completed: true, heading: "", updated: 1 },
      },
      notes: {},
    },
    { reading, notes: {} },
  );
  expect(merged.reading["story-99"].updated).toBe(100);
});
test("a full note store retains old notes and refuses a new one", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.evaluate(() =>
    localStorage.setItem(
      "nearbycoder:notes:v1",
      JSON.stringify(
        Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `story-${i}`,
            { text: "Keep note " + i, updated: i + 1 },
          ]),
        ),
      ),
    ),
  );
  await page.reload();
  await page.locator("#article-notes summary").click();
  await page
    .getByLabel("Notes about this article")
    .fill("The new unsaved note");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.locator("#note-status")).toContainText("could not save");
  expect(
    await page.evaluate(
      () =>
        Object.keys(JSON.parse(localStorage.getItem("nearbycoder:notes:v1")!))
          .length,
    ),
  ).toBe(100);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("nearbycoder:notes:v1")!)["story-0"]
          .text,
    ),
  ).toBe("Keep note 0");
  await expect(page.getByLabel("Notes about this article")).toHaveValue(
    "The new unsaved note",
  );
});
