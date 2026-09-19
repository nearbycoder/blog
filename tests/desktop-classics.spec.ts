import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import {
  newSnake,
  placeFood,
  stepSnake,
  turnSnake,
  COLS,
  ROWS,
} from "../src/lib/games/snake";
import { newPong, stepPong, WIN_SCORE } from "../src/lib/games/pong";
import {
  puzzleNeighbors,
  puzzleSolved,
  shufflePuzzle,
  slideTile,
  solvedPuzzle,
} from "../src/lib/games/puzzle";

test("Snake grows, rejects reversals, allows a vacating tail, and handles walls, body collisions and a full board", () => {
  const snake = newSnake();
  turnSnake(snake, "ArrowLeft");
  expect(snake.next).toBe("ArrowRight");
  turnSnake(snake, "ArrowUp");
  turnSnake(snake, "ArrowLeft");
  expect(snake.next).toBe("ArrowUp");
  const fresh = newSnake();
  for (let i = 0; i < 5; i++) stepSnake(fresh, () => 0);
  expect(fresh.score).toBe(1);
  expect(fresh.body).toHaveLength(4);
  expect(fresh.body).not.toContain(fresh.food);
  const tail = {
    ...newSnake(),
    body: [25, 26, 50, 49],
    direction: "ArrowDown" as const,
    next: "ArrowDown" as const,
    food: 100,
  };
  stepSnake(tail);
  expect(tail.status).toBe("playing");
  expect(tail.body[0]).toBe(49);
  const body = { ...tail, body: [25, 49, 50, 26] };
  stepSnake(body);
  expect(body.status).toBe("lost");
  const wall = { ...newSnake(), body: [23, 22, 21] };
  stepSnake(wall);
  expect(wall.status).toBe("lost");
  expect(placeFood(Array.from({ length: COLS * ROWS }, (_, i) => i))).toBe(-1);
  const full = {
    ...newSnake(),
    body: Array.from({ length: COLS * ROWS - 1 }, (_, i) => i),
    direction: "ArrowDown" as const,
    next: "ArrowDown" as const,
    food: COLS * ROWS - 1,
  };
  full.body = [
    COLS * ROWS - 1 - COLS,
    ...full.body.filter((i) => i !== COLS * ROWS - 1 - COLS),
  ];
  stepSnake(full);
  expect(full.status).toBe("won");
});

test("Pong rebounds from paddles and walls, scores missed balls, clamps controls, and ends at seven", () => {
  const p = { ...newPong(), serve: 0, x: 36, y: 160, vx: -215 };
  stepPong(p, 0.02, 0);
  expect(p.vx).toBeGreaterThan(0);
  p.y = 7;
  p.vy = -100;
  stepPong(p, 0.02, 0);
  expect(p.vy).toBeGreaterThan(0);
  p.x = -5;
  p.vx = -215;
  stepPong(p, 0.02, 0);
  expect(p.right).toBe(1);
  expect(p.serve).toBeGreaterThan(0);
  p.player = 1;
  stepPong(p, 0.02, -1);
  expect(p.player).toBe(0);
  p.serve = 0;
  p.x = 485;
  p.vx = 215;
  p.left = WIN_SCORE - 1;
  stepPong(p, 0.02, 1);
  expect(p.left).toBe(WIN_SCORE);
  const finished = { ...p };
  stepPong(p, 1, -1);
  expect(p).toEqual(finished);
});

test("Sliding puzzles are solvable, never start completed, and only accept adjacent moves", () => {
  for (let seed = 1; seed <= 40; seed++) {
    let state = seed;
    const tiles = shufflePuzzle(() => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    });
    expect([...tiles].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 16 }, (_, i) => i),
    );
    expect(puzzleSolved(tiles)).toBe(false);
    const values = tiles.filter(Boolean);
    const inversions = values.reduce(
      (sum, tile, i) =>
        sum + values.slice(i + 1).filter((n) => n < tile).length,
      0,
    );
    expect((inversions + 4 - Math.floor(tiles.indexOf(0) / 4)) % 2).toBe(1);
  }
  const tiles = solvedPuzzle();
  expect(slideTile(tiles, 0)).toBe(false);
  expect(slideTile(tiles, 14)).toBe(true);
  expect(puzzleSolved(tiles)).toBe(false);
  expect(slideTile(tiles, 15)).toBe(true);
  expect(puzzleSolved(tiles)).toBe(true);
  expect(puzzleNeighbors(4)).not.toContain(3);
});

