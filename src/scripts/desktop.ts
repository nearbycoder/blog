import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
import { mountWindowLayout } from "./desktop-window-layout";
import { mountDesktopShell } from "./desktop-shell";
import { mountDesktopIcons } from "./desktop-icons";
import { mountDesktopContextMenu } from "./desktop-context-menu";
import {
  createWorkspaceStore,
  type SavedWindow,
} from "./desktop-workspace-store";
import type { ArcadeActivity } from "./desktop-arcade";

const desktop = document.querySelector<HTMLElement>("[data-desktop]");

if (desktop) {
  const workspace = desktop.querySelector<HTMLElement>("[data-workspace]")!;
  const library = desktop.querySelector<HTMLElement>(
    '[data-window="library"]',
  )!;
  const search = desktop.querySelector<HTMLInputElement>(
    "[data-desktop-search]",
  )!;
  const tasks = desktop.querySelector<HTMLElement>("[data-desktop-tasks]")!;
  const status = desktop.querySelector<HTMLElement>("[data-desktop-status]")!;
  const files = [...desktop.querySelectorAll<HTMLElement>("[data-file]")];
  const windows = new Map<string, HTMLElement>([["library", library]]);
  const cleanups = new Map<string, () => void>();
  const pendingLoads = new Map<HTMLElement, () => void>();
  const windowObservers = new Map<HTMLElement, MutationObserver>();
  const readerLinks = new Map(
    [...desktop.querySelectorAll<HTMLAnchorElement>("[data-desktop-file]")].map(
      (link) => [link.pathname.replace(/\/$/, ""), link],
    ),
  );
  const workspaceStore = createWorkspaceStore(
    desktopApps.map((app) => app.id),
    new Set(readerLinks.keys()),
  );
  let restoring = true;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let saveWarning = false;
  const mobile = matchMedia("(max-width: 760px)");
  let nextId = 0;
  let layer = 1;
  let folder = "all";
  let desktopSnapshot:
    { windows: HTMLElement[]; active?: HTMLElement } | undefined;
  const showDesktopButton = desktop.querySelector<HTMLButtonElement>(
    "[data-show-desktop]",
  )!;
  if (document.documentElement.dataset.theme === "system")
    document.documentElement.dataset.theme = "dark";
  function updatePanel() {
    desktop!.querySelector<HTMLElement>(
      "[data-show-library]",
    )!.dataset.running = String(!library.hidden);
    desktop!.querySelector<HTMLElement>(
      ".desktop-dock [data-open-arcade]",
    )!.dataset.running = String(windows.has("arcade"));
  }

  function announce(message: string) {
    if (!restoring) status.textContent = message;
  }

  function saveWorkspace() {
    clearTimeout(saveTimer);
    if (restoring || desktop!.matches(".is-dragging, .is-resizing")) return;
    const saved: SavedWindow[] = [...windows.values()]
      .filter((win) => win !== library || win.dataset.opened === "true")
      .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
      .map((win) => ({
        id: win.dataset.window!,
        minimized: win.hidden,
        placement: layouts.capture(win),
        ...(win.dataset.source ? { source: win.dataset.source } : {}),
        ...(win.dataset.window === "arcade"
          ? { activity: win.dataset.arcadeActivity as ArcadeActivity }
          : {}),
      }));
    // A reader may navigate to a removed/unlisted page, or two readers can
    // converge on one URL. Keep the topmost valid one without blocking saves.
    const sources = new Set<string>();
    const restorable = saved
      .reverse()
      .filter((win) => {
        if (!win.source) return true;
        if (!readerLinks.has(win.source) || sources.has(win.source))
          return false;
        sources.add(win.source);
        return true;
      })
      .reverse();
    const active = [...windows.values()].find(
      (win) => !win.hidden && win.classList.contains("is-active"),
    );
    const activeId =
      restorable.find((win) => win.id === active?.dataset.window)?.id ?? null;
    if (
      !workspaceStore.save({
        version: 1,
        windows: restorable,
        active: activeId,
      })
    ) {
      if (!saveWarning)
        announce(
          "This browser cannot save the workspace. Window changes last for this visit.",
        );
      saveWarning = true;
    } else saveWarning = false;
  }

  function scheduleSave() {
    if (restoring) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWorkspace, 150);
  }

  function loadWindow(win: HTMLElement) {
    const load = pendingLoads.get(win);
    if (
      !load ||
      win.hidden ||
      (mobile.matches && !win.classList.contains("is-active"))
    )
      return;
    pendingLoads.delete(win);
    load();
  }

  function deferWindowLoad(win: HTMLElement, load: () => void) {
    pendingLoads.set(win, load);
    if (!restoring) loadWindow(win);
  }

  const icons = mountDesktopIcons(desktop, announce);

  function activate(win: HTMLElement, focus = false) {
    desktopSnapshot = undefined;
    showDesktopButton.setAttribute("aria-pressed", "false");
    win.dataset.opened = "true";
    win.hidden = false;
    updatePanel();
    windows.forEach((item) => item.classList.toggle("is-active", item === win));
    win.style.zIndex = String(++layer);
    tasks.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      const selected = button.dataset.task === win.dataset.window;
      button.setAttribute("aria-pressed", String(selected));
      if (selected) {
        const strip = tasks.getBoundingClientRect();
        const tab = button.getBoundingClientRect();
        if (tab.left < strip.left || tab.width > strip.width)
          tasks.scrollLeft = Math.floor(
            tasks.scrollLeft + tab.left - strip.left,
          );
        else if (tab.right > strip.right)
          tasks.scrollLeft = Math.ceil(
            tasks.scrollLeft + tab.right - strip.right,
          );
      }
    });
    if (!restoring) {
      constrain(win);
      loadWindow(win);
      if (focus) win.focus({ preventScroll: true });
      scheduleSave();
    }
  }

  function focusRemaining() {
    const remaining = [...windows.values()]
      .filter((win) => !win.hidden)
      .sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex));
    if (remaining[0]) activate(remaining[0], true);
    else
      desktop!.querySelector<HTMLButtonElement>("[data-show-library]")!.focus();
  }

  const layouts = mountWindowLayout(workspace, {
    isMobile: () => mobile.matches,
    activate,
    constrain,
    announce,
    changed: scheduleSave,
  });

  function constrain(win: HTMLElement) {
    if (
      mobile.matches ||
      win.dataset.snap ||
      win.classList.contains("is-maximized") ||
      win.hidden
    )
      return;
    const bounds = workspace.getBoundingClientRect();
    for (const [property, size] of [
      ["minWidth", bounds.width],
      ["minHeight", bounds.height],
    ] as const) {
      if (parseFloat(win.style[property]) > size - 16)
        win.style[property] = `${Math.max(0, size - 16)}px`;
    }
    const style = getComputedStyle(win);
    const x = Math.max(
      8,
      Math.min(
        parseFloat(style.left),
        bounds.width - parseFloat(style.width) - 8,
      ),
    );
    const y = Math.max(
      8,
      Math.min(
        parseFloat(style.top),
        bounds.height - parseFloat(style.height) - 8,
      ),
    );
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  }

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) constrain(entry.target as HTMLElement);
  });

  function attachWindow(win: HTMLElement) {
    const observer = new MutationObserver(scheduleSave);
    observer.observe(win, {
      attributes: true,
      attributeFilter: [
        "style",
        "hidden",
        "class",
        "data-source",
        "data-arcade-activity",
      ],
    });
    windowObservers.set(win, observer);
    win.addEventListener("pointerdown", () => activate(win));
    win.addEventListener("focusin", () => activate(win));
    win
      .querySelectorAll<HTMLButtonElement>("[data-window-action]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.windowAction;
          const title = win.dataset.title ?? "Library";
          if (action === "maximize") {
            layouts.setLayout(
              win,
              win.classList.contains("is-maximized") ? undefined : "maximized",
            );
            activate(win);
            constrain(win);
          } else {
            layouts.capture(win);
            win.hidden = true;
            win.classList.remove("is-active");
            tasks
              .querySelector(`[data-task="${win.dataset.window}"]`)
              ?.setAttribute("aria-pressed", "false");
            if (action === "close" && win !== library) {
              pendingLoads.delete(win);
              windowObservers.get(win)?.disconnect();
              windowObservers.delete(win);
              cleanups.get(win.dataset.window!)?.();
              cleanups.delete(win.dataset.window!);
              resizeObserver.unobserve(win);
              windows.delete(win.dataset.window!);
              tasks
                .querySelector(`[data-task="${win.dataset.window}"]`)
                ?.remove();
              win.remove();
            }
            if (action === "close" && win === library)
              delete win.dataset.opened;
            announce(
              `${title} ${action === "close" ? "closed" : "minimized"}.`,
            );
            updatePanel();
            focusRemaining();
            scheduleSave();
          }
        });
      });
    layouts.attach(win);
    resizeObserver.observe(win);
  }

  function filterFiles() {
    const terms = search.value
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    let count = 0;
    files.forEach((file) => {
      file.hidden =
        (folder !== "all" && file.dataset.fileFolder !== folder) ||
        !terms.every((term) => file.dataset.fileSearch!.includes(term));
      if (!file.hidden) count++;
    });
    desktop!.querySelector<HTMLElement>("[data-file-count]")!.textContent =
      `${count} ${count === 1 ? "file" : "files"}`;
    desktop!.querySelector<HTMLElement>("[data-desktop-empty]")!.hidden =
      count !== 0;
  }

  function selectFolder(id: string) {
    folder = id;
    const buttons =
      desktop!.querySelectorAll<HTMLButtonElement>("[data-folder]");
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.folder === id));
      if (button.dataset.folder === id) {
        desktop!.querySelector<HTMLElement>(
          "[data-folder-title]",
        )!.textContent = button.querySelector(
          "span:not(.desktop-icon)",
        )!.textContent;
      }
    });
    desktop!.querySelector<HTMLElement>("[data-breadcrumb]")!.textContent =
      desktop!.querySelector<HTMLElement>("[data-folder-title]")!.textContent;
    search.value = "";
    filterFiles();
    desktop!.querySelector(".library-content")!.scrollTop = 0;
    activate(library);
  }

  function addTask(win: HTMLElement, id: string, title: string) {
    const task = document.createElement("button");
    task.type = "button";
    task.dataset.task = id;
    task.textContent = title;
    task.title = title;
    task.setAttribute("aria-label", `Show ${title}`);
    task.addEventListener("click", () => activate(win, true));
    tasks.append(task);
    return task;
  }

  function toggleParty() {
    const enabled = desktop!.dataset.afterHours !== "true";
    desktop!.dataset.afterHours = String(enabled);
    const wallpaper = desktop!.querySelector<HTMLElement>(
      ".desktop-wallpaper-copy strong",
    )!;
    wallpaper.style.whiteSpace = "pre-line";
    wallpaper.textContent = enabled ? "after hours" : "nearby";
    const message = enabled
      ? "Secret unlocked: after-hours wallpaper. Enter party again to return."
      : "Back to the day shift. After-hours wallpaper off.";
    announce(message);
    return message;
  }

  function openApp(id: DesktopAppId) {
    const app = desktopApps.find((item) => item.id === id);
    if (!app) return;
    const existing = windows.get(id);
    if (existing) {
      activate(existing, true);
      return existing;
    }
    const template = document.getElementById(
      "desktop-app-template",
    ) as HTMLTemplateElement;
    const win = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    win.dataset.window = id;
    win.dataset.title = app.title;
    win.setAttribute("aria-label", `${app.title} window`);
    win.querySelector<HTMLElement>("[data-app-title]")!.textContent = app.title;
    win.querySelector<HTMLElement>("[data-app-subtitle]")!.textContent =
      `— ${app.subtitle}`;
    const glyph = desktop!.querySelector(
      `[data-launch-app="${id}"] .desktop-icon`,
    );
    if (glyph)
      win.querySelector("[data-app-icon]")!.append(glyph.cloneNode(true));
    win
      .querySelectorAll<HTMLButtonElement>("[data-window-action]")
      .forEach((button) => {
        const action = button.dataset.windowAction!;
        button.setAttribute(
          "aria-label",
          `${action[0].toUpperCase()}${action.slice(1)} ${app.title}`,
        );
      });
    win.style.left = `${120 + (windows.size % 5) * 28}px`;
    win.style.top = `${30 + (windows.size % 5) * 24}px`;
    const content = win.querySelector<HTMLElement>(".desktop-app-content")!;
    windows.set(id, win);
    addTask(win, id, app.title);
    workspace.append(win);
    attachWindow(win);
    constrain(win);
    activate(win, true);
    let disposed = false;
    let dispose: (() => void) | undefined;
    cleanups.set(id, () => {
      disposed = true;
      dispose?.();
    });
    const load = async () => {
      content.innerHTML =
        '<p class="utility-loading" role="status">Opening app…</p>';
      try {
        const { loadDesktopApp } = await import("./desktop-apps");
        if (disposed) return;
        const mount = await loadDesktopApp(id);
        if (disposed) return;
        content.replaceChildren();
        dispose = mount(content);
        constrain(win);
      } catch {
        if (disposed) return;
        content.replaceChildren();
        const message = document.createElement("p");
        message.className = "utility-loading";
        message.setAttribute("role", "status");
        message.textContent = `${app.title} couldn’t load. Check your connection. `;
        const reload = document.createElement("a");
        reload.href = location.href;
        reload.textContent = "Reload the desktop to try again.";
        message.append(reload);
        content.append(message);
      }
    };
    deferWindowLoad(win, () => void load());
    announce(`${app.title} opened.`);
    return win;
  }
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-open-app]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        openApp(button.dataset.openApp as DesktopAppId),
      );
    });

  function openGhostty() {
    const existing = windows.get("ghostty");
    if (existing) {
      activate(existing, true);
      return existing;
    }
    const template = document.getElementById(
      "desktop-ghostty-template",
    ) as HTMLTemplateElement;
    const win = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    win.dataset.window = "ghostty";
    win.dataset.title = "Ghostty";
    win.style.left = "110px";
    win.style.top = "25px";
    windows.set("ghostty", win);
    addTask(win, "ghostty", "Ghostty");
    workspace.append(win);
    attachWindow(win);
    constrain(win);
    activate(win, true);
    let disposed = false;
    let dispose: (() => void) | undefined;
    cleanups.set("ghostty", () => {
      disposed = true;
      dispose?.();
    });
    deferWindowLoad(
      win,
      () =>
        void import("./desktop-ghostty")
          .then(async ({ mountGhostty }) => {
            if (disposed) return;
            // Closing while WASM is loading must never create a late terminal.
            dispose = await mountGhostty(win);
            if (disposed) dispose();
          })
          .catch(() => {
            if (disposed) return;
            const status = win.querySelector<HTMLElement>("[role=status]")!;
            status.textContent = "Ghostty couldn’t load. ";
            const reload = document.createElement("a");
            reload.href = location.href;
            reload.textContent = "Reload the desktop to try again.";
            status.append(reload);
          }),
    );
    announce("Ghostty opened.");
    return win;
  }
  desktop
    .querySelectorAll("[data-open-ghostty]")
    .forEach((button) => button.addEventListener("click", openGhostty));

  function openArcade(activity?: ArcadeActivity) {
    const existing = windows.get("arcade");
    if (existing) {
      activate(existing, true);
      if (activity) existing.dataset.arcadeActivity = activity;
      if (activity)
        existing
          .querySelector<HTMLButtonElement>(
            `[data-arcade-select="${activity}"]`,
          )!
          .click();
      return existing;
    }
    const template = document.getElementById(
      "desktop-arcade-template",
    ) as HTMLTemplateElement;
    const win = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    win.dataset.window = "arcade";
    win.dataset.title = "Arcade";
    win.style.left = "230px";
    win.style.top = "20px";
    windows.set("arcade", win);
    addTask(win, "arcade", "Arcade");
    workspace.append(win);
    win.dataset.arcadeActivity = activity ?? "memory";
    const content = win.querySelector<HTMLElement>(".arcade-content")!;
    content.inert = true;
    const loading = document.createElement("p");
    loading.className = "game-status arcade-loading";
    loading.setAttribute("role", "status");
    loading.textContent = "Opening Arcade…";
    content.before(loading);
    let disposed = false;
    let disposeArcade: (() => void) | undefined;
    cleanups.set("arcade", () => {
      disposed = true;
      disposeArcade?.();
    });
    // Only /desktop imports this entry; game code is fetched on demand.
    deferWindowLoad(
      win,
      () =>
        void import("./desktop-arcade")
          .then(({ mountArcade }) => {
            if (disposed) return;
            disposeArcade = mountArcade(win, toggleParty);
            content.inert = false;
            loading.remove();
            win
              .querySelector<HTMLButtonElement>(
                `[data-arcade-select="${win.dataset.arcadeActivity}"]`,
              )!
              .click();
          })
          .catch(() => {
            if (disposed) return;
            loading.textContent = "Arcade couldn’t load. ";
            const reload = document.createElement("a");
            reload.href = location.href;
            reload.textContent = "Reload the desktop to try again.";
            loading.append(reload);
          }),
    );
    attachWindow(win);
    win.addEventListener("desktop-game-focus", () => {
      shell.closePopups();
      activate(win);
    });
    win.addEventListener("desktop-game-shortcut", (event) => {
      if ((event as CustomEvent).detail === "launcher") shell.toggleLauncher();
      else if ((event as CustomEvent).detail === "commands")
        void toggleCommands();
    });
    constrain(win);
    activate(win, true);
    if (activity)
      win
        .querySelector<HTMLButtonElement>(`[data-arcade-select="${activity}"]`)!
        .click();
    announce("Arcade opened. Choose a game or explore Terminal.");
    return win;
  }

  // Ignore typing, games, held keys, and shortcuts: ordinary browsing stays ordinary.
  const cheatCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let cheatIndex = 0,
    lastCheatKey = 0;
  document.addEventListener("keydown", (event) => {
    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target as Element).closest(
        "input, textarea, select, [contenteditable], [data-arcade]",
      )
    ) {
      cheatIndex = 0;
      return;
    }
    if (Date.now() - lastCheatKey > 5000) cheatIndex = 0;
    lastCheatKey = Date.now();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    cheatIndex =
      key === cheatCode[cheatIndex]
        ? cheatIndex + 1
        : key === cheatCode[0]
          ? 1
          : 0;
    if (cheatIndex === cheatCode.length) {
      cheatIndex = 0;
      toggleParty();
    }
  });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-open-arcade]")
    .forEach((button) => {
      button.addEventListener("click", () => openArcade());
    });

  function openFile(link: HTMLAnchorElement) {
    const existing = [...windows.values()].find(
      (win) => win.dataset.source === link.pathname.replace(/\/$/, ""),
    );
    if (existing) {
      activate(existing, true);
      return existing;
    }
    const template = document.getElementById(
      "desktop-reader-template",
    ) as HTMLTemplateElement;
    const win = template.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    const id = `reader-${++nextId}`;
    const title = link.dataset.fileTitle!;
    win.dataset.window = id;
    win.dataset.source = link.pathname.replace(/\/$/, "");
    win.dataset.title = title;
    win.setAttribute("aria-label", `${title} window`);
    win.querySelector<HTMLElement>("[data-reader-title]")!.textContent = title;
    win.querySelector<HTMLElement>("[data-reader-location]")!.textContent =
      link.pathname;
    win.querySelector<HTMLAnchorElement>("[data-reader-original]")!.href =
      link.href;
    const iframe = win.querySelector<HTMLIFrameElement>("iframe")!;
    iframe.title = title;
    win
      .querySelectorAll<HTMLButtonElement>("[data-window-action]")
      .forEach((button) => {
        const action = button.dataset.windowAction!;
        button.setAttribute(
          "aria-label",
          `${action[0].toUpperCase()}${action.slice(1)} ${title}`,
        );
      });
    const task = addTask(win, id, title);
    windows.set(id, win);
    win.style.left = `${160 + ((nextId - 1) % 5) * 28}px`;
    win.style.top = `${28 + ((nextId - 1) % 5) * 28}px`;
    const connectedDocuments = new WeakSet<Document>();
    const connectReader = () => {
      if (!iframe.getAttribute("src")) return;
      win.querySelector<HTMLElement>("[data-reader-loading]")!.hidden = true;
      try {
        const doc = iframe.contentDocument;
        if (!doc || connectedDocuments.has(doc)) return;
        if (iframe.contentWindow!.location.origin !== location.origin) return;
        connectedDocuments.add(doc);
        doc.documentElement.dataset.theme =
          document.documentElement.dataset.theme;
        // Existing pages remain complete, interactive documents with their own scripts.
        doc.addEventListener(
          "pointerdown",
          () => {
            shell.closePopups();
            activate(win);
          },
          {
            capture: true,
          },
        );
        doc.addEventListener("focusin", () => activate(win));
        doc.addEventListener("keydown", onShortcut, { capture: true });
        const url = iframe.contentWindow!.location;
        win.dataset.source = url.pathname.replace(/\/$/, "");
        const currentTitle = doc.title.replace(/ · Josh Hamilton$/, "");
        win.dataset.title = currentTitle;
        win.setAttribute("aria-label", `${currentTitle} window`);
        win.querySelector<HTMLElement>("[data-reader-title]")!.textContent =
          currentTitle;
        iframe.title = currentTitle;
        task.textContent = currentTitle;
        task.title = currentTitle;
        task.setAttribute("aria-label", `Show ${currentTitle}`);
        win
          .querySelectorAll<HTMLButtonElement>("[data-window-action]")
          .forEach((button) => {
            const action =
              button.dataset.windowAction === "maximize" &&
              win.classList.contains("is-maximized")
                ? "restore"
                : button.dataset.windowAction!;
            button.setAttribute(
              "aria-label",
              `${action[0].toUpperCase()}${action.slice(1)} ${currentTitle}`,
            );
          });
        win.querySelector<HTMLElement>("[data-reader-location]")!.textContent =
          url.pathname;
        win.querySelector<HTMLAnchorElement>("[data-reader-original]")!.href =
          url.href;
        // Keep external destinations out of the embedded reader; prevent nested desktops.
        doc.addEventListener(
          "click",
          (event) => {
            const anchor = (event.target as Element).closest<HTMLAnchorElement>(
              "a[href]",
            );
            if (!anchor) return;
            const destination = new URL(anchor.href);
            if (
              destination.origin !== location.origin ||
              /\.(pdf|xml|json)$/.test(destination.pathname)
            ) {
              anchor.target = "_blank";
              anchor.rel = "noopener noreferrer";
            } else if (destination.pathname.replace(/\/$/, "") === "/desktop") {
              event.preventDefault();
              activate(library, true);
            }
          },
          { capture: true },
        );
      } catch {
        /* The original-page link stays available if a frame navigates away. */
      }
    };
    iframe.addEventListener("desktop-reader-ready", connectReader);
    iframe.addEventListener("load", connectReader);
    workspace.append(win);
    attachWindow(win);
    constrain(win);
    activate(win, true);
    deferWindowLoad(win, () => {
      iframe.src = link.href;
    });
    announce(`Opened ${title}.`);
    return win;
  }

  function onShortcut(event: KeyboardEvent) {
    if (event.isComposing || event.keyCode === 229) return;
    if (
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === "k"
    ) {
      // Ctrl+K is a shell editing command; Command+K remains available on Macs.
      if (
        !event.metaKey &&
        (event.target as Element | null)?.closest?.(".ghostty-surface")
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) void toggleCommands();
      return;
    }
    if (commandsPending && event.key === "Escape" && !event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelCommandRequest();
      return;
    }
    if (event.ctrlKey && event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelCommandRequest(false);
      commandPalette?.close(false);
      shell.toggleLauncher();
      return;
    }
    if (commandPalette?.isOpen()) return;
    // Connected shells own their editing shortcuts, including Ctrl+K.
    if ((event.target as Element | null)?.closest?.(".ghostty-surface")) return;
    if (
      layouts.shortcut(
        event,
        workspace.querySelector<HTMLElement>(
          ".desktop-window.is-active:not([hidden])",
        ) ?? undefined,
      )
    )
      return;
  }

  attachWindow(library);
  library.hidden = true;
  library.classList.remove("is-active");
  const shell = mountDesktopShell(desktop, {
    app: openApp,
    library: () => activate(library, true),
    folder: (id) => {
      selectFolder(id);
      library.focus();
    },
    arcade: () => openArcade(),
    terminal: () => openArcade("terminal"),
    ghostty: openGhostty,
    doom: () => openArcade("doom"),
    game: (activity) => openArcade(activity),
    file: openFile,
  });
  type CommandPalette = ReturnType<
    typeof import("./desktop-commands").mountCommandPalette
  >;
  let commandPalette: CommandPalette | undefined;
  let commandLoading: Promise<CommandPalette> | undefined;
  let commandsPending = false;
  let commandRequest = 0;
  let commandInvoker: HTMLElement | undefined;
  function cancelCommandRequest(restoreFocus = true) {
    if (commandsPending && restoreFocus)
      commandInvoker?.focus({ preventScroll: true });
    commandsPending = false;
    commandInvoker = undefined;
    commandRequest++;
  }
  async function toggleCommands() {
    if (commandPalette?.isOpen() || commandsPending) {
      cancelCommandRequest();
      commandPalette?.close();
      return;
    }
    const focused = document.activeElement;
    const invoker =
      focused instanceof HTMLElement && focused.closest("#desktop-launcher")
        ? (desktop!.querySelector<HTMLElement>("[data-launcher-toggle]") ??
          undefined)
        : focused instanceof HTMLElement
          ? focused
          : undefined;
    layouts.cancel();
    shell.closePopups();
    commandInvoker = invoker;
    commandsPending = true;
    const request = ++commandRequest;
    try {
      commandLoading ??= import("./desktop-commands").then(
        ({ mountCommandPalette, createDesktopCommands }) => {
          commandPalette = mountCommandPalette(desktop!, () =>
            createDesktopCommands({
              desktop: desktop!,
              windows: [...windows.values()],
              readers: [...readerLinks.values()],
              mobile: mobile.matches,
              showingDesktop: Boolean(desktopSnapshot),
              app: openApp,
              arcade: openArcade,
              ghostty: openGhostty,
              file: openFile,
              activate,
              layout: (win, layout) => {
                layouts.setLayout(win, layout);
                activate(win, true);
                announce(
                  `${win.dataset.title ?? "Library"} ${layout ? layout.replaceAll("-", " ") : "restored"}.`,
                );
              },
            }),
          );
          return commandPalette;
        },
      );
      const palette = await commandLoading;
      if (commandsPending && request === commandRequest) {
        commandsPending = false;
        commandInvoker = undefined;
        palette.open(invoker);
      }
    } catch {
      commandLoading = undefined;
      if (request === commandRequest) {
        cancelCommandRequest();
        announce(
          "Desktop commands couldn’t load. Check your connection and reload the desktop to try again.",
        );
      }
    }
  }
  const commandsButton = desktop.querySelector<HTMLButtonElement>(
    "[data-command-palette-toggle]",
  )!;
  commandsButton.addEventListener("click", () => void toggleCommands());
  commandsButton.querySelector("kbd")!.textContent = /Mac|iPhone|iPad/.test(
    navigator.platform,
  )
    ? "⌘ K"
    : "Ctrl K";
  desktop
    .querySelector<HTMLButtonElement>("[data-reset-desktop-icons]")!
    .addEventListener("click", () => {
      icons.reset();
      shell.closePopups();
    });
  mountDesktopContextMenu(desktop, {
    openLibrary: () => activate(library, true),
    openNotes: () => openApp("notes"),
    openGhostty,
    arrangeWindows: () =>
      desktop.querySelector<HTMLButtonElement>("[data-desktop-reset]")!.click(),
    resetIcons: (id) => icons.reset(id),
    toggleTheme: () =>
      desktop.querySelector<HTMLButtonElement>("[data-desktop-theme]")!.click(),
  });
  showDesktopButton.addEventListener("click", () => {
    if (desktopSnapshot) {
      const saved = desktopSnapshot;
      desktopSnapshot = undefined;
      saved.windows.forEach((win) => {
        win.hidden = false;
      });
      if (saved.active) activate(saved.active, true);
      showDesktopButton.setAttribute("aria-pressed", "false");
      announce("Windows restored.");
    } else {
      const visible = [...windows.values()].filter((win) => !win.hidden);
      if (!visible.length) return;
      desktopSnapshot = {
        windows: visible,
        active: visible.find((win) => win.classList.contains("is-active")),
      };
      visible.forEach((win) => {
        layouts.capture(win);
        win.hidden = true;
        win.classList.remove("is-active");
      });
      tasks
        .querySelectorAll("button")
        .forEach((button) => button.setAttribute("aria-pressed", "false"));
      showDesktopButton.setAttribute("aria-pressed", "true");
      announce("Desktop shown. Press Show desktop again to restore windows.");
    }
    updatePanel();
    scheduleSave();
  });
  search.addEventListener("input", filterFiles);
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-folder]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        selectFolder(button.dataset.folder!),
      );
    });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-open-folder]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectFolder(button.dataset.openFolder!);
        library.focus();
      });
    });
  desktop
    .querySelector<HTMLButtonElement>("[data-clear-search]")!
    .addEventListener("click", () => {
      search.value = "";
      filterFiles();
      search.focus();
    });
  desktop
    .querySelector<HTMLButtonElement>("[data-show-library]")!
    .addEventListener("click", () => activate(library, true));
  desktop
    .querySelectorAll<HTMLAnchorElement>("[data-desktop-file]")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        openFile(link);
      });
    });
  desktop
    .querySelector<HTMLButtonElement>("[data-desktop-reset]")!
    .addEventListener("click", () => {
      windows.forEach((win, id) => {
        layouts.setLayout(win, undefined);
        win.removeAttribute("style");
        const maximize = win.querySelector<HTMLButtonElement>(
          '[data-window-action="maximize"]',
        )!;
        maximize.setAttribute("aria-pressed", "false");
        maximize.setAttribute(
          "aria-label",
          `Maximize ${win.dataset.title ?? "Library"}`,
        );
        if (id !== "library") {
          win.style.left = `${160 + ([...windows.keys()].indexOf(id) % 5) * 28}px`;
          win.style.top = `${28 + ([...windows.keys()].indexOf(id) % 5) * 28}px`;
        }
        constrain(win);
      });
      activate(library, true);
      announce("Windows arranged. Library is open.");
    });
  desktop
    .querySelector<HTMLButtonElement>("[data-desktop-theme]")!
    .addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      const dark =
        current === "dark" ||
        (current === "system" &&
          matchMedia("(prefers-color-scheme: dark)").matches);
      const theme = dark ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem("theme-preference", theme);
      } catch {
        /* Theme still works for this visit. */
      }
      windows.forEach((win) => {
        const doc = win.querySelector("iframe")?.contentDocument;
        if (doc) doc.documentElement.dataset.theme = theme;
      });
      announce(`${theme === "dark" ? "Dark" : "Light"} theme enabled.`);
    });
  document.addEventListener("keydown", onShortcut, { capture: true });
  window.addEventListener("resize", () => {
    windows.forEach((win) => {
      constrain(win);
      loadWindow(win);
    });
    scheduleSave();
  });

  // Restore all window shells and placement in one task, before the browser paints.
  // App code remains deferred until a restored window is visible.
  const restored = new Map<string, HTMLElement>();
  for (const saved of workspaceStore.state?.windows ?? []) {
    let win: HTMLElement | undefined;
    if (saved.id === "library") {
      win = library;
      activate(win);
    } else if (saved.id === "arcade") win = openArcade(saved.activity);
    else if (saved.id === "ghostty") win = openGhostty();
    else if (saved.source) {
      const link = readerLinks.get(saved.source);
      if (link) win = openFile(link);
    } else win = openApp(saved.id as DesktopAppId);
    if (!win) continue;
    win.dataset.restored = "true";
    layouts.restore(win, saved.placement);
    constrain(win);
    win.hidden = saved.minimized;
    win.classList.remove("is-active");
    tasks
      .querySelector(`[data-task="${win.dataset.window}"]`)
      ?.setAttribute("aria-pressed", "false");
    restored.set(saved.id, win);
  }
  const savedActive = workspaceStore.state?.active;
  const active =
    (savedActive ? restored.get(savedActive) : undefined) ??
    [...restored.values()].reverse().find((win) => !win.hidden);
  if (active && !active.hidden) activate(active);
  updatePanel();
  // Ignore initialization mutations; a failed or unreadable save is never replaced on boot.
  windowObservers.forEach((observer) => observer.takeRecords());
  restoring = false;
  desktop.dataset.workspaceReady = "true";
  windows.forEach(loadWindow);

  function flushWorkspace() {
    layouts.cancel();
    saveWorkspace();
  }
  window.addEventListener("pagehide", flushWorkspace);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) flushWorkspace();
  });
}
