import { getCollection } from 'astro:content';
import { SITE_AUTHOR, SITE_TITLE } from '../consts';
import { COLLECTION_LABELS, getTaggedEntries, TAGGED_COLLECTIONS, type TaggedEntry } from './tags';

// Builds /llms.txt and /llms-full.txt (https://llmstxt.org/): a Markdown index of
// the site for LLMs, and the same with every entry's full text.

const SITE_SUMMARY = `${SITE_AUTHOR} の個人サイト。ブログ記事、ドット絵のイラスト、Minecraft のスキン（無料配布）、ブラウザで動く Web アプリを公開しています。`;

async function load(site: URL) {
	const [entries, apps] = await Promise.all([getTaggedEntries(), getCollection('apps')]);
	const appUrls = new Map(apps.map(app => [app.id, app.data.url]));
	const abs = (path: string) => new URL(path, site).href;
	return { entries, appUrls, abs };
}

function header(abs: (path: string) => string, full: boolean) {
	return [
		`# ${SITE_TITLE}`,
		'',
		`> ${SITE_SUMMARY}`,
		'',
		'- 言語: 日本語',
		`- タグ検索: ${abs('/tags/')}`,
		`- RSS: ${abs('/rss.xml')}`,
		`- サイトマップ: ${abs('/sitemap-index.xml')}`,
		full ? `- 目次のみ: ${abs('/llms.txt')}` : `- 全文: ${abs('/llms-full.txt')}`,
		'',
	];
}

/** Drops MDX component markup; the images it showed are listed separately. */
function plainBody(body: string): string {
	return body
		.replace(/<ContentImage[\s\S]*?\/>/g, '')
		.replace(/[ \t]+$/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function byCollection(entries: TaggedEntry[]) {
	return TAGGED_COLLECTIONS.map(collection => ({
		collection,
		entries: entries.filter(entry => entry.collection === collection),
	})).filter(group => group.entries.length > 0);
}

export async function llmsIndex(site: URL): Promise<string> {
	const { entries, appUrls, abs } = await load(site);
	const lines = header(abs, false);
	for (const group of byCollection(entries)) {
		lines.push(`## ${COLLECTION_LABELS[group.collection]}`, '');
		for (const entry of group.entries) {
			const app = appUrls.get(entry.id);
			const suffix = entry.collection === 'apps' && app ? `（アプリ本体: ${app}）` : '';
			lines.push(`- [${entry.title}](${abs(entry.page)}): ${entry.description}${suffix}`);
		}
		lines.push('');
	}
	return lines.join('\n');
}

export async function llmsFull(site: URL): Promise<string> {
	const { entries, appUrls, abs } = await load(site);
	const lines = header(abs, true);
	for (const group of byCollection(entries)) {
		lines.push(`## ${COLLECTION_LABELS[group.collection]}`, '');
		for (const entry of group.entries) {
			lines.push(
				`### ${entry.title}`,
				'',
				`- URL: ${abs(entry.page)}`,
				`- 公開日: ${entry.pubDate.toISOString().slice(0, 10)}`,
			);
			if (entry.tags.length > 0) lines.push(`- タグ: ${entry.tags.join(', ')}`);
			const app = appUrls.get(entry.id);
			if (entry.collection === 'apps' && app) lines.push(`- アプリ本体: ${app}`);
			for (const image of entry.images) lines.push(`- 画像: ${image}`);
			lines.push('', `> ${entry.description}`, '');
			const body = plainBody(entry.body);
			if (body) lines.push(body, '');
		}
	}
	return lines.join('\n');
}
