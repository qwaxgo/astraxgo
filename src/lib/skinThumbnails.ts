import type { ImageMetadata } from 'astro';

// Written by `npm run render:skins`; skins without one fall back to the flat texture.
const thumbnails = import.meta.glob<{ default: ImageMetadata }>('../assets/mcskins/*.png', {
	eager: true,
});

export function getSkinThumbnail(id: string): ImageMetadata | undefined {
	return thumbnails[`../assets/mcskins/${id}.png`]?.default;
}
