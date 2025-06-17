const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findPlayerByUsername, findPlayers } = require('../../db/player.js');
const { findScoresByPlayer } = require('../../db/score.js');
const { findMaps } = require('../../db/map.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scores-player')
        .setDescription('Affiche les scores d\'un joueur')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur du joueur')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const players = findPlayers();
        const filtered = players.filter(player => player.username.toLowerCase().includes(focusedValue.toLowerCase()));
        const choices = filtered.slice(0, 25).map(player => ({
            name: player.username,
            value: player.username
        }));
        await interaction.respond(choices);
    },
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