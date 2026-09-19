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
