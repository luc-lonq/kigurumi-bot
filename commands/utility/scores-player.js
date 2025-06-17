const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findPlayerByUsername } = require('../../db/player.js');
const { findScoresByPlayer } = require('../../db/score.js');
const { findMaps, findMapById } = require('../../db/map.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scores-player')
        .setDescription('Affiche les scores d\'un joueur')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur du joueur')
                .setRequired(true)
        ),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const player = findPlayerByUsername(username);

        if (!player) {
            await interaction.reply(`:x: Le joueur **${username}** n'existe pas.`);
            return;
        }

        const allMaps = findMaps();
        const scores = findScoresByPlayer(player.id);

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Scores de ${username}`)
            .setColor('#00bfff')
            .setTimestamp();

        for (const map of allMaps) {
            const score = scores.find(s => s.map_id === map.id);

            const fieldValue = score
                ? `${score.misses} :x:`
                : `Aucun score`;

            embed.addFields({
                name: `🎵 ${map.title} - ${map.artist} [${map.version}]`,
                value: fieldValue,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};