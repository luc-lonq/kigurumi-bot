const db = require('../db');

function findMaps() {
    const stmt = db.prepare(`
    SELECT id, beatmap_id, title, artist, version
    FROM maps
  `);
    const maps = stmt.all();
    return maps;
}

function findMapById(id) {
    const stmt = db.prepare(`
    SELECT id, beatmap_id, title, artist, version
    FROM maps
    WHERE id = ?
  `);
    const map = stmt.get(id);
    return map;
}

function findMapByBeatmapId(beatmap_id) {
    const stmt = db.prepare(`
    SELECT id, beatmap_id, title, artist, version
    FROM maps
    WHERE beatmap_id = ?
  `);
    const map = stmt.get(beatmap_id);
    return map;
}

function createMap(beatmap_id, title, artist, version) {
    const stmt = db.prepare(`
    INSERT INTO maps (beatmap_id, title, artist, version)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(beatmap_id) DO UPDATE SET title = excluded.title, artist = excluded.artist, version = excluded.version
  `);
    stmt.run(beatmap_id, title, artist, version);
}

function removeMap(id) {
    const stmt = db.prepare(`
    DELETE FROM maps
    WHERE id = ?
  `);
    stmt.run(id);
}

module.exports = {
    findMaps,
    findMapById,
    findMapByBeatmapId,
    createMap,
    removeMap
};