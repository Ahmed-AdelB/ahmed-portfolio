import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		techStack: z.array(z.string()),
		github: z.string().url().optional(),
		demo: z.string().url().optional(),
		featured: z.boolean().default(false),
		pubDate: z.coerce.date().optional(), // Added for sorting/display
		heroImage: z.string().optional(),
	}),
});

const contributions = defineCollection({
	type: 'data',
	schema: z.object({
		project: z.string(),
		title: z.string(),
		type: z.enum(['PR', 'Issue', 'Review', 'Other']),
		pr_url: z.string().url(),
		impact: z.string(),
		date: z.coerce.date(),
		status: z.enum(['Merged', 'Open', 'Closed', 'Draft']),
		description: z.string().optional(),
		additions: z.number().optional().default(0),
		deletions: z.number().optional().default(0),
	}),
});

export const collections = { blog, projects, contributions };