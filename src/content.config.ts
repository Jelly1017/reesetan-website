// src/content.config.ts
// Astro 5 content layer — two collections, one per locale.
// Files in src/content/en/*.md feed /insights; files in src/content/zh/*.md feed /zh/insights.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articlesEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    authorRole: z.string(),
    keywords: z.array(z.string()).optional().default([]),
    canonical: z.string().url().optional(),
    excerpt: z.string().optional(),
  }),
});

const articlesZh = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zh' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    authorRole: z.string(),
    keywords: z.array(z.string()).optional().default([]),
    canonical: z.string().url().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = {
  'articles-en': articlesEn,
  'articles-zh': articlesZh,
};
