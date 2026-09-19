export const PADDLE_HEIGHT = 64,
  WIN_SCORE = 7;
export type Pong = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  player: number;
  computer: number;
  left: number;
  right: number;
  serve: number;
};
export function newPong(): Pong {
  return {
    x: 240,
    y: 180,
    vx: -215,
    vy: 100,
    player: 148,
    computer: 148,
    left: 0,
    right: 0,
    serve: 0.7,
  };
}
export const clampPaddle = (y: number) =>
  Math.max(0, Math.min(360 - PADDLE_HEIGHT, y));
export function stepPong(p: Pong, seconds: number, direction: number) {
  if (p.left >= WIN_SCORE || p.right >= WIN_SCORE) return;
  p.player = clampPaddle(p.player + direction * 300 * seconds);
  const distance = p.y - (p.computer + PADDLE_HEIGHT / 2);
  // Deliberately beatable: limited speed and a small dead zone.
  if (Math.abs(distance) > 10)
    p.computer = clampPaddle(
      p.computer +
        Math.sign(distance) * Math.min(Math.abs(distance), 155 * seconds),
    );
  if (p.serve > 0) {
    p.serve -= seconds;
    return;
  }
  const oldX = p.x;
  p.x += p.vx * seconds;
  p.y += p.vy * seconds;
  if (p.y < 6) {
    p.y = 12 - p.y;
    p.vy = Math.abs(p.vy);
  }
  if (p.y > 354) {
    p.y = 708 - p.y;
    p.vy = -Math.abs(p.vy);
  }
  const hitLeft =
    p.vx < 0 &&
    oldX >= 34 &&
    p.x <= 34 &&
    p.y >= p.player - 6 &&
    p.y <= p.player + PADDLE_HEIGHT + 6;
  const hitRight =
    p.vx > 0 &&
    oldX <= 446 &&
    p.x >= 446 &&
    p.y >= p.computer - 6 &&
    p.y <= p.computer + PADDLE_HEIGHT + 6;
  if (hitLeft || hitRight) {
    const paddle = hitLeft ? p.player : p.computer;
    p.x = hitLeft ? 34 : 446;
    p.vx = (hitLeft ? 1 : -1) * Math.min(390, Math.abs(p.vx) + 12);
    p.vy = ((p.y - (paddle + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 220;
  }
  if (p.x < -6 || p.x > 486) {
    const playerScored = p.x > 486;
    if (playerScored) p.left++;
    else p.right++;
    p.x = 240;
    p.y = 180;
    p.vx = playerScored ? 215 : -215;
    p.vy = (p.left + p.right) % 2 ? -100 : 100;
    p.serve = 0.9;
  }
}
