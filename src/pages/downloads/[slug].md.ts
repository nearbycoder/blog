import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { isArticlePublished } from "../../lib/articles";
export async function getStaticPaths() {
  return (await getCollection("articles"))
    .filter((e) => isArticlePublished(e))
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
export const GET: APIRoute = ({ props }) => {
  const { entry } = props;
  const canonical = `https://nearbycoder.com/articles/${entry.id}/`;
  const body = (entry.body ?? "").replace(
    /\]\(\/(?!\/)/g,
    "](https://nearbycoder.com/",
  );
  const text = `# ${entry.data.title}\n\nBy Josh Hamilton · ${entry.data.publishedAt ?? entry.data.date}\n\nSource: ${canonical}\n\n${entry.data.description}\n\n---\n\n${body}\n`;
  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entry.id}.md"`,
    },
  });
};
