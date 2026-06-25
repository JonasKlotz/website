import { defineCollection, z } from 'astro:content';

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    arxiv: z.string().url().optional(),
    venueUrl: z.string().url().optional(),
    code: z.string().url().optional(),
    projectUrl: z.string().url().optional(),
    bibtex: z.string().optional(),
    abstract: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    image: z.string().optional(),
    link: z.string().url(),
    repo: z.string().url().optional(),
    year: z.number(),
  }),
});

export const collections = { publications, projects };
