import { expect, test } from "@playwright/test";
import type { LayoutDocument, LayoutNode } from "@danfessler/trellis";
import {
  TILING_KEY,
  TILING_LIMIT,
  defaultTilingDesk,
  defaultTilingState,
  validTilingDocument,
  validTilingState,
  type TilingState,
} from "../src/scripts/desktop-tiling-state";
import { localState } from "../src/scripts/desktop-local-state";
import {
  backupCategories,
  createBackup,
  parseBackup,
  readCategories,
  replaceCategories,
  validateRecord,
} from "../src/scripts/desktop-backup-data";

function document(): LayoutDocument {
  return {
    schema: 1,
    root: {
      kind: "split",
      id: "row",
      axis: "x",
      weights: [2, 1],
      children: [
        {
          kind: "panel",
          id: "first",
          views: ["notes", "tasks"],
          selected: "notes",
        },
        {
          kind: "split",
          id: "column",
          axis: "y",
          weights: [1, 1],
          children: [
            {
              kind: "panel",
              id: "second",
              views: ["reader"],
              selected: "reader",
            },
            {
              kind: "panel",
              id: "third",
              views: ["terminal"],
              selected: "terminal",
            },
          ],
        },
      ],
    },
    floating: [],
    hidden: [],
    views: {
      notes: { type: "desktop", params: { key: "app:notes" }, title: "Notes" },
      tasks: { type: "desktop", params: { key: "app:tasks" }, title: "Tasks" },
      reader: { type: "desktop", params: { key: "reader:/articles/hello/" } },
      terminal: { type: "desktop", params: { key: "app:ghostty" } },
    },
    navigation: {
      frame: ["first"],
      framings: [{ id: "reading", name: "Reading", frame: ["column"] }],
    },
  };
}
const state = (doc: LayoutDocument | null = document()): TilingState => ({
  version: 1,
  desks: {
    "desk-main": { ...defaultTilingDesk(), enabled: true, document: doc },
  },
});
function deepDocument(levels: number): LayoutDocument {
  const views: LayoutDocument["views"] = {};
  const panel = (index: number): LayoutNode => {
    const id = `view-${index}`;
    views[id] = { type: "desktop", params: { key: `app:${index}` } };
    return { kind: "panel", id: `panel-${index}`, views: [id], selected: id };
  };
  let root = panel(0);
  for (let index = 1; index <= levels; index++)
    root = {
      kind: "split",
      id: `split-${index}`,
      axis: index % 2 ? "x" : "y",
      weights: [1, 1],
      children: [root, panel(index)],
    };
  return { schema: 1, root, views, floating: [], hidden: [] };
}

test("defaults and nested tabbed layouts round-trip with independent desktop canvases", () => {
  expect(validTilingState(defaultTilingState())).toBe(true);
  expect(validTilingState(state(null))).toBe(true);
  const saved = state();
  saved.desks["desk-writing"] = {
    ...defaultTilingDesk(),
    width: 4200,
    height: 2600,
    scrollX: 1350.5,
    scrollY: 700,
    document: document(),
  };
  expect(validTilingState(JSON.parse(JSON.stringify(saved)))).toBe(true);
  const empty: LayoutDocument = {
    schema: 1,
    root: null,
    views: {},
    floating: [],
    hidden: [],
  };
  expect(validTilingDocument(empty)).toBe(true);
  expect(
    validTilingDocument({ ...empty, root: { kind: "stage", id: "stage" } }),
  ).toBe(true);
  const staged = document();
  staged.root = {
    kind: "stage",
    id: "stage",
    child: staged.root as Exclude<LayoutNode, { kind: "stage" }>,
  };
  expect(validTilingDocument(staged)).toBe(true);
});

test("canvas and desk limits reject malformed or future state without coercion", () => {
  for (const change of [
    { enabled: "true" },
    { width: 799 },
    { height: 6001 },
    { width: 1600.5 },
    { height: NaN },
    { scrollX: -1 },
    { scrollY: Infinity },
    { scrollX: 6001 },
    { document: undefined },
    { extra: "unknown" },
  ]) {
    const saved = state();
    Object.assign(saved.desks["desk-main"], change);
    expect(validTilingState(saved), JSON.stringify(change)).toBe(false);
  }
  for (const id of ["main", "desk-", "desk-Upper", "desk-" + "x".repeat(49)])
    expect(
      validTilingState({ version: 1, desks: { [id]: defaultTilingDesk() } }),
    ).toBe(false);
  expect(validTilingState({ version: 2, desks: {} })).toBe(false);
  expect(validTilingState({ version: 1, desks: {}, extra: true })).toBe(false);
  expect(
    validTilingState({
      version: 1,
      desks: Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [`desk-${i}`, defaultTilingDesk()]),
      ),
    }),
  ).toBe(false);
});

