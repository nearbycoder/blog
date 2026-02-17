import { getCollection } from "astro:content";
import { isArticlePublished } from "../../lib/articles";
import { renderCardArtSvg } from "../../lib/card-art";

export const prerender = true;

export async function getStaticPaths() {
  const includeScheduled = !import.meta.env.PROD;
  const entries = (await getCollection("articles")) as any[];
  return entries.filter((entry) => isArticlePublished(entry, { includeScheduled })).map((entry) => ({
    params: { slug: entry.slug },
  }));
}

export async function GET({ params }: { params: { slug?: string } }) {
  const slug = params.slug;
  const includeScheduled = !import.meta.env.PROD;
  const entries = (await getCollection("articles")) as any[];
  const entry = entries.find(
    (item) => item.slug === slug && isArticlePublished(item, { includeScheduled })
  );

  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  const svg = renderCardArtSvg({
    slug: entry.slug,
    tags: entry.data.tags ?? [],
    accent: entry.data.accent ?? "cyan",
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
