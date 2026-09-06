import { Resend, type ListBroadcastsResponseSuccess } from "resend";
import { createHash } from "node:crypto";
import baseline from "../data/newsletter-baseline.json" with { type: "json" };
import {
  rateLimited,
  emailShell,
  escapeHtml,
  type NewsletterConfig,
  type MailClient,
} from "./newsletter.js";
export type NewsletterPost = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  image: string;
};
export const broadcastName = (id: string) =>
  `nearbycoder-post-${createHash("sha256").update(id).digest("hex").slice(0, 32)}`;
export function eligiblePosts(
  input: unknown,
  now = Date.now(),
): NewsletterPost[] {
  if (!Array.isArray(input)) throw new Error("Invalid newsletter feed");
  const unique = new Map<string, NewsletterPost>();
  for (const post of input) {
    if (
      !post ||
      typeof post !== "object" ||
      typeof post.id !== "string" ||
      !/^[a-z0-9][a-z0-9-]{0,199}$/.test(post.id) ||
      typeof post.title !== "string" ||
      typeof post.description !== "string" ||
      typeof post.publishedAt !== "string" ||
      typeof post.url !== "string" ||
      typeof post.image !== "string"
    )
      throw new Error("Invalid newsletter post");
    if (
      post.url !== `https://nearbycoder.com/articles/${post.id}/` ||
      !post.image.startsWith("https://nearbycoder.com/") ||
      !Number.isFinite(Date.parse(post.publishedAt))
    )
      throw new Error("Invalid newsletter post URL or date");
    if (!baseline.includes(post.id) && Date.parse(post.publishedAt) <= now)
      unique.set(post.id, post);
  }
  return [...unique.values()].sort(
    (a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt),
  );
}
export function postEmail(post: NewsletterPost) {
  const unsubscribe = "{{{RESEND_UNSUBSCRIBE_URL}}}";
  return {
    subject: post.title,
    html: emailShell(
      post.title,
      `<p><img src="${escapeHtml(post.image)}" alt="" width="532" style="display:block;width:100%;max-width:532px;height:auto;border-radius:6px"></p><p>${escapeHtml(post.description)}</p><p><a href="${escapeHtml(post.url)}" style="display:inline-block;background:#2743d9;color:white;padding:12px 20px;border-radius:6px;text-decoration:none">Read the post</a></p>`,
      `Josh Hamilton · Nearbycoder<br>You received this because you confirmed your subscription.<br><a href="${unsubscribe}">Unsubscribe or manage preferences</a>`,
    ),
    text: `${post.title}\n\n${post.description}\n\nRead the post: ${post.url}\n\nJosh Hamilton · Nearbycoder\nUnsubscribe or manage preferences: ${unsubscribe}`,
  };
}
export async function publishPosts(
  posts: NewsletterPost[],
  config: NewsletterConfig,
  client: MailClient = new Resend(config.apiKey),
) {
  let after: string | undefined;
  const broadcasts: ListBroadcastsResponseSuccess["data"] = [];
  for (let page = 0; page < 100; page++) {
    const result = await rateLimited(() =>
      client.broadcasts.list({ limit: 100, ...(after ? { after } : {}) }),
    );
    if (result.error) throw new Error("Could not read the broadcast ledger");
    broadcasts.push(...result.data.data);
    if (!result.data.has_more) break;
    after = result.data.data.at(-1)?.id;
    if (!after || page === 99)
      throw new Error("Could not finish reading the broadcast ledger");
  }
  let sent = 0;
  for (const post of posts) {
    const name = broadcastName(post.id);
    let existing = broadcasts.find(
      (b) => b.name === name && b.segment_id === config.segmentId,
    );
    if (existing && existing.status !== "draft") continue;
    if (sent >= 3) break;
    let id = existing?.id;
    if (!id) {
      const result = await rateLimited(() =>
        client.broadcasts.create({
          name,
          segmentId: config.segmentId,
          topicId: config.topicId,
          from: config.from,
          ...postEmail(post),
          send: false,
        }),
      );
      if (result.error)
        throw new Error("Could not create the post notification");
      id = result.data.id;
    }
    // Reuse the provider's persistent draft ID on retries; never recreate a sent job.
    const result = await rateLimited(() => client.broadcasts.send(id!));
    if (result.error) throw new Error("Could not send the post notification");
    sent++;
  }
  return { sent };
}
