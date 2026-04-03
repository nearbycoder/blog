import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { site as siteMeta } from "../data/site";
import { compareArticlesByPublishDateDesc, isArticlePublished } from "../lib/articles";

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function resolvePubDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = ISO_DATE_ONLY.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export const GET: APIRoute = async ({ site: astroSite }) => {
  const includeScheduled = !import.meta.env.PROD;
  const siteUrl = astroSite ?? new URL("https://nearbycoder.com");
  const feedUrl = new URL("/rss.xml", siteUrl).toString();

  const articles = ((await getCollection("articles")) as any[])
    .filter((entry) => isArticlePublished(entry, { includeScheduled }))
    .sort((a, b) => compareArticlesByPublishDateDesc(a, b));

  const publishedDates = articles
    .map((entry) => resolvePubDate(entry.data.publishedAt ?? entry.data.date))
    .filter((value): value is Date => Boolean(value));
  const lastBuildDate = publishedDates[0] ?? new Date();

  const items = articles
    .map((entry) => {
      const articleUrl = new URL(`/articles/${entry.id}`, siteUrl).toString();
      const pubDate = resolvePubDate(entry.data.publishedAt ?? entry.data.date) ?? lastBuildDate;

      return [
        "    <item>",
        `      <title>${escapeXml(entry.data.title)}</title>`,
        `      <description>${escapeXml(entry.data.description)}</description>`,
        `      <link>${escapeXml(articleUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>`,
        `      <pubDate>${pubDate.toUTCString()}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Nearbycoder Articles</title>",
    `    <description>${escapeXml(siteMeta.description)}</description>`,
    `    <link>${escapeXml(siteUrl.toString())}</link>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    "    <language>en-us</language>",
    `    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
