// Draws the share cards (OG images) with CanvasKit: the title, an optional description,
// and a footer with the profile icon, author, site and date. One layout for both sizes.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import type { CanvasKit, FontMgr, Image } from 'canvaskit-wasm';
import { OG_FORMATS, type OgCard, type OgFormat } from './cards';

const { resolve } = createRequire(import.meta.url);

/**
 * Noto Sans JP (latin + japanese), static Regular and Bold from the official noto-cjk release.
 * fontsource's files are cut from the variable font and named "Noto Sans JP Thin" inside,
 * so CanvasKit never matched them to the family and Japanese came out as boxes.
 */
const NOTO_CJK_JP = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Sans2.004/Sans/SubsetOTF/JP';
const FONT_URLS = [`${NOTO_CJK_JP}/NotoSansJP-Regular.otf`, `${NOTO_CJK_JP}/NotoSansJP-Bold.otf`];
const FONT_FAMILY = 'Noto Sans JP';
// Downloaded once and kept between builds.
const FONT_CACHE_DIR = 'node_modules/.cache/qwaxgo-og';
const ICON_PATH = 'src/assets/profile/icon.png';

type RGB = [number, number, number];

interface Palette {
	background: RGB[];
	title: RGB;
	text: RGB;
	muted: RGB;
	/** Accent bar along one edge of the card. */
	accent: { color: RGB; width: number; side: 'top' | 'left' };
}

// The `ogStyle` frontmatter picks one of these.
const PALETTES: Record<OgCard['style'], Palette> = {
	simple: {
		background: [[248, 249, 252]],
		title: [17, 24, 39],
		text: [55, 65, 81],
		muted: [107, 114, 128],
		accent: { color: [200, 205, 220], width: 4, side: 'top' },
	},
	gradient: {
		background: [[219, 234, 254], [186, 230, 253]],
		title: [29, 78, 216],
		text: [30, 64, 175],
		muted: [59, 130, 246],
		accent: { color: [59, 130, 246], width: 16, side: 'left' },
	},
	hero: {
		background: [[15, 23, 42], [30, 41, 59]],
		title: [248, 250, 252],
		text: [203, 213, 225],
		muted: [148, 163, 184],
		accent: { color: [6, 182, 212], width: 16, side: 'top' },
	},
};

interface Assets {
	ck: CanvasKit;
	fonts: FontMgr;
	icon: Image;
}

let assets: Promise<Assets> | undefined;

async function loadFont(url: string): Promise<ArrayBuffer> {
	const file = join(FONT_CACHE_DIR, url.split('/').pop()!);
	try {
		const cached = await readFile(file);
		return cached.buffer.slice(cached.byteOffset, cached.byteOffset + cached.byteLength);
	} catch {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`OG font download failed: HTTP ${res.status} ${url}`);
		const data = await res.arrayBuffer();
		await mkdir(FONT_CACHE_DIR, { recursive: true });
		await writeFile(file, new Uint8Array(data));
		return data;
	}
}

function loadAssets(): Promise<Assets> {
	assets ??= (async () => {
		const { default: init } = await import('canvaskit-wasm/full');
		const ck = await init({ locateFile: file => resolve(`canvaskit-wasm/bin/full/${file}`) });
		const fonts = ck.FontMgr.FromData(...(await Promise.all(FONT_URLS.map(loadFont))));
		const icon = ck.MakeImageFromEncoded(await readFile(ICON_PATH));
		if (!fonts || !icon) throw new Error('OG assets failed to load');
		return { ck, fonts, icon };
	})();
	return assets;
}

