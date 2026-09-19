import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";
import {
  connectionSettings,
  serverMessage,
} from "../src/lib/terminal/protocol";

async function open(page: Page) {
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
}
const token = "browser-test-token-never-saved-0123456789";
async function connect(page: Page, access = token) {
  await page
    .getByLabel("Terminal service URL")
    .fill("ws://127.0.0.1:9876/terminal");
  await page.getByLabel("Access token", { exact: true }).fill(access);
  await page
    .getByRole("form", { name: "Connect a terminal" })
    .getByRole("button", { name: "Connect", exact: true })
    .click();
}

test("Connection settings enforce secure remote URLs and bounded protocol messages", () => {
  expect(
    connectionSettings("wss://terminal.example.com/terminal", "my-server")
      .target,
  ).toBe("my-server");
  expect(
    connectionSettings("ws://localhost:8787/terminal", "shell").endpoint,
  ).toContain("localhost");
  for (const value of [
    "ws://public.example/terminal",
    "https://example.com",
    "wss://user:pass@example.com",
    "wss://example.com?token=abc",
    "wss://example.com/#token",
    "no url",
  ])
    expect(() => connectionSettings(value, "shell")).toThrow();
  expect(() => connectionSettings("wss://example.com", "shell; rm")).toThrow();
  expect(serverMessage('{"type":"output","data":"ok"}')).toEqual({
    type: "output",
    data: "ok",
  });
  expect(serverMessage('{"type":"output","data":42}')).toBeUndefined();
  expect(
    serverMessage(JSON.stringify({ type: "output", data: "x".repeat(65537) })),
  ).toBeUndefined();
});

test("Ghostty and WASM are absent from regular pages and load only after opening Ghostty", async ({
  page,
}) => {
  for (const file of readdirSync("dist", { recursive: true }).filter(
    (f) => String(f).endsWith(".html") && f !== "desktop/index.html",
  ))
    expect(readFileSync(`dist/${file}`, "utf8"), String(file)).not.toMatch(
      /(?:src|href)="[^"\s]*_astro\/[^"\s]*(?:ghostty|\.wasm)/,
    );
  const assets: string[] = [];
  page.on("request", (request) => assets.push(request.url()));
  await page.goto("/");
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  expect(assets.filter((url) => /ghostty|\.wasm/.test(url))).toEqual([]);
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
  expect(assets.some((url) => /desktop-ghostty.*\.js/.test(url))).toBe(true);
  await page
    .getByRole("button", { name: "Close Ghostty", exact: true })
    .click();
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
  expect(
    assets.filter((url) => /desktop-ghostty.*\.js/.test(url)),
  ).toHaveLength(1);
});

test("Panes send independent input and sizes; tabs, split layouts, mobile keys and close work", async ({
  page,
}) => {
  const inputs: string[][] = [],
    sizes: any[][] = [];
  let closed = 0;
  await page.routeWebSocket("ws://127.0.0.1:9876/terminal", (socket) => {
    const id = inputs.length;
    inputs.push([]);
    sizes.push([]);
    socket.onClose(() => closed++);
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "auth") {
        expect(message.token).toBe(token);
        socket.send(JSON.stringify({ type: "ready", title: `Test ${id + 1}` }));
        socket.send(
          JSON.stringify({ type: "output", data: `Session ${id + 1}\r\n$ ` }),
        );
      } else if (message.type === "input") inputs[id].push(message.data);
      else if (message.type === "resize") sizes[id].push(message);
    });
  });
  await open(page);
  await connect(page);
  const panes = page.locator(".ghostty-pane");
  await expect(
    panes.first().getByText("Connected", { exact: true }),
  ).toBeVisible();
  await panes.first().locator("textarea").pressSequentially("echo first");
  await panes.first().locator("textarea").press("Enter");
  await expect.poll(() => inputs[0].join("")).toContain("echo first\r");
  await page.getByRole("button", { name: "Split right", exact: true }).click();
  await connect(page);
  await expect(
    panes.nth(1).getByText("Connected", { exact: true }),
  ).toBeVisible();
  await panes.nth(1).locator("textarea").pressSequentially("second");
  await page.getByRole("button", { name: "Ctrl C", exact: true }).click();
  await expect.poll(() => inputs[1].join("")).toContain("second\x03");
  expect(inputs[0].join("")).not.toContain("second");
  await expect.poll(() => sizes[0].length).toBeGreaterThan(0);
  await panes.nth(1).locator("textarea").press("Control+k");
  await expect(panes.nth(1).locator("textarea")).toBeFocused();
  await expect.poll(() => inputs[1].join("")).toContain("\x0b");
  await page.getByRole("button", { name: "New tab", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("tab")).toHaveCount(2);
  await page.getByRole("tab").first().click();
  await expect(panes.first()).toBeVisible();
  await page.getByRole("button", { name: "Minimize Ghostty" }).click();
  expect(closed).toBe(0);
  await page.getByRole("button", { name: "Show Ghostty", exact: true }).click();
  await expect(
    panes.first().getByText("Connected", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close Ghostty", exact: true })
    .click();
  await expect.poll(() => closed).toBe(2);
  await expect(page.locator("[data-ghostty]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
    ),
  ).not.toContain(token);
});

test("Authentication failures are shown without creating a fake shell; retry succeeds", async ({
  page,
}) => {
  await page.routeWebSocket("ws://127.0.0.1:9876/terminal", (socket) =>
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "auth")
        socket.send(
          JSON.stringify(
            message.token === token
              ? { type: "ready", title: "shell" }
              : { type: "error", message: "Authentication failed." },
          ),
        );
    }),
  );
  await open(page);
  await connect(page, "wrong");
  await expect(
    page.getByText("Authentication failed.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Connect…", exact: true }).click();
  await expect(page.getByLabel("Access token", { exact: true })).toHaveValue(
    "",
  );
  await connect(page);
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();
});

test("Closing while the terminal engine loads never creates a late window or console error", async ({
  page,
}) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/desktop-ghostty.*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await page
    .getByRole("button", { name: "Close Ghostty", exact: true })
    .click();
  release();
  await page.getByRole("button", { name: "Ghostty", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open a connection" }),
  ).toBeVisible();
  await expect(page.locator(".ghostty-pane")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("Ghostty fits mobile, avoids input zoom, and passes accessibility in both themes", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await open(page);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    expect(
      (await new AxeBuilder({ page }).include("[data-ghostty]").analyze())
        .violations,
    ).toEqual([]);
    for (const input of await page.locator(".ghostty-connection input").all())
      expect(
        await input.evaluate((element) =>
          parseFloat(getComputedStyle(element).fontSize),
        ),
      ).toBeGreaterThanOrEqual(16);
  }
  await page.getByRole("button", { name: "Cancel", exact: true }).tap();
  expect(
    await page
      .locator(".ghostty-surface textarea")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("16px");
  expect(
    (await new AxeBuilder({ page }).include("[data-ghostty]").analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Split down" }).tap();
  await page.getByRole("button", { name: "Cancel", exact: true }).tap();
  await expect(page.locator(".ghostty-pane")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/ghostty-mobile.png" });
  await context.close();
});
