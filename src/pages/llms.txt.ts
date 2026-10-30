import type { APIRoute } from 'astro';
import { llmsIndex } from '../lib/llms';

export const GET: APIRoute = async ({ site }) =>
	new Response(await llmsIndex(site!), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
