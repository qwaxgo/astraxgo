// What each share card (OG image) says, and where its images live.
// Every page gets a landscape card for link previews (X, Facebook, Discord, ...) and a
// square one for apps that crop to a square and for posting to Instagram.

import type { CollectionEntry } from 'astro:content';
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE } from '../../consts';
import { SITE_TIME_ZONE } from '../dates';

export const OG_FORMATS = {
	wide: { width: 1200, height: 630, padding: 72, titleSize: 60, maxTitleLines: 4, iconSize: 80 },
	square: { width: 1080, height: 1080, padding: 88, titleSize: 72, maxTitleLines: 7, iconSize: 112 },
} as const;
export type OgFormat = keyof typeof OG_FORMATS;

export const OG_COLLECTIONS = ['blog', 'pictures', 'pixelarts', 'mcskins', 'apps'] as const;
export type OgCollection = (typeof OG_COLLECTIONS)[number];
export type OgEntry = CollectionEntry<OgCollection>;

export interface OgCard {
	title: string;
	/** Shown under the title; only static pages have one. */
	description?: string;
	author: string;
	/** Footer second line: the site, plus the date for posts. */
	meta: string;
	style: 'simple' | 'gradient' | 'hero';
}

/** Pages outside the content collections, keyed by their first path segment ('' = home). */
export const PAGE_CARDS: Record<string, { title: string; description: string }> = {
	'': { title: SITE_TITLE, description: SITE_DESCRIPTION },
	about: { title: 'About', description: 'qwaxgo（くわっくすごー）のプロフィール' },
	blog: { title: 'ブログ', description: 'ブログ記事の一覧です' },
	apps: { title: 'アプリ', description: 'GitHub Pagesで公開しているアプリの一覧です' },
	tags: { title: 'タグ検索', description: 'ブログ・イラスト・ドット絵・マイクラスキン・アプリをタグで探せます' },
	mcskins: { title: 'マイクラスキン', description: '配布中のMinecraftスキン一覧です' },
	pictures: { title: 'イラスト', description: 'オリジナルイラストの一覧です' },
	pixelarts: { title: 'ドット絵', description: 'ドット絵の一覧です' },
};
/** URL segment for the home page's card (an empty path segment can't be a file name). */
const HOME_KEY = 'home';

/** Identifies a card: a collection entry, or one of PAGE_CARDS. */
export type OgRef = { collection: OgCollection; slug: string } | { page: string };

export function entrySlug(id: string): string {
	return id.replace(/\.(md|mdx)$/, '');
}

export function entryCard(entry: OgEntry): OgCard {
	const { title, author, pubDate, ogStyle } = entry.data;
	const date = pubDate.toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: SITE_TIME_ZONE,
	});
	return { title, author, meta: `${SITE_TITLE}  ·  ${date}`, style: ogStyle };
}

export function pageCard(key: string): OgCard {
	const page = PAGE_CARDS[key === HOME_KEY ? '' : key];
	return { ...page, author: SITE_AUTHOR, meta: SITE_TITLE, style: 'simple' };
}

/** Card for a URL path when the page doesn't name one: its section's card, else the home card. */
export function pageRefFor(pathname: string): OgRef {
	const section = pathname.split('/').filter(Boolean)[0] ?? '';
	return { page: section in PAGE_CARDS ? section : '' };
}

/** Site-relative image paths of a card, e.g. /og/wide/blog/my-post.png. */
export function ogImagePath(ref: OgRef, format: OgFormat): string {
	const [group, slug] = 'page' in ref ? ['page', ref.page || HOME_KEY] : [ref.collection, ref.slug];
	return `/og/${format}/${group}/${slug}.png`;
}

/** Route params for every page card (the og route builds these). */
export function pageCardKeys(): string[] {
	return Object.keys(PAGE_CARDS).map(key => key || HOME_KEY);
}