async function openGame(page: Page, title: string) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Search applications and files" })
    .fill(title);
  await page.locator("[data-launcher-results] button").first().click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
}

test("Every normal page excludes desktop entry points; desktop and games fetch only on demand", async ({
  page,
}) => {
  const html = readdirSync("dist", { recursive: true }).filter(
    (file) => String(file).endsWith(".html") && file !== "desktop/index.html",
  );
  for (const file of html) {
    const source = readFileSync(`dist/${file}`, "utf8");
    expect(source, String(file)).not.toContain(".classic-screen");
    expect(source, String(file)).not.toMatch(
      /(?:src|href)="[^"\s]*_astro\/desktop[^"\s]*\.(?:js|css)/,
    );
  }
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (
      request.resourceType() === "script" ||
      request.resourceType() === "stylesheet"
    )
      scripts.push(request.url());
  });
  for (const path of ["/", "/projects/", "/about/"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(scripts.filter((url) => /\/_astro\/desktop/.test(url))).toEqual([]);
  }
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  expect(scripts.some((url) => /desktop\.astro.*\.js/.test(url))).toBe(true);
  expect(
    scripts.some((url) =>
      /desktop-(arcade|doom|snake|pong|puzzle|game-host).*\.js/.test(url),
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Card 1: hidden", exact: true }),
  ).toBeVisible();
  expect(scripts.some((url) => /desktop-arcade.*\.js/.test(url))).toBe(true);
  expect(
    scripts.some((url) =>
      /desktop-(doom|snake|pong|puzzle|game-host).*\.js/.test(url),
    ),
  ).toBe(false);
  for (const [title, module] of [
    ["Snake", "snake"],
    ["Pong", "pong"],
    ["15 Puzzle", "puzzle"],
    ["DOOM", "doom"],
  ]) {
    expect(scripts.some((url) => url.includes(`desktop-${module}.`))).toBe(
      false,
    );
    await page.getByRole("button", { name: title, exact: true }).click();
    await expect(
      page.locator(`[data-arcade-panel="${module}"]`),
    ).not.toHaveAttribute("aria-busy", "true");
    await expect
      .poll(() => scripts.some((url) => url.includes(`desktop-${module}.`)))
      .toBe(true);
  }
  expect(scripts.some((url) => url.includes("js-dos"))).toBe(false);
});

