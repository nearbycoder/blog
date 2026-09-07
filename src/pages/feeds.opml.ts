import { getTopics } from "../lib/topics";
import { xml } from "../lib/feed-xml";
export async function GET() {
  const topics = await getTopics();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><opml version="2.0"><head><title>Nearbycoder feeds</title></head><body><outline text="All writing" type="rss" xmlUrl="https://nearbycoder.com/rss.xml" htmlUrl="https://nearbycoder.com/articles/"/>${topics.map((t) => `<outline text="${xml(t.tag)}" type="rss" xmlUrl="https://nearbycoder.com/feeds/${t.slug}.xml" htmlUrl="https://nearbycoder.com/topics/${t.slug}/"/>`).join("")}</body></opml>`,
    { headers: { "Content-Type": "text/x-opml; charset=utf-8" } },
  );
}
