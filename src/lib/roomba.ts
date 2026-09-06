export type Command = "forward" | "right";
export type Robot = {
  x: number;
  y: number;
  direction: number;
  cleaned: string[];
};
export const size = 6;
export const obstacles = ["2,1", "2,2", "4,3", "1,4"];
export const dirt = ["1,0", "3,0", "5,2", "3,3", "2,5"];
export const directions = ["east", "south", "west", "north"];
export const initialRobot = (): Robot => ({
  x: 0,
  y: 0,
  direction: 0,
  cleaned: [],
});
export function move(
  robot: Robot,
  command: Command,
): { robot: Robot; message: string } {
  if (command === "right")
    return {
      robot: { ...robot, direction: (robot.direction + 1) % 4 },
      message: "Turned right.",
    };
  const [dx, dy] = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ][robot.direction];
  const x = robot.x + dx,
    y = robot.y + dy;
  if (
    x < 0 ||
    y < 0 ||
    x >= size ||
    y >= size ||
    obstacles.includes(`${x},${y}`)
  )
    return { robot, message: "Blocked. Try a turn." };
  const key = `${x},${y}`;
  const clean = dirt.includes(key) && !robot.cleaned.includes(key);
  return {
    robot: {
      ...robot,
      x,
      y,
      cleaned: clean ? [...robot.cleaned, key] : robot.cleaned,
    },
    message: clean ? "Moved forward and cleaned a square." : "Moved forward.",
  };
}
