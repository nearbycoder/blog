import css from "../styles/desktop-wordsearch.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("wordsearch", css);

const SIZE = 9;
const THEMES = [
  {
    name: "Woodland",
    note: "A little walk among the trees.",
    words: ["BIRCH", "FERN", "MOSS", "PINE", "OWL", "FOX"],
  },
  {
    name: "Seaside",
    note: "Six discoveries by the water.",
    words: ["CORAL", "SHELL", "TIDE", "REEF", "WAVE", "CRAB"],
  },
  {
    name: "Night sky",
    note: "Look up. There is a whole puzzle overhead.",
    words: ["ORBIT", "COMET", "LUNAR", "NOVA", "STAR", "MOON"],
  },
] as const;
const DIRECTIONS = [-1, 0, 1].flatMap((row) =>
  [-1, 0, 1]
    .filter((column) => row !== 0 || column !== 0)
    .map((column) => [row, column]),
);

type Game = {
  theme: number;
  number: number;
  letters: string[];
  found: Map<string, number[]>;
};
let instance = 0;

function makeGame(theme: number, number: number): Game {
  let seed = 7391 + theme * 18731 + number * 9967;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const letters: string[] = Array(SIZE * SIZE).fill("");
  for (const [wordIndex, word] of THEMES[theme].words.entries()) {
    const candidates: number[][] = [];
    for (let index = 0; index < letters.length; index += 1) {
      const row = Math.floor(index / SIZE);
      const column = index % SIZE;
      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * (word.length - 1);
        const endColumn = column + dc * (word.length - 1);
        if (endRow < 0 || endRow >= SIZE || endColumn < 0 || endColumn >= SIZE)
          continue;
        const path = Array.from(
          { length: word.length },
          (_, offset) => (row + dr * offset) * SIZE + column + dc * offset,
        );
        if (
          path.every(
            (position, offset) =>
              !letters[position] || letters[position] === word[offset],
          )
        )
          candidates.push(path);
      }
    }
    // Six short words leave ample room, but a row layout is a guaranteed fallback.
    if (!candidates.length) {
      letters.fill("");
      THEMES[theme].words.forEach((fallbackWord, row) => {
        [...fallbackWord].forEach((letter, column) => {
          letters[row * SIZE + column] = letter;
        });
      });
      break;
    }
    const path = candidates[Math.floor(random() * candidates.length)];
    path.forEach((position, offset) => {
      letters[position] = word[offset];
    });
    // Vary later placements even when the first word has the same length.
    seed = (seed + wordIndex) >>> 0;
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return {
    theme,
    number,
    letters: letters.map(
      (letter) => letter || alphabet[Math.floor(random() * alphabet.length)],
    ),
    found: new Map(),
  };
}

