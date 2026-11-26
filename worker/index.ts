/**
 * lamian.dev worker: serves the static Astro build and the player API under /api/*.
 * Accounts are email + password with a 6-digit email code for sign-up and password reset.
 */
import { LEADERBOARDS } from '../src/data/leaderboards';
import { ARCADE_GAMES } from '../src/data/arcade';

interface Env {
	ASSETS: Fetcher;
	DB: D1Database;
	AUTH_LIMIT?: RateLimit;
	MAILJET_API_KEY?: string;
	MAILJET_SECRET_KEY?: string;
	MAIL_FROM_EMAIL: string;
	MAIL_FROM_NAME: string;
}

const DAY = 86_400_000;
const SESSION_DAYS = 60;
const CODE_TTL = 15 * 60_000;
const CODE_RESEND_GAP = 60_000;
const CODE_MAX_ATTEMPTS = 5;
const PBKDF2_ITERATIONS = 100_000; // Workers' WebCrypto ceiling.
const MAX_SAVE_BYTES = 64 * 1024;
const AVATAR_COUNT = 24;
const GAME_IDS = new Set(ARCADE_GAMES.map(g => g.id));
const COOKIE = 'lamian_session';

class HttpError extends Error {
	constructor(readonly status: number, readonly code: string) { super(code); }
}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.endsWith('.html')) return serveHtmlFile(request, env, url);
		if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
		try {
			return await route(request, env, url);
		} catch (err) {
			if (err instanceof HttpError) return json({ error: err.code }, err.status);
			console.error(err);
			return json({ error: 'server' }, 500);
		}
	},
} satisfies ExportedHandler<Env>;

/** Asset routing drops ".html" with a redirect; legacy links (e.g. /chess-privacy.html) keep working at their own URL instead. */
async function serveHtmlFile(request: Request, env: Env, url: URL) {
	const target = new URL(url);
	target.pathname = url.pathname.endsWith('/index.html') ? url.pathname.slice(0, -'index.html'.length) : url.pathname.slice(0, -'.html'.length);
	const res = await env.ASSETS.fetch(new Request(target, request));
	return res.status >= 300 && res.status < 400 ? env.ASSETS.fetch(request) : res;
}

async function route(request: Request, env: Env, url: URL): Promise<Response> {
	const method = request.method;
	const path = url.pathname.replace(/\/+$/, '');
	if (method !== 'GET' && method !== 'HEAD') checkSameOrigin(request, url);

	if (path.startsWith('/api/auth/')) {
		if (method !== 'POST') throw new HttpError(405, 'method');
		await rateLimit(request, env);
		const body = await readJson(request);
		switch (path) {
			case '/api/auth/signup': return signup(env, body);
			case '/api/auth/verify': return verify(env, body);
			case '/api/auth/resend': return resend(env, body);
			case '/api/auth/login': return login(env, body);
			case '/api/auth/logout': return logout(request, env);
			case '/api/auth/forgot': return forgot(env, body);
			case '/api/auth/reset': return reset(env, body);
		}
		throw new HttpError(404, 'not_found');
	}

	if (path === '/api/me') {
		const player = await requirePlayer(request, env);
		if (method === 'GET') return json(await profile(env, player));
		if (method === 'PATCH') return updateProfile(env, player, await readJson(request));
		if (method === 'DELETE') {
			await rateLimit(request, env);
			return deleteAccount(env, player, await readJson(request));
		}
		throw new HttpError(405, 'method');
	}

	if (path === '/api/saves' && method === 'GET') {
		const player = await requirePlayer(request, env);
		const { results } = await env.DB.prepare('SELECT game, data, updated_at FROM saves WHERE player_id = ?').bind(player.id).all<{ game: string; data: string; updated_at: number }>();
		return json({ saves: Object.fromEntries(results.map(r => [r.game, { data: JSON.parse(r.data), updatedAt: r.updated_at }])) });
	}

	const save = path.match(/^\/api\/saves\/([a-z0-9-]+)$/);
	if (save && method === 'PUT') return putSave(env, await requirePlayer(request, env), save[1], request);

	if (path === '/api/scores' && method === 'POST') return postScore(env, await requirePlayer(request, env), await readJson(request));

	const board = path.match(/^\/api\/leaderboard\/([a-z0-9-]+)$/);
	if (board && method === 'GET') return leaderboard(request, env, board[1], url.searchParams.get('period'));

	throw new HttpError(404, 'not_found');
}