test("Snake plays, pauses on navigation and minimize, accepts touch, and resets after losing", async ({
  page,
}) => {
  await openGame(page, "Snake");
  const panel = page.locator('[data-arcade-panel="snake"]');
  const screen = panel.locator(".classic-screen");
  await panel.getByRole("button", { name: "Start Snake" }).click();
  await expect(panel.locator("[data-game-status]")).toContainText("Score 1");
  await panel.locator("canvas").press("ArrowUp");
  await panel.locator("canvas").press("Space");
  await expect(screen).toHaveAttribute("data-state", "paused");
  const paused = await panel
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(200);
  expect(
    await panel
      .locator("canvas")
      .evaluate((c: HTMLCanvasElement) => c.toDataURL()),
  ).toBe(paused);
  await panel.getByRole("button", { name: "Resume" }).click();
  await page.getByRole("button", { name: "Memory", exact: true }).click();
  await expect(screen).toHaveAttribute("data-state", "paused");
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await panel.getByRole("button", { name: "Resume" }).click();
  await page
    .getByRole("button", { name: "Minimize Arcade", exact: true })
    .click();
  await expect(screen).toHaveAttribute("data-state", "paused");
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await panel.getByRole("button", { name: "New game" }).click();
  await expect(screen).toHaveAttribute("data-state", "ready");
  await panel.getByRole("button", { name: "Start Snake" }).click();
  await expect(panel.locator("[data-game-status]")).toContainText("Game over", {
    timeout: 8000,
  });
  await panel.getByRole("button", { name: "Play again" }).click();
  await expect(panel.locator("[data-game-status]")).toContainText("Score 0");
  await page.getByRole("button", { name: "Close Arcade", exact: true }).click();
  await expect(page.locator(".classic-screen")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await expect(screen).toHaveAttribute("data-state", "ready");
});

test("Pong moves with keyboard and buttons, scores, and pauses when focus leaves the window", async ({
  page,
}) => {
  await openGame(page, "Pong");
  const panel = page.locator('[data-arcade-panel="pong"]');
  await panel.getByRole("button", { name: "Start Pong" }).click();
  const canvas = panel.locator("canvas");
  const pixel = () =>
    canvas.evaluate((c: HTMLCanvasElement) => [
      ...c.getContext("2d")!.getImageData(20, 150, 1, 1).data,
    ]);
  expect(await pixel()).toEqual([155, 237, 200, 255]);
  await page.keyboard.down("ArrowDown");
  await expect.poll(pixel).toEqual([10, 25, 30, 255]);
  await page.keyboard.up("ArrowDown");
  await panel
    .getByRole("button", { name: "Move up" })
    .dispatchEvent("click", { detail: 0 });
  await expect(panel.locator("[data-game-status]")).toContainText(
    "Computer 1",
    { timeout: 10000 },
  );
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(panel.locator(".classic-screen")).toHaveAttribute(
    "data-state",
    "paused",
  );
});

test("15 Puzzle slides, supports keyboard and undo, and starts a fresh deal", async ({
  page,
}) => {
  await openGame(page, "15 Puzzle");
  const panel = page.locator('[data-arcade-panel="puzzle"]');
  const tiles = panel.locator("[data-tile]");
  const before = await tiles.allTextContents();
  await panel.locator('[data-tile][aria-disabled="false"]').first().click();
  await expect(panel.locator("[data-puzzle-status]")).toContainText("1 move");
  expect(await tiles.allTextContents()).not.toEqual(before);
  await panel.getByRole("button", { name: "Undo move" }).click();
  expect(await tiles.allTextContents()).toEqual(before);
  const blank = before.indexOf("");
  await panel.locator('[data-tile][aria-disabled="false"]').first().focus();
  await page.keyboard.press(blank >= 4 ? "ArrowUp" : "ArrowDown");
  await expect(panel.locator("[data-puzzle-status]")).toContainText("1 move");
  await panel.getByRole("button", { name: "Shuffle tiles" }).click();
  await expect(panel.locator("[data-puzzle-status]")).toContainText("0 moves");
  await expect(panel.getByRole("button", { name: "Undo move" })).toBeDisabled();
});

test("Slow imports preserve the last launch request and never mount into a closed window", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/desktop-arcade.*.js", async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Opening Arcade" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open Terminal", exact: true })
    .click();
  release();
  await expect(page.locator("#arcade-command")).toBeFocused();
  let releaseSnake!: () => void;
  const delayed = new Promise<void>((resolve) => {
    releaseSnake = resolve;
  });
  await page.route("**/desktop-snake.*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await page.getByRole("button", { name: "Close Arcade", exact: true }).click();
  releaseSnake();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Snake" })).toBeVisible();
});

test("Failed game downloads show a recovery link without breaking other games", async ({
  page,
}) => {
  await page.route("**/desktop-pong.*.js", (route) => route.abort());
  await openGame(page, "Snake");
  await page.getByRole("button", { name: "Pong", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Reload the desktop to try again." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Snake" })).toBeVisible();
});

test("New games work at 320px with touch and pass accessibility checks in both themes", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openGame(page, "Snake");
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const title of ["Snake", "Pong", "15 Puzzle"]) {
      await page.getByRole("button", { name: title, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-window="arcade"]')
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  const panel = page.locator('[data-arcade-panel="snake"]');
  await panel.getByRole("button", { name: "Start Snake" }).tap();
  await panel.getByRole("button", { name: "Move down" }).tap();
  await expect
    .poll(() =>
      panel
        .locator("canvas")
        .evaluate((c: HTMLCanvasElement) => [
          ...c.getContext("2d")!.getImageData(170, 210, 1, 1).data,
        ]),
    )
    .toEqual([210, 251, 228, 255]);
  await panel.getByRole("button", { name: "Pause", exact: true }).tap();
  await expect(panel.locator(".classic-screen")).toHaveAttribute(
    "data-state",
    "paused",
  );
  expect(errors).toEqual([]);
  await context.close();
});
