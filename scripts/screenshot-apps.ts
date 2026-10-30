// Captures the top page of each app in src/content/apps into
// src/assets/apps/<id>.png, which the /apps pages pick up automatically.
//
//   npm run screenshot:apps              # every app
//   npm run screenshot:apps -- odm-poser # only the given ids

import { mkdir, readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { chromium } from 'playwright';
import { appUrls } from '../src/lib/appUrls.ts';

const CONTENT_DIR = 'src/content/apps';
const OUTPUT_DIR = 'src/assets/apps';
const VIEWPORT = { width: 1280, height: 800 };

function frontmatterValue(source: string, key: string): string | undefined {
	const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
	const value = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1];
	return value?.trim().replace(/^(['"])(.*)\1$/, '$2');
}

const only = new Set(process.argv.slice(2));
const files = (await readdir(CONTENT_DIR)).filter(file => /\.mdx?$/.test(file));
const apps = [];
for (const file of files) {
	const id = basename(file, extname(file));
	if (only.size > 0 && !only.has(id)) continue;
	const source = await readFile(join(CONTENT_DIR, file), 'utf8');
	const repo = frontmatterValue(source, 'repo');
	if (!repo) {
		console.warn(`skip ${file}: no repo in frontmatter`);
		continue;
	}
	apps.push({ id, url: appUrls(repo, frontmatterValue(source, 'path')).url });
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, locale: 'ja-JP' });
let failed = false;
for (const { id, url } of apps) {
	try {
		const res = await page.goto(url, { waitUntil: 'networkidle' });
		if (!res?.ok()) throw new Error(`HTTP ${res?.status()}`);
		// Let entrance animations and canvas rendering settle.
		await page.waitForTimeout(1000);
		await page.screenshot({ path: join(OUTPUT_DIR, `${id}.png`) });
		console.log(`✓ ${id}  ${url}`);
	} catch (error) {
		failed = true;
		console.error(`✗ ${id}  ${url}  ${(error as Error).message}`);
	}
}
await browser.close();
process.exitCode = failed ? 1 : 0;