// ---------- auth ----------

interface Player { id: string; email: string; nickname: string; avatar: number; verified: number; password_hash: string; created_at: number; }

async function signup(env: Env, body: Record<string, unknown>) {
	const email = readEmail(body.email);
	const password = readPassword(body.password);
	const nickname = body.nickname === undefined || body.nickname === '' ? randomNickname() : readNickname(body.nickname);
	const existing = await findByEmail(env, email);
	if (existing?.verified) throw new HttpError(409, 'email_taken');
	const hash = await hashPassword(password);
	let id = existing?.id;
	if (existing) {
		await env.DB.prepare('UPDATE players SET password_hash = ?, nickname = ? WHERE id = ?').bind(hash, nickname, id).run();
	} else {
		id = crypto.randomUUID();
		await env.DB.prepare('INSERT INTO players (id, email, password_hash, nickname, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, email, hash, nickname, randomInt(AVATAR_COUNT), Date.now()).run();
	}
	await sendCode(env, id!, email, 'verify', true);
	return json({ ok: true, next: 'verify' });
}

async function verify(env: Env, body: Record<string, unknown>) {
	const player = await findByEmail(env, readEmail(body.email));
	if (!player) throw new HttpError(400, 'bad_code');
	await consumeCode(env, player.id, 'verify', body.code);
	await env.DB.prepare('UPDATE players SET verified = 1 WHERE id = ?').bind(player.id).run();
	return startSession(env, player.id);
}

async function resend(env: Env, body: Record<string, unknown>) {
	const purpose = body.purpose === 'reset' ? 'reset' : 'verify';
	const player = await findByEmail(env, readEmail(body.email));
	// Same answer whether or not the address exists.
	if (player && (purpose === 'reset' ? player.verified : !player.verified)) await sendCode(env, player.id, player.email, purpose, false);
	return json({ ok: true });
}

async function login(env: Env, body: Record<string, unknown>) {
	const email = readEmail(body.email);
	const password = typeof body.password === 'string' ? body.password : '';
	const player = await findByEmail(env, email);
	if (!player || !(await checkPassword(password, player.password_hash))) throw new HttpError(401, 'bad_login');
	if (!player.verified) {
		await sendCode(env, player.id, player.email, 'verify', false);
		throw new HttpError(403, 'unverified');
	}
	return startSession(env, player.id);
}

async function logout(request: Request, env: Env) {
	const token = readCookie(request);
	if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
	return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

async function forgot(env: Env, body: Record<string, unknown>) {
	const player = await findByEmail(env, readEmail(body.email));
	if (player?.verified) await sendCode(env, player.id, player.email, 'reset', false);
	return json({ ok: true, next: 'reset' });
}

async function reset(env: Env, body: Record<string, unknown>) {
	const player = await findByEmail(env, readEmail(body.email));
	if (!player) throw new HttpError(400, 'bad_code');
	const password = readPassword(body.password);
	await consumeCode(env, player.id, 'reset', body.code);
	await env.DB.batch([
		env.DB.prepare('UPDATE players SET password_hash = ?, verified = 1 WHERE id = ?').bind(await hashPassword(password), player.id),
		env.DB.prepare('DELETE FROM sessions WHERE player_id = ?').bind(player.id),
	]);
	return startSession(env, player.id);
}

async function sendCode(env: Env, playerId: string, email: string, purpose: 'verify' | 'reset', force: boolean) {
	const now = Date.now();
	const prev = await env.DB.prepare('SELECT sent_at FROM email_codes WHERE player_id = ? AND purpose = ?').bind(playerId, purpose).first<{ sent_at: number }>();
	if (prev && now - prev.sent_at < CODE_RESEND_GAP) {
		if (force) throw new HttpError(429, 'too_soon');
		return;
	}
	const code = String(randomInt(1_000_000)).padStart(6, '0');
	await env.DB.prepare('INSERT OR REPLACE INTO email_codes (player_id, purpose, code_hash, expires_at, attempts, sent_at) VALUES (?, ?, ?, ?, 0, ?)')
		.bind(playerId, purpose, await sha256(`${playerId}:${code}`), now + CODE_TTL, now).run();
	const subject = purpose === 'verify' ? `${code} is your Lamian verification code` : `${code} is your Lamian password reset code`;
	const intro = purpose === 'verify' ? 'Use this code to confirm your email and finish creating your Lamian player account:' : 'Use this code to set a new password for your Lamian player account:';
	const text = `${intro}\n\n${code}\n\nThe code expires in 15 minutes. If you did not ask for it, you can ignore this email.`;
	if (!env.MAILJET_API_KEY || !env.MAILJET_SECRET_KEY) {
		console.log(`[dev] ${purpose} code for ${email}: ${code}`);
		return;
	}
	const res = await fetch('https://api.mailjet.com/v3.1/send', {
		method: 'POST',
		headers: { authorization: `Basic ${btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`)}`, 'content-type': 'application/json' },
		body: JSON.stringify({ Messages: [{ From: { Email: env.MAIL_FROM_EMAIL, Name: env.MAIL_FROM_NAME }, To: [{ Email: email }], Subject: subject, TextPart: text }] }),
	});
	if (!res.ok) {
		console.error('mailjet failed', res.status, await res.text());
		throw new HttpError(502, 'email_failed');
	}
}

async function consumeCode(env: Env, playerId: string, purpose: string, raw: unknown) {
	const code = typeof raw === 'string' ? raw.replace(/\D/g, '') : '';
	const row = await env.DB.prepare('SELECT code_hash, expires_at, attempts FROM email_codes WHERE player_id = ? AND purpose = ?').bind(playerId, purpose).first<{ code_hash: string; expires_at: number; attempts: number }>();
	if (!row || row.expires_at < Date.now() || row.attempts >= CODE_MAX_ATTEMPTS) throw new HttpError(400, 'code_expired');
	if (code.length !== 6 || !timingSafeEqual(await sha256(`${playerId}:${code}`), row.code_hash)) {
		await env.DB.prepare('UPDATE email_codes SET attempts = attempts + 1 WHERE player_id = ? AND purpose = ?').bind(playerId, purpose).run();
		throw new HttpError(400, 'bad_code');
	}
	await env.DB.prepare('DELETE FROM email_codes WHERE player_id = ? AND purpose = ?').bind(playerId, purpose).run();
}

async function startSession(env: Env, playerId: string) {
	const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
	const now = Date.now();
	await env.DB.batch([
		env.DB.prepare('DELETE FROM sessions WHERE player_id = ? AND expires_at < ?').bind(playerId, now),
		env.DB.prepare('INSERT INTO sessions (token_hash, player_id, expires_at) VALUES (?, ?, ?)').bind(await sha256(token), playerId, now + SESSION_DAYS * DAY),
	]);
	const player = await env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(playerId).first<Player>();
	return json(await profile(env, player!), 200, { 'set-cookie': sessionCookie(token, SESSION_DAYS * 86_400) });
}

async function currentPlayer(request: Request, env: Env): Promise<Player | null> {
	const token = readCookie(request);
	if (!token) return null;
	return env.DB.prepare('SELECT p.* FROM sessions s JOIN players p ON p.id = s.player_id WHERE s.token_hash = ? AND s.expires_at > ? AND p.verified = 1')
		.bind(await sha256(token), Date.now()).first<Player>();
}

async function requirePlayer(request: Request, env: Env) {
	const player = await currentPlayer(request, env);
	if (!player) throw new HttpError(401, 'signed_out');
	return player;
}

// ---------- profile ----------

async function profile(env: Env, player: Player) {
	const { results } = await env.DB.prepare(
		`SELECT game, MAX(score) AS hi, MIN(score) AS lo, COUNT(*) AS plays, MAX(created_at) AS last FROM scores WHERE player_id = ? GROUP BY game`,
	).bind(player.id).all<{ game: string; hi: number; lo: number; plays: number; last: number }>();
	const saves = await env.DB.prepare('SELECT game, updated_at FROM saves WHERE player_id = ? ORDER BY updated_at DESC').bind(player.id).all<{ game: string; updated_at: number }>();
	const bests = await Promise.all(results.filter(r => LEADERBOARDS[r.game]).map(async r => {
		const spec = LEADERBOARDS[r.game];
		const best = spec.order === 'desc' ? r.hi : r.lo;
		return { game: r.game, best, plays: r.plays, last: r.last, rank: await rankOf(env, r.game, spec.order, best, 0) };
	}));
	return {
		player: { id: player.id, email: player.email, nickname: player.nickname, avatar: player.avatar, createdAt: player.created_at },
		bests,
		games: saves.results.map(s => ({ game: s.game, updatedAt: s.updated_at })),
	};
}

async function updateProfile(env: Env, player: Player, body: Record<string, unknown>) {
	const nickname = body.nickname === undefined ? player.nickname : readNickname(body.nickname);
	const avatar = body.avatar === undefined ? player.avatar : Number(body.avatar);
	if (!Number.isInteger(avatar) || avatar < 0 || avatar >= AVATAR_COUNT) throw new HttpError(400, 'bad_avatar');
	await env.DB.prepare('UPDATE players SET nickname = ?, avatar = ? WHERE id = ?').bind(nickname, avatar, player.id).run();
	return json(await profile(env, { ...player, nickname, avatar }));
}

async function deleteAccount(env: Env, player: Player, body: Record<string, unknown>) {
	if (!(await checkPassword(typeof body.password === 'string' ? body.password : '', player.password_hash))) throw new HttpError(401, 'bad_login');
	// D1 enforces foreign keys, so this also removes sessions, codes, saves and scores.
	await env.DB.prepare('DELETE FROM players WHERE id = ?').bind(player.id).run();
	return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}

// ---------- saves ----------

async function putSave(env: Env, player: Player, game: string, request: Request) {
	if (!GAME_IDS.has(game)) throw new HttpError(404, 'unknown_game');
	const raw = await request.text();
	if (raw.length > MAX_SAVE_BYTES) throw new HttpError(413, 'too_large');
	const body = parseJson(raw);
	const data = body.data;
	if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'bad_save');
	for (const [key, value] of Object.entries(data)) {
		if (!key.startsWith('milaan.') || typeof value !== 'string') throw new HttpError(400, 'bad_save');
	}
	const now = Date.now();
	await env.DB.prepare('INSERT OR REPLACE INTO saves (player_id, game, data, updated_at) VALUES (?, ?, ?, ?)').bind(player.id, game, JSON.stringify(data), now).run();
	return json({ ok: true, updatedAt: now });
}

// ---------- scores ----------

async function postScore(env: Env, player: Player, body: Record<string, unknown>) {
	const game = String(body.game ?? '');
	const spec = LEADERBOARDS[game];
	if (!spec) throw new HttpError(404, 'unknown_game');
	const score = Number(body.score);
	if (!Number.isInteger(score) || score < spec.min || score > spec.max) throw new HttpError(400, 'bad_score');
	const now = Date.now();
	const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE player_id = ? AND game = ? AND created_at > ?').bind(player.id, game, now - 60_000).first<{ n: number }>();
	if ((recent?.n ?? 0) >= 6) throw new HttpError(429, 'too_many');
	await env.DB.prepare('INSERT INTO scores (player_id, game, score, created_at) VALUES (?, ?, ?, ?)').bind(player.id, game, score, now).run();
	return json({ ok: true, rank: await rankOf(env, game, spec.order, score, 0) });
}

function periodStart(period: string | null) {
	const now = new Date();
	if (period === 'day') return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	if (period === 'week') {
		const day = (now.getUTCDay() + 6) % 7; // weeks start on Monday (UTC)
		return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day);
	}
	return 0;
}

/** 1-based rank a score would have among each player's best since `since`. */
async function rankOf(env: Env, game: string, order: 'asc' | 'desc', score: number, since: number) {
	const agg = order === 'desc' ? 'MAX' : 'MIN';
	const cmp = order === 'desc' ? '>' : '<';
	const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM (SELECT ${agg}(score) AS best FROM scores WHERE game = ? AND created_at >= ? GROUP BY player_id) WHERE best ${cmp} ?`)
		.bind(game, since, score).first<{ n: number }>();
	return (row?.n ?? 0) + 1;
}

async function leaderboard(request: Request, env: Env, game: string, periodParam: string | null) {
	const spec = LEADERBOARDS[game];
	if (!spec) throw new HttpError(404, 'unknown_game');
	const period = periodParam === 'day' || periodParam === 'week' ? periodParam : 'all';
	const since = periodStart(period);
	const agg = spec.order === 'desc' ? 'MAX' : 'MIN';
	const dir = spec.order === 'desc' ? 'DESC' : 'ASC';
	const { results } = await env.DB.prepare(
		`SELECT p.id, p.nickname, p.avatar, b.best FROM (SELECT player_id, ${agg}(score) AS best, MIN(created_at) AS first FROM scores WHERE game = ? AND created_at >= ? GROUP BY player_id) b
		 JOIN players p ON p.id = b.player_id ORDER BY b.best ${dir}, b.first ASC LIMIT 50`,
	).bind(game, since).all<{ id: string; nickname: string; avatar: number; best: number }>();
	const me = await currentPlayer(request, env);
	let mine: { rank: number; best: number } | null = null;
	if (me) {
		const row = await env.DB.prepare(`SELECT ${agg}(score) AS best FROM scores WHERE game = ? AND player_id = ? AND created_at >= ?`).bind(game, me.id, since).first<{ best: number | null }>();
		if (row?.best != null) mine = { best: row.best, rank: await rankOf(env, game, spec.order, row.best, since) };
	}
	return json({
		game, period, order: spec.order,
		entries: results.map((r, i) => ({ rank: i + 1, nickname: r.nickname, avatar: r.avatar, score: r.best, me: r.id === me?.id })),
		mine,
	});
}

// ---------- helpers ----------

function checkSameOrigin(request: Request, url: URL) {
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) throw new HttpError(403, 'origin');
}

async function rateLimit(request: Request, env: Env) {
	if (!env.AUTH_LIMIT) return;
	const ip = request.headers.get('cf-connecting-ip') ?? 'local';
	const { success } = await env.AUTH_LIMIT.limit({ key: ip });
	if (!success) throw new HttpError(429, 'too_many');
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
	if (!(request.headers.get('content-type') ?? '').includes('application/json')) throw new HttpError(415, 'json_only');
	return parseJson(await request.text());
}

function parseJson(raw: string): Record<string, unknown> {
	try {
		const value = JSON.parse(raw || '{}');
		if (value && typeof value === 'object' && !Array.isArray(value)) return value;
	} catch { /* fall through */ }
	throw new HttpError(400, 'bad_json');
}

function readEmail(raw: unknown) {
	const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'bad_email');
	return email;
}

