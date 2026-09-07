import { test, expect } from "@playwright/test";
test.use({ actionTimeout: 10000 });
test("topic directory counts published articles and article tags lead back to topic pages", async ({
  page,
}) => {
  await page.goto("/topics/");
  await page.locator('.topic-directory a[href="/topics/ai/"]').first().click();
  await expect(page.locator("h1")).toHaveText("ai");
  const count = await page.locator(".article-archive-grid > *").count();
  expect(count).toBeGreaterThan(1);
  await expect(page.locator(".page-intro")).toContainText(`${count} stories`);
  await page.locator(".article-archive-grid a.article-card").first().click();
  await page.locator('.reading-end a[href="/topics/ai/"]').click();
  await expect(page).toHaveURL(/\/topics\/ai\/$/);
});

test("date archive exposes each published article once and provides year anchors", async ({
  page,
  request,
}) => {
  await page.goto("/archive/");
  const feed = await (await request.get("/newsletter-feed.json")).json();
  await expect(page.locator(".archive-month li")).toHaveCount(feed.length);
  const dates = await page
    .locator(".archive-month time")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("datetime")!));
  expect(dates).toEqual([...dates].sort().reverse());
  await page
    .getByRole("navigation", { name: "Archive years" })
    .getByRole("link")
    .last()
    .click();
  await expect(page).toHaveURL(/#year-\d{4}$/);
});

test("reading budgets and sorting survive reload and clear together", async ({
  page,
}) => {
  await page.goto("/articles/?minutes=5&sort=shortest");
  await expect(
    page.getByRole("combobox", { name: "Reading time", exact: true }),
  ).toHaveValue("5");
  const minutes = await page
    .locator("[data-article]:visible")
    .evaluateAll((nodes) =>
      nodes.map((n) => Number((n as HTMLElement).dataset.minutes)),
    );
  expect(minutes.length).toBeGreaterThan(0);
  expect(minutes.every((n) => n <= 5)).toBe(true);
  expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
  await page
    .getByRole("combobox", { name: "Sort articles", exact: true })
    .selectOption("title");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Sort articles", exact: true }),
  ).toHaveValue("title");
  await page
    .getByRole("searchbox", { name: "Search articles" })
    .fill("nothing-found-xyz");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("combobox", { name: "Reading time", exact: true }),
  ).toHaveValue("0");
  await expect(page).not.toHaveURL(/\?/);
});

test("discovery respects time and topic choices and avoids repeats", async ({
  page,
}) => {
  await page.goto("/discover/");
  await page
    .getByRole("combobox", { name: "Topic", exact: true })
    .selectOption("ai");
  await page
    .getByRole("combobox", { name: "Time available", exact: true })
    .selectOption("10");
  await page.getByRole("button", { name: "Find a story", exact: true }).click();
  const first = await page.locator("#discover-link").getAttribute("href");
  await expect(page.locator("#discover-meta")).toContainText("ai");
  await page.getByRole("button", { name: "Find a story", exact: true }).click();
  expect(await page.locator("#discover-link").getAttribute("href")).not.toBe(
    first,
  );
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await expect(page.locator("#discover-result")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Find a story", exact: true }),
  ).toBeEnabled();
});

test("full-text search finds a body-only phrase and handles empty results and reload", async ({
  page,
  request,
}) => {
  const index = await (await request.get("/search-index.json")).json();
  const story = index.find((s: any) => s.text.length > 400);
  const phrase = story.text.split(/\s+/).slice(25, 29).join(" ");
  await page.goto("/search/");
  await page
    .getByRole("searchbox", { name: "Search article text" })
    .fill(phrase);
  await page
    .getByRole("button", { name: "Search writing", exact: true })
    .click();
  await expect(page.locator("#full-results")).toContainText(story.title);
  await page.reload();
  await expect(page.locator("#full-results")).toContainText(story.title);
  await page
    .getByRole("searchbox", { name: "Search article text" })
    .fill("zzzz-no-such-phrase-zzzz");
  await page
    .getByRole("button", { name: "Search writing", exact: true })
    .click();
  await expect(page.locator("#full-search-status")).toContainText(
    "No articles found",
  );
});

