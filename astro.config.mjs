// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://qwaxgo.com',
	integrations: [mdx(), sitemap()],
	// Category aliases: /posts/ → /blog/, and /pixelarts/ (the illustration
	// category on the old lordlution.net) → /pictures/.
	redirects: {
		'/posts': '/blog',
		'/posts/[...slug]': '/blog/[...slug]',
		'/pixelarts': '/pictures',
		'/pixelarts/[...slug]': '/pictures/[...slug]',
	},
	server: {
		host: true,
	},
});
