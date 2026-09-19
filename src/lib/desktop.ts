import { getCollection } from "astro:content";
import { site } from "../data/site";
import { labs } from "../data/labs";
import {
  compareArticlesByPublishDateDesc,
  isArticlePublished,
} from "./articles";
import { getReadingPaths } from "./discovery";
import { getTopics } from "./topics";
import { getTechnologies } from "./technologies";

export const desktopFolders = [
  { id: "all", label: "All files", icon: "files" },
  { id: "articles", label: "Articles", icon: "writing" },
  { id: "projects", label: "Projects", icon: "code" },
  { id: "layoff", label: "Layoff log", icon: "journal" },
  { id: "postmortems", label: "Postmortems", icon: "journal" },
  { id: "lab", label: "Lab", icon: "lab" },
  { id: "paths", label: "Reading paths", icon: "folder" },
  { id: "topics", label: "Topics & tools", icon: "folder" },
  { id: "pages", label: "Around the site", icon: "globe" },
] as const;

export async function getDesktopFiles() {
  const [articles, projects, layoff, postmortems, paths, topics, technologies] =
    await Promise.all([
      getCollection("articles"),
      getCollection("projects"),
      getCollection("layoff"),
      getCollection("postmortems"),
      getReadingPaths(),
      getTopics(),
      getTechnologies(),
    ]);
  return [
    ...articles
      .filter((entry) =>
        isArticlePublished(entry, { includeScheduled: !import.meta.env.PROD }),
      )
      .sort(compareArticlesByPublishDateDesc)
      .map((entry) => ({
        title: entry.data.title,
        description: entry.data.description,
        url: `/articles/${entry.id}/`,
        folder: "articles",
        kind: "Article",
        detail: entry.data.date,
        keywords: [entry.body, ...entry.data.tags].join(" "),
      })),
    ...projects
      .filter((entry) => !entry.data.draft)
      .map((entry) => ({
        title: entry.data.title,
        description: entry.data.summary,
        url: `/projects/${entry.id}/`,
        folder: "projects",
        kind: "Project",
        detail: entry.data.year,
        keywords: [entry.body, ...entry.data.stack].join(" "),
      })),
    ...layoff
      .filter((entry) => !entry.data.draft)
      .sort((a, b) => b.data.date.localeCompare(a.data.date))
      .map((entry) => ({
        title: entry.data.title,
        description: entry.data.summary,
        url: `/layoff/${entry.id}/`,
        folder: "layoff",
        kind: "Build log",
        detail: entry.data.date,
        keywords: [entry.body, ...entry.data.stack].join(" "),
      })),
    ...postmortems
      .filter((entry) => !entry.data.draft)
      .map((entry) => ({
        title: entry.data.title,
        description: entry.data.description,
        url: `/postmortems/${entry.id}/`,
        folder: "postmortems",
        kind: "Postmortem",
        detail: entry.data.date,
        keywords: entry.body ?? "",
      })),
    ...labs.map((lab) => ({
      title: lab.title,
      description: lab.description,
      url: `/lab/${lab.slug}/`,
      folder: "lab",
      kind: "Experiment",
      detail: lab.kind,
      keywords: lab.project,
    })),
    ...paths.map((path) => ({
      title: path.title,
      description: path.description,
      url: `/start-here/${path.slug}/`,
      folder: "paths",
      kind: "Reading path",
      detail: `${path.entries.length} stories`,
      keywords: "",
    })),
    ...topics.map((topic) => ({
      title: topic.tag,
      description: `Writing about ${topic.tag}.`,
      url: `/topics/${topic.slug}/`,
      folder: "topics",
      kind: "Topic",
      detail: `${topic.articles.length} articles`,
      keywords: "",
    })),
    ...technologies.map((tech) => ({
      title: tech.name,
      description: `Projects built with ${tech.name}.`,
      url: `/technologies/${tech.slug}/`,
      folder: "topics",
      kind: "Technology",
      detail: `${tech.projects.length} projects`,
      keywords: "",
    })),
    ...[{ label: "Home", href: "/" }, ...site.nav, ...site.explore]
      .filter((item) => item.href !== "/desktop")
      .map((item) => ({
        title: item.label,
        description: `Explore ${item.label.toLowerCase()} on nearbycoder.com.`,
        url: item.href,
        folder: "pages",
        kind: "Page",
        detail: "",
        keywords: "",
      })),
  ];
}
