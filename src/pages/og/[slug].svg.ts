import { getCollection } from "astro:content";
import { renderOgSvg } from "../../lib/og";
import { isArticlePublished } from "../../lib/articles";

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
  const entries = (await getCollection("articles")) as any[];
  const includeScheduled = !import.meta.env.PROD;
  const entry = entries.find(
    (item) => item.slug === slug && isArticlePublished(item, { includeScheduled })
  );

  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  const footerParts = [entry.data.date, entry.data.readTime].filter(Boolean);
  const svg = renderOgSvg({
    title: entry.data.title,
    description: entry.data.description,
    eyebrow: "Article",
    tags: entry.data.tags ?? [],
    accent: entry.data.accent ?? "cyan",
    footer: footerParts.join(" | "),
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
