const db = require('../db');

function findPlayerById(id) {
	const stmt = db.prepare(`
    SELECT id, osu_id, username
    FROM players
    WHERE id = ?
  `);
	const player = stmt.get(id);
	return player;
}

function findPlayerByUsername(username) {
	const stmt = db.prepare(`
    SELECT id, osu_id, username
    FROM players
    WHERE username = ?
  `);
	const player = stmt.get(username);
	return player;
}

function findPlayers() {
  const stmt = db.prepare(`
    SELECT id, osu_id, username
    FROM players
  `);
  const players = stmt.all();
  return players;
}

function createPlayer(osu_id, username) {
	const stmt = db.prepare(`
    INSERT INTO players (osu_id, username)
    VALUES (?, ?)
    ON CONFLICT(osu_id) DO UPDATE SET username = excluded.username
  `);
	stmt.run(osu_id, username);
}

module.exports = {
    findPlayerById,
    findPlayerByUsername,
    findPlayers,
    createPlayer,
};