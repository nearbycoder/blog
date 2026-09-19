export type WindowLayout =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "maximized";

type Geometry = Pick<CSSStyleDeclaration, "left" | "top" | "width" | "height">;
const geometry = (win: HTMLElement): Geometry => ({
  left: win.style.left,
  top: win.style.top,
  width: win.style.width,
  height: win.style.height,
});

/** Pointer coordinates select a layout; CSS keeps the layout responsive on resize. */
export function edgeLayout(
  x: number,
  y: number,
  width: number,
  height: number,
): WindowLayout | undefined {
  const edge = 24,
    corner = 80;
  const top = y <= edge,
    bottom = y >= height - edge;
  const left = x <= edge || ((top || bottom) && x <= corner);
  const right = x >= width - edge || ((top || bottom) && x >= width - corner);
  if (left || right) {
    const side = left ? "left" : "right";
    if (y <= corner) return `top-${side}`;
    if (y >= height - corner) return `bottom-${side}`;
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
  let cancelDrag: (() => void) | undefined;

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

  function attach(win: HTMLElement) {
    win.setAttribute(
      "aria-keyshortcuts",
      "Control+Alt+ArrowLeft Control+Alt+ArrowRight Control+Alt+ArrowUp Control+Alt+ArrowDown",
    );
    const handle = win.querySelector<HTMLElement>("[data-drag-handle]")!;
    handle.title =
      "Drag to an edge to snap. Ctrl+Alt+←/→: half screen; ↑: maximize; ↓: restore.";
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
      cancelDrag = undefined;
      preview.hidden = true;
      delete preview.dataset.snap;
      desktop.classList.remove("is-dragging");
      if (commit && ended.moved && ended.target) snap(win, ended.target);
      else if (!commit) {
        setLayout(win, undefined);
        Object.assign(win.style, ended.before);
        if (ended.layout) {
          setLayout(win, ended.layout);
          if (ended.floating) floating.set(win, ended.floating);
        }
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
      cancelDrag?.();
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
      cancelDrag = () => finish(false);
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
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        bounds.width,
        bounds.height,
      );
      preview.hidden = !drag.target;
      if (drag.target) {
        preview.dataset.snap = drag.target;
        preview.style.zIndex = String(Number(win.style.zIndex) + 1);
      }
    });
    handle.addEventListener("pointerup", (event) => {
      if (drag?.pointer === event.pointerId) finish(true);
    });
    handle.addEventListener("pointercancel", () => finish(false));
    handle.addEventListener("lostpointercapture", () => finish(false));
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
    if (event.key !== "Escape" || !cancelDrag) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelDrag();
    return true;
  }
  document.addEventListener("keydown", cancelFromKey, { capture: true });
  window.addEventListener("blur", () => cancelDrag?.());
  window.addEventListener("resize", () => cancelDrag?.());

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
    cancelDrag?.();
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
