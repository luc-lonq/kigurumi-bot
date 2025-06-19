const axios = require('axios');
const { getOsuToken } = require('./get-token.js');

async function getMap(beatmap_id, mod = null) {
    const token = await getOsuToken();

    const mapRes = await axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${encodeURIComponent(beatmap_id)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (mapRes.status !== 200) {
        console.error(mapRes);
        return false;
    }

    const mapAttr = await axios.post(`https://osu.ppy.sh/api/v2/beatmaps/${encodeURIComponent(beatmap_id)}/attributes`,
        {
            mods: mod ? [mod.toUpperCase()] : []
        },
        {
            headers: {Authorization: `Bearer ${token}`},
        }
    );

    console.log(mapAttr);
    return {
        'id': mapRes.data.id,
        'title': mapRes.data.beatmapset.title,
        'artist': mapRes.data.beatmapset.artist,
        'version': mapRes.data.version,
        'star_rating': mapAttr.data.attributes.star_rating,
    };
}

module.exports = {
    getMap
};