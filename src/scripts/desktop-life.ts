import css from "../styles/desktop-life.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("life", css);

const COLUMNS = 30;
const ROWS = 20;
const SIZE = COLUMNS * ROWS;
const PATTERNS: Record<string, { name: string; rows: string[] }> = {
  glider: { name: "Glider", rows: [".O.", "..O", "OOO"] },
  blinker: { name: "Blinker", rows: ["OOO"] },
  beacon: { name: "Beacon", rows: ["OO..", "OO..", "..OO", "..OO"] },
  acorn: { name: "Acorn", rows: [".O.....", "...O...", "OO..OOO"] },
  pentomino: { name: "R-pentomino", rows: [".OO", "OO.", ".O."] },
};

type Snapshot = { cells: Uint8Array; generation: number };

function patternCells(key: string) {
  const result = new Uint8Array(SIZE);
  const pattern = PATTERNS[key] ?? PATTERNS.glider;
  const top = Math.floor((ROWS - pattern.rows.length) / 2);
  const left = Math.floor((COLUMNS - pattern.rows[0].length) / 2);
  pattern.rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "O") result[(top + y) * COLUMNS + left + x] = 1;
    });
  });
  return result;
}

function nextGeneration(cells: Uint8Array) {
  const next = new Uint8Array(SIZE);
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if ((dx || dy) && nx >= 0 && nx < COLUMNS && ny >= 0 && ny < ROWS)
            neighbors += cells[ny * COLUMNS + nx];
        }
      }
      const index = y * COLUMNS + x;
      next[index] = Number(
        neighbors === 3 || (cells[index] && neighbors === 2),
      );
    }
  }
  return next;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("life-app");
  root.innerHTML = `
    <div class="desk-app-toolbar life-toolbar">
      <button type="button" data-life-play aria-pressed="false">Play</button>
      <button type="button" data-life-step>Step</button>
      <button type="button" data-life-undo disabled>Undo</button>
      <label class="life-speed">Speed
        <input data-life-speed type="range" min="1" max="12" step="1" value="6" aria-label="Generations per second">
        <output data-life-speed-label>6 / sec</output>
      </label>
    </div>
    <div class="life-scroll">
      <div class="life-presets">
        <label>Pattern <select data-life-pattern aria-label="Pattern">
          <option value="glider">Glider</option>
          <option value="blinker">Blinker</option>
          <option value="beacon">Beacon</option>
          <option value="acorn">Acorn</option>
          <option value="pentomino">R-pentomino</option>
        </select></label>
        <button type="button" data-life-load>Load pattern</button>
        <button type="button" data-life-random>Random</button>
        <button type="button" data-life-clear>Clear</button>
      </div>
      <div class="life-metrics" aria-live="off">
        <span>Generation <strong data-life-generation>0</strong></span>
        <span>Population <strong data-life-population>5</strong></span>
        <span class="life-state" data-life-state>Paused</span>
      </div>
      <div class="life-grid" data-life-grid role="grid" aria-label="Game of Life, 30 columns by 20 rows" aria-rowcount="20" aria-colcount="30" aria-describedby="life-instructions"></div>
      <div class="life-cell-controls" role="group" aria-label="Selected cell controls">
        <p data-life-selection></p>
        <div class="life-directions">
          <button type="button" data-life-move="up" aria-label="Select cell above">↑</button>
          <button type="button" data-life-move="left" aria-label="Select cell left">←</button>
          <button type="button" data-life-move="down" aria-label="Select cell below">↓</button>
          <button type="button" data-life-move="right" aria-label="Select cell right">→</button>
          <button type="button" data-life-toggle>Toggle cell</button>
        </div>
      </div>
      <p class="life-help" id="life-instructions">Draw or erase by dragging. Arrow keys select a cell; Space or Enter toggles it. Editing pauses playback. Edges are closed.</p>
      <details class="life-rules"><summary>How life grows</summary><p>A live cell survives with 2 or 3 neighbors. A dead cell is born with exactly 3. All cells change together. Load a pattern or draw your own, then Step or Play. Undo restores the last edit or the board before playback.</p></details>
    </div>
    <p class="desk-app-status life-status" data-life-status role="status">Glider ready. Press Play to watch it travel.</p>`;

  const events = new AbortController();
  const { signal } = events;
  const get = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const grid = get<HTMLElement>("[data-life-grid]");
  const play = get<HTMLButtonElement>("[data-life-play]");
  const step = get<HTMLButtonElement>("[data-life-step]");
  const undo = get<HTMLButtonElement>("[data-life-undo]");
  const speed = get<HTMLInputElement>("[data-life-speed]");
  const speedLabel = get<HTMLOutputElement>("[data-life-speed-label]");
  const pattern = get<HTMLSelectElement>("[data-life-pattern]");
  const status = get<HTMLElement>("[data-life-status]");
  const generationLabel = get<HTMLElement>("[data-life-generation]");
  const populationLabel = get<HTMLElement>("[data-life-population]");
  const selectedLabel = get<HTMLElement>("[data-life-selection]");
  const stateLabel = get<HTMLElement>("[data-life-state]");
  const panel = root.closest<HTMLElement>(".utility-window");
  let cells: Uint8Array = patternCells("glider");
  let generation = 0;
  let selected = 9 * COLUMNS + 14;
  let running = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let framesPerSecond = 6;
  let pointer: number | null = null;
  let paintValue = 1;
  let lastPainted: number | null = null;
  const history: Snapshot[] = [];
  const buttons: HTMLButtonElement[] = [];
  const rendered = new Int8Array(SIZE).fill(-1);
  let renderedSelection = -1;

  for (let y = 0; y < ROWS; y += 1) {
    const row = document.createElement("div");
    row.className = "life-row";
    row.setAttribute("role", "row");
    row.setAttribute("aria-rowindex", String(y + 1));
    for (let x = 0; x < COLUMNS; x += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "life-cell";
      button.dataset.lifeCell = String(y * COLUMNS + x);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-colindex", String(x + 1));
      button.setAttribute("aria-selected", "false");
      button.tabIndex = -1;
      buttons.push(button);
      row.append(button);
    }
    grid.append(row);
  }

  const available = () =>
    !disposed &&
    root.isConnected &&
    !document.hidden &&
    !root.hidden &&
    !panel?.hidden;

  function render(message?: string) {
    let population = 0;
    cells.forEach((alive, index) => {
      population += alive;
      if (rendered[index] === alive) return;
      const button = buttons[index];
      button.dataset.alive = String(Boolean(alive));
      button.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / COLUMNS) + 1}, column ${(index % COLUMNS) + 1}, ${alive ? "alive" : "dead"}`,
      );
      rendered[index] = alive;
    });
    if (renderedSelection !== selected) {
      if (renderedSelection >= 0) {
        buttons[renderedSelection].tabIndex = -1;
        buttons[renderedSelection].setAttribute("aria-selected", "false");
      }
      buttons[selected].tabIndex = 0;
      buttons[selected].setAttribute("aria-selected", "true");
      renderedSelection = selected;
    }
    generationLabel.textContent = String(generation);
    populationLabel.textContent = String(population);
    selectedLabel.textContent = `Row ${Math.floor(selected / COLUMNS) + 1} · Column ${(selected % COLUMNS) + 1} · ${cells[selected] ? "Alive" : "Dead"}`;
    stateLabel.textContent = running ? "Playing" : "Paused";
    stateLabel.dataset.playing = String(running);
    play.textContent = running ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(running));
    step.disabled = running;
    undo.disabled = history.length === 0;
    if (message) status.textContent = message;
  }

  function remember() {
    history.push({ cells: cells.slice(), generation });
    if (history.length > 30) history.shift();
  }

  function stopTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function pause(message?: string) {
    running = false;
    stopTimer();
    render(message);
  }

  function advance() {
    const next = nextGeneration(cells);
    const unchanged = next.every((value, index) => value === cells[index]);
    cells = next;
    generation += 1;
    if (!cells.some(Boolean))
      pause("No living cells remain. Draw a new seed or load a pattern.");
    else if (unchanged)
      pause("A still life: this pattern will no longer change.");
    else render(running ? undefined : `Advanced to generation ${generation}.`);
  }

  function schedule() {
    stopTimer();
    if (!running) return;
    // A single bounded timeout: no background loop or catch-up bursts.
    timer = setTimeout(
      () => {
        timer = undefined;
        if (!available()) {
          pause("Paused while hidden. Press Play to resume.");
          return;
        }
        advance();
        schedule();
      },
      Math.ceil(1000 / framesPerSecond),
    );
  }

  function releasePointer() {
    const captured = pointer;
    pointer = null;
    lastPainted = null;
    if (captured !== null && grid.hasPointerCapture(captured))
      grid.releasePointerCapture(captured);
  }

  function replace(next: Uint8Array, message: string) {
    releasePointer();
    pause();
    remember();
    cells = next;
    generation = 0;
    render(message);
  }

  function toggleSelected() {
    releasePointer();
    pause();
    remember();
    cells[selected] = cells[selected] ? 0 : 1;
    generation = 0;
    render("Cell edited. Generation reset; Undo is available.");
  }

  function moveSelection(direction: string, focus: boolean) {
    const row = Math.floor(selected / COLUMNS);
    const column = selected % COLUMNS;
    if (direction === "left") selected -= Number(column > 0);
    if (direction === "right") selected += Number(column < COLUMNS - 1);
    if (direction === "up") selected -= row > 0 ? COLUMNS : 0;
    if (direction === "down") selected += row < ROWS - 1 ? COLUMNS : 0;
    if (direction === "home") selected -= column;
    if (direction === "end") selected += COLUMNS - 1 - column;
    render();
    // Keep keyboard selection visible when a short pane needs to scroll.
    if (focus) buttons[selected].focus();
  }

  play.addEventListener(
    "click",
    () => {
      releasePointer();
      if (running) {
        pause("Paused. Edit the board or press Play to continue.");
        return;
      }
      if (!available()) return;
      if (!cells.some(Boolean)) {
        render("The board is empty. Draw cells or load a pattern first.");
        return;
      }
      remember();
      running = true;
      render("Playing. Playback pauses when this window is hidden.");
      schedule();
    },
    { signal },
  );
  step.addEventListener(
    "click",
    () => {
      releasePointer();
      if (running) return;
      remember();
      advance();
    },
    { signal },
  );
  undo.addEventListener(
    "click",
    () => {
      releasePointer();
      pause();
      const previous = history.pop();
      if (!previous) return;
      cells = previous.cells;
      generation = previous.generation;
      render("Previous board restored.");
    },
    { signal },
  );
  speed.addEventListener(
    "input",
    () => {
      const requested = Number(speed.value);
      framesPerSecond = Number.isFinite(requested)
        ? Math.max(1, Math.min(12, Math.round(requested)))
        : 6;
      speed.value = String(framesPerSecond);
      speedLabel.value = `${framesPerSecond} / sec`;
      speed.setAttribute(
        "aria-valuetext",
        `${framesPerSecond} generations per second`,
      );
      schedule();
    },
    { signal },
  );
  get<HTMLButtonElement>("[data-life-load]").addEventListener(
    "click",
    () => {
      const preset = PATTERNS[pattern.value];
      if (!preset) return;
      replace(
        patternCells(pattern.value),
        `${preset.name} loaded. Undo restores your previous board.`,
      );
    },
    { signal },
  );
  get<HTMLButtonElement>("[data-life-random]").addEventListener(
    "click",
    () => {
      const random = Uint8Array.from({ length: SIZE }, () =>
        Number(Math.random() < 0.28),
      );
      replace(
        random,
        "Random seed created. Undo restores your previous board.",
      );
    },
    { signal },
  );
  get<HTMLButtonElement>("[data-life-clear]").addEventListener(
    "click",
    () => {
      replace(
        new Uint8Array(SIZE),
        "Board cleared. Undo restores your previous board.",
      );
    },
    { signal },
  );
  get<HTMLButtonElement>("[data-life-toggle]").addEventListener(
    "click",
    toggleSelected,
    { signal },
  );
  root
    .querySelectorAll<HTMLButtonElement>("[data-life-move]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => moveSelection(button.dataset.lifeMove!, false),
        { signal },
      );
    });
  grid.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const directions: Record<string, string> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        Home: "home",
        End: "end",
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      moveSelection(direction, true);
    },
    { signal },
  );
  grid.addEventListener(
    "focusin",
    (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.lifeCell === undefined) return;
      selected = Number(target.dataset.lifeCell);
      render();
    },
    { signal },
  );
  grid.addEventListener(
    "click",
    (event) => {
      // Pointer painting is handled on pointerdown; keyboard and AT clicks land here.
      if (event.detail !== 0) return;
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-life-cell]",
      );
      if (!target) return;
      selected = Number(target.dataset.lifeCell);
      toggleSelected();
    },
    { signal },
  );

  function paint(index: number) {
    // Fill intervening cells so a fast pointer stroke stays continuous.
    const from = lastPainted ?? index;
    let x = from % COLUMNS;
    let y = Math.floor(from / COLUMNS);
    const endX = index % COLUMNS;
    const endY = Math.floor(index / COLUMNS);
    const dx = Math.abs(endX - x);
    const dy = -Math.abs(endY - y);
    const sx = x < endX ? 1 : -1;
    const sy = y < endY ? 1 : -1;
    let error = dx + dy;
    while (true) {
      cells[y * COLUMNS + x] = paintValue;
      if (x === endX && y === endY) break;
      const twice = 2 * error;
      if (twice >= dy) {
        error += dy;
        x += sx;
      }
      if (twice <= dx) {
        error += dx;
        y += sy;
      }
    }
    selected = index;
    lastPainted = index;
    generation = 0;
    render("Board edited. Generation reset; Undo is available.");
  }

  grid.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-life-cell]",
      );
      if (!target) return;
      event.preventDefault();
      pause();
      remember();
      const index = Number(target.dataset.lifeCell);
      pointer = event.pointerId;
      grid.setPointerCapture(pointer);
      paintValue = cells[index] ? 0 : 1;
      paint(index);
      buttons[index].focus({ preventScroll: true });
    },
    { signal },
  );
  grid.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerId !== pointer) return;
      const bounds = grid.getBoundingClientRect();
      const x = Math.floor(
        ((event.clientX - bounds.left) / bounds.width) * COLUMNS,
      );
      const y = Math.floor(
        ((event.clientY - bounds.top) / bounds.height) * ROWS,
      );
      if (x < 0 || x >= COLUMNS || y < 0 || y >= ROWS) {
        lastPainted = null;
        return;
      }
      paint(y * COLUMNS + x);
    },
    { signal },
  );
  for (const eventName of [
    "pointerup",
    "pointercancel",
    "lostpointercapture",
  ] as const) {
    grid.addEventListener(
      eventName,
      (event) => {
        if (event.pointerId === pointer) releasePointer();
      },
      { signal },
    );
  }

  function visibilityChanged() {
    if (available()) return;
    releasePointer();
    if (running) pause("Paused while hidden. Press Play to resume.");
  }
  const observer = new MutationObserver(visibilityChanged);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (panel)
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("visibilitychange", visibilityChanged, { signal });
  speed.setAttribute("aria-valuetext", "6 generations per second");
  render();
  return () => {
    disposed = true;
    running = false;
    stopTimer();
    releasePointer();
    events.abort();
    observer.disconnect();
  };
}
