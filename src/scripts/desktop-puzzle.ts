import {
  puzzleNeighbors,
  puzzleSolved,
  shufflePuzzle,
  slideTile,
} from "../lib/games/puzzle";
import css from "../styles/desktop-classics.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("classics", css);
export function mountGame(root: HTMLElement, events: { signal: AbortSignal }) {
  const panel = root.querySelector<HTMLElement>(
    '[data-arcade-panel="puzzle"]',
  )!;
  panel.innerHTML = `
    <div class="game-heading"><h3>15 Puzzle</h3><button class="arcade-button" type="button" data-puzzle-reset>Shuffle tiles</button></div>
    <p class="game-instructions" id="puzzle-help">Put 1–15 in order, with the gap at the bottom right. Select a tile next to the gap to slide it. Arrow keys move the gap.</p>
    <div class="sliding-board" role="group" aria-label="Sliding tiles" aria-describedby="puzzle-help"></div>
    <div class="classic-toolbar"><button class="arcade-button" type="button" data-puzzle-undo disabled>Undo move</button><span class="classic-caption">One gap. Fifteen possibilities.</span></div>
    <p class="game-status" data-puzzle-status role="status"></p>`;
  const board = panel.querySelector<HTMLElement>(".sliding-board")!;
  const status = panel.querySelector<HTMLElement>("[data-puzzle-status]")!;
  const undo = panel.querySelector<HTMLButtonElement>("[data-puzzle-undo]")!;
  let tiles = shufflePuzzle();
  const history: number[][] = [];
  const cells = Array.from({ length: 16 }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.tile = String(index);
    board.append(button);
    return button;
  });
  function render() {
    const won = puzzleSolved(tiles);
    const neighbors = puzzleNeighbors(tiles.indexOf(0));
    cells.forEach((button, i) => {
      const tile = tiles[i];
      button.textContent = tile ? String(tile) : "";
      button.dataset.empty = String(!tile);
      button.dataset.correct = String(tile === i + 1);
      button.setAttribute(
        "aria-label",
        tile
          ? `Tile ${tile}, row ${Math.floor(i / 4) + 1}, column ${(i % 4) + 1}`
          : "Empty space",
      );
      button.setAttribute(
        "aria-disabled",
        String(won || !neighbors.includes(i)),
      );
      button.tabIndex = i === neighbors[0] ? 0 : -1;
    });
    undo.disabled = !history.length;
    status.textContent = `${history.length} ${history.length === 1 ? "move" : "moves"} · ${won ? "All in order. You solved it!" : "Slide a tile into the gap."}`;
  }
  function move(index: number) {
    if (puzzleSolved(tiles)) return;
    const before = [...tiles];
    if (slideTile(tiles, index)) {
      history.push(before);
      render();
      cells[before.indexOf(0)].focus({ preventScroll: true });
    }
  }
  board.addEventListener(
    "click",
    (event) => {
      const cell = (event.target as Element).closest<HTMLElement>(
        "[data-tile]",
      );
      if (cell) move(Number(cell.dataset.tile));
    },
    events,
  );
  board.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const offsets: Record<string, number> = {
        ArrowUp: -4,
        ArrowDown: 4,
        ArrowLeft: -1,
        ArrowRight: 1,
      };
      if (!(event.key in offsets)) return;
      event.preventDefault();
      move(tiles.indexOf(0) + offsets[event.key]);
    },
    events,
  );
  undo.addEventListener(
    "click",
    () => {
      if (history.length) {
        tiles = history.pop()!;
        render();
      }
    },
    events,
  );
  panel.querySelector("[data-puzzle-reset]")!.addEventListener(
    "click",
    () => {
      tiles = shufflePuzzle();
      history.length = 0;
      render();
    },
    events,
  );
  render();
  return () => {
    history.length = 0;
  };
}
