import { getCollection } from "astro:content";
import { isArticlePublished } from "../lib/articles";
export async function GET() {
  const entries = (await getCollection("articles")).filter((e) =>
    isArticlePublished(e),
  );
  return Response.json(
    entries.map((e) => ({
      id: e.id,
      title: e.data.title,
      description: e.data.description,
      text: (e.body ?? "")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]*>/g, " ")
        .replace(/[#*_`>]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    })),
  );
}
