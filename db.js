const Database = require('better-sqlite3');
const db = new Database('osu.db');


db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    osu_id INTEGER UNIQUE,
    username TEXT
  );

  CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY,
    beatmap_id INTEGER UNIQUE,
    title TEXT,
    artist TEXT,
    version TEXT,
    mod TEXT NULL
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY,
    player_id INTEGER,
    map_id INTEGER,
    misses INTEGER,
    combo INTEGER,
    accuracy REAL,
    FOREIGN KEY(player_id) REFERENCES players(id),
    FOREIGN KEY(map_id) REFERENCES maps(id),
    UNIQUE(player_id, map_id)
  );
`);

const pragma = db.prepare(`PRAGMA table_info(maps);`).all();
const hasModColumn = pragma.some(col => col.name === 'mod');

if (!hasModColumn) {
    db.exec(`ALTER TABLE maps ADD COLUMN mod TEXT;`);
    console.log('Colonne "mod" ajoutée à la table maps.');
} else {
    console.log('La colonne "mod" existe déjà dans la table maps.');
}

module.exports = db;