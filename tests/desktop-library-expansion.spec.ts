import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const library = '[data-window="library"]';
async function openLibrary(page: Page) {
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(page.locator("[data-library-tools]")).toBeVisible();
}
async function names(page: Page) {
  return page
    .locator("[data-file]:visible [data-desktop-file]")
    .evaluateAll((items) =>
      items.map((item) => (item as HTMLElement).dataset.fileTitle!),
    );
}

test("Library sorts by name, type, and date in both directions without losing default order", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await openLibrary(page);
  const original = await names(page);
  const sort = page.getByRole("combobox", { name: "Sort files" });
  const compare = (a: string, b: string) =>
    a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
  await sort.selectOption("name-asc");
  expect(await names(page)).toEqual([...original].sort(compare));
  await sort.selectOption("name-desc");
  expect(await names(page)).toEqual(
    [...original].sort((a, b) => compare(b, a)),
  );
  for (const direction of ["asc", "desc"]) {
    await sort.selectOption(`kind-${direction}`);
    const types = await page
      .locator("[data-file]:visible .file-kind")
      .allTextContents();
    expect(types).toEqual(
      [...types].sort((a, b) => compare(a, b) * (direction === "asc" ? 1 : -1)),
    );
  }
  await page.locator('[data-folder="articles"]').click();
  for (const direction of ["asc", "desc"]) {
    await sort.selectOption(`date-${direction}`);
    const dates = await page
      .locator("[data-file]:visible .file-date")
      .allTextContents();
    expect(dates).toEqual(
      [...dates].sort(
        (a, b) => a.localeCompare(b) * (direction === "asc" ? 1 : -1),
      ),
    );
  }
  await page.locator('[data-folder="all"]').click();
  await sort.selectOption("original");
  expect(await names(page)).toEqual(original);
});

test("Favorites and Library view preferences survive closing and reloading", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await openLibrary(page);
  const first = page.locator("[data-file]:visible").first();
  const title = await first
    .locator("[data-desktop-file]")
    .getAttribute("data-file-title");
  await first.locator("[data-library-star]").click();
  await page.locator('[data-folder="favorites"]').click();
  await expect(page.locator("[data-file]:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Favorites");
  await page
    .getByRole("searchbox", { name: "Search desktop files" })
    .fill(title!);
  await page.getByRole("button", { name: "Icons view", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Sort files" })
    .selectOption("name-desc");
  await page
    .locator(library)
    .getByRole("button", { name: "Close Library", exact: true })
    .click();
  await page.waitForTimeout(250);
  await page.reload();
  await expect(page.locator(library)).toBeHidden();
  await expect(page.locator("[data-library-tools]")).toHaveCount(0);
  await openLibrary(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Favorites");
  await expect(
    page.getByRole("searchbox", { name: "Search desktop files" }),
  ).toHaveValue(title!);
  await expect(page.locator(".library-content")).toHaveAttribute(
    "data-view",
    "grid",
  );
  await expect(page.getByRole("combobox", { name: "Sort files" })).toHaveValue(
    "name-desc",
  );
  await expect(page.locator("[data-file]:visible")).toHaveCount(1);
  await page.locator("[data-file]:visible [data-library-star]").click();
  await expect(page.locator("[data-file]:visible")).toHaveCount(0);
});

test("Library records actual opens and clears recent history", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await openLibrary(page);
  const first = page.locator("[data-desktop-file]:visible").first();
  const title = await first.getAttribute("data-file-title");
  await first.click();
  await expect(page.locator(".reader-window")).toBeVisible();
  await openLibrary(page);
  await page.locator('[data-folder="recent"]').click();
  await expect(page.locator("[data-file]:visible")).toHaveCount(1);
  expect(await names(page)).toEqual([title]);
  await page
    .getByRole("button", { name: "Clear recent files", exact: true })
    .click();
  await expect(page.locator("[data-file]:visible")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("desktop-library-recent:v1")!).paths,
    ),
  ).toEqual([]);
});

test("Library Back and Forward restore folders and search, and a new location discards forward history", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await openLibrary(page);
  await page.locator('[data-folder="projects"]').click();
  await page
    .getByRole("searchbox", { name: "Search desktop files" })
    .fill("AGFS");
  await expect(page.locator("[data-file]:visible")).toHaveCount(1);
  const back = page.getByRole("button", { name: "Library Back", exact: true });
  const forward = page.getByRole("button", {
    name: "Library Forward",
    exact: true,
  });
  await back.click();
  await expect(
    page.getByRole("searchbox", { name: "Search desktop files" }),
  ).toHaveValue("");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await back.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All files");
  await forward.click();
  await forward.click();
  await expect(
    page.getByRole("searchbox", { name: "Search desktop files" }),
  ).toHaveValue("AGFS");
  await back.click();
  await page.locator('[data-folder="articles"]').click();
  await expect(forward).toBeDisabled();
});

