// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeTableScope from './src/lib/rehypeTableScope.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://qwaxgo.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [rehypeTableScope],
	},
	// /posts/ is an alias of /blog/
	redirects: {
		'/posts': '/blog',
		'/posts/[...slug]': '/blog/[...slug]',
	},
	server: {
		host: true,
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
