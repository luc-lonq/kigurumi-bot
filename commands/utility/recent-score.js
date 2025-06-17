const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRecentScore } = require('../../osu/get-recent-score.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rs')
		.setDescription('Récupère le dernier score d\'un joueur osu!')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Nom d\'utilisateur osu!')
				.setRequired(true)
		),
	async execute(interaction) {
		const username = interaction.options.getString('username');

        const score = await getRecentScore(username);

        if (!score) {
            await interaction.reply(`Aucun score trouvé pour **${username}**.`);
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

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Dernier score de ${username}`)
            .setColor('#ff66aa')
            .addFields({
                name: `🎵 **${score.title}** - *${score.artist}* [${score.version}]`,
                value: `**${score.miss} :x:** ${variation}`,
                inline: false
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
	},
};
