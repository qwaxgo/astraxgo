import { APPS_ORIGIN, GITHUB_USER } from '../consts.ts';

// Shared by the `apps` collection schema and scripts/screenshot-apps.ts, so the
// screenshots are taken from exactly the URL the site links to.
export function appUrls(repo: string, path = '') {
	return {
		url: new URL(path.replace(/^\/+/, ''), `${APPS_ORIGIN}/${repo}/`).href,
		repoUrl: `https://github.com/${GITHUB_USER}/${repo}`,
	};
}
