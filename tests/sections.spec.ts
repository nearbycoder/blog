import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { site } from "../src/data/site";

const normalize = (href: string) => href.replace(/\/$/, "") || "/";

test("every destination belongs to exactly one section", () => {
  const grouped = site.sections.flatMap((section) =>
    section.links.map((link) => normalize(link.href)),
  );
  expect(new Set(grouped).size).toBe(grouped.length);
  const destinations = [...site.nav, ...site.explore]
    .map((link) => normalize(link.href))
    .filter((href) => href !== "/desktop");
  expect(grouped.sort()).toEqual(destinations.sort());
});

test("section menus open one at a time and close on Escape or outside click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const read = nav.getByRole("button", { name: "Read" });
  const workshop = nav.getByRole("button", { name: "Workshop" });

  await read.click();
  await expect(read).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByRole("link", { name: /Start here/ })).toBeVisible();

  await workshop.click();
  await expect(read).toHaveAttribute("aria-expanded", "false");
  await expect(nav.getByRole("link", { name: /Start here/ })).toBeHidden();
  await expect(nav.getByRole("link", { name: /Postmortems/ })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(workshop).toHaveAttribute("aria-expanded", "false");
  await expect(workshop).toBeFocused();

  await workshop.click();
  await page.mouse.click(8, 780);
  await expect(workshop).toHaveAttribute("aria-expanded", "false");

  await workshop.click();
  await nav.getByRole("link", { name: /Layoff Log/ }).click();
  await expect(page).toHaveURL(/\/layoff\/?$/);
});

test("section pages show their siblings and mark where you are", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".section-nav")).toHaveCount(0);

  await page.goto("/topics/");
  const strip = page.getByRole("navigation", { name: "Read section" });
  await expect(strip.getByRole("link", { name: "Topics" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Read" }),
  ).toHaveAttribute("data-current", "true");

  await page.goto("/projects/agfs-dev/");
  const workshop = page.getByRole("navigation", { name: "Workshop section" });
  await expect(
    workshop.getByRole("link", { name: "Projects" }),
  ).toHaveAttribute("aria-current", "true");
  await workshop.getByRole("link", { name: "Postmortems" }).click();
  await expect(page).toHaveURL(/\/postmortems\/?$/);

  // Pages opened inside /desktop windows keep their chrome hidden.
  await page.evaluate(() => {
    document.documentElement.dataset.desktopReader = "true";
  });
  await expect(page.locator(".section-nav")).toBeHidden();
});

test("mobile menu groups destinations by section and stays accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/uses/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  for (const section of site.sections)
    await expect(menu).toContainText(`${section.number} · ${section.label}`);
  await expect(menu.getByRole("link", { name: "Uses" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, theme).toEqual([]);
  }
});

test("home page offers three ways in with live counts", async ({ page }) => {
  await page.goto("/");
  const doors = page.locator(".section-doors");
  await expect(doors.getByRole("heading", { level: 3 })).toHaveText([
    "Read",
    "Workshop",
    "About",
  ]);
  await expect(doors.locator(".door-facts").first()).toContainText(
    /\d+ stor(y|ies)/,
  );
  await doors.getByRole("link", { name: /Postmortems/ }).click();
  await expect(page).toHaveURL(/\/postmortems\/?$/);
});
