import { test, expect } from "@playwright/test";

const addedProjects = [
  "hapless-wheels",
  "geowars",
  "lilipad",
  "rustfire",
  "rizzy",
  "smush-lol",
  "yeeet-dev",
  "haskellite",
  "clank-run",
  "nobo",
  "codex-grab",
  "touchgrass-city",
  "pong",
];

test("project archive contains each repository once and orders dated projects newest first", async ({
  page,
}) => {
  await page.goto("/projects/");
  const cards = page.locator(".project-card");
  const repositories = await cards
    .getByRole("link", { name: "Source", exact: true })
    .evaluateAll((links) =>
      links.map((link) => {
        const url = new URL((link as HTMLAnchorElement).href);
        return `${url.hostname}${url.pathname}`
          .toLowerCase()
          .replace(/(?:\.git)?\/$|\.git$/, "");
      }),
    );
  expect(repositories.length).toBeGreaterThan(addedProjects.length);
  expect(new Set(repositories).size).toBe(repositories.length);

  const entries = await cards.evaluateAll((items) =>
    items.map((item) => ({
      href: item.querySelector(".project-heading a")?.getAttribute("href"),
      date: item.querySelector("time")?.getAttribute("datetime") ?? "",
    })),
  );
  expect(entries.at(-1)?.href).toBe("/projects/easyaccessqr-com");
  const dated = entries
    .filter(
      (entry) => entry.href !== "/projects/easyaccessqr-com" && entry.date,
    )
    .map((entry) => entry.date);
  expect(dated).toEqual([...dated].sort().reverse());
  for (const slug of addedProjects) {
    const matches = entries.filter(
      (entry) => entry.href === `/projects/${slug}`,
    );
    expect(matches, slug).toHaveLength(1);
    expect(matches[0].date, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});

test("new project pages show creation dates and real media without mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const slug of addedProjects) {
    const response = await page.goto(`/projects/${slug}/`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("h1"), slug).toHaveCount(1);
    await expect(page.locator(".project-created"), slug).toContainText(
      "Repository created",
    );
    await expect(page.locator(".project-created time"), slug).toHaveAttribute(
      "datetime",
      /^\d{4}-\d{2}-\d{2}$/,
    );
    await expect(
      page.getByRole("link", { name: "View source" }),
      slug,
    ).toHaveAttribute("href", /^https:\/\/github\.com\/nearbycoder\//);

    const cover = page.locator(".reading-cover img");
    await expect(cover, slug).toHaveAttribute("alt", /\S/);
    await expect(cover, slug).toHaveAttribute("src", /^\/images\/projects\//);
    await expect
      .poll(
        () =>
          cover.evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
        { message: `${slug} cover image should load` },
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      `${slug} mobile overflow`,
    ).toBe(false);

    for (const video of await page.locator(".project-demos video").all()) {
      await expect(video).toHaveAttribute("controls", "");
      await expect(video).toHaveAttribute("preload", "none");
      await expect(video).toHaveAttribute("aria-label", /\S/);
      const description = await video.getAttribute("aria-describedby");
      await expect(page.locator(`[id="${description}"]`)).not.toBeEmpty();
      expect(
        await video.evaluate((element: HTMLVideoElement) => element.paused),
      ).toBe(true);
    }
  }
});
