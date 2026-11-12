/** Trim text for a meta description: whole sentences when possible, otherwise a word (or CJK character) boundary. */
export function metaDescription(text: string, max = 158) {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= max) return clean;
	const head = clean.slice(0, max);
	const sentenceEnd = Math.max(...['. ', '! ', '? ', '。', '！', '？'].map(mark => head.lastIndexOf(mark)));
	if (sentenceEnd >= 80) return head.slice(0, sentenceEnd + 1).trim();
	const space = head.lastIndexOf(' ');
	return `${(space >= 80 ? head.slice(0, space) : head.slice(0, max - 1)).replace(/[\s,;:—–-]+$/, '')}…`;
}

/** Add the brand to a page title only while it stays short enough for search results. */
export const withBrand = (title: string, max = 60) => (`${title} | Milaan Games`.length <= max ? `${title} | Milaan Games` : title);