test("individual floating choices round-trip while older layouts remain supported", () => {
  const saved = state();
  saved.desks["desk-main"].floatingKeys = ["calculator", "/articles/hello"];
  expect(validTilingState(JSON.parse(JSON.stringify(saved)))).toBe(true);
  expect(validateRecord(TILING_KEY, JSON.stringify(saved))).toBe("");
  delete saved.desks["desk-main"].floatingKeys;
  expect(validTilingState(saved)).toBe(true);
  saved.desks["desk-main"].floatingKeys = Array.from(
    { length: 128 },
    (_, i) => `reader:${i}`,
  );
  expect(validTilingState(saved)).toBe(true);
  for (const value of [
    null,
    "notes",
    ["notes", "notes"],
    [""],
    [" "],
    ["__proto__"],
    ["constructor"],
    ["prototype"],
    ["bad\u0000key"],
    ["x".repeat(301)],
    Array.from({ length: 129 }, (_, i) => `reader:${i}`),
  ]) {
    Object.assign(saved.desks["desk-main"], { floatingKeys: value });
    expect(validTilingState(saved), JSON.stringify(value)).toBe(false);
    expect(validateRecord(TILING_KEY, JSON.stringify(saved))).not.toBe("");
  }
});

test("view ownership, IDs, and selection cannot alias or refer to missing windows", () => {
  const changes: ((doc: any) => void)[] = [
    (doc) => {
      doc.root.children[0].views.push("notes");
    },
    (doc) => {
      doc.root.children[0].views.push("missing");
    },
    (doc) => {
      doc.root.children[0].selected = "reader";
    },
    (doc) => {
      doc.root.children[1].children[0].views = ["notes"];
    },
    (doc) => {
      doc.views.unowned = { type: "desktop", params: { key: "unowned" } };
    },
    (doc) => {
      doc.root.children[0].id = "row";
    },
    (doc) => {
      doc.root.children[0].id = "notes";
    },
    (doc) => {
      doc.root.children[0].id = "constructor";
    },
    (doc) => {
      doc.views.tasks.params.key = "app:notes";
    },
    (doc) => {
      doc.views.notes.type = "html";
    },
    (doc) => {
      doc.views.notes.params.extra = "unsupported";
    },
    (doc) => {
      doc.views.notes.params.key = " ";
    },
    (doc) => {
      doc.views.notes.params.key = "app:\u0000notes";
    },
    (doc) => {
      doc.views.notes.params.key = "x".repeat(301);
    },
    (doc) => {
      doc.views.notes.title = "x".repeat(301);
    },
    (doc) => {
      doc.root = null;
    },
  ];
  for (const change of changes) {
    const doc = document();
    change(doc);
    expect(validTilingDocument(doc), String(change)).toBe(false);
  }
});

test("split weights and all document fields are bounded and validated", () => {
  for (const weights of [
    [0, 1],
    [-1, 2],
    [NaN, 1],
    [Infinity, 1],
    [Number.MAX_VALUE, Number.MAX_VALUE],
    [1],
    [1, 2, 3],
    ["1", 1],
  ]) {
    const doc: any = document();
    doc.root.weights = weights;
    expect(validTilingDocument(doc)).toBe(false);
  }
  const changes: ((doc: any) => void)[] = [
    (doc) => {
      doc.root.axis = "z";
    },
    (doc) => {
      doc.schema = 2;
    },
    (doc) => {
      doc.version = {};
    },
    (doc) => {
      doc.extra = true;
    },
    (doc) => {
      doc.floating = [{}];
    },
    (doc) => {
      doc.hidden = [{}];
    },
    (doc) => {
      doc.root.children[0].kind = "html";
    },
    (doc) => {
      doc.root.children[0].views = [];
    },
    (doc) => {
      doc.root.children[0].unsafe = "unknown";
    },
    (doc) => {
      doc.root = {
        kind: "stage",
        id: "stage",
        child: { kind: "stage", id: "other", child: doc.root },
      };
    },
  ];
  for (const change of changes) {
    const doc = document();
    change(doc);
    expect(validTilingDocument(doc), String(change)).toBe(false);
  }
});

test("navigation remains bounded and references only existing nodes and views", () => {
  for (const navigation of [
    { frame: ["absent"] },
    { frame: ["row", "row"] },
    { frame: "row" },
    { camera: { x: 0 } },
    { framings: [{ id: "a", name: "A", frame: ["absent"] }] },
    {
      framings: [
        { id: "a", name: "A", frame: [] },
        { id: "a", name: "B", frame: [] },
      ],
    },
    {
      framings: Array.from({ length: 33 }, (_, i) => ({
        id: `f-${i}`,
        name: "A",
        frame: [],
      })),
    },
  ])
    expect(validTilingDocument({ ...document(), navigation })).toBe(false);
  expect(
    validTilingDocument({
      ...document(),
      navigation: { frame: ["notes", "row"] },
    }),
  ).toBe(true);
});

