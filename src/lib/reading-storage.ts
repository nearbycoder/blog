export const READING_KEY = "nearbycoder:reading:v1";
export type ReadingEntry = {
  saved: boolean;
  heading: string;
  completed: boolean;
  updated: number;
};
export type ReadingState = Record<string, ReadingEntry>;
const safeSlug = /^[a-z0-9][a-z0-9-]{0,199}$/;
export function parseReadingState(raw: string | null): ReadingState {
  const clean: ReadingState = Object.create(null);
  try {
    if (!raw || raw.length > 100000) return clean;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return clean;
    for (const [id, entry] of Object.entries(value).slice(0, 100)) {
      if (!safeSlug.test(id) || !entry || typeof entry !== "object") continue;
      const e = entry as Partial<ReadingEntry>;
      if (
        typeof e.saved !== "boolean" ||
        typeof e.completed !== "boolean" ||
        typeof e.heading !== "string" ||
        e.heading.length > 300 ||
        !Number.isFinite(e.updated) ||
        Number(e.updated) < 0
      )
        continue;
      clean[id] = {
        saved: e.saved,
        heading: e.heading,
        completed: e.completed,
        updated: Number(e.updated),
      };
    }
  } catch {
    /* Corrupt or unavailable browser storage starts empty. */
  }
  return clean;
}
export function readReadingState(): ReadingState {
  try {
    return parseReadingState(localStorage.getItem(READING_KEY));
  } catch {
    return Object.create(null);
  }
}
export function updateReadingEntry(
  id: string,
  patch: Partial<ReadingEntry>,
): boolean {
  if (!safeSlug.test(id)) return false;
  const state = readReadingState();
  state[id] = {
    ...(state[id] ?? { saved: false, heading: "", completed: false }),
    ...patch,
    updated: Date.now(),
  };
  const bounded = Object.fromEntries(
    Object.entries(state)
      .sort((a, b) => b[1].updated - a[1].updated)
      .slice(0, 100),
  );
  try {
    localStorage.setItem(READING_KEY, JSON.stringify(bounded));
    window.dispatchEvent(new CustomEvent("readingchange"));
    return true;
  } catch {
    return false;
  }
}
export function removeReadingEntry(id: string): boolean {
  const state = readReadingState();
  delete state[id];
  try {
    localStorage.setItem(READING_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("readingchange"));
    return true;
  } catch {
    return false;
  }
}
export function clearReadingState(): boolean {
  try {
    localStorage.removeItem(READING_KEY);
    window.dispatchEvent(new CustomEvent("readingchange"));
    return true;
  } catch {
    return false;
  }
}
