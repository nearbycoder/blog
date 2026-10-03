import css from "../styles/desktop-agenda.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { localState } from "./desktop-local-state";
import { notifyDesktop } from "./desktop-host";
import {
  AGENDA_KEY,
  agendaTime,
  exportAgendaIcs,
  isAgendaStore,
  localAgendaDay,
  validAgendaDate,
  type AgendaEvent,
  type AgendaStore,
} from "./desktop-agenda-data";
installAppStyle("agenda", css);

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("agenda-app");
  const controller = new AbortController();
  const listen = { signal: controller.signal };
  const state = localState<AgendaStore>(
    AGENDA_KEY,
    { version: 1, events: [] },
    isAgendaStore,
    3 * 1024 * 1024,
  );
  let selected = localAgendaDay(new Date());
  if (!validAgendaDate(selected)) selected = "2100-12-31";
  let month = selected.slice(0, 7);
  let editing: string | null = null;
  let previousFocus: HTMLElement | null = null;
  let lastDay = selected;
  const downloads = new Map<string, ReturnType<typeof setTimeout>>();
  root.innerHTML = `
    <div class="agenda-heading"><p>Your calendar, saved in this browser.</p><button type="button" data-agenda-new>New event</button><button type="button" data-agenda-export>Export .ics</button></div>
    <div class="agenda-body" data-agenda-overview>
      <section><div class="agenda-month"><button type="button" aria-label="Previous month" data-agenda-prev>‹</button><h2 data-agenda-month></h2><button type="button" aria-label="Next month" data-agenda-next>›</button></div>
      <div class="agenda-week" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      <div class="agenda-days" role="group" data-agenda-days></div><p class="agenda-calendar-help">Dots mark events. Use arrow keys to move between dates.</p><button type="button" data-agenda-today>Today</button>
      <section class="agenda-day-section"><h2 data-agenda-selected></h2><ul class="agenda-list" data-agenda-day-list></ul></section></section>
      <section><h2>Upcoming events</h2><label>Search upcoming events<input type="search" maxlength="160" data-agenda-search></label><ul class="agenda-list" data-agenda-upcoming></ul><p class="agenda-guidance">Events stay in this browser; there is no calendar sync. Reminders appear on this desktop only while Agenda is open in this tab. Missed reminders catch up when you reopen it. All-day reminders are due at 9 AM local time.</p></section>
    </div>
    <section class="agenda-editor" data-agenda-editor hidden><h2 data-agenda-editor-title>New event</h2><form data-agenda-form>
      <label>Event title<input name="title" maxlength="160" required autocomplete="off"></label>
      <div class="agenda-fields"><label>Date<input name="date" type="date" min="2000-01-01" max="2100-12-31" required></label><label>Time (optional)<input name="time" type="time"></label></div>
      <label>Details (optional)<textarea name="details" maxlength="2000" rows="4"></textarea></label>
      <label class="agenda-reminder"><input name="reminder" type="checkbox">Remind me when this event is due</label>
      <p class="agenda-guidance">Uses this device's local time. A reminder needs Agenda open in this tab; it is not an operating system notification.</p>
      <div class="agenda-actions"><button type="submit" data-agenda-save>Save event</button><button type="button" data-agenda-cancel>Cancel</button></div>
    </form></section>
    <p class="desk-app-status" role="status" data-agenda-status></p>`;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const form = find<HTMLFormElement>("[data-agenda-form]");
  const field = (name: string) =>
    form.elements.namedItem(name) as HTMLInputElement;
  const status = find<HTMLElement>("[data-agenda-status]");
  const days = find<HTMLElement>("[data-agenda-days]");
  const overview = find<HTMLElement>("[data-agenda-overview]");
  const editor = find<HTMLElement>("[data-agenda-editor]");
  const search = find<HTMLInputElement>("[data-agenda-search]");
  const prettyDay = (day: string) => {
    const [year, month, date] = day.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString(
      undefined,
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
  };
  function persist(events: AgendaEvent[], message: string) {
    state.save({ version: 1, events });
    status.textContent = `${message} ${state.message}`;
  }
  function renderCalendar() {
    const [year, number] = month.split("-").map(Number);
    const start = new Date(year, number - 1, 1, 12);
    const heading = start.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    find("[data-agenda-month]").textContent = heading;
    days.setAttribute("aria-label", `Days in ${heading}`);
    days.replaceChildren();
    const first = (start.getDay() + 6) % 7;
    for (let index = 0; index < first; index++)
      days.append(document.createElement("span"));
    const count = new Date(year, number, 0, 12).getDate();
    const today = localAgendaDay(new Date());
    for (let day = 1; day <= count; day++) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const total = state.value.events.filter(
        (event) => event.date === date,
      ).length;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.agendaDate = date;
      button.textContent = String(day);
      button.tabIndex = date === selected ? 0 : -1;
      button.setAttribute(
        "aria-label",
        `${prettyDay(date)}${total ? `, ${total} event${total === 1 ? "" : "s"}` : ", no events"}`,
      );
      button.setAttribute("aria-pressed", String(date === selected));
      if (date === today) button.setAttribute("aria-current", "date");
      if (total) button.classList.add("has-events");
      days.append(button);
    }
    find<HTMLButtonElement>("[data-agenda-prev]").disabled =
      month === "2000-01";
    find<HTMLButtonElement>("[data-agenda-next]").disabled =
      month === "2100-12";
    find("[data-agenda-selected]").textContent = prettyDay(selected);
  }
  function renderList(
    target: HTMLElement,
    events: AgendaEvent[],
    empty: string,
  ) {
    target.replaceChildren();
    if (!events.length) {
      const item = document.createElement("li");
      item.className = "agenda-empty";
      item.textContent = empty;
      target.append(item);
      return;
    }
    for (const event of events) {
      const card = document.createElement("li");
      card.className = "agenda-card";
      card.dataset.agendaEvent = event.id;
      const title = document.createElement("h3");
      title.textContent = event.title;
      const date = document.createElement("time");
      date.dateTime = event.date + (event.time ? `T${event.time}` : "");
      date.textContent = `${prettyDay(event.date)} · ${event.time || "All day"}`;
      if (event.time && agendaTime(event.date, event.time) === null)
        date.textContent +=
          " · This time does not exist in your current time zone. Edit the event to use reminders or export.";
      card.append(title, date);
      if (event.details) {
        const details = document.createElement("p");
        details.textContent = event.details;
        card.append(details);
      }
      if (event.reminder) {
        const note = document.createElement("p");
        note.textContent =
          event.firedAt === null ? "Reminder on" : "Reminder delivered";
        card.append(note);
      }
      const controls = document.createElement("div");
      controls.className = "agenda-actions";
      for (const action of ["edit", "delete"] as const) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.agendaAction = action;
        button.dataset.agendaId = event.id;
        button.textContent = action === "edit" ? "Edit" : "Delete";
        button.setAttribute(
          "aria-label",
          `${button.textContent} ${event.title}`,
        );
        controls.append(button);
      }
      card.append(controls);
      target.append(card);
    }
  }
  function render() {
    renderCalendar();
    const sorted = [...state.value.events].sort(
      (a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) ||
        a.title.localeCompare(b.title),
    );
    renderList(
      find("[data-agenda-day-list]"),
      sorted.filter((event) => event.date === selected),
      "No events on this day. Choose New event to add one.",
    );
    const query = search.value.trim().toLocaleLowerCase();
    renderList(
      find("[data-agenda-upcoming]"),
      sorted.filter(
        (event) =>
          event.date >= localAgendaDay(new Date()) &&
          `${event.title} ${event.details} ${event.date} ${event.time}`
            .toLocaleLowerCase()
            .includes(query),
      ),
      query
        ? "No upcoming events match your search."
        : "Your upcoming calendar is clear.",
    );
    find<HTMLButtonElement>("[data-agenda-new]").disabled =
      state.value.events.length >= 300;
    find<HTMLButtonElement>("[data-agenda-export]").disabled =
      state.value.events.length === 0;
  }
  function select(date: string, focus = false) {
    if (!validAgendaDate(date)) return;
    selected = date;
    month = date.slice(0, 7);
    render();
    if (focus)
      days
        .querySelector<HTMLButtonElement>(`[data-agenda-date="${date}"]`)
        ?.focus();
  }
  function openEditor(event?: AgendaEvent) {
    if (!event && state.value.events.length >= 300) return;
    previousFocus = document.activeElement as HTMLElement;
    editing = event?.id ?? null;
    find("[data-agenda-editor-title]").textContent = event
      ? "Edit event"
      : "New event";
    field("title").value = event?.title ?? "";
    field("date").value = event?.date ?? selected;
    field("time").value = event?.time ?? "";
    field("details").value = event?.details ?? "";
    field("reminder").checked = event?.reminder ?? false;
    overview.hidden = true;
    editor.hidden = false;
    field("title").focus();
  }
  function closeEditor() {
    editor.hidden = true;
    overview.hidden = false;
    editing = null;
    if (previousFocus?.isConnected) previousFocus.focus();
    else find<HTMLButtonElement>("[data-agenda-new]").focus();
  }
  find("[data-agenda-new]").addEventListener(
    "click",
    () => openEditor(),
    listen,
  );
  find("[data-agenda-cancel]").addEventListener("click", closeEditor, listen);
  find("[data-agenda-today]").addEventListener(
    "click",
    () => select(localAgendaDay(new Date()), true),
    listen,
  );
  search.addEventListener("input", render, listen);
  for (const [selector, delta] of [
    ["prev", -1],
    ["next", 1],
  ] as const) {
    find(`[data-agenda-${selector}]`).addEventListener(
      "click",
      () => {
        const [year, number] = month.split("-").map(Number);
        select(localAgendaDay(new Date(year, number - 1 + delta, 1, 12)));
      },
      listen,
    );
  }
  days.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-agenda-date]",
      );
      if (button) select(button.dataset.agendaDate!, true);
    },
    listen,
  );
  days.addEventListener(
    "keydown",
    (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-agenda-date]",
      );
      if (!target) return;
      const [year, month, day] = target.dataset
        .agendaDate!.split("-")
        .map(Number);
      const date = new Date(year, month - 1, day, 12);
      const weekday = (date.getDay() + 6) % 7;
      const shift: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
        Home: -weekday,
        End: 6 - weekday,
      };
      if (!(event.key in shift)) return;
      event.preventDefault();
      date.setDate(date.getDate() + shift[event.key]);
      select(localAgendaDay(date), true);
    },
    listen,
  );
  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-agenda-action]",
      );
      if (!button) return;
      const record = state.value.events.find(
        (item) => item.id === button.dataset.agendaId,
      );
      if (!record) return;
      if (button.dataset.agendaAction === "edit") openEditor(record);
      else {
        persist(
          state.value.events.filter((item) => item.id !== record.id),
          "Event deleted.",
        );
        render();
        find<HTMLButtonElement>("[data-agenda-new]").focus();
      }
    },
    listen,
  );
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const date = field("date").value,
        time = field("time").value;
      if (
        !validAgendaDate(date) ||
        agendaTime(date, time || "09:00") === null
      ) {
        status.textContent =
          "Choose a real date from 2000–2100 and a time that exists in your local time zone.";
        field(time ? "time" : "date").focus();
        return;
      }
      const old = state.value.events.find((item) => item.id === editing);
      const reminder = field("reminder").checked;
      const next: AgendaEvent = {
        id: old?.id ?? crypto.randomUUID(),
        title: field("title").value.trim(),
        details: field("details").value,
        date,
        time,
        reminder,
        firedAt:
          old &&
          old.date === date &&
          old.time === time &&
          old.reminder === reminder
            ? old.firedAt
            : null,
        createdAt: old?.createdAt ?? Date.now(),
      };
      const events = old
        ? state.value.events.map((item) => (item.id === old.id ? next : item))
        : [...state.value.events, next];
      if (!isAgendaStore({ version: 1, events })) {
        status.textContent =
          "Enter a title of 1–160 characters and details of at most 2,000 characters, without control characters.";
        field("title").focus();
        return;
      }
      persist(events, old ? "Event updated." : "Event added.");
      select(date);
      closeEditor();
      remind();
    },
    listen,
  );
  find("[data-agenda-export]").addEventListener(
    "click",
    () => {
      if (!state.value.events.length) return;
      try {
        const url = URL.createObjectURL(
          new Blob([exportAgendaIcs(state.value.events)], {
            type: "text/calendar;charset=utf-8",
          }),
        );
        downloads.set(
          url,
          setTimeout(() => {
            URL.revokeObjectURL(url);
            downloads.delete(url);
          }, 1000),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "desktop-agenda.ics";
        root.append(anchor);
        anchor.click();
        anchor.remove();
        status.textContent = `Exported ${state.value.events.length} events. Timed events use this device's current time zone; all-day dates stay all day.`;
      } catch (error) {
        status.textContent =
          error instanceof RangeError
            ? "An event time does not exist in your current time zone. Edit its date or time before exporting. Your events are still here."
            : "The calendar download could not start. Your events are still here.";
      }
    },
    listen,
  );
  function remind() {
    const now = Date.now();
    const due = state.value.events.filter(
      (event) =>
        event.reminder &&
        event.firedAt === null &&
        (agendaTime(event.date, event.time || "09:00") ?? Infinity) <= now,
    );
    if (due.length) {
      const ids = new Set(due.map((event) => event.id));
      persist(
        state.value.events.map((event) =>
          ids.has(event.id) ? { ...event, firedAt: now } : event,
        ),
        `${due.length} reminder${due.length === 1 ? "" : "s"} delivered.`,
      );
      for (const event of due)
        notifyDesktop(
          `Agenda: ${event.title} · ${prettyDay(event.date)}${event.time ? ` at ${event.time}` : " (all day)"}`,
          "reminder",
        );
      render();
    }
    const today = localAgendaDay(new Date());
    if (today !== lastDay) {
      lastDay = today;
      render();
    }
  }
  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) remind();
    },
    listen,
  );
  window.addEventListener("focus", remind, listen);
  const timer = setInterval(remind, 1000);
  render();
  status.textContent = state.message;
  remind();
  return () => {
    controller.abort();
    clearInterval(timer);
    for (const [url, timer] of downloads) {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    }
    downloads.clear();
  };
}
