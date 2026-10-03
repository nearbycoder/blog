import { test, expect, type Page } from "@playwright/test";

async function openMarkdown(page: Page) {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="markdown"]').click();
  const app = page.locator('[data-window="markdown"]');
  await expect(app.locator("[data-markdown-source]")).toBeVisible();
  return app;
}

test("formatting tools preserve selection and shortcuts stay inside the source editor", async ({
  page,
}) => {
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  await editor.fill("First idea\nSecond idea");
  await editor.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(0, 5),
  );
  await app.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(editor).toHaveValue("**First** idea\nSecond idea");
  await editor.press("Control+i");
  await expect(editor).toHaveValue("***First*** idea\nSecond idea");
  await editor.fill("First\nSecond");
  await editor.selectText();
  await app.getByRole("button", { name: "List", exact: true }).click();
  await expect(editor).toHaveValue("- First\n- Second");
  await app.getByRole("button", { name: "List", exact: true }).click();
  await expect(editor).toHaveValue("First\nSecond");
  await editor.press("Control+f");
  const find = app.locator("[data-markdown-find-text]");
  await expect(find).toBeFocused();
  await find.fill("First");
  await find.press("Control+b");
  await expect(editor).toHaveValue("First\nSecond");
  await find.press("Escape");
  await expect(find).toBeHidden();
  await expect(editor).toBeFocused();
  await editor.fill("First\nSecond\nThird");
  // A selection ending at the next line's start must not format that line.
  await editor.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(0, 6),
  );
  await editor.press("Control+Shift+h");
  await expect(editor).toHaveValue("## First\nSecond\nThird");
  await editor.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(9, 9),
  );
  await editor.press("Control+Shift+l");
  await expect(editor).toHaveValue("## First\n- Second\nThird");
  await editor.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(node.value.length, node.value.length),
  );
  await app.getByRole("button", { name: "Link", exact: true }).click();
  await expect(editor).toHaveValue(
    "## First\n- Second\nThird[link text](https://example.com)",
  );
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) =>
      node.value.slice(node.selectionStart, node.selectionEnd),
    ),
  ).toBe("link text");
});

test("file import confirms replacement and rejects unsupported, binary, and oversized files", async ({
  page,
}) => {
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  const input = app.locator("[data-markdown-file]");
  await editor.fill("Keep this draft");
  page.once("dialog", (dialog) => dialog.dismiss());
  await input.setInputFiles({
    name: "notes.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Imported"),
  });
  await expect(editor).toHaveValue("Keep this draft");
  page.once("dialog", (dialog) => dialog.accept());
  await input.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("# Imported"),
  });
  await expect(editor).toHaveValue("# Imported");
  for (const file of [
    {
      name: "unsafe.html",
      mimeType: "text/html",
      buffer: Buffer.from("<script>alert(1)</script>"),
    },
    { name: "binary.md", mimeType: "text/plain", buffer: Buffer.from("A\0B") },
    {
      name: "invalid-utf8.md",
      mimeType: "text/plain",
      buffer: Buffer.from([0x23, 0x20, 0xc3, 0x28]),
    },
    {
      name: "large.md",
      mimeType: "text/plain",
      buffer: Buffer.from("x".repeat(100_001)),
    },
  ]) {
    await editor.fill("# Imported");
    await expect(app.locator("[data-markdown-status]")).toHaveText(
      "Saved in this browser",
    );
    await input.setInputFiles(file);
    await expect(app.locator("[data-markdown-status]")).toContainText(
      "unchanged",
    );
    await expect(editor).toHaveValue("# Imported");
  }
  page.once("dialog", (dialog) => dialog.accept());
  await input.setInputFiles({
    name: "unicode.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("\uFEFF# Café ☕\r\n\r\n## 東京\r\nNotes"),
  });
  await expect(editor).toHaveValue("# Café ☕\n\n## 東京\nNotes");
  await app.getByRole("button", { name: "Outline", exact: true }).click();
  await app
    .getByRole("navigation", { name: "Document outline" })
    .getByRole("button", { name: "東京" })
    .click();
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) =>
      node.value.slice(node.selectionStart, node.selectionEnd),
    ),
  ).toBe("## 東京");
});

test("literal find wraps and replace actions honor matches and document limits", async ({
  page,
}) => {
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  await editor.fill("a.* a.* A.*");
  await app.getByRole("button", { name: "Find & replace" }).click();
  await app.locator("[data-markdown-find-text]").fill("a.*");
  await app.locator("[data-markdown-replacement]").fill("$&");
  await app.getByRole("button", { name: "Find next", exact: true }).click();
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) =>
      node.value.slice(node.selectionStart, node.selectionEnd),
    ),
  ).toBe("a.*");
  await app.getByRole("button", { name: "Replace", exact: true }).click();
  await expect(editor).toHaveValue("$& a.* A.*");
  await app.getByRole("button", { name: "Replace all", exact: true }).click();
  await expect(editor).toHaveValue("$& $& A.*");
  await expect(app.locator("[data-markdown-find-status]")).toHaveText(
    "Replaced 1 match.",
  );
  await app.locator("[data-markdown-find-text]").fill("$&");
  await editor.evaluate((node: HTMLTextAreaElement) =>
    node.setSelectionRange(node.value.length, node.value.length),
  );
  await app.getByRole("button", { name: "Find next", exact: true }).click();
  await expect(app.locator("[data-markdown-find-status]")).toContainText(
    "Wrapped",
  );
  await app.locator("[data-markdown-replacement]").fill("x".repeat(60_000));
  await app.getByRole("button", { name: "Replace all", exact: true }).click();
  await expect(editor).toHaveValue("$& $& A.*");
  await expect(app.locator("[data-markdown-find-status]")).toContainText(
    "Draft unchanged",
  );
});

