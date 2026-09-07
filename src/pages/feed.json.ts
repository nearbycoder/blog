import { getCollection } from "astro:content";
import {
  isArticlePublished,
  compareArticlesByPublishDateDesc,
} from "../lib/articles";
import { getImagePath } from "astro-opengraph-images";
export async function GET() {
  const site = new URL("https://nearbycoder.com");
  const articles = (await getCollection("articles"))
    .filter((e) => isArticlePublished(e))
    .sort(compareArticlesByPublishDateDesc);
  return new Response(
    JSON.stringify({
      version: "https://jsonfeed.org/version/1.1",
      title: "Nearbycoder writing",
      home_page_url: site.toString(),
      feed_url: new URL("/feed.json", site).toString(),
      language: "en-US",
      authors: [
        { name: "Josh Hamilton", url: new URL("/about/", site).toString() },
      ],
      items: articles.map((e) => {
        const url = new URL(`/articles/${e.id}/`, site);
        return {
          id: url.toString(),
          url: url.toString(),
          title: e.data.title,
          content_text: e.data.description,
          summary: e.data.description,
          date_published: new Date(
            e.data.publishedAt ?? e.data.date,
          ).toISOString(),
          tags: e.data.tags,
          image: getImagePath({ url, site }),
        };
      }),
    }),
    { headers: { "Content-Type": "application/feed+json; charset=utf-8" } },
  );
}
