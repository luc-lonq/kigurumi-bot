const { SlashCommandBuilder } = require('discord.js');
const { findPlayers } = require('../../db/player.js');
const { createLink } = require('../../db/link.js');
const { getPlayer } = require('../../osu/get-player.js');
const { createPlayer } = require("../../db/player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Lier votre compte osu! à votre compte Discord')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur osu!')
                .setRequired(true)
        ),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const player = await getPlayer(username);
        if (!player) {
            return interaction.reply({
                content: `❌ Le joueur osu! **${username}** n'existe pas.`,
                ephemeral: true
            });
        }

        const createdPlayer = createPlayer(player.id, player.username);

        const link = await createLink(createdPlayer.id, interaction.user.id);
        if (link) {
            return interaction.reply({
                content: `✅ `,
                ephemeral: true
            });
        } else {
            return interaction.reply({
                content: `❌ Une erreur est survenue lors de la liaison du compte osu! **${username}**.`,
                ephemeral: true
            });
        }
    }
}