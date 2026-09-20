import css from "../styles/desktop-sudoku.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("sudoku", css);

const STORAGE_KEY = "nearby-desktop-sudoku-v1";
const PUZZLES = [
  {
    id: "morning",
    name: "Morning paper",
    clues:
      "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    solution:
      "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  {
    id: "garden",
    name: "Garden break",
    clues:
      "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
    solution:
      "483921657967345821251876493548132976729564138136798245372689514814253769695417382",
  },
  {
    id: "evening",
    name: "Evening edition",
    clues:
      "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
    solution:
      "435269781682571493197834562826195347374682915951743628519326874248957136763418259",
  },
] as const;

type Snapshot = { puzzleId: string; values: number[]; selected: number };

function peers(a: number, b: number) {
  return (
    Math.floor(a / 9) === Math.floor(b / 9) ||
    a % 9 === b % 9 ||
    (Math.floor(a / 27) === Math.floor(b / 27) &&
      Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3))
  );
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("sudoku-app");
  const events = new AbortController();
  root.innerHTML = `
    <div class="desk-app-toolbar sudoku-toolbar">
      <button type="button" data-sudoku-new>New puzzle</button>
      <button type="button" data-sudoku-reset>Reset</button>
      <button type="button" data-sudoku-undo disabled>Undo</button>
      <span data-sudoku-title></span>
    </div>
    <div class="sudoku-confirm" data-sudoku-confirm hidden role="group" aria-label="Confirm puzzle change">
      <p data-sudoku-confirm-message></p>
      <button type="button" data-sudoku-confirm-yes>Continue</button>
      <button type="button" data-sudoku-confirm-no>Cancel</button>
    </div>
    <p class="sudoku-storage" data-sudoku-storage role="status" hidden></p>
    <div class="sudoku-scroll">
      <div class="sudoku-workspace">
        <div class="sudoku-board" role="grid" aria-label="Sudoku grid" aria-rowcount="9" aria-colcount="9" data-sudoku-board></div>
        <div class="sudoku-controls">
          <p class="sudoku-selection" data-sudoku-selection></p>
          <div class="sudoku-keypad" role="group" aria-label="Enter a number" data-sudoku-keypad></div>
          <div class="sudoku-actions">
            <button type="button" data-sudoku-erase>Erase</button>
            <button type="button" data-sudoku-hint>Hint</button>
            <button type="button" data-sudoku-check>Check puzzle</button>
          </div>
          <p class="sudoku-help">Fill each row, column, and 3 × 3 box with 1–9. Use arrow keys to move, digits to enter, and Backspace to erase.</p>
          <p class="sudoku-progress" data-sudoku-progress></p>
        </div>
      </div>
    </div>
    <p class="desk-app-status sudoku-status" data-sudoku-status role="status" aria-live="polite"></p>`;

  const get = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const board = get<HTMLElement>("[data-sudoku-board]");
  const status = get<HTMLElement>("[data-sudoku-status]");
  const storageStatus = get<HTMLElement>("[data-sudoku-storage]");
  const confirm = get<HTMLElement>("[data-sudoku-confirm]");
  const confirmYes = get<HTMLButtonElement>("[data-sudoku-confirm-yes]");
  const history: Snapshot[] = [];
  let puzzleIndex = 0;
  let values: number[] = PUZZLES[0].clues.split("").map(Number);
  let selected = values.indexOf(0);
  let checked = false;
  let savingBlocked = false;
  let pending: "new" | "reset" | null = null;

  function storageNotice(message: string) {
    storageStatus.hidden = false;
    storageStatus.textContent = message;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 2048) throw new Error("Invalid progress");
      const saved: unknown = JSON.parse(raw);
      if (!saved || typeof saved !== "object")
        throw new Error("Invalid progress");
      const data = saved as Partial<Snapshot>;
      const index = PUZZLES.findIndex((puzzle) => puzzle.id === data.puzzleId);
      if (
        index < 0 ||
        !Array.isArray(data.values) ||
        data.values.length !== 81 ||
        !data.values.every(
          (value, i) =>
            Number.isInteger(value) &&
            value >= 0 &&
            value <= 9 &&
            (PUZZLES[index].clues[i] === "0" ||
              value === Number(PUZZLES[index].clues[i])),
        ) ||
        !Number.isInteger(data.selected) ||
        data.selected! < 0 ||
        data.selected! > 80
      )
        throw new Error("Invalid progress");
      puzzleIndex = index;
      values = [...data.values];
      selected = data.selected!;
    }
  } catch {
    savingBlocked = true;
    storageNotice(
      "Saved progress could not be read. It has been left untouched; this game will not be saved.",
    );
  }

  function snapshot(): Snapshot {
    return { puzzleId: PUZZLES[puzzleIndex].id, values: [...values], selected };
  }

  function save() {
    if (savingBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
    } catch {
      savingBlocked = true;
      storageNotice(
        "Progress cannot be saved in this browser. You can keep playing here.",
      );
    }
  }

  function remember() {
    history.push(snapshot());
    if (history.length > 100) history.shift();
  }

  const cells: HTMLButtonElement[] = [];
  for (let row = 0; row < 9; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "sudoku-row";
    rowElement.setAttribute("role", "row");
    rowElement.setAttribute("aria-rowindex", String(row + 1));
    for (let column = 0; column < 9; column += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(column + 1));
      cell.dataset.sudokuCell = String(row * 9 + column);
      rowElement.append(cell);
      cells.push(cell);
    }
    board.append(rowElement);
  }
  const keypad = get<HTMLElement>("[data-sudoku-keypad]");
  const digitButtons = Array.from({ length: 9 }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `Enter ${index + 1}`);
    button.dataset.sudokuDigit = String(index + 1);
    keypad.append(button);
    return button;
  });

  function isComplete() {
    return values.join("") === PUZZLES[puzzleIndex].solution;
  }

  function hasProgress() {
    return values.join("") !== PUZZLES[puzzleIndex].clues;
  }

  function render(message?: string) {
    const puzzle = PUZZLES[puzzleIndex];
    const complete = isComplete();
    const conflicts = new Set<number>();
    values.forEach((value, i) => {
      if (!value) return;
      for (let j = i + 1; j < 81; j += 1) {
        if (value === values[j] && peers(i, j)) {
          conflicts.add(i);
          conflicts.add(j);
        }
      }
    });
    cells.forEach((cell, index) => {
      const given = puzzle.clues[index] !== "0";
      const incorrect =
        checked &&
        values[index] !== 0 &&
        values[index] !== Number(puzzle.solution[index]);
      const invalid = conflicts.has(index) || incorrect;
      cell.textContent = values[index] ? String(values[index]) : "";
      cell.dataset.given = String(given);
      cell.dataset.peer = String(index !== selected && peers(index, selected));
      cell.dataset.invalid = String(invalid);
      cell.setAttribute("aria-selected", String(index === selected));
      cell.setAttribute("aria-readonly", String(given));
      cell.setAttribute("aria-invalid", String(invalid));
      cell.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / 9) + 1}, column ${(index % 9) + 1}, ${values[index] || "empty"}${given ? ", given" : ", editable"}${invalid ? ", conflict or mistake" : ""}`,
      );
      cell.tabIndex = index === selected ? 0 : -1;
    });
    const given = puzzle.clues[selected] !== "0";
    get<HTMLElement>("[data-sudoku-title]").textContent =
      `${puzzleIndex + 1} / ${PUZZLES.length} · ${puzzle.name}`;
    get<HTMLElement>("[data-sudoku-selection]").textContent =
      `Row ${Math.floor(selected / 9) + 1}, column ${(selected % 9) + 1}${given ? " · given" : ""}`;
    get<HTMLElement>("[data-sudoku-progress]").textContent =
      `${values.filter(Boolean).length} / 81 filled${savingBlocked ? "" : " · Progress saves on this device"}`;
    digitButtons.forEach((button) => {
      button.disabled = given || complete;
    });
    get<HTMLButtonElement>("[data-sudoku-erase]").disabled =
      given || !values[selected] || complete;
    get<HTMLButtonElement>("[data-sudoku-hint]").disabled = given || complete;
    get<HTMLButtonElement>("[data-sudoku-undo]").disabled =
      history.length === 0;
    get<HTMLButtonElement>("[data-sudoku-reset]").disabled = !hasProgress();
    board.dataset.complete = String(complete);
    if (complete) status.textContent = "Puzzle complete. Well done!";
    else if (message !== undefined) status.textContent = message;
    else if (conflicts.size)
      status.textContent =
        "Repeated numbers are marked. Each row, column, and box needs unique digits.";
    else
      status.textContent =
        "Choose a cell and enter a number. Hint reveals the selected cell.";
  }

  function cancelPending() {
    pending = null;
    confirm.hidden = true;
  }

  function enter(value: number, hint = false) {
    if (PUZZLES[puzzleIndex].clues[selected] !== "0" || isComplete()) return;
    cancelPending();
    if (values[selected] === value) {
      if (hint) render("The selected cell is already correct.");
      return;
    }
    remember();
    values[selected] = value;
    checked = false;
    save();
    render(
      hint
        ? `Hint: row ${Math.floor(selected / 9) + 1}, column ${(selected % 9) + 1} is ${value}.`
        : undefined,
    );
  }

  function select(index: number, focus: boolean) {
    selected = index;
    render();
    if (focus) cells[selected].focus();
  }

  board.addEventListener(
    "click",
    (event) => {
      const cell = (event.target as Element).closest<HTMLElement>(
        "[data-sudoku-cell]",
      );
      if (cell) select(Number(cell.dataset.sudokuCell), false);
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const row = Math.floor(selected / 9);
      const column = selected % 9;
      const destinations: Record<string, number> = {
        ArrowUp: Math.max(0, row - 1) * 9 + column,
        ArrowDown: Math.min(8, row + 1) * 9 + column,
        ArrowLeft: row * 9 + Math.max(0, column - 1),
        ArrowRight: row * 9 + Math.min(8, column + 1),
        Home: row * 9,
        End: row * 9 + 8,
      };
      if (event.key in destinations) {
        event.preventDefault();
        select(destinations[event.key], true);
      } else if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        enter(Number(event.key));
      } else if (["Backspace", "Delete", "0"].includes(event.key)) {
        event.preventDefault();
        enter(0);
      }
    },
    { signal: events.signal },
  );
  keypad.addEventListener(
    "click",
    (event) => {
      const digit = (event.target as Element).closest<HTMLElement>(
        "[data-sudoku-digit]",
      );
      if (digit) enter(Number(digit.dataset.sudokuDigit));
    },
    { signal: events.signal },
  );
  get("[data-sudoku-erase]").addEventListener("click", () => enter(0), {
    signal: events.signal,
  });
  get("[data-sudoku-hint]").addEventListener(
    "click",
    () => enter(Number(PUZZLES[puzzleIndex].solution[selected]), true),
    { signal: events.signal },
  );
  get("[data-sudoku-check]").addEventListener(
    "click",
    () => {
      checked = true;
      const mistakes = values.filter(
        (value, index) =>
          value && value !== Number(PUZZLES[puzzleIndex].solution[index]),
      ).length;
      const remaining = values.filter((value) => !value).length;
      render(
        mistakes
          ? `${mistakes} ${mistakes === 1 ? "mistake is" : "mistakes are"} marked. Keep going!`
          : `No mistakes found. ${remaining} ${remaining === 1 ? "cell remains" : "cells remain"}.`,
      );
    },
    { signal: events.signal },
  );

  function changePuzzle(action: "new" | "reset") {
    remember();
    if (action === "new") puzzleIndex = (puzzleIndex + 1) % PUZZLES.length;
    values = PUZZLES[puzzleIndex].clues.split("").map(Number);
    selected = values.indexOf(0);
    checked = false;
    cancelPending();
    save();
    render(
      action === "new"
        ? "A new puzzle is ready. Undo returns to the previous puzzle."
        : "Puzzle reset. Undo restores your entries.",
    );
  }

  function requestChange(action: "new" | "reset") {
    if (!hasProgress()) {
      changePuzzle(action);
      return;
    }
    pending = action;
    get<HTMLElement>("[data-sudoku-confirm-message]").textContent =
      action === "new"
        ? "Start the next puzzle? You can restore this progress with Undo."
        : "Reset your entries? You can restore them with Undo.";
    confirmYes.textContent =
      action === "new" ? "Start next puzzle" : "Reset entries";
    confirm.hidden = false;
    confirmYes.focus();
  }
  get("[data-sudoku-new]").addEventListener(
    "click",
    () => requestChange("new"),
    { signal: events.signal },
  );
  get("[data-sudoku-reset]").addEventListener(
    "click",
    () => requestChange("reset"),
    { signal: events.signal },
  );
  confirmYes.addEventListener(
    "click",
    () => {
      if (pending) changePuzzle(pending);
      cells[selected].focus();
    },
    { signal: events.signal },
  );
  get("[data-sudoku-confirm-no]").addEventListener(
    "click",
    () => {
      cancelPending();
      cells[selected].focus();
    },
    { signal: events.signal },
  );
  get("[data-sudoku-undo]").addEventListener(
    "click",
    () => {
      const previous = history.pop();
      if (!previous) return;
      puzzleIndex = PUZZLES.findIndex(
        (puzzle) => puzzle.id === previous.puzzleId,
      );
      values = previous.values;
      selected = previous.selected;
      checked = false;
      cancelPending();
      save();
      render("Last change undone.");
    },
    { signal: events.signal },
  );
  render();
  return () => {
    events.abort();
    history.length = 0;
    root.classList.remove("sudoku-app");
  };
}
