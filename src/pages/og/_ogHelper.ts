import type { CollectionEntry } from 'astro:content';
import type { OGImageOptions } from 'astro-og-canvas';
import { SITE_AUTHOR } from '../../consts';

/** Noto Sans JP (latin + japanese) from fontsource CDN */
export const NOTO_SANS_JP_FONTS = [
	'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-400-normal.woff',
	'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-latin-700-normal.woff',
];

export type BlogPageEntry = CollectionEntry<'blog'>;

type Theme = 'light' | 'dark';
type RGB = [number, number, number];

/** Static page definition for non-blog pages (about, index, etc.) */
export interface StaticPageMeta {
	title: string;
	description?: string;
	ogStyle?: 'simple' | 'gradient' | 'hero';
}

/** Build OGImageOptions for a static (non-collection) page */
export function buildStaticImageOptions(
	meta: StaticPageMeta,
	theme: Theme,
): OGImageOptions {
	const syntheticEntry = {
		data: {
			title: meta.title,
			pubDate: new Date(),
			ogStyle: meta.ogStyle ?? 'simple',
		},
	} as BlogPageEntry;
	const opts = buildImageOptions('', syntheticEntry, theme);
	return { ...opts, description: meta.description };
}

/** Build OGImageOptions per entry and theme */
export function buildImageOptions(
	_path: string,
	entry: BlogPageEntry,
	theme: Theme,
): OGImageOptions {
	const { title, pubDate, ogStyle = 'simple' } = entry.data;

	const dateStr = pubDate.toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	const descText = `${SITE_AUTHOR}  ·  ${dateStr}`;
	const isDark = theme === 'dark';

	// base font colors per theme
	const defaultTitleColor: RGB = isDark ? [248, 248, 255] : [17, 24, 39];
	const defaultDescColor: RGB = isDark ? [160, 160, 180] : [75, 85, 99];

	const baseFont: OGImageOptions['font'] = {
		title: {
			size: 64,
			families: ['Noto Sans JP'],
			lineHeight: 1.3,
			weight: 'Bold',
			color: defaultTitleColor,
		},
		description: {
			size: 28,
			families: ['Noto Sans JP'],
			lineHeight: 1.5,
			color: defaultDescColor,
		},
	};

	const base: Partial<OGImageOptions> = {
		title,
		description: descText,
		fonts: NOTO_SANS_JP_FONTS,
		padding: 80,
		font: baseFont,
	};

	switch (ogStyle) {
		case 'gradient': {
			const bgGradient: RGB[] = isDark
				? [[23, 37, 84], [30, 58, 138]]
				: [[219, 234, 254], [186, 230, 253]];
			return {
				...base,
				bgGradient,
				font: {
					title: { ...baseFont.title, color: isDark ? [199, 210, 254] : [29, 78, 216] },
					description: { ...baseFont.description, color: isDark ? [165, 180, 252] : [59, 130, 246] },
				},
				border: {
					color: isDark ? [129, 140, 248] : [59, 130, 246],
					width: 8,
					side: 'inline-start',
				},
			} as OGImageOptions;
		}

		case 'hero': {
			// Hero: dark cinematic gradient (always dark-ish to work as "cover art")
			const bgGradient: RGB[] = isDark
				? [[2, 6, 23], [7, 15, 50]]
				: [[15, 23, 42], [30, 41, 59]];
			return {
				...base,
				bgGradient,
				font: {
					title: { ...baseFont.title, color: isDark ? [226, 232, 240] : [248, 250, 252] },
					description: { ...baseFont.description, color: isDark ? [100, 116, 139] : [148, 163, 184] },
				},
				border: {
					color: isDark ? [139, 92, 246] : [6, 182, 212],
					width: 8,
					side: 'block-start',
				},
			} as OGImageOptions;
		}

		default: {
			// simple
			const bgGradient: RGB[] = isDark ? [[15, 15, 20]] : [[248, 249, 252]];
			return {
				...base,
				bgGradient,
				border: {
					color: isDark ? [55, 55, 75] : [200, 205, 220],
					width: 2,
					side: 'block-start',
				},
			} as OGImageOptions;
		}
	}
}
