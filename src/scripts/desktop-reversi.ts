import css from "../styles/desktop-reversi.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("reversi", css);

type Player = 1 | 2;
type Square = 0 | Player;
type Move = { index: number; flips: number[] };
const DIRECTIONS = [-1, 0, 1].flatMap((row) =>
  [-1, 0, 1].filter((col) => row !== 0 || col !== 0).map((col) => [row, col]),
);
const nameOf = (player: Player) => (player === 1 ? "Black" : "White");
const other = (player: Player): Player => (player === 1 ? 2 : 1);
const coordinate = (index: number) =>
  `${String.fromCharCode(65 + (index % 8))}${Math.floor(index / 8) + 1}`;

function opening(): Square[] {
  const board: Square[] = Array(64).fill(0);
  board[27] = board[36] = 2;
  board[28] = board[35] = 1;
  return board;
}

function flipsFor(board: Square[], index: number, player: Player): number[] {
  if (board[index] !== 0) return [];
  const flips: number[] = [];
  for (const [dy, dx] of DIRECTIONS) {
    let row = Math.floor(index / 8) + dy;
    let col = (index % 8) + dx;
    const line: number[] = [];
    while (row >= 0 && row < 8 && col >= 0 && col < 8) {
      const current = row * 8 + col;
      if (board[current] === other(player)) line.push(current);
      else {
        if (board[current] === player && line.length) flips.push(...line);
        break;
      }
      row += dy;
      col += dx;
    }
  }
  return flips;
}

