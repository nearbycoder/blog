export const AGENDA_KEY = "nearby-desktop-agenda-v1";
export type AgendaEvent = {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  reminder: boolean;
  firedAt: number | null;
  createdAt: number;
};
export type AgendaStore = { version: 1; events: AgendaEvent[] };

export function validAgendaDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 2000 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Construct a wall-clock time, rejecting DST gaps instead of silently moving it. */
export function agendaTime(date: string, time = "09:00"): number | null {
  if (!validAgendaDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const local = new Date(year, month - 1, day, hour, minute);
  return local.getFullYear() === year &&
    local.getMonth() === month - 1 &&
    local.getDate() === day &&
    local.getHours() === hour &&
    local.getMinutes() === minute
    ? local.getTime()
    : null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const timestamp = (value: unknown) =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value <= 8640000000000000;
export function isAgendaStore(value: unknown): value is AgendaStore {
  if (
    !record(value) ||
    Object.keys(value).sort().join(",") !== "events,version" ||
    value.version !== 1 ||
    !Array.isArray(value.events) ||
    value.events.length > 300
  )
    return false;
  const ids = new Set<string>();
  for (const event of value.events) {
    if (
      !record(event) ||
      Object.keys(event).sort().join(",") !==
        "createdAt,date,details,firedAt,id,reminder,time,title" ||
      typeof event.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,80}$/.test(event.id) ||
      ids.has(event.id) ||
      typeof event.title !== "string" ||
      event.title !== event.title.trim() ||
      !event.title ||
      event.title.length > 160 ||
      /[\u0000-\u001f\u007f-\u009f]/.test(event.title) ||
      typeof event.details !== "string" ||
      event.details.length > 2000 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(
        event.details,
      ) ||
      typeof event.date !== "string" ||
      !validAgendaDate(event.date) ||
      typeof event.time !== "string" ||
      // Stored times are local wall times. Changing the device's time zone
      // must not make an otherwise valid calendar unreadable.
      (event.time !== "" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) ||
      typeof event.reminder !== "boolean" ||
      (event.firedAt !== null && !timestamp(event.firedAt)) ||
      !timestamp(event.createdAt)
    )
      return false;
    ids.add(event.id);
  }
  return true;
}

export function localAgendaDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function icsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}
function foldIcs(line: string): string {
  const encoder = new TextEncoder();
  let output = "",
    bytes = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (bytes + length > 75) {
      output += "\r\n ";
      bytes = 1;
    }
    output += character;
    bytes += length;
  }
  return output;
}
const utcIcs = (milliseconds: number) =>
  new Date(milliseconds)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
export function exportAgendaIcs(events: AgendaEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nearbycoder//Desktop Agenda//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@desktop.nearbycoder.local`,
      `DTSTAMP:${utcIcs(event.createdAt)}`,
    );
    if (event.time) {
      const time = agendaTime(event.date, event.time);
      if (time === null)
        throw new RangeError(
          "Event time is outside the current time zone's clock.",
        );
      lines.push(`DTSTART:${utcIcs(time)}`);
    } else {
      const [year, month, day] = event.date.split("-").map(Number);
      const end = new Date(Date.UTC(year, month - 1, day + 1))
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "");
      lines.push(
        `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${end}`,
      );
    }
    lines.push(`SUMMARY:${icsText(event.title)}`);
    if (event.details) lines.push(`DESCRIPTION:${icsText(event.details)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcs).join("\r\n") + "\r\n";
}
