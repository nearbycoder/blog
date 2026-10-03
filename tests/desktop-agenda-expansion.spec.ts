import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import {
  AGENDA_KEY,
  exportAgendaIcs,
  isAgendaStore,
  validAgendaDate,
  type AgendaEvent,
} from "../src/scripts/desktop-agenda-data";

const sample: AgendaEvent = {
  id: "planning",
  title: "Plan the release",
  details: "Bring notes",
  date: "2099-10-03",
  time: "10:30",
  reminder: false,
  firedAt: null,
  createdAt: 1791036000000,
};
async function launch(page: Page) {
  await page
    .getByRole("button", { name: "Open application launcher", exact: true })
    .click();
  await page.locator('[data-launch-app="agenda"]').click();
  const app = page.locator('[data-window="agenda"]');
  await expect(app.locator(".agenda-app")).toBeVisible();
  return app;
}
async function openAgenda(page: Page, events: AgendaEvent[] = []) {
  await page.goto("/desktop/");
  await page.evaluate(
    ({ key, events }) =>
      localStorage.setItem(key, JSON.stringify({ version: 1, events })),
    { key: AGENDA_KEY, events },
  );
  return launch(page);
}
async function saved(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    AGENDA_KEY,
  );
}
async function create(app: Locator, title: string, date: string, time = "") {
  await app.getByRole("button", { name: "New event", exact: true }).click();
  await app.getByLabel("Event title", { exact: true }).fill(title);
  await app.getByLabel("Date", { exact: true }).fill(date);
  await app.getByLabel("Time (optional)", { exact: true }).fill(time);
  await app.getByRole("button", { name: "Save event", exact: true }).click();
}

test("Agenda validates real dates, bounded records and unique IDs without normalizing invalid data", () => {
  expect(validAgendaDate("2000-02-29")).toBe(true);
  for (const date of [
    "2100-02-29",
    "2026-02-30",
    "1999-12-31",
    "2101-01-01",
    "2026-2-01",
  ])
    expect(validAgendaDate(date)).toBe(false);
  expect(isAgendaStore({ version: 1, events: [sample] })).toBe(true);
  for (const value of [
    { version: 2, events: [] },
    { version: 1, events: [sample, sample] },
    { version: 1, events: [{ ...sample, date: "2026-02-30" }] },
    { version: 1, events: [{ ...sample, time: "24:00" }] },
    { version: 1, events: [{ ...sample, title: "x".repeat(161) }] },
    { version: 1, events: [{ ...sample, title: "  " }] },
    { version: 1, events: [{ ...sample, title: "meeting\nSUMMARY:injected" }] },
    { version: 1, events: [{ ...sample, details: "x".repeat(2001) }] },
    { version: 1, events: [{ ...sample, firedAt: -1 }] },
    { version: 1, events: [{ ...sample, unknown: true }] },
    {
      version: 1,
      events: Array.from({ length: 301 }, (_, index) => ({
        ...sample,
        id: `event-${index}`,
      })),
    },
  ])
    expect(isAgendaStore(value)).toBe(false);
});

test("ICS escapes text, folds UTF-8 at 75 octets and uses exclusive all-day end dates", () => {
  const events = [
    {
      ...sample,
      time: "",
      date: "2099-12-31",
      title: `A, B; C\\D ${"🗓️".repeat(25)}`,
      details: "one\r\ntwo\nthree; four, five\\six",
    },
  ];
  const content = exportAgendaIcs(events);
  const lines = content.split("\r\n");
  expect(lines.every((line) => Buffer.byteLength(line, "utf8") <= 75)).toBe(
    true,
  );
  const unfolded = content.replace(/\r\n /g, "");
  expect(unfolded).toContain(
    "DTSTART;VALUE=DATE:20991231\r\nDTEND;VALUE=DATE:21000101",
  );
  expect(unfolded).toContain("SUMMARY:A\\, B\\; C\\\\D ");
  expect(unfolded).toContain(
    "DESCRIPTION:one\\ntwo\\nthree\\; four\\, five\\\\six",
  );
  expect(unfolded).toContain("UID:planning@desktop.nearbycoder.local");
  expect(unfolded.endsWith("END:VCALENDAR\r\n")).toBe(true);
  const timed = exportAgendaIcs([sample]);
  expect(timed).toMatch(/DTSTART:\d{8}T\d{6}Z\r\n/);
  expect(timed).not.toContain("DTEND;VALUE=DATE");
});

