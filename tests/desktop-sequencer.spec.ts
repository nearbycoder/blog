import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const storageKey = "nearby-desktop-sequencer-v1";
type BeatAudioMetrics = {
  created: number;
  closed: number;
  starts: number;
  connections: number;
  immediateStops: number;
  audioTime: number | null;
  startTimes: number[];
};

async function openBeatLab(page: Page) {
  await page.goto("/desktop/");
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="sequencer"]').click();
  const app = page.locator('[data-window="sequencer"]');
  await expect(app.locator(".utility-loading")).toHaveCount(0);
  await expect(app.locator(".sequencer-app")).toBeVisible();
  return app;
}

async function stubAudio(page: Page) {
  await page.addInitScript(() => {
    const metrics: BeatAudioMetrics = {
      created: 0,
      closed: 0,
      starts: 0,
      connections: 0,
      immediateStops: 0,
      audioTime: null,
      startTimes: [],
    };
    Object.assign(window, { beatAudioMetrics: metrics });
    class Param {
      setValueAtTime() {}
      linearRampToValueAtTime() {}
      exponentialRampToValueAtTime() {}
      setTargetAtTime() {}
    }
    class Node {
      gain = new Param();
      frequency = new Param();
      Q = new Param();
      type = "sine";
      buffer = null;
      onended: (() => void) | null = null;
      connected = false;
      connect() {
        this.connected = true;
        metrics.connections++;
      }
      disconnect() {
        if (this.connected) metrics.connections--;
        this.connected = false;
      }
      start(time: number) {
        metrics.starts++;
        metrics.startTimes.push(time);
      }
      stop(time?: number) {
        if (time === undefined) metrics.immediateStops++;
      }
    }
    class FakeContext {
      state = "suspended";
      sampleRate = 44100;
      destination = new Node();
      startedAt = performance.now();
      constructor() {
        metrics.created++;
      }
      get currentTime() {
        return metrics.audioTime ?? (performance.now() - this.startedAt) / 1000;
      }
      async resume() {
        this.state = "running";
      }
      async close() {
        this.state = "closed";
        metrics.closed++;
      }
      createGain() {
        return new Node();
      }
      createOscillator() {
        return new Node();
      }
      createBufferSource() {
        return new Node();
      }
      createBiquadFilter() {
        return new Node();
      }
      createBuffer(_channels: number, length: number) {
        return { getChannelData: () => new Float32Array(length) };
      }
    }
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: FakeContext,
    });
  });
}

async function audioMetrics(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          beatAudioMetrics: BeatAudioMetrics;
        }
      ).beatAudioMetrics,
  );
}

async function setAudioTime(page: Page, time: number) {
  await page.evaluate((value) => {
    (
      window as unknown as { beatAudioMetrics: BeatAudioMetrics }
    ).beatAudioMetrics.audioTime = value;
  }, time);
}

