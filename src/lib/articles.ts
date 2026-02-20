type ArticleEntryLike = {
  slug?: string;
  data: {
    draft?: boolean;
    date: string;
    accent?: string;
  };
};

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const ARTICLE_ACCENTS = [
  "amber",
  "cyan",
  "rose",
  "mist",
  "emerald",
  "sky",
  "violet",
  "lime",
  "teal",
  "indigo",
  "fuchsia",
  "pink",
  "orange",
  "red",
  "yellow",
  "blue",
  "slate",
  "stone",
  "zinc",
  "neutral",
  "purple",
  "green",
  "indigoDeep",
] as const;

export type ArticleAccent = (typeof ARTICLE_ACCENTS)[number];

const accentFamilies: Record<ArticleAccent, ArticleAccent[]> = {
  amber: ["amber", "orange", "yellow", "red"],
  cyan: ["cyan", "sky", "teal", "blue"],
  rose: ["rose", "pink", "fuchsia", "orange"],
  mist: ["mist", "sky", "amber", "violet", "teal"],
  emerald: ["emerald", "green", "lime", "teal"],
  sky: ["sky", "blue", "cyan", "indigo"],
  violet: ["violet", "purple", "indigo", "fuchsia"],
  lime: ["lime", "green", "emerald", "yellow"],
  teal: ["teal", "cyan", "emerald", "sky"],
  indigo: ["indigo", "indigoDeep", "blue", "violet"],
  fuchsia: ["fuchsia", "pink", "purple", "rose"],
  pink: ["pink", "rose", "fuchsia", "orange"],
  orange: ["orange", "amber", "red", "rose"],
  red: ["red", "orange", "rose", "amber"],
  yellow: ["yellow", "amber", "lime", "orange"],
  blue: ["blue", "sky", "indigo", "cyan"],
  slate: ["slate", "zinc", "stone", "blue"],
  stone: ["stone", "neutral", "amber", "zinc"],
  zinc: ["zinc", "slate", "neutral", "indigoDeep"],
  neutral: ["neutral", "stone", "mist", "zinc"],
  purple: ["purple", "violet", "fuchsia", "indigoDeep"],
  green: ["green", "emerald", "lime", "teal"],
  indigoDeep: ["indigoDeep", "indigo", "purple", "blue"],
};

function isArticleAccent(value: string): value is ArticleAccent {
  return (ARTICLE_ACCENTS as readonly string[]).includes(value);
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getTodayUtcDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function isArticlePublished(
  entry: ArticleEntryLike,
  options?: { includeScheduled?: boolean; now?: Date }
): boolean {
  const includeScheduled = options?.includeScheduled ?? false;
  const now = options?.now ?? new Date();

  if (entry.data.draft) {
    return false;
  }

  if (includeScheduled) {
    return true;
  }

  const publishDate = entry.data.date;
  if (ISO_DATE_ONLY.test(publishDate)) {
    return publishDate <= getTodayUtcDate(now);
  }

  const parsedDate = new Date(publishDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.getTime() <= now.getTime();
}

export function resolveArticleAccent(entry: ArticleEntryLike): ArticleAccent {
  const baseAccent = entry.data.accent;
  const fallbackAccent: ArticleAccent = "mist";
  const startAccent = baseAccent && isArticleAccent(baseAccent) ? baseAccent : fallbackAccent;
  const family = accentFamilies[startAccent] ?? [startAccent];
  const seed = `${entry.slug ?? ""}:${entry.data.date}:${startAccent}`;
  const index = hashString(seed) % family.length;
  return family[index] ?? startAccent;
}
