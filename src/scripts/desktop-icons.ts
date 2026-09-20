type Cell = { column: number; row: number };
type Profile = "wide" | "compact";
type Layout = Record<string, Cell>;
type SavedLayout = { version: 1; layouts: Record<Profile, Layout> };

const STORAGE_KEY = "desktop-icons:v1";
const sameCell = (a: Cell, b: Cell) => a.column === b.column && a.row === b.row;

export function mountDesktopIcons(
  desktop: HTMLElement,
  announce: (message: string) => void,
) {
  const workspace = desktop.querySelector<HTMLElement>("[data-workspace]")!;
  const shortcuts = desktop.querySelector<HTMLElement>(".desktop-shortcuts")!;
  const buttons = [
    ...shortcuts.querySelectorAll<HTMLButtonElement>("[data-desktop-icon]"),
  ];
  const ids = buttons.map((button) => button.dataset.desktopIcon!);
  const compact = matchMedia("(max-width: 760px)");
  let saved: SavedLayout = { version: 1, layouts: { wide: {}, compact: {} } };
  let positions: Layout = {};
  let profile: Profile = compact.matches ? "compact" : "wide";
  let geometry = measure();
  let suppressedClick: string | undefined;
  let drag:
    | {
        button: HTMLButtonElement;
        id: string;
        pointerId: number;
        startX: number;
        startY: number;
        startScroll: number;
        cell: Cell;
        target: Cell;
        moved: boolean;
      }
    | undefined;

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (value?.version === 1) {
      for (const key of ["wide", "compact"] as const) {
        for (const id of ids) {
          const cell = value.layouts?.[key]?.[id];
          if (
            cell &&
            [cell.column, cell.row].every(
              (n) => Number.isSafeInteger(n) && n >= 0 && n <= 1000,
            )
          )
            saved.layouts[key][id] = { column: cell.column, row: cell.row };
        }
      }
    }
  } catch {
    // Corrupt or unavailable storage must not prevent using the desktop.
  }

  const preview = document.createElement("div");
  preview.className = "desktop-icon-drop-preview";
  preview.setAttribute("aria-hidden", "true");
  preview.hidden = true;
  shortcuts.append(preview);
  const hint = document.createElement("span");
  hint.id = "desktop-icon-move-hint";
  hint.className = "sr-only";
  hint.textContent =
    "Drag to move. Use Alt and arrow keys to move with the keyboard.";
  shortcuts.append(hint);
  shortcuts.dataset.movable = "true";

  function measure() {
    const style = getComputedStyle(shortcuts);
    const number = (name: string) => parseFloat(style.getPropertyValue(name));
    const width = number("--desktop-icon-width");
    const height = number("--desktop-icon-height");
    const x = number("--desktop-icon-inset-x");
    const y = number("--desktop-icon-inset-y");
    const stepX = number("--desktop-icon-step-x");
    const stepY = number("--desktop-icon-step-y");
    const bounds = workspace.getBoundingClientRect();
    const columns = Math.max(
      1,
      Math.floor((bounds.width - x * 2 - width) / stepX) + 1,
    );
    const rows = Math.max(
      1,
      Math.floor((bounds.height - y - 20 - height) / stepY) + 1,
    );
    return {
      width,
      height,
      x,
      y,
      stepX,
      stepY,
      columns: Math.max(columns, Math.ceil(ids.length / rows)),
      rows,
      overflow: columns * rows < ids.length,
    };
  }

  function clamp(cell: Cell): Cell {
    return {
      column: Math.max(0, Math.min(geometry.columns - 1, cell.column)),
      row: Math.max(0, Math.min(geometry.rows - 1, cell.row)),
    };
  }

  function defaultCell(id: string): Cell {
    const index = ids.indexOf(id);
    return {
      column: Math.floor(index / geometry.rows),
      row: index % geometry.rows,
    };
  }

  function place(element: HTMLElement, cell: Cell) {
    element.style.left = `${geometry.x + cell.column * geometry.stepX}px`;
    element.style.top = `${geometry.y + cell.row * geometry.stepY}px`;
  }

  function render() {
    buttons.forEach((button) =>
      place(button, positions[button.dataset.desktopIcon!]),
    );
  }

  function reflow() {
    profile = compact.matches ? "compact" : "wide";
    geometry = measure();
    shortcuts.toggleAttribute("data-overflow", geometry.overflow);
    if (!geometry.overflow) shortcuts.scrollLeft = 0;
    const available: Cell[] = [];
    for (let column = 0; column < geometry.columns; column++) {
      for (let row = 0; row < geometry.rows; row++)
        available.push({ column, row });
    }
    positions = {};
    // Honor saved slots first. New shortcuts fill the remaining cells.
    const ordered = [...ids].sort(
      (a, b) =>
        Number(!!saved.layouts[profile][b]) -
        Number(!!saved.layouts[profile][a]),
    );
    for (const id of ordered) {
      const preferred = clamp(saved.layouts[profile][id] ?? defaultCell(id));
      let nearest = 0;
      for (let i = 1; i < available.length; i++) {
        const distance = (cell: Cell) =>
          Math.abs(cell.column - preferred.column) +
          Math.abs(cell.row - preferred.row);
        if (distance(available[i]) < distance(available[nearest])) nearest = i;
      }
      positions[id] = available.splice(nearest, 1)[0] ?? preferred;
    }
    render();
  }

  function persist(message: string) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      announce(message);
    } catch {
      announce(
        `${message} This browser cannot save the layout; changes last for this visit.`,
      );
    }
  }

  function move(id: string, target: Cell) {
    const cell = clamp(target);
    if (sameCell(positions[id], cell)) return;
    const occupied = ids.find(
      (other) => other !== id && sameCell(positions[other], cell),
    );
    if (occupied) positions[occupied] = positions[id];
    positions[id] = cell;
    // A temporary viewport reflow should not erase untouched preferred slots.
    saved.layouts[profile] = {
      ...positions,
      ...saved.layouts[profile],
      [id]: cell,
      ...(occupied ? { [occupied]: positions[occupied] } : {}),
    };
    render();
    const label = buttons[ids.indexOf(id)].textContent!.trim();
    persist(
      `${label} moved to column ${cell.column + 1}, row ${cell.row + 1}.`,
    );
  }

  function finish(cancel: boolean) {
    if (!drag) return;
    const active = drag;
    drag = undefined;
    if (active.moved) {
      suppressedClick = active.id;
      if (!cancel) move(active.id, active.target);
    }
    active.button.classList.remove("is-icon-dragging");
    shortcuts.classList.remove("is-icon-dragging");
    preview.hidden = true;
    if (active.button.hasPointerCapture(active.pointerId))
      active.button.releasePointerCapture(active.pointerId);
    render();
  }

  buttons.forEach((button) => {
    const id = button.dataset.desktopIcon!;
    button.setAttribute("aria-describedby", hint.id);
    button.draggable = false;
    button.addEventListener("dragstart", (event) => event.preventDefault());
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !event.isPrimary || drag) return;
      suppressedClick = undefined;
      drag = {
        button,
        id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScroll: shortcuts.scrollLeft,
        cell: positions[id],
        target: positions[id],
        moved: false,
      };
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx =
        event.clientX - drag.startX + shortcuts.scrollLeft - drag.startScroll;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      button.classList.add("is-icon-dragging");
      shortcuts.classList.add("is-icon-dragging");
      const bounds = workspace.getBoundingClientRect();
      const maxLeft = geometry.overflow
        ? geometry.x + (geometry.columns - 1) * geometry.stepX
        : bounds.width - geometry.width;
      button.style.left = `${Math.max(0, Math.min(maxLeft, geometry.x + drag.cell.column * geometry.stepX + dx))}px`;
      button.style.top = `${Math.max(0, Math.min(bounds.height - geometry.height, geometry.y + drag.cell.row * geometry.stepY + dy))}px`;
      drag.target = clamp({
        column: Math.round(drag.cell.column + dx / geometry.stepX),
        row: Math.round(drag.cell.row + dy / geometry.stepY),
      });
      place(preview, drag.target);
      preview.hidden = false;
    });
    button.addEventListener("pointerup", (event) => {
      if (drag?.pointerId === event.pointerId) finish(false);
    });
    const cancelPointer = (event: PointerEvent) => {
      if (drag?.pointerId === event.pointerId) finish(true);
    };
    button.addEventListener("pointercancel", cancelPointer);
    button.addEventListener("lostpointercapture", cancelPointer);
    button.addEventListener("keydown", (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const directions: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      finish(true);
      move(id, {
        column: positions[id].column + direction[0],
        row: positions[id].row + direction[1],
      });
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });
  shortcuts.addEventListener(
    "click",
    (event) => {
      const id = (event.target as Element).closest<HTMLElement>(
        "[data-desktop-icon]",
      )?.dataset.desktopIcon;
      if (event.detail !== 0 && suppressedClick && suppressedClick === id) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressedClick = undefined;
      }
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && drag) {
        event.preventDefault();
        finish(true);
      }
    },
    true,
  );
  window.addEventListener("blur", () => finish(true));
  const resize = new ResizeObserver(() => {
    finish(true);
    reflow();
  });
  resize.observe(workspace);
  compact.addEventListener("change", () => {
    finish(true);
    reflow();
  });
  reflow();
  shortcuts.dataset.iconsReady = "true";

  return {
    reset(id?: string) {
      finish(true);
      if (id && ids.includes(id)) {
        const cell = clamp(defaultCell(id));
        if (sameCell(positions[id], cell)) {
          saved.layouts[profile][id] = cell;
          persist("Icon position reset.");
        } else move(id, cell);
      } else {
        saved.layouts[profile] = {};
        reflow();
        persist("Desktop icon positions reset.");
      }
    },
  };
}
