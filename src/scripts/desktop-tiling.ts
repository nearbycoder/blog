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
import {
  COLUMN_GAP,
  COLUMN_INSET,
  columnWidth,
  defaultColumnWidth,
  columnsOf,
  selectedViews,
  containsView,
  inheritedWidth,
  columnRoot,
} from "./desktop-columns";
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

  const isColumns = () => current?.flow !== "canvas";
  const flowInput =
    desktop.querySelector<HTMLSelectElement>("[data-tiling-flow]");
  const columnInput = desktop.querySelector<HTMLSelectElement>(
    "[data-column-width]",
  );
  const restoredWidths = new Map<string, number>();
  const activeId = () => {
    const active = host
      .windows()
      .find(
        (win) =>
          win.dataset.tiled === "true" && win.classList.contains("is-active"),
      );
    return (active && ids.get(active)) || focused;
  };
  const activeColumn = () =>
    columnsOf(current?.document?.root ?? null).find((column) =>
      containsView(column, activeId()),
    );

  function fitCanvas() {
    if (!current) return;
    const columns = columnsOf(current.document?.root ?? null);
    const width = isColumns()
      ? Math.max(
          92,
          columns.reduce(
            (sum, column) =>
              sum +
              (current.columnWidths?.[column.id] ??
                defaultColumnWidth(workspace.clientWidth)),
            0,
          ),
        ) + COLUMN_INSET
      : current.width;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${isColumns() ? workspace.clientHeight : current.height}px`;
    canvas.style.left = `${isColumns() ? Math.max(0, (workspace.clientWidth - width) / 2) : 0}px`;
    workspace.classList.toggle("is-column-workspace", isColumns());
  }

  function prepareColumns(
    doc: LayoutDocument,
    resized = false,
  ): LayoutDocument {
    if (!isColumns()) return doc;
    const columns = columnsOf(doc.root);
    const previous = columnsOf(current.document?.root ?? null);
    let widths: Record<string, number> = Object.assign(
      Object.create(null),
      current.columnWidths,
    );
    // A divider commit changes shares, but not the total strip width. Capture
    // that once on release; never normalize Trellis's in-flight drag document.
    if (
      resized &&
      doc.root?.kind === "split" &&
      doc.root.axis === "x" &&
      current.document?.root?.kind === "split" &&
      JSON.stringify(columns.map((node) => node.id)) ===
        JSON.stringify(previous.map((node) => node.id)) &&
      JSON.stringify(doc.root.weights) !==
        JSON.stringify(current.document.root.weights)
    ) {
      const total = previous.reduce(
        (sum, node) =>
          sum + (widths[node.id] ?? defaultColumnWidth(workspace.clientWidth)),
        0,
      );
      const weightTotal = doc.root.weights.reduce(
        (sum, value) => sum + value,
        0,
      );
      columns.forEach(
        (node, index) =>
          (widths[node.id] = columnWidth(
            (total *
              (doc.root as Extract<LayoutNode, { kind: "split" }>).weights[
                index
              ]) /
              weightTotal,
          )),
      );
    }
    widths = Object.fromEntries(
      columns.map((node) => [
        node.id,
        columnWidth(
          inheritedWidth(node, widths) ??
            widths[
              previous.find((old) =>
                selectedViews(node).some((id) => containsView(old, id)),
              )?.id ?? ""
            ] ??
            defaultColumnWidth(workspace.clientWidth),
        ),
      ]),
    );
    const used = new Set(Object.keys(doc.views));
    const visit = (node: LayoutNode | null) => {
      if (!node) return;
      used.add(node.id);
      if (node.kind === "split") node.children.forEach(visit);
      else if (node.kind === "stage") visit(node.child ?? null);
    };
    visit(doc.root);
    const rootId =
      doc.root?.kind === "split" && doc.root.axis === "x"
        ? doc.root.id
        : allocate("columns", used);
    const next = { ...doc, root: columnRoot(columns, widths, rootId) };
    current = {
      ...current,
      flow: "columns",
      columnWidths: widths,
      document: next,
    };
    fitCanvas();
    return next;
  }

  function scrollColumn(center = false) {
    if (!engine || !isColumns() || gestureActive()) return;
    const columns = columnsOf(current.document?.root ?? null);
    const target = activeColumn() ?? columns[0];
    if (!target) return;
    let left = Number.parseFloat(canvas.style.left) + COLUMN_GAP;
    for (const column of columns) {
      if (column.id === target.id) break;
      left += current.columnWidths?.[column.id] ?? 0;
    }
    const width = (current.columnWidths?.[target.id] ?? 0) - COLUMN_GAP;
    const right = left + width;
    const viewLeft = workspace.scrollLeft;
    const viewport = workspace.clientWidth;
    const x =
      center || width >= viewport - COLUMN_INSET
        ? left + width / 2 - viewport / 2
        : left < viewLeft + 12
          ? left - 12
          : right > viewLeft + viewport - 12
            ? right - viewport + 12
            : viewLeft;
    workspace.scrollTo({
      left: Math.max(0, x),
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function setColumnWidth(width: number) {
    if (!engine || gestureActive()) return;
    const column =
      activeColumn() ?? columnsOf(current.document?.root ?? null)[0];
    if (!column) return;
    current = {
      ...current,
      columnWidths: {
        ...current.columnWidths,
        [column.id]: columnWidth(Math.max(360, width)),
      },
    };
    changing = true;
    engine.setDocument(prepareColumns(cleanDocument(engine.getDocument())), {
      animate: false,
    });
    changing = false;
    persist();
    updateStatus();
    scheduleGeometry();
    requestAnimationFrame(() => scrollColumn(true));
  }

  function columnAction(action: string, move = false) {
    if (!engine || !isColumns() || gestureActive()) return;
    const columns = columnsOf(current.document?.root ?? null);
    const index = Math.max(
      0,
      columns.findIndex((node) => containsView(node, activeId())),
    );
    const column = columns[index];
    if (!column) return;
    if (action === "center") scrollColumn(true);
    else if (action === "full") {
      const width =
        current.columnWidths?.[column.id] ??
        defaultColumnWidth(workspace.clientWidth);
      const full = columnWidth(workspace.clientWidth - COLUMN_INSET);
      if (Math.abs(width - full) < 2) {
        setColumnWidth(
          restoredWidths.get(`${currentDesk}:${column.id}`) ??
            defaultColumnWidth(workspace.clientWidth),
        );
        restoredWidths.delete(`${currentDesk}:${column.id}`);
      } else {
        restoredWidths.set(`${currentDesk}:${column.id}`, width);
        setColumnWidth(full);
      }
    } else if (action === "cycle") {
      const width = current.columnWidths?.[column.id] ?? 0;
      const presets = [1 / 3, 1 / 2, 2 / 3].map((share) =>
        columnWidth((workspace.clientWidth - COLUMN_INSET) * share),
      );
      setColumnWidth(presets.find((value) => value > width + 2) ?? presets[0]);
    } else if (action === "up" || action === "down") {
      const views = selectedViews(column);
      const next =
        views[
          Math.max(
            0,
            Math.min(
              views.length - 1,
              views.indexOf(activeId() ?? "") + (action === "up" ? -1 : 1),
            ),
          )
        ];
      const win = mounted.get(next);
      if (win) host.activate(win);
    } else {
      const next = index + (action === "previous" ? -1 : 1);
      if (!columns[next]) return;
      if (move) {
        [columns[index], columns[next]] = [columns[next], columns[index]];
        const root = current.document!.root!;
        const rootId =
          root.kind === "split" && root.axis === "x"
            ? root.id
            : "desktop-columns";
        const doc = {
          ...current.document!,
          root: columnRoot(columns, current.columnWidths!, rootId),
        };
        changing = true;
        engine.setDocument(doc, { animate: false });
        changing = false;
        current = { ...current, document: doc };
        persist();
        scheduleGeometry();
        scrollColumn();
      } else {
        const win = mounted.get(selectedViews(columns[next])[0]);
        if (win) host.activate(win);
      }
    }
    updateStatus();
  }

  function shortcut(event: KeyboardEvent) {
    if (
      !engine ||
      !isColumns() ||
      !event.ctrlKey ||
      !event.altKey ||
      event.metaKey ||
      !host
        .windows()
        .some(
          (win) =>
            win.dataset.tiled === "true" && win.classList.contains("is-active"),
        )
    )
      return false;
    const action = (
      {
        ArrowLeft: "previous",
        ArrowRight: "next",
        ArrowUp: "up",
        ArrowDown: "down",
        w: "cycle",
        f: "full",
        c: "center",
      } as Record<string, string>
    )[event.key];
    if (
      !action ||
      (event.shiftKey && action !== "previous" && action !== "next")
    )
      return false;
    event.preventDefault();
    columnAction(action, event.shiftKey);
    return true;
  }

  function wheelColumns(event: WheelEvent) {
    if (
      !engine ||
      !isColumns() ||
      event.ctrlKey ||
      event.metaKey ||
      gestureActive()
    )
      return;
    const target = event.target instanceof Element ? event.target : null;
    if (!event.shiftKey && target?.closest(".desktop-window")) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const delta =
      event.deltaY *
      (event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? workspace.clientWidth
          : 1);
    if (!delta || workspace.scrollWidth <= workspace.clientWidth) return;
    event.preventDefault();
    workspace.scrollBy({ left: delta, behavior: "instant" });
  }

  function changeFlow() {
    if (!current || gestureActive()) return;
    current = {
      ...current,
      flow: flowInput?.value === "canvas" ? "canvas" : "columns",
      scrollX: 0,
      scrollY: 0,
    };
    workspace.scrollTo(0, 0);
    sync();
    fitCanvas();
    persist();
    requestAnimationFrame(() => scrollColumn());
  }
  const runColumnAction = (event: Event) =>
    columnAction((event.currentTarget as HTMLElement).dataset.columnAction!);
  const changeColumnWidth = () => {
    const share = Number(columnInput?.value);
    if (share > 0)
      setColumnWidth((workspace.clientWidth - COLUMN_INSET) * share);
  };

  function updateStatus(message?: string) {
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", String(!!current?.enabled));
      toggleButton.setAttribute("aria-label", "Tiled mode");
      toggleButton.title = current?.enabled
        ? "Return this workspace to floating windows"
        : "Arrange this workspace in nested tiled panels";
    }
    if (controls) {
      controls.hidden = !current?.enabled;
      controls.dataset.flow = isColumns() ? "columns" : "canvas";
    }
    if (flowInput) flowInput.value = isColumns() ? "columns" : "canvas";
    const column = activeColumn();
    const width = column && current.columnWidths?.[column.id];
    const full = columnWidth(workspace.clientWidth - COLUMN_INSET);
    desktop
      .querySelector("[data-column-action='full']")
      ?.setAttribute(
        "aria-pressed",
        String(!!width && Math.abs(width - full) < 2),
      );
    if (columnInput) {
      columnInput.value = "custom";
      for (const option of columnInput.options)
        if (
          width &&
          Math.abs(width - columnWidth(full * Number(option.value))) < 2
        )
          columnInput.value = option.value;
    }
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
            : isColumns()
              ? `${columnsOf(current?.document?.root ?? null).length} ${columnsOf(current?.document?.root ?? null).length === 1 ? "column" : "columns"} · Ctrl+Alt+←/→ to navigate · add Shift to move`
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
    const doc = cleanDocument(engine.getDocument());
    const next = prepareColumns(doc, true);
    if (JSON.stringify(doc.root) !== JSON.stringify(next.root)) {
      changing = true;
      engine.setDocument(next, { animate: false });
      changing = false;
    }
    current = { ...current, document: next };
    persist();
    updateStatus();
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
    workspace.classList.remove("is-tiled-workspace", "is-column-workspace");
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
    if (!gestureActive()) fitCanvas();
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
    updateStatus();
    fitCanvas();
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
        "--trellis-gap": `${COLUMN_GAP}px`,
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
        requestAnimationFrame(() => scrollColumn());
        updateStatus();
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
      const children = isColumns()
        ? columnsOf(root)
        : [...(root ? [root] : [])];
      const activeIndex = children.findIndex(
        (node) => containsView(node, focused) || containsView(node, activeId()),
      );
      children.splice(
        isColumns() && activeIndex >= 0 ? activeIndex + 1 : children.length,
        0,
        ...additions,
      );
      root = {
        kind: "split",
        id: allocate("split", allIds),
        axis: "x",
        children,
        weights: children.map(() => 1 / children.length),
      };
    }
    const previousFlow = current.flow;
    const previousWidths = JSON.stringify(current.columnWidths);
    const doc: LayoutDocument = prepareColumns({
      schema: 1,
      root,
      floating: [],
      hidden: [],
      views,
    });
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
    if (
      changed ||
      floatingChanged ||
      previousFlow !== current.flow ||
      previousWidths !== JSON.stringify(current.columnWidths)
    )
      persist();
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
      if (isColumns()) {
        scrollColumn();
        updateStatus();
        return;
      }
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

  function activateTab(event: Event) {
    const tab =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-trellis-part="tab"]')
        : null;
    const win = tab?.dataset.view && mounted.get(tab.dataset.view);
    // Trellis can retain its focused view while a dock commit activates another
    // desktop window. A click must always hand focus back to the selected app.
    if (win && !gestureActive()) host.activate(win);
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
  const columnButtons = desktop.querySelectorAll("[data-column-action]");
  columnButtons.forEach((button) =>
    button.addEventListener("click", runColumnAction),
  );
  flowInput?.addEventListener("change", changeFlow);
  columnInput?.addEventListener("change", changeColumnWidth);
  widthInput?.addEventListener("input", markSizeDraft);
  heightInput?.addEventListener("input", markSizeDraft);
  sizeButton?.addEventListener("click", applySize);
  homeButton?.addEventListener("click", home);
  splitButtons.forEach((button) => button.addEventListener("click", split));
  workspace.addEventListener("scroll", rememberScroll, { passive: true });
  workspace.addEventListener("wheel", wheelColumns, { passive: false });
  workspace.addEventListener("pointerdown", focusWindow, true);
  workspace.addEventListener("focusin", focusWindow);
  workspace.addEventListener("click", activateTab);
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
    shortcut,
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
      columnButtons.forEach((button) =>
        button.removeEventListener("click", runColumnAction),
      );
      flowInput?.removeEventListener("change", changeFlow);
      columnInput?.removeEventListener("change", changeColumnWidth);
      widthInput?.removeEventListener("input", markSizeDraft);
      heightInput?.removeEventListener("input", markSizeDraft);
      sizeButton?.removeEventListener("click", applySize);
      homeButton?.removeEventListener("click", home);
      splitButtons.forEach((button) =>
        button.removeEventListener("click", split),
      );
      workspace.removeEventListener("scroll", rememberScroll);
      workspace.removeEventListener("wheel", wheelColumns);
      workspace.removeEventListener("pointerdown", focusWindow, true);
      workspace.removeEventListener("focusin", focusWindow);
      workspace.removeEventListener("click", activateTab);
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