test.describe("Agenda in local time", () => {
  test.use({ timezoneId: "America/Chicago" });
  test("calendar, CRUD, search and persistence work together", async ({
    page,
  }) => {
    const app = await openAgenda(page);
    await create(app, "First event", "2099-10-03", "13:15");
    await expect(app.locator('[data-agenda-date="2099-10-03"]')).toHaveClass(
      /has-events/,
    );
    await expect(
      app.locator('[data-agenda-date="2099-10-03"]'),
    ).toHaveAttribute("aria-label", /1 event$/);
    await app.locator('[data-agenda-date="2099-10-03"]').focus();
    await page.keyboard.press("ArrowRight");
    await expect(app.locator('[data-agenda-date="2099-10-04"]')).toBeFocused();
    await expect(app.locator("[data-agenda-day-list]")).toContainText(
      "No events",
    );
    await app
      .getByRole("button", { name: "Edit First event", exact: true })
      .click();
    await app
      .getByLabel("Event title", { exact: true })
      .fill("Release planning");
    await app
      .getByLabel("Details (optional)", { exact: true })
      .fill("Bring architecture notes");
    await app.getByLabel("Date", { exact: true }).fill("2099-10-05");
    await app.getByRole("button", { name: "Save event", exact: true }).click();
    await expect(
      app.locator('[data-agenda-date="2099-10-03"]'),
    ).not.toHaveClass(/has-events/);
    await app
      .getByRole("searchbox", { name: "Search upcoming events" })
      .fill("ARCHITECTURE");
    await expect(
      app.locator("[data-agenda-upcoming] .agenda-card"),
    ).toHaveCount(1);
    await app
      .getByRole("searchbox", { name: "Search upcoming events" })
      .fill("no match");
    await expect(app.locator("[data-agenda-upcoming]")).toContainText(
      "No upcoming events match",
    );
    await page.reload();
    await launch(page);
    await expect(app.locator("[data-agenda-upcoming]")).toContainText(
      "Release planning",
    );
    expect((await saved(page)).events[0]).toMatchObject({
      title: "Release planning",
      details: "Bring architecture notes",
      date: "2099-10-05",
      time: "13:15",
    });
    await app
      .getByRole("button", { name: "Delete Release planning", exact: true })
      .click();
    expect((await saved(page)).events).toEqual([]);
  });

  test("rejects DST gaps and safely renders user text", async ({ page }) => {
    const app = await openAgenda(page);
    await create(app, "Gap event", "2027-03-14", "02:30");
    await expect(app.locator("[data-agenda-status]")).toContainText(
      "time that exists",
    );
    expect((await saved(page)).events).toEqual([]);
    await app.getByLabel("Time (optional)", { exact: true }).fill("03:30");
    await app
      .getByLabel("Event title", { exact: true })
      .fill('<img src=x onerror="alert(1)">');
    await app.getByRole("button", { name: "Save event", exact: true }).click();
    await expect(app.locator(".agenda-card img")).toHaveCount(0);
    await expect(app.locator("[data-agenda-day-list]")).toContainText(
      '<img src=x onerror="alert(1)">',
    );
  });

  test("ICS download contains all events despite a filtered list", async ({
    page,
  }) => {
    const app = await openAgenda(page, [
      sample,
      {
        ...sample,
        id: "all-day",
        title: "New year",
        date: "2100-01-01",
        time: "",
      },
    ]);
    await app
      .getByRole("searchbox", { name: "Search upcoming events" })
      .fill("nothing");
    const pending = page.waitForEvent("download");
    await app.getByRole("button", { name: "Export .ics", exact: true }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe("desktop-agenda.ics");
    const content = await readFile((await download.path())!, "utf8");
    expect(content.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(content).toContain("DTSTART:20991003T153000Z");
    expect(content).toContain(
      "DTSTART;VALUE=DATE:21000101\r\nDTEND;VALUE=DATE:21000102",
    );
  });

  test("a time-zone change preserves saved events and identifies clock gaps before export", async ({
    page,
  }) => {
    // 02:30 exists in UTC but not in Chicago on this date. A restored or
    // travelling user's calendar must remain editable in the new zone.
    const event = {
      ...sample,
      date: "2027-03-14",
      time: "02:30",
      reminder: true,
    };
    const app = await openAgenda(page, [event]);
    await expect(app.locator("[data-agenda-upcoming]")).toContainText(
      event.title,
    );
    await expect(app.locator("[data-agenda-upcoming]")).toContainText(
      "This time does not exist in your current time zone",
    );
    expect((await saved(page)).events).toEqual([event]);
    await app.getByRole("button", { name: "Export .ics", exact: true }).click();
    await expect(app.locator("[data-agenda-status]")).toContainText(
      "Edit its date or time before exporting",
    );
    await app
      .getByRole("button", { name: `Edit ${event.title}`, exact: true })
      .click();
    await app.getByLabel("Time (optional)", { exact: true }).fill("03:30");
    await app.getByRole("button", { name: "Save event", exact: true }).click();
    const pending = page.waitForEvent("download");
    await app.getByRole("button", { name: "Export .ics", exact: true }).click();
    const content = await readFile((await (await pending).path())!, "utf8");
    expect(content).toContain("DTSTART:20270314T083000Z");
    expect((await saved(page)).events[0].time).toBe("03:30");
  });

  test("fall-back times use the first local occurrence while all-day exports keep their dates", async ({
    page,
  }) => {
    const app = await openAgenda(page, [
      { ...sample, date: "2027-11-07", time: "01:30" },
      { ...sample, id: "all-day", date: "2027-11-07", time: "" },
    ]);
    const pending = page.waitForEvent("download");
    await app.getByRole("button", { name: "Export .ics", exact: true }).click();
    const content = await readFile((await (await pending).path())!, "utf8");
    expect(content).toContain("DTSTART:20271107T063000Z");
    expect(content).toContain(
      "DTSTART;VALUE=DATE:20271107\r\nDTEND;VALUE=DATE:20271108",
    );
  });

  test("reminders continue while minimized or on another desktop, without repeating", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-10-03T13:59:55Z") });
    const app = await openAgenda(page, [
      { ...sample, date: "2026-10-03", time: "09:00", reminder: true },
      {
        ...sample,
        id: "second",
        date: "2026-10-03",
        time: "09:01",
        reminder: true,
      },
    ]);
    await app
      .getByRole("button", { name: "Minimize Agenda", exact: true })
      .click();
    await expect(app).toBeHidden();
    await page.clock.fastForward(10_000);
    expect((await saved(page)).events[0].firedAt).toBeGreaterThan(0);
    const firstFired = (await saved(page)).events[0].firedAt;
    await page
      .getByRole("button", { name: "Show Agenda", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open application launcher", exact: true })
      .click();
    await page.locator('[data-launch-app="workspaces"]').click();
    const spaces = page.locator('[data-window="workspaces"]');
    await spaces.getByLabel("New desktop name").fill("Elsewhere");
    await spaces
      .getByRole("button", { name: "Create desktop", exact: true })
      .click();
    await spaces
      .getByRole("button", { name: "Switch to Elsewhere", exact: true })
      .click();
    await expect(app).toBeHidden();
    await page.clock.fastForward(60_000);
    expect((await saved(page)).events[1].firedAt).toBeGreaterThan(0);
    expect((await saved(page)).events[0].firedAt).toBe(firstFired);
  });

  test("reminders persist fired markers, catch up on reopen and stop on close", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-10-03T13:59:55Z") });
    await page.addInitScript(() => {
      const state = window as typeof window & { agendaReminders: unknown[] };
      state.agendaReminders = [];
      document.addEventListener("desktop-notify", (event) => {
        const detail = (event as CustomEvent).detail;
        if (detail.kind === "reminder")
          state.agendaReminders.push(detail.message);
      });
    });
    const app = await openAgenda(page, [
      { ...sample, date: "2026-10-03", time: "", reminder: true },
      {
        ...sample,
        id: "later",
        title: "Later event",
        date: "2026-10-03",
        time: "09:05",
        reminder: true,
      },
    ]);
    const reminders = () =>
      page.evaluate(
        () =>
          (window as typeof window & { agendaReminders: unknown[] })
            .agendaReminders,
      );
    expect(await reminders()).toEqual([]);
    await page.clock.fastForward(10_000);
    expect(await reminders()).toHaveLength(1);
    expect((await saved(page)).events[0].firedAt).toBeGreaterThan(0);
    await page.reload();
    await launch(page);
    await page.clock.fastForward(1000);
    expect(await reminders()).toEqual([]);
    await app
      .getByRole("button", { name: "Close Agenda", exact: true })
      .click();
    await page.clock.fastForward(10 * 60_000);
    expect(await reminders()).toEqual([]);
    await launch(page);
    expect(await reminders()).toHaveLength(1);
    expect((await saved(page)).events[1].firedAt).toBeGreaterThan(0);
  });

  test("invalid storage survives edits, and the calendar and form fit at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/desktop/");
    const original = '{"version":4,"events":["keep me"]}';
    await page.evaluate(
      ({ key, original }) => localStorage.setItem(key, original),
      { key: AGENDA_KEY, original },
    );
    const app = await launch(page);
    await expect(app.locator("[data-agenda-status]")).toContainText(
      "original is preserved",
    );
    expect(
      await app
        .locator(".agenda-app")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await create(app, "Visit only", "2099-10-03");
    await expect(app.locator("[data-agenda-day-list]")).toContainText(
      "Visit only",
    );
    await expect(app.locator("[data-agenda-status]")).toContainText(
      "original is preserved",
    );
    expect(
      await page.evaluate((key) => localStorage.getItem(key), AGENDA_KEY),
    ).toBe(original);
    await app.getByRole("button", { name: "New event", exact: true }).click();
    expect(
      await app
        .locator(".agenda-editor")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(
      await app
        .locator(".agenda-days")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    for (const input of await app
      .locator(
        "[data-agenda-editor] input:not([type=checkbox]), [data-agenda-editor] textarea",
      )
      .all())
      expect(
        await input.evaluate((element) =>
          parseFloat(getComputedStyle(element).fontSize),
        ),
      ).toBeGreaterThanOrEqual(16);
    expect(
      (await app.locator(".agenda-reminder").boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
    const accessibility = await new AxeBuilder({ page })
      .include("[data-window=agenda]")
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
