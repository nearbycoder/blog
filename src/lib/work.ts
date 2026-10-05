import { getCollection, type CollectionEntry } from "astro:content";

/** Projects and games share a shape and differ only in where they live. */
export type WorkEntry = CollectionEntry<"projects"> | CollectionEntry<"games">;

export const isGame = (entry: { collection: string }) =>
  entry.collection === "games";

/** The page for a project or game, e.g. /projects/agfs-dev or /games/pong. */
export const workHref = (entry: { id: string; collection: string }) =>
  `/${isGame(entry) ? "games" : "projects"}/${entry.id}`;

/** Every published project and game, for surfaces that list both. */
export async function getPublishedWork(): Promise<WorkEntry[]> {
  const [projects, games] = await Promise.all([
    getCollection("projects"),
    getCollection("games"),
  ]);
  return [...projects, ...games].filter((entry) => !entry.data.draft);
}

/** Look up a project or game by id, as labs and postmortems reference them. */
export async function findWork(id: string) {
  return (await getPublishedWork()).find((entry) => entry.id === id);
}

/** Newest repository first, then by year and title, as the archives sort. */
export const compareWorkByDate = (a: WorkEntry, b: WorkEntry) =>
  (b.data.createdAt ?? "").localeCompare(a.data.createdAt ?? "") ||
  b.data.year.localeCompare(a.data.year) ||
  a.data.title.localeCompare(b.data.title);