/** Renders one card as PNG bytes. */
export async function renderOgImage(card: OgCard, format: OgFormat): Promise<Uint8Array> {
	const { ck, fonts, icon } = await loadAssets();
	const { width, height, padding, titleSize, maxTitleLines, iconSize } = OG_FORMATS[format];
	const palette = PALETTES[card.style];
	const color = (rgb: RGB) => ck.Color(...rgb);

	const surface = ck.MakeSurface(width, height);
	if (!surface) throw new Error('OG surface could not be created');
	const canvas = surface.getCanvas();

	// Background and accent bar.
	const bg = new ck.Paint();
	const stops = palette.background.length > 1 ? palette.background : [palette.background[0], palette.background[0]];
	bg.setShader(ck.Shader.MakeLinearGradient([0, 0], [0, height], stops.map(color), null, ck.TileMode.Clamp));
	canvas.drawRect(ck.XYWHRect(0, 0, width, height), bg);
	const { accent } = palette;
	const bar = new ck.Paint();
	bar.setColor(color(accent.color));
	canvas.drawRect(
		accent.side === 'top' ? ck.XYWHRect(0, 0, width, accent.width) : ck.XYWHRect(0, 0, accent.width, height),
		bar,
	);
	const left = padding + (accent.side === 'left' ? accent.width : 0);
	const textWidth = width - left - padding;

	const paragraph = (text: string, size: number, rgb: RGB, bold: boolean, maxLines?: number) => {
		const builder = ck.ParagraphBuilder.Make(
			new ck.ParagraphStyle({
				textStyle: {
					color: color(rgb),
					fontFamilies: [FONT_FAMILY],
					fontSize: size,
					fontStyle: { weight: bold ? ck.FontWeight.Bold : ck.FontWeight.Normal },
					heightMultiplier: bold ? 1.35 : 1.5,
				},
				maxLines,
				ellipsis: maxLines ? '…' : undefined,
			}),
			fonts,
		);
		builder.addText(text);
		const para = builder.build();
		para.layout(textWidth);
		return para;
	};

	// Title, then the description (static pages) under it.
	let y = padding + (accent.side === 'top' ? accent.width : 0);
	const title = paragraph(card.title, titleSize, palette.title, true, maxTitleLines);
	canvas.drawParagraph(title, left, y);
	y += title.getHeight();
	if (card.description) {
		const description = paragraph(card.description, Math.round(titleSize * 0.45), palette.text, false, 3);
		canvas.drawParagraph(description, left, y + titleSize * 0.4);
	}

	// Footer: round profile icon, author on the first line, site and date on the second.
	const iconTop = height - padding - iconSize;
	canvas.save();
	canvas.clipRRect(ck.RRectXY(ck.XYWHRect(left, iconTop, iconSize, iconSize), iconSize / 2, iconSize / 2), ck.ClipOp.Intersect, true);
	canvas.drawImageRectOptions(
		icon,
		ck.XYWHRect(0, 0, icon.width(), icon.height()),
		ck.XYWHRect(left, iconTop, iconSize, iconSize),
		ck.FilterMode.Linear,
		ck.MipmapMode.Linear,
		null,
	);
	canvas.restore();
	const ring = new ck.Paint();
	ring.setStyle(ck.PaintStyle.Stroke);
	ring.setStrokeWidth(2);
	ring.setAntiAlias(true);
	ring.setColor(color(palette.muted));
	ring.setAlphaf(0.4);
	canvas.drawCircle(left + iconSize / 2, iconTop + iconSize / 2, iconSize / 2, ring);

	const footerLeft = left + iconSize + Math.round(iconSize * 0.3);
	const name = paragraph(card.author, Math.round(iconSize * 0.4), palette.title, true, 1);
	const meta = paragraph(card.meta, Math.round(iconSize * 0.32), palette.muted, false, 1);
	const footerTop = iconTop + (iconSize - name.getHeight() - meta.getHeight()) / 2;
	canvas.drawParagraph(name, footerLeft, footerTop);
	canvas.drawParagraph(meta, footerLeft, footerTop + name.getHeight());

	const png = surface.makeImageSnapshot().encodeToBytes(ck.ImageFormat.PNG, 100);
	surface.dispose();
	if (!png) throw new Error('OG image could not be encoded');
	return png;
}
