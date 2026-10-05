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
type ProjectMediaEntry = {
  id: string;
  body?: string;
  data?: { title?: string; image?: string; imageAlt?: string };
};
export function projectImage(entry: ProjectMediaEntry) {
  if (entry.data?.image) return entry.data.image;
  const image =
    projectImages[entry.id] ??
    entry.body?.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/)?.[1];
  return image ? optimizedImage(image) : undefined;
}
export function projectImageAlt(entry: ProjectMediaEntry) {
  return (
    entry.data?.imageAlt ??
    `${entry.data?.title ?? entry.id} project screenshot`
  );
}
/**
 * Large media is served from Cloudflare R2 instead of every Vercel deployment.
 * Sources live in `media/` (for example `media/videos/games/jeste-trailer.mp4`)
 * and are uploaded with `npm run media:upload`.
 */
export const mediaOrigin = "https://media.nerb.dev";
/** Resolve a `/videos/...` path to the media CDN; other URLs pass through. */
export function mediaUrl(src: string) {
  return src.startsWith("/videos/") ? `${mediaOrigin}${src}` : src;
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
