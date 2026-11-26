/** Browser-side player account helpers: API calls, the cached signed-in player, game save sync and score submission. */
import { LEADERBOARDS, parseBest } from '../data/leaderboards';

export const AVATARS = ['🐼', '🐯', '🦊', '🦦', '🦅', '🐨', '🐲', '🐧', '🐰', '🐱', '🐬', '🦉', '🐸', '🐵', '🦁', '🐻', '🐙', '🦄', '🐢', '🐝', '🦋', '🐳', '🐞', '🦖'];

export interface PlayerProfile {
	player: { id: string; email: string; nickname: string; avatar: number; createdAt: number };
	bests: { game: string; best: number; plays: number; last: number; rank: number }[];
	games: { game: string; updatedAt: number }[];
}

export class ApiError extends Error {}

const CACHE = 'lamian.player';
const store = {
	get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
	set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } },
	remove(key: string) { try { localStorage.removeItem(key); } catch { /* storage blocked */ } },
};

export async function api<T = any>(path: string, init: { method?: string; body?: unknown; keepalive?: boolean } = {}): Promise<T> {
	let res: Response;
	try {
		res = await fetch(path, {
			method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
			headers: init.body === undefined ? undefined : { 'content-type': 'application/json' },
			body: init.body === undefined ? undefined : JSON.stringify(init.body),
			credentials: 'same-origin',
			keepalive: init.keepalive,
		});
	} catch {
		throw new ApiError('network');
	}
	const data = await res.json().catch(() => ({}));
	if (res.status === 401 && data.error === 'signed_out') setCachedPlayer(null);
	if (!res.ok) throw new ApiError(data.error ?? 'server');
	return data as T;
}

/** The last known signed-in player, for instant UI before /api/me answers. */
export function cachedPlayer(): PlayerProfile['player'] | null {
	try { return JSON.parse(store.get(CACHE) ?? 'null'); } catch { return null; }
}

export function setCachedPlayer(player: PlayerProfile['player'] | null) {
	if (player) store.set(CACHE, JSON.stringify(player));
	else store.remove(CACHE);
	window.dispatchEvent(new CustomEvent('lamian:player', { detail: player }));
}

export async function loadProfile(): Promise<PlayerProfile | null> {
	try {
		const profile = await api<PlayerProfile>('/api/me');
		setCachedPlayer(profile.player);
		return profile;
	} catch (err) {
		if ((err as Error).message === 'signed_out') return null;
		throw err;
	}
}

export async function signOut() {
	await api('/api/auth/logout', { body: {} }).catch(() => {});
	setCachedPlayer(null);
}

// ---------- game sync ----------

const camel = (id: string) => id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/**
 * Keeps one game's localStorage entries in sync with the player's account and sends new best scores.
 * Games run in a same-origin iframe, so their writes reach this page as `storage` events.
 * Call before the game loads: resolves once any newer save from the server has been written locally.
 */
const syncing = new Set<string>();
export async function startGameSync(game: string, onScore?: (rank: number) => void) {
	if (!cachedPlayer() || syncing.has(game)) return;
	syncing.add(game);
	const prefixes = new Set([`milaan.${camel(game)}.`]);
	const syncedKey = `lamian.synced.${game}`;
	const sentKey = `lamian.sent.${game}`;
	const spec = LEADERBOARDS[game];

	try {
		const { saves } = await api<{ saves: Record<string, { data: Record<string, string>; updatedAt: number }> }>('/api/saves');
		const remote = saves[game];
		if (remote) {
			for (const key of Object.keys(remote.data)) prefixes.add(key.slice(0, key.indexOf('.', 7) + 1));
			if (remote.updatedAt > Number(store.get(syncedKey) ?? 0)) {
				for (const [key, value] of Object.entries(remote.data)) store.set(key, value);
				store.set(syncedKey, String(remote.updatedAt));
			}
		}
	} catch {
		syncing.delete(game);
		return; // signed out or offline: the game still works from local storage
	}

	const collect = () => {
		const data: Record<string, string> = {};
		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i)!;
				if ([...prefixes].some(p => key.startsWith(p))) data[key] = localStorage.getItem(key)!;
			}
		} catch { /* storage blocked */ }
		return data;
	};

	let timer = 0;
	let dirty = false;
	const upload = async (keepalive = false) => {
		clearTimeout(timer);
		if (!dirty || !cachedPlayer()) return;
		dirty = false;
		const data = collect();
		if (!Object.keys(data).length) return;
		try {
			const { updatedAt } = await api<{ updatedAt: number }>(`/api/saves/${game}`, { method: 'PUT', body: { data }, keepalive });
			store.set(syncedKey, String(updatedAt));
		} catch { dirty = true; }
	};

	const submitBest = async () => {
		if (!spec || !cachedPlayer()) return;
		const best = parseBest(store.get(spec.key));
		const sent = Number(store.get(sentKey) ?? 0);
		if (best == null || (spec.order === 'desc' ? best <= sent : sent && best >= sent)) return;
		try {
			const { rank } = await api<{ rank: number }>('/api/scores', { body: { game, score: best } });
			store.set(sentKey, String(best));
			onScore?.(rank);
		} catch { /* retried on the next change */ }
	};

	window.addEventListener('storage', event => {
		if (!event.key || event.storageArea !== localStorage) return;
		if (![...prefixes].some(p => event.key!.startsWith(p))) return;
		dirty = true;
		clearTimeout(timer);
		timer = window.setTimeout(upload, 3000);
		if (spec && event.key === spec.key) submitBest();
	});
	addEventListener('pagehide', () => upload(true));
	document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') upload(true); });

	// A best set while playing as a guest counts once the player signs in.
	submitBest();
	if (!store.get(syncedKey) && Object.keys(collect()).length) { dirty = true; upload(); }
}
