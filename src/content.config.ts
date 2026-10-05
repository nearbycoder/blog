import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const accent = z.enum([
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
]);

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    publishedAt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    readTime: z.string().optional(),
    featured: z.boolean().default(false),
    accent: accent.default("mist"),
    draft: z.boolean().default(false),
  }),
});

// Projects and games share one shape; games add how and where to play.
const work = z.object({
  title: z.string(),
  summary: z.string(),
  role: z.string(),
  year: z.string(),
  createdAt: z
    .string()
    // A UTC date, or a full UTC timestamp to order same-day repositories.
    .regex(
      /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?$/,
      "Use a UTC date (YYYY-MM-DD) or timestamp (YYYY-MM-DDTHH:MM:SSZ)",
    )
    .refine((value) => {
      const date = new Date(
        value.length === 10 ? `${value}T00:00:00.000Z` : value,
      );
      return (
        !Number.isNaN(date.valueOf()) &&
        date.toISOString().slice(0, 19) ===
          (value.length === 10 ? `${value}T00:00:00` : value.slice(0, 19))
      );
    }, "Use a real calendar date and time")
    .optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageCaption: z.string().optional(),
  demoVideos: z
    .array(
      z.object({
        src: z.union([
          z.string().url(),
          z.string().regex(/^\/videos\/(?:[\w-]+\/)*[\w.-]+\.(?:mp4|webm)$/),
        ]),
        title: z.string(),
        caption: z.string(),
        poster: z.string().optional(),
        original: z.string().url().optional(),
      }),
    )
    .default([]),
  stack: z.array(z.string()).default([]),
  impact: z.string().optional(),
  link: z.string().optional(),
  githubLink: z.string().optional(),
  featured: z.boolean().default(false),
  accent: accent.default("mist"),
  draft: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: work,
});

const games = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/games" }),
  schema: work.extend({
    genre: z.string(),
    platforms: z.array(z.string()).min(1),
    engine: z.string(),
    download: z.string().url().optional(),
  }),
});

const layoff = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/layoff" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    week: z.number().int().positive().optional(),
    day: z.number().int().positive().optional(),
    status: z.enum(["planned", "building", "shipped"]).default("planned"),
    stack: z.array(z.string()).default([]),
    image: z.string().optional(),
    repoUrl: z.string().url(),
    siteUrl: z.string().url(),
    accent: accent.default("cyan"),
    draft: z.boolean().default(false),
  }),
});

const postmortems = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/postmortems" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    project: z.string(),
    sources: z.array(z.string()).min(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  postmortems,
  articles,
  projects,
  games,
  layoff,
};
