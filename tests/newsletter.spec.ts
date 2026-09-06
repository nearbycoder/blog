import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  signup,
  confirm,
  createToken,
  readToken,
  authorizedCron,
  type NewsletterConfig,
  type MailClient,
} from "../src/server/newsletter";
import {
  eligiblePosts,
  publishPosts,
  broadcastName,
  postEmail,
} from "../src/server/newsletter-publisher";
import baseline from "../src/data/newsletter-baseline.json" with { type: "json" };
const config: NewsletterConfig = {
  apiKey: "test",
  from: "Josh <newsletter@example.com>",
  secret: "test-secret-which-is-at-least-32-characters",
  segmentId: "segment",
  topicId: "topic",
  origin: "https://www.nearbycoder.com",
};
let requestId = 0;
function req(body: unknown, extra: Record<string, string> = {}) {
  return new Request(`${config.origin}/api/newsletter`, {
    method: "POST",
    headers: {
      origin: config.origin,
      "content-type": "application/json",
      accept: "application/json",
      "x-forwarded-for": String(++requestId),
      ...extra,
    },
    body: JSON.stringify(body),
  });
}
function fake() {
  const state = {
    sends: [] as any[],
    creates: [] as any[],
    contact: null as any,
    error: null as any,
    broadcasts: [] as any[],
    broadcastCreates: [] as any[],
    broadcastSends: [] as string[],
    failSend: false,
  };
  const client = {
    emails: {
      send: async (...args: any[]) => {
        state.sends.push(args);
        return { data: { id: "email" }, error: state.error };
      },
    },
    contacts: {
      get: async () =>
        state.contact
          ? { data: state.contact, error: null }
          : { data: null, error: { name: "not_found" } },
      create: async (body: any) => {
        state.creates.push(body);
        state.contact = {
          unsubscribed: false,
          properties: {
            nearbycoder_confirmed_at: {
              value: body.properties.nearbycoder_confirmed_at,
            },
          },
        };
        return { data: { id: "contact" }, error: state.error };
      },
    },
    broadcasts: {
      list: async () => ({
        data: { data: state.broadcasts, has_more: false },
        error: null,
      }),
      create: async (body: any) => {
        state.broadcastCreates.push(body);
        state.broadcasts.push({
          id: "broadcast",
          name: body.name,
          segment_id: body.segmentId,
          status: "draft",
        });
        return { data: { id: "broadcast" }, error: null };
      },
      send: async (id: string) => {
        state.broadcastSends.push(id);
        if (state.failSend)
          return { data: null, error: { name: "internal_server_error" } };
        state.broadcasts.find((b) => b.id === id).status = "sent";
        return { data: { id }, error: null };
      },
    },
  } as unknown as MailClient;
  return { state, client };
}
test("confirmation tokens are confidential, authenticated, scoped and expire", () => {
  const now = Date.now(),
    token = createToken("reader@example.com", config, now);
  expect(token).not.toContain("reader");
  expect(readToken(token, config, now)?.email).toBe("reader@example.com");
  expect(readToken(token, config, now + 3600000)).toBeNull();
  expect(readToken(token, config, now - 1)).toBeNull();
  expect(readToken(token.slice(0, -3) + "zzz", config, now)).toBeNull();
  expect(readToken(token, { ...config, secret: "different" }, now)).toBeNull();
  expect(readToken(token, { ...config, topicId: "other" }, now)).toBeNull();
  expect(
    authorizedCron(
      new Request(config.origin, { headers: { authorization: "Bearer cron" } }),
      "cron",
    ),
  ).toBe(true);
  expect(authorizedCron(new Request(config.origin), "cron")).toBe(false);
});
test("signup validates consent, origin, input size and honeypot before sending", async () => {
  const { state, client } = fake();
  for (const body of [
    { email: "bad", consent: "yes" },
    { email: "reader@example.com" },
    { email: "x".repeat(9000), consent: "yes" },
  ])
    expect((await signup(req(body), config, client)).status).toBe(400);
  expect(
    (
      await signup(
        req(
          { email: "reader@example.com", consent: "yes" },
          { origin: "https://evil.example" },
        ),
        config,
        client,
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await signup(
        req({ email: "reader@example.com", consent: "yes" }),
        null,
        client,
      )
    ).status,
  ).toBe(503);
  expect(
    (
      await signup(
        req({ email: "reader@example.com", consent: "yes", website: "bot" }),
        config,
        client,
      )
    ).status,
  ).toBe(200);
  expect(state.sends).toHaveLength(0);
  const now = Date.now();
  expect(
    (
      await signup(
        req({ email: " Reader@Example.com ", consent: "yes" }),
        config,
        client,
        now,
      )
    ).status,
  ).toBe(200);
  expect(state.sends[0][0].to).toBe("reader@example.com");
  expect(state.creates).toHaveLength(0);
  const link = state.sends[0][0].text.match(
    /https:\/\/\S+\/subscribe\/confirm\/#token=\S+/,
  )[0];
  expect(readToken(new URL(link).hash.slice(7), config, now)?.email).toBe(
    "reader@example.com",
  );
  const native = await signup(
    req(
      { email: "reader@example.com", consent: "yes" },
      { accept: "text/html" },
    ),
    config,
    client,
    now,
  );
  expect(native.status).toBe(303);
  expect(native.headers.get("location")).toBe("/subscribe/check-email/");
  expect(state.sends[1][1]).toEqual(state.sends[0][1]);
  state.error = { name: "invalid_idempotent_request" };
  expect(
    (
      await signup(
        req({ email: "reader@example.com", consent: "yes" }),
        config,
        client,
        now,
      )
    ).status,
  ).toBe(200);
  state.error = { name: "application_error" };
  expect(
    (
      await signup(
        req({ email: "reader@example.com", consent: "yes" }),
        config,
        client,
        now,
      )
    ).status,
  ).toBe(502);
});
test("confirmation requires explicit POST and never replays consent or overrides global opt-out", async () => {
  const { state, client } = fake(),
    now = Date.now(),
    token = createToken("reader@example.com", config, now);
  expect(
    (await confirm(new Request(config.origin), config, client, now)).status,
  ).toBe(405);
  expect(
    (await confirm(req({ token: "invalid" }), config, client, now)).status,
  ).toBe(400);
  expect(state.creates).toHaveLength(0);
  expect((await confirm(req({ token }), config, client, now)).status).toBe(200);
  expect(state.creates[0].topics).toEqual([
    { id: config.topicId, subscription: "opt_in" },
  ]);
  expect(state.creates[0]).not.toHaveProperty("unsubscribed");
  expect(
    (await (await confirm(req({ token }), config, client, now)).json()).used,
  ).toBe(true);
  expect(state.creates).toHaveLength(1);
  state.contact.unsubscribed = true;
  expect(
    (
      await confirm(
        req({ token: createToken("reader@example.com", config, now + 1) }),
        config,
        client,
        now + 1,
      )
    ).status,
  ).toBe(409);
  expect(state.creates).toHaveLength(1);
});
const post = {
  id: "future-new-post",
  title: "A <new> post",
  description: "New & useful",
  publishedAt: "2026-01-01T00:00:00Z",
  url: "https://nearbycoder.com/articles/future-new-post/",
  image: "https://nearbycoder.com/test.png",
};
test("publisher excludes the existing archive, future posts and duplicates; escapes email content", async ({
  request,
}) => {
  const feed = await (await request.get("/newsletter-feed.json")).json();
  expect(feed.length).toBeGreaterThan(0);
  expect(eligiblePosts(feed)).toEqual([]);
  expect(
    eligiblePosts([
      post,
      post,
      {
        ...post,
        id: baseline[0],
        url: `https://nearbycoder.com/articles/${baseline[0]}/`,
      },
      {
        ...post,
        id: "later",
        url: "https://nearbycoder.com/articles/later/",
        publishedAt: "2099-01-01",
      },
    ]),
  ).toEqual([post]);
  expect(() =>
    eligiblePosts([{ ...post, url: "https://evil.example/" }]),
  ).toThrow();
  expect(postEmail(post).html).toContain("A &lt;new&gt; post");
  expect(postEmail(post).html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  expect(postEmail(post).text).toContain(post.url);
});
test("publisher retries a persisted draft and skips sent broadcasts on later runs", async () => {
  const { state, client } = fake();
  state.failSend = true;
  await expect(publishPosts([post], config, client)).rejects.toThrow();
  expect(state.broadcastCreates).toHaveLength(1);
  expect(state.broadcastCreates[0]).toMatchObject({
    name: broadcastName(post.id),
    segmentId: config.segmentId,
    topicId: config.topicId,
  });
  state.failSend = false;
  expect(await publishPosts([post], config, client)).toEqual({ sent: 1 });
  expect(await publishPosts([post], config, client)).toEqual({ sent: 0 });
  expect(state.broadcastCreates).toHaveLength(1);
});
test("unconfigured email offers RSS without collecting addresses", async ({
  page,
}) => {
  await page.goto("/subscribe/");
  await expect(
    page.getByRole("heading", { name: "Email updates are on the way." }),
  ).toBeVisible();
  await expect(page.locator("input[type=email]")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Get the RSS feed", exact: true }),
  ).toHaveAttribute("href", "/rss.xml");
});
test("configured signup handles failures and confirmation requires a button click", async ({
  page,
  browser,
}) => {
  mkdirSync("test-results", { recursive: true });
  const output = mkdtempSync(
    join(process.cwd(), "test-results", "newsletter-"),
  );
  try {
    execFileSync(
      process.execPath,
      ["node_modules/astro/bin/astro.mjs", "build", "--outDir", output],
      {
        env: { ...process.env, NEWSLETTER_ENABLED: "true" },
        stdio: "pipe",
        timeout: 90000,
      },
    );
    const html = readFileSync(join(output, "subscribe/index.html"), "utf8");
    await page.route("**/subscribe/", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.route("**/_astro/*.js", (route) => {
      const path = join(output, new URL(route.request().url()).pathname);
      try {
        return route.fulfill({
          contentType: "application/javascript",
          body: readFileSync(path),
        });
      } catch {
        return route.continue();
      }
    });
    let submissions = 0;
    await page.route("**/api/newsletter", (route) => {
      submissions++;
      expect(route.request().postData()).toContain("consent=yes");
      return route.fulfill({
        status: submissions === 1 ? 502 : 200,
        json:
          submissions === 1
            ? { message: "Please try again shortly." }
            : { ok: true, message: "Check your inbox and confirm your email." },
      });
    });
    await page.goto("/subscribe/");
    await page.getByLabel("Email address").fill("reader@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Subscribe by email" }).click();
    await expect(page.locator("#subscription-status")).toContainText(
      "try again",
    );
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(page.locator("#subscription-status")).toContainText(
      "Check your inbox",
    );
    await expect(page.getByLabel("Email address")).toHaveValue("");
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.screenshot({
      path: "test-results/newsletter-configured-mobile.png",
      fullPage: true,
    });
    const context = await browser.newContext({ javaScriptEnabled: false }),
      plain = await context.newPage();
    await plain.route("**/subscribe/", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await plain.goto("http://127.0.0.1:4322/subscribe/");
    await expect(plain.locator("#subscription-form")).toHaveAttribute(
      "action",
      "/api/newsletter",
    );
    await expect(
      plain.getByRole("button", { name: "Subscribe by email" }),
    ).toBeEnabled();
    await context.close();
    let confirmations = 0;
    await page.route("**/api/newsletter-confirm", (route) => {
      confirmations++;
      return route.fulfill({
        json: { ok: true, message: "You’re subscribed." },
      });
    });
    await page.goto("/subscribe/confirm/#token=test-token");
    await expect(page).toHaveURL(/\/subscribe\/confirm\/$/);
    expect(confirmations).toBe(0);
    await page
      .getByRole("button", { name: "Confirm subscription", exact: true })
      .click();
    await expect(page.locator("#confirmation-status")).toHaveText(
      "You’re subscribed.",
    );
    expect(confirmations).toBe(1);
    await page.evaluate(() => {
      location.hash = "token=fresh-link";
    });
    await expect(
      page.getByRole("button", { name: "Confirm subscription", exact: true }),
    ).toBeEnabled();
    await expect(page).toHaveURL(/\/subscribe\/confirm\/$/);
    expect(confirmations).toBe(1);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
