import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import {
	entryCard,
	entrySlug,
	OG_COLLECTIONS,
	OG_FORMATS,
	type OgCard,
	type OgFormat,
	pageCard,
	pageCardKeys,
} from '../../../../lib/og/cards';
import { renderOgImage } from '../../../../lib/og/render';

// /og/{wide,square}/{collection|page}/{slug}.png for every entry and every static page.
export const getStaticPaths = (async () => {
	const entries = (await Promise.all(OG_COLLECTIONS.map(collection => getCollection(collection)))).flat();
	const cards: { group: string; slug: string; card: OgCard }[] = [
		...entries.map(entry => ({ group: entry.collection, slug: entrySlug(entry.id), card: entryCard(entry) })),
		...pageCardKeys().map(slug => ({ group: 'page', slug, card: pageCard(slug) })),
	];
	return (Object.keys(OG_FORMATS) as OgFormat[]).flatMap(format =>
		cards.map(({ group, slug, card }) => ({ params: { format, group, slug }, props: { card, format } })),
	);
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const { card, format } = props as { card: OgCard; format: OgFormat };
	return new Response(await renderOgImage(card, format), { headers: { 'Content-Type': 'image/png' } });
};
