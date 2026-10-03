import {
  createWorkspace,
  DEFAULT_KEYMAP,
  type Keymap,
  type LayoutDocument,
  type LayoutNode,
  type WorkspaceHandle,
} from "@danfessler/trellis";
import trellisCss from "@danfessler/trellis/style.css?inline";
import css from "../styles/desktop-tiling.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { getDesktopHost, notifyDesktop } from "./desktop-host";
import { localState } from "./desktop-local-state";
import { getDesktopSpaces } from "./desktop-spaces";
import {
  TILING_KEY,
  TILING_LIMIT,
  defaultTilingDesk,
  defaultTilingState,
  validTilingState,
  type TilingDesk,
} from "./desktop-tiling-state";
import type { WindowLayout } from "./desktop-window-layout";
import type { WindowPlacement } from "./desktop-workspace-store";

const systemWindows = new Set([
  "windows",
  "settings",
  "workspaces",
  "activity",
  "backup",
]);
const geometryFields = [
  "left",
  "top",
  "width",
  "height",
  "minWidth",
  "minHeight",
] as const;
const fallbackKey = (win: HTMLElement) =>
  `window:${win.dataset.window ?? "unknown"}`.slice(0, 300);
const keyOf = (win: HTMLElement) => {
  const key = win.dataset.source ?? win.dataset.window ?? "";
  return key.trim() &&
    key.length <= 300 &&
    !/[\u0000-\u001f\u007f]/.test(key) &&
    !["__proto__", "constructor", "prototype"].includes(key)
    ? key
    : fallbackKey(win);
};
const titleOf = (win: HTMLElement) =>
  (
    win.querySelector(".window-title strong")?.textContent?.trim() ||
    win.getAttribute("aria-label") ||
    win.dataset.window ||
    "Window"
  )
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 300);

