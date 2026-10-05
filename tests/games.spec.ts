import { test, expect } from "@playwright/test";

// Games published on October 4, 2026, each with README screenshots and a trailer.
const newGames = [
  "jeste",
  "lost-and-found",
  "one-more-floor",
  "last-light",
  "purgatory",
  "pack-the-trunk",
  "pocket-weather",
  "borrowed-seconds",
  "bell-of-ages",
  "after-hours",
  "alibi-and-co",
  "agent-clicker",
  "handle-with-care",
  "gravewake",
  "cinderwake",
];
// Games that used to live in the projects archive.
const movedGames = [
  "flip-flop-cheer",
  "hapless-wheels",
  "geowars",
  "ghostpath-space",
  "pong",
  "roomba-wars",
  "touchgrass-city",
  "math-game",
];

test("games have their own archive, and projects no longer list them", async ({
  page,
}) => {
  await page.goto("/games/");
  await expect(page.locator("h1")).toHaveCount(1);
  const hrefs = await page
    .locator(".project-card .project-heading a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(hrefs.length);
  for (const slug of [...newGames, ...movedGames])
    expect(hrefs, slug).toContain(`/games/${slug}`);
  // Newest repository first, to the second, so same-day games stay in order.
  const created = await page
    .locator(".project-card time")
    .evaluateAll((times) => times.map((time) => time.getAttribute("datetime")));
  expect(created).toHaveLength(hrefs.length);
  expect(created).toEqual(
    [...created].sort((a, b) => Date.parse(b!) - Date.parse(a!)),
  );
  expect(hrefs[0]).toBe("/games/jeste");

  await page.goto("/projects/");
  const projectHrefs = await page
    .locator(".project-card .project-heading a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const slug of [...newGames, ...movedGames])
    expect(projectHrefs, slug).not.toContain(`/projects/${slug}`);
  expect(projectHrefs.every((href) => href?.startsWith("/projects/"))).toBe(
    true,
  );
});

test("game pages show details, real screenshots, and user-started trailers without mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const slug of [...newGames, ...movedGames]) {
    const response = await page.goto(`/games/${slug}/`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("h1"), slug).toHaveCount(1);
    await expect(page.locator(".game-facts"), slug).toContainText("Genre");
    await expect(
      page.getByRole("link", { name: "← All games" }),
      slug,
    ).toHaveAttribute("href", "/games");
    await expect(
      page.getByRole("link", { name: "View source" }),
      slug,
    ).toHaveAttribute("href", /^https:\/\/github\.com\/nearbycoder\//);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      `${slug} mobile overflow`,
    ).toBe(false);
    if (!newGames.includes(slug)) continue;

    const cover = page.locator(".reading-cover img");
    await expect(cover, slug).toHaveAttribute("src", /^\/images\/games\//);
    await expect(cover, slug).toHaveAttribute("alt", /\S/);
    const images = page.locator(".reading-cover img, .article-content img");
    expect(await images.count(), slug).toBeGreaterThanOrEqual(5);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute("alt", /\S/);
      await expect
        .poll(
          () =>
            image.evaluate(
              (element: HTMLImageElement) =>
                element.complete && element.naturalWidth > 0,
            ),
          { message: `${slug} image ${await image.getAttribute("src")}` },
        )
        .toBe(true);
    }

    const video = page.locator(".project-demos video");
    await expect(video, slug).toHaveCount(1);
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).toHaveAttribute("src", /^\/videos\/games\/.+\.mp4$/);
    await expect(video).toHaveAttribute("poster", /^\/images\/games\//);
    expect(
      await video.evaluate((element: HTMLVideoElement) => element.paused),
    ).toBe(true);
    await expect(
      page.locator(".project-demos figcaption a"),
      slug,
    ).toHaveAttribute("href", /^https:\/\/github\.com\/nearbycoder\//);
    await expect(
      page.getByRole("link", { name: "Watch the trailer" }),
    ).toHaveAttribute("href", "#project-demos-heading");
  }
});

test("trailers are served as playable MP4 files", async ({ request }) => {
  for (const slug of newGames) {
    const response = await request.get(`/videos/games/${slug}-trailer.mp4`, {
      headers: { Range: "bytes=0-15" },
    });
    expect(response.ok(), slug).toBe(true);
    // An MP4 starts with an ftyp box after its 4-byte size.
    expect((await response.body()).subarray(4, 8).toString(), slug).toBe(
      "ftyp",
    );
  }
});

test("games appear in navigation, section doors, technologies, and search", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".section-doors")).toContainText(/\d+ games/);
  await page.goto("/projects/agfs-dev/");
  const workshop = page.getByRole("navigation", { name: "Workshop section" });
  await workshop.getByRole("link", { name: "Games" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);

  await page.goto("/technologies/unity-6/");
  await expect(page.locator(".page-intro")).toContainText("games");
  await expect(page.locator("#technology-games")).toHaveText("Games");
  await expect(
    page.locator('a[href="/games/pocket-weather"]').first(),
  ).toBeVisible();

  await page.goto("/technologies/c-sharp/");
  await expect(page.locator("h1")).toHaveText("C#");

  await page.getByRole("button", { name: "Open search" }).click();
  await page.getByRole("combobox").fill("Borrowed Seconds");
  await expect(page.getByRole("option").first()).toContainText("Game");
});

test("lab and postmortem links follow Roomba Wars to its game page", async ({
  page,
}) => {
  await page.goto("/lab/roomba/");
  await expect(
    page.getByRole("link", { name: "Explore Roomba Wars →" }),
  ).toHaveAttribute("href", "/games/roomba-wars");
  await page.goto("/postmortems/roomba-wars/");
  await expect(
    page.getByRole("link", { name: "Explore Roomba Wars →" }),
  ).toHaveAttribute("href", "/games/roomba-wars");
});
