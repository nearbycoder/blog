/** Turn-based games: no background loops, network calls, or persistent state. */
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const SWEEP_SIZE = 8;
export const SWEEP_BUGS = 10;
export type SweepCell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  nearby: number;
};
export type SweepBoard = {
  cells: SweepCell[];
  status: "ready" | "playing" | "won" | "lost";
};
export function newSweep(): SweepBoard {
  return {
    status: "ready",
    cells: Array.from({ length: SWEEP_SIZE ** 2 }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      nearby: 0,
    })),
  };
}
export function neighbors(index: number): number[] {
  const row = Math.floor(index / SWEEP_SIZE),
    col = index % SWEEP_SIZE;
  const result: number[] = [];
  for (
    let y = Math.max(0, row - 1);
    y <= Math.min(SWEEP_SIZE - 1, row + 1);
    y++
  ) {
    for (
      let x = Math.max(0, col - 1);
      x <= Math.min(SWEEP_SIZE - 1, col + 1);
      x++
    ) {
      if (y !== row || x !== col) result.push(y * SWEEP_SIZE + x);
    }
  }
  return result;
}
export function flagCell(board: SweepBoard, index: number) {
  const cell = board.cells[index];
  if (!cell || cell.revealed || ["won", "lost"].includes(board.status)) return;
  if (
    !cell.flagged &&
    board.cells.filter((item) => item.flagged).length >= SWEEP_BUGS
  )
    return;
  cell.flagged = !cell.flagged;
}
export function revealCell(
  board: SweepBoard,
  index: number,
  random = Math.random,
) {
  const cell = board.cells[index];
  if (
    !cell ||
    cell.revealed ||
    cell.flagged ||
    ["won", "lost"].includes(board.status)
  )
    return;
  if (board.status === "ready") {
    const safe = new Set([index, ...neighbors(index)]);
    shuffled(
      board.cells.map((_, i) => i).filter((i) => !safe.has(i)),
      random,
    )
      .slice(0, SWEEP_BUGS)
      .forEach((i) => {
        board.cells[i].mine = true;
      });
    board.cells.forEach((item, i) => {
      item.nearby = neighbors(i).filter((n) => board.cells[n].mine).length;
    });
    board.status = "playing";
  }
  if (cell.mine) {
    cell.revealed = true;
    board.status = "lost";
    return;
  }
  const queue = [index];
  while (queue.length) {
    const current = queue.pop()!;
    const next = board.cells[current];
    if (next.revealed || next.flagged || next.mine) continue;
    next.revealed = true;
    if (next.nearby === 0) queue.push(...neighbors(current));
  }
  if (board.cells.every((item) => item.mine || item.revealed)) {
    board.status = "won";
    board.cells.forEach((item) => {
      if (item.mine) item.flagged = true;
    });
  }
}