function lineBetween(start: number, end: number): number[] {
  const row = Math.floor(start / SIZE);
  const column = start % SIZE;
  const deltaRow = Math.floor(end / SIZE) - row;
  const deltaColumn = (end % SIZE) - column;
  if (
    deltaRow !== 0 &&
    deltaColumn !== 0 &&
    Math.abs(deltaRow) !== Math.abs(deltaColumn)
  )
    return [];
  return Array.from(
    { length: Math.max(Math.abs(deltaRow), Math.abs(deltaColumn)) + 1 },
    (_, offset) =>
      (row + Math.sign(deltaRow) * offset) * SIZE +
      column +
      Math.sign(deltaColumn) * offset,
  );
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("wordsearch-app");
  const events = new AbortController();
  const helpId = `wordsearch-help-${++instance}`;
  root.innerHTML = `
    <div class="desk-app-toolbar wordsearch-toolbar">
      <label>Theme <select data-wordsearch-theme aria-label="Puzzle theme"></select></label>
      <button type="button" data-wordsearch-new>New puzzle</button>
      <button type="button" data-wordsearch-undo disabled>Undo puzzle</button>
    </div>
    <div class="wordsearch-scroll">
      <div class="wordsearch-heading"><strong data-wordsearch-title></strong><span data-wordsearch-number></span></div>
      <p class="wordsearch-note" data-wordsearch-note></p>
      <div class="wordsearch-workspace">
        <div class="wordsearch-play">
          <div class="wordsearch-board" role="grid" aria-label="Word search grid" aria-rowcount="9" aria-colcount="9" data-wordsearch-board></div>
          <div class="wordsearch-selection"><span data-wordsearch-selection>Choose the first letter.</span><button type="button" data-wordsearch-cancel disabled>Cancel</button></div>
        </div>
        <aside class="wordsearch-sidebar" aria-label="Puzzle progress">
          <div class="wordsearch-count"><strong data-wordsearch-count></strong><span>words found</span></div>
          <progress data-wordsearch-progress max="6" value="0" aria-label="Words found"></progress>
          <ul class="wordsearch-words" aria-label="Words to find" data-wordsearch-words></ul>
          <p class="wordsearch-help" data-wordsearch-help>Drag across a word, or tap its first and last letters. Words run in all eight directions.<br><br>Keyboard: arrows to move; Enter or Space to set each end. Escape cancels.</p>
        </aside>
      </div>
    </div>
    <p class="desk-app-status wordsearch-status" role="status" aria-live="polite" data-wordsearch-status></p>`;
  const get = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const board = get<HTMLElement>("[data-wordsearch-board]");
  const themeSelect = get<HTMLSelectElement>("[data-wordsearch-theme]");
  const wordList = get<HTMLUListElement>("[data-wordsearch-words]");
  const status = get<HTMLElement>("[data-wordsearch-status]");
  const cancel = get<HTMLButtonElement>("[data-wordsearch-cancel]");
  const undo = get<HTMLButtonElement>("[data-wordsearch-undo]");
  const help = get<HTMLElement>("[data-wordsearch-help]");
  help.id = helpId;
  board.setAttribute("aria-describedby", helpId);
  let game = makeGame(0, 1);
  let previous: Game | null = null;
  let selected = 0;
  let anchor: number | null = null;
  let pointer: { id: number; start: number; moved: boolean } | null = null;
  const cells: HTMLButtonElement[] = [];
  const wordItems = new Map<string, HTMLLIElement>();

  THEMES.forEach((theme, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = theme.name;
    themeSelect.append(option);
  });
  for (let row = 0; row < SIZE; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "wordsearch-row";
    rowElement.setAttribute("role", "row");
    rowElement.setAttribute("aria-rowindex", String(row + 1));
    for (let column = 0; column < SIZE; column += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(column + 1));
      cell.dataset.wordsearchCell = String(row * SIZE + column);
      rowElement.append(cell);
      cells.push(cell);
    }
    board.append(rowElement);
  }

  function renderWords() {
    wordList.replaceChildren();
    wordItems.clear();
    for (const word of THEMES[game.theme].words) {
      const item = document.createElement("li");
      item.dataset.wordsearchWord = word;
      const name = document.createElement("span");
      name.textContent = word;
      const check = document.createElement("span");
      check.className = "wordsearch-check";
      check.setAttribute("aria-hidden", "true");
      item.append(name, check);
      wordList.append(item);
      wordItems.set(word, item);
    }
  }

  function render(message?: string) {
    const preview = new Set(
      anchor === null ? [] : lineBetween(anchor, selected),
    );
    const foundCells = new Set([...game.found.values()].flat());
    cells.forEach((cell, index) => {
      cell.textContent = game.letters[index];
      cell.tabIndex = index === selected ? 0 : -1;
      cell.dataset.found = String(foundCells.has(index));
      cell.dataset.anchor = String(index === anchor);
      cell.setAttribute("aria-selected", String(preview.has(index)));
      cell.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}, ${game.letters[index]}${foundCells.has(index) ? ", found" : ""}${index === anchor ? ", start" : ""}`,
      );
    });
    wordItems.forEach((item, word) => {
      const found = game.found.has(word);
      item.dataset.found = String(found);
      item.setAttribute(
        "aria-label",
        `${word}, ${found ? "found" : "to find"}`,
      );
      item.lastElementChild!.textContent = found ? "✓" : "·";
    });
    const total = THEMES[game.theme].words.length;
    const complete = game.found.size === total;
    board.dataset.complete = String(complete);
    get<HTMLElement>("[data-wordsearch-title]").textContent =
      THEMES[game.theme].name;
    get<HTMLElement>("[data-wordsearch-number]").textContent =
      `Puzzle ${String(game.number).padStart(2, "0")} · 9 × 9`;
    get<HTMLElement>("[data-wordsearch-note]").textContent =
      THEMES[game.theme].note;
    get<HTMLElement>("[data-wordsearch-count]").textContent =
      `${game.found.size} / ${total}`;
    get<HTMLProgressElement>("[data-wordsearch-progress]").value =
      game.found.size;
    get<HTMLElement>("[data-wordsearch-selection]").textContent =
      anchor === null
        ? complete
          ? "Every word discovered!"
          : "Choose the first letter."
        : preview.size > 1
          ? [...preview].map((index) => game.letters[index]).join(" ")
          : "Start set. Choose the last letter.";
    cancel.disabled = anchor === null;
    undo.disabled = previous === null;
    themeSelect.value = String(game.theme);
    if (message !== undefined) status.textContent = message;
  }

  function finish(end: number) {
    if (anchor === null) return;
    const path = lineBetween(anchor, end);
    const text = path.map((index) => game.letters[index]).join("");
    const reverse = [...text].reverse().join("");
    const word = THEMES[game.theme].words.find(
      (candidate) => candidate === text || candidate === reverse,
    );
    anchor = null;
    if (!path.length)
      render("Use a straight line: across, down, or diagonal. Try again.");
    else if (!word)
      render(
        `${text || "That selection"} is not on the list. Try another word.`,
      );
    else if (game.found.has(word))
      render(`${word} is already found. Look for another word.`);
    else {
      game.found.set(word, path);
      render(
        game.found.size === THEMES[game.theme].words.length
          ? `All ${game.found.size} words found! Take a bow, then try a new puzzle.`
          : `${word} found! ${THEMES[game.theme].words.length - game.found.size} words to go.`,
      );
    }
  }

  function activate(index: number) {
    selected = index;
    if (anchor === null) {
      anchor = index;
      render(
        `Start: ${game.letters[index]}, row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}. Choose the last letter.`,
      );
    } else finish(index);
  }

  function endPointer() {
    if (!pointer) return;
    const id = pointer.id;
    pointer = null;
    if (board.hasPointerCapture(id)) board.releasePointerCapture(id);
  }

  function cancelSelection(
    message = "Selection cancelled. Choose a new starting letter.",
  ) {
    endPointer();
    anchor = null;
    render(message);
  }

  function indexAt(x: number, y: number): number | null {
    const cell = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-wordsearch-cell]");
    return cell && board.contains(cell)
      ? Number(cell.dataset.wordsearchCell)
      : null;
  }

  board.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      const cell = (event.target as Element).closest<HTMLElement>(
        "[data-wordsearch-cell]",
      );
      if (!cell) return;
      event.preventDefault();
      selected = Number(cell.dataset.wordsearchCell);
      pointer = { id: event.pointerId, start: selected, moved: false };
      board.setPointerCapture(event.pointerId);
      cells[selected].focus({ preventScroll: true });
      render();
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "pointermove",
    (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const index = indexAt(event.clientX, event.clientY);
      if (index === null || (index === pointer.start && !pointer.moved)) return;
      pointer.moved = true;
      anchor = pointer.start;
      selected = index;
      render();
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "pointerup",
    (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const drag = pointer;
      const index = indexAt(event.clientX, event.clientY);
      endPointer();
      if (index === null) {
        cancelSelection();
        return;
      }
      selected = index;
      if (drag.moved || index !== drag.start) {
        anchor = drag.start;
        finish(index);
      } else activate(index);
      cells[selected].focus({ preventScroll: true });
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "pointercancel",
    (event) => {
      if (pointer?.id === event.pointerId) cancelSelection();
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "lostpointercapture",
    (event) => {
      if (pointer?.id === event.pointerId) cancelSelection();
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "click",
    (event) => {
      // Pointer input is handled above; detail 0 also supports assistive technology.
      if (event.detail !== 0) return;
      const cell = (event.target as Element).closest<HTMLElement>(
        "[data-wordsearch-cell]",
      );
      if (cell) activate(Number(cell.dataset.wordsearchCell));
    },
    { signal: events.signal },
  );
  board.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-wordsearch-cell]",
      );
      if (!target) return;
      selected = Number(target.dataset.wordsearchCell);
      const row = Math.floor(selected / SIZE);
      const column = selected % SIZE;
      const destinations: Record<string, number> = {
        ArrowUp: Math.max(0, row - 1) * SIZE + column,
        ArrowDown: Math.min(SIZE - 1, row + 1) * SIZE + column,
        ArrowLeft: row * SIZE + Math.max(0, column - 1),
        ArrowRight: row * SIZE + Math.min(SIZE - 1, column + 1),
        Home: row * SIZE,
        End: row * SIZE + SIZE - 1,
      };
      if (event.key in destinations) {
        event.preventDefault();
        selected = destinations[event.key];
        render();
        cells[selected].focus({ preventScroll: true });
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(selected);
      } else if (
        event.key === "Escape" &&
        (anchor !== null || pointer !== null)
      ) {
        event.preventDefault();
        event.stopPropagation();
        cancelSelection();
      }
    },
    { signal: events.signal },
  );
  cancel.addEventListener(
    "click",
    () => {
      cancelSelection();
      cells[selected].focus({ preventScroll: true });
    },
    { signal: events.signal },
  );

  function newGame(theme: number) {
    endPointer();
    previous = game;
    game = makeGame(theme, game.number + 1);
    selected = 0;
    anchor = null;
    renderWords();
    render(
      "A fresh puzzle is ready. Undo puzzle restores your previous progress.",
    );
  }
  get("[data-wordsearch-new]").addEventListener(
    "click",
    () => newGame(game.theme),
    { signal: events.signal },
  );
  themeSelect.addEventListener(
    "change",
    () => newGame(Number(themeSelect.value)),
    { signal: events.signal },
  );
  undo.addEventListener(
    "click",
    () => {
      if (!previous) return;
      endPointer();
      game = previous;
      previous = null;
      anchor = null;
      selected = 0;
      renderWords();
      render("Previous puzzle and found words restored.");
    },
    { signal: events.signal },
  );
  renderWords();
  render(
    "Find six hidden words. Select the first and last letters in either order.",
  );
  return () => {
    events.abort();
    endPointer();
    root.classList.remove("wordsearch-app");
  };
}
