import { expect, test } from "@playwright/test";
import {
  createWorkspaceStore,
  STORAGE_KEY,
  type SavedWindow,
  type WorkspaceState,
} from "../src/scripts/desktop-workspace-store";

const paths = new Set(["/articles/first/", "/notes/second/"]);
const apps = ["notes", "tasks"];
const placement = {
  left: "80px",
  top: "24.5px",
  width: "700px",
  height: "500px",
  minWidth: "",
  minHeight: "",
};
const win = (id = "notes", extra: Partial<SavedWindow> = {}): SavedWindow => ({
  id,
  minimized: false,
  placement: { ...placement },
  ...extra,
});
const snapshot = (
  windows: SavedWindow[] = [win()],
  active: string | null = windows.at(-1)?.id ?? null,
): WorkspaceState => ({ version: 1, windows, active });

let original: PropertyDescriptor | undefined;
test.beforeEach(() => {
  original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
});
test.afterEach(() => {
  if (original) Object.defineProperty(globalThis, "localStorage", original);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

function storage(initial: string | null = null) {
  let raw = initial;
  let writes = 0;
  let failRead = false;
  let failWrite = false;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key: string) {
        expect(key).toBe(STORAGE_KEY);
        if (failRead) throw new Error("blocked");
        return raw;
      },
      setItem(key: string, value: string) {
        expect(key).toBe(STORAGE_KEY);
        if (failWrite) throw new Error("quota");
        raw = value;
        writes++;
      },
    },
  });
  return {
    get raw() {
      return raw;
    },
    get writes() {
      return writes;
    },
    failRead(value: boolean) {
      failRead = value;
    },
    failWrite(value: boolean) {
      failWrite = value;
    },
  };
}

test("new workspace saves and restores stack order, geometry, readers, minimized apps, and arcade selection", () => {
  const disk = storage();
  const state = snapshot([
    win("library"),
    win("notes", { minimized: true }),
    win("reader-7", {
      source: "/articles/first/",
      placement: { ...placement, layout: "top-right" },
    }),
    win("ghostty"),
    win("arcade", { activity: "doom" }),
  ]);
  const store = createWorkspaceStore(apps, paths);
  expect(store.state).toBeNull();
  expect(store.save(state)).toBe(true);
  expect(disk.writes).toBe(1);
  expect(createWorkspaceStore(apps, paths).state).toEqual(state);
  expect(store.save(snapshot([], null))).toBe(true);
  expect(createWorkspaceStore(apps, paths).state).toEqual(snapshot([], null));
});

test("damaged envelopes and oversized snapshots preserve the original value and disable writes", () => {
  for (const raw of [
    "",
    "{",
    "null",
    "[]",
    JSON.stringify({ ...snapshot(), version: 2 }),
    JSON.stringify({ ...snapshot(), active: 7 }),
    JSON.stringify({ version: 1, windows: "bad", active: null }),
    JSON.stringify(snapshot(Array.from({ length: 65 }, () => win()))),
    " ".repeat(65_537),
    JSON.stringify({ ...snapshot(), extra: "unknown" }),
  ]) {
    const disk = storage(raw);
    const store = createWorkspaceStore(apps, paths);
    expect(store.state).toBeNull();
    expect(store.save(snapshot())).toBe(false);
    expect(disk.raw).toBe(raw);
    expect(disk.writes).toBe(0);
  }
});

test("an initially unreadable store remains protected even if storage later becomes available", () => {
  const raw = JSON.stringify(snapshot());
  const disk = storage(raw);
  disk.failRead(true);
  const store = createWorkspaceStore(apps, paths);
  disk.failRead(false);
  expect(store.state).toBeNull();
  expect(store.save(snapshot([], null))).toBe(false);
  expect(disk.raw).toBe(raw);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("denied");
    },
  });
  expect(createWorkspaceStore(apps, paths).save(snapshot())).toBe(false);
});

