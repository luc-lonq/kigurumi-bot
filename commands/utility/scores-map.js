const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { findScoresByMap } = require('../../db/score.js');
const { findMapById, findMaps } = require('../../db/map.js');
const { findPlayers } = require('../../db/player.js')

const PAGE_SIZE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scores-map')
        .setDescription('Affiche les scores d\'une map')
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Recherche une map')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const maps = await findMaps(focused);

        const choices = maps.slice(0, 25).map(map => ({
            name: `${map.title} - ${map.artist} [${map.version}]`,
            value: map.id.toString()
        }));

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const mapId = interaction.options.getString('map');
        const map = await findMapById(mapId);

        if (!map) {
            return interaction.reply({
                content: `❌ La map avec l'ID **${mapId}** n'existe pas.`,
                ephemeral: true
            });
        }

        const scores = await findScoresByMap(map.id);
        const players = await findPlayers();

        function generateEmbed(page) {
            const embed = new EmbedBuilder()
                .setTitle(`🏆 Classement - ${map.title} - ${map.artist} [${map.version}]`)
                .setColor('#00bfff')
                .setTimestamp();

            if (scores.length === 0) {
                embed.setDescription('Aucun score trouvé pour cette map.');
            } else {
                const start = page * PAGE_SIZE;
                const end = start + PAGE_SIZE;
                scores.sort((a, b) => a.misses - b.misses);
                const scoresPage = scores.slice(start, end);

                for (const [i, score] of scoresPage.entries()) {
                    const player = players.find(p => p.id === score.player_id);
                    if (!player) continue;
                    const position = page * PAGE_SIZE + i + 1;
                    embed.addFields({
                        name: `#${position} - ${player.username}`,
                        value: `${score.misses} ❌`,
                        inline: false
                    });
}
                embed.setFooter({ text: `Page ${page + 1} / ${Math.ceil(scores.length / PAGE_SIZE)}` });
            }

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
        const maxPage = Math.max(0, Math.ceil(scores.length / PAGE_SIZE) - 1);

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
