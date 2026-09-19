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
  const mobile = matchMedia("(max-width: 760px)");
  let nextId = 0;
  let layer = 1;
  let folder = "all";

  function announce(message: string) {
    status.textContent = message;
  }

  function activate(win: HTMLElement, focus = false) {
    win.hidden = false;
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

  function constrain(win: HTMLElement) {
    if (mobile.matches || win.classList.contains("is-maximized") || win.hidden)
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
            const maximized = win.classList.toggle("is-maximized");
            button.setAttribute("aria-pressed", String(maximized));
            button.setAttribute(
              "aria-label",
              `${maximized ? "Restore" : "Maximize"} ${title}`,
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
            focusRemaining();
          }
        });
      });
    const handle = win.querySelector<HTMLElement>("[data-drag-handle]")!;
    let drag:
      | { pointer: number; x: number; y: number; left: number; top: number }
      | undefined;
    handle.addEventListener("pointerdown", (event) => {
      if (
        mobile.matches ||
        win.classList.contains("is-maximized") ||
        event.button !== 0 ||
        (event.target as HTMLElement).closest("button, a")
      )
        return;
      const rect = win.getBoundingClientRect();
      const bounds = workspace.getBoundingClientRect();
      drag = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: rect.left - bounds.left,
        top: rect.top - bounds.top,
      };
      handle.setPointerCapture(event.pointerId);
      desktop!.classList.add("is-dragging");
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointer !== event.pointerId) return;
      win.style.left = `${Math.max(8, Math.min(workspace.clientWidth - win.offsetWidth - 8, drag.left + event.clientX - drag.x))}px`;
      win.style.top = `${Math.max(8, Math.min(workspace.clientHeight - win.offsetHeight - 8, drag.top + event.clientY - drag.y))}px`;
    });
    const endDrag = () => {
      drag = undefined;
      desktop!.classList.remove("is-dragging");
    };
    handle.addEventListener("lostpointercapture", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("dblclick", (event) => {
      if (!(event.target as HTMLElement).closest("button, a")) {
        win
          .querySelector<HTMLButtonElement>('[data-window-action="maximize"]')!
          .click();
      }
    });
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
    search.value = "";
    filterFiles();
    desktop!.querySelector(".library-content")!.scrollTop = 0;
    activate(library);
  }

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
    const task = document.createElement("button");
    task.type = "button";
    task.dataset.task = id;
    task.textContent = title;
    task.title = title;
    task.setAttribute("aria-label", `Show ${title}`);
    task.addEventListener("click", () => activate(win, true));
    tasks.append(task);
    windows.set(id, win);
    win.style.left = `${160 + ((nextId - 1) % 5) * 28}px`;
    win.style.top = `${28 + ((nextId - 1) % 5) * 28}px`;
    iframe.addEventListener("load", () => {
      win.querySelector<HTMLElement>("[data-reader-loading]")!.hidden = true;
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.documentElement.dataset.theme =
          document.documentElement.dataset.theme;
        // Existing pages remain complete, interactive documents with their own scripts.
        doc.addEventListener("pointerdown", () => activate(win), {
          capture: true,
        });
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
    });
    workspace.append(win);
    attachWindow(win);
    constrain(win);
    activate(win, true);
    announce(`Opened ${title}.`);
  }

  function onShortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopImmediatePropagation();
      activate(library);
      search.focus();
      search.select();
    }
  }

  attachWindow(library);
  activate(library);
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
        win.classList.remove("is-maximized");
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
