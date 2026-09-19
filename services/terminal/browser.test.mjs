import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { createTerminalServer } from "./server.mjs";

test("Browser Ghostty runs real independent shells, creates files, resizes and cleans up", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "nearby-browser-terminal-"));
  const token = randomBytes(32).toString("hex");
  const url = process.env.TERMINAL_TEST_SITE || "http://127.0.0.1:4322";
  const bridge = createTerminalServer({
    token,
    origins: [new URL(url).origin],
    targets: { shell: { command: "/bin/sh", args: ["-i"], cwd } },
  });
  bridge.server.listen(0, "127.0.0.1");
  await once(bridge.server, "listening");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${url}/desktop/`);
    await page.getByRole("button", { name: "Ghostty", exact: true }).click();
    const connect = async () => {
      await page
        .getByLabel("Terminal service URL")
        .fill(`ws://127.0.0.1:${bridge.server.address().port}/terminal`);
      await page.getByLabel("Access token", { exact: true }).fill(token);
      await page
        .getByRole("form", { name: "Connect a terminal" })
        .getByRole("button", { name: "Connect", exact: true })
        .click();
    };
    await connect();
    const panes = page.locator(".ghostty-pane");
    await expect(
      panes.first().getByText("Connected", { exact: true }),
    ).toBeVisible();
    const command = async (pane, text) => {
      await pane.locator("textarea").pressSequentially(text);
      await pane.locator("textarea").press("Enter");
    };
    await command(
      panes.first(),
      "export PANE_ONLY=first; printf 'BROWSER_%s\\n' REAL > proof.txt; cat proof.txt",
    );
    await expect(panes.first().locator("pre")).toContainText("BROWSER_REAL");
    assert.equal(
      readFileSync(join(cwd, "proof.txt"), "utf8"),
      "BROWSER_REAL\n",
    );
    await page.getByRole("button", { name: "Split right" }).click();
    await connect();
    await expect(
      panes.nth(1).getByText("Connected", { exact: true }),
    ).toBeVisible();
    await command(
      panes.nth(1),
      "printf 'INDEPENDENT_%s\\n' ${PANE_ONLY:-yes}; stty size",
    );
    await expect(panes.nth(1).locator("pre")).toContainText("INDEPENDENT_yes");
    assert.equal(bridge.sessionCount(), 2);
    const priorOutput = await panes.nth(1).locator("pre").textContent();
    const priorColumns = Number(
      priorOutput.match(/(?:^|\n)(\d+) (\d+)(?:\n|$)/)?.[2],
    );
    assert.ok(priorColumns > 0);
    const canvas = panes.nth(1).locator("canvas").first();
    const priorWidth = await canvas.getAttribute("width");
    const bar = await page
      .locator("[data-ghostty] [data-drag-handle]")
      .boundingBox();
    await page.mouse.move(bar.x + 120, bar.y + 20);
    await page.mouse.down();
    await page.mouse.move(1438, 150, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator("[data-ghostty]")).toHaveAttribute(
      "data-snap",
      "right",
    );
    await expect.poll(() => canvas.getAttribute("width")).not.toBe(priorWidth);
    await command(panes.nth(1), "printf 'SNAP_SIZE '; stty size");
    await expect(panes.nth(1).locator("pre")).toContainText(
      /SNAP_SIZE \d+ \d+/,
    );
    const resizedOutput = await panes.nth(1).locator("pre").textContent();
    const resizedColumns = Number(
      resizedOutput.match(/SNAP_SIZE (\d+) (\d+)/)?.[2],
    );
    // Narrow windows stack panes, so columns can grow even as the window shrinks.
    assert.ok(resizedColumns > 0 && resizedColumns !== priorColumns);
    assert.equal(bridge.sessionCount(), 2);

    const beforeResize = await canvas.getAttribute("width");
    const grip = await page
      .locator('[data-ghostty] [data-resize="w"]')
      .boundingBox();
    await page.mouse.move(grip.x + 3, grip.y + 60);
    await page.mouse.down();
    await page.mouse.move(grip.x + 103, grip.y + 60, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator("[data-ghostty]")).not.toHaveAttribute(
      "data-snap",
    );
    await expect
      .poll(() => canvas.getAttribute("width"))
      .not.toBe(beforeResize);
    await command(panes.nth(1), "printf 'DRAG_SIZE '; stty size");
    await expect(panes.nth(1).locator("pre")).toContainText(
      /DRAG_SIZE \d+ \d+/,
    );
    const dragOutput = await panes.nth(1).locator("pre").textContent();
    const dragColumns = Number(dragOutput.match(/DRAG_SIZE (\d+) (\d+)/)?.[2]);
    assert.ok(dragColumns > 0 && dragColumns !== resizedColumns);
    assert.equal(bridge.sessionCount(), 2);

    await command(
      panes.first(),
      "printf '\\033[2J\\033[H'; printf 'CURSOR_%s\\n' OK",
    );
    await expect(panes.first().locator("pre")).toContainText("CURSOR_OK");
    await page.screenshot({ path: "/tmp/ghostty-real-panes.png" });
    await page
      .getByRole("button", { name: "Close Ghostty", exact: true })
      .click();
    await expect.poll(() => bridge.sessionCount()).toBe(0);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await bridge.close();
    rmSync(cwd, { recursive: true, force: true });
  }
});
