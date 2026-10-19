import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    tags: z.array(reference("tags")).optional(),
    categories: z.array(reference("categories")).optional(),
    translation: reference("blog").optional(),
    related: z.array(reference("blog")).optional(),
    locale: z.string().default("en"),
    isDraft: z.boolean().optional().default(true),
  }),
});

const tags = defineCollection({
  loader: file("./src/content/tags.json"),
  schema: z.object({
    name: z.record(z.string(), z.string()),
  }),
});

const categories = defineCollection({
  loader: file("./src/content/categories.json"),
  schema: z.object({
    name: z.string(),
  }),
});

export const collections = {
  blog,
  tags,
  categories,
};
