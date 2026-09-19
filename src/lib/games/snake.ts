export const COLS = 24,
  ROWS = 18;
export type Direction = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
export type Snake = {
  body: number[];
  direction: Direction;
  next: Direction;
  food: number;
  status: "playing" | "lost" | "won";
  score: number;
};
const delta = { ArrowUp: -COLS, ArrowDown: COLS, ArrowLeft: -1, ArrowRight: 1 };
export function placeFood(body: number[], random = Math.random) {
  const empty = Array.from({ length: COLS * ROWS }, (_, i) => i).filter(
    (i) => !body.includes(i),
  );
  return empty.length ? empty[Math.floor(random() * empty.length)] : -1;
}
export function newSnake(): Snake {
  const head = COLS * 9 + 8;
  const body = [head, head - 1, head - 2];
  return {
    body,
    direction: "ArrowRight",
    next: "ArrowRight",
    food: head + 5,
    status: "playing",
    score: 0,
  };
}
export function turnSnake(snake: Snake, key: Direction) {
  // Only one turn per tick: rapid input cannot reverse through the neck.
  if (snake.next === snake.direction && delta[key] !== -delta[snake.direction])
    snake.next = key;
}
export function stepSnake(snake: Snake, random = Math.random) {
  if (snake.status !== "playing") return;
  snake.direction = snake.next;
  const head = snake.body[0],
    next = head + delta[snake.direction];
  const eating = next === snake.food;
  const wall =
    next < 0 ||
    next >= COLS * ROWS ||
    (snake.direction === "ArrowLeft" && head % COLS === 0) ||
    (snake.direction === "ArrowRight" && head % COLS === COLS - 1);
  if (wall || snake.body.slice(0, eating ? undefined : -1).includes(next)) {
    snake.status = "lost";
    return;
  }
  snake.body.unshift(next);
  if (eating) {
    snake.score++;
    snake.food = placeFood(snake.body, random);
    if (snake.food === -1) snake.status = "won";
  } else snake.body.pop();
}
