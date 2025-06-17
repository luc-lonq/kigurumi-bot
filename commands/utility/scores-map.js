const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findScoresByMap } = require('../../db/score.js');
const { findMapById, findMaps } = require('../../db/map.js');
const { findPlayers } = require('../../db/player.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scores-map')
        .setDescription('Affiche les scores d\'une map')
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Recherche une map')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const maps = await findMaps(focused);

        const choices = maps.slice(0, 25).map(map => ({
            name: `${map.title} - ${map.artist} [${map.version}]`,
            value: map.id.toString()
        }));

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const mapId = interaction.options.getString('map');
        const map = await findMapById(mapId);

        if (!map) {
            return interaction.reply({
                content: `❌ La map avec l'ID **${mapId}** n'existe pas.`,
                ephemeral: true
            });
        }

        const scores = await findScoresByMap(map.id);
        const players = await findPlayers();

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Classement - ${map.title} - ${map.artist} [${map.version}]`)
            .setColor('#00bfff')
            .setTimestamp();

        if (scores.length === 0) {
            embed.setDescription('Aucun score trouvé pour cette map.');
        } else {
            scores.sort((a, b) => a.misses - b.misses);

            const top = scores.map((score, index) => {
                const player = players.find(p => p.id === score.player_id);
                if (!player) return null;

                return `**#${index + 1}** – ${player.username} : ${score.misses} ❌`;
            }).filter(Boolean);

            embed.setDescription(top.join('\n'));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
