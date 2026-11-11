// Dates are shown in Japan time, so a post published at 07:00 JST (22:00 UTC the day
// before) still shows its Japanese date.
export const SITE_TIME_ZONE = 'Asia/Tokyo';

/** YYYY-MM-DD in Japan time (melta UI's ja date format). */
export function isoDate(date: Date): string {
	// sv-SE is the locale whose short date is already YYYY-MM-DD.
	return date.toLocaleDateString('sv-SE', { timeZone: SITE_TIME_ZONE });
}
