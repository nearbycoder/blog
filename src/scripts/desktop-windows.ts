import css from "../styles/desktop-windows.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { getDesktopHost } from "./desktop-host";
import type { WindowLayout } from "./desktop-window-layout";

installAppStyle("windows", css);

const titleOf = (win: HTMLElement) => win.dataset.title ?? "Library";
const stateOf = (win: HTMLElement) =>
  win.dataset.spaceHidden === "true"
    ? "On another desktop"
    : win.dataset.tilingHidden === "true"
      ? "In a tiled tab"
      : win.hidden
        ? "Minimized"
        : "Open";
const mobile = () =>
  matchMedia("(max-width: 760px), (pointer: coarse)").matches;
const layouts: [WindowLayout | "floating", string][] = [
  ["floating", "Floating"],
  ["left", "Left half"],
  ["right", "Right half"],
  ["top-left", "Top left quarter"],
  ["top-right", "Top right quarter"],
  ["bottom-left", "Bottom left quarter"],
  ["bottom-right", "Bottom right quarter"],
  ["maximized", "Full workspace"],
];

let switcher: { advance: () => void; close: () => void } | undefined;

/** A browser-safe alternative to the operating system's Alt+Tab. */
export function openWindowSwitcher() {
  if (switcher) {
    switcher.advance();
    return;
  }
  const host = getDesktopHost();
  if (!host) return;
  const previousFocus = document.activeElement as HTMLElement | null;
  const frameFocus =
    previousFocus instanceof HTMLIFrameElement
      ? (() => {
          try {
            return previousFocus.contentDocument
              ?.activeElement as HTMLElement | null;
          } catch {
            return null;
          }
        })()
      : null;
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const dialog = document.createElement("dialog");
  dialog.className = "desktop-window-switcher";
  dialog.setAttribute("aria-label", "Switch windows");
  dialog.innerHTML = `<header><div><h2>Switch windows</h2><p>Most recently used first</p></div><button type="button" data-switcher-close aria-label="Close window switcher">Esc</button></header><div class="window-switcher-list" role="group" aria-label="Open windows"></div><p class="window-switcher-empty" hidden>No open windows. Open an app from the launcher.</p><footer>Arrow keys to choose · Enter to switch · Escape to cancel</footer>`;
  const list = dialog.querySelector<HTMLElement>(".window-switcher-list")!;
  const empty = dialog.querySelector<HTMLElement>(".window-switcher-empty")!;
  const closeButton = dialog.querySelector<HTMLButtonElement>(
    "[data-switcher-close]",
  )!;
  const rows = new Map<HTMLElement, HTMLButtonElement>();
  let ordered = host
    .windows()
    .sort(
      (a, b) =>
        Number(b.dataset.lastActive ?? 0) - Number(a.dataset.lastActive ?? 0),
    );
  let selected = ordered[Math.min(1, ordered.length - 1)];
  let closed = false;
  let composing = false;

  function close(restoreFocus = true) {
    if (closed) return;
    closed = true;
    controller.abort();
    switcher = undefined;
    dialog.close();
    dialog.remove();
    if (restoreFocus) {
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) {
        previousFocus.focus({ preventScroll: true });
        if (frameFocus?.isConnected) frameFocus.focus({ preventScroll: true });
      } else {
        const active = host
          .windows()
          .find((win) => !win.hidden && win.classList.contains("is-active"));
        active?.focus({ preventScroll: true });
      }
    }
  }

  function choose(win: HTMLElement) {
    close(false);
    if (host.windows().includes(win)) host.activate(win);
  }

  function select(win: HTMLElement, focus = true) {
    selected = win;
    rows.forEach((button, item) => {
      button.tabIndex = item === selected ? 0 : -1;
      button.classList.toggle("is-selected", item === selected);
    });
    if (focus) rows.get(selected)?.focus({ preventScroll: true });
    rows.get(selected)?.scrollIntoView({ block: "nearest" });
  }

  function refresh() {
    const current = host.windows();
    // Keep the original MRU order while the dialog is open. Focus and window
    // status updates must not reshuffle the item under the keyboard or pointer.
    ordered = [
      ...ordered.filter((win) => current.includes(win)),
      ...current.filter((win) => !ordered.includes(win)),
    ];
    const focusedRemoved = !selected || !ordered.includes(selected);
    for (const [win, row] of rows) {
      if (!ordered.includes(win)) {
        row.remove();
        rows.delete(win);
      }
    }
    for (const win of ordered) {
      let button = rows.get(win);
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "window-switcher-item";
        button.dataset.switchWindow = win.dataset.window;
        const icon = document.createElement("span");
        icon.className = "window-switcher-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "▣";
        const name = document.createElement("strong");
        const state = document.createElement("span");
        state.className = "window-switcher-state";
        button.append(icon, name, state);
        button.addEventListener("click", () => choose(win), events);
        button.addEventListener("focus", () => select(win, false), events);
        rows.set(win, button);
        list.append(button);
      }
      button.querySelector("strong")!.textContent = titleOf(win);
      button.querySelector(".window-switcher-state")!.textContent = [
        stateOf(win),
        win.dataset.pinned === "true" ? "Kept above" : "",
      ]
        .filter(Boolean)
        .join(" · ");
    }
    empty.hidden = ordered.length > 0;
    if (focusedRemoved) selected = ordered[0];
    if (selected) select(selected, focusedRemoved && dialog.open);
    else if (dialog.open) closeButton.focus();
  }

  function move(direction: number) {
    if (!ordered.length) return;
    const index = ordered.indexOf(selected);
    select(ordered[(index + direction + ordered.length) % ordered.length]);
  }

  closeButton.addEventListener("click", () => close(), events);
  dialog.addEventListener(
    "compositionstart",
    () => {
      composing = true;
    },
    events,
  );
  dialog.addEventListener(
    "compositionend",
    () => {
      composing = false;
    },
    events,
  );
  window.addEventListener("pagehide", () => close(false), events);
  dialog.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      if (!composing) close();
    },
    events,
  );
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        close();
    },
    events,
  );
  dialog.addEventListener(
    "keydown",
    (event) => {
      if (composing || event.isComposing || event.keyCode === 229) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        [
          "ArrowDown",
          "ArrowRight",
          "ArrowUp",
          "ArrowLeft",
          "Home",
          "End",
        ].includes(event.key)
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "Home" && ordered[0]) select(ordered[0]);
        else if (event.key === "End" && ordered.length)
          select(ordered[ordered.length - 1]);
        else
          move(
            event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1,
          );
      }
    },
    events,
  );
  document.addEventListener("desktop-windows-changed", refresh, events);
  switcher = { advance: () => move(1), close: () => close() };
  host.desktop.append(dialog);
  refresh();
  dialog.showModal();
  if (selected) select(selected);
  else closeButton.focus();
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("window-overview-app");
  const host = getDesktopHost();
  const manager = root.closest<HTMLElement>("[data-window]")!;
  const controller = new AbortController();
  const events = { signal: controller.signal };
  root.innerHTML = `<div class="desk-app-toolbar"><button type="button" data-overview-switch>Switch windows</button><button type="button" data-overview-reopen>Reopen last closed</button></div><div class="window-overview-heading"><h2>Your workspace</h2><span data-overview-count></span></div><p class="window-overview-help">Manage open apps and readers. <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> opens the switcher.</p><div class="window-overview-list"></div><p class="window-overview-empty" hidden>Nothing else is open. Launch an app or open the Library to get started.</p><p class="desk-app-status" data-overview-status role="status">Keeping an app above others is saved in this browser.</p>`;
  const list = root.querySelector<HTMLElement>(".window-overview-list")!;
  const reopen = root.querySelector<HTMLButtonElement>(
    "[data-overview-reopen]",
  )!;
  const status = root.querySelector<HTMLElement>("[data-overview-status]")!;
  type Card = {
    el: HTMLElement;
    title: HTMLElement;
    state: HTMLElement;
    minimize: HTMLButtonElement;
    pin: HTMLButtonElement;
    layout: HTMLSelectElement;
  };
  const cards = new Map<HTMLElement, Card>();

  function manage(action: () => void) {
    const focused = document.activeElement as HTMLElement | null;
    action();
    // A management action should not bury its own controls behind the target.
    // Explicit Show and Minimize others actions instead take the user there.
    host.activate(manager);
    if (focused?.isConnected) focused.focus({ preventScroll: true });
    refresh();
  }

  function createCard(win: HTMLElement): Card {
    const el = document.createElement("article");
    el.className = "window-overview-card";
    el.dataset.overviewWindow = win.dataset.window;
    el.innerHTML = `<div class="window-overview-card-heading"><div><h3></h3><p></p></div><button type="button" data-overview-show>Show</button></div><div class="window-overview-actions"><button type="button" data-overview-minimize>Minimize</button><button type="button" data-overview-pin aria-pressed="false">Keep above</button><button type="button" data-overview-only>Minimize others</button><button type="button" data-overview-close>Close</button></div><label class="window-overview-layout">Window layout<select data-overview-layout></select></label>`;
    const get = <T extends HTMLElement>(selector: string) =>
      el.querySelector<T>(selector)!;
    const title = get<HTMLElement>("h3");
    const state = get<HTMLElement>("p");
    const minimize = get<HTMLButtonElement>("[data-overview-minimize]");
    const pin = get<HTMLButtonElement>("[data-overview-pin]");
    const layout = get<HTMLSelectElement>("[data-overview-layout]");
    for (const [value, label] of layouts) layout.add(new Option(label, value));
    get<HTMLButtonElement>("[data-overview-show]").addEventListener(
      "click",
      () => host.activate(win),
      events,
    );
    minimize.addEventListener(
      "click",
      () => manage(() => host.minimize(win)),
      events,
    );
    pin.addEventListener(
      "click",
      () => manage(() => host.pin(win, win.dataset.pinned !== "true")),
      events,
    );
    get<HTMLButtonElement>("[data-overview-close]").addEventListener(
      "click",
      () => {
        manage(() => host.close(win));
        reopen.focus({ preventScroll: true });
      },
      events,
    );
    get<HTMLButtonElement>("[data-overview-only]").addEventListener(
      "click",
      () => {
        // Showing a window can switch desktops. Minimize its neighbors after
        // that switch, so windows on the previous desktop keep their state.
        host.activate(win);
        for (const other of host.windows())
          if (
            other !== win &&
            other.dataset.spaceHidden !== "true" &&
            (!other.hidden || other.dataset.tilingHidden === "true")
          )
            host.minimize(other);
        host.activate(win);
        host.announce(
          `Showing only ${titleOf(win)}. Other windows are minimized, with their work kept open.`,
        );
      },
      events,
    );
    layout.addEventListener(
      "change",
      () => {
        if (mobile()) return;
        manage(() =>
          host.layout(
            win,
            layout.value === "floating"
              ? undefined
              : (layout.value as WindowLayout),
          ),
        );
        status.textContent = `${titleOf(win)}: ${layout.selectedOptions[0].textContent}.`;
      },
      events,
    );
    return { el, title, state, minimize, pin, layout };
  }

  function refresh() {
    const windows = host.windows().filter((win) => win !== manager);
    for (const [win, card] of cards) {
      if (!windows.includes(win)) {
        card.el.remove();
        cards.delete(win);
      }
    }
    for (const win of windows) {
      let card = cards.get(win);
      if (!card) {
        card = createCard(win);
        cards.set(win, card);
        list.append(card.el);
      }
      const title = titleOf(win);
      if (card.title.textContent !== title) card.title.textContent = title;
      const details = [
        stateOf(win),
        win.dataset.pinned === "true" ? "Kept above" : "",
        win.dataset.snap
          ? layouts.find(([value]) => value === win.dataset.snap)?.[1]
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
      if (card.state.textContent !== details) card.state.textContent = details;
      card.minimize.disabled =
        win.hidden && win.dataset.tilingHidden !== "true";
      card.pin.setAttribute(
        "aria-pressed",
        String(win.dataset.pinned === "true"),
      );
      card.layout.value = win.dataset.snap ?? "floating";
      card.layout.disabled = mobile();
      card.layout.title = mobile()
        ? "On a small screen, each active window fills the workspace."
        : "Place this window in the workspace";
      card.layout.setAttribute("aria-label", `${title} window layout`);
      card.el.setAttribute("aria-label", `${title} window`);
    }
    root.querySelector<HTMLElement>("[data-overview-count]")!.textContent =
      `${windows.length} ${windows.length === 1 ? "window" : "windows"}`;
    root.querySelector<HTMLElement>(".window-overview-empty")!.hidden =
      windows.length > 0;
    reopen.disabled = !host.canReopen();
  }

  root
    .querySelector<HTMLButtonElement>("[data-overview-switch]")!
    .addEventListener("click", () => openWindowSwitcher(), events);
  reopen.addEventListener(
    "click",
    () => {
      host.reopen();
      refresh();
    },
    events,
  );
  document.addEventListener("desktop-windows-changed", refresh, events);
  window.addEventListener("resize", refresh, events);
  refresh();
  return () => {
    controller.abort();
    cards.clear();
  };
}
