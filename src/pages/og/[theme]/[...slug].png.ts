import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOpenGraphImage } from 'astro-og-canvas';
import type { BlogPageEntry, StaticPageMeta } from '../_ogHelper';
import { buildImageOptions, buildStaticImageOptions } from '../_ogHelper';

const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

type Props =
	| { kind: 'blog'; entry: BlogPageEntry; theme: Theme }
	| { kind: 'static'; meta: StaticPageMeta; theme: Theme };

/** Static pages that are not in the blog collection */
const STATIC_PAGES: Record<string, StaticPageMeta> = {
	about: { title: 'About Me', description: 'About this site' },
	index: { title: 'Home', description: 'Blog top page' },
};

export const getStaticPaths: GetStaticPaths = async () => {
	const entries = await getCollection('blog');

	const blogPaths = THEMES.flatMap((theme) =>
		entries.map((entry) => ({
			params: { theme, slug: entry.id.replace(/\.(md|mdx)$/, '') },
			props: { kind: 'blog', entry, theme } satisfies Props,
		})),
	);

	const staticPaths = THEMES.flatMap((theme) =>
		Object.entries(STATIC_PAGES).map(([slug, meta]) => ({
			params: { theme, slug },
			props: { kind: 'static', meta, theme } satisfies Props,
		})),
	);

	return [...blogPaths, ...staticPaths];
};

export const GET: APIRoute = async ({ props }) => {
	const p = props as Props;
	const imageOptions =
		p.kind === 'blog'
			? buildImageOptions('', p.entry, p.theme)
			: buildStaticImageOptions(p.meta, p.theme);

	const image = await generateOpenGraphImage(imageOptions);
	return new Response(image, { headers: { 'Content-Type': 'image/png' } });
};
