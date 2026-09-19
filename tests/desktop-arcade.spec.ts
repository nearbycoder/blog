import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  flagCell,
  neighbors,
  newSweep,
  revealCell,
  SWEEP_BUGS,
} from "../src/lib/desktop-games";

const arcade = '[data-window="arcade"]';
const cheat = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

test("Bug Sweep protects every opening, counts neighbors, and handles win, loss, and flags", () => {
  expect(neighbors(0)).toEqual([1, 8, 9]);
  expect(neighbors(7)).toEqual([6, 14, 15]);
  for (let first = 0; first < 64; first++) {
    const board = newSweep();
    revealCell(board, first, () => 0.37);
    expect(board.cells.filter((cell) => cell.mine)).toHaveLength(SWEEP_BUGS);
    expect(board.cells[first].revealed).toBe(true);
    expect(board.cells[first].nearby).toBe(0);
    for (const i of neighbors(first)) expect(board.cells[i].mine).toBe(false);
    board.cells.forEach((cell, i) =>
      expect(cell.nearby).toBe(
        neighbors(i).filter((n) => board.cells[n].mine).length,
      ),
    );
  }
  const won = newSweep();
  flagCell(won, 0);
  revealCell(won, 0);
  expect(won.status).toBe("ready");
  flagCell(won, 0);
  revealCell(won, 0, () => 0.37);
  won.cells.forEach((cell, index) => {
    if (!cell.mine) revealCell(won, index);
  });
  expect(won.status).toBe("won");
  expect(won.cells.filter((cell) => cell.flagged)).toHaveLength(10);
  revealCell(
    won,
    won.cells.findIndex((cell) => cell.mine),
  );
  expect(won.status).toBe("won");
  const lost = newSweep();
  revealCell(lost, 0, () => 0.37);
  revealCell(
    lost,
    lost.cells.findIndex((cell) => cell.mine),
  );
  expect(lost.status).toBe("lost");
  const snapshot = JSON.stringify(lost);
  flagCell(lost, 63);
  revealCell(lost, 63);
  expect(JSON.stringify(lost)).toBe(snapshot);
  const flags = newSweep();
  for (let i = 0; i < 12; i++) flagCell(flags, i);
  expect(flags.cells.filter((cell) => cell.flagged)).toHaveLength(10);
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.37;
  });
  await page.goto("/desktop/");
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
});