test("chronological neighbors link both ways and newest article has a boundary message", async ({
  page,
  request,
}) => {
  const feed = await (await request.get("/newsletter-feed.json")).json();
  feed.sort(
    (a: any, b: any) =>
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
      b.id.localeCompare(a.id),
  );
  await page.goto(`/articles/${feed[0].id}/`);
  const nav = page.getByRole("navigation", {
    name: "Chronological article navigation",
  });
  await expect(nav).toContainText("newest story");
  await nav.locator("a[rel=prev]").click();
  await expect(page).toHaveURL(new RegExp(feed[1].id));
  await page.locator(".adjacent-articles a[rel=next]").click();
  await expect(page).toHaveURL(new RegExp(feed[0].id));
});

test("reading appearance persists, resets, and rejects corrupt storage", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator("#reader-preferences summary").click();
  await page
    .getByRole("combobox", { name: "Text size", exact: true })
    .selectOption("21");
  await page
    .getByRole("combobox", { name: "Reading width", exact: true })
    .selectOption("600");
  await expect(page.locator(".article-content")).toHaveCSS("font-size", "21px");
  await page.reload();
  await expect(page.locator(".article-content")).toHaveCSS("font-size", "21px");
  await page.locator("#reader-preferences summary").click();
  await page
    .getByRole("button", { name: "Reset appearance", exact: true })
    .click();
  await expect(page.locator(".article-content")).toHaveCSS("font-size", "17px");
  await page.evaluate(() =>
    localStorage.setItem("nearbycoder:appearance:v1", "null"),
  );
  await page.reload();
  await expect(page.locator(".article-content")).toHaveCSS("font-size", "17px");
});

test("focus mode hides distractions and Escape restores the article controls", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  const button = page.getByRole("button", {
    name: "Enter focus mode",
    exact: true,
  });
  await button.click();
  await expect(page.locator(".reading-sidebar")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator(".article-content")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(page.locator(".reading-sidebar")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-reading-focus",
    "",
  );
});

test("print edition retains article and source while hiding interactive chrome", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".reading-header .deck")).toHaveCSS(
    "color",
    "rgb(51, 51, 51)",
  );
  await expect(page.locator(".print-attribution")).toBeVisible();
  await expect(page.locator(".print-attribution")).toContainText(
    "https://nearbycoder.com/articles/ai-has-changed-the-way-i-code/",
  );
  await expect(page.locator(".article-content")).toBeVisible();
  await expect(page.locator(".reading-sidebar")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator(".article-utilities")).toBeHidden();
});

test("Markdown download contains the complete published body and canonical source", async ({
  page,
  request,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator(".article-utilities summary").click();
  const link = page.getByRole("link", {
    name: "Download Markdown",
    exact: true,
  });
  await expect(link).toHaveAttribute(
    "download",
    "ai-has-changed-the-way-i-code.md",
  );
  const response = await request.get((await link.getAttribute("href"))!);
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain("# AI has changed the way I code");
  expect(text).toContain(
    "Source: https://nearbycoder.com/articles/ai-has-changed-the-way-i-code/",
  );
  expect(text.length).toBeGreaterThan(1000);
});

test("citations switch formats, copy exactly and offer a manual fallback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator(".article-utilities summary").click();
  await page
    .getByRole("combobox", { name: "Citation format", exact: true })
    .selectOption("bibtex");
  await expect(
    page.getByLabel("Article citation", { exact: true }),
  ).toHaveValue(/@misc/);
  await page
    .getByRole("button", { name: "Copy citation", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await page.getByLabel("Article citation", { exact: true }).inputValue(),
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: async () => {
        throw Error("blocked");
      },
    }),
  );
  await page
    .getByRole("button", { name: "Copy citation", exact: true })
    .click();
  await expect(page.locator("#citation-status")).toContainText(
    "manual copying",
  );
  await expect(
    page.getByLabel("Article citation", { exact: true }),
  ).toBeFocused();
});