test("outline uses rendered headings and navigates both source and preview", async ({
  page,
}) => {
  const app = await openMarkdown(page);
  const editor = app.getByRole("textbox", { name: "Markdown source" });
  await editor.fill(
    "# First\n\n```\n# Not a heading\n```\n\n## Second **section**\nBody",
  );
  await app.getByRole("button", { name: "Outline", exact: true }).click();
  const outline = app.getByRole("navigation", { name: "Document outline" });
  await expect(outline.getByRole("button")).toHaveCount(2);
  await outline.getByRole("button", { name: "Second section" }).click();
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) =>
      node.value.slice(node.selectionStart, node.selectionEnd),
    ),
  ).toBe("## Second **section**");
  await editor.fill("# Revised\n\n## Second **section**\n\n### Third");
  await expect(outline.getByRole("button")).toHaveText([
    "Revised",
    "Second section",
    "Third",
  ]);
  await outline.getByRole("button", { name: "Third", exact: true }).click();
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) =>
      node.value.slice(node.selectionStart, node.selectionEnd),
    ),
  ).toBe("### Third");
  await app.getByRole("button", { name: "Preview", exact: true }).click();
  await outline.getByRole("button", { name: "Second section" }).click();
  await expect(
    app.getByRole("heading", { name: "Second section" }),
  ).toBeFocused();
});

test("HTML export is standalone and escapes unsafe markup through the preview renderer", async ({
  page,
}) => {
  const app = await openMarkdown(page);
  await app
    .getByRole("textbox", { name: "Markdown source" })
    .fill(
      '# Field notes\n\n<script>window.bad=true</script>\n\n[Bad](javascript:alert(1))\n\n[Good](https://example.com)\n\n[Quoted](https://example.com/?q="hello"&x=1)\n\n[Entity](javascript&#58;alert)',
    );
  const pending = page.waitForEvent("download");
  await app.getByRole("button", { name: "Export HTML" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("Field notes.html");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const html = Buffer.concat(chunks).toString();
  const parsed = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "text/html");
    return {
      scripts: doc.querySelectorAll("script, iframe, img, link[rel=stylesheet]")
        .length,
      text: doc.querySelector("main")?.textContent,
      links: [...doc.querySelectorAll("a")].map((link) => [
        link.href,
        link.rel,
      ]),
      title: doc.title,
      styles: doc.querySelectorAll("style").length,
      policy: doc
        .querySelector('meta[http-equiv="Content-Security-Policy"]')
        ?.getAttribute("content"),
      eventAttributes: [...doc.querySelectorAll("*")].flatMap((node) =>
        [...node.attributes].filter((attribute) => /^on/i.test(attribute.name)),
      ).length,
    };
  }, html);
  expect(parsed.scripts).toBe(0);
  expect(parsed.text).toContain("<script>window.bad=true</script>");
  expect(parsed.links).toEqual([
    ["https://example.com/", "noopener noreferrer"],
    ["https://example.com/?q=%22hello%22&x=1", "noopener noreferrer"],
  ]);
  expect(parsed.eventAttributes).toBe(0);
  expect(parsed.title).toBe("Field notes");
  expect(parsed.styles).toBe(1);
  expect(parsed.policy).toContain("default-src 'none'");
});

test("new panels remain usable at 320px and edits preserve unreadable saved data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/desktop/");
  const saved = '{"version":99,"text":"original"}';
  await page.evaluate(
    (value) => localStorage.setItem("nearby-desktop-markdown-v1", value),
    saved,
  );
  const app = await openMarkdown(page);
  await app
    .getByRole("textbox", { name: "Markdown source" })
    .fill("# Pocket notes");
  await app.getByRole("button", { name: "Outline", exact: true }).click();
  await app.getByRole("button", { name: "Find & replace" }).click();
  await app.locator("[data-markdown-find-text]").fill("Pocket");
  await app.locator("[data-markdown-replacement]").fill("Portable");
  await app.getByRole("button", { name: "Replace all", exact: true }).click();
  expect(
    await app.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("nearby-desktop-markdown-v1"),
    ),
  ).toBe(saved);
  await expect(app.locator("[data-markdown-status]")).toContainText(
    "Autosave is paused",
  );
  await expect(
    app.getByRole("button", { name: "Download saved data" }),
  ).toBeVisible();
});
