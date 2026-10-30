import type { APIRoute } from 'astro';

// Every crawler, search engines and AI alike, may read the whole site.
export const GET: APIRoute = ({ site }) => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${new URL('sitemap-index.xml', site)}`,
		'',
		'# Summary of this site for LLMs (https://llmstxt.org/)',
		`# ${new URL('llms.txt', site)}`,
		`# ${new URL('llms-full.txt', site)}`,
		'',
	].join('\n');
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