test("article image viewer opens, supports Escape and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/articles/building-soloagent-to-understand-ai-harnesses/");
  const button = page.getByRole("button", { name: /Enlarge image 1:/ });
  await button.click();
  await expect(
    page.getByRole("dialog", { name: "Article image", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#image-viewer-image")).toHaveJSProperty(
    "complete",
    true,
  );
  await expect(page.locator("#image-viewer-status")).toContainText(
    "Image 1 of",
  );
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(page.locator("#article-image-dialog")).not.toBeVisible();
});

test("private notes persist only when saved, render as text and can be deleted", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator("#article-notes summary").click();
  await page
    .getByLabel("Notes about this article")
    .fill("<img src=x onerror=alert(1)> A private thought");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.reload();
  await page.locator("#article-notes summary").click();
  await expect(page.getByLabel("Notes about this article")).toHaveValue(
    "<img src=x onerror=alert(1)> A private thought",
  );
  await expect(page.locator("#article-notes img")).toHaveCount(0);
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await expect(page.getByLabel("Notes about this article")).toHaveValue("");
});

test("a failed private-note save preserves the unsaved text and reports the problem", async ({
  page,
}) => {
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator("#article-notes summary").click();
  await page
    .getByLabel("Notes about this article")
    .fill("Keep this text if storage fails.");
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw Error("blocked");
      },
    }),
  );
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.locator("#note-status")).toContainText("could not save");
  await expect(page.getByLabel("Notes about this article")).toHaveValue(
    "Keep this text if storage fails.",
  );
});

test("reading backup validates, previews and merges only supported content", async ({
  page,
}) => {
  await page.goto("/reading-list/");
  await page.locator("#reading-backup summary").click();
  const upload = page.getByLabel("Choose a reading backup");
  await upload.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.locator("#backup-status")).toContainText("version 1");
  await expect(
    page.getByRole("button", { name: "Merge reviewed backup", exact: true }),
  ).toBeDisabled();
  const id = "ai-has-changed-the-way-i-code";
  await upload.setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        reading: {
          [id]: {
            saved: true,
            completed: false,
            heading: "evil-anchor",
            updated: 1,
          },
          unknown: { saved: true, completed: false, heading: "", updated: 1 },
        },
        notes: { [id]: { text: "Imported private note", updated: 1 } },
      }),
    ),
  });
  await expect(page.locator("#backup-status")).toContainText(
    "Nothing has changed yet",
  );
  await expect(page.locator("#saved-articles li")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Merge reviewed backup", exact: true })
    .click();
  await expect(page.locator("#saved-articles li")).toHaveCount(1);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("nearbycoder:reading:v1")!)[
          "ai-has-changed-the-way-i-code"
        ].heading,
    ),
  ).toBe("");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "nearbycoder-reading-backup.json",
  );
});

test("reading statistics count local completion without inventing tracked time", async ({
  page,
}) => {
  await page.goto("/reading-list/");
  await expect(page.locator("#stat-completed")).toHaveText("0");
  await page.evaluate(() => {
    localStorage.setItem(
      "nearbycoder:reading:v1",
      JSON.stringify({
        "ai-has-changed-the-way-i-code": {
          saved: true,
          completed: true,
          heading: "",
          updated: 1,
        },
        unknown: { saved: true, completed: true, heading: "", updated: 1 },
      }),
    );
    window.dispatchEvent(new CustomEvent("readingchange"));
  });
  await expect(page.locator("#stat-completed")).toHaveText("1");
  expect(
    Number(await page.locator("#stat-minutes").innerText()),
  ).toBeGreaterThan(0);
  await expect(page.locator("#stat-unread")).toHaveText("0");
  await expect(page.locator(".reading-stats")).toContainText(
    "not tracked time",
  );
  await page
    .getByRole("button", { name: "Clear saves & history", exact: true })
    .click();
  await expect(page.locator("#stat-completed")).toHaveText("0");
});

