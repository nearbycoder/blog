export type WindowLayout =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "maximized";

type Geometry = Pick<
  CSSStyleDeclaration,
  "left" | "top" | "width" | "height" | "minWidth" | "minHeight"
>;
const geometry = (win: HTMLElement): Geometry => ({
  left: win.style.left,
  top: win.style.top,
  width: win.style.width,
  height: win.style.height,
  minWidth: win.style.minWidth,
  minHeight: win.style.minHeight,
});

/** Snap the pane's bounds, not the cursor, against the workspace's 8px gutter. */
export function edgeLayout(
  pane: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
): WindowLayout | undefined {
  const edge = 12;
  const left = pane.left <= edge;
  const right = pane.left + pane.width >= width - edge;
  const top = pane.top <= edge;
  const bottom = pane.top + pane.height >= height - edge;
  // A full-width/full-height pane is not a corner simply because it spans both edges.
  const side = left !== right ? (left ? "left" : "right") : undefined;
  if (side) {
    if (top !== bottom) return `${top ? "top" : "bottom"}-${side}`;
    return side;
  }
  if (top) return "maximized";
}

export function mountWindowLayout(
  workspace: HTMLElement,
  actions: {
    isMobile: () => boolean;
    activate: (win: HTMLElement) => void;
    constrain: (win: HTMLElement) => void;
    announce: (message: string) => void;
  },
) {
  const desktop = workspace.closest<HTMLElement>("[data-desktop]")!;
  const floating = new WeakMap<HTMLElement, Geometry>();
  const preview = document.createElement("div");
  preview.className = "desktop-snap-preview";
  preview.setAttribute("aria-hidden", "true");
  preview.hidden = true;
  workspace.append(preview);
  let cancelGesture: (() => void) | undefined;

  function setLayout(win: HTMLElement, target?: WindowLayout) {
    if (target && !win.dataset.snap) floating.set(win, geometry(win));
    if (target) win.dataset.snap = target;
    else {
      delete win.dataset.snap;
      const saved = floating.get(win);
      if (saved) Object.assign(win.style, saved);
      floating.delete(win);
    }
    const maximized = target === "maximized";
    win.classList.toggle("is-maximized", maximized);
    const button = win.querySelector<HTMLButtonElement>(
      '[data-window-action="maximize"]',
    )!;
    button.setAttribute("aria-pressed", String(maximized));
    button.setAttribute(
      "aria-label",
      `${maximized ? "Restore" : "Maximize"} ${win.dataset.title ?? "Library"}`,
    );
  }

  function snap(win: HTMLElement, target?: WindowLayout) {
    setLayout(win, target);
    actions.constrain(win);
    actions.announce(
      `${win.dataset.title ?? "Library"} ${target ? `snapped ${target.replaceAll("-", " ")}` : "restored to floating size"}.`,
    );
  }

  function restore(
    win: HTMLElement,
    before: Geometry,
    layout?: WindowLayout,
    saved?: Geometry,
  ) {
    setLayout(win, undefined);
    Object.assign(win.style, before);
    if (layout) {
      setLayout(win, layout);
      if (saved) floating.set(win, saved);
    }
  }

  function attachResize(win: HTMLElement) {
    for (const direction of ["n", "e", "s", "w", "ne", "se", "sw", "nw"]) {
      const grip = document.createElement("span");
      grip.className = "window-resize-handle";
      grip.dataset.resize = direction;
      grip.setAttribute("aria-hidden", "true");
      win.append(grip);
      let resize:
        | {
            pointer: number;
            x: number;
            y: number;
            left: number;
            top: number;
            right: number;
            bottom: number;
            minWidth: number;
            minHeight: number;
            moved: boolean;
            before: Geometry;
            layout?: WindowLayout;
            saved?: Geometry;
          }
        | undefined;
      const finish = (commit: boolean) => {
        if (!resize) return;
        const ended = resize;
        resize = undefined;
        cancelGesture = undefined;
        desktop.classList.remove("is-resizing");
        desktop.style.removeProperty("--resize-cursor");
        if (!commit) restore(win, ended.before, ended.layout, ended.saved);
        if (grip.hasPointerCapture(ended.pointer))
          grip.releasePointerCapture(ended.pointer);
      };
      grip.addEventListener("pointerdown", (event) => {
        if (actions.isMobile() || event.button !== 0) return;
        cancelGesture?.();
        const rect = win.getBoundingClientRect(),
          bounds = workspace.getBoundingClientRect();
        resize = {
          pointer: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          left: rect.left - bounds.left,
          top: rect.top - bounds.top,
          right: rect.right - bounds.left,
          bottom: rect.bottom - bounds.top,
          minWidth: 0,
          minHeight: 0,
          moved: false,
          before: geometry(win),
          layout: win.dataset.snap as WindowLayout | undefined,
          saved: floating.get(win),
        };
        actions.activate(win);
        cancelGesture = () => finish(false);
        grip.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      });
      grip.addEventListener("pointermove", (event) => {
        if (!resize || resize.pointer !== event.pointerId) return;
        const dx = event.clientX - resize.x,
          dy = event.clientY - resize.y;
        if (!resize.moved) {
          if (Math.hypot(dx, dy) < 2) return;
          resize.moved = true;
          // Detach a snapped pane at its current size, keeping the opposite edge fixed.
          setLayout(win, undefined);
          const style = getComputedStyle(win);
          resize.minWidth = Math.min(
            parseFloat(style.minWidth) || 0,
            resize.right - resize.left,
          );
          resize.minHeight = Math.min(
            parseFloat(style.minHeight) || 0,
            resize.bottom - resize.top,
          );
          win.style.minWidth = `${resize.minWidth}px`;
          win.style.minHeight = `${resize.minHeight}px`;
          desktop.style.setProperty(
            "--resize-cursor",
            getComputedStyle(grip).cursor,
          );
          desktop.classList.add("is-resizing");
        }
        const bounds = workspace.getBoundingClientRect();
        const left = direction.includes("w")
          ? Math.max(
              8,
              Math.min(resize.right - resize.minWidth, resize.left + dx),
            )
          : resize.left;
        const right = direction.includes("e")
          ? Math.min(
              bounds.width - 8,
              Math.max(resize.left + resize.minWidth, resize.right + dx),
            )
          : resize.right;
        const top = direction.includes("n")
          ? Math.max(
              8,
              Math.min(resize.bottom - resize.minHeight, resize.top + dy),
            )
          : resize.top;
        const bottom = direction.includes("s")
          ? Math.min(
              bounds.height - 8,
              Math.max(resize.top + resize.minHeight, resize.bottom + dy),
            )
          : resize.bottom;
        Object.assign(win.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${right - left}px`,
          height: `${bottom - top}px`,
        });
      });
      grip.addEventListener("pointerup", (event) => {
        if (resize?.pointer === event.pointerId) finish(true);
      });
      grip.addEventListener("pointercancel", (event) => {
        if (resize?.pointer === event.pointerId) finish(false);
      });
      grip.addEventListener("lostpointercapture", (event) => {
        if (resize?.pointer === event.pointerId) finish(false);
      });
    }
  }

  function attach(win: HTMLElement) {
    attachResize(win);
    win.setAttribute(
      "aria-keyshortcuts",
      "Control+Alt+ArrowLeft Control+Alt+ArrowRight Control+Alt+ArrowUp Control+Alt+ArrowDown",
    );
    const handle = win.querySelector<HTMLElement>("[data-drag-handle]")!;
    handle.title =
      "Move window edges to the desktop boundary to snap; corners make quarters. Ctrl+Alt+←/→: half screen; ↑: maximize; ↓: restore.";
    let drag:
      | {
          pointer: number;
          x: number;
          y: number;
          left: number;
          top: number;
          anchor: number;
          moved: boolean;
          target?: WindowLayout;
          before: Geometry;
          layout?: WindowLayout;
          floating?: Geometry;
        }
      | undefined;

    function finish(commit: boolean) {
      if (!drag) return;
      const ended = drag;
      drag = undefined;
      cancelGesture = undefined;
      preview.hidden = true;
      delete preview.dataset.snap;
      desktop.classList.remove("is-dragging");
      if (commit && ended.moved && ended.target) snap(win, ended.target);
      else if (!commit) {
        restore(win, ended.before, ended.layout, ended.floating);
      }
      if (handle.hasPointerCapture(ended.pointer))
        handle.releasePointerCapture(ended.pointer);
    }

    handle.addEventListener("pointerdown", (event) => {
      if (
        actions.isMobile() ||
        event.button !== 0 ||
        (event.target as HTMLElement).closest("button, a")
      )
        return;
      cancelGesture?.();
      const rect = win.getBoundingClientRect(),
        bounds = workspace.getBoundingClientRect();
      drag = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: rect.left - bounds.left,
        top: rect.top - bounds.top,
        anchor: (event.clientX - rect.left) / rect.width,
        moved: false,
        before: geometry(win),
        layout: win.dataset.snap as WindowLayout | undefined,
        floating: floating.get(win),
      };
      cancelGesture = () => finish(false);
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointer !== event.pointerId) return;
      if (
        !drag.moved &&
        Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4
      )
        return;
      const bounds = workspace.getBoundingClientRect();
      if (!drag.moved) {
        drag.moved = true;
        desktop.classList.add("is-dragging");
        if (win.dataset.snap) {
          setLayout(win, undefined);
          drag.left =
            event.clientX -
            bounds.left -
            Math.max(
              40,
              Math.min(win.offsetWidth - 40, win.offsetWidth * drag.anchor),
            );
          drag.top = event.clientY - bounds.top - 20;
          drag.x = event.clientX;
          drag.y = event.clientY;
        }
      }
      win.style.left = `${Math.max(8, Math.min(bounds.width - win.offsetWidth - 8, drag.left + event.clientX - drag.x))}px`;
      win.style.top = `${Math.max(8, Math.min(bounds.height - win.offsetHeight - 8, drag.top + event.clientY - drag.y))}px`;
      drag.target = edgeLayout(
        {
          left: parseFloat(win.style.left),
          top: parseFloat(win.style.top),
          width: win.offsetWidth,
          height: win.offsetHeight,
        },
        bounds.width,
        bounds.height,
      );
      preview.hidden = !drag.target;
      if (drag.target) {
        preview.dataset.snap = drag.target;
        preview.textContent = drag.target.includes("-")
          ? "¼"
          : drag.target === "maximized"
            ? "Full screen"
            : "½";
        preview.style.zIndex = String(Number(win.style.zIndex) + 1);
      }
    });
    handle.addEventListener("pointerup", (event) => {
      if (drag?.pointer === event.pointerId) finish(true);
    });
    handle.addEventListener("pointercancel", (event) => {
      if (drag?.pointer === event.pointerId) finish(false);
    });
    handle.addEventListener("lostpointercapture", (event) => {
      if (drag?.pointer === event.pointerId) finish(false);
    });
    handle.addEventListener("dblclick", (event) => {
      if (
        !(event.target as HTMLElement).closest("button, a") &&
        !actions.isMobile()
      )
        win
          .querySelector<HTMLButtonElement>('[data-window-action="maximize"]')!
          .click();
    });
  }

  function cancelFromKey(event: KeyboardEvent) {
    if (event.key !== "Escape" || !cancelGesture) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelGesture();
    return true;
  }
  document.addEventListener("keydown", cancelFromKey, { capture: true });
  window.addEventListener("blur", () => cancelGesture?.());
  window.addEventListener("resize", () => cancelGesture?.());

  function shortcut(event: KeyboardEvent, win?: HTMLElement) {
    // Reader iframes forward keys here; their focused document does not bubble
    // Escape to the outer document while a title-bar drag has pointer capture.
    if (cancelFromKey(event)) return true;
    if (
      !win ||
      actions.isMobile() ||
      !event.ctrlKey ||
      !event.altKey ||
      event.shiftKey ||
      event.metaKey ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelGesture?.();
    const target = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "maximized",
    }[event.key] as WindowLayout | undefined;
    actions.activate(win);
    snap(win, target);
    return true;
  }
  return { attach, setLayout, shortcut };
}
