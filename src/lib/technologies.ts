import { getCollection } from "astro:content";
export const technologySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export async function getTechnologies() {
  const projects = (await getCollection("projects"))
    .filter((e) => !e.data.draft)
    .sort(
      (a, b) =>
        b.data.year.localeCompare(a.data.year) ||
        a.data.title.localeCompare(b.data.title),
    );
  const names = [...new Set(projects.flatMap((e) => e.data.stack))].sort();
  const slugs = new Set<string>();
  return names.map((name) => {
    const slug = technologySlug(name);
    if (!slug || slugs.has(slug))
      throw Error(`Technology slug collision: ${name}`);
    slugs.add(slug);
    return {
      name,
      slug,
      projects: projects.filter((e) => e.data.stack.includes(name)),
    };
  });
}
