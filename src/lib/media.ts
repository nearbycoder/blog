export function optimizedImage(src: string) {
  return src
    .replace("/images/", "/images/optimized/")
    .replace(/\.(png|jpg|jpeg)$/, ".webp");
}
/** Each published article has explicitly selected cover art. */
export function articleImage(entry: { id: string; body?: string }) {
  const cover = artwork[entry.id as keyof typeof artwork];
  if (cover) return cover.src;
  const image = entry.body?.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/)?.[1];
  return image ? optimizedImage(image) : "/images/editorial-curiosity.webp";
}
export function articleImageAlt(entry: { id: string }) {
  return artwork[entry.id as keyof typeof artwork]?.alt ?? "";
}
const projectImages: Record<string, string> = {
  "agfs-dev": "/images/agfs.png",
  "dailystand-dev": "/images/dailystand-screenshot.png",
  "easyaccessqr-com": "/images/easyaccessqr.com_1.jpg",
  "llink-space": "/images/llink-space.png",
  "uutil-space": "/images/uutils_space.png",
  triphaven: "/images/triphaven.png",
  soloagent: "/images/soloagent.jpg",
  "roomba-wars": "/images/roomba-1.png",
  "hackernews-tui": "/images/hackernews-tui.jpg",
  "imposter-fm": "/images/imposter-fm.png",
  "secret-santa-pair": "/images/santa.png",
  "react-chat": "/images/chat.png",
  "math-game": "/images/math.png",
  "material-poll": "/images/poll.png",
};
export function projectImage(entry: { id: string; body?: string }) {
  const image =
    projectImages[entry.id] ??
    entry.body?.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/)?.[1];
  return image ? optimizedImage(image) : undefined;
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
import artwork from "../data/article-artwork.json";
