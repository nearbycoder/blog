import { chooseOption } from "./helpers/custom-select";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { initialRobot, move } from "../src/lib/roomba";

test("robot respects obstacles and boundaries and cleans each square once", () => {
  let robot = initialRobot();
  robot = move(robot, "forward").robot;
  expect(robot.cleaned).toEqual(["1,0"]);
  robot = move(robot, "forward").robot;
  robot = move(robot, "right").robot;
  expect(move(robot, "forward")).toEqual({
    robot,
    message: "Blocked. Try a turn.",
  });
  robot = move(robot, "right").robot;
  robot = move(robot, "forward").robot;
  expect(robot.cleaned).toEqual(["1,0"]);
  robot = move(robot, "forward").robot;
  expect(move(robot, "forward").robot.x).toBe(0);
  expect(initialRobot().cleaned).toEqual([]);
});

test("robot program runs, replays, and can be cancelled and cleared", async ({
  page,
}) => {
  await page.goto("/lab/roomba/");
  const status = page.locator("#robot-status");
  await page.getByRole("button", { name: "+ Forward", exact: true }).click();
  await page.getByRole("button", { name: "+ Forward", exact: true }).click();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(status).toContainText("1 of 5 cleaned");
  await expect(status).toContainText("1 of 2 commands run");
  await page.getByRole("button", { name: "Run program", exact: true }).click();
  await expect(status).toContainText("2 of 2 commands run");
  await page.getByRole("button", { name: "Reset room" }).click();
  await expect(status).toContainText("0 of 5 cleaned");
  await page.getByRole("button", { name: "Run program", exact: true }).click();
  await page.getByRole("button", { name: "Clear program" }).click();
  await expect(page.locator("#program-queue li")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Run program", exact: true }),
  ).toBeDisabled();
  await expect(status).toContainText("0 of 0 commands run");
  for (let i = 0; i < 30; i++)
    await page
      .getByRole("button", { name: "+ Turn right", exact: true })
      .click();
  await expect(
    page.getByRole("button", { name: "+ Forward", exact: true }),
  ).toBeDisabled();
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("poll starts empty, replaces a vote, and resets without invented totals", async ({
  page,
}) => {
  await page.goto("/lab/poll/");
  await expect(page.locator('[data-votes="0"]')).toHaveText("0 votes");
  await page.getByRole("radio", { name: "It solves my own problem" }).check();
  await page.getByRole("button", { name: "Cast vote", exact: true }).click();
  await expect(page.locator('[data-votes="0"]')).toHaveText("1 vote");
  await page.getByRole("radio", { name: "It teaches me something" }).check();
  await page.getByRole("button", { name: "Replace vote", exact: true }).click();
  await expect(page.locator('[data-votes="0"]')).toHaveText("0 votes");
  await expect(page.locator('[data-votes="1"]')).toHaveText("1 vote");
  await page.getByRole("button", { name: "Reset vote", exact: true }).click();
  await expect(page.locator("#poll-status")).toContainText("0 total votes");
  await expect(
    page.getByRole("radio", { name: "It teaches me something" }),
  ).not.toBeChecked();
});

test("agent walkthrough exposes failures and changing scenarios resets its state", async ({
  page,
}) => {
  await page.goto("/lab/agent/");
  await page
    .getByRole("checkbox", { name: "Make the first tool call fail" })
    .check();
  await page.getByRole("button", { name: "Begin walkthrough" }).click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator("#agent-transcript")).toContainText(
    "The test runner is unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Walkthrough complete" }),
  ).toBeDisabled();
  await chooseOption(page, "Choose a scenario", "Share a build artifact");
  await expect(page.locator("#agent-transcript")).not.toContainText(
    "test runner",
  );
  await page
    .getByRole("checkbox", { name: "Make the first tool call fail" })
    .uncheck();
  await page.getByRole("button", { name: "Begin walkthrough" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator("#agent-transcript")).toContainText(
    "expiring download URL",
  );
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(
    page.getByRole("button", { name: "Begin walkthrough" }),
  ).toBeFocused();
});
