const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { findMaps } = require('../../db/map.js');
const { findPlayers } = require('../../db/player.js');
const { findScores } = require('../../db/score.js');

const PAGE_SIZE = 10;

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

        function generateEmbed(page) {
            const embed = new EmbedBuilder()
                .setTitle('🏆 Classement')
                .setColor(0x0099FF)
                .setTimestamp();

            const start = page * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const leaderboardPage = leaderboard.slice(start, end);

            if (leaderboardPage.length === 0) {
                embed.setDescription('Aucun joueur trouvé pour cette page.');
                return embed;
            }

            for (const [i, entry] of leaderboardPage.entries()) {
                const position = start + i + 1;
                embed.addFields({
                    name: `#${position} - ${entry.player.username}`,
                    value: `**${entry.ratio.toFixed(2)}** - ${entry.totalMisscount} :x:`,
                    inline: false
                });
            }
            embed.setFooter({ text: `Page ${page + 1} / ${Math.ceil(leaderboard.length / PAGE_SIZE)}` });
            return embed;
        }
        
        function getRow(page, maxPage) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === maxPage)
            );
        }

        let page = 0;
        const maxPage = Math.max(0, Math.ceil(leaderboard.length / PAGE_SIZE) - 1);

        const message = await interaction.reply({
            embeds: [generateEmbed(page)],
            components: [getRow(page, maxPage)],
            fetchReply: true
        });

        if (maxPage === 0) return;

        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'prev' && page > 0) page--;
            if (i.customId === 'next' && page < maxPage) page++;
            await i.update({
                embeds: [generateEmbed(page)],
                components: [getRow(page, maxPage)]
            });
        });

        collector.on('end', async () => {
            await message.edit({
                components: [getRow(page, maxPage).setComponents(
                    ...getRow(page, maxPage).components.map(btn => btn.setDisabled(true))
                )]
            });
        });

    }
};

function epsilon(miss, decayRate = 1.0) {
    return miss > 10 ? 0 : Math.exp(-decayRate * miss);
}