test("reading queue reorders saved unread articles and persists its order", async ({
  page,
}) => {
  await page.goto("/reading-list/");
  await page.evaluate(() => {
    const entry = { saved: true, completed: false, heading: "", updated: 1 };
    localStorage.setItem(
      "nearbycoder:reading:v1",
      JSON.stringify({
        "ai-has-changed-the-way-i-code": entry,
        "building-soloagent-to-understand-ai-harnesses": entry,
      }),
    );
    window.dispatchEvent(new CustomEvent("readingchange"));
  });
  await page.locator("#reading-queue summary").click();
  const links = page.locator("#reading-queue-items li > a");
  const first = await links.first().getAttribute("href");
  await page
    .locator("#reading-queue-items li")
    .first()
    .getByRole("button", { name: /Move down:/ })
    .click();
  expect(await links.last().getAttribute("href")).toBe(first);
  await page.reload();
  await page.locator("#reading-queue summary").click();
  expect(await links.last().getAttribute("href")).toBe(first);
});

test("glossary filters definitions and keeps permanent links to terms and stories", async ({
  page,
}) => {
  await page.goto("/glossary/");
  await page
    .getByRole("searchbox", { name: "Find a term" })
    .fill("idempotency");
  await expect(page.locator(".glossary-entry:visible")).toHaveCount(1);
  await page.locator("#idempotency h2 a").click();
  await expect(page).toHaveURL(/#idempotency$/);
  await page
    .getByRole("searchbox", { name: "Find a term" })
    .fill("unfindable-xyz");
  await expect(page.locator("#glossary-status")).toContainText(
    "No matching terms",
  );
});

test("technology directory leads to real project collections", async ({
  page,
}) => {
  await page.goto("/technologies/");
  await page
    .locator('.topic-directory a[href="/technologies/typescript/"]')
    .click();
  await expect(page.locator("h1")).toHaveText("TypeScript");
  expect(await page.locator(".project-grid > *").count()).toBeGreaterThan(1);
  await expect(page.locator(".page-intro")).toContainText(
    "projects using this technology",
  );
});

test("project stack labels connect back to technology collections", async ({
  page,
}) => {
  await page.goto("/projects/agfs-dev/");
  await page.locator('a.chip[href="/technologies/typescript/"]').click();
  await expect(page).toHaveURL(/\/technologies\/typescript\/$/);
});

test("keyboard help is discoverable, input-safe, and enables opt-in navigation", async ({
  page,
}) => {
  await page.goto("/articles/");
  await page.getByRole("searchbox", { name: "Search articles" }).fill("?");
  await expect(page.locator("#keyboard-help")).not.toBeVisible();
  await page.locator("h1").click();
  await page.keyboard.press("?");
  await expect(page.locator("#keyboard-help")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Keyboard shortcuts", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Keyboard shortcuts", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Enable ? and Alt shortcuts" })
    .check();
  await page
    .getByRole("button", { name: "Close shortcuts", exact: true })
    .click();
  await page.getByRole("searchbox", { name: "Search articles" }).focus();
  const editingUrl = page.url();
  await page.keyboard.press("Alt+r");
  await expect(page).toHaveURL(editingUrl);
  await page.locator("h1").click();
  await page.keyboard.press("?");
  await expect(page.locator("#keyboard-help")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Alt+r");
  await expect(page).toHaveURL(/\/reading-list\/$/);
  await page
    .getByRole("button", { name: "Keyboard shortcuts", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Keyboard shortcuts", exact: true }),
  ).toBeFocused();
});
