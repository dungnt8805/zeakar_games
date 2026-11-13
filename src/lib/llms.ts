import { ARCADE_CATEGORIES, ARCADE_GAMES } from '../data/arcade';
import { getGames } from '../data/games';
import ARCADE_TEXT from '../i18n/arcade-games.json';
import MESSAGES from '../i18n/messages.json';
import { LANGUAGE_NAMES, LOCALES, localizedArcadePath, localizedGamePath, localizedPath } from '../i18n/ui';

// llms.txt (https://llmstxt.org): a Markdown map of the site for language models, built from the same data as the pages.
const en = MESSAGES.en;
const arcadeText = ARCADE_TEXT.en as Record<string, { intro: string; howTo: string[]; features: string[] }>;
const arcadeMessages = en.arcade.games as Record<string, { desc: string; tag: string }>;

function header(site: URL) {
	const url = (path: string) => new URL(path, site).href;
	return [
		'# Milaan Games (Lamian Games)',
		'',
		`> ${en.studio.description} The site hosts ${ARCADE_GAMES.length} free browser games that run on phones and desktops with no download or sign-up, plus pages for the studio's mobile apps on Google Play.`,
		'',
		`- Every page exists in ${LOCALES.length} languages: ${LOCALES.map(lang => `${LANGUAGE_NAMES[lang]} (${lang === 'en' ? '/' : `/${lang}/`})`).join(', ')}. The links below are the English versions; add the language prefix for the others, e.g. ${url(localizedArcadePath('vi', 'sudoku'))}.`,
		'- Browser games save scores and progress only in the player\'s own browser (localStorage); there are no accounts.',
		`- Full text of every game page: ${url('/llms-full.txt')}. All URLs: ${url('/sitemap.xml')}.`,
	];
}

const byCategory = () => ARCADE_CATEGORIES.map(category => ({
	category,
	label: en.arcade.categories[category],
	games: ARCADE_GAMES.filter(game => game.category === category),
}));

export function llmsIndex(site: URL) {
	const url = (path: string) => new URL(path, site).href;
	const lines = [
		...header(site),
		'',
		'## Site',
		'',
		`- [Home](${url(localizedPath('en'))}): studio overview and featured mobile games`,
		`- [Free web games](${url(localizedArcadePath('en'))}): ${en.arcade.description}`,
		`- [Privacy policies](${url(localizedPath('en', '/policies/'))}): privacy policy for each app and for the website`,
	];
	for (const { label, games } of byCategory()) {
		lines.push('', `## ${label}`, '');
		for (const game of games) lines.push(`- [${game.title}](${url(localizedArcadePath('en', game.id))}): ${arcadeMessages[game.id].desc}`);
	}
	lines.push('', '## Mobile apps', '');
	for (const game of getGames('en')) lines.push(`- [${game.title}](${url(localizedGamePath('en', game.id))}): ${game.description}`);
	lines.push('', '## Optional', '', `- [Full game guides](${url('/llms-full.txt')}): how to play and features for every game`, `- [Sitemap](${url('/sitemap.xml')}): every page in every language`);
	return `${lines.join('\n')}\n`;
}

export function llmsFull(site: URL) {
	const url = (path: string) => new URL(path, site).href;
	const lines = header(site);
	for (const { label, games } of byCategory()) {
		lines.push('', `## ${label}`);
		for (const game of games) {
			const text = arcadeText[game.id];
			lines.push(
				'',
				`### ${game.title}`,
				'',
				`URL: ${url(localizedArcadePath('en', game.id))}`,
				`Genre: ${arcadeMessages[game.id].tag}`,
				'',
				text.intro,
				'',
				'How to play:',
				...text.howTo.map((step, index) => `${index + 1}. ${step}`),
				'',
				'Features:',
				...text.features.map(feature => `- ${feature}`),
			);
		}
	}
	lines.push('', '## Mobile apps');
	for (const game of getGames('en')) {
		lines.push(
			'',
			`### ${game.title}`,
			'',
			`URL: ${url(localizedGamePath('en', game.id))}`,
			`Google Play: ${game.googlePlayUrl}`,
			`Genre: ${game.categoryLabel}`,
			`Privacy policy: ${game.privacyUrl}`,
			'',
			game.tagline,
			'',
			game.longDescription,
			'',
			'Features:',
			...game.features.map(feature => `- ${feature}`),
		);
	}
	return `${lines.join('\n')}\n`;
}