/** Keep the real desktop windows mounted; Trellis owns their geometry and tab chrome. */
export function mountDesktopTiling(
  desktop: HTMLElement,
  options?: {
    capture: (win: HTMLElement) => WindowPlacement;
    constrain: (win: HTMLElement) => void;
  },
) {
  installAppStyle("trellis", trellisCss + "\n" + css);
  const host = getDesktopHost();
  const workspace = desktop.querySelector<HTMLElement>("[data-workspace]")!;
  const controls = desktop.querySelector<HTMLElement>("[data-tiling-controls]");
  const sessionTools = desktop.querySelector<HTMLElement>(
    ".desktop-session-tools",
  );
  const workspaceAttributes = ["tabindex", "role", "aria-label"].map(
    (name) => [name, workspace.getAttribute(name)] as const,
  );
  const toggleButton = desktop.querySelector<HTMLButtonElement>(
    "[data-tiling-toggle]",
  );
  const widthInput = desktop.querySelector<HTMLInputElement>(
    "[data-tiling-width]",
  );
  const heightInput = desktop.querySelector<HTMLInputElement>(
    "[data-tiling-height]",
  );
  const status = desktop.querySelector<HTMLElement>("[data-tiling-status]");
  const state = localState(
    TILING_KEY,
    defaultTilingState(),
    validTilingState,
    TILING_LIMIT,
  );
  const canvas = document.createElement("div");
  canvas.className = "desktop-tiling-canvas";
  canvas.dataset.tilingCanvas = "";
  canvas.hidden = true;
  workspace.append(canvas);
  const mobile = matchMedia("(max-width: 760px)");
  const placements = new Map<HTMLElement, WindowPlacement>();
  const excluded = new Map<HTMLElement, string>();
  const ids = new WeakMap<HTMLElement, string>();
  const mounted = new Map<string, HTMLElement>();
  const subscriptions: (() => void)[] = [];
  const observedSurfaces = new Set<HTMLElement>();
  let engine: WorkspaceHandle | undefined;
  let currentDesk = "";
  let current: TilingDesk;
  let nextId = 0;
  let frame = 0;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let suspension = 0;
  let changing = false;
  let focusing = false;
  let previousFocus: string | undefined;
  let focused: string | undefined;
  let pendingReveal: HTMLElement | undefined;
  let hiddenViewport: { desk: string; x: number; y: number } | undefined;
  let geometryChanged = false;
  let pendingSync = false;
  let sizeDraft = false;
  let saveIssue: string | undefined;

  function updateStatus(message?: string) {
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", String(!!current?.enabled));
      toggleButton.setAttribute("aria-label", "Tiled mode");
      toggleButton.title = current?.enabled
        ? "Return this workspace to floating windows"
        : "Arrange this workspace in nested tiled panels";
    }
    if (controls) controls.hidden = !current?.enabled;
    if (widthInput && !sizeDraft && document.activeElement !== widthInput)
      widthInput.value = String(current?.width ?? 1600);
    if (heightInput && !sizeDraft && document.activeElement !== heightInput)
      heightInput.value = String(current?.height ?? 1100);
    if (status)
      status.textContent =
        message ??
        (mobile.matches && current?.enabled
          ? "Tiling resumes on a wider screen."
          : saveIssue || !state.writable
            ? (saveIssue ?? state.message)
            : `${mounted.size} ${mounted.size === 1 ? "window" : "windows"} · ${current?.width ?? 1600} × ${current?.height ?? 1100} · scroll both ways`);
  }

  function persist() {
    if (stopped || suspension || !currentDesk || !current) return;
    const spaces = getDesktopSpaces()?.state.spaces;
    const existing = new Set(
      spaces?.map((space) => space.id) ?? [
        ...Object.keys(state.value.desks),
        currentDesk,
      ],
    );
    const desks = Object.fromEntries(
      Object.entries(state.value.desks).filter(([id]) => existing.has(id)),
    );
    if (existing.has(currentDesk)) desks[currentDesk] = current;
    const saved = state.save({
      ...state.value,
      desks,
    });
    saveIssue = saved
      ? undefined
      : state.writable && state.message === "Saved on this device."
        ? "Layout could not be saved; changes last for this visit."
        : state.message;
    if (saveIssue && status) status.textContent = saveIssue;
  }

  function cleanDocument(doc: LayoutDocument): LayoutDocument {
    const used = new Set<string>();
    const root = prune(doc.root, new Set(Object.keys(doc.views)), used);
    return {
      schema: 1,
      root,
      floating: [],
      hidden: [],
      views: Object.fromEntries(
        [...used].map((id) => [
          id,
          {
            type: "desktop",
            params: { key: String(doc.views[id].params?.key ?? "") },
            title: doc.views[id].title?.slice(0, 300),
          },
        ]),
      ),
    };
  }

  function gestureActive() {
    return (
      !!engine &&
      (engine.getSnapshot().dragging ||
        engine.element.hasAttribute("data-resizing"))
    );
  }

  function rememberDocument() {
    // Trellis exposes a temporary document during tab tears and divider moves.
    // Only its committed document may enter persistence or reconciliation.
    if (!engine || changing || !current || gestureActive()) return;
    current = { ...current, document: cleanDocument(engine.getDocument()) };
    persist();
  }

  function rememberScroll() {
    if (
      !engine ||
      !current ||
      changing ||
      suspension ||
      hiddenViewport ||
      desktop.dataset.showDesktop === "true"
    )
      return;
    current = {
      ...current,
      scrollX: workspace.scrollLeft,
      scrollY: workspace.scrollTop,
    };
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(persist, 140);
  }

  function visibleAgain(win: HTMLElement) {
    if (win.dataset.tilingHidden !== "true") return;
    delete win.dataset.tilingHidden;
    if (win.dataset.spaceHidden !== "true") win.hidden = false;
  }

  function restoreWindow(win: HTMLElement) {
    visibleAgain(win);
    const saved = placements.get(win);
    if (saved) {
      for (const key of geometryFields) win.style[key] = saved[key];
      if (saved.layout) win.dataset.snap = saved.layout;
      else delete win.dataset.snap;
      win.classList.toggle("is-maximized", saved.layout === "maximized");
    }
    placements.delete(win);
    delete win.dataset.tiled;
    delete win.dataset.trellisView;
    delete win.dataset.tilingBusy;
  }

  function stopEngine() {
    if (engine) rememberDocument();
    changing = true;
    for (const unsubscribe of subscriptions.splice(0)) unsubscribe();
    engine?.destroy();
    engine = undefined;
    for (const content of observedSurfaces) resizeObserver.unobserve(content);
    observedSurfaces.clear();
    pendingSync = false;
    pendingReveal = undefined;
    hiddenViewport = undefined;
    const restored = [...placements.keys()];
    for (const win of restored) restoreWindow(win);
    mounted.clear();
    workspace.classList.remove("is-tiled-workspace");
    for (const [name, value] of workspaceAttributes) {
      if (value === null) workspace.removeAttribute(name);
      else workspace.setAttribute(name, value);
    }
    if (sessionTools && sessionTools.parentElement !== workspace)
      workspace.prepend(sessionTools);
    if (controls) controls.hidden = true;
    delete desktop.dataset.tiling;
    canvas.hidden = true;
    workspace.scrollLeft = 0;
    workspace.scrollTop = 0;
    for (const win of host.windows()) if (!win.hidden) options?.constrain(win);
    delete desktop.dataset.tilingDragging;
    changing = false;
  }

  function scheduleGeometry() {
    if (frame || stopped) return;
    frame = requestAnimationFrame(positionWindows);
  }

  function positionWindows() {
    frame = 0;
    if (!engine || suspension || desktop.dataset.showDesktop === "true") return;
    if (pendingSync && !gestureActive()) {
      pendingSync = false;
      sync();
      if (!engine) return;
    }
    const origin = workspace.getBoundingClientRect();
    const busy = engine.getSnapshot().dragging;
    if (desktop.hasAttribute("data-tiling-dragging") !== busy)
      desktop.toggleAttribute("data-tiling-dragging", busy);
    // The native drag preview owns visibility until release. A temporarily
    // detached tab is still an open app, not a new or minimized window.
    if (busy) return;
    for (const content of observedSurfaces) {
      if (!content.isConnected) {
        resizeObserver.unobserve(content);
        observedSurfaces.delete(content);
      }
    }
    for (const surface of engine.surfaces()) {
      // Native divider previews resize content without emitting a committed
      // change. Follow those rectangles without rewriting the layout document.
      if (!observedSurfaces.has(surface.content)) {
        observedSurfaces.add(surface.content);
        resizeObserver.observe(surface.content);
      }
      const win = mounted.get(surface.view.id);
      if (!win || win.dataset.spaceHidden === "true") continue;
      if (!surface.view.visible) {
        if (!win.hidden) {
          win.dataset.tilingHidden = "true";
          win.hidden = true;
          geometryChanged = true;
        }
        continue;
      }
      if (win.dataset.tilingHidden === "true") {
        visibleAgain(win);
        geometryChanged = true;
      }
      if (win.hidden) continue;
      const rect = surface.content.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const values = {
        left: `${Math.round((rect.left - origin.left + workspace.scrollLeft) * 100) / 100}px`,
        top: `${Math.round((rect.top - origin.top + workspace.scrollTop) * 100) / 100}px`,
        width: `${Math.round(rect.width * 100) / 100}px`,
        height: `${Math.round(rect.height * 100) / 100}px`,
        minWidth: "0px",
        minHeight: "0px",
      };
      for (const key of geometryFields)
        if (win.style[key] !== values[key]) win.style[key] = values[key];
      const interactive = surface.view.interactive && !busy;
      if (win.dataset.tilingBusy !== String(!interactive))
        win.dataset.tilingBusy = String(!interactive);
    }
    if (geometryChanged) {
      geometryChanged = false;
      host.changed();
    }
  }

  function createEngine(doc: LayoutDocument) {
    if (sessionTools && sessionTools.parentElement === workspace)
      desktop.insertBefore(sessionTools, controls ?? workspace);
    canvas.hidden = false;
    workspace.classList.add("is-tiled-workspace");
    workspace.tabIndex = 0;
    workspace.setAttribute("role", "region");
    workspace.setAttribute("aria-label", "Scrollable tiled workspace");
    desktop.dataset.tiling = "true";
    canvas.style.width = `${current.width}px`;
    canvas.style.height = `${current.height}px`;
    const keymap = Object.fromEntries(
      Object.keys(DEFAULT_KEYMAP).map((key) => [key, null]),
    ) as Keymap;
    engine = createWorkspace(canvas, {
      document: doc,
      label: "Tiled desktop panels",
      floating: false,
      navigation: false,
      motion: "reduced",
      detail: false,
      keymap,
      gestureKeys: { pan: null, scale: null, rect: null, step: null },
      panelMenu: () => [],
      theme:
        document.documentElement.dataset.theme === "light" ? "light" : "dark",
      tokens: {
        "--trellis-accent": "var(--desk-accent)",
        "--trellis-text": "var(--desk-ink)",
        "--trellis-panel": "var(--desk-paper)",
        "--trellis-tabbar": "var(--desk-sidebar)",
        "--trellis-border": "var(--desk-line)",
        "--trellis-bg": "transparent",
      },
      types: {
        desktop: {
          title: (view) => {
            const win = mounted.get(view.id);
            return win ? titleOf(win) : "Window";
          },
          closable: false,
          allow: { floating: false },
          scaling: false,
          tabbar: "always",
          minSize: { width: 240, height: 200 },
          mount(_element, view, parts) {
            const group = document.createElement("div");
            group.className = "desktop-tiling-window-actions";
            const buttons = [
              ["float", "↗", "Float"],
              ["minimize", "−", "Minimize"],
              ["close", "×", "Close"],
            ] as const;
            const labels: { button: HTMLButtonElement; label: string }[] = [];
            for (const [action, glyph, label] of buttons) {
              const button = document.createElement("button");
              button.type = "button";
              button.dataset.tilingAction = action;
              button.textContent = glyph;
              const title = mounted.get(view.id);
              button.setAttribute(
                "aria-label",
                `${label} ${title ? titleOf(title) : "window"}`,
              );
              button.title = `${label} window`;
              labels.push({ button, label });
              button.addEventListener("pointerdown", (event) =>
                event.stopPropagation(),
              );
              button.addEventListener("click", (event) => {
                event.stopPropagation();
                const win = mounted.get(view.id);
                if (!win) return;
                if (action === "float") {
                  release(win);
                  host.activate(win);
                } else if (action === "minimize") host.minimize(win);
                else host.close(win);
                sync();
              });
              group.append(button);
            }
            parts.accessory.append(group);
            const off = view.subscribe(() => {
              for (const { button, label } of labels) {
                const name = `${label} ${view.title}`;
                if (button.getAttribute("aria-label") !== name)
                  button.setAttribute("aria-label", name);
              }
              scheduleGeometry();
            });
            return () => {
              off();
              group.remove();
            };
          },
        },
      },
    });
    engine.slots.empty.textContent =
      "Open an app to add a panel to this workspace.";
    subscriptions.push(
      engine.on("change", () => {
        rememberDocument();
        scheduleGeometry();
      }),
      engine.on("surfaces", scheduleGeometry),
      engine.subscribe(scheduleGeometry),
      engine.on("focus", (id) => {
        if (!id || focusing || changing) return;
        if (focused !== id) {
          previousFocus = focused;
          focused = id;
        }
        const win = mounted.get(id);
        if (!win || win.dataset.spaceHidden === "true") return;
        focusing = true;
        visibleAgain(win);
        host.activate(win);
        focusing = false;
        scheduleGeometry();
      }),
    );
    workspace.scrollLeft = current.scrollX;
    workspace.scrollTop = current.scrollY;
    scheduleGeometry();
  }

  function allocate(prefix: string, used: Set<string>) {
    let id: string;
    do id = `desktop-${prefix}-${++nextId}`;
    while (used.has(id));
    used.add(id);
    return id;
  }

  function reconcile() {
    const allWindows = host.windows();
    const identities = new Map<HTMLElement, string>();
    const keys = new Set<string>();
    for (const win of allWindows) {
      if (win.dataset.spaceHidden === "true") continue;
      const preferred = keyOf(win);
      const key = keys.has(preferred) ? fallbackKey(win) : preferred;
      keys.add(key);
      identities.set(win, key);
    }
    let floatingKeys = current.floatingKeys ?? [];
    for (const [win, key] of identities) {
      const previous = excluded.get(win);
      if (previous && previous !== key) {
        floatingKeys = [
          ...new Set([
            ...floatingKeys.filter((item) => item !== previous),
            key,
          ]),
        ].slice(-128);
        excluded.set(win, key);
      } else if (floatingKeys.includes(key)) excluded.set(win, key);
    }
    const floatingChanged =
      JSON.stringify(current.floatingKeys ?? []) !==
      JSON.stringify(floatingKeys);
    if (floatingChanged) current = { ...current, floatingKeys };
    const windows = allWindows.filter(
      (win) =>
        !systemWindows.has(win.dataset.window ?? "") &&
        !excluded.has(win) &&
        win.dataset.spaceHidden !== "true" &&
        (!win.hidden || win.dataset.tilingHidden === "true") &&
        (win.dataset.window !== "library" || win.dataset.opened === "true"),
    );
    const base = engine?.getDocument() ??
      current.document ?? {
        schema: 1,
        root: null,
        floating: [],
        hidden: [],
        views: {},
      };
    const allIds = new Set(Object.keys(base.views));
    const collect = (node: LayoutNode | null) => {
      if (!node) return;
      allIds.add(node.id);
      if (node.kind === "split") node.children.forEach(collect);
      else if (node.kind === "stage") collect(node.child ?? null);
    };
    collect(base.root);
    const views: LayoutDocument["views"] = {};
    const next = new Map<string, HTMLElement>();
    for (const win of windows) {
      const key = identities.get(win)!;
      const known = ids.get(win);
      const match =
        known &&
        base.views[known] &&
        !next.has(known) &&
        (mounted.get(known) === win || base.views[known].params?.key === key)
          ? known
          : Object.keys(base.views).find(
              (id) => base.views[id].params?.key === key && !next.has(id),
            );
      const id = match ?? allocate("view", allIds);
      ids.set(win, id);
      next.set(id, win);
      views[id] = { type: "desktop", params: { key }, title: titleOf(win) };
      if (!placements.has(win)) {
        const computed = getComputedStyle(win);
        placements.set(
          win,
          options?.capture(win) ?? {
            left: computed.left,
            top: computed.top,
            width: computed.width,
            height: computed.height,
            minWidth: win.style.minWidth,
            minHeight: win.style.minHeight,
            ...(win.dataset.snap
              ? { layout: win.dataset.snap as WindowLayout }
              : {}),
          },
        );
      }
      if (win.dataset.snap) delete win.dataset.snap;
      if (win.classList.contains("is-maximized"))
        win.classList.remove("is-maximized");
      if (win.dataset.tiled !== "true") win.dataset.tiled = "true";
      if (win.dataset.trellisView !== id) win.dataset.trellisView = id;
    }
    for (const [id, win] of mounted) if (!next.has(id)) restoreWindow(win);
    mounted.clear();
    for (const [id, win] of next) mounted.set(id, win);
    const used = new Set<string>();
    let root = prune(base.root, new Set(next.keys()), used);
    const additions: LayoutNode[] = [...next.keys()]
      .filter((id) => !used.has(id))
      .map((id) => ({
        kind: "panel",
        id: allocate("panel", allIds),
        views: [id],
        selected: id,
      }));
    if (!root && additions.length === 1) root = additions[0];
    else if (additions.length) {
      const children = [...(root ? [root] : []), ...additions];
      root = {
        kind: "split",
        id: allocate("split", allIds),
        axis: "x",
        children,
        weights: children.map(() => 1 / children.length),
      };
    }
    const doc: LayoutDocument = {
      schema: 1,
      root,
      floating: [],
      hidden: [],
      views,
    };
    // View maps have no meaningful order: tree traversal changes after docking,
    // while host.windows() retains creation order. Comparing insertion order
    // caused setDocument() to interrupt otherwise unchanged layouts repeatedly.
    const signature = (value: LayoutDocument) =>
      JSON.stringify({
        ...value,
        views: Object.fromEntries(
          Object.entries(value.views).sort(([a], [b]) => a.localeCompare(b)),
        ),
      });
    const changed = signature(cleanDocument(base)) !== signature(doc);
    changing = true;
    if (!engine) createEngine(doc);
    else if (changed) engine.setDocument(doc, { animate: false });
    changing = false;
    current = { ...current, document: cleanDocument(engine!.getDocument()) };
    if (changed || floatingChanged) persist();
    scheduleGeometry();
    updateStatus();
  }

  function sync() {
    if (stopped || suspension || changing) return;
    if (gestureActive()) {
      pendingSync = true;
      return;
    }
    if (desktop.dataset.showDesktop === "true") {
      if (engine && !hiddenViewport) {
        hiddenViewport = {
          desk: currentDesk,
          x: workspace.scrollLeft,
          y: workspace.scrollTop,
        };
        current = {
          ...current,
          scrollX: hiddenViewport.x,
          scrollY: hiddenViewport.y,
        };
        pendingReveal = undefined;
        clearTimeout(scrollTimer);
        persist();
      }
      canvas.hidden = true;
      return;
    }
    const desk = desktop.dataset.activeSpace || "desk-1";
    if (desk !== currentDesk) {
      if (currentDesk) stopEngine();
      excluded.clear();
      currentDesk = desk;
      sizeDraft = false;
      current = state.value.desks[desk]
        ? { ...state.value.desks[desk] }
        : defaultTilingDesk();
      previousFocus = focused = undefined;
      pendingReveal = undefined;
    }
    if (!current.enabled || mobile.matches) {
      if (engine) stopEngine();
      updateStatus();
      return;
    }
    canvas.hidden = false;
    if (hiddenViewport?.desk === currentDesk) {
      workspace.scrollTo({
        left: hiddenViewport.x,
        top: hiddenViewport.y,
        behavior: "instant",
      });
      current = {
        ...current,
        scrollX: workspace.scrollLeft,
        scrollY: workspace.scrollTop,
      };
      hiddenViewport = undefined;
      persist();
    }
    reconcile();
    if (pendingReveal) {
      const target = pendingReveal;
      if (
        !target.isConnected ||
        (target.hidden && target.dataset.tilingHidden !== "true")
      )
        pendingReveal = undefined;
      else if (target.dataset.tiled === "true") {
        pendingReveal = undefined;
        reveal(target);
      }
    }
  }

  function reveal(win: HTMLElement) {
    if (
      !engine ||
      focusing ||
      excluded.has(win) ||
      systemWindows.has(win.dataset.window ?? "")
    )
      return;
    if (win.dataset.tiled !== "true") {
      pendingReveal = win;
      return;
    }
    const id = ids.get(win);
    if (!id || !mounted.has(id)) return;
    focusing = true;
    if (focused !== id) {
      previousFocus = focused;
      focused = id;
    }
    engine.select(id);
    visibleAgain(win);
    focusing = false;
    scheduleGeometry();
    requestAnimationFrame(() => {
      if (!engine || !win.isConnected || win.hidden) return;
      const panel = engine.view(id)?.panelId;
      const bar = [
        ...engine.element.querySelectorAll<HTMLElement>(
          '[data-trellis-part="tabbar"]',
        ),
      ]
        .find((element) => element.dataset.panel === panel)
        ?.getBoundingClientRect();
      const origin = workspace.getBoundingClientRect();
      const left = bar
        ? bar.left - origin.left + workspace.scrollLeft
        : Number.parseFloat(win.style.left);
      const top = bar
        ? bar.top - origin.top + workspace.scrollTop
        : Number.parseFloat(win.style.top);
      const height = win.offsetHeight + (bar?.height ?? 0);
      const x =
        win.offsetWidth >= workspace.clientWidth || left < workspace.scrollLeft
          ? left
          : left + win.offsetWidth >
              workspace.scrollLeft + workspace.clientWidth
            ? left + win.offsetWidth - workspace.clientWidth
            : workspace.scrollLeft;
      const y =
        height >= workspace.clientHeight || top < workspace.scrollTop
          ? top
          : top + height > workspace.scrollTop + workspace.clientHeight
            ? top + height - workspace.clientHeight
            : workspace.scrollTop;
      workspace.scrollTo({
        left: Math.max(0, x),
        top: Math.max(0, y),
        behavior: "instant",
      });
    });
  }

  function release(win: HTMLElement) {
    if (!placements.has(win)) return;
    const id = ids.get(win);
    const key = String(
      (id && engine?.getDocument().views[id]?.params?.key) || keyOf(win),
    );
    excluded.set(win, key);
    current = {
      ...current,
      floatingKeys: [...new Set([...(current.floatingKeys ?? []), key])].slice(
        -128,
      ),
    };
    workspace.scrollTo({ left: 0, top: 0, behavior: "instant" });
    restoreWindow(win);
    options?.constrain(win);
    sync();
    rememberDocument();
    host.changed();
  }

  function toggle() {
    sync();
    if (current.enabled) {
      stopEngine();
      current = { ...current, enabled: false };
    } else {
      excluded.clear();
      current = { ...current, enabled: true, floatingKeys: [] };
    }
    persist();
    sync();
    host.changed();
    host.announce(
      current.enabled
        ? "Tiled workspace enabled. Drag tabs to nest panels; scroll horizontally and vertically."
        : "Floating windows restored.",
    );
  }

  function applySize() {
    if (!current) return;
    const width = Number(widthInput?.value),
      height = Number(heightInput?.value);
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 800 ||
      width > 6000 ||
      height < 800 ||
      height > 6000
    ) {
      updateStatus("Choose a width and height between 800 and 6000 pixels.");
      return;
    }
    sizeDraft = false;
    current = { ...current, width, height };
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    persist();
    updateStatus();
    scheduleGeometry();
  }

  function split(event: Event) {
    if (!engine) return;
    const edge = (event.currentTarget as HTMLElement).dataset.tilingSplit;
    if (edge !== "right" && edge !== "bottom") return;
    const active = host
      .windows()
      .find(
        (win) =>
          win.classList.contains("is-active") && win.dataset.tiled === "true",
      );
    const id = active ? ids.get(active) : focused;
    const target =
      previousFocus && previousFocus !== id && mounted.has(previousFocus)
        ? previousFocus
        : [...mounted.keys()].find((other) => other !== id);
    if (!id || !target) {
      updateStatus("Open at least two apps to split a panel.");
      return;
    }
    engine.dock(id, { beside: target, edge });
    rememberDocument();
    scheduleGeometry();
    host.announce(
      `Panel split ${edge === "right" ? "to the right" : "below"}.`,
    );
  }

  function focusWindow(event: Event) {
    if (!engine || focusing) return;
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-tiled='true']")
        : null;
    const id = target && ids.get(target);
    if (!id || !mounted.has(id)) return;
    if (focused !== id) {
      previousFocus = focused;
      focused = id;
    }
    engine.select(id);
  }

  function home() {
    workspace.scrollTo({ left: 0, top: 0, behavior: "instant" });
  }
  const sizeButton = desktop.querySelector("[data-tiling-apply-size]");
  const homeButton = desktop.querySelector("[data-tiling-home]");
  const splitButtons = desktop.querySelectorAll("[data-tiling-split]");
  const markSizeDraft = () => {
    sizeDraft = true;
  };
  widthInput?.addEventListener("input", markSizeDraft);
  heightInput?.addEventListener("input", markSizeDraft);
  sizeButton?.addEventListener("click", applySize);
  homeButton?.addEventListener("click", home);
  splitButtons.forEach((button) => button.addEventListener("click", split));
  workspace.addEventListener("scroll", rememberScroll, { passive: true });
  workspace.addEventListener("pointerdown", focusWindow, true);
  workspace.addEventListener("focusin", focusWindow);
  document.addEventListener("desktop-spaces-changed", sync);
  document.addEventListener("desktop-windows-changed", sync);
  mobile.addEventListener("change", sync);
  const resizeObserver = new ResizeObserver(scheduleGeometry);
  resizeObserver.observe(canvas);
  resizeObserver.observe(workspace);
  const themeObserver = new MutationObserver(() =>
    engine?.update({
      theme:
        document.documentElement.dataset.theme === "light" ? "light" : "dark",
    }),
  );
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  function pagehide() {
    clearTimeout(scrollTimer);
    rememberDocument();
    persist();
  }
  window.addEventListener("pagehide", pagehide);

  try {
    sync();
  } catch (error) {
    stopEngine();
    notifyDesktop(
      "Tiled panels could not start. Your apps are still available as floating windows.",
      "system",
    );
    throw error;
  }
  if (!state.writable) notifyDesktop(state.message, "system");

  return {
    sync,
    reveal,
    release,
    toggle,
    capture: (win: HTMLElement) => placements.get(win),
    suspend() {
      pagehide();
      suspension++;
      return () => {
        suspension = Math.max(0, suspension - 1);
        sync();
      };
    },
    destroy() {
      pagehide();
      stopEngine();
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(scrollTimer);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      widthInput?.removeEventListener("input", markSizeDraft);
      heightInput?.removeEventListener("input", markSizeDraft);
      sizeButton?.removeEventListener("click", applySize);
      homeButton?.removeEventListener("click", home);
      splitButtons.forEach((button) =>
        button.removeEventListener("click", split),
      );
      workspace.removeEventListener("scroll", rememberScroll);
      workspace.removeEventListener("pointerdown", focusWindow, true);
      workspace.removeEventListener("focusin", focusWindow);
      document.removeEventListener("desktop-spaces-changed", sync);
      document.removeEventListener("desktop-windows-changed", sync);
      mobile.removeEventListener("change", sync);
      window.removeEventListener("pagehide", pagehide);
      canvas.remove();
    },
  };
}

/** Remove unavailable views without losing the remaining split hierarchy or tab selection. */
function prune(
  node: LayoutNode | null,
  allowed: Set<string>,
  used: Set<string>,
): LayoutNode | null {
  if (!node) return null;
  if (node.kind === "panel") {
    const views = node.views.filter((id) => allowed.has(id) && !used.has(id));
    views.forEach((id) => used.add(id));
    return views.length
      ? {
          ...node,
          views,
          selected: views.includes(node.selected) ? node.selected : views[0],
        }
      : null;
  }
  if (node.kind === "stage") {
    const child = prune(node.child ?? null, allowed, used);
    return child && child.kind !== "stage" ? { ...node, child } : null;
  }
  const children: LayoutNode[] = [],
    weights: number[] = [];
  node.children.forEach((child, index) => {
    const next = prune(child, allowed, used);
    if (next) {
      children.push(next);
      weights.push(node.weights[index] ?? 1);
    }
  });
  if (!children.length) return null;
  if (children.length === 1) return children[0];
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return {
    ...node,
    children,
    weights: weights.map((weight) => weight / total),
  };
}
