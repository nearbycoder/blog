type ArticleEntryLike = {
  data: {
    draft?: boolean;
    date: string;
  };
};

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

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
