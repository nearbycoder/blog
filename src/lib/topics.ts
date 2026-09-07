import { getCollection } from "astro:content";
import {
  isArticlePublished,
  compareArticlesByPublishDateDesc,
} from "./articles";
export const topicSlug = (tag: string) => encodeURIComponent(tag.toLowerCase());
export async function getTopics() {
  const articles = (await getCollection("articles"))
    .filter((entry) => isArticlePublished(entry))
    .sort(compareArticlesByPublishDateDesc);
  return [...new Set(articles.flatMap((entry) => entry.data.tags))]
    .sort()
    .map((tag) => ({
      tag,
      slug: topicSlug(tag),
      articles: articles.filter((entry) => entry.data.tags.includes(tag)),
    }));
}
