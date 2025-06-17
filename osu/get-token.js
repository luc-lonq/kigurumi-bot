const axios = require('axios');
const OSU_CLIENT_ID = require('../config.json').osuClientId;
const OSU_CLIENT_SECRET = require('../config.json').osuClientSecret;


async function getOsuToken() {
    const res = await axios.post('https://osu.ppy.sh/oauth/token', {
        client_id: OSU_CLIENT_ID,
        client_secret: OSU_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public'
    });

    return res.data.access_token;
}

module.exports = {
    getOsuToken
};
