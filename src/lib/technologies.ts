import { getPublishedWork, isGame } from "./work";
export const technologySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/#/g, "-sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export async function getTechnologies() {
  const work = (await getPublishedWork()).sort(
    (a, b) =>
      b.data.year.localeCompare(a.data.year) ||
      a.data.title.localeCompare(b.data.title),
  );
  const names = [...new Set(work.flatMap((e) => e.data.stack))].sort();
  const slugs = new Set<string>();
  return names.map((name) => {
    const slug = technologySlug(name);
    if (!slug || slugs.has(slug))
      throw Error(`Technology slug collision: ${name}`);
    slugs.add(slug);
    const entries = work.filter((e) => e.data.stack.includes(name));
    return {
      name,
      slug,
      entries,
      projects: entries.filter((e) => !isGame(e)),
      games: entries.filter(isGame),
    };
  });
}
/** "3 projects and 2 games", leaving out whichever is empty. */
export function describeTechnologyCount(technology: {
  projects: unknown[];
  games: unknown[];
}) {
  const count = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
  return [
    technology.projects.length && count(technology.projects.length, "project"),
    technology.games.length && count(technology.games.length, "game"),
  ]
    .filter(Boolean)
    .join(" and ");
}
