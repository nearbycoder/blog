import { test, expect, type Page, type Locator } from "@playwright/test";

async function setVolume(slider: Locator, value: number) {
  await slider.press("Home");
  for (let step = 0; step < value; step++) await slider.press("ArrowRight");
}

async function mockAudio(page: Page) {
  await page.addInitScript(() => {
    const metrics = {
      contexts: 0,
      closed: 0,
      started: 0,
      stopped: 0,
      disconnected: 0,
      gains: [] as number[],
    };
    Object.assign(window, { soundscapeAudioMetrics: metrics });
    const node = () => ({
      connect() {},
      disconnect() {
        metrics.disconnected++;
      },
      start() {
        metrics.started++;
      },
      stop() {
        metrics.stopped++;
      },
    });
    class MockAudioContext {
      sampleRate = 1000;
      currentTime = 0;
      destination = {};
      constructor() {
        metrics.contexts++;
      }
      createGain() {
        return {
          ...node(),
          gain: {
            value: 0,
            cancelScheduledValues() {},
            setTargetAtTime(value: number) {
              metrics.gains.push(value);
            },
          },
        };
      }
      createOscillator() {
        return { ...node(), frequency: { value: 0 }, type: "sine" };
      }
      createBufferSource() {
        return { ...node(), loop: false, loopStart: 0, buffer: null };
      }
      createBuffer(_channels: number, length: number) {
        const samples = new Float32Array(length);
        return {
          getChannelData() {
            return samples;
          },
        };
      }
      resume() {
        return Promise.resolve();
      }
      close() {
        metrics.closed++;
        return Promise.resolve();
      }
    }
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });
  });
}

async function metrics(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          soundscapeAudioMetrics: {
            contexts: number;
            closed: number;
            started: number;
            stopped: number;
            disconnected: number;
            gains: number[];
          };
        }
      ).soundscapeAudioMetrics,
  );
}

async function launch(page: Page) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="soundscape"]').click();
  const app = page.locator('[data-window="soundscape"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator(".soundscape-app")).toBeVisible();
  return app;
}

test("synthesizes only after Play, applies live gains, and restores preferences without playback", async ({
  page,
}) => {
  await mockAudio(page);
  await page.goto("/desktop/");
  let app = await launch(page);
  expect((await metrics(page)).contexts).toBe(0);
  await app
    .getByRole("button", { name: "Bright and even", exact: true })
    .click();
  await expect(
    app.getByLabel("White noise volume", { exact: true }),
  ).toHaveValue("60");
  await expect(
    app.getByLabel("Brown noise volume", { exact: true }),
  ).toHaveValue("0");
  await setVolume(app.getByLabel("Master volume", { exact: true }), 20);
  await setVolume(app.getByLabel("Gentle tone volume", { exact: true }), 30);
  expect((await metrics(page)).contexts).toBe(0);
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "playing",
  );
  expect((await metrics(page)).started).toBe(4);
  expect(
    (await metrics(page)).gains.some(
      (value) => Math.abs(value - 0.13) < 0.00001,
    ),
  ).toBe(true);
  await setVolume(app.getByLabel("Master volume", { exact: true }), 0);
  expect((await metrics(page)).gains.slice(-5)[0]).toBe(0);
  await app.getByRole("button", { name: "Stop", exact: true }).click();
  expect(await metrics(page)).toMatchObject({
    contexts: 1,
    closed: 1,
    stopped: 4,
    disconnected: 9,
  });
  await app.locator('[data-window-action="close"]').click();
  app = await launch(page);
  await expect(
    app.getByLabel("Gentle tone volume", { exact: true }),
  ).toHaveValue("30");
  await expect(app.getByLabel("Master volume", { exact: true })).toHaveValue(
    "0",
  );
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "stopped",
  );
  expect((await metrics(page)).contexts).toBe(1);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nearby-desktop-soundscape-v1")!),
  );
  expect(saved).not.toHaveProperty("playing");
  expect(saved).not.toHaveProperty("state");
});

test("sleep timer expires and releases sources; changing the timer restarts its countdown", async ({
  page,
}) => {
  await mockAudio(page);
  await page.clock.install();
  await page.goto("/desktop/");
  const app = await launch(page);
  await app.getByLabel("Sleep timer", { exact: true }).selectOption("5");
  await expect(app.locator("[data-timer]")).toHaveText(
    "5-minute timer starts with Play",
  );
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await expect(app.locator("[data-timer]")).toHaveText("Stops in 5:00");
  await page.clock.fastForward(60_000);
  await expect(app.locator("[data-timer]")).toHaveText("Stops in 4:00");
  await app.getByLabel("Sleep timer", { exact: true }).selectOption("15");
  await expect(app.locator("[data-timer]")).toHaveText("Stops in 15:00");
  await app.getByLabel("Sleep timer", { exact: true }).selectOption("0");
  await page.clock.fastForward(16 * 60_000);
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "playing",
  );
  await app.getByLabel("Sleep timer", { exact: true }).selectOption("5");
  await page.clock.fastForward(5 * 60_000);
  await expect(app.locator("[data-playback-message]")).toHaveText(
    "Sleep timer finished. Sound stopped.",
  );
  await expect(
    app.getByRole("button", { name: "Play", exact: true }),
  ).toBeEnabled();
  expect(await metrics(page)).toMatchObject({ closed: 1, stopped: 4 });
});

test("minimize, document visibility, and close stop audio without automatic restart", async ({
  page,
}) => {
  await mockAudio(page);
  await page.goto("/desktop/");
  let app = await launch(page);
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await app.locator('[data-window-action="minimize"]').click();
  await expect.poll(async () => (await metrics(page)).closed).toBe(1);
  app = await launch(page);
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "stopped",
  );
  expect((await metrics(page)).contexts).toBe(1);
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(app.locator(".soundscape-app")).toHaveAttribute(
    "data-playback",
    "stopped",
  );
  expect((await metrics(page)).closed).toBe(2);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await metrics(page)).contexts).toBe(2);
  await app.getByRole("button", { name: "Play", exact: true }).click();
  await app.locator('[data-window-action="close"]').click();
  expect(await metrics(page)).toMatchObject({
    contexts: 3,
    closed: 3,
    started: 12,
    stopped: 12,
    disconnected: 27,
  });
});

test("preserves malformed preferences and remains usable at mobile width in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockAudio(page);
  await page.addInitScript(() =>
    localStorage.setItem("nearby-desktop-soundscape-v1", '{"master":9000}'),
  );
  await page.goto("/desktop/");
  const app = await launch(page);
  await expect(app.locator("[data-storage]")).toContainText(
    "original data is unchanged",
  );
  await app.getByRole("button", { name: "Low and warm", exact: true }).click();
  await app.getByLabel("Master volume", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(app.getByLabel("Master volume", { exact: true })).toHaveValue(
    "41",
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("nearby-desktop-soundscape-v1"),
    ),
  ).toBe('{"master":9000}');
  for (let index = 0; index < 2; index++) {
    expect(
      await app
        .locator(".soundscape-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await app.getByLabel("Sleep timer", { exact: true }).selectOption("30");
    await expect(app.locator("[data-timer]")).toHaveText(
      "30-minute timer starts with Play",
    );
    await page
      .getByRole("button", { name: "Toggle color theme", exact: true })
      .click();
  }
  expect((await metrics(page)).contexts).toBe(0);
});
