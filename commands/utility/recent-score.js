const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRecentScore } = require('../../osu/get-recent-score.js');
const { findPlayers } = require('../../db/player.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rs')
		.setDescription('Récupère le dernier score d\'un joueur osu!')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Nom d\'utilisateur osu!')
				.setRequired(true)
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
		const username = interaction.options.getString('username');

        const score = await getRecentScore(username);

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

        const modString = score.mods.length > 0 ? '+' + mods.join('') : '';

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Dernier score de ${username}`)
            .setColor('#ff66aa')
            .addFields({
                name: `🎵 **${score.title}** - *${score.artist}* [${score.version}]}`,
                value: `**${score.miss} :x:** ${variation} | ${modString} - ${score.accuracy}% - ${score.combo}x`,
                inline: false
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
	},
};
