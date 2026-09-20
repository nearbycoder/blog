import { test, expect, type Page } from "@playwright/test";

async function openJson(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="json"]').click();
  const app = page.locator('[data-window="json"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.getByRole("textbox", { name: "JSON source" })).toBeVisible();
  return app;
}

test("JSON Desk validates and formats without rounding numbers or removing duplicate keys", async ({
  page,
}) => {
  const app = await openJson(page);
  const editor = app.getByRole("textbox", { name: "JSON source" });
  const source =
    '{"count":9007199254740993,"count":1e309,"tags":["a","b"],"active":true}';
  await expect(editor).toHaveValue("");
  await editor.fill(source);
  await app.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(app.locator("[data-json-status]")).toContainText("Valid JSON");
  await expect(app.locator("[data-json-type]")).toHaveText(
    "Object · 3 unique keys",
  );
  await app.getByRole("button", { name: "Pretty-print", exact: true }).click();
  await expect(editor).toHaveValue(
    '{\n  "count": 9007199254740993,\n  "count": 1e309,\n  "tags": [\n    "a",\n    "b"\n  ],\n  "active": true\n}',
  );
  await app.getByRole("button", { name: "Minify", exact: true }).click();
  await expect(editor).toHaveValue(source);
  await editor.fill("null");
  await app.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(app.locator("[data-json-type]")).toHaveText("Null");
});

test("invalid and oversized documents give useful errors and destructive actions have undo", async ({
  page,
}) => {
  const app = await openJson(page);
  const editor = app.getByRole("textbox", { name: "JSON source" });
  const status = app.locator("[data-json-status]");
  await editor.fill('{"broken": true,}');
  await app.getByRole("button", { name: "Pretty-print", exact: true }).click();
  await expect(status).toContainText("Invalid JSON:");
  await expect(editor).toHaveAttribute("aria-invalid", "true");
  await expect(editor).toHaveValue('{"broken": true,}');
  await editor.fill(`"${"x".repeat(500 * 1024)}"`);
  await expect(status).toContainText("Input exceeds 500 KiB");
  await app.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(status).toContainText("Input exceeds 500 KiB");
  await expect(
    app.getByRole("button", { name: "Download", exact: true }),
  ).toBeDisabled();
  await editor.fill('{"mine":true}');
  await app.getByRole("button", { name: "Load sample", exact: true }).click();
  await expect(editor).toHaveValue(/JSON Desk/);
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).toHaveValue('{"mine":true}');
  await app.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(editor).toHaveValue("");
  await app.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).toHaveValue('{"mine":true}');
});

test("JSON Desk downloads the validated source and handles denied clipboard access", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  const app = await openJson(page);
  const source = '{"download":[1,2,3]}';
  await app.getByRole("textbox", { name: "JSON source" }).fill(source);
  await app.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(app.locator("[data-json-status]")).toContainText(
    "Clipboard access is unavailable",
  );
  const downloadPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("document.json");
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString("utf8")).toBe(source);
});

test("JSON Desk contains long lines and keeps its phone editor readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const app = await openJson(page);
  const editor = app.getByRole("textbox", { name: "JSON source" });
  await editor.fill(`{"line":"${"long text ".repeat(100)}"}`);
  await app.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(app.locator("[data-json-status]")).toContainText("Valid JSON");
  expect(
    await editor.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await editor.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);
  const bounds = (await app.boundingBox())!;
  const editorBounds = (await editor.boundingBox())!;
  expect(editorBounds.x).toBeGreaterThanOrEqual(bounds.x);
  expect(editorBounds.x + editorBounds.width).toBeLessThanOrEqual(
    bounds.x + bounds.width,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
