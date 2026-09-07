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