function movesFor(board: Square[], player: Player): Move[] {
  const moves: Move[] = [];
  for (let index = 0; index < 64; index++) {
    const flips = flipsFor(board, index, player);
    if (flips.length) moves.push({ index, flips });
  }
  return moves;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("reversi-app");
  root.innerHTML = `
    <div class="desk-app-toolbar reversi-toolbar">
      <label>Opponent <select data-reversi-mode aria-label="Opponent"><option value="local">Local · 2 players</option><option value="computer">Computer · you play black</option></select></label>
      <button type="button" data-reversi-new>New game</button>
    </div>
    <div class="reversi-body">
      <section class="reversi-table" aria-label="Reversi game">
        <div class="reversi-scoreboard" aria-label="Disc counts">
          <div class="reversi-score" data-reversi-player="1"><i class="reversi-disc is-black" aria-hidden="true"></i><span>Black <small data-reversi-black-name>Player 1</small></span><output data-reversi-black aria-label="Black discs">2</output></div>
          <div class="reversi-score" data-reversi-player="2"><i class="reversi-disc is-white" aria-hidden="true"></i><span>White <small data-reversi-white-name>Player 2</small></span><output data-reversi-white aria-label="White discs">2</output></div>
        </div>
        <div class="reversi-board" role="grid" aria-label="Reversi board" aria-rowcount="8" aria-colcount="8" aria-describedby="reversi-keyboard-help" data-reversi-board></div>
        <p class="reversi-board-caption"><span><i aria-hidden="true"></i> Legal move</span><span data-reversi-empty>60 empty squares</span></p>
      </section>
      <aside class="reversi-guide">
        <p class="reversi-eyebrow">8 × 8 · Reversi</p>
        <h2 data-reversi-turn>Black to play</h2>
        <p class="reversi-move-count" data-reversi-moves>4 legal moves</p>
        <p>Bracket your opponent’s discs between your new disc and one of your own. Every captured line flips, including diagonals.</p>
        <p>If a player has no legal move, their turn passes automatically. When neither can move, the most discs wins.</p>
        <p id="reversi-keyboard-help" class="reversi-keyboard-help">Arrow keys move around the board. Enter or Space plays a disc.</p>
        <p class="reversi-computer-help" data-reversi-computer-help hidden>The computer takes corners first, then the move that flips the most discs.</p>
      </aside>
    </div>
    <p class="desk-app-status reversi-status" role="status" aria-live="polite" data-reversi-status>Black starts. Choose a dotted square.</p>
  `;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const boardElement = find<HTMLElement>("[data-reversi-board]");
  const mode = find<HTMLSelectElement>("[data-reversi-mode]");
  const status = find<HTMLElement>("[data-reversi-status]");
  const panel = root.closest<HTMLElement>(".utility-window");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  let board = opening();
  let player: Player = 1;
  let legalMoves = movesFor(board, player);
  let finished = false;
  let cursor = 19;
  let lastMove = -1;
  let disposed = false;
  let computerTimer: ReturnType<typeof setTimeout> | undefined;
  const cells: HTMLButtonElement[] = [];

  for (let row = 0; row < 8; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "reversi-row";
    rowElement.setAttribute("role", "row");
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "reversi-cell";
      button.dataset.reversiCell = coordinate(index);
      button.dataset.index = String(index);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-rowindex", String(row + 1));
      button.setAttribute("aria-colindex", String(col + 1));
      const disc = document.createElement("span");
      disc.className = "reversi-disc";
      disc.setAttribute("aria-hidden", "true");
      button.append(disc);
      rowElement.append(button);
      cells.push(button);
    }
    boardElement.append(rowElement);
  }

  const computerTurn = () =>
    mode.value === "computer" && player === 2 && !finished;
  const isVisible = () => !document.hidden && !root.hidden && !panel?.hidden;

  function cancelComputer() {
    if (computerTimer !== undefined) clearTimeout(computerTimer);
    computerTimer = undefined;
  }

  function scheduleComputer() {
    cancelComputer();
    if (disposed || !isVisible() || !computerTurn()) return;
    computerTimer = setTimeout(() => {
      computerTimer = undefined;
      if (disposed || !isVisible() || !computerTurn()) return;
      const ranked = [...legalMoves].sort((a, b) => {
        const value = (move: Move) =>
          ([0, 7, 56, 63].includes(move.index) ? 100 : 0) + move.flips.length;
        return value(b) - value(a) || a.index - b.index;
      });
      if (ranked[0]) playMove(ranked[0]);
    }, 450);
  }

  function render() {
    const black = board.filter((value) => value === 1).length;
    const white = board.filter((value) => value === 2).length;
    const computer = computerTurn();
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index];
      const value = board[index];
      const move = legalMoves.find((candidate) => candidate.index === index);
      cell.dataset.disc =
        value === 1 ? "black" : value === 2 ? "white" : "empty";
      cell.dataset.legal = String(!!move && !finished);
      cell.classList.toggle("is-last", index === lastMove);
      cell.classList.toggle("is-legal", !!move && !finished);
      cell.tabIndex = index === cursor ? 0 : -1;
      cell.setAttribute("aria-disabled", String(finished || computer || !move));
      const contents = value ? nameOf(value).toLowerCase() : "empty";
      const hint =
        move && !finished
          ? `, legal move, flips ${move.flips.length} ${move.flips.length === 1 ? "disc" : "discs"}`
          : "";
      cell.setAttribute(
        "aria-label",
        `${coordinate(index)}, ${contents}${hint}${index === lastMove ? ", last move" : ""}`,
      );
    }
    find<HTMLOutputElement>("[data-reversi-black]").value = String(black);
    find<HTMLOutputElement>("[data-reversi-white]").value = String(white);
    find<HTMLElement>("[data-reversi-black-name]").textContent =
      mode.value === "computer" ? "You" : "Player 1";
    find<HTMLElement>("[data-reversi-white-name]").textContent =
      mode.value === "computer" ? "Computer" : "Player 2";
    for (const score of root.querySelectorAll<HTMLElement>(
      "[data-reversi-player]",
    )) {
      score.classList.toggle(
        "is-turn",
        !finished && Number(score.dataset.reversiPlayer) === player,
      );
    }
    find<HTMLElement>("[data-reversi-empty]").textContent =
      `${64 - black - white} empty squares`;
    const winner =
      black === white
        ? "It’s a draw"
        : `${black > white ? "Black" : "White"} wins`;
    find<HTMLElement>("[data-reversi-turn]").textContent = finished
      ? winner
      : computer
        ? "Computer’s turn"
        : `${nameOf(player)} to play`;
    find<HTMLElement>("[data-reversi-moves]").textContent = finished
      ? `Final score · ${black}–${white}`
      : `${legalMoves.length} legal ${legalMoves.length === 1 ? "move" : "moves"}`;
    find<HTMLElement>("[data-reversi-computer-help]").hidden =
      mode.value !== "computer";
    boardElement.dataset.turn = finished
      ? "finished"
      : nameOf(player).toLowerCase();
    boardElement.setAttribute("aria-busy", String(computer && isVisible()));
    if (finished)
      status.textContent = `Game over. ${winner}. Black ${black}, White ${white}. Start a new game to play again.`;
  }

  function playMove(move: Move) {
    const played = player;
    board[move.index] = played;
    for (const index of move.flips) board[index] = played;
    lastMove = move.index;
    player = other(played);
    legalMoves = movesFor(board, player);
    let message = `${nameOf(played)} played ${coordinate(move.index)} and flipped ${move.flips.length} ${move.flips.length === 1 ? "disc" : "discs"}.`;
    if (!legalMoves.length) {
      const returningMoves = movesFor(board, played);
      if (returningMoves.length) {
        message += ` ${nameOf(player)} has no legal move and passes. ${nameOf(played)} plays again.`;
        player = played;
        legalMoves = returningMoves;
      } else finished = true;
    } else message += ` ${nameOf(player)} to play.`;
    status.textContent = message;
    render();
    scheduleComputer();
  }

  function newGame() {
    cancelComputer();
    board = opening();
    player = 1;
    legalMoves = movesFor(board, player);
    finished = false;
    lastMove = -1;
    cursor = 19;
    status.textContent =
      mode.value === "computer"
        ? "New game. You play Black; the computer plays White. Choose a dotted square."
        : "New game. Black starts. Choose a dotted square.";
    render();
  }

  boardElement.addEventListener(
    "click",
    (event) => {
      const cell = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-index]",
      );
      if (!cell || !boardElement.contains(cell) || disposed) return;
      if (finished) return;
      if (computerTurn()) {
        status.textContent = "The computer is choosing a move. You play Black.";
        return;
      }
      const index = Number(cell.dataset.index);
      const move = legalMoves.find((candidate) => candidate.index === index);
      if (!move) {
        status.textContent = board[index]
          ? `${coordinate(index)} is occupied. Choose a dotted square.`
          : `${coordinate(index)} does not capture any discs. Choose a dotted square.`;
        return;
      }
      playMove(move);
    },
    events,
  );

  boardElement.addEventListener(
    "focusin",
    (event) => {
      const cell = event.target as HTMLButtonElement;
      if (cell.dataset.index === undefined) return;
      cursor = Number(cell.dataset.index);
      cells.forEach((button, index) => {
        button.tabIndex = index === cursor ? 0 : -1;
      });
    },
    events,
  );

  boardElement.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const cell = event.target as HTMLButtonElement;
      if (cell.dataset.index === undefined) return;
      const row = Math.floor(cursor / 8);
      const col = cursor % 8;
      const targets: Record<string, number> = {
        ArrowLeft: row * 8 + Math.max(0, col - 1),
        ArrowRight: row * 8 + Math.min(7, col + 1),
        ArrowUp: Math.max(0, row - 1) * 8 + col,
        ArrowDown: Math.min(7, row + 1) * 8 + col,
        Home: row * 8,
        End: row * 8 + 7,
      };
      if (targets[event.key] === undefined) return;
      event.preventDefault();
      cells[targets[event.key]].focus();
    },
    events,
  );

  find<HTMLButtonElement>("[data-reversi-new]").addEventListener(
    "click",
    newGame,
    events,
  );
  mode.addEventListener("change", newGame, events);
  function syncVisibility() {
    scheduleComputer();
    boardElement.setAttribute(
      "aria-busy",
      String(computerTurn() && isVisible()),
    );
  }
  document.addEventListener("visibilitychange", syncVisibility, events);
  const observer = new MutationObserver(syncVisibility);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (panel)
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  render();

  return () => {
    disposed = true;
    cancelComputer();
    controller.abort();
    observer.disconnect();
  };
}
