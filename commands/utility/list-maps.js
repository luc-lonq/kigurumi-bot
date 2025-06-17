const { SlashCommandBuilder, hyperlink, EmbedBuilder } = require('discord.js');
const { findMaps } = require('../../db/map.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-maps')
        .setDescription('Affiche la liste des maps enregistrées'),
    async execute(interaction) {
        const maps = findMaps();
        if (maps.length === 0) {
            await interaction.reply('Aucune map enregistrée.');
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('Liste des Maps 🎵')
            .setColor('#00bfff')
            .setTimestamp();

        const lines = maps.map(map => {
            return hyperlink(`${map.title} - ${map.artist} [${map.version}]`, `https://osu.ppy.sh/beatmaps/${map.beatmap_id}`);
        });

        embed.setDescription(lines.join('\n'));

        await interaction.reply({ embeds: [embed] });
    }
};