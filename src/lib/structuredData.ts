import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import type { TaggedCollection } from './tags';

// schema.org JSON-LD so search engines and AI crawlers can tell what each page is
// (an article, an artwork, a downloadable skin, a web app) and who made it.

export function websiteLd(site: URL) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_TITLE,
		description: SITE_DESCRIPTION,
		url: site.href,
		inLanguage: 'ja',
	};
}

interface EntryLdInput {
	collection: TaggedCollection;
	/** Absolute URL of the page. */
	url: URL;
	site: URL;
	title: string;
	description: string;
	author: string;
	pubDate: Date;
	updatedDate?: Date;
	tags: string[];
	/** Absolute image URLs; the first is the main one. */
	images: string[];
	/** The app itself, for apps. */
	appUrl?: string;
}

const TYPES: Record<TaggedCollection, string> = {
	blog: 'BlogPosting',
	pictures: 'VisualArtwork',
	mcskins: 'CreativeWork',
	apps: 'WebApplication',
};

export function entryLd(input: EntryLdInput) {
	const { collection, url, site, title, description, author, pubDate, updatedDate, tags, images } = input;
	return {
		'@context': 'https://schema.org',
		'@type': TYPES[collection],
		...(collection === 'blog' ? { headline: title } : { name: title }),
		description,
		url: url.href,
		mainEntityOfPage: url.href,
		inLanguage: 'ja',
		author: { '@type': 'Person', name: author },
		datePublished: pubDate.toISOString(),
		dateModified: (updatedDate ?? pubDate).toISOString(),
		...(tags.length > 0 && { keywords: tags.join(', ') }),
		...(images.length > 0 && { image: images }),
		isPartOf: { '@type': 'WebSite', name: SITE_TITLE, url: site.href },
		...(collection === 'mcskins' && { genre: 'Minecraft skin', isAccessibleForFree: true }),
		...(collection === 'apps' && {
			applicationCategory: 'UtilitiesApplication',
			operatingSystem: 'Web browser',
			isAccessibleForFree: true,
			...(input.appUrl && { installUrl: input.appUrl }),
		}),
	};
}
