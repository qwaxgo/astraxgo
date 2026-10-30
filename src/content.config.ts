import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { SITE_AUTHOR } from './consts';
import { appUrls } from './lib/appUrls';

const baseSchema = z.object({
	title: z.string(),
	description: z.string(),
	author: z.string().default(SITE_AUTHOR),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	tags: z.array(z.string()).optional().default(['others']),
	feature: z.boolean().optional().default(false),
	draft: z.boolean().optional().default(false),
	canonicalURL: z.string().url().optional(),
	ogStyle: z.enum(['simple', 'gradient', 'hero']).optional().default('simple'),
});

// Gallery collections (pictures/mcskins) reference remote image URLs rendered
// via <ContentImage> inside the MDX body, so they're plain strings rather than
// local assets validated through Astro's `image()` helper.
const galleryContentSchema = z.array(z.string());

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => baseSchema.extend({ heroImage: image().optional() }),
});

const pictures = defineCollection({
	loader: glob({ base: './src/content/pictures', pattern: '**/*.{md,mdx}' }),
	schema: baseSchema.extend({ contentImages: galleryContentSchema }),
});

const mcskins = defineCollection({
	loader: glob({ base: './src/content/mcskins', pattern: '**/*.{md,mdx}' }),
	schema: baseSchema.extend({ contentImages: galleryContentSchema }),
});

// Apps live in this account's GitHub Pages. Frontmatter only names the repository
// (and optionally a path inside its Pages site); the public URL and repository URL
// are derived here so every entry points at APPS_ORIGIN.
const apps = defineCollection({
	loader: glob({ base: './src/content/apps', pattern: '**/*.{md,mdx}' }),
	schema: baseSchema
		.extend({
			repo: z.string().regex(/^[\w.-]+$/, 'repo is a repository name, not a URL'),
			path: z
				.string()
				.regex(/^[^:]*$/, 'path is relative to the Pages site, not a URL')
				.optional()
				.default(''),
		})
		.transform(data => ({ ...data, ...appUrls(data.repo, data.path) })),
});

export const collections = { blog, pictures, mcskins, apps };
