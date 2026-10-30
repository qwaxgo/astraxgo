import { GITHUB_PAGES_ORIGIN, GITHUB_USER } from '../consts.ts';

// Shared by the `apps` collection schema and scripts/screenshot-apps.ts, so the
// screenshots are taken from exactly the URL the site links to.
export function appUrls(repo: string, path = '') {
	// The <user>.github.io repository is served at the origin root.
	const base =
		repo.toLowerCase() === `${GITHUB_USER}.github.io`
			? `${GITHUB_PAGES_ORIGIN}/`
			: `${GITHUB_PAGES_ORIGIN}/${repo}/`;
	return {
		url: new URL(path.replace(/^\/+/, ''), base).href,
		repoUrl: `https://github.com/${GITHUB_USER}/${repo}`,
	};
}
