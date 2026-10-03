/** The backup boundary imports only metadata and pure schema helpers, never app interfaces. */
import { desktopApps } from "../lib/desktop-apps";
import { isAgendaStore } from "./desktop-agenda-data";
import { validDesktopPreferences } from "./desktop-preferences";
import {
  TILING_KEY,
  TILING_LIMIT,
  validTilingState,
} from "./desktop-tiling-state";
const appIds = new Set<string>(desktopApps.map((app) => app.id));
export const MAX_BACKUP_BYTES = 16 * 1024 * 1024;
type RecordValue = Record<string, unknown>;
export type BackupCategory = {
  id: string;
  label: string;
  keys: string[];
  apps: string[];
};
export const backupCategories: BackupCategory[] = [
  {
    id: "agenda",
    label: "Agenda events & reminders",
    keys: ["nearby-desktop-agenda-v1"],
    apps: ["agenda"],
  },
  {
    id: "activity",
    label: "Activity, favorites & recent apps",
    keys: ["nearby-desktop-activity-v1"],
    apps: ["activity"],
  },
  { id: "notes", label: "Notes", keys: ["desktop-notes:v1"], apps: ["notes"] },
  {
    id: "tasks",
    label: "Tasks",
    keys: ["nearby-desktop-tasks-v1"],
    apps: ["tasks", "agenda"],
  },
  {
    id: "markdown",
    label: "Markdown draft",
    keys: ["nearby-desktop-markdown-v1"],
    apps: ["markdown"],
  },
  {
    id: "appearance",
    label: "Appearance",
    keys: ["nearby-desktop-preferences-v1"],
    apps: ["settings"],
  },
  {
    id: "layout",
    label: "Windows & desktops",
    keys: [
      "desktop-workspace:v1",
      "desktop-icons:v1",
      "desktop-spaces:v1",
      "desktop-window-pins:v1",
      TILING_KEY,
    ],
    apps: ["workspaces", "windows"],
  },
  {
    id: "library",
    label: "Library preferences & history",
    keys: ["desktop-library:v1", "desktop-library-recent:v1"],
    apps: ["library"],
  },
  {
    id: "pixel",
    label: "Pixel drawing",
    keys: ["nearby-desktop-pixel-v1"],
    apps: ["pixel"],
  },
  {
    id: "colors",
    label: "Saved colors",
    keys: ["nearby-desktop-colors-v1"],
    apps: ["colors"],
  },
  {
    id: "sequencer",
    label: "Beat pattern",
    keys: ["nearby-desktop-sequencer-v1"],
    apps: ["sequencer"],
  },
  {
    id: "soundscape",
    label: "Soundscape settings",
    keys: ["nearby-desktop-soundscape-v1"],
    apps: ["soundscape"],
  },
  {
    id: "focus",
    label: "Focus timer",
    keys: ["nearby-desktop-focus-v1"],
    apps: ["focus"],
  },
  {
    id: "worldclock",
    label: "World clocks",
    keys: ["nearby-desktop-worldclock-v1"],
    apps: ["worldclock"],
  },
  {
    id: "decision",
    label: "Decision wheel",
    keys: ["nearby-desktop-decision-v1"],
    apps: ["decision"],
  },
  {
    id: "sudoku",
    label: "Sudoku progress",
    keys: ["nearby-desktop-sudoku-v1"],
    apps: ["sudoku"],
  },
  {
    id: "typing",
    label: "Typing scores",
    keys: ["nearby-desktop-typing-v1"],
    apps: ["typing"],
  },
];
export type BackupEnvelope = {
  app: "nearby-desktop";
  version: 1;
  createdAt: string;
  categories: Record<string, Record<string, string>>;
};
export type CategorySnapshot = {
  category: BackupCategory;
  data: Record<string, string>;
  bytes: number;
  issue: string;
  readable: boolean;
};
const isRecord = (value: unknown): value is RecordValue =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
const keys = (value: RecordValue, allowed: string[]) =>
  Object.keys(value).every((key) => allowed.includes(key));
const str = (value: unknown, max: number, min = 0): value is string =>
  typeof value === "string" && value.length >= min && value.length <= max;
