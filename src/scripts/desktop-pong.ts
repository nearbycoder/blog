import {
  clampPaddle,
  newPong,
  PADDLE_HEIGHT,
  stepPong,
  WIN_SCORE,
} from "../lib/games/pong";
import { mountCanvasGame } from "./desktop-game-host";
export function mountGame(root: HTMLElement, events: { signal: AbortSignal }) {
  let pong = newPong();
  return mountCanvasGame(
    root,
    events,
    "pong",
    "Pong",
    "You are the left paddle. Use ↑ / ↓ or hold the buttons. First to seven wins.",
    [
      ["ArrowUp", "↑"],
      ["ArrowDown", "↓"],
    ],
    {
      reset: () => {
        pong = newPong();
      },
      key: (key) => {
        pong.player = clampPaddle(pong.player + (key === "ArrowUp" ? -18 : 18));
      },
      step: (seconds, held) =>
        stepPong(
          pong,
          seconds,
          Number(held.has("ArrowDown")) - Number(held.has("ArrowUp")),
        ),
      score: () => `You ${pong.left} · Computer ${pong.right}`,
      finished: () =>
        pong.left >= WIN_SCORE
          ? "You win!"
          : pong.right >= WIN_SCORE
            ? "Computer wins"
            : undefined,
      draw: (ctx) => {
        ctx.fillStyle = "#0a191e";
        ctx.fillRect(0, 0, 480, 360);
        ctx.strokeStyle = "#2f5359";
        ctx.setLineDash([5, 9]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(240, 0);
        ctx.lineTo(240, 360);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "36px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#638d90";
        ctx.fillText(String(pong.left), 186, 52);
        ctx.fillText(String(pong.right), 294, 52);
        ctx.fillStyle = "#9bedc8";
        ctx.fillRect(18, pong.player, 10, PADDLE_HEIGHT);
        ctx.fillStyle = "#ff9980";
        ctx.fillRect(452, pong.computer, 10, PADDLE_HEIGHT);
        ctx.fillStyle = "#effcf5";
        ctx.fillRect(pong.x - 6, pong.y - 6, 12, 12);
      },
    },
  );
}
