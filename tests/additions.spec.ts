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

test('date archive exposes each published article once and provides year anchors',async({page,request})=>{
 await page.goto('/archive/'); const feed=await (await request.get('/newsletter-feed.json')).json();
 await expect(page.locator('.archive-month li')).toHaveCount(feed.length);
 const dates=await page.locator('.archive-month time').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('datetime')!));
 expect(dates).toEqual([...dates].sort().reverse());
 await page.getByRole('navigation',{name:'Archive years'}).getByRole('link').last().click();await expect(page).toHaveURL(/#year-\d{4}$/);
});

test('reading budgets and sorting survive reload and clear together',async({page})=>{
 await page.goto('/articles/?minutes=5&sort=shortest');
 await expect(page.getByRole('combobox',{name:'Reading time',exact:true})).toHaveValue('5');
 const minutes=await page.locator('[data-article]:visible').evaluateAll(nodes=>nodes.map(n=>Number((n as HTMLElement).dataset.minutes)));
 expect(minutes.length).toBeGreaterThan(0);expect(minutes.every(n=>n<=5)).toBe(true);expect(minutes).toEqual([...minutes].sort((a,b)=>a-b));
 await page.getByRole('combobox',{name:'Sort articles',exact:true}).selectOption('title');await page.reload();await expect(page.getByRole('combobox',{name:'Sort articles',exact:true})).toHaveValue('title');
 await page.getByRole('searchbox',{name:'Search articles'}).fill('nothing-found-xyz');await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.getByRole('combobox',{name:'Reading time',exact:true})).toHaveValue('0');await expect(page).not.toHaveURL(/\?/);
});
