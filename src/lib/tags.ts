import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { getAppScreenshot } from './appScreenshots';
import { getSkinThumbnail } from './skinThumbnails';

export const TAGGED_COLLECTIONS = ['blog', 'pictures', 'mcskins', 'apps'] as const;
export type TaggedCollection = (typeof TAGGED_COLLECTIONS)[number];

export const COLLECTION_LABELS: Record<TaggedCollection, string> = {
	blog: 'ブログ',
	pictures: 'イラスト',
	mcskins: 'マイクラスキン',
	apps: 'アプリ',
};

/** Link to the tag search page, optionally limited to one collection. */
export function tagSearchUrl(tag: string, collection?: TaggedCollection): string {
	const params = new URLSearchParams();
	if (collection) params.set('type', collection);
	params.append('tag', tag);
	return `/tags/?${params}`;
}

export interface TaggedEntry {
	collection: TaggedCollection;
	id: string;
	title: string;
	description: string;
	pubDate: Date;
	tags: string[];
	/** Where on-site links go (apps open in the popup on the list page). */
	href: string;
	/** The entry's own page, e.g. for crawlers and llms.txt. */
	page: string;
	/** Raw Markdown/MDX source. */
	body: string;
	/** Images shown on the page (pictures/mcskins). */
	images: string[];
	/** Remote URL (pictures/mcskins) or a local asset (blog hero, app screenshot). */
	thumbnail?: string | ImageMetadata;
}

/** Every published entry of every tagged collection, newest first. */
export async function getTaggedEntries(): Promise<TaggedEntry[]> {
	const published = ({ data }: { data: { draft: boolean } }) => !data.draft;
	const [blog, pictures, mcskins, apps] = await Promise.all([
		getCollection('blog', published),
		getCollection('pictures', published),
		getCollection('mcskins', published),
		getCollection('apps', published),
	]);

	const common = (collection: TaggedCollection, entry: (typeof blog)[number] | (typeof apps)[number]) => ({
		collection,
		id: entry.id,
		title: entry.data.title,
		description: entry.data.description,
		pubDate: entry.data.pubDate,
		tags: entry.data.tags,
		page: `/${collection}/${entry.id}/`,
		body: entry.body ?? '',
		images: [] as string[],
	});

	return [
		...blog.map(e => ({ ...common('blog', e), href: `/blog/${e.id}/`, thumbnail: e.data.heroImage })),
		...pictures.map(e => ({
			...common('pictures', e),
			href: `/pictures/${e.id}/`,
			thumbnail: e.data.contentImages[0],
			images: e.data.contentImages,
		})),
		...mcskins.map(e => ({
			...common('mcskins', e),
			href: `/mcskins/${e.id}/`,
			thumbnail: getSkinThumbnail(e.id) ?? e.data.contentImages[0],
			images: e.data.contentImages,
		})),
		// Apps open in the popup on the list page.
		...apps.map(e => ({ ...common('apps', e), href: `/apps/#${e.id}`, thumbnail: getAppScreenshot(e.id) })),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}
