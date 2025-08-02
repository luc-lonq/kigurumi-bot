const db = require('../db');

function findLinkByDiscordId(discord_id) {
    const stmt = db.prepare(`
    SELECT id, player_id, discord_id
    FROM link
    WHERE discord_id = ?
  `);
    const link = stmt.get(discord_id);
    return link;
}

function createLink(player_id, discord_id) {
    const stmt = db.prepare(`
    INSERT INTO link (player_id, discord_id)
    VALUES (?, ?)
    ON CONFLICT(discord_id) DO UPDATE SET player_id = excluded.player_id
  `);
    stmt.run(player_id, discord_id);
    return findLinkByDiscordId(discord_id);
}

module.exports = {
    findLinkByDiscordId,
    createLink
}