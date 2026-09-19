import { mountWindowLayout } from "./desktop-window-layout";
import { mountDesktopShell } from "./desktop-shell";
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
    status.textContent = message;
  }

  function activate(win: HTMLElement, focus = false) {
    desktopSnapshot = undefined;
    showDesktopButton.setAttribute("aria-pressed", "false");
    win.dataset.opened = "true";
    win.hidden = false;
    updatePanel();
    windows.forEach((item) => item.classList.toggle("is-active", item === win));
    win.style.zIndex = String(++layer);
    tasks.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.task === win.dataset.window),
      );
    });
    if (focus) win.focus({ preventScroll: true });
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
    const rect = win.getBoundingClientRect();
    const x = Math.max(
      8,
      Math.min(rect.left - bounds.left, bounds.width - rect.width - 8),
    );
    const y = Math.max(
      8,
      Math.min(rect.top - bounds.top, bounds.height - rect.height - 8),
    );
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  }

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) constrain(entry.target as HTMLElement);
  });

  function attachWindow(win: HTMLElement) {
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
            win.hidden = true;
            win.classList.remove("is-active");
            tasks
              .querySelector(`[data-task="${win.dataset.window}"]`)
              ?.setAttribute("aria-pressed", "false");
            if (action === "close" && win !== library) {
              cleanups.get(win.dataset.window!)?.();
              cleanups.delete(win.dataset.window!);
              resizeObserver.unobserve(win);
              windows.delete(win.dataset.window!);
              tasks
                .querySelector(`[data-task="${win.dataset.window}"]`)
                ?.remove();
              win.remove();
            }
            announce(
              `${title} ${action === "close" ? "closed" : "minimized"}.`,
            );
            updatePanel();
            focusRemaining();
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

  function openGhostty() {
    const existing = windows.get("ghostty");
    if (existing) {
      activate(existing, true);
      return;
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
    import("./desktop-ghostty")
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
      });
    announce("Ghostty opened.");
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
      return;
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
    import("./desktop-arcade")
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
      });
    attachWindow(win);
    win.addEventListener("desktop-game-focus", () => {
      shell.closePopups();
      activate(win);
    });
    win.addEventListener("desktop-game-shortcut", (event) => {
      if ((event as CustomEvent).detail === "launcher") shell.toggleLauncher();
      else {
        shell.closePopups();
        activate(library);
        search.focus();
      }
    });
    constrain(win);
    activate(win, true);
    if (activity)
      win
        .querySelector<HTMLButtonElement>(`[data-arcade-select="${activity}"]`)!
        .click();
    announce("Arcade opened. Choose a game or explore Terminal.");
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
      return;
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
    iframe.src = link.href;
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
      win.querySelector<HTMLElement>("[data-reader-loading]")!.hidden = true;
      try {
        const doc = iframe.contentDocument;
        if (!doc || connectedDocuments.has(doc)) return;
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
    announce(`Opened ${title}.`);
  }

  function onShortcut(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      shell.toggleLauncher();
      return;
    }
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
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopImmediatePropagation();
      shell.closePopups();
      activate(library);
      search.focus();
      search.select();
    }
  }

  attachWindow(library);
  library.hidden = true;
  library.classList.remove("is-active");
  const shell = mountDesktopShell(desktop, {
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
  window.addEventListener("resize", () => windows.forEach(constrain));
}
