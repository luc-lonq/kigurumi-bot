const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { findPlayerByUsername, createPlayer } = require('../../db/player.js');
const { getPlayer } = require('../../osu/get-player.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-player')
        .setDescription('Enregistre un joueur osu!')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nom d\'utilisateur osu!')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.',
                ephemeral: true
            });
        }


        const username = interaction.options.getString('username');

        res = await getPlayer(username);

        if (!res) {
            await interaction.reply({
                content: `Le joueur osu! ${username} n'existe pas.`,
                ephemeral: true
            });
            return;
        }

        const existingPlayer = findPlayerByUsername(username);
        if (existingPlayer) {
            await interaction.reply({
                content: `Le joueur osu! ${username} est déjà enregistré.`,
                ephemeral: true
            });
            return;
        }
        createPlayer(res.id, res.username);

        embed = new EmbedBuilder()
            .setTitle(`Joueur osu! enregistré`)
            .setDescription(`Le joueur osu! **${res.username}** a été enregistré avec succès.`)
            .setColor('#00bfff')
            .setTimestamp();

        await  interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};