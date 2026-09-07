import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { chooseOption } from "./helpers/custom-select";

test("dropdown keyboard exploration cancels, commits, types ahead, and tabs onward", async ({
  page,
}) => {
  await page.goto("/articles/?sort=newest");
  const sort = page.getByRole("combobox", {
    name: "Sort articles",
    exact: true,
  });
  await sort.focus();
  await sort.press("ArrowDown");
  await sort.press("End");
  await expect(sort).toHaveText("Newest first");
  await expect(sort).toHaveAttribute(
    "aria-activedescendant",
    "article-sort-option-3",
  );
  await sort.press("Escape");
  await expect(sort).toBeFocused();
  await expect(sort).toHaveText("Newest first");
  await expect(sort).toHaveAttribute("aria-expanded", "false");
  await sort.press("Enter");
  await sort.press("ArrowDown");
  await sort.press("Enter");
  await expect(page).toHaveURL(/sort=oldest/);
  await sort.press("s");
  await sort.press("Tab");
  await expect(sort).toHaveText("Shortest first");
  await expect(sort).not.toBeFocused();
  await expect(page).toHaveURL(/sort=shortest/);
  await sort.focus();
  await sort.press("Home");
  await sort.press(" ");
  await expect(sort).toHaveText("Newest first");
  await expect(page).not.toHaveURL(/sort=/);
});

test("outside clicks cancel and only one custom dropdown can be open", async ({
  page,
}) => {
  await page.goto("/discover/");
  const topic = page.getByRole("combobox", { name: "Topic", exact: true });
  await topic.click();
  await topic.press("End");
  await page.getByRole("heading", { level: 1 }).click();
  await expect(topic).toHaveText("Any topic");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await topic.click();
  await page
    .getByRole("combobox", { name: "Time available", exact: true })
    .click();
  await expect(topic).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("listbox")).toHaveCount(1);
});

test("long lists type ahead, scroll to end, and preserve the selected checkmark", async ({
  page,
}) => {
  await page.goto("/feeds/");
  const choice = page.getByRole("combobox", { name: "Choose a feed" });
  await choice.focus();
  await choice.pressSequentially("typescript");
  const active = page.locator('#feed-choice [data-active="true"]');
  await expect(active).toHaveText("typescript");
  await choice.press("Enter");
  await expect(page.getByLabel("Feed address")).toHaveValue(
    "https://nearbycoder.com/feeds/typescript.xml",
  );
  await choice.click();
  await expect(
    page.getByRole("option", { name: "typescript", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await choice.press("End");
  const item = await active.boundingBox(),
    menu = await page.getByRole("listbox").boundingBox();
  expect(item!.y).toBeGreaterThanOrEqual(menu!.y);
  expect(item!.y + item!.height).toBeLessThanOrEqual(menu!.y + menu!.height);
  await choice.press("Home");
  await choice.press("PageDown");
  await expect(choice).toHaveAttribute(
    "aria-activedescendant",
    "feed-choice-option-10",
  );
  await choice.press("Escape");
  await expect(choice).toHaveText("typescript");
});

test("all dropdown surfaces are custom, labelled, and accessible in both themes", async ({
  page,
}) => {
  const routes = [
    ["/articles/", 2],
    ["/discover/", 2],
    ["/feeds/", 1],
    ["/articles/ai-has-changed-the-way-i-code/", 4],
    ["/lab/agent/", 1],
  ] as const;
  for (const [route, count] of routes) {
    await page.goto(route);
    await page
      .locator("details.reader-panel")
      .evaluateAll((nodes) =>
        nodes.forEach((node) => ((node as HTMLDetailsElement).open = true)),
      );
    await expect(page.locator("select")).toHaveCount(0);
    const controls = page.locator('custom-select [role="combobox"]');
    await expect(controls).toHaveCount(count);
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      for (const control of await controls.all()) {
        await control.click();
        await expect(control).toHaveAttribute("aria-expanded", "true");
        const result = await new AxeBuilder({ page })
          .include("custom-select")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(result.violations, route + " " + theme).toEqual([]);
        await control.press("Escape");
      }
    }
  }
});

test("menus fit narrow viewports, flip above low triggers, and support touch selection", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 640 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto("/feeds/");
    const trigger = page.getByRole("combobox", { name: "Choose a feed" });
    await trigger.tap();
    const menu = page.getByRole("listbox");
    const rect = await menu.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
    expect(rect!.y).toBeGreaterThanOrEqual(0);
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(640);
    await menu.getByRole("option", { name: "ai", exact: true }).tap();
    await expect(page.getByLabel("Feed address")).toHaveValue(
      "https://nearbycoder.com/feeds/ai.xml",
    );
    await page.goto("/articles/");
    const sort = page.getByRole("combobox", {
      name: "Sort articles",
      exact: true,
    });
    await sort.evaluate((element) =>
      window.scrollTo(
        0,
        element.getBoundingClientRect().bottom + scrollY - 600,
      ),
    );
    await sort.tap();
    const sortRect = await sort.boundingBox(),
      listRect = await page.getByRole("listbox").boundingBox();
    expect(listRect!.y + listRect!.height).toBeLessThan(sortRect!.y);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  } finally {
    await context.close();
  }
});

test("custom selections restore on history navigation and appearance updates from another tab", async ({
  page,
}) => {
  await page.goto("/articles/");
  await chooseOption(page, "Sort articles", "Oldest first");
  await page.goto("/feeds/");
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Sort articles", exact: true }),
  ).toHaveText("Oldest first");
  await page.goto("/articles/ai-has-changed-the-way-i-code/");
  await page.locator("#reader-preferences summary").click();
  const other = await page.context().newPage();
  await other.goto("/");
  await other.evaluate(() =>
    localStorage.setItem(
      "nearbycoder:appearance:v1",
      JSON.stringify({ size: "19", spacing: "2.1", width: "840" }),
    ),
  );
  await expect(
    page.getByRole("combobox", { name: "Text size", exact: true }),
  ).toHaveText("Large");
  await expect(
    page.getByRole("combobox", { name: "Line spacing", exact: true }),
  ).toHaveText("Roomy");
  await expect(page.locator(".article-content")).toHaveCSS("font-size", "19px");
  await other.close();
});
