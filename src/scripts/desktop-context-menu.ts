type ContextMenuActions = {
  openLibrary: () => void;
  openNotes: () => void;
  openGhostty: () => void;
  arrangeWindows: () => void;
  resetIcons: (id?: string) => void;
  toggleTheme: () => void;
};

type MenuItem = {
  label: string;
  action: () => void;
  shortcut?: string;
  disabled?: boolean;
  separated?: boolean;
};

export function mountDesktopContextMenu(
  desktop: HTMLElement,
  actions: ContextMenuActions,
): () => void {
  const workspace = desktop.querySelector<HTMLElement>("[data-workspace]")!;
  const previousTabIndex = workspace.getAttribute("tabindex");
  if (previousTabIndex === null) workspace.tabIndex = -1;
  const menu = document.createElement("div");
  menu.className = "desktop-context-menu";
  menu.dataset.desktopContextMenu = "";
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  desktop.append(menu);
  let invoker: HTMLElement | undefined;

  function close(restoreFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    if (restoreFocus && invoker?.isConnected)
      invoker.focus({ preventScroll: true });
    invoker = undefined;
  }

  function backgroundItems(): MenuItem[] {
    return [
      { label: "Open Library", action: actions.openLibrary },
      { label: "Open Notes", action: actions.openNotes },
      { label: "Open Ghostty", action: actions.openGhostty },
      {
        label: "Arrange windows",
        action: actions.arrangeWindows,
        separated: true,
      },
      { label: "Reset icon positions", action: () => actions.resetIcons() },
      {
        label: "Toggle color theme",
        action: actions.toggleTheme,
        separated: true,
      },
    ];
  }

  function contextFor(target: Element, keyboard = false) {
    // Reading, editing, and embedded apps retain the browser's own context menu.
    if (
      target.closest(
        'input, textarea, select, a, [contenteditable]:not([contenteditable="false"])',
      ) ||
      window.getSelection()?.isCollapsed === false
    )
      return;
    const icon = target.closest<HTMLButtonElement>("[data-desktop-icon]");
    if (icon && workspace.contains(icon)) {
      const label =
        icon.textContent?.replace(/\s+/g, " ").trim() || "application";
      return {
        invoker: icon,
        label: `${label} actions`,
        items: [
          { label: `Open ${label}`, action: () => icon.click() },
          {
            label: "Reset icon position",
            action: () => actions.resetIcons(icon.dataset.desktopIcon),
          },
        ],
      };
    }
    const win = target.closest<HTMLElement>(".desktop-window");
    if (win) {
      if (
        !target.closest("[data-drag-handle]") &&
        !(keyboard && target === win)
      )
        return;
      const title = win.dataset.title ?? "Library";
      const maximized = win.classList.contains("is-maximized");
      return {
        invoker: win,
        label: `${title} window actions`,
        items: [
          ["minimize", "Minimize", ""],
          ["maximize", maximized ? "Restore" : "Maximize", "Ctrl Alt ↑"],
          ["close", "Close", ""],
        ].map(([action, label, shortcut]): MenuItem => {
          const control = win.querySelector<HTMLButtonElement>(
            `[data-window-action="${action}"]`,
          );
          return {
            label,
            shortcut:
              action === "maximize" && maximized ? "Ctrl Alt ↓" : shortcut,
            action: () => control?.click(),
            disabled:
              !control ||
              control.disabled ||
              control.getClientRects().length === 0,
            separated: action === "close",
          };
        }),
      };
    }
    if (workspace.contains(target))
      return {
        invoker: workspace,
        label: "Desktop actions",
        items: backgroundItems(),
      };
  }

  function open(
    context: NonNullable<ReturnType<typeof contextFor>>,
    x: number,
    y: number,
  ) {
    close();
    invoker = context.invoker;
    // Focusing a window uses the existing activation path before its menu opens.
    invoker.focus({ preventScroll: true });
    menu.setAttribute("aria-label", context.label);
    menu.replaceChildren();
    for (const item of context.items) {
      if (item.separated) {
        const divider = document.createElement("div");
        divider.className = "desktop-context-divider";
        divider.setAttribute("role", "separator");
        menu.append(divider);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      button.tabIndex = -1;
      button.disabled = item.disabled ?? false;
      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(label);
      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "desktop-context-shortcut";
        shortcut.setAttribute("aria-hidden", "true");
        shortcut.textContent = item.shortcut;
        button.append(shortcut);
      }
      button.addEventListener("click", () => {
        close(true);
        item.action();
      });
      menu.append(button);
    }
    menu.hidden = false;
    const bounds = desktop.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(bounds.left, 0) + margin;
    const top = Math.max(bounds.top, 0) + margin;
    const right = Math.min(bounds.right, innerWidth) - margin;
    const bottom = Math.min(bounds.bottom, innerHeight) - margin;
    menu.style.maxWidth = `${Math.max(0, right - left)}px`;
    menu.style.maxHeight = `${Math.max(0, bottom - top)}px`;
    menu.style.left = `${Math.max(left, Math.min(x, right - menu.offsetWidth)) - bounds.left}px`;
    menu.style.top = `${Math.max(top, Math.min(y, bottom - menu.offsetHeight)) - bounds.top}px`;
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }

  function onContextMenu(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    if (menu.contains(event.target)) {
      event.preventDefault();
      return;
    }
    const context = contextFor(event.target);
    if (!context) {
      close();
      return;
    }
    event.preventDefault();
    open(context, event.clientX, event.clientY);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!menu.hidden) {
      // Let the shell's launch/search shortcuts take focus after dismissing us.
      if (
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") ||
        (event.ctrlKey && event.key === "Escape")
      ) {
        close();
        return;
      }
      const items = [
        ...menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
      ];
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      const last = items.length - 1;
      const next = {
        ArrowDown: (index + 1) % items.length,
        ArrowUp: (index - 1 + items.length) % items.length,
        Home: 0,
        End: last,
      }[event.key];
      if (next !== undefined) {
        event.preventDefault();
        event.stopImmediatePropagation();
        items[next]?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close(true);
      } else if (event.key === "Tab") close(true);
      return;
    }
    if (
      (event.key !== "ContextMenu" &&
        !(event.shiftKey && event.key === "F10")) ||
      !(event.target instanceof Element) ||
      !desktop.contains(event.target)
    )
      return;
    const context = contextFor(event.target, true);
    if (!context) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect = context.invoker.getBoundingClientRect();
    open(context, rect.left + 16, rect.top + Math.min(rect.height, 40));
  }

  function onPointerDown(event: PointerEvent) {
    if (event.target instanceof Node && !menu.contains(event.target)) close();
  }
  const onResize = () => close(true);
  const onBlur = () => close();
  desktop.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown, { capture: true });
  document.addEventListener("pointerdown", onPointerDown, { capture: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("blur", onBlur);
  return () => {
    close();
    menu.remove();
    if (previousTabIndex === null) workspace.removeAttribute("tabindex");
    desktop.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("keydown", onKeyDown, { capture: true });
    document.removeEventListener("pointerdown", onPointerDown, {
      capture: true,
    });
    window.removeEventListener("resize", onResize);
    window.removeEventListener("blur", onBlur);
  };
}
