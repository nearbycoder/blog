import { getCollection } from "astro:content";
import { isArticlePublished } from "./articles";
import { readingPaths } from "../data/reading-paths";

export async function getReadingPaths() {
  const articles = await getCollection("articles");
  return readingPaths
    .map((path) => ({
      ...path,
      entries: path.articles.flatMap((item) => {
        const entry = articles.find((article) => article.id === item.id);
        if (!entry) throw new Error(`Missing reading-path article: ${item.id}`);
        return isArticlePublished(entry, {
          includeScheduled: !import.meta.env.PROD,
        })
          ? [{ entry, note: item.note }]
          : [];
      }),
    }))
    .filter((path) => path.entries.length > 0);
}
