import type { ImageMetadata } from 'astro';

// Written by `npm run screenshot:apps`; apps without one simply show no image.
const screenshots = import.meta.glob<{ default: ImageMetadata }>('../assets/apps/*.png', {
	eager: true,
});

export function getAppScreenshot(id: string): ImageMetadata | undefined {
	return screenshots[`../assets/apps/${id}.png`]?.default;
}
