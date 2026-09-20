import css from "../styles/desktop-pixel.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("pixel", css);

type Pixel = string | null;
type Tool = "draw" | "erase" | "fill";
const SIZE = 16;
const KEY = "nearby-desktop-pixel-v1";
const HISTORY_LIMIT = 40;
const palette = [
  ["Ink", "#243447"],
  ["White", "#FFFFFF"],
  ["Red", "#E24A4A"],
  ["Orange", "#F39A39"],
  ["Yellow", "#F4D35E"],
  ["Green", "#42A876"],
  ["Blue", "#438CE2"],
  ["Violet", "#9B70D3"],
] as const;

function readPixels(value: string): Pixel[] | null {
  if (value.length > 8192) return null;
  const saved: unknown = JSON.parse(value);
  if (!saved || typeof saved !== "object") return null;
  const candidate = saved as Record<string, unknown>;
  if (
    candidate.version !== 1 ||
    candidate.size !== SIZE ||
    !Array.isArray(candidate.pixels) ||
    candidate.pixels.length !== SIZE * SIZE ||
    !candidate.pixels.every(
      (pixel: unknown) =>
        pixel === null ||
        (typeof pixel === "string" && /^#[0-9a-f]{6}$/i.test(pixel)),
    )
  )
    return null;
  return candidate.pixels.map((pixel: Pixel) => pixel?.toUpperCase() ?? null);
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("pixel-app");
  root.innerHTML = `
    <div class="desk-app-toolbar pixel-tools" role="group" aria-label="Pixel tools">
      <div class="pixel-tool-group">
        <button type="button" data-pixel-tool="draw" aria-pressed="true">Draw</button>
        <button type="button" data-pixel-tool="erase" aria-pressed="false">Erase</button>
        <button type="button" data-pixel-tool="fill" aria-pressed="false">Fill</button>
      </div>
      <div class="pixel-tool-group">
        <button type="button" data-pixel-action="undo" disabled>Undo</button>
        <button type="button" data-pixel-action="redo" disabled>Redo</button>
        <button type="button" data-pixel-action="clear" disabled>Clear drawing</button>
      </div>
    </div>
    <div class="desk-app-toolbar pixel-colors">
      <div class="pixel-palette" role="group" aria-label="Color palette"></div>
      <label class="pixel-color-label">Color <input type="color" value="#243447" aria-label="Drawing color"><output data-pixel-color>#243447</output></label>
    </div>
    <div class="pixel-workspace">
      <div class="pixel-board-heading"><strong>16 × 16</strong><span data-pixel-count>0 / 256 pixels</span></div>
      <div class="pixel-grid" role="grid" aria-label="Pixel drawing" aria-rowcount="16" aria-colcount="16" aria-describedby="pixel-help"></div>
      <p class="pixel-selection" data-pixel-selection aria-live="polite">Row 1, column 1 · Transparent</p>
    </div>
    <div class="desk-app-toolbar pixel-export">
      <label>PNG size <select aria-label="PNG size"><option value="16">16 × 16 · Original</option><option value="256">256 × 256 · 16×</option></select></label>
      <button type="button" data-pixel-action="export">Export PNG</button>
    </div>
    <div class="desk-app-status pixel-status">
      <p data-pixel-status role="status">Ready to draw. Checkerboard pixels are transparent.</p>
      <p data-pixel-storage aria-live="polite">Changes save on this device.</p>
      <p id="pixel-help">Drag to paint. Use arrow keys to choose a pixel, then Space or Enter to apply the tool. Escape cancels a stroke.</p>
    </div>`;

  const grid = root.querySelector<HTMLElement>(".pixel-grid")!;
  const colorInput = root.querySelector<HTMLInputElement>(
    'input[type="color"]',
  )!;
  const colorOutput =
    root.querySelector<HTMLOutputElement>("[data-pixel-color]")!;
  const paletteRoot = root.querySelector<HTMLElement>(".pixel-palette")!;
  const status = root.querySelector<HTMLElement>("[data-pixel-status]")!;
  const storageStatus = root.querySelector<HTMLElement>(
    "[data-pixel-storage]",
  )!;
  const count = root.querySelector<HTMLElement>("[data-pixel-count]")!;
  const selection = root.querySelector<HTMLElement>("[data-pixel-selection]")!;
  const undoButton = root.querySelector<HTMLButtonElement>(
    '[data-pixel-action="undo"]',
  )!;
  const redoButton = root.querySelector<HTMLButtonElement>(
    '[data-pixel-action="redo"]',
  )!;
  const clearButton = root.querySelector<HTMLButtonElement>(
    '[data-pixel-action="clear"]',
  )!;
  const exportSize = root.querySelector<HTMLSelectElement>("select")!;
  const events = new AbortController();
  const cells: HTMLButtonElement[] = [];
  const history: Pixel[][] = [];
  const future: Pixel[][] = [];
  let pixels: Pixel[] = Array(SIZE * SIZE).fill(null);
  let storage: "ready" | "invalid" | "unavailable" = "ready";
  let selected = 0;
  let tool: Tool = "draw";
  let color = "#243447";
  let active: { pointer: number; before: Pixel[]; last: number | null } | null =
    null;

  try {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) {
      let parsed: Pixel[] | null = null;
      try {
        parsed = readPixels(saved);
      } catch {
        // The original saved document is left untouched if it cannot be read.
      }
      if (parsed) {
        pixels = parsed;
        storageStatus.textContent = "Saved drawing restored from this device.";
      } else {
        storage = "invalid";
      }
    }
  } catch {
    storage = "unavailable";
  }

  for (const [name, value] of palette) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "pixel-swatch";
    swatch.dataset.pixelColor = value;
    swatch.style.setProperty("--pixel-swatch", value);
    swatch.setAttribute("aria-label", name);
    swatch.setAttribute("aria-pressed", String(value === color));
    swatch.title = `${name} ${value}`;
    paletteRoot.append(swatch);
  }

  for (let row = 0; row < SIZE; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "pixel-grid-row";
    rowElement.setAttribute("role", "row");
    rowElement.setAttribute("aria-rowindex", String(row + 1));
    for (let column = 0; column < SIZE; column++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "pixel-cell";
      cell.dataset.pixelCell = String(row * SIZE + column);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(column + 1));
      rowElement.append(cell);
      cells.push(cell);
    }
    grid.append(rowElement);
  }

  function describeStorage() {
    if (storage === "invalid")
      storageStatus.textContent =
        "Saved drawing could not be read. Original data is preserved; this drawing stays in this session. Export PNG to keep it.";
    else if (storage === "unavailable")
      storageStatus.textContent =
        "Local save is unavailable. This drawing stays in this session; export PNG to keep it.";
  }

  function save() {
    if (storage === "ready") {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ version: 1, size: SIZE, pixels }),
        );
        storageStatus.textContent = "Saved on this device.";
      } catch {
        storage = "unavailable";
      }
    }
    describeStorage();
  }

  function render() {
    cells.forEach((cell, index) => {
      const value = pixels[index];
      cell.style.backgroundColor = value ?? "transparent";
      cell.dataset.color = value ?? "transparent";
      cell.tabIndex = index === selected ? 0 : -1;
      cell.setAttribute("aria-selected", String(index === selected));
      cell.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}, ${value ?? "transparent"}`,
      );
    });
    const filled = pixels.filter((pixel) => pixel !== null).length;
    count.textContent = `${filled} / 256 pixels`;
    selection.textContent = `Row ${Math.floor(selected / SIZE) + 1}, column ${(selected % SIZE) + 1} · ${pixels[selected] ?? "Transparent"}`;
    undoButton.disabled = history.length === 0;
    redoButton.disabled = future.length === 0;
    clearButton.disabled = filled === 0;
  }

  function setTool(next: Tool) {
    tool = next;
    root
      .querySelectorAll<HTMLElement>("[data-pixel-tool]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.pixelTool === tool),
        );
      });
    grid.dataset.tool = tool;
  }

  function setColor(next: string) {
    color = next.toUpperCase();
    colorInput.value = color.toLowerCase();
    colorOutput.textContent = color;
    paletteRoot
      .querySelectorAll<HTMLElement>("[data-pixel-color]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.pixelColor === color),
        );
      });
  }

  function apply(index: number) {
    if (tool !== "fill") {
      pixels[index] = tool === "erase" ? null : color;
      return;
    }
    const source = pixels[index];
    if (source === color) return;
    const queue = [index];
    pixels[index] = color;
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      const x = current % SIZE;
      const y = Math.floor(current / SIZE);
      const neighbors = [
        x > 0 ? current - 1 : -1,
        x < SIZE - 1 ? current + 1 : -1,
        y > 0 ? current - SIZE : -1,
        y < SIZE - 1 ? current + SIZE : -1,
      ];
      for (const neighbor of neighbors) {
        if (neighbor >= 0 && pixels[neighbor] === source) {
          pixels[neighbor] = color;
          queue.push(neighbor);
        }
      }
    }
  }

  // Join pointer samples so a quick drag cannot leave gaps between pixels.
  function line(from: number, to: number) {
    let x = from % SIZE;
    let y = Math.floor(from / SIZE);
    const endX = to % SIZE;
    const endY = Math.floor(to / SIZE);
    const dx = Math.abs(endX - x);
    const dy = -Math.abs(endY - y);
    const stepX = x < endX ? 1 : -1;
    const stepY = y < endY ? 1 : -1;
    let error = dx + dy;
    while (true) {
      apply(y * SIZE + x);
      if (x === endX && y === endY) break;
      const twice = error * 2;
      if (twice >= dy) {
        error += dy;
        x += stepX;
      }
      if (twice <= dx) {
        error += dx;
        y += stepY;
      }
    }
  }

  function commit(before: Pixel[], message: string) {
    if (pixels.some((value, index) => value !== before[index])) {
      history.push(before);
      if (history.length > HISTORY_LIMIT) history.shift();
      future.length = 0;
      save();
      status.textContent = message;
    } else {
      status.textContent = "No pixels changed.";
    }
    render();
  }

  function finish(keep: boolean) {
    if (!active) return;
    const stroke = active;
    active = null;
    if (grid.hasPointerCapture(stroke.pointer))
      grid.releasePointerCapture(stroke.pointer);
    if (keep)
      commit(
        stroke.before,
        tool === "fill"
          ? "Region filled."
          : "Stroke completed. Undo restores the previous drawing.",
      );
    else {
      pixels = stroke.before;
      status.textContent = "Stroke cancelled.";
      render();
    }
  }

  function point(event: PointerEvent) {
    const rect = grid.getBoundingClientRect();
    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      event.clientX < rect.left ||
      event.clientX >= rect.right ||
      event.clientY < rect.top ||
      event.clientY >= rect.bottom
    )
      return null;
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIZE);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIZE);
    return y * SIZE + x;
  }

  function exportPng() {
    const dimension = Number(exportSize.value) === 256 ? 256 : SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = dimension;
    const context = canvas.getContext("2d");
    if (!context) {
      status.textContent =
        "PNG export is unavailable in this browser. Your drawing is still open.";
      return;
    }
    const scale = dimension / SIZE;
    pixels.forEach((pixel, index) => {
      if (pixel === null) return;
      context.fillStyle = pixel;
      context.fillRect(
        (index % SIZE) * scale,
        Math.floor(index / SIZE) * scale,
        scale,
        scale,
      );
    });
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `pixel-studio-${dimension}x${dimension}.png`;
      link.click();
      status.textContent = `${dimension} × ${dimension} PNG exported with transparent empty pixels.`;
    } catch {
      status.textContent =
        "PNG export failed. Your drawing is still open; try again.";
    }
  }

  function action(name: string) {
    finish(true);
    if (name === "undo" && history.length) {
      future.push(pixels.slice());
      pixels = history.pop()!;
      save();
      status.textContent = "Last edit undone.";
    } else if (name === "redo" && future.length) {
      history.push(pixels.slice());
      pixels = future.pop()!;
      save();
      status.textContent = "Edit restored.";
    } else if (name === "clear" && pixels.some((pixel) => pixel !== null)) {
      const before = pixels.slice();
      pixels.fill(null);
      commit(before, "Drawing cleared. Undo restores your artwork.");
    } else if (name === "export") exportPng();
    render();
  }

  grid.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || active) return;
      const index = point(event);
      if (index === null) return;
      event.preventDefault();
      selected = index;
      active = {
        pointer: event.pointerId,
        before: pixels.slice(),
        last: selected,
      };
      grid.setPointerCapture(event.pointerId);
      apply(selected);
      render();
      cells[selected].focus({ preventScroll: true });
    },
    { signal: events.signal },
  );
  grid.addEventListener(
    "pointermove",
    (event) => {
      if (!active || active.pointer !== event.pointerId || tool === "fill")
        return;
      event.preventDefault();
      const index = point(event);
      if (index === null) {
        // Captured pointer events continue outside the grid. Do not paint the
        // perimeter or connect separate visits through pixels not traversed.
        active.last = null;
        return;
      }
      selected = index;
      if (active.last === null) apply(selected);
      else line(active.last, selected);
      active.last = selected;
      render();
    },
    { signal: events.signal },
  );
  grid.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerId === active?.pointer) {
        finish(true);
        cells[selected].focus({ preventScroll: true });
      }
    },
    { signal: events.signal },
  );
  for (const name of ["pointercancel", "lostpointercapture"] as const) {
    grid.addEventListener(
      name,
      (event) => {
        if (event.pointerId === active?.pointer) finish(false);
      },
      { signal: events.signal },
    );
  }
  grid.addEventListener(
    "keydown",
    (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Escape" && active) {
        event.preventDefault();
        finish(false);
        return;
      }
      const row = Math.floor(selected / SIZE);
      const column = selected % SIZE;
      let next = selected;
      if (event.key === "ArrowLeft")
        next = row * SIZE + Math.max(0, column - 1);
      else if (event.key === "ArrowRight")
        next = row * SIZE + Math.min(SIZE - 1, column + 1);
      else if (event.key === "ArrowUp")
        next = Math.max(0, row - 1) * SIZE + column;
      else if (event.key === "ArrowDown")
        next = Math.min(SIZE - 1, row + 1) * SIZE + column;
      else if (event.key === "Home") next = row * SIZE;
      else if (event.key === "End") next = row * SIZE + SIZE - 1;
      else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (event.repeat) return;
        finish(true);
        const before = pixels.slice();
        apply(selected);
        commit(before, tool === "fill" ? "Region filled." : "Pixel updated.");
        return;
      } else return;
      event.preventDefault();
      finish(true);
      selected = next;
      render();
      cells[selected].focus({ preventScroll: true });
    },
    { signal: events.signal },
  );
  grid.addEventListener(
    "focusin",
    (event) => {
      const cell = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-pixel-cell]",
      );
      if (!cell) return;
      const next = Number(cell.dataset.pixelCell);
      if (next !== selected) {
        selected = next;
        render();
      }
    },
    { signal: events.signal },
  );
  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "button",
      );
      if (!button) return;
      if (button.dataset.pixelAction) action(button.dataset.pixelAction);
      else if (button.dataset.pixelTool) {
        finish(true);
        setTool(button.dataset.pixelTool as Tool);
      } else if (button.dataset.pixelColor) {
        finish(true);
        setColor(button.dataset.pixelColor);
      } else if (button.dataset.pixelCell && event.detail === 0) {
        // Assistive technologies can activate a cell without a pointer or key event.
        selected = Number(button.dataset.pixelCell);
        const before = pixels.slice();
        apply(selected);
        commit(before, "Pixel updated.");
      }
    },
    { signal: events.signal },
  );
  colorInput.addEventListener(
    "input",
    () => {
      finish(true);
      setColor(colorInput.value);
    },
    { signal: events.signal },
  );
  window.addEventListener("blur", () => finish(false), {
    signal: events.signal,
  });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) finish(false);
    },
    { signal: events.signal },
  );

  describeStorage();
  render();
  return () => {
    events.abort();
    finish(false);
  };
}
