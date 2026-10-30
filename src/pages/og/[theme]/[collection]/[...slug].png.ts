import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOpenGraphImage } from 'astro-og-canvas';
import type { GalleryPageEntry, StaticPageMeta } from '../../_ogHelper';
import { buildImageOptions, buildStaticImageOptions } from '../../_ogHelper';

const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

const ENTRY_COLLECTIONS = ['blog', 'pictures', 'pixelarts', 'mcskins', 'apps'] as const;
type EntryCollection = (typeof ENTRY_COLLECTIONS)[number];

type Props =
	| { kind: 'entry'; entry: GalleryPageEntry; theme: Theme }
	| { kind: 'static'; meta: StaticPageMeta; theme: Theme };

/** Static pages that are not part of a content collection */
const STATIC_PAGES: Record<string, StaticPageMeta> = {
	about: { title: 'About', description: 'qwaxgo（くわっくすごー）のプロフィール' },
	index: { title: 'Home', description: 'Blog top page' },
};

export const getStaticPaths: GetStaticPaths = async () => {
	const entriesByCollection = await Promise.all(
		ENTRY_COLLECTIONS.map(async collection => ({
			collection,
			entries: await getCollection(collection),
		})),
	);

	const entryPaths = entriesByCollection.flatMap(({ collection, entries }) =>
		THEMES.flatMap(theme =>
			entries.map(entry => ({
				params: { theme, collection, slug: entry.id.replace(/\.(md|mdx)$/, '') },
				props: { kind: 'entry', entry, theme } satisfies Props,
			})),
		),
	);

	const staticPaths = THEMES.flatMap(theme =>
		Object.entries(STATIC_PAGES).map(([slug, meta]) => ({
			params: { theme, collection: 'page', slug },
			props: { kind: 'static', meta, theme } satisfies Props,
		})),
	);

	return [...entryPaths, ...staticPaths];
};

export const GET: APIRoute = async ({ props }) => {
	const p = props as Props;
	const imageOptions =
		p.kind === 'entry'
			? buildImageOptions('', p.entry, p.theme)
			: buildStaticImageOptions(p.meta, p.theme);

	const image = await generateOpenGraphImage(imageOptions);
	return new Response(image, { headers: { 'Content-Type': 'image/png' } });
};
