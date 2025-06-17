const { SlashCommandBuilder } = require('discord.js');
const { removePlayer, findPlayers } = require('../../db/player.js');
const { removeScoreFromPlayer } = require('../../db/score.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-player')
        .setDescription('Supprime un joueur de la base de données')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur osu!')
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
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.',
                ephemeral: true
            });
        }
        const username = interaction.options.getString('username');
        const players = findPlayers();
        const player = players.find(p => p.username.toLowerCase() === username.toLowerCase());
        if (!player) {
            return interaction.reply({
                content: `❌ Le joueur osu! **${username}** n'existe pas.`,
                ephemeral: true
            });
        }
        await removeScoreFromPlayer(player.id);
        await removePlayer(player.id);
        await interaction.reply({
            content: `✅ Le joueur osu! **${username}** a été supprimé avec succès.`,
            ephemeral: true
        });
    }
};
