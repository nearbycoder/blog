import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { Resend } from "resend";
export type NewsletterConfig = {
  apiKey: string;
  from: string;
  secret: string;
  segmentId: string;
  topicId: string;
  origin: string;
};
export const confirmationProperty = "nearbycoder_confirmed_at";
export function getConfig(
  env: NodeJS.ProcessEnv = process.env,
): NewsletterConfig | null {
  if (env.NEWSLETTER_ENABLED !== "true") return null;
  const {
    RESEND_API_KEY: apiKey,
    NEWSLETTER_FROM: from,
    NEWSLETTER_TOKEN_SECRET: secret,
    RESEND_SEGMENT_ID: segmentId,
    RESEND_TOPIC_ID: topicId,
  } = env;
  if (
    !apiKey ||
    !from ||
    !secret ||
    secret.length < 32 ||
    !segmentId ||
    !topicId
  )
    return null;
  const origin =
    env.VERCEL_ENV === "preview" && env.VERCEL_URL
      ? `https://${env.VERCEL_URL}`
      : "https://www.nearbycoder.com";
  return { apiKey, from, secret, segmentId, topicId, origin };
}
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  return email.length <= 254 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)
    ? email
    : null;
}
type Confirmation = {
  email: string;
  issued: number;
  expires: number;
  topic: string;
};
export function createToken(
  email: string,
  config: NewsletterConfig,
  now = Date.now(),
): string {
  const iv = randomBytes(12),
    key = createHash("sha256").update(config.secret).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data: Confirmation = {
    email,
    issued: now,
    expires: now + 60 * 60 * 1000,
    topic: config.topicId,
  };
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}
export function readToken(
  token: unknown,
  config: NewsletterConfig,
  now = Date.now(),
): Confirmation | null {
  if (
    typeof token !== "string" ||
    token.length > 2048 ||
    !/^[A-Za-z0-9_-]+$/.test(token)
  )
    return null;
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 30) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      createHash("sha256").update(config.secret).digest(),
      raw.subarray(0, 12),
    );
    decipher.setAuthTag(raw.subarray(12, 28));
    const data = JSON.parse(
      Buffer.concat([
        decipher.update(raw.subarray(28)),
        decipher.final(),
      ]).toString("utf8"),
    );
    if (
      !normalizeEmail(data.email) ||
      !Number.isFinite(data.issued) ||
      !Number.isFinite(data.expires) ||
      data.issued > now ||
      data.expires <= now ||
      data.expires - data.issued !== 3600000 ||
      data.topic !== config.topicId
    )
      return null;
    return data;
  } catch {
    return null;
  }
}
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
export function emailShell(
  title: string,
  content: string,
  footer: string,
): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f8f9fb;color:#19202b;font-family:Arial,sans-serif"><div style="max-width:580px;margin:auto;padding:40px 24px"><p style="font-size:12px;letter-spacing:2px;color:#2743d9">NEARBYCODER</p><h1 style="font-size:32px;line-height:1.2;letter-spacing:-1px">${escapeHtml(title)}</h1><div style="font-size:16px;line-height:1.8">${content}</div><hr style="border:0;border-top:1px solid #d6dbe4;margin:32px 0"><p style="font-size:12px;line-height:1.7;color:#596270">${footer}</p></div></body></html>`;
}
export function confirmationEmail(url: string) {
  return {
    subject: "Confirm your subscription to Nearbycoder",
    html: emailShell(
      "One more step.",
      `<p>Confirm that you’d like new posts from Josh Hamilton in your inbox.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#2743d9;color:white;padding:12px 20px;border-radius:6px;text-decoration:none">Confirm my subscription</a></p><p>This link expires in one hour.</p>`,
      `If you didn’t request this, you can ignore this email. You haven’t been added to the newsletter. <a href="https://www.nearbycoder.com">Nearbycoder</a>`,
    ),
    text: `Confirm your subscription to Nearbycoder\n\nOpen this link and select Confirm subscription:\n${url}\n\nThis link expires in one hour. If you didn’t request this, ignore this email. You haven’t been added to the newsletter.`,
  };
}
export function json(
  message: string,
  status = 200,
  extra: Record<string, unknown> = {},
) {
  return Response.json(
    { message, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
export async function formBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("content-length")) > 8192) return null;
  // Bound the stream even when a client omits Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const value = JSON.parse(text);
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : null;
    }
    if (
      request.headers
        .get("content-type")
        ?.includes("application/x-www-form-urlencoded")
    )
      return Object.fromEntries(new URLSearchParams(text));
  } catch {}
  return null;
}
export function sameOrigin(
  request: Request,
  config: NewsletterConfig,
): boolean {
  const origin = request.headers.get("origin");
  return (
    origin === new URL(request.url).origin &&
    (origin === config.origin ||
      (new URL(config.origin).hostname.endsWith(".vercel.app") &&
        new URL(origin).hostname.endsWith(".vercel.app")) ||
      origin === "https://nearbycoder.com" ||
      origin === "https://www.nearbycoder.com")
  );
}
const attempts = new Map<string, { count: number; reset: number }>();
function allowAttempt(request: Request, now: number): boolean {
  const ip =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "local";
  const key = createHash("sha256").update(ip).digest("hex");
  const previous = attempts.get(key);
  if (attempts.size > 5000)
    for (const [key, value] of attempts)
      if (value.reset < now) attempts.delete(key);
  if (attempts.size > 10000) return false;
  if (!previous || previous.reset < now) {
    attempts.set(key, { count: 1, reset: now + 60000 });
    return true;
  }
  return ++previous.count <= 8;
}
export type MailClient = Pick<Resend, "emails" | "contacts" | "broadcasts">;
export async function signup(
  request: Request,
  config: NewsletterConfig | null,
  client?: MailClient,
  now = Date.now(),
): Promise<Response> {
  if (request.method !== "POST") return json("Use the subscription form.", 405);
  if (!config)
    return json(
      "Email signup is temporarily unavailable. Please use the RSS feed or try again later.",
      503,
    );
  if (!sameOrigin(request, config))
    return json("Please submit the form from this website.", 403);
  if (!allowAttempt(request, now))
    return json("Too many requests. Please wait a minute and try again.", 429);
  const body = await formBody(request);
  const email = normalizeEmail(body?.email);
  if (!body || !email || body.consent !== "yes")
    return json(
      "Enter a valid email address and agree to receive new posts.",
      400,
    );
  if (body.website)
    return json("Please check your inbox for a confirmation link.");
  const resend = client ?? new Resend(config.apiKey);
  const token = createToken(email, config, now);
  const url = `${config.origin}/subscribe/confirm/#token=${token}`;
  const key = createHash("sha256")
    .update(`${config.topicId}:${email}:${Math.floor(now / 600000)}`)
    .digest("hex");
  try {
    const result = await rateLimited(() =>
      resend.emails.send(
        { from: config.from, to: email, ...confirmationEmail(url) },
        { idempotencyKey: `signup/${key}` },
      ),
    );
    // A repeated request in this ten-minute window has a different encrypted token,
    // but Resend already accepted the first confirmation email for this key.
    if (result.error && result.error.name !== "invalid_idempotent_request")
      return json(
        "We couldn’t send your confirmation email. Please try again shortly.",
        502,
      );
    if (!request.headers.get("accept")?.includes("application/json"))
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/subscribe/check-email/",
          "Cache-Control": "no-store",
        },
      });
    return json(
      "Check your inbox and confirm your email. You won’t receive posts until you do.",
      200,
      { ok: true },
    );
  } catch {
    return json(
      "The email service is unavailable. Please try again shortly.",
      502,
    );
  }
}
export async function confirm(
  request: Request,
  config: NewsletterConfig | null,
  client?: MailClient,
  now = Date.now(),
): Promise<Response> {
  if (request.method !== "POST")
    return json(
      "Open your confirmation email and use its confirmation button.",
      405,
    );
  if (!config)
    return json(
      "Confirmation is temporarily unavailable. Please try again later.",
      503,
    );
  if (!sameOrigin(request, config))
    return json("Please confirm from the link in your email.", 403);
  const body = await formBody(request);
  const token = readToken(body?.token, config, now);
  if (!token)
    return json(
      "This confirmation link is invalid or has expired. Please request a new one.",
      400,
    );
  try {
    const resend = client ?? new Resend(config.apiKey);
    const existing = await rateLimited(() => resend.contacts.get(token.email));
    if (existing.error && existing.error.name !== "not_found")
      return json(
        "We couldn’t verify your subscription. Please try again shortly.",
        502,
      );
    if (existing.data?.unsubscribed)
      return json(
        "This address has opted out of all emails. Use the preferences link in a previous email to change that setting before subscribing again.",
        409,
      );
    const confirmedAt = Number(
      existing.data?.properties?.[confirmationProperty]?.value ?? 0,
    );
    if (confirmedAt >= token.issued)
      return json(
        "This link has already been used. If you unsubscribed, request a fresh link to subscribe again.",
        200,
        { used: true },
      );
    const result = await rateLimited(() =>
      resend.contacts.create({
        email: token.email,
        properties: { [confirmationProperty]: token.issued },
        segments: [{ id: config.segmentId }],
        topics: [{ id: config.topicId, subscription: "opt_in" }],
      }),
    );
    if (result.error)
      return json(
        "We couldn’t finish your subscription. Please try this link again shortly.",
        502,
      );
    return json(
      "You’re subscribed. The next new post will arrive in your inbox. Every update includes an unsubscribe link.",
      200,
      { ok: true },
    );
  } catch {
    return json(
      "The email service is unavailable. Please try again shortly.",
      502,
    );
  }
}
export function authorizedCron(request: Request, secret: string | undefined) {
  if (!secret) return false;
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}

export async function rateLimited<T extends { error: { name: string } | null }>(
  call: () => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const result = await call();
    if (result.error?.name !== "rate_limit_exceeded" || attempt === 2)
      return result;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}
