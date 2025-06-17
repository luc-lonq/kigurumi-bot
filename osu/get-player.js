const axios = require('axios');
const { getOsuToken } = require('./get-token.js');

async function getPlayer(username) {
    const token = await getOsuToken();

    const userRes = await axios.get(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/osu`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (userRes.status !== 200) {
        console.error(userRes);
        return false;
    }

    return {
        'id': userRes.data.id,
        'username': userRes.data.username,
    };
}

module.exports = {
    getPlayer
};