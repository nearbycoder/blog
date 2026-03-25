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

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    year: z.string(),
    stack: z.array(z.string()).default([]),
    impact: z.string().optional(),
    link: z.string().optional(),
    githubLink: z.string().optional(),
    featured: z.boolean().default(false),
    accent: accent.default("mist"),
    draft: z.boolean().default(false),
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

export const collections = {
  articles,
  projects,
  layoff,
};
