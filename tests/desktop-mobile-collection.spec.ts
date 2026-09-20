import { expect, test, type Locator, type Page } from "@playwright/test";
import { desktopApps, type DesktopAppId } from "../src/lib/desktop-apps";

const mobileViewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
];

// Text-entry controls and native selects can trigger mobile browser zoom below
// 16px. Sliders, color pickers, checkboxes, and buttons do not accept text.
const editableControls = [
  'input:not([type="hidden"]):not([type="range"]):not([type="color"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"])',
  "textarea",
  "select",
  '[contenteditable="true"]',
]
  .map((selector) => `${selector}:visible:not(:disabled):not([readonly])`)
  .join(", ");

async function openApp(page: Page, id: DesktopAppId) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator(`[data-launch-app="${id}"]`).click();
  const app = page.locator(`[data-window="${id}"]`);
  await expect(app).toBeVisible();
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator(".desktop-app-content")).not.toBeEmpty();
  return app;
}

async function expectHorizontalContainment(app: Locator) {
  const overflow = await app.evaluate((windowElement) => {
    const viewportWidth = document.documentElement.clientWidth;
    const problems: string[] = [];
    const bounds = windowElement.getBoundingClientRect();
    if (bounds.left < -1 || bounds.right > viewportWidth + 1)
      problems.push(`window spans ${bounds.left}–${bounds.right}px`);
    for (const element of [document.documentElement, document.body]) {
      if (element.scrollWidth > viewportWidth + 1)
        problems.push(
          `${element.tagName}: ${element.scrollWidth}px page width`,
        );
    }
    for (const element of [
      windowElement,
      ...windowElement.querySelectorAll<HTMLElement>("*"),
    ]) {
      if (!element.getClientRects().length || !element.clientWidth) continue;
      // Long editor lines may scroll inside their text control. App panels,
      // toolbars, and game boards must still fit the phone's available width.
      if (element.matches("input, textarea, select")) continue;
      const isLayoutRoot =
        element === windowElement ||
        element.classList.contains("desktop-app-content");
      const isScrollable = ["auto", "scroll"].includes(
        getComputedStyle(element).overflowX,
      );
      if (
        (isLayoutRoot || isScrollable) &&
        element.scrollWidth > element.clientWidth + 1
      ) {
        problems.push(
          `${element.className || element.tagName}: ${element.scrollWidth}px content in ${element.clientWidth}px`,
        );
      }
    }
    return problems;
  });
  expect(
    overflow,
    "The page and app panels fit without horizontal scrolling",
  ).toEqual([]);
}

async function expectReadableInputs(app: Locator) {
  const undersized = await app
    .locator(editableControls)
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
        return fontSize >= 16
          ? []
          : [
              {
                control:
                  element.getAttribute("aria-label") ||
                  element.id ||
                  element.getAttribute("name") ||
                  element.tagName,
                fontSize,
              },
            ];
      }),
    );
  expect(
    undersized,
    "Every visible editable field uses at least 16px text",
  ).toEqual([]);
}

async function expectActiveTaskInView(page: Page, id: DesktopAppId) {
  const task = page.locator(`[data-task="${id}"]`);
  await expect(task).toHaveAttribute("aria-pressed", "true");
  const stripBounds = (await page.locator(".desktop-tasks").boundingBox())!;
  const taskBounds = (await task.boundingBox())!;
  expect(taskBounds.x).toBeGreaterThanOrEqual(stripBounds.x - 1);
  expect(taskBounds.x + taskBounds.width).toBeLessThanOrEqual(
    stripBounds.x + stripBounds.width + 1,
  );
  await expect(task).toBeInViewport({ ratio: 1 });
}

for (const viewport of mobileViewports) {
  test.describe(`mobile app collection at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport, isMobile: true, hasTouch: true });

    for (const metadata of desktopApps) {
      test(`${metadata.title} fits, keeps inputs readable, and restores from its task`, async ({
        page,
      }) => {
        await page.goto("/desktop/");
        const app = await openApp(page, metadata.id);
        await expectHorizontalContainment(app);
        await expectReadableInputs(app);

        // Reveal the primary editor when the app intentionally starts empty or
        // read-only, and include the clock's optional search field in the audit.
        const revealEditor: Partial<Record<DesktopAppId, string>> = {
          notes: "+ New note",
          tasks: "+ New task",
          typing: "Start sprint",
          worldclock: "Add city",
        };
        const editorButton = revealEditor[metadata.id];
        if (editorButton) {
          await app
            .getByRole("button", { name: editorButton, exact: true })
            .click();
          await expectHorizontalContainment(app);
          await expectReadableInputs(app);
        }

        const fields = app.locator(editableControls);
        if (await fields.count()) {
          const field = fields.first();
          await field.focus();
          await expect(field).toBeFocused();
          // Check that keyboard users can leave and return to an app input
          // without the shell stealing focus or trapping it in that field.
          await page.keyboard.press("Tab");
          await expect(field).not.toBeFocused();
          await page.keyboard.press("Shift+Tab");
          await expect(field).toBeFocused();
          await expectHorizontalContainment(app);
        }

        const minimize = app.getByRole("button", {
          name: `Minimize ${metadata.title}`,
          exact: true,
        });
        const close = app.getByRole("button", {
          name: `Close ${metadata.title}`,
          exact: true,
        });
        await expect(minimize).toBeInViewport({ ratio: 1 });
        await expect(close).toBeInViewport({ ratio: 1 });
        await close.click({ trial: true });
        await minimize.click();
        await expect(app).toBeHidden();

        const task = page.locator(`[data-task="${metadata.id}"]`);
        await expect(task).toHaveAttribute("aria-pressed", "false");
        await expect(task).toBeInViewport({ ratio: 1 });
        await task.click();
        await expect(app).toBeVisible();
        await expect(app).toBeFocused();
        await expectActiveTaskInView(page, metadata.id);
        await expectHorizontalContainment(app);
        await close.click();
        await expect(app).toHaveCount(0);
        await expect(task).toHaveCount(0);
      });
    }

    test("all 24 apps remain reachable when the mobile taskbar is full", async ({
      page,
    }) => {
      await page.goto("/desktop/");
      for (const metadata of desktopApps) {
        await openApp(page, metadata.id);
        await expectActiveTaskInView(page, metadata.id);
      }
      await expect(page.locator(".utility-window")).toHaveCount(
        desktopApps.length,
      );
      await expect(page.locator(".utility-window:visible")).toHaveCount(1);
      expect(
        await page
          .locator(".desktop-tasks")
          .evaluate((strip) => strip.scrollWidth > strip.clientWidth),
      ).toBe(true);

      // Traverse the whole overflowing strip in reverse, using real task
      // buttons. Restoring one mobile window must not discard any others.
      for (const metadata of [...desktopApps].reverse()) {
        const task = page.locator(`[data-task="${metadata.id}"]`);
        await task.scrollIntoViewIfNeeded();
        await task.click();
        const app = page.locator(`[data-window="${metadata.id}"]`);
        await expect(app).toBeVisible();
        await expect(app).toBeFocused();
        await expectActiveTaskInView(page, metadata.id);
        await expect(page.locator(".utility-window:visible")).toHaveCount(1);
        await expectHorizontalContainment(app);
        await expectReadableInputs(app);
      }
      await expect(page.locator(".utility-window")).toHaveCount(
        desktopApps.length,
      );
    });
  });
}
