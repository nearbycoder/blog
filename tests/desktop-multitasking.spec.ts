import { expect, test } from "@playwright/test";
import { desktopApps } from "../src/lib/desktop-apps";

test("a full app collection keeps the active task reachable and switches back without losing windows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/desktop/");
  const launch = async (id: string) => {
    await page
      .getByRole("button", { name: "Open application launcher", exact: true })
      .click();
    await page.locator(`[data-launch-app="${id}"]`).click();
    await expect(
      page.locator(`[data-window="${id}"] .utility-loading`),
    ).toHaveCount(0);
  };
  const taskIsInView = async (id: string) => {
    const strip = (await page.locator(".desktop-tasks").boundingBox())!;
    const task = (await page.locator(`[data-task="${id}"]`).boundingBox())!;
    expect(task.x).toBeGreaterThanOrEqual(strip.x - 1);
    expect(task.x + task.width).toBeLessThanOrEqual(strip.x + strip.width + 1);
    await expect(page.locator(`[data-task="${id}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  };
  for (const app of desktopApps) await launch(app.id);
  await expect(page.locator(".utility-window")).toHaveCount(desktopApps.length);
  await taskIsInView(desktopApps.at(-1)!.id);
  await launch("notes");
  await taskIsInView("notes");
  await expect(page.locator(".utility-window")).toHaveCount(desktopApps.length);
  await page.getByRole("button", { name: "Show desktop", exact: true }).click();
  await expect(page.locator(".utility-window:visible")).toHaveCount(0);
  await page.getByRole("button", { name: "Show desktop", exact: true }).click();
  await expect(page.locator(".utility-window:visible")).toHaveCount(
    desktopApps.length,
  );
  expect(errors).toEqual([]);
});
