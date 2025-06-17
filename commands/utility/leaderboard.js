const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { findMaps } = require('../../db/map.js');
const { findPlayers } = require('../../db/player.js');
const { findScores } = require('../../db/score.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Affiche le leaderboard'),
    async execute(interaction) {
        const players = findPlayers();
        const scores = findScores();
        const maps = findMaps();

        const leaderboard = [];
        const eligiblePlayers = players.filter(player => {
            const playerScores = scores.filter(score => score.player_id === player.id);
            return playerScores.length === maps.length;
        });

        const eligibleScores = scores.filter(score =>
            maps.some(map => map.id === score.map_id) &&
            eligiblePlayers.some(player => player.id === score.player_id)
        );

        for (const map of maps) {
            const scoresForMap = eligibleScores.filter(score => score.map_id === map.id);
            const min_miss = Math.min(...scoresForMap.map(score => score.misses));
            map.best = min_miss;
        }

        for (const player of eligiblePlayers) {
            const playerScores = scores.filter(score => score.player_id === player.id);
            let playerRatio = 0;
            let totalMisscount = 0;

            for (const map of maps) {
                const playerScore = playerScores.find(score => score.map_id === map.id);
                const best = map.best;
                if (playerScore) {
                    playerRatio += (playerScore.misses + epsilon(best)) / (best + epsilon(best));
                    totalMisscount += playerScore.misses;
                }
            }

            leaderboard.push({
                player: player,
                ratio: playerRatio / maps.length,
                totalMisscount: totalMisscount,
            });
        }

        leaderboard.sort((a, b) => a.ratio - b.ratio);

        if (leaderboard.length === 0) {
            await interaction.reply('Aucun joueur éligible pour le leaderboard.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Classement')
            .setColor(0x0099FF)
            .setTimestamp();

        const lines = leaderboard.map((entry, index) =>
            `**#${index + 1}** – ${entry.player.username} : **${entry.ratio.toFixed(2)}** (${entry.totalMisscount} :x:)`
        );

        embed.setDescription(lines.join('\n'));

        await interaction.reply({ embeds: [embed] });
    }
};

function epsilon(miss, decayRate = 1.0) {
    return miss > 10 ? 0 : Math.exp(-decayRate * miss);
}
