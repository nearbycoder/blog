import { getConfig, authorizedCron, json } from "../src/server/newsletter.js";
import {
  eligiblePosts,
  publishPosts,
} from "../src/server/newsletter-publisher.js";
export default {
  async fetch(request: Request) {
    if (request.method !== "GET") return json("Method not allowed.", 405);
    if (!authorizedCron(request, process.env.CRON_SECRET))
      return json("Unauthorized.", 401);
    const config = getConfig();
    if (!config || process.env.VERCEL_ENV !== "production")
      return json("Newsletter publishing is disabled.", 503);
    try {
      const response = await fetch(
        "https://www.nearbycoder.com/newsletter-feed.json",
        { cache: "no-store", signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw new Error("Feed unavailable");
      const posts = eligiblePosts(await response.json());
      const result = await publishPosts(posts, config);
      return json("Newsletter check complete.", 200, result);
    } catch {
      return json(
        "Newsletter publishing failed. Check Resend before retrying; existing drafts will be reused.",
        502,
      );
    }
  },
};