test("Beat Lab edits with the keyboard, undoes clearing, validates tempo and saves a pattern", async ({
  page,
}) => {
  let app = await openBeatLab(page);
  const firstKick = app.getByRole("button", {
    name: "Kick, step 1",
    exact: true,
  });
  await expect(firstKick).toHaveAttribute("aria-pressed", "true");
  await firstKick.focus();
  await firstKick.press("ArrowRight");
  const secondKick = app.getByRole("button", {
    name: "Kick, step 2",
    exact: true,
  });
  await expect(secondKick).toBeFocused();
  await secondKick.press("Space");
  await expect(secondKick).toHaveAttribute("aria-pressed", "true");
  await app.getByRole("button", { name: "Clear pattern", exact: true }).click();
  await expect(app.locator('.sequencer-step[aria-pressed="true"]')).toHaveCount(
    0,
  );
  await app.getByRole("button", { name: "Undo change", exact: true }).click();
  await expect(secondKick).toHaveAttribute("aria-pressed", "true");
  await app.getByLabel("Tempo in BPM", { exact: true }).fill("201");
  await app.getByRole("button", { name: "Save pattern", exact: true }).click();
  await expect(app.getByRole("alert")).toContainText("40 to 200 BPM");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBeNull();
  await app.getByLabel("Tempo in BPM", { exact: true }).fill("137");
  await app.getByRole("button", { name: "Save pattern", exact: true }).click();
  await expect(app.locator("[data-sequencer-status]")).toHaveText(
    "Pattern saved on this device.",
  );
  app = await openBeatLab(page);
  await expect(
    app.getByRole("button", { name: "Kick, step 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(app.getByLabel("Tempo in BPM", { exact: true })).toHaveValue(
    "137",
  );
  await expect(app.locator(".sequencer-app")).toHaveAttribute(
    "data-playing",
    "false",
  );
});

test("Beat Lab creates audio only after Play and releases audio on stop, minimize, page hide and close", async ({
  page,
}) => {
  await stubAudio(page);
  const app = await openBeatLab(page);
  await app.getByRole("button", { name: "Kick, step 2", exact: true }).click();
  await app.getByRole("button", { name: "Save pattern", exact: true }).click();
  expect((await audioMetrics(page)).created).toBe(0);
  await app.locator("[data-sequencer-play]").click();
  await expect(app.locator(".sequencer-app")).toHaveAttribute(
    "data-playing",
    "true",
  );
  await expect
    .poll(async () => (await audioMetrics(page)).starts)
    .toBeGreaterThan(3);
  await app.locator("[data-sequencer-stop]").click();
  await expect.poll(async () => (await audioMetrics(page)).closed).toBe(1);
  expect((await audioMetrics(page)).connections).toBe(0);
  expect((await audioMetrics(page)).immediateStops).toBeGreaterThan(0);
  await app.locator("[data-sequencer-play]").click();
  await app.locator('[data-window-action="minimize"]').click();
  await expect(app).toBeHidden();
  await expect.poll(async () => (await audioMetrics(page)).closed).toBe(2);
  await page.locator('[data-task="sequencer"]').click();
  await expect(app.locator(".sequencer-app")).toHaveAttribute(
    "data-playing",
    "false",
  );
  expect((await audioMetrics(page)).created).toBe(2);
  await app.locator("[data-sequencer-play]").click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(async () => (await audioMetrics(page)).closed).toBe(3);
  await expect(app.locator("[data-sequencer-transport]")).toContainText(
    "Stopped while hidden",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await audioMetrics(page)).created).toBe(3);
  await app.locator("[data-sequencer-play]").click();
  await app.locator('[data-window-action="close"]').click();
  await expect(app).toHaveCount(0);
  const closedMetrics = await audioMetrics(page);
  expect(closedMetrics.closed).toBe(4);
  expect(closedMetrics.connections).toBe(0);
  await page.waitForTimeout(200);
  expect((await audioMetrics(page)).starts).toBe(closedMetrics.starts);
});

test("Beat Lab preserves malformed storage and fits both themes at phone width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    storageKey,
  );
  const app = await openBeatLab(page);
  await expect(app.locator("[data-sequencer-status]")).toContainText(
    "Original data is unchanged",
  );
  await expect(
    app.getByRole("button", { name: "Save pattern", exact: true }),
  ).toBeDisabled();
  await app.getByLabel("Beat preset", { exact: true }).selectOption("offbeat");
  await app.getByRole("button", { name: "Load preset", exact: true }).click();
  await expect(
    app.getByRole("button", { name: "Hi-hat, step 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe("{broken");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    expect(
      await app
        .locator(".sequencer-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .include('[data-window="sequencer"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});

test("Beat Lab skips missed steps without moving the bar off the audio clock", async ({
  page,
}) => {
  await stubAudio(page);
  const app = await openBeatLab(page);
  await setAudioTime(page, 0);
  await app.getByRole("button", { name: "Clear pattern", exact: true }).click();
  await app.getByRole("button", { name: "Kick, step 1", exact: true }).click();
  await app.getByRole("button", { name: "Kick, step 7", exact: true }).click();
  await app.getByLabel("Tempo in BPM", { exact: true }).fill("120");
  await app.locator("[data-sequencer-play]").click();
  await expect.poll(async () => (await audioMetrics(page)).starts).toBe(1);

  // Five unscheduled eighth notes elapse while the scheduling task is delayed.
  await setAudioTime(page, 1.48);
  await expect.poll(async () => (await audioMetrics(page)).starts).toBe(2);
  const times = (await audioMetrics(page)).startTimes;
  expect(times[0]).toBeCloseTo(0.025);
  expect(times[1]).toBeCloseTo(1.525);

  // A later stall also preserves the original bar position without a burst.
  await setAudioTime(page, 4.48);
  await page.waitForTimeout(60);
  expect((await audioMetrics(page)).starts).toBe(2);
  await setAudioTime(page, 5.48);
  await expect.poll(async () => (await audioMetrics(page)).starts).toBe(3);
  expect((await audioMetrics(page)).startTimes[2]).toBeCloseTo(5.525);
  await app.locator("[data-sequencer-stop]").click();
  expect((await audioMetrics(page)).connections).toBe(0);
});

test("Beat Lab keeps the pattern usable when saving is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  const app = await openBeatLab(page);
  await app.getByRole("button", { name: "Clear pattern", exact: true }).click();
  await app.getByRole("button", { name: "Snare, step 1", exact: true }).click();
  await app.getByRole("button", { name: "Save pattern", exact: true }).click();
  await expect(app.locator("[data-sequencer-status]")).toContainText(
    "Could not save on this device",
  );
  await expect(
    app.getByRole("button", { name: "Snare, step 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