test("File inspector exposes real metadata, copies links, and remains usable at 320px", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  await openLibrary(page);
  const first = page.locator("[data-file]:visible").first();
  const href = await first.locator("[data-desktop-file]").getAttribute("href");
  const title = await first
    .locator("[data-desktop-file]")
    .getAttribute("data-file-title");
  await first.locator("[data-library-inspect]").click();
  const details = page.getByRole("region", {
    name: "File details",
    exact: true,
  });
  await expect(details).toBeVisible();
  await expect(
    details.getByRole("heading", { name: title!, exact: true }),
  ).toBeVisible();
  await expect(details.getByRole("textbox", { name: "File link" })).toHaveValue(
    new URL(href!, page.url()).href,
  );
  await details.getByRole("button", { name: "Copy file link" }).click();
  await expect(
    details.getByText("Link copied.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    new URL(href!, page.url()).href,
  );
  const overflow = await page
    .locator(library)
    .evaluate(
      (win) =>
        win.scrollWidth > win.clientWidth + 1 ||
        [
          ...win.querySelectorAll<HTMLElement>(
            ".library-content, .library-details, .library-tools",
          ),
        ].some((item) => item.scrollWidth > item.clientWidth + 1),
    );
  expect(overflow).toBe(false);
  expect(
    (
      await new AxeBuilder({ page })
        .include(library)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await details.getByRole("button", { name: "Close file details" }).click();
  await expect(details).toBeHidden();
  await expect(first.locator("[data-library-inspect]")).toBeFocused();
});

test("Library preserves unreadable preference and history records during ordinary use", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(() => {
    localStorage.setItem(
      "desktop-library:v1",
      '{"version":999,"keep":"preferences"}',
    );
    localStorage.setItem(
      "desktop-library-recent:v1",
      '{"version":999,"keep":"history"}',
    );
  });
  await page.reload();
  await openLibrary(page);
  await expect(page.locator(".library-save-notice")).toContainText(
    "original is preserved",
  );
  await page.locator("[data-file]:visible [data-library-star]").first().click();
  await page.locator("[data-desktop-file]:visible").first().click();
  await openLibrary(page);
  await page.locator('[data-folder="recent"]').click();
  await page
    .getByRole("button", { name: "Clear recent files", exact: true })
    .click();
  expect(
    await page.evaluate(() => localStorage.getItem("desktop-library:v1")),
  ).toBe('{"version":999,"keep":"preferences"}');
  expect(
    await page.evaluate(() =>
      localStorage.getItem("desktop-library-recent:v1"),
    ),
  ).toBe('{"version":999,"keep":"history"}');
});

test("Library finishing its lazy load does not reopen a window closed while loading", async ({
  page,
}) => {
  let finishLoad!: () => void;
  const loading = new Promise<void>((resolve) => {
    finishLoad = resolve;
  });
  let requested = false;
  await page.route(
    /\/desktop-library\.(?:[^/?]+\.js|ts)(?:\?.*)?$/,
    async (route) => {
      requested = true;
      await loading;
      await route.continue();
    },
  );
  await page.goto("/desktop/");
  try {
    await page
      .getByRole("button", { name: "Open Library", exact: true })
      .click();
    await expect.poll(() => requested).toBe(true);
    await page
      .locator(library)
      .getByRole("button", { name: "Close Library", exact: true })
      .click();
    await expect(page.locator(library)).toBeHidden();
  } finally {
    finishLoad();
  }
  await expect(page.locator("[data-library-tools]")).toHaveCount(1);
  await expect(page.locator(library)).toBeHidden();
  await openLibrary(page);
});

for (const interaction of [
  "untouched",
  "search",
  "cleared search",
  "folder round trip",
  "view round trip",
] as const) {
  test(`Delayed Library tools preserve ${interaction} choices and restore only untouched defaults`, async ({
    page,
  }) => {
    let finishLoad!: () => void;
    const loading = new Promise<void>((resolve) => {
      finishLoad = resolve;
    });
    let requested = false;
    await page.route(
      /\/desktop-library\.(?:[^/?]+\.js|ts)(?:\?.*)?$/,
      async (route) => {
        requested = true;
        await loading;
        await route.continue();
      },
    );
    await page.goto("/desktop/");
    await page.evaluate(() =>
      localStorage.setItem(
        "desktop-library:v1",
        JSON.stringify({
          version: 1,
          folder: "projects",
          query: "saved query",
          view: "grid",
          sort: "original",
          stars: [],
        }),
      ),
    );
    const search = page.getByRole("searchbox", {
      name: "Search desktop files",
    });
    try {
      await page
        .getByRole("button", { name: "Open Library", exact: true })
        .click();
      await expect.poll(() => requested).toBe(true);
      if (interaction === "search" || interaction === "cleared search") {
        await search.fill("clank");
        if (interaction === "cleared search") await search.fill("");
      } else if (interaction === "folder round trip") {
        await page.locator('[data-folder="articles"]').click();
        await page.locator('[data-folder="all"]').click();
      } else if (interaction === "view round trip") {
        await page
          .getByRole("button", { name: "Icons view", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Details view", exact: true })
          .click();
      }
    } finally {
      finishLoad();
    }
    await expect(page.locator("[data-library-tools]")).toBeVisible();
    const changedLocation = [
      "search",
      "cleared search",
      "folder round trip",
    ].includes(interaction);
    const expectedFolder = changedLocation ? "all" : "projects";
    const expectedQuery =
      interaction === "search" ? "clank" : changedLocation ? "" : "saved query";
    const expectedView = interaction === "view round trip" ? "list" : "grid";
    const verifyChoices = async () => {
      await expect(search).toHaveValue(expectedQuery);
      await expect(
        page.locator(`[data-folder="${expectedFolder}"]`),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".library-content")).toHaveAttribute(
        "data-view",
        expectedView,
      );
    };
    await verifyChoices();
    // Choices made during the download must also become the next saved defaults.
    await page.reload();
    await openLibrary(page);
    await verifyChoices();
  });
}

test("Restoring Library tools does not take focus from the active reader window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/desktop/");
  await openLibrary(page);
  await page.locator("[data-desktop-file]:visible").first().click();
  await expect(page.locator(".reader-window")).toHaveClass(/is-active/);
  await page.waitForTimeout(250);
  await page.reload();
  await expect(page.locator("[data-library-tools]")).toHaveCount(1);
  await expect(page.locator(".reader-window")).toHaveClass(/is-active/);
  await expect(page.locator(library)).not.toHaveClass(/is-active/);
});