test("filter obsolete IDs, stale and duplicate readers, duplicate apps, and invalid records while retaining order", () => {
  const goodReader = win("reader-2", { source: "/articles/first/" });
  storage(
    JSON.stringify(
      snapshot(
        [
          win("removed-app"),
          win(),
          win("notes", { minimized: true }),
          win("reader-1", { source: "/old/" }),
          goodReader,
          win("reader-3", { source: "/articles/first/" }),
          win("reader-9007199254740992", { source: "/notes/second/" }),
          win("reader-0", { source: "/notes/second/" }),
          win("reader-01", { source: "/notes/second/" }),
          win("tasks", { minimized: true }),
        ],
        "removed-app",
      ),
    ),
  );
  expect(createWorkspaceStore(apps, paths).state).toEqual(
    snapshot([win(), goodReader, win("tasks", { minimized: true })], null),
  );
});

test("reject malicious CSS, invalid dimensions, layouts, sources, and activities without restoring them", () => {
  const bad = [
    "-1px",
    "NaNpx",
    "Infinitypx",
    "1e3px",
    "100001px",
    "1px;display:none",
    "calc(100vw)",
    "50%",
    "url(https://example.com)",
    "9".repeat(400) + "px",
    8,
    null,
  ];
  for (const value of bad) {
    storage(
      JSON.stringify(
        snapshot(
          [
            win(),
            win("tasks", {
              placement: { ...placement, left: value as string },
            }),
          ],
          "tasks",
        ),
      ),
    );
    expect(createWorkspaceStore(apps, paths).state).toEqual(
      snapshot([win()], null),
    );
  }
  for (const invalid of [
    win("tasks", { placement: { ...placement, width: "-1px" } }),
    win("tasks", { placement: { ...placement, minHeight: "100001px" } }),
    win("tasks", {
      placement: { ...placement, layout: "fullscreen" as never },
    }),
    win("tasks", { source: "/articles/first/" }),
    win("tasks", { activity: "doom" }),
    win("arcade", { activity: "evil" as never }),
    win("reader-5", { source: "https://example.com/articles/first/" }),
    win("reader-5", { source: "/articles/first/?token=secret" }),
    win("reader-5", { source: "/articles/first/#fragment" }),
    { ...win("tasks"), html: "<script>bad()</script>" },
    { ...win("tasks"), minimized: "false" },
  ]) {
    storage(JSON.stringify(snapshot([win(), invalid as SavedWindow], null)));
    expect(createWorkspaceStore(apps, paths).state?.windows).toEqual([win()]);
  }
});

test("saves reject invalid caller state instead of silently replacing a good snapshot", () => {
  const raw = JSON.stringify(snapshot());
  const disk = storage(raw);
  const store = createWorkspaceStore(apps, paths);
  for (const state of [
    snapshot([win(), win()]),
    snapshot([win("unknown")]),
    snapshot([win("notes", { minimized: true })]),
    snapshot([win()], "tasks"),
    snapshot([win("reader-1", { source: "/missing/" })]),
    snapshot(Array.from({ length: 65 }, () => win())),
  ]) {
    expect(store.save(state)).toBe(false);
    expect(disk.raw).toBe(raw);
  }
  expect(disk.writes).toBe(0);
});

test("UTF-8 size cap also bounds allowed Unicode reader paths on read and save", () => {
  const longPath = "/articles/" + "界".repeat(22_000) + "/";
  const state = snapshot([win("reader-1", { source: longPath })]);
  const raw = JSON.stringify(state);
  expect(raw.length).toBeLessThan(65_536);
  storage(raw);
  expect(createWorkspaceStore(apps, new Set([longPath])).state).toBeNull();
  const disk = storage();
  expect(createWorkspaceStore(apps, new Set([longPath])).save(state)).toBe(
    false,
  );
  expect(disk.raw).toBeNull();
});

test("quota failure keeps the previous snapshot and a later save can recover", () => {
  const raw = JSON.stringify(snapshot());
  const disk = storage(raw);
  const store = createWorkspaceStore(apps, paths);
  disk.failWrite(true);
  expect(store.save(snapshot([], null))).toBe(false);
  expect(disk.raw).toBe(raw);
  disk.failWrite(false);
  expect(store.save(snapshot([], null))).toBe(true);
  expect(JSON.parse(disk.raw!)).toEqual(snapshot([], null));
});
