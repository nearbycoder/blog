import { test, expect } from "@playwright/test";
test.use({ actionTimeout: 10000 });
test("topic directory counts published articles and article tags lead back to topic pages", async ({
  page,
}) => {
  await page.goto("/topics/");
  await page
    .locator('.topic-directory a[href="/topics/ai/"]')
    .first()
    .click();
  await expect(page.locator("h1")).toHaveText("ai");
  const count = await page.locator(".article-archive-grid > *").count();
  expect(count).toBeGreaterThan(1);
  await expect(page.locator(".page-intro")).toContainText(`${count} stories`);
  await page.locator(".article-archive-grid a.article-card").first().click();
  await page.locator(".reading-end a.chip").filter({ hasText: /^ai$/ }).click();
  await expect(page).toHaveURL(/\/topics\/ai\/$/);
});