const num = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
const int = (value: unknown, min: number, max: number) =>
  num(value, min, max) && Number.isInteger(value);
const one = (value: unknown, allowed: readonly unknown[]) =>
  allowed.includes(value);
const arr = (
  value: unknown,
  max: number,
  guard: (value: unknown) => boolean,
): value is unknown[] =>
  Array.isArray(value) && value.length <= max && value.every(guard);
const distinct = (value: unknown[]) => new Set(value).size === value.length;
const object = (
  value: unknown,
  fields: string[],
  test: (value: RecordValue) => boolean,
) => isRecord(value) && keys(value, fields) && test(value);
const v1 = (
  value: unknown,
  fields: string[],
  test: (value: RecordValue) => boolean,
) =>
  object(
    value,
    ["version", ...fields],
    (value) => value.version === 1 && test(value),
  );
const bool = (value: unknown) => typeof value === "boolean";
const color = (value: unknown) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const path = (value: unknown) =>
  str(value, 600, 1) &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !/[?#\\\u0000-\u001f]/.test(value);
const canonicalPath = (value: unknown) =>
  path(value) && (value === "/" || !(value as string).endsWith("/"));
const date = (value: unknown) =>
  str(value, 10, 10) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !value.startsWith("0000") &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const id = (value: unknown) => str(value, 100, 1);
const uniqueRecords = (items: unknown[], field: string) =>
  distinct(items.map((item) => (item as RecordValue)[field]));
const cityIds =
  "local honolulu los-angeles vancouver mexico-city chicago new-york toronto sao-paulo utc london paris berlin cairo johannesburg nairobi dubai mumbai kathmandu bangkok singapore hong-kong tokyo seoul sydney auckland".split(
    " ",
  );
const puzzleClues: Record<string, string> = {
  morning:
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  garden:
    "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
  evening:
    "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
};
const pixel = (value: unknown) =>
  value === "" ||
  (str(value, 32) &&
    /^(?:\d+(?:\.\d*)?|\.\d+)px$/.test(value) &&
    Number(value.slice(0, -2)) <= 100000);
function validWorkspace(value: unknown) {
  return v1(
    value,
    ["windows", "active"],
    (item) =>
      arr(item.windows, 64, (win) =>
        object(
          win,
          ["id", "minimized", "placement", "source", "activity"],
          (win) =>
            id(win.id) &&
            (appIds.has(win.id) ||
              one(win.id, ["library", "arcade", "ghostty"]) ||
              /^reader-[1-9]\d*$/.test(win.id)) &&
            bool(win.minimized) &&
            (/^reader-[1-9]\d*$/.test(win.id)
              ? path(win.source)
              : win.source === undefined) &&
            (win.activity === undefined ||
              (win.id === "arcade" &&
                one(win.activity, [
                  "memory",
                  "sweep",
                  "doom",
                  "snake",
                  "pong",
                  "puzzle",
                  "terminal",
                ]))) &&
            object(
              win.placement,
              [
                "left",
                "top",
                "width",
                "height",
                "minWidth",
                "minHeight",
                "layout",
              ],
              (p) =>
                [
                  "left",
                  "top",
                  "width",
                  "height",
                  "minWidth",
                  "minHeight",
                ].every((key) => pixel(p[key])) &&
                (p.layout === undefined ||
                  one(p.layout, [
                    "left",
                    "right",
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "maximized",
                  ])),
            ),
        ),
      ) &&
      uniqueRecords(item.windows, "id") &&
      (item.active === null ||
        item.windows.some(
          (win) =>
            (win as RecordValue).id === item.active &&
            !(win as RecordValue).minimized,
        )),
  );
}
const guards: Record<string, (value: unknown) => boolean> = {
  "nearby-desktop-agenda-v1": isAgendaStore,
  "nearby-desktop-activity-v1": (value) =>
    v1(
      value,
      ["history", "dnd", "favorites", "recent"],
      (item) =>
        bool(item.dnd) &&
        ["favorites", "recent"].every(
          (key) =>
            arr(
              item[key],
              8,
              (value) => typeof value === "string" && appIds.has(value),
            ) && distinct(item[key] as unknown[]),
        ) &&
        arr(item.history, 100, (entry) =>
          object(
            entry,
            ["id", "message", "kind", "createdAt", "read"],
            (entry) =>
              str(entry.id, 80, 1) &&
              str(entry.message, 500, 1) &&
              entry.message.trim().length > 0 &&
              one(entry.kind, ["app", "system", "reminder"]) &&
              int(entry.createdAt, 0, 8.64e15) &&
              bool(entry.read),
          ),
        ) &&
        uniqueRecords(item.history, "id"),
    ),
  "desktop-window-pins:v1": (value) =>
    v1(
      value,
      ["keys"],
      (item) =>
        arr(
          item.keys,
          64,
          (value) =>
            str(value, 300) &&
            (appIds.has(value) ||
              one(value, ["library", "arcade", "ghostty"]) ||
              canonicalPath(value)),
        ) && distinct(item.keys),
    ),
  "desktop-notes:v1": (value) =>
    v1(
      value,
      ["notes", "activeId"],
      (item) =>
        arr(item.notes, 200, (note) =>
          object(
            note,
            ["id", "title", "body", "updatedAt", "pinned"],
            (note) =>
              str(note.id, 99, 1) &&
              str(note.title, 120) &&
              str(note.body, 100000) &&
              num(note.updatedAt, 0, 8.64e15) &&
              (note.pinned === undefined || bool(note.pinned)),
          ),
        ) &&
        uniqueRecords(item.notes, "id") &&
        (item.activeId === null ||
          item.notes.some(
            (note) => (note as RecordValue).id === item.activeId,
          )),
    ),
  "nearby-desktop-tasks-v1": (value) =>
    v1(
      value,
      ["tasks"],
      (item) =>
        arr(item.tasks, 300, (task) =>
          object(
            task,
            ["id", "title", "details", "stage", "priority", "dueDate"],
            (task) =>
              id(task.id) &&
              str(task.title, 160, 1) &&
              task.title.trim().length > 0 &&
              str(task.details, 2000) &&
              one(task.stage, ["todo", "doing", "done"]) &&
              (task.priority === undefined ||
                one(task.priority, ["low", "normal", "high"])) &&
              (task.dueDate === undefined || date(task.dueDate)),
          ),
        ) && uniqueRecords(item.tasks, "id"),
    ),
  "nearby-desktop-markdown-v1": (value) =>
    v1(value, ["text"], (item) => str(item.text, 100000)),
  "nearby-desktop-preferences-v1": validDesktopPreferences,
  "desktop-workspace:v1": validWorkspace,
  [TILING_KEY]: validTilingState,
  "desktop-icons:v1": (value) =>
    v1(value, ["layouts"], (item) =>
      object(item.layouts, ["wide", "compact"], (layouts) =>
        ["wide", "compact"].every(
          (profile) =>
            isRecord(layouts[profile]) &&
            Object.entries(layouts[profile]).length <= 256 &&
            Object.entries(layouts[profile]).every(
              ([name, cell]) =>
                str(name, 300, 1) &&
                object(
                  cell,
                  ["column", "row"],
                  (cell) => int(cell.column, 0, 1000) && int(cell.row, 0, 1000),
                ),
            ),
        ),
      ),
    ),
  "desktop-spaces:v1": (value) =>
    v1(
      value,
      ["spaces", "active", "assignments"],
      (item) =>
        arr(item.spaces, 8, (space) =>
          object(
            space,
            ["id", "name"],
            (space) =>
              str(space.id, 53) &&
              /^desk-[a-z0-9-]{1,48}$/.test(space.id) &&
              str(space.name, 40, 1) &&
              space.name.trim().length > 0 &&
              !/[\u0000-\u001f\u007f]/.test(space.name),
          ),
        ) &&
        item.spaces.length > 0 &&
        uniqueRecords(item.spaces, "id") &&
        item.spaces.some(
          (space) => (space as RecordValue).id === item.active,
        ) &&
        isRecord(item.assignments) &&
        Object.keys(item.assignments).length <= 256 &&
        Object.entries(item.assignments).every(
          ([name, id]) =>
            str(name, 300, 1) &&
            !/[\u0000-\u001f\u007f]/.test(name) &&
            (item.spaces as RecordValue[]).some((space) => space.id === id),
        ),
    ),
  "desktop-library:v1": (value) =>
    v1(
      value,
      ["folder", "query", "view", "sort", "stars"],
      (item) =>
        str(item.folder, 40, 1) &&
        /^[a-z-]+$/.test(item.folder) &&
        str(item.query, 2000) &&
        one(item.view, ["list", "grid"]) &&
        one(item.sort, [
          "original",
          "name-asc",
          "name-desc",
          "kind-asc",
          "kind-desc",
          "date-asc",
          "date-desc",
        ]) &&
        arr(item.stars, 1000, canonicalPath) &&
        distinct(item.stars),
    ),
  "desktop-library-recent:v1": (value) =>
    v1(
      value,
      ["paths"],
      (item) => arr(item.paths, 80, canonicalPath) && distinct(item.paths),
    ),
  "nearby-desktop-pixel-v1": (value) =>
    v1(
      value,
      ["size", "pixels"],
      (item) =>
        item.size === 16 &&
        arr(item.pixels, 256, (value) => value === null || color(value)) &&
        item.pixels.length === 256,
    ),
  "nearby-desktop-colors-v1": (value) => arr(value, 12, color),
  "nearby-desktop-sequencer-v1": (value) =>
    v1(
      value,
      ["tempo", "volume", "pattern"],
      (item) =>
        int(item.tempo, 40, 200) &&
        int(item.volume, 0, 100) &&
        arr(item.pattern, 3, (row) => arr(row, 8, bool) && row.length === 8) &&
        item.pattern.length === 3,
    ),
  "nearby-desktop-soundscape-v1": (value) =>
    v1(
      value,
      ["master", "white", "pink", "brown", "tone", "sleepMinutes"],
      (item) =>
        ["master", "white", "pink", "brown", "tone"].every((key) =>
          int(item[key], 0, 100),
        ) && one(item.sleepMinutes, [0, 5, 15, 30]),
    ),
  "nearby-desktop-focus-v1": (value) =>
    object(
      value,
      ["mode", "duration", "remaining", "deadline", "completed"],
      (item) =>
        one(item.mode, ["Focus", "Short break", "Long break", "Custom"]) &&
        int(item.duration, 60, 10800) &&
        num(item.remaining, 0, item.duration as number) &&
        (item.deadline === null ||
          num(item.deadline, 0, Date.now() + 10800000)) &&
        int(item.completed, 0, 99999),
    ),
  "nearby-desktop-worldclock-v1": (value) =>
    v1(
      value,
      ["cities", "format"],
      (item) =>
        one(item.format, ["12", "24"]) &&
        arr(item.cities, 6, (city) => one(city, cityIds)) &&
        distinct(item.cities),
    ),
  "nearby-desktop-decision-v1": (value) =>
    v1(
      value,
      ["choices"],
      (item) =>
        arr(
          item.choices,
          20,
          (choice) =>
            str(choice, 80, 1) &&
            choice.trim() === choice &&
            !/[\r\n]/.test(choice),
        ) && item.choices.length !== 1,
    ),
  "nearby-desktop-sudoku-v1": (value) =>
    object(
      value,
      ["puzzleId", "values", "selected"],
      (item) =>
        str(item.puzzleId, 20) &&
        Object.hasOwn(puzzleClues, item.puzzleId) &&
        int(item.selected, 0, 80) &&
        arr(item.values, 81, (value) => int(value, 0, 9)) &&
        item.values.length === 81 &&
        item.values.every(
          (value, index) =>
            puzzleClues[item.puzzleId as string][index] === "0" ||
            value === Number(puzzleClues[item.puzzleId as string][index]),
        ),
    ),
  "nearby-desktop-typing-v1": (value) =>
    v1(
      value,
      ["bests"],
      (item) =>
        isRecord(item.bests) &&
        Object.entries(item.bests).every(
          ([key, score]) =>
            one(key, ["morning", "garden", "train"]) &&
            object(
              score,
              ["wpm", "accuracy", "seconds"],
              (score) =>
                num(score.wpm, 0, 100000) &&
                num(score.accuracy, 0, 100) &&
                num(score.seconds, 0, 31536000),
            ),
        ),
    ),
};
const rawLimits: Record<string, number> = {
  [TILING_KEY]: TILING_LIMIT,
  "nearby-desktop-agenda-v1": 3 * 1024 * 1024,
  "nearby-desktop-activity-v1": 128 * 1024,
  "desktop-window-pins:v1": 128 * 1024,
  "nearby-desktop-focus-v1": 4096,
  "nearby-desktop-pixel-v1": 8192,
  "nearby-desktop-colors-v1": 512,
  "nearby-desktop-sequencer-v1": 2000,
  "nearby-desktop-soundscape-v1": 2000,
  "nearby-desktop-worldclock-v1": 2000,
  "nearby-desktop-decision-v1": 12000,
  "nearby-desktop-sudoku-v1": 2048,
  "nearby-desktop-typing-v1": 4096,
  "nearby-desktop-markdown-v1": 600100,
  "nearby-desktop-tasks-v1": 4200000,
  "nearby-desktop-preferences-v1": 2048,
  "desktop-workspace:v1": 65536,
  "desktop-spaces:v1": 131072,
  "desktop-library:v1": 786432,
  "desktop-library-recent:v1": 65536,
};
const byteLimits: Record<string, number> = {
  [TILING_KEY]: TILING_LIMIT,
  "nearby-desktop-agenda-v1": 3 * 1024 * 1024,
  "nearby-desktop-activity-v1": 128 * 1024,
  "nearby-desktop-preferences-v1": 2048,
  "desktop-workspace:v1": 65536,
  "desktop-spaces:v1": 131072,
  "desktop-window-pins:v1": 131072,
  "desktop-library:v1": 786432,
  "desktop-library-recent:v1": 65536,
};
export const utf8Bytes = (value: string) =>
  new TextEncoder().encode(value).length;
/** Reject prototype names even in nested JSON, without recursive stack exhaustion. */
function safeTree(value: unknown, maxDepth = 12) {
  const queue: [unknown, number][] = [[value, 0]];
  let count = 0;
  while (queue.length) {
    const [item, depth] = queue.pop()!;
    if (++count > 200000 || depth > maxDepth) return false;
    if (item && typeof item === "object") {
      if (!Array.isArray(item) && !isRecord(item)) return false;
      for (const [key, child] of Object.entries(item)) {
        if (["__proto__", "prototype", "constructor"].includes(key))
          return false;
        queue.push([child, depth + 1]);
      }
    }
  }
  return true;
}
export function validateRecord(key: string, raw: string): string {
  if (!Object.hasOwn(guards, key)) return "Unsupported storage record.";
  if (
    raw.length > (rawLimits[key] ?? MAX_BACKUP_BYTES) ||
    utf8Bytes(raw) > (byteLimits[key] ?? MAX_BACKUP_BYTES)
  )
    return "Saved record exceeds the supported size.";
  try {
    const value: unknown = JSON.parse(raw);
    if (!safeTree(value, key === TILING_KEY ? 64 : 12) || !guards[key](value))
      return "Incompatible or damaged data; restore is disabled.";
    return "";
  } catch {
    return "Unreadable JSON; restore is disabled.";
  }
}
export function inspectCategory(
  category: BackupCategory,
  data: Record<string, string>,
): CategorySnapshot {
  const issue =
    Object.entries(data)
      .map(([key, raw]) => validateRecord(key, raw))
      .find(Boolean) ?? "";
  return {
    category,
    data,
    bytes: Object.values(data).reduce((sum, raw) => sum + utf8Bytes(raw), 0),
    issue,
    readable: true,
  };
}
export function readCategories(
  storage: Pick<Storage, "getItem">,
): CategorySnapshot[] {
  return backupCategories.map((category) => {
    const data: Record<string, string> = {};
    try {
      for (const key of category.keys) {
        const raw = storage.getItem(key);
        if (raw !== null) data[key] = raw;
      }
      return inspectCategory(category, data);
    } catch {
      return {
        category,
        data: {},
        bytes: 0,
        issue: "Browser storage cannot be read. Originals are unchanged.",
        readable: false,
      };
    }
  });
}
export function createBackup(snapshots: CategorySnapshot[]): string {
  if (snapshots.some((item) => !item.readable))
    throw new Error(
      "One or more selected categories cannot be read. No backup was created.",
    );
  const envelope: BackupEnvelope = {
    app: "nearby-desktop",
    version: 1,
    createdAt: new Date().toISOString(),
    categories: Object.fromEntries(
      snapshots.map((item) => [item.category.id, item.data]),
    ),
  };
  const raw = JSON.stringify(envelope, null, 2);
  if (utf8Bytes(raw) > MAX_BACKUP_BYTES)
    throw new Error(
      "This backup exceeds 16 MiB. Export fewer categories at a time.",
    );
  return raw;
}
export function parseBackup(raw: string): {
  createdAt: string;
  snapshots: CategorySnapshot[];
} {
  if (raw.length > MAX_BACKUP_BYTES || utf8Bytes(raw) > MAX_BACKUP_BYTES)
    throw new Error("Choose a backup no larger than 16 MiB.");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (
    !safeTree(value) ||
    !isRecord(value) ||
    !keys(value, ["app", "version", "createdAt", "categories"]) ||
    value.app !== "nearby-desktop" ||
    value.version !== 1 ||
    !str(value.createdAt, 40) ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.createdAt) ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    !isRecord(value.categories)
  )
    throw new Error("This is not a supported version 1 desktop backup.");
  const entries = Object.entries(value.categories);
  if (!entries.length || entries.length > backupCategories.length)
    throw new Error("The backup has no supported categories.");
  const snapshots = entries.map(([id, data]) => {
    const category = backupCategories.find((item) => item.id === id);
    if (
      !category ||
      !isRecord(data) ||
      !keys(data, category.keys) ||
      !Object.values(data).every((value) => typeof value === "string")
    )
      throw new Error(
        "The backup contains an unsupported category or storage key. Nothing was imported.",
      );
    return inspectCategory(category, data as Record<string, string>);
  });
  return { createdAt: value.createdAt, snapshots };
}
/** localStorage is not transactional. Snapshot first, and roll back touched keys on failure. */
export function replaceCategories(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  snapshots: CategorySnapshot[],
  reset = false,
): { ok: boolean; message: string } {
  const originals = new Map<string, string | null>();
  const replacements = new Map<string, string | null>();
  try {
    for (const snapshot of snapshots) {
      const category = backupCategories.find(
        (item) => item.id === snapshot.category.id,
      );
      if (!category || (!reset && (!snapshot.readable || snapshot.issue)))
        throw new Error("Invalid selection");
      if (
        !reset &&
        Object.keys(snapshot.data).some(
          (key) =>
            !category.keys.includes(key) ||
            validateRecord(key, snapshot.data[key]),
        )
      )
        throw new Error("Invalid data");
      for (const key of category.keys) {
        originals.set(key, storage.getItem(key));
        replacements.set(key, reset ? null : (snapshot.data[key] ?? null));
      }
    }
  } catch {
    return {
      ok: false,
      message:
        "The selected data could not be read or validated. Nothing was changed.",
    };
  }
  const touched: string[] = [];
  try {
    for (const [key, value] of replacements) {
      if (originals.get(key) === value) continue;
      touched.push(key);
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
    return {
      ok: true,
      message: reset
        ? "Selected categories reset."
        : "Selected categories restored.",
    };
  } catch {
    let recovered = true;
    for (const key of touched.reverse()) {
      try {
        const original = originals.get(key)!;
        if (storage.getItem(key) === original) continue;
        if (original === null) storage.removeItem(key);
        else storage.setItem(key, original);
      } catch {
        recovered = false;
      }
    }
    return {
      ok: false,
      message: recovered
        ? "Storage rejected the change. Original records were restored; no replacement was kept."
        : "Storage failed and some originals could not be restored. Keep your backup, free browser storage, and retry. This operation is not transactional.",
    };
  }
}
