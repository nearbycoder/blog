import css from "../styles/desktop-connect.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("connect", css);

type Piece = 0 | 1 | 2;
type Player = 1 | 2;
const columns = 7;
const rows = 6;
const preference = [3, 2, 4, 1, 5, 0, 6];
const directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

function landing(board: Piece[], column: number): number {
  for (let row = rows - 1; row >= 0; row--) {
    const index = row * columns + column;
    if (board[index] === 0) return index;
  }
  return -1;
}

function winningLine(board: Piece[], player: Player): number[] {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      for (const [dy, dx] of directions) {
        const endRow = row + dy * 3;
        const endColumn = column + dx * 3;
        if (endRow >= rows || endColumn < 0 || endColumn >= columns) continue;
        const line = Array.from(
          { length: 4 },
          (_, offset) => (row + dy * offset) * columns + column + dx * offset,
        );
        if (line.every((index) => board[index] === player)) return line;
      }
    }
  }
  return [];
}

function immediateWin(board: Piece[], player: Player): number | undefined {
  for (const column of preference) {
    const index = landing(board, column);
    if (index < 0) continue;
    board[index] = player;
    const wins = winningLine(board, player).length > 0;
    board[index] = 0;
    if (wins) return column;
  }
  return undefined;
}

function chooseComputerColumn(board: Piece[]): number {
  const winning = immediateWin(board, 2);
  if (winning !== undefined) return winning;
  const blocking = immediateWin(board, 1);
  if (blocking !== undefined) return blocking;

  let bestColumn = -1;
  let bestScore = -Infinity;
  for (const column of preference) {
    const index = landing(board, column);
    if (index < 0) continue;
    board[index] = 2;
    let score = (3 - Math.abs(3 - column)) * 20;
    // Favor open lines and the center; avoid supporting an immediate red win.
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        for (const [dy, dx] of directions) {
          if (
            row + dy * 3 >= rows ||
            col + dx * 3 < 0 ||
            col + dx * 3 >= columns
          )
            continue;
          let computer = 0;
          let human = 0;
          for (let step = 0; step < 4; step++) {
            const piece = board[(row + dy * step) * columns + col + dx * step];
            if (piece === 2) computer++;
            if (piece === 1) human++;
          }
          if (human === 0) score += [0, 1, 7, 35, 1000][computer];
          if (computer === 0) score -= [0, 1, 5, 25, 1000][human];
        }
      }
    }
    if (immediateWin(board, 1) !== undefined) score -= 10000;
    board[index] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }
  return bestColumn;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("connect-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const panel = root.closest<HTMLElement>(".utility-window");
  let board: Piece[] = Array<Piece>(rows * columns).fill(0);
  let turn: Player = 1;
  let winner: Player | 0 = 0;
  let winning: number[] = [];
  let selectedColumn = 3;
  let moves = 0;
  let computerMode = false;
  let computerTimer: number | undefined;
  let active = true;

  root.innerHTML = `
    <div class="desk-app-toolbar connect-toolbar">
      <label>Players <select aria-label="Game mode" data-connect-mode>
        <option value="local">Two players</option>
        <option value="computer">Play computer</option>
      </select></label>
      <button type="button" data-connect-restart>Restart</button>
    </div>
    <div class="connect-body">
      <div class="connect-players" aria-label="Players">
        <span class="connect-player" data-connect-player="1"><span class="connect-token connect-red" aria-hidden="true">R</span> Red</span>
        <span class="connect-moves" data-connect-moves>0 / 42</span>
        <span class="connect-player" data-connect-player="2"><span class="connect-token connect-yellow" aria-hidden="true">Y</span> <span data-connect-opponent>Yellow</span></span>
      </div>
      <div class="connect-play" tabindex="0" role="group" aria-label="Four in a Row board" aria-describedby="connect-help connect-selection">
        <div class="connect-columns" role="group" aria-label="Drop a disc"></div>
        <div class="connect-board" role="table" aria-label="Board positions: row 1 is the top"></div>
      </div>
      <p class="connect-selection" id="connect-selection" data-connect-selection></p>
      <p class="connect-help" id="connect-help">Connect four across, down, or diagonally. Choose a numbered column, or use ← → then Enter on the board.</p>
      <p class="connect-help connect-mode-help">Changing players starts a new game.</p>
    </div>
    <p class="desk-app-status connect-status" role="status" aria-live="polite" data-connect-status></p>
  `;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const mode = find<HTMLSelectElement>("[data-connect-mode]");
  const play = find<HTMLElement>(".connect-play");
  const boardElement = find<HTMLElement>(".connect-board");
  const columnElement = find<HTMLElement>(".connect-columns");
  const status = find<HTMLElement>("[data-connect-status]");
  const selection = find<HTMLElement>("[data-connect-selection]");
  const moveLabel = find<HTMLElement>("[data-connect-moves]");
  const columnButtons: HTMLButtonElement[] = [];
  const cells: HTMLElement[] = [];

  for (let column = 0; column < columns; column++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(column + 1);
    button.setAttribute("aria-label", `Drop in column ${column + 1}`);
    button.dataset.connectColumn = String(column);
    button.addEventListener(
      "click",
      () => {
        selectedColumn = column;
        drop(column);
      },
      events,
    );
    button.addEventListener(
      "focus",
      () => {
        selectedColumn = column;
        renderSelection();
      },
      events,
    );
    columnButtons.push(button);
    columnElement.append(button);
  }
  for (let row = 0; row < rows; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "connect-row";
    rowElement.setAttribute("role", "row");
    for (let column = 0; column < columns; column++) {
      const cell = document.createElement("span");
      cell.className = "connect-cell";
      cell.setAttribute("role", "cell");
      cell.dataset.connectRow = String(row);
      cell.dataset.connectCol = String(column);
      rowElement.append(cell);
      cells.push(cell);
    }
    boardElement.append(rowElement);
  }

  function isVisible() {
    return active && !document.hidden && !root.hidden && !panel?.hidden;
  }

  function waitingForComputer() {
    return computerMode && turn === 2 && !winner && moves < rows * columns;
  }

  function renderSelection() {
    columnButtons.forEach((button, column) => {
      button.classList.toggle("is-selected", selectedColumn === column);
    });
    selection.textContent = `Column ${selectedColumn + 1} selected${landing(board, selectedColumn) < 0 ? " · full" : ""}`;
  }

  function render() {
    const finished = Boolean(winner) || moves === rows * columns;
    const focusedColumn = columnButtons.find(
      (button) => button === document.activeElement,
    );
    cells.forEach((cell, index) => {
      const piece = board[index];
      const name = piece === 1 ? "Red" : piece === 2 ? "Yellow" : "Empty";
      cell.dataset.connectPiece = name.toLowerCase();
      cell.textContent = piece === 1 ? "R" : piece === 2 ? "Y" : "";
      cell.classList.toggle("is-winning", winning.includes(index));
      cell.setAttribute(
        "aria-label",
        `Row ${Math.floor(index / columns) + 1}, column ${(index % columns) + 1}: ${name}${winning.includes(index) ? ", winning disc" : ""}`,
      );
    });
    columnButtons.forEach((button, column) => {
      button.disabled =
        finished || waitingForComputer() || landing(board, column) < 0;
      button.title =
        landing(board, column) < 0
          ? `Column ${column + 1} is full`
          : `Drop in column ${column + 1}`;
    });
    // Keep keyboard play available when the clicked column becomes disabled.
    if (focusedColumn?.disabled) play.focus({ preventScroll: true });
    find<HTMLElement>("[data-connect-opponent]").textContent = computerMode
      ? "Computer"
      : "Yellow";
    root
      .querySelectorAll<HTMLElement>("[data-connect-player]")
      .forEach((player) => {
        player.classList.toggle(
          "is-turn",
          !finished && Number(player.dataset.connectPlayer) === turn,
        );
      });
    moveLabel.textContent = `${moves} / 42`;
    moveLabel.setAttribute("aria-label", `${moves} discs played out of 42`);
    if (winner)
      status.textContent = `${winner === 1 ? "Red" : computerMode ? "Computer (Yellow)" : "Yellow"} wins! Four in a row. Restart to play again.`;
    else if (finished)
      status.textContent = "Draw! The board is full. Restart to play again.";
    else if (waitingForComputer())
      status.textContent = isVisible()
        ? "Computer is choosing a column…"
        : "Computer paused while the game is hidden.";
    else
      status.textContent = `${turn === 1 ? "Red" : "Yellow"}'s turn. Drop a disc.`;
    renderSelection();
  }

  function cancelComputer() {
    if (computerTimer !== undefined) window.clearTimeout(computerTimer);
    computerTimer = undefined;
  }

  function scheduleComputer() {
    cancelComputer();
    if (!waitingForComputer() || !isVisible()) return;
    computerTimer = window.setTimeout(() => {
      computerTimer = undefined;
      if (!waitingForComputer() || !isVisible()) return;
      const column = chooseComputerColumn(board);
      if (column >= 0) place(column);
    }, 360);
  }

  function place(column: number) {
    const index = landing(board, column);
    if (index < 0 || winner || moves === rows * columns) return;
    board[index] = turn;
    moves++;
    winning = winningLine(board, turn);
    if (winning.length) winner = turn;
    else turn = turn === 1 ? 2 : 1;
    render();
    scheduleComputer();
  }

  function drop(column: number) {
    if (
      !isVisible() ||
      waitingForComputer() ||
      winner ||
      moves === rows * columns
    )
      return;
    if (landing(board, column) < 0) {
      status.textContent = `Column ${column + 1} is full. Choose another column.`;
      return;
    }
    place(column);
  }

  function reset() {
    cancelComputer();
    board = Array<Piece>(rows * columns).fill(0);
    turn = 1;
    winner = 0;
    winning = [];
    selectedColumn = 3;
    moves = 0;
    render();
  }

  play.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.repeat) {
        // A repeated Enter would otherwise activate a focused column button.
        if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key))
          event.preventDefault();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        selectedColumn =
          (selectedColumn + (event.key === "ArrowLeft" ? columns - 1 : 1)) %
          columns;
        renderSelection();
        if (event.target !== play) {
          const selected = columnButtons[selectedColumn];
          // Keep native button activation aligned with the highlighted column.
          (selected.disabled ? play : selected).focus({ preventScroll: true });
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        drop(selectedColumn);
      }
    },
    events,
  );
  mode.addEventListener(
    "change",
    () => {
      computerMode = mode.value === "computer";
      reset();
    },
    events,
  );
  find<HTMLButtonElement>("[data-connect-restart]").addEventListener(
    "click",
    reset,
    events,
  );
  const visibilityChanged = () => {
    scheduleComputer();
    if (waitingForComputer()) render();
  };
  document.addEventListener("visibilitychange", visibilityChanged, events);
  const observer = new MutationObserver(visibilityChanged);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (panel)
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  render();

  return () => {
    active = false;
    cancelComputer();
    observer.disconnect();
    controller.abort();
  };
}
