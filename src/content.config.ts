import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(reference("tags")).optional(),
    categories: z.array(reference("categories")).optional(),
  }),
});

const tags = defineCollection({
  loader: file("./src/content/tags.json"),
  schema: z.object({
    name: z.string(),
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
