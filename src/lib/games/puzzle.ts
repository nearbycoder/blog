export const solvedPuzzle = () => [
  ...Array.from({ length: 15 }, (_, i) => i + 1),
  0,
];
export const puzzleSolved = (tiles: number[]) =>
  tiles.every((tile, i) => tile === (i + 1) % 16);
export function puzzleNeighbors(blank: number) {
  return [
    blank - 4,
    blank + 4,
    ...(blank % 4 ? [blank - 1] : []),
    ...(blank % 4 < 3 ? [blank + 1] : []),
  ].filter((i) => i >= 0 && i < 16);
}
export function slideTile(tiles: number[], index: number) {
  const blank = tiles.indexOf(0);
  if (!puzzleNeighbors(blank).includes(index)) return false;
  [tiles[blank], tiles[index]] = [tiles[index], tiles[blank]];
  return true;
}
export function shufflePuzzle(random = Math.random) {
  const tiles = solvedPuzzle();
  let previous = -1;
  // Legal moves from the solved board guarantee every deal is solvable.
  for (let i = 0; i < 160; i++) {
    const blank = tiles.indexOf(0);
    const options = puzzleNeighbors(blank).filter(
      (index) => index !== previous,
    );
    slideTile(tiles, options[Math.floor(random() * options.length)]);
    previous = blank;
  }
  if (puzzleSolved(tiles)) slideTile(tiles, 14);
  return tiles;
}
