import { getCollection } from "astro:content";
import { isArticlePublished } from "../lib/articles";
import { getImagePath } from "astro-opengraph-images";
export async function GET() {
  const site = new URL("https://nearbycoder.com");
  const posts = (await getCollection("articles"))
    .filter((entry) => isArticlePublished(entry))
    .map((entry) => {
      const url = new URL(`/articles/${entry.id}/`, site);
      return {
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        publishedAt: entry.data.publishedAt ?? entry.data.date,
        url: url.toString(),
        image: getImagePath({ url, site }),
      };
    });
  return Response.json(posts);
}
