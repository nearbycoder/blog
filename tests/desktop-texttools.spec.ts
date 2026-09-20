import { test, expect, type Page } from "@playwright/test";

async function openTextWorkshop(page: Page) {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open application launcher" }).click();
  await page.locator('[data-launch-app="texttools"]').click();
  const app = page.locator('[data-window="texttools"]');
  await expect(app).toBeVisible();
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  return app;
}

test("Unicode text round trips through URL and Base64 encoding and invalid decoding preserves it", async ({
  page,
}) => {
  const app = await openTextWorkshop(page);
  const editor = app.getByRole("textbox", { name: "Text", exact: true });
  const transform = app.getByRole("combobox", { name: "Transformation" });
  const status = app.locator("[data-texttools-status]");
  const text = "\uFEFFHello café 👋\n東京";
  await editor.fill(text);
  await expect(app.locator("[data-texttools-words]")).toHaveText("4 words");
  await expect(app.locator("[data-texttools-chars]")).toHaveText(
    `${[...text].length} characters`,
  );
  await expect(app.locator("[data-texttools-lines]")).toHaveText("2 lines");
  await expect(app.locator("[data-texttools-bytes]")).toHaveText(
    `${Buffer.byteLength(text)} bytes`,
  );
  for (const [encode, decode, encoded] of [
    ["encode", "decode", encodeURIComponent(text)],
    ["base64", "unbase64", Buffer.from(text).toString("base64")],
  ]) {
    await transform.selectOption(encode);
    await app.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(editor).toHaveValue(encoded);
    await transform.selectOption(decode);
    await app.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(editor).toHaveValue(text);
  }
  for (const [action, invalid] of [
    ["decode", "%E0%A4%A"],
    ["unbase64", "%%%"],
    ["unbase64", "/w=="],
  ]) {
    await editor.fill(invalid);
    await transform.selectOption(action);
    await app.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(status).toContainText("could not be decoded");
    await expect(editor).toHaveValue(invalid);
  }
  for (const surrogate of [0xd800, 0xdc00]) {
    await editor.evaluate((node, codePoint) => {
      // Filling through the browser input protocol can normalize malformed UTF-16.
      (node as HTMLTextAreaElement).value = String.fromCharCode(codePoint);
      node.dispatchEvent(new Event("input", { bubbles: true }));
    }, surrogate);
    await transform.selectOption("base64");
    await app.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(status).toContainText("could not be transformed");
    expect(await editor.inputValue()).toBe(String.fromCharCode(surrogate));
    await app.getByRole("button", { name: "Download .txt" }).click();
    await expect(status).toHaveText(
      "The download could not start. Copy the text instead.",
    );
    expect(await editor.inputValue()).toBe(String.fromCharCode(surrogate));
  }
});

test("literal replacements and clear can be undone while oversized results leave text intact", async ({
  page,
}) => {
  const app = await openTextWorkshop(page);
  const editor = app.getByRole("textbox", { name: "Text", exact: true });
  const status = app.locator("[data-texttools-status]");
  const text = "a.*b a.*b $&";
  await editor.fill(text);
  await app.getByRole("textbox", { name: "Find literal text" }).fill("a.*b");
  await app.getByRole("textbox", { name: "Replace with" }).fill("$&");
  await app.getByRole("button", { name: "Replace all" }).click();
  await expect(editor).toHaveValue("$& $& $&");
  await expect(status).toHaveText("2 replacements made.");
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).toHaveValue(text);
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(editor).toHaveValue("");
  await expect(app.getByRole("button", { name: "Copy text" })).toBeDisabled();
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).toHaveValue(text);
  await app.getByRole("textbox", { name: "Find literal text" }).fill("");
  await app.getByRole("button", { name: "Replace all" }).click();
  await expect(status).toHaveText("Enter text to find first.");
  await expect(editor).toHaveValue(text);

  const largeText = "é".repeat(20_000);
  await editor.fill(largeText);
  await app
    .getByRole("combobox", { name: "Transformation" })
    .selectOption("encode");
  await app.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(status).toContainText("result exceeds 100,000");
  await expect(editor).toHaveValue(largeText);
  await app.getByRole("textbox", { name: "Find literal text" }).fill("é");
  await app.getByRole("textbox", { name: "Replace with" }).fill("abcdef");
  await app.getByRole("button", { name: "Replace all" }).click();
  await expect(status).toContainText("result exceeds 100,000");
  await expect(editor).toHaveValue(largeText);
  await expect(editor).toHaveAttribute("maxlength", "100000");
});

test("clipboard and downloaded text preserve Unicode content exactly", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const app = await openTextWorkshop(page);
  const text = "\uFEFFcafé 👋\n日本語\n<script>literal text</script>";
  await app.getByRole("textbox", { name: "Text", exact: true }).fill(text);
  await app.getByRole("button", { name: "Copy text" }).click();
  await expect(app.locator("[data-texttools-status]")).toHaveText(
    "Text copied.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  const downloadPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Download .txt" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("text-workshop.txt");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString("utf8")).toBe(text);
  await expect(app.locator("[data-texttools-status]")).toHaveText(
    "Text download started.",
  );
});

test("line and case transformations stay usable at a 320px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openTextWorkshop(page);
  const editor = app.getByRole("textbox", { name: "Text", exact: true });
  await expect(editor).not.toBeFocused();
  await editor.fill("  zebra\n  apple \n  zebra  ");
  for (const [action, expected] of [
    ["trim", "zebra\napple\nzebra"],
    ["unique", "zebra\napple"],
    ["sort", "apple\nzebra"],
    ["title", "Apple\nZebra"],
    ["upper", "APPLE\nZEBRA"],
    ["lower", "apple\nzebra"],
  ]) {
    await app
      .getByRole("combobox", { name: "Transformation" })
      .selectOption(action);
    await app.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(editor).toHaveValue(expected);
  }
  expect(
    await editor.evaluate((node) =>
      parseFloat(getComputedStyle(node).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await app.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
