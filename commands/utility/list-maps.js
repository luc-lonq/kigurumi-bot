const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { findMaps } = require('../../db/map.js');

const PAGE_SIZE = 10;

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

        function generateEmbed(page) {
            const embed = new EmbedBuilder()
                .setTitle('Liste des Maps :musical_note:')
                .setColor('#00bfff')
                .setTimestamp();

            const start = page * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const mapsPage = maps.slice(start, end);

            if (mapsPage.length === 0) {
                embed.setDescription('Aucune map trouvée pour cette page.');
                return embed;
            }
            for (const map of mapsPage) {
                embed.addFields({
                    name: `${map.title} - ${map.artist} [${map.version}]`,
                    value: `${map.mod ? `(**+${map.mod}**) ` : ''}:star: ${map.star_rating.toFixed(2)} - https://osu.ppy.sh/beatmaps/${map.beatmap_id}`,
                    inline: false
                });
            }

            embed.setFooter({ text: `Page ${page + 1} / ${Math.ceil(maps.length / PAGE_SIZE)}` });
            return embed;
        }

        function getRow(page, maxPage) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === maxPage)
            );
        }

        let page = 0;
        const maxPage = Math.max(0, Math.ceil(maps.length / PAGE_SIZE) - 1);

        const message = await interaction.reply({
            embeds: [generateEmbed(page)],
            components: [getRow(page, maxPage)],
            fetchReply: true
        });

        if (maxPage === 0) return;

        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'prev' && page > 0) page--;
            if (i.customId === 'next' && page < maxPage) page++;
            await i.update({
                embeds: [generateEmbed(page)],
                components: [getRow(page, maxPage)]
            });
        });

        collector.on('end', async () => {
            await message.edit({
                components: [getRow(page, maxPage).setComponents(
                    ...getRow(page, maxPage).components.map(btn => btn.setDisabled(true))
                )]
            });
        });
    }
};