test("deep layouts stay usable through Data Center while oversized or cyclic trees are rejected", () => {
  expect(validTilingDocument(deepDocument(24))).toBe(true);
  expect(validTilingDocument(deepDocument(25))).toBe(false);
  expect(
    validateRecord(TILING_KEY, JSON.stringify(state(deepDocument(24)))),
  ).toBe("");
  const cyclic: any = document();
  cyclic.root.children[1] = cyclic.root;
  expect(validTilingDocument(cyclic)).toBe(false);
  const oversized: any = document();
  oversized.views = Object.fromEntries(
    Array.from({ length: 129 }, (_, i) => [
      `v-${i}`,
      { type: "desktop", params: { key: `app:${i}` } },
    ]),
  );
  expect(validTilingDocument(oversized)).toBe(false);
  const deep: any = {};
  deep.__proto__ = { unsafe: true };
  expect(validTilingDocument(deep)).toBe(false);
  expect(
    validateRecord(
      TILING_KEY,
      JSON.stringify(state()).replace(
        '"schema":1',
        '"schema":1,"__proto__":{}',
      ),
    ),
  ).not.toBe("");
  expect(validateRecord(TILING_KEY, " ".repeat(TILING_LIMIT + 1))).toContain(
    "size",
  );
});

test("state limits count UTF-8 bytes across every desktop", () => {
  const saved = defaultTilingState();
  for (let desk = 0; desk < 8; desk++) {
    const doc = deepDocument(24);
    for (const [id, view] of Object.entries(doc.views)) {
      view.title = "界".repeat(300);
      view.params = { key: `${id}${"界".repeat(290)}` };
    }
    expect(validTilingDocument(doc)).toBe(true);
    saved.desks[`desk-${desk}`] = { ...defaultTilingDesk(), document: doc };
  }
  expect(JSON.stringify(saved).length).toBeLessThan(TILING_LIMIT);
  expect(
    new TextEncoder().encode(JSON.stringify(saved)).length,
  ).toBeGreaterThan(TILING_LIMIT);
  expect(validTilingState(saved)).toBe(false);
  expect(validateRecord(TILING_KEY, JSON.stringify(saved))).toContain("size");
});

test("bad persisted tiling is preserved and write failures retain the in-memory layout", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    for (const raw of [
      "bad JSON",
      '{"version":2,"desks":{}}',
      " ".repeat(TILING_LIMIT + 1),
    ]) {
      const disk = new Map([[TILING_KEY, raw]]);
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
          getItem: (key: string) => disk.get(key) ?? null,
          setItem: (key: string, value: string) => disk.set(key, value),
        },
      });
      const store = localState(
        TILING_KEY,
        defaultTilingState(),
        validTilingState,
        TILING_LIMIT,
      );
      expect(store.writable).toBe(false);
      expect(store.save(state())).toBe(false);
      expect(store.value).toEqual(state());
      expect(disk.get(TILING_KEY)).toBe(raw);
    }
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    const store = localState(
      TILING_KEY,
      defaultTilingState(),
      validTilingState,
      TILING_LIMIT,
    );
    expect(store.save(state())).toBe(false);
    expect(store.value).toEqual(state());
    expect(store.message).toContain("unavailable");
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("Data Center exports, restores, and resets tiling with the Windows & desktops category", () => {
  const disk = new Map([
    [TILING_KEY, JSON.stringify(state(deepDocument(24)))],
    ["unrelated", "keep"],
  ]);
  const storage = {
    getItem: (key: string) => disk.get(key) ?? null,
    setItem: (key: string, value: string) => {
      disk.set(key, value);
    },
    removeItem: (key: string) => {
      disk.delete(key);
    },
  };
  const layout = backupCategories.find((category) => category.id === "layout")!;
  expect(layout.keys).toContain(TILING_KEY);
  const snapshots = readCategories(storage).filter(
    (item) => item.category.id === "layout",
  );
  const backup = createBackup(snapshots);
  expect(JSON.parse(backup).categories.layout[TILING_KEY]).toBe(
    disk.get(TILING_KEY),
  );
  const parsed = parseBackup(backup);
  expect(parsed.snapshots[0].issue).toBe("");
  disk.delete(TILING_KEY);
  expect(replaceCategories(storage, parsed.snapshots).ok).toBe(true);
  expect(validTilingState(JSON.parse(disk.get(TILING_KEY)!))).toBe(true);
  expect(replaceCategories(storage, parsed.snapshots, true).ok).toBe(true);
  expect(disk.has(TILING_KEY)).toBe(false);
  expect(disk.get("unrelated")).toBe("keep");
});
