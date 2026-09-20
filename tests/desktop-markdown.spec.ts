import { test, expect, type Page } from "@playwright/test";

const storageKey = "nearby-desktop-markdown-v1";
async function openMarkdown(page: Page) {
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="markdown"]').click();
  const app = page.locator('[data-window="markdown"]');
  await expect(app).toBeVisible();
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  return app;
}

test("Markdown preview formats the supported subset and keeps unsafe content literal", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openMarkdown(page);
  await app
    .getByRole("textbox", { name: "Markdown source" })
    .fill(
      [
        "# Field notes",
        "",
        "**Strong** and *gentle* with `inline code`.",
        "",
        "- First item",
        "- Second item",
        "",
        "3. Numbered item",
        "",
        "[Safe link](https://example.com/notes)",
        "",
        '<img src=x onerror="window.markdownUnsafe=true">',
        "<script>window.markdownUnsafe=true</script>",
        "[Unsafe](javascript:alert(1)) [Data](data:text/html,unsafe)",
        "",
        "```html",
        "<button>literal code</button>",
        "```",
      ].join("\n"),
    );
  await app.getByRole("button", { name: "Preview", exact: true }).click();
  const preview = app.getByRole("region", { name: "Rendered Markdown" });
  await expect(
    preview.getByRole("heading", { name: "Field notes" }),
  ).toBeVisible();
  await expect(preview.locator("strong")).toHaveText("Strong");
  await expect(preview.locator("em")).toHaveText("gentle");
  await expect(preview.locator("ul li")).toHaveCount(2);
  await expect(preview.locator("ol")).toHaveAttribute("start", "3");
  await expect(preview.locator("pre code")).toHaveText(
    "<button>literal code</button>",
  );
  await expect(preview.getByRole("link")).toHaveCount(1);
  await expect(
    preview.getByRole("link", { name: "Safe link" }),
  ).toHaveAttribute("href", "https://example.com/notes");
  await expect(preview.locator("img, script, button")).toHaveCount(0);
  await expect(preview).toContainText(
    '<img src=x onerror="window.markdownUnsafe=true">',
  );
  expect(await page.evaluate(() => "markdownUnsafe" in window)).toBe(false);
});

test("drafts persist, download verbatim, and require confirmation before clearing", async ({
  page,
}) => {
  await page.goto("/desktop/");
  let app = await openMarkdown(page);
  const text = "# Weekend\n\nA small idea.";
  await app.getByRole("textbox", { name: "Markdown source" }).fill(text);
  await expect(app.locator("[data-markdown-count]")).toHaveText("4 words");
  await expect(app.locator("[data-markdown-status]")).toHaveText(
    "Saved in this browser",
  );
  await page.reload();
  app = await openMarkdown(page);
  await expect(
    app.getByRole("textbox", { name: "Markdown source" }),
  ).toHaveValue(text);
  const downloadPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Download .md" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Weekend.md");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(text);
  page.once("dialog", (dialog) => dialog.dismiss());
  await app.getByRole("button", { name: "Clear draft" }).click();
  await expect(
    app.getByRole("textbox", { name: "Markdown source" }),
  ).toHaveValue(text);
  page.once("dialog", (dialog) => dialog.accept());
  await app.getByRole("button", { name: "Clear draft" }).click();
  await expect(
    app.getByRole("textbox", { name: "Markdown source" }),
  ).toHaveValue("");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).text,
      storageKey,
    ),
  ).toBe("");
});

test("invalid saved drafts are preserved and failed storage writes keep the editor usable", async ({
  page,
}) => {
  const original = '{"version":99,"text":"Keep my original"}';
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, original }) => localStorage.setItem(key, original),
    { key: storageKey, original },
  );
  const app = await openMarkdown(page);
  await expect(app.locator("[data-markdown-status]")).toContainText(
    "unreadable",
  );
  await app
    .getByRole("textbox", { name: "Markdown source" })
    .fill("A replacement draft");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(original);
  await expect(
    app.getByRole("button", { name: "Download saved data" }),
  ).toBeVisible();
  await page.evaluate((key) => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Full", "QuotaExceededError");
      setItem.call(this, name, value);
    };
  }, storageKey);
  page.once("dialog", (dialog) => dialog.accept());
  await app.getByRole("button", { name: "Replace saved draft" }).click();
  await expect(app.locator("[data-markdown-status]")).toContainText(
    "Original saved data is still preserved",
  );
  await expect(
    app.getByRole("textbox", { name: "Markdown source" }),
  ).toHaveValue("A replacement draft");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe(original);
  await expect(app.getByRole("button", { name: "Download .md" })).toBeEnabled();
});

test("narrow windows switch between accessible editor and preview without overflowing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  await editor.fill("## Pocket draft\n\nSmall screen, clear words.");
  await expect(
    app.getByRole("button", { name: "Editor", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await editor.evaluate((node) =>
      parseFloat(getComputedStyle(node).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  await app.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(editor).toBeHidden();
  await expect(
    app.getByRole("heading", { name: "Pocket draft" }),
  ).toBeVisible();
  expect(
    await app.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await app.getByRole("button", { name: "Editor", exact: true }).click();
  await expect(editor).toHaveValue(
    "## Pocket draft\n\nSmall screen, clear words.",
  );
});

test("long incomplete fences and heading suffixes stay responsive within the input limit", async ({
  page,
}) => {
  await page.goto("/desktop/");
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  const result = await editor.evaluate((node: HTMLTextAreaElement) => {
    const started = performance.now();
    const preview = node
      .closest(".markdown-app")!
      .querySelector("[data-markdown-preview]")!;
    node.value = "```" + " ".repeat(99_995) + "!";
    node.dispatchEvent(new Event("input", { bubbles: true }));
    const fenceStaysLiteral = preview.textContent === node.value;
    node.value = "# Heading" + " ".repeat(99_989) + "!";
    node.dispatchEvent(new Event("input", { bubbles: true }));
    const headingIsIntact =
      preview.querySelector("h1")?.textContent === node.value.slice(2);
    const elapsed = performance.now() - started;
    node.value = "x".repeat(100_001);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      elapsed,
      fenceStaysLiteral,
      headingIsIntact,
      length: node.value.length,
    };
  });
  expect(result.fenceStaysLiteral).toBe(true);
  expect(result.headingIsIntact).toBe(true);
  expect(result.elapsed).toBeLessThan(2_000);
  expect(result.length).toBe(100_000);

  await editor.fill("# Title ###   \n\n## Literal###   \n\n``` js\ncode\n```");
  await app.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    app.getByRole("heading", { name: "Title", exact: true }),
  ).toBeVisible();
  await expect(
    app.getByRole("heading", { name: "Literal###", exact: true }),
  ).toBeVisible();
  await expect(app.locator("[data-markdown-preview] pre code")).toHaveText(
    "code",
  );
});
