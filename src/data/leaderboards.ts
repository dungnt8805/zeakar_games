/** Games with an online leaderboard. Shared by the site and the API worker. */
export interface LeaderboardSpec {
	/** localStorage key where the game keeps its best score (a number, plain or JSON). */
	key: string;
	/** 'desc' = higher is better, 'asc' = lower is better (e.g. times). */
	order: 'desc' | 'asc';
	/** Scores outside [min, max] are rejected as impossible. */
	min: number;
	max: number;
	/** Shown after the number, e.g. 'm'. */
	unit?: string;
}

const best = (key: string, max: number, unit?: string): LeaderboardSpec => ({ key, order: 'desc', min: 1, max, unit });

export const LEADERBOARDS: Record<string, LeaderboardSpec> = {
	'2048': best('milaan.2048.best', 10_000_000),
	'stack-up': best('milaan.stackUp.best', 100_000),
	'sky-hopper': best('milaan.skyHopper.best', 100_000),
	'math-rush': best('milaan.mathRush.best', 1_000_000),
	'star-defender': best('milaan.starDefender.best', 10_000_000),
	'brick-breaker': best('milaan.brickBreaker.best', 10_000_000),
	'city-defense': best('milaan.cityDefense.best', 100_000_000),
	'ninja-run': best('milaan.ninjaRun.best', 10_000_000),
	'jet-dash': best('milaan.jetDash.best', 10_000_000, 'm'),
	'color-lines': best('milaan.colorLines.best', 10_000_000),
};

/** Reads a stored best score; returns null for anything that is not a whole positive number. */
export function parseBest(raw: string | null): number | null {
	if (raw == null) return null;
	let value: unknown = raw;
	try { value = JSON.parse(raw); } catch { /* plain string */ }
	const n = Math.floor(Number(value));
	return Number.isFinite(n) && n > 0 ? n : null;
}
