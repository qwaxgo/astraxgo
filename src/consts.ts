// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'qwaxgo.com';
export const SITE_DESCRIPTION = 'welcome to qwaxgo.com!';
export const SITE_AUTHOR = 'qwaxgo';

// The author's accounts, shown in the header, the footer and on /about.
export const SOCIAL_LINKS = [
	{ label: 'X（Tech）', handle: '@qwaxgo', href: 'https://x.com/qwaxgo', icon: 'x' },
	{ label: 'GitHub', handle: '@qwaxgo', href: 'https://github.com/qwaxgo', icon: 'github' },
	{ label: 'X（イラスト）', handle: '@qwaxgo_studio', href: 'https://x.com/qwaxgo_studio', icon: 'x' },
	{ label: 'pixiv', handle: 'ID 67024528', href: 'https://www.pixiv.net/users/67024528', icon: 'pixiv' },
	{ label: 'Reddit', handle: 'u/qwaxgo', href: 'https://www.reddit.com/user/qwaxgo/', icon: 'reddit' },
	{ label: 'YouTube', handle: '@qwaxgo', href: 'https://www.youtube.com/@qwaxgo', icon: 'youtube' },
] as const;

// Credit for the profile icon (src/assets/profile/icon.png).
export const ICON_CREDIT = { handle: '@Hotogi_Otoka', href: 'https://x.com/Hotogi_Otoka' };

// Apps are hosted on this account's GitHub Pages; entries in the `apps`
// collection only name a repository and their URLs are derived from it.
// apps.qwaxgo.com is the custom domain of the <user>.github.io site, so every
// project site is served at https://apps.qwaxgo.com/<repo>/.
export const GITHUB_USER = 'qwaxgo';
export const APPS_ORIGIN = 'https://apps.qwaxgo.com';
