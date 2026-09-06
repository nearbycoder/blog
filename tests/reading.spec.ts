import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { parseReadingState, READING_KEY } from "../src/lib/reading-storage";
const id = "gettting-started-with-react-and-vitejs";
const article = `/articles/${id}/`;

test("stored reading data rejects malformed input and unsafe IDs", () => {
  expect(Object.keys(parseReadingState("{broken"))).toHaveLength(0);
  expect(Object.keys(parseReadingState("[1,2]"))).toHaveLength(0);
  const raw = JSON.stringify({
    "../bad": { saved: true, heading: "x", completed: false, updated: 1 },
    good: { saved: true, heading: "x", completed: false, updated: 1 },
    wrong: { saved: "yes" },
  });
  expect(Object.keys(parseReadingState(raw))).toEqual(["good"]);
});

test("save, reload, resume, complete, remove, and clear reading history", async ({
  page,
}) => {
  await page.goto(article);
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Article saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("checkbox", { name: "Remember my place" }).check();
  await page
    .locator("#building-for-production")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect
    .poll(() =>
      page.evaluate(
        ([key, id]) => JSON.parse(localStorage.getItem(key)!)[id].heading,
        [READING_KEY, id],
      ),
    )
    .toBe("building-for-production");
  await expect(page.locator("#reading-resume")).toBeHidden();
  await page.goto("/reading-list/");
  await expect(page.locator("#saved-articles li")).toHaveCount(1);
  await expect(page.locator("#saved-articles")).toContainText("In progress");
  await expect(page.locator("#saved-articles h2 a")).toHaveAttribute(
    "href",
    `/articles/${id}#building-for-production`,
  );
  await page.goto(article);
  await expect(page.locator("#reading-resume")).toBeVisible();
  await expect(page.locator("#reading-resume a")).toContainText(
    "Building for Production",
  );
  await page.locator("#reading-resume a").click();
  await expect(page).toHaveURL(/#building-for-production$/);
  await page.getByRole("button", { name: "Mark as read", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Marked as read", exact: true }),
  ).toBeVisible();
  await page.goto("/reading-list/");
  await expect(page.locator("#saved-articles")).toContainText("Read");
  await expect(page.locator("#saved-articles h2 a")).toHaveAttribute(
    "href",
    `/articles/${id}`,
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.locator("#saved-articles button").click();
  await expect(page.locator("#reading-list-empty")).toBeVisible();
  await page.goto(article);
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await page.goto("/reading-list/");
  await page.getByRole("button", { name: "Clear saves & history" }).click();
  await expect(page.locator("#reading-list-status")).toContainText("cleared");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), READING_KEY),
  ).toBeNull();
});

test("code copy preserves exact contents and reports clipboard failure", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(article);
  const original = await page
    .locator(".article-content pre code")
    .first()
    .textContent();
  await page
    .getByRole("button", { name: "Copy code block 1", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    original,
  );
  await expect(page.locator(".code-copy-status").first()).toHaveText(
    "Code copied.",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: async () => {
        throw new Error("blocked");
      },
    }),
  );
  await page
    .getByRole("button", { name: "Copy code block 1", exact: true })
    .click();
  await expect(page.locator(".code-copy-status").first()).toContainText(
    "Clipboard unavailable",
  );
});

test("corrupt and blocked storage stays usable; unknown articles are not rendered", async ({
  page,
}) => {
  await page.goto("/reading-list/");
  await page.evaluate((key) => localStorage.setItem(key, "{bad"), READING_KEY);
  await page.reload();
  await expect(page.locator("#reading-list-empty")).toBeVisible();
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          "javascript-alert": {
            saved: true,
            heading: "javascript:alert(1)",
            completed: false,
            updated: 1,
          },
        }),
      ),
    READING_KEY,
  );
  await page.reload();
  await expect(page.locator("#saved-articles li")).toHaveCount(0);
  await page.goto(article);
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(page.locator("#reading-tool-status")).toContainText(
    "could not save",
  );
  await expect(
    page.getByRole("button", { name: "Save article", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("reading list responds to changes in another tab", async ({
  page,
  context,
}) => {
  await page.goto("/reading-list/");
  const reader = await context.newPage();
  await reader.goto(article);
  await reader
    .getByRole("button", { name: "Save article", exact: true })
    .click();
  await expect(page.locator("#saved-articles li")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear saves & history" }).click();
  await expect(
    reader.getByRole("button", { name: "Save article", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await reader.close();
});
