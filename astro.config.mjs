// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://qwaxgo.com',
	integrations: [mdx(), sitemap()],
	// /posts/ is an alias of /blog/
	redirects: {
		'/posts': '/blog',
		'/posts/[...slug]': '/blog/[...slug]',
	},
	server: {
		host: true,
	},
});
