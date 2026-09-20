import type { ArcadeActivity } from "./desktop-arcade";
import type { WindowLayout } from "./desktop-window-layout";

export const STORAGE_KEY = "desktop-workspace:v1";

export type WindowPlacement = {
  left: string;
  top: string;
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  layout?: WindowLayout;
};

export type SavedWindow = {
  id: string;
  minimized: boolean;
  placement: WindowPlacement;
  source?: string;
  activity?: ArcadeActivity;
};

export type WorkspaceState = {
  version: 1;
  /** Back to front; minimized windows retain their position in the stack. */
  windows: SavedWindow[];
  active: string | null;
};

const MAX_WINDOWS = 64;
const MAX_BYTES = 64 * 1024;
const fields = [
  "left",
  "top",
  "width",
  "height",
  "minWidth",
  "minHeight",
] as const;
const layouts = new Set<WindowLayout>([
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "maximized",
]);
const activities = new Set<ArcadeActivity>([
  "memory",
  "sweep",
  "doom",
  "snake",
  "pong",
  "puzzle",
  "terminal",
]);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function onlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).every((key) => keys.includes(key));
}

function validPixels(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || value.length > 32) return false;
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)px$/.test(value)) return false;
  const pixels = Number(value.slice(0, -2));
  return Number.isFinite(pixels) && pixels <= 100_000;
}

function withinLimit(raw: string) {
  // Check characters first to avoid encoding an arbitrarily large value.
  return (
    raw.length <= MAX_BYTES && new TextEncoder().encode(raw).length <= MAX_BYTES
  );
}

/**
 * Only layout metadata is persisted, never app content or terminal connections.
 * Bad envelopes, unreadable storage, and oversized snapshots are left untouched.
 * Valid envelopes may contain obsolete or damaged records: keep the safe subset.
 */
export function createWorkspaceStore(
  appIds: readonly string[],
  readerPaths: ReadonlySet<string>,
): { state: WorkspaceState | null; save: (state: WorkspaceState) => boolean } {
  const knownIds = new Set([...appIds, "library", "arcade", "ghostty"]);

  function parseWindow(value: unknown): SavedWindow | null {
    if (!record(value) || typeof value.id !== "string") return null;
    const reader = /^reader-([1-9]\d*)$/.exec(value.id);
    if (reader) {
      if (!Number.isSafeInteger(Number(reader[1]))) return null;
      if (typeof value.source !== "string" || !readerPaths.has(value.source))
        return null;
    } else if (!knownIds.has(value.id) || value.source !== undefined)
      return null;
    if (
      !onlyKeys(value, ["id", "minimized", "placement", "source", "activity"])
    )
      return null;
    if (typeof value.minimized !== "boolean" || !record(value.placement))
      return null;
    if (!onlyKeys(value.placement, [...fields, "layout"])) return null;
    for (const field of fields)
      if (!validPixels(value.placement[field])) return null;
    const layout = value.placement.layout;
    if (layout !== undefined && !layouts.has(layout as WindowLayout))
      return null;
    const activity = value.activity;
    if (
      activity !== undefined &&
      (value.id !== "arcade" || !activities.has(activity as ArcadeActivity))
    )
      return null;
    const placement: WindowPlacement = {
      left: value.placement.left as string,
      top: value.placement.top as string,
      width: value.placement.width as string,
      height: value.placement.height as string,
      minWidth: value.placement.minWidth as string,
      minHeight: value.placement.minHeight as string,
    };
    if (layout !== undefined) placement.layout = layout as WindowLayout;
    const result: SavedWindow = {
      id: value.id,
      minimized: value.minimized,
      placement,
    };
    if (reader) result.source = value.source as string;
    if (activity !== undefined) result.activity = activity as ArcadeActivity;
    return result;
  }

  function parse(value: unknown, strict: boolean): WorkspaceState | null {
    if (
      !record(value) ||
      !onlyKeys(value, ["version", "windows", "active"]) ||
      value.version !== 1
    )
      return null;
    if (!Array.isArray(value.windows) || value.windows.length > MAX_WINDOWS)
      return null;
    if (value.active !== null && typeof value.active !== "string") return null;
    const windows: SavedWindow[] = [];
    const ids = new Set<string>();
    const sources = new Set<string>();
    for (const entry of value.windows) {
      const win = parseWindow(entry);
      if (
        !win ||
        ids.has(win.id) ||
        (win.source !== undefined && sources.has(win.source))
      ) {
        if (strict) return null;
        continue;
      }
      windows.push(win);
      ids.add(win.id);
      if (win.source !== undefined) sources.add(win.source);
    }
    const active =
      windows.find((win) => win.id === value.active && !win.minimized)?.id ??
      null;
    if (strict && active !== value.active) return null;
    return { version: 1, windows, active };
  }

  let writable = true;
  let state: WorkspaceState | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      state = withinLimit(raw) ? parse(JSON.parse(raw), false) : null;
      if (!state) writable = false;
    }
  } catch {
    writable = false;
  }

  return {
    state,
    save(next) {
      if (!writable) return false;
      try {
        const valid = parse(next, true);
        if (!valid) return false;
        const raw = JSON.stringify(valid);
        if (!withinLimit(raw)) return false;
        localStorage.setItem(STORAGE_KEY, raw);
        return true;
      } catch {
        // Quota errors may be temporary. A later save can retry safely.
        return false;
      }
    },
  };
}