function readPassword(raw: unknown) {
	if (typeof raw !== 'string' || raw.length < 8 || raw.length > 200) throw new HttpError(400, 'weak_password');
	return raw;
}

function readNickname(raw: unknown) {
	const nickname = typeof raw === 'string' ? raw.normalize('NFC').replace(/\s+/g, ' ').trim() : '';
	if ([...nickname].length < 2 || [...nickname].length > 20 || /[<>]/.test(nickname)) throw new HttpError(400, 'bad_nickname');
	return nickname;
}

const NICK_A = ['Swift', 'Lucky', 'Brave', 'Clever', 'Sunny', 'Cosmic', 'Happy', 'Mighty', 'Quiet', 'Rapid', 'Jolly', 'Golden'];
const NICK_B = ['Panda', 'Tiger', 'Fox', 'Otter', 'Falcon', 'Koala', 'Dragon', 'Penguin', 'Rabbit', 'Lynx', 'Dolphin', 'Owl'];
function randomNickname() {
	return `${NICK_A[randomInt(NICK_A.length)]}${NICK_B[randomInt(NICK_B.length)]}${1000 + randomInt(9000)}`;
}

function randomInt(max: number) {
	return crypto.getRandomValues(new Uint32Array(1))[0] % max;
}

function findByEmail(env: Env, email: string) {
	return env.DB.prepare('SELECT * FROM players WHERE email = ?').bind(email).first<Player>();
}

function readCookie(request: Request) {
	const header = request.headers.get('cookie') ?? '';
	const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]+)`));
	return match?.[1] ?? null;
}

function sessionCookie(token: string, maxAge: number) {
	return `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

async function hashPassword(password: string) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
	return `pbkdf2$${PBKDF2_ITERATIONS}$${base64url(salt)}$${base64url(hash)}`;
}

async function checkPassword(password: string, stored: string) {
	const [scheme, iter, salt, hash] = stored.split('$');
	if (scheme !== 'pbkdf2' || !password) return false;
	const actual = await pbkdf2(password, fromBase64url(salt), Number(iter));
	return timingSafeEqual(base64url(actual), hash);
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
	const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
	return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

async function sha256(text: string) {
	return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))));
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

function base64url(bytes: Uint8Array) {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string) {
	const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(bin, c => c.charCodeAt(0));
}
