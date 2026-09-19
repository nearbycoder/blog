import css from "../styles/desktop-sketchpad.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("sketchpad", css);

type Point = { x: number; y: number };
type Stroke = { kind: "stroke"; points: Point[]; color: string; width: number };
type DrawingAction = Stroke | { kind: "clear" };

const colors = [
  ["Ink", "#17232b"],
  ["Red", "#d43d50"],
  ["Orange", "#d47d16"],
  ["Green", "#16805b"],
  ["Blue", "#2467d5"],
  ["Violet", "#8050ca"],
] as const;

/** A fixed drawing surface lets resizing a window leave every stroke intact. */
export function mountSketchpad(root: HTMLElement): () => void {
  root.classList.add("sketchpad-app");
  root.innerHTML = `
    <div class="desk-app-toolbar sketchpad-toolbar" role="group" aria-label="Drawing tools">
      <div class="sketchpad-tools" role="group" aria-label="Drawing tool">
        <button type="button" data-sketch-tool="brush" aria-pressed="true">Brush</button>
        <button type="button" data-sketch-tool="eraser" aria-pressed="false">Eraser</button>
      </div>
      <div class="sketchpad-palette" role="group" aria-label="Brush color">
        ${colors.map(([name, color], index) => `<button type="button" class="sketchpad-swatch" style="--sketch-color:${color}" data-sketch-color="${color}" aria-label="${name}" aria-pressed="${index === 0}"></button>`).join("")}
      </div>
      <label class="sketchpad-size">Size <input type="range" min="2" max="40" value="8" aria-label="Brush size"><output>8</output></label>
    </div>
    <div class="desk-app-toolbar sketchpad-actions" role="group" aria-label="Drawing actions">
      <button type="button" data-sketch-action="undo" disabled>Undo</button>
      <button type="button" data-sketch-action="redo" disabled>Redo</button>
      <button type="button" data-sketch-action="clear" disabled>Clear</button>
      <button type="button" data-sketch-action="export">Export PNG</button>
    </div>
    <div class="sketchpad-stage">
      <canvas width="1000" height="700" tabindex="0" role="img" aria-label="Sketchpad drawing canvas" aria-describedby="sketchpad-help">Drawing requires a browser with canvas support.</canvas>
    </div>
    <div class="desk-app-status sketchpad-status">
      <span data-sketch-status role="status" aria-live="polite">Blank canvas · Session only</span>
      <p id="sketchpad-help">Draw with a mouse, pen, or touch. Export to keep your sketch before closing this window.</p>
    </div>`;

  const canvas = root.querySelector("canvas")!;
  const context = canvas.getContext("2d");
  if (!context) {
    root.innerHTML =
      '<p class="desk-app-status">Sketchpad needs canvas support in your browser.</p>';
    return () => {};
  }
  const ctx = context;
  const stage = root.querySelector<HTMLElement>(".sketchpad-stage")!;
  const status = root.querySelector<HTMLElement>("[data-sketch-status]")!;
  const size = root.querySelector<HTMLInputElement>('input[type="range"]')!;
  const sizeOutput = root.querySelector("output")!;
  const undo = root.querySelector<HTMLButtonElement>(
    '[data-sketch-action="undo"]',
  )!;
  const redo = root.querySelector<HTMLButtonElement>(
    '[data-sketch-action="redo"]',
  )!;
  const clear = root.querySelector<HTMLButtonElement>(
    '[data-sketch-action="clear"]',
  )!;
  const events = new AbortController();
  const history: DrawingAction[] = [];
  const future: DrawingAction[] = [];
  let color: string = colors[0][1];
  let tool = "brush";
  let active: { pointer: number; stroke: Stroke } | undefined;

  function paper() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function paint(stroke: Stroke, from = 0) {
    const first = stroke.points[from];
    ctx.fillStyle = ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = ctx.lineJoin = "round";
    if (stroke.points.length === 1) {
      ctx.beginPath();
      ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let index = from + 1; index < stroke.points.length; index++) {
      ctx.lineTo(stroke.points[index].x, stroke.points[index].y);
    }
    ctx.stroke();
  }

  function repaint() {
    paper();
    // Earlier marks have no visible effect after the latest clear operation.
    let start = 0;
    for (let index = history.length - 1; index >= 0; index--) {
      if (history[index].kind === "clear") {
        start = index + 1;
        break;
      }
    }
    for (const action of history.slice(start)) {
      if (action.kind === "stroke") paint(action);
    }
  }

  function update() {
    undo.disabled = history.length === 0;
    redo.disabled = future.length === 0;
    clear.disabled =
      !history.length || history[history.length - 1].kind === "clear";
    const lastClear = history.map((action) => action.kind).lastIndexOf("clear");
    const count = history.length - lastClear - 1;
    status.textContent = `${count ? `${count} ${count === 1 ? "stroke" : "strokes"}` : "Blank canvas"} · Session only`;
  }

  function finish(commit: boolean) {
    if (!active) return;
    const { pointer, stroke } = active;
    active = undefined;
    if (canvas.hasPointerCapture(pointer))
      canvas.releasePointerCapture(pointer);
    if (commit) {
      history.push(stroke);
      future.length = 0;
    }
    repaint();
    update();
  }

  function point(event: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          canvas.width,
          ((event.clientX - rect.left) / rect.width) * canvas.width,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          canvas.height,
          ((event.clientY - rect.top) / rect.height) * canvas.height,
        ),
      ),
    };
  }

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || active) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      active = {
        pointer: event.pointerId,
        stroke: {
          kind: "stroke",
          points: [point(event)],
          color: tool === "eraser" ? "#ffffff" : color,
          width: Number(size.value),
        },
      };
      canvas.setPointerCapture(event.pointerId);
      paint(active.stroke);
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (!active || event.pointerId !== active.pointer) return;
      const from = active.stroke.points.length - 1;
      active.stroke.points.push(point(event));
      paint(active.stroke, from);
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerId === active?.pointer) finish(true);
    },
    { signal: events.signal },
  );
  for (const name of ["pointercancel", "lostpointercapture"] as const) {
    canvas.addEventListener(
      name,
      (event) => {
        if (event.pointerId === active?.pointer) finish(false);
      },
      { signal: events.signal },
    );
  }
  window.addEventListener("blur", () => finish(false), {
    signal: events.signal,
  });

  function action(name: string) {
    finish(true);
    if (name === "undo" && history.length) {
      future.push(history.pop()!);
      repaint();
    } else if (name === "redo" && future.length) {
      history.push(future.pop()!);
      repaint();
    } else if (name === "clear" && !clear.disabled) {
      history.push({ kind: "clear" });
      future.length = 0;
      paper();
    } else if (name === "export") {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `sketchpad-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      status.textContent = "PNG exported · Your canvas is still open";
      return;
    }
    update();
  }

  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "button",
      );
      if (!button) return;
      if (button.dataset.sketchAction) action(button.dataset.sketchAction);
      if (button.dataset.sketchColor) {
        color = button.dataset.sketchColor;
        tool = "brush";
      }
      if (button.dataset.sketchTool) tool = button.dataset.sketchTool;
      root
        .querySelectorAll<HTMLButtonElement>("[data-sketch-color]")
        .forEach((swatch) => {
          swatch.setAttribute(
            "aria-pressed",
            String(swatch.dataset.sketchColor === color),
          );
        });
      root
        .querySelectorAll<HTMLButtonElement>("[data-sketch-tool]")
        .forEach((control) => {
          control.setAttribute(
            "aria-pressed",
            String(control.dataset.sketchTool === tool),
          );
        });
      canvas.dataset.tool = tool;
    },
    { signal: events.signal },
  );
  size.addEventListener(
    "input",
    () => {
      sizeOutput.textContent = size.value;
    },
    { signal: events.signal },
  );
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && active) {
        event.preventDefault();
        finish(false);
      }
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        action(event.shiftKey ? "redo" : "undo");
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        action("redo");
      }
    },
    { signal: events.signal },
  );

  const resize = new ResizeObserver(([entry]) => {
    const width = Math.max(
      0,
      Math.min(entry.contentRect.width, (entry.contentRect.height * 10) / 7),
    );
    canvas.style.width = `${width}px`;
    canvas.style.height = `${(width * 7) / 10}px`;
  });
  resize.observe(stage);
  paper();

  return () => {
    events.abort();
    resize.disconnect();
    finish(false);
  };
}
