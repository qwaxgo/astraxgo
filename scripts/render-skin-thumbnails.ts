// Renders each Minecraft skin in src/content/mcskins with skinview3d (the same
// renderer as the 3D preview) into src/assets/mcskins/<id>.png, a transparent
// still used as the skin's thumbnail. Uses the first image in `contentImages`.
//
//   npm run render:skins             # every skin
//   npm run render:skins -- lambda   # only the given ids

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, extname, join } from 'node:path';
import { chromium } from 'playwright';

const CONTENT_DIR = 'src/content/mcskins';
const OUTPUT_DIR = 'src/assets/mcskins';
const SIZE = 400; // CSS px; rendered at 2x
const require = createRequire(import.meta.url);

function firstContentImage(source: string): string | undefined {
	const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
	return frontmatter.match(/^contentImages:\s*\r?\n\s+-\s*(\S+)/m)?.[1]?.replace(/^(['"])(.*)\1$/, '$2');
}

async function toDataUrl(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
	const type = res.headers.get('content-type') ?? 'image/png';
	return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
}

const only = new Set(process.argv.slice(2));
const skins = [];
for (const file of (await readdir(CONTENT_DIR)).filter(file => /\.mdx?$/.test(file))) {
	const id = basename(file, extname(file));
	if (only.size > 0 && !only.has(id)) continue;
	const image = firstContentImage(await readFile(join(CONTENT_DIR, file), 'utf8'));
	if (!image) {
		console.warn(`skip ${file}: no contentImages`);
		continue;
	}
	skins.push({ id, image });
}

await mkdir(OUTPUT_DIR, { recursive: true });
// Headless Chromium has no GPU; SwiftShader provides software WebGL. A forwarded
// display (VS Code sets DISPLAY / WAYLAND_DISPLAY in dev containers) makes ANGLE try
// to reach it and fail, so the browser is started without them.
const { DISPLAY, WAYLAND_DISPLAY, ...env } = process.env;
const browser = await chromium.launch({
	args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
	env: env as Record<string, string>,
});
const page = await browser.newPage();
await page.setContent('<!doctype html><body style="margin:0"></body>');
await page.addScriptTag({ path: require.resolve('skinview3d/bundles/skinview3d.bundle.js') });

let failed = false;
for (const { id, image } of skins) {
	try {
		const png = await page.evaluate(
			async ({ skin, size }) => {
				const { SkinViewer } = (window as any).skinview3d;
				const canvas = document.createElement('canvas');
				const viewer = new SkinViewer({
					canvas,
					width: size,
					height: size,
					pixelRatio: 2,
					preserveDrawingBuffer: true,
					renderPaused: true,
				});
				await viewer.loadSkin(skin);
				// Three-quarter view with a slight stride, so the thumbnail reads as a figure.
				viewer.playerWrapper.rotation.y = Math.PI / 6;
				const body = viewer.playerObject.skin;
				body.leftArm.rotation.x = 0.25;
				body.rightArm.rotation.x = -0.25;
				body.leftLeg.rotation.x = -0.2;
				body.rightLeg.rotation.x = 0.2;
				viewer.render();
				const dataUrl = canvas.toDataURL('image/png');
				viewer.dispose();
				return dataUrl;
			},
			{ skin: await toDataUrl(image), size: SIZE },
		);
		await writeFile(join(OUTPUT_DIR, `${id}.png`), Buffer.from(png.split(',')[1], 'base64'));
		console.log(`✓ ${id}  ${image}`);
	} catch (error) {
		failed = true;
		console.error(`✗ ${id}  ${image}  ${(error as Error).message}`);
	}
}
await browser.close();
process.exitCode = failed ? 1 : 0;
