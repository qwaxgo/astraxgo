import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const [blogPosts, pictures, pixelarts, mcskins, apps] = await Promise.all([
		getCollection('blog', ({ data }) => !data.draft),
		getCollection('pictures', ({ data }) => !data.draft),
		getCollection('pixelarts', ({ data }) => !data.draft),
		getCollection('mcskins', ({ data }) => !data.draft),
		getCollection('apps', ({ data }) => !data.draft),
	]);

	const items = [
		...blogPosts.map((post) => ({ ...post.data, link: `/blog/${post.id}/` })),
		...pictures.map((post) => ({ ...post.data, link: `/pictures/${post.id}/` })),
		...pixelarts.map((post) => ({ ...post.data, link: `/pixelarts/${post.id}/` })),
		...mcskins.map((post) => ({ ...post.data, link: `/mcskins/${post.id}/` })),
		...apps.map((post) => ({ ...post.data, link: `/apps/${post.id}/` })),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}