test("Library date sorting places undated files last and handles project years", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await openLibrary(page);
  for (const direction of ["asc", "desc"]) {
    await page
      .getByRole("combobox", { name: "Sort files" })
      .selectOption(`date-${direction}`);
    const details = await page
      .locator("[data-file] .file-date")
      .allTextContents();
    const dated = details.filter((detail) =>
      /^\d{4}(?:-\d{2}-\d{2})?$/.test(detail),
    );
    expect(dated.some((detail) => /^\d{4}$/.test(detail))).toBe(true);
    expect(dated.some((detail) => /^\d{4}-\d{2}-\d{2}$/.test(detail))).toBe(
      true,
    );
    expect(details.slice(0, dated.length)).toEqual(dated);
    const timestamps = dated.map((detail) => Date.parse(detail));
    expect(timestamps).toEqual(
      [...timestamps].sort((a, b) => (direction === "asc" ? a - b : b - a)),
    );
  }
});

test("Recent files remain bounded and reopening a file moves it to the front without duplication", async ({
  page,
}) => {
  await page.goto("/desktop/");
  await page.evaluate(() =>
    localStorage.setItem(
      "desktop-library-recent:v1",
      JSON.stringify({
        version: 1,
        paths: Array.from(
          { length: 80 },
          (_, index) => `/previous-file-${index}`,
        ),
      }),
    ),
  );
  await page.reload();
  await openLibrary(page);
  const first = page.locator("[data-desktop-file]:visible").first();
  const href = await first.getAttribute("href");
  await first.click();
  await openLibrary(page);
  await first.click();
  const paths: string[] = await page.evaluate(
    () => JSON.parse(localStorage.getItem("desktop-library-recent:v1")!).paths,
  );
  expect(paths).toHaveLength(80);
  expect(paths[0]).toBe(href!.replace(/\/+$/, ""));
  expect(paths[1]).toBe("/previous-file-0");
  expect(paths).not.toContain("/previous-file-79");
  expect(new Set(paths).size).toBe(paths.length);
});

test("File link copying falls back to a selected text field when clipboard access is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  await page.goto("/desktop/");
  await openLibrary(page);
  await page
    .locator("[data-file]:visible [data-library-inspect]")
    .first()
    .press("Enter");
  const details = page.getByRole("region", {
    name: "File details",
    exact: true,
  });
  await details.getByRole("button", { name: "Copy file link" }).click();
  await expect(
    details.getByText("Select and copy the link above."),
  ).toBeVisible();
  const field = details.getByRole("textbox", { name: "File link" });
  await expect(field).toBeFocused();
  expect(
    await field.evaluate((element: HTMLInputElement) =>
      element.value.slice(element.selectionStart!, element.selectionEnd!),
    ),
  ).toBe(await field.inputValue());
});
