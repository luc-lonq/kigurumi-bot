const axios = require('axios');
const { getOsuToken } = require('./get-token.js');

async function getMap(beatmap_id) {
    const token = await getOsuToken();

    const mapRes = await axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${encodeURIComponent(beatmap_id)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (mapRes.status !== 200) {
        console.error(mapRes);
        return false;
    }

    return {
        'id': mapRes.data.id,
        'title': mapRes.data.beatmapset.title,
        'artist': mapRes.data.beatmapset.artist,
        'version': mapRes.data.version,
    };
}

module.exports = {
    getMap
};