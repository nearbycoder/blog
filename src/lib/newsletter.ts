/** The hosted signup provider owns enrollment, confirmations, and unsubscribe. */
export function resolveNewsletterUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  const message =
    "NEWSLETTER_SIGNUP_URL must be a public HTTPS signup page without credentials.";
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(message);
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname.includes(".") ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost")
  )
    throw new Error(message);
  if (
    ["nearbycoder.com", "www.nearbycoder.com"].includes(url.hostname) &&
    /^\/subscribe\/?$/.test(url.pathname)
  )
    throw new Error(
      "NEWSLETTER_SIGNUP_URL cannot point back to the blog subscription page.",
    );
  return url.toString();
}
