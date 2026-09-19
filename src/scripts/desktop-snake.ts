import {
  COLS,
  newSnake,
  stepSnake,
  turnSnake,
  type Direction,
} from "../lib/games/snake";
import { mountCanvasGame } from "./desktop-game-host";
export function mountGame(root: HTMLElement, events: { signal: AbortSignal }) {
  let snake = newSnake(),
    elapsed = 0;
  return mountCanvasGame(
    root,
    events,
    "snake",
    "Snake",
    "Arrow keys or the direction buttons steer. Eat the coral squares; avoid walls and your tail.",
    [
      ["ArrowUp", "↑"],
      ["ArrowLeft", "←"],
      ["ArrowDown", "↓"],
      ["ArrowRight", "→"],
    ],
    {
      reset: () => {
        snake = newSnake();
        elapsed = 0;
      },
      key: (key) => turnSnake(snake, key as Direction),
      step: (seconds) => {
        elapsed += seconds;
        const interval = Math.max(0.075, 0.16 - snake.score * 0.004);
        if (elapsed >= interval) {
          elapsed -= interval;
          stepSnake(snake);
        }
      },
      score: () => `Score ${snake.score}`,
      finished: () =>
        snake.status === "won"
          ? "Garden full. You win!"
          : snake.status === "lost"
            ? "Game over"
            : undefined,
      draw: (ctx) => {
        ctx.fillStyle = "#0a191e";
        ctx.fillRect(0, 0, 480, 360);
        ctx.strokeStyle = "#142b31";
        ctx.lineWidth = 1;
        for (let x = 0; x <= 480; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 360);
          ctx.stroke();
        }
        for (let y = 0; y <= 360; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(480, y);
          ctx.stroke();
        }
        if (snake.food >= 0) {
          ctx.fillStyle = "#ff9980";
          ctx.fillRect(
            (snake.food % COLS) * 20 + 4,
            Math.floor(snake.food / COLS) * 20 + 4,
            12,
            12,
          );
        }
        snake.body.forEach((cell, i) => {
          ctx.fillStyle = i === 0 ? "#d2fbe4" : "#72d7ae";
          ctx.fillRect(
            (cell % COLS) * 20 + 2,
            Math.floor(cell / COLS) * 20 + 2,
            16,
            16,
          );
        });
      },
    },
  );
}
