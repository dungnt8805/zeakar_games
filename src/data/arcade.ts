import type { Locale } from '../i18n/ui';

export type ArcadeCategory = 'puzzle' | 'word' | 'brain' | 'board' | 'skill' | 'arcade' | 'sports';

export interface ArcadeGame {
	id: string;
	title: string;
	category: ArcadeCategory;
	/** Store listing this mini game promotes, if any. */
	gameId?: string;
	/** Languages the playable itself understands; others fall back to English. */
	languages: readonly Locale[] | 'all';
	/** First-party games get same-origin so their best scores can use localStorage. */
	sandbox: string;
}

const FIRST_PARTY_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
const game = (id: string, title: string, category: ArcadeCategory, gameId?: string): ArcadeGame => ({ id, title, category, gameId, languages: 'all', sandbox: FIRST_PARTY_SANDBOX });

export const ARCADE_CATEGORIES: ArcadeCategory[] = ['puzzle', 'word', 'brain', 'board', 'skill', 'arcade', 'sports'];

export const ARCADE_GAMES: ArcadeGame[] = [
	// Puzzle
	game('sudoku', 'Sudoku', 'puzzle', 'sudoku-challenge'),
	game('block-puzzle', 'Block Puzzle', 'puzzle', 'blokito-puzzle'),
	game('tile-match', 'Tile Match', 'puzzle', 'mochi-tiles'),
	game('2048', '2048', 'puzzle'),
	game('water-sort', 'Water Sort', 'puzzle'),
	game('fruit-merge', 'Fruit Merge', 'puzzle'),
	game('candy-match', 'Candy Match', 'puzzle'),
	game('minesweeper', 'Minesweeper', 'puzzle'),
	game('ball-sort', 'Ball Sort', 'puzzle'),
	game('bus-sort', 'Bus Sort', 'puzzle'),
	game('screw-puzzle', 'Screw Puzzle', 'puzzle'),
	game('parking-escape', 'Parking Escape', 'puzzle'),
	game('number-drop', 'Number Drop', 'puzzle'),
	game('nonogram', 'Nonogram', 'puzzle'),
	game('color-connect', 'Color Connect', 'puzzle'),
	game('pipe-connect', 'Pipe Connect', 'puzzle'),
	game('sliding-puzzle', 'Sliding Puzzle', 'puzzle'),
	game('candy-rope', 'Candy Rope', 'puzzle'),
	// Word
	game('word-guess', 'Word Guess', 'word'),
	game('crossword', 'Mini Crossword', 'word'),
	game('hangman', 'Hangman', 'word'),
	game('typing-speed', 'Typing Speed', 'word'),
	// Brain
	game('math-rush', 'Math Rush', 'brain', 'math-challenge'),
	game('memory-pairs', 'Memory Pairs', 'brain', 'memory-pairs'),
	game('reaction-test', 'Reaction Test', 'brain'),
	// Board & card
	game('solitaire', 'Solitaire', 'board'),
	game('blackjack', 'Blackjack', 'board'),
	game('tic-tac-toe', 'Tic-Tac-Toe', 'board'),
	game('checkers', 'Checkers', 'board'),
	game('four-in-a-row', 'Four in a Row', 'board'),
	// Skill
	game('tower-stack', 'Tower Stack', 'skill'),
	game('stack-up', 'Stack Up', 'skill'),
	game('knife-throw', 'Knife Throw', 'skill'),
	game('helix-drop', 'Helix Drop', 'skill'),
	game('color-gate', 'Color Gate', 'skill'),
	game('bottle-flip', 'Bottle Flip', 'skill'),
	game('ball-maze', 'Ball Maze', 'skill'),
	// Arcade
	game('fruit-slice', 'Fruit Slice', 'arcade'),
	game('bubble-shooter', 'Bubble Shooter', 'arcade'),
	game('snake', 'Snake', 'arcade'),
	game('chicken-cross', 'Chicken Cross', 'arcade'),
	game('jumpy-climb', 'Jumpy Climb', 'arcade'),
	game('sky-hopper', 'Sky Hopper', 'arcade'),
	game('brick-breaker', 'Brick Breaker', 'arcade'),
	game('star-defender', 'Star Defender', 'arcade'),
	game('mole-smash', 'Mole Smash', 'arcade'),
	game('mini-pinball', 'Mini Pinball', 'arcade'),
	game('gold-digger', 'Gold Digger', 'arcade'),
	game('blob-arena', 'Blob Arena', 'arcade'),
	{ id: 'aster-strike', title: 'Aster Strike', category: 'arcade', gameId: 'aster-strike', languages: ['en', 'vi'], sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox' },
	// Sports
	game('hoop-shot', 'Hoop Shot', 'sports'),
	game('penalty-kick', 'Penalty Kick', 'sports'),
	game('mini-golf', 'Mini Golf', 'sports'),
	game('air-hockey', 'Air Hockey', 'sports'),
	game('paddle-duel', 'Paddle Duel', 'sports'),
];

/** Screenshot used for social cards and structured data; captured from the game itself. */
export const arcadeCover = (game: ArcadeGame) => `/media/arcade/${game.id}.jpg`;

export function playableUrl(game: ArcadeGame, lang: Locale) {
	const supported = game.languages === 'all' || game.languages.includes(lang);
	return `/playable/${game.id}/index.html?lang=${supported ? lang : 'en'}`;
}
