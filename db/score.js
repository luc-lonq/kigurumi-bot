const db = require('../db');

function findScore(player_id, map_id) {
    const stmt = db.prepare(`
    SELECT id, player_id, map_id, misses, combo, accuracy
    FROM scores
    WHERE player_id = ? AND map_id = ?
  `);
    const score = stmt.get(player_id, map_id);
    return score;
}

function findScores() {
    const stmt = db.prepare(`
    SELECT id, player_id, map_id, misses, combo, accuracy
    FROM scores
  `);
    const scores = stmt.all();
    return scores;
}

function createScore(player_id, map_id, misses, combo, accuracy) {
    const stmt = db.prepare(`
    INSERT INTO scores (player_id, map_id, misses, combo, accuracy)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(player_id, map_id) DO UPDATE SET misses = excluded.misses, combo = excluded.combo, accuracy = excluded.accuracy
  `);
    stmt.run(player_id, map_id, misses, combo, accuracy);
}

function findScoresByPlayer(player_id) {
    const stmt = db.prepare(`
    SELECT id, player_id, map_id, misses, combo, accuracy
    FROM scores
    WHERE player_id = ?
  `);
    const scores = stmt.all(player_id);
    return scores;
}

function findScoresByMap(map_id) {
    const stmt = db.prepare(`
    SELECT id, player_id, map_id, misses, combo, accuracy
    FROM scores
    WHERE map_id = ?
  `);
    const scores = stmt.all(map_id);
    return scores;
}

function removeScoreFromPlayer(player_id) {
    const stmt = db.prepare(`
    DELETE FROM scores
    WHERE player_id = ?
  `);
    stmt.run(player_id);
}

function removeScoreFromMap(map_id) {
    const stmt = db.prepare(`
    DELETE FROM scores
    WHERE map_id = ?
  `);
    stmt.run(map_id);
}

module.exports = {
    findScore,
    findScores,
    createScore,
    findScoresByPlayer,
    findScoresByMap,
    removeScoreFromPlayer,
    removeScoreFromMap
};