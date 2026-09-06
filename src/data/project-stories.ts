/** Explicit editorial relationships, independent of fuzzy search or matching titles. */
export const projectStories: Record<
  string,
  { articles: string[]; updates: string[] }
> = {
  "agfs-dev": {
    articles: [
      "building-agfs-dev-to-make-remote-agent-files-easy-to-share",
      "building-agfs-dev-on-my-wifes-green-macbook-neo-with-ai",
    ],
    updates: [],
  },
  soloagent: {
    articles: ["building-soloagent-to-understand-ai-harnesses"],
    updates: ["week-003-2026-03-03-soloagent"],
  },
  "roomba-wars": {
    articles: ["when-ai-in-an-interview-fails-you"],
    updates: ["week-003-2026-03-08-roomba-wars"],
  },
  "hackernews-tui": {
    articles: [
      "building-hackernews-tui-in-30-minutes-with-opentui-and-gpt-5-3-codex",
    ],
    updates: ["week-003-2026-03-04-hackernews-tui"],
  },
  "dailystand-dev": {
    articles: ["building-a-full-saas-in-less-than-a-day-with-claude-and-codex"],
    updates: ["week-001-2026-02-17-dailystand-dev"],
  },
  "llink-space": {
    articles: ["launching-llink-space"],
    updates: ["week-001-2026-02-20-llink-space"],
  },
  "imposter-fm": {
    articles: ["launching-imposter-fm"],
    updates: ["week-001-2026-02-19-imposter-fm"],
  },
  "easyaccessqr-com": {
    articles: ["the-pivot-reusing-a-stable-codebase-for-easyaccessqr"],
    updates: ["week-002-2026-02-24-easyaccessqr-com"],
  },
  "uutil-space": {
    articles: ["launching-uutil-space"],
    updates: ["week-002-2026-02-25-uutil-space"],
  },
  triphaven: { articles: [], updates: ["week-003-2026-03-02-triphaven"] },
};
