const axios = require('axios');
const { getOsuToken } = require('./get-token.js');

async function getPlayer(username) {
    const token = await getOsuToken();

    try {
        const userRes = await axios.get(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/osu`, {
            headers: {Authorization: `Bearer ${token}`}
        });

        return {
            'id': userRes.data.id,
            'username': userRes.data.username,
        };
    } catch (error) {
        console.error(`Error fetching player data for ${username}:`, error);
        return false;
    }
}

module.exports = {
    getPlayer
};