import type { APIRoute } from "astro";
import { getTopics } from "../../lib/topics";
import { xml } from "../../lib/feed-xml";
export async function getStaticPaths() {
  return (await getTopics()).map((topic) => ({
    params: { topic: topic.slug },
    props: { topic },
  }));
}
export const GET: APIRoute = ({ props }) => {
  const { topic } = props;
  const home = `https://nearbycoder.com/topics/${topic.slug}/`,
    feed = `https://nearbycoder.com/feeds/${topic.slug}.xml`;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(topic.tag)} · Nearbycoder</title><link>${xml(home)}</link><description>Published stories about ${xml(topic.tag)}.</description><language>en-us</language><atom:link href="${xml(feed)}" rel="self" type="application/rss+xml"/>${topic.articles
      .map((e: any) => {
        const url = `https://nearbycoder.com/articles/${e.id}/`;
        return `<item><title>${xml(e.data.title)}</title><description>${xml(e.data.description)}</description><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(e.data.publishedAt ?? e.data.date).toUTCString()}</pubDate></item>`;
      })
      .join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
};
