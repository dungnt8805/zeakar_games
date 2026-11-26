-- Player accounts, sessions, synced game saves and leaderboard scores.
CREATE TABLE players (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	password_hash TEXT NOT NULL,
	nickname TEXT NOT NULL,
	avatar INTEGER NOT NULL DEFAULT 0,
	verified INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL
);

-- One pending code per player and purpose ('verify' or 'reset'); only the hash is stored.
CREATE TABLE email_codes (
	player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	purpose TEXT NOT NULL,
	code_hash TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0,
	sent_at INTEGER NOT NULL,
	PRIMARY KEY (player_id, purpose)
);

CREATE TABLE sessions (
	token_hash TEXT PRIMARY KEY,
	player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_player ON sessions(player_id);

-- The game's own localStorage entries (keys under milaan.<game>.), stored as JSON.
CREATE TABLE saves (
	player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	game TEXT NOT NULL,
	data TEXT NOT NULL,
	updated_at INTEGER NOT NULL,
	PRIMARY KEY (player_id, game)
);

CREATE TABLE scores (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	game TEXT NOT NULL,
	score INTEGER NOT NULL,
	created_at INTEGER NOT NULL
);
CREATE INDEX scores_game_time ON scores(game, created_at);
CREATE INDEX scores_player_game ON scores(player_id, game, created_at);