test("Memory can be solved, survives minimize, ignores extra flips, and resets cleanly", async ({
  page,
}) => {
  const cards = page.locator("[data-card]");
  await expect(cards).toHaveCount(12);
  const pairs = new Map<string, number[]>();
  for (let i = 0; i < 12; i += 2) {
    await cards.nth(i).click();
    const first = (await cards.nth(i).textContent())!;
    await cards.nth(i).click({ force: true });
    await expect(page.locator("[data-memory-status]")).toContainText(
      `${i / 2} moves`,
    );
    await cards.nth(i + 1).click();
    const second = (await cards.nth(i + 1).textContent())!;
    for (const [index, symbol] of [
      [i, first],
      [i + 1, second],
    ] as const)
      pairs.set(symbol, [...(pairs.get(symbol) ?? []), index]);
    if (first !== second) {
      await cards.nth((i + 2) % 12).click({ force: true });
      await expect(page.locator("[data-memory-status]")).toContainText(
        `${i / 2 + 1} moves`,
      );
      await expect(cards.nth(i)).toHaveAttribute("data-state", "hidden");
    }
  }
  for (const [a, b] of pairs.values()) {
    if ((await cards.nth(a).getAttribute("data-state")) === "matched") continue;
    await cards.nth(a).click();
    await cards.nth(b).click();
    await expect(cards.nth(a)).toHaveAttribute("data-state", "matched");
  }
  await expect(page.locator("[data-memory-status]")).toContainText(
    "All six pairs found",
  );
  await page
    .getByRole("button", { name: "Minimize Arcade", exact: true })
    .click();
  await expect(page.locator(arcade)).toBeHidden();
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await expect(page.locator(arcade)).toHaveCount(1);
  await expect(page.locator("[data-memory-status]")).toContainText(
    "All six pairs found",
  );
  await page.getByRole("button", { name: "New deal", exact: true }).click();
  await expect(page.locator('[data-card][data-state="hidden"]')).toHaveCount(
    12,
  );
  await expect(page.locator("[data-memory-status]")).toHaveText(
    "0 moves · 0 / 6 pairs found",
  );
  await page.getByRole("button", { name: "Close Arcade", exact: true }).click();
  await expect(page.locator('[data-task="arcade"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  await expect(page.locator("[data-memory-status]")).toHaveText(
    "0 moves · 0 / 6 pairs found",
  );
});

test("Bug Sweep supports keyboard movement, flag mode, safe opening and restart", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Bug Sweep", exact: true }).click();
  const cells = page.locator("[data-cell]");
  await expect(cells).toHaveCount(64);
  await cells.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(cells.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(cells.nth(9)).toBeFocused();
  await page.getByRole("button", { name: "Flag mode", exact: true }).click();
  await cells.nth(9).click();
  await expect(cells.nth(9)).toHaveAttribute("data-state", "flagged");
  await expect(page.locator("[data-sweep-count]")).toHaveText("1 / 10 flagged");
  await cells.nth(9).click();
  await expect(cells.nth(9)).toHaveAttribute("data-state", "hidden");
  await page.getByRole("button", { name: "Flag mode", exact: true }).click();
  await cells.nth(9).focus();
  await page.keyboard.press("Enter");
  await expect(cells.nth(9)).toHaveAttribute("data-state", "revealed");
  await expect(cells.nth(9)).toHaveAttribute("aria-label", /0 nearby bugs/);
  await expect(page.locator("[data-sweep-status]")).toContainText(
    "safe squares revealed",
  );
  const hidden = page.locator('[data-cell][data-state="hidden"]').first();
  await hidden.click({ button: "right" });
  await expect(page.locator("[data-sweep-count]")).toHaveText("1 / 10 flagged");
  await page.getByRole("button", { name: "New board", exact: true }).click();
  await expect(page.locator('[data-cell][data-state="hidden"]')).toHaveCount(
    64,
  );
  await expect(page.locator("[data-sweep-status]")).toHaveText(
    "Pick a square to begin.",
  );
});

test("terminal secrets are safe text, wallpaper is reversible, and cheat code ignores typing", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Terminal", exact: true }).click();
  const input = page.getByRole("textbox", {
    name: "Terminal command",
    exact: true,
  });
  const log = page.getByRole("log", { name: "Terminal output" });
  const run = async (value: string) => {
    await input.fill(value);
    await input.press("Enter");
  };
  await run("sudo make coffee");
  await expect(log).toContainText("Coffee compiled successfully");
  await run("cat README.txt");
  await expect(log).toContainText("resident code reviewer");
  await run("party");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-after-hours",
    "true",
  );
  await run("party");
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-after-hours",
    "false",
  );
  await run('<img src=x onerror="window.secretExecuted=true">');
  await expect(log).toContainText(
    '<img src=x onerror="window.secretExecuted=true">',
  );
  await expect(log.locator("img")).toHaveCount(0);
  await run("sudo rm -rf /");
  await expect(log).toContainText("revoked your sudo privileges");
  await run("clear");
  await expect(log).toHaveText("");
  for (const key of cheat) await input.press(key);
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-after-hours",
    "false",
  );
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  for (const key of cheat) await page.keyboard.press(key);
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-after-hours",
    "true",
  );
  for (const key of cheat) await page.keyboard.press(key);
  await expect(page.locator("[data-desktop]")).toHaveAttribute(
    "data-after-hours",
    "false",
  );
});

test("arcade stays accessible in both themes on a small touch screen without storage", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.reload();
  await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (theme) => (document.documentElement.dataset.theme = theme),
      theme,
    );
    for (const game of ["Memory", "Bug Sweep", "Terminal"]) {
      await page.getByRole("button", { name: game, exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
  await page.getByRole("button", { name: "Memory", exact: true }).click();
  await page.locator("[data-card]").first().click();
  await page.getByRole("button", { name: "Open Library", exact: true }).click();
  await expect(page.locator(arcade)).toBeHidden();
  await page.getByRole("button", { name: "Show Arcade", exact: true }).click();
  await expect(page.locator("[data-card]").first()).toHaveAttribute(
    "data-state",
    "face-up",
  );
  expect(errors).toEqual([]);
});

test("Bug Sweep finishes real winning and losing rounds and locks finished boards", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Bug Sweep", exact: true }).click();
  const cells = page.locator("[data-cell]");
  const expected = newSweep();
  revealCell(expected, 0, () => 0.37);
  await cells.first().click();
  for (let i = 0; i < 64; i++) {
    if (
      !expected.cells[i].mine &&
      (await cells.nth(i).getAttribute("data-state")) !== "revealed"
    )
      await cells.nth(i).click();
  }
  await expect(page.locator("[data-sweep-status]")).toHaveText(
    "Clean build! All 54 safe squares revealed.",
  );
  await expect(
    page.getByRole("button", { name: "Flag mode", exact: true }),
  ).toBeDisabled();
  await expect(page.locator('[data-cell][data-state="flagged"]')).toHaveCount(
    10,
  );
  await page.getByRole("button", { name: "New board", exact: true }).click();
  await cells.first().click();
  await cells.nth(expected.cells.findIndex((cell) => cell.mine)).click();
  await expect(page.locator("[data-sweep-status]")).toContainText(
    "Found a bug!",
  );
  await expect(page.locator('[data-cell][data-state="bug"]')).toHaveCount(10);
  await expect(
    page.getByRole("button", { name: "Flag mode", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "New board", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Flag mode", exact: true }),
  ).toBeEnabled();
  await expect(page.locator('[data-cell][data-state="hidden"]')).toHaveCount(
    64,
  );
});
