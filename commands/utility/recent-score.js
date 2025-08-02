const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRecentScore } = require('../../osu/get-recent-score.js');
const { findPlayers, findPlayerById } = require('../../db/player.js');
const { findLinkByDiscordId } = require('../../db/link.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rs')
		.setDescription('Récupère le dernier score d\'un joueur osu!')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Nom d\'utilisateur osu!')
				.setRequired(false)
                .setAutocomplete(true)
		),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const players = await findPlayers(focused);

        const choices = players.slice(0, 25).map(player => ({
            name: player.username,
            value: player.username
        }));

        await interaction.respond(choices);
    },
	async execute(interaction) {
        let score = null;
        let player = null;
        let username = null;
        if (!interaction.options.getString('username')) {
            const link = await findLinkByDiscordId(interaction.user.id);
            if (!link) {
                await interaction.reply({
                    content: '❌ Vous devez lier votre compte osu! avec votre compte Discord pour utiliser cette commande.',
                    ephemeral: true
                });
                return;
            }
            player = await findPlayerById(link.player_id);
            if (!player) {
                await interaction.reply({
                    content: `❌ Le joueur osu! avec l'ID **${link.player_id}** n'existe pas.`,
                    ephemeral: true
                });
                return;
            }
            score = await getRecentScore(player.username);
        }
        else {
            username = interaction.options.getString('username');

            score = await getRecentScore(username);
        }
        if (score.message) {
            await interaction.reply({
                content: `❌ ${score.message}`,
                ephemeral: true
            });
            return;
        }

        let variation = ``;
        if (score.previous) {
            if (score.miss > score.previous) {
                variation = `(+${score.miss - score.previous})`;
            } else if (score.miss < score.previous) {
                variation = `(-${score.previous - score.miss})`;
            } else {
                variation = `(=)`;
            }
        }

        const modString = score.mods.length > 0 ? '+' + score.mods.join('') : 'NoMod';

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Dernier score de ${username ? username : player.username}`)
            .setColor('#ff66aa')
            .addFields({
                name: `🎵 **${score.title}** - *${score.artist}* [${score.version}]`,
                value: `**${score.miss} :x:** ${variation}`,
                inline: false
            })
            .addFields({
                name: '**Stats**',
                value: `**Mod:** ${modString}\n**Star rating:** ${score.star_rating.toFixed(2)}\n**Accuracy:** ${score.accuracy}%\n**Combo:** ${score.combo}`,
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
	},
};
