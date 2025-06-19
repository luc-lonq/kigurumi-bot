const axios = require('axios');
const { getOsuToken } = require('./get-token.js');
const { findPlayers } = require('../db/player.js');
const { createScore, findScore } = require('../db/score.js');
const { findMapByBeatmapId } = require('../db/map.js');

async function getRecentScore(username) {
    const token = await getOsuToken();

    if (!token) {
        console.error('Token not found');
        return false;
    }

    const player = findPlayers().find(p => p.username === username);
    if (!player) {
        console.error('Player not found');
        return false;
    }

    const scoresRes = await axios.get(`https://osu.ppy.sh/api/v2/users/${player.osu_id}/scores/recent?limit=1&legacy_only=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const score = scoresRes.data[0];
    if (!score) {
        return {message: `Aucun score trouvé pour le joueur ${username}.`};
    }

    const map = findMapByBeatmapId(score.beatmap.id);
    if (!map) {
        return {message: `La map du dernier score n'est pas présente dans le mappool.`};
    }

    if (map.mod && !score.mods.includes(map.mod)) {
        return {message: `La map ${map.title} - ${map.artist} [${map.version}] doit être jouée avec le mod ${map.mod}.`};
    }

    const oldScore = findScore(player.id, map.id);

    if (!oldScore || oldScore.misses > score.statistics.count_miss) {
        createScore(player.id, map.id, score.statistics.count_miss, score.max_combo, score.accuracy);
    }

    return {
        title: score.beatmapset.title,
        artist: score.beatmapset.artist,
        version: score.beatmap.version,
        miss: score.statistics.count_miss,
        previous: oldScore ? oldScore.misses : null,
        accuracy: (score.accuracy * 100).toFixed(2),
        combo: score.max_combo,
        mods: score.mods,
    };
}

module.exports = {
    getRecentScore
};