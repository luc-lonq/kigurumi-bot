const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { findPlayerByUsername, findPlayers } = require('../../db/player.js');
const { findScoresByPlayer } = require('../../db/score.js');
const { findMaps } = require('../../db/map.js');

const PAGE_SIZE = 5;

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

        function generateEmbed(page) {
            const embed = new EmbedBuilder()
                .setTitle(`🎯 Scores de ${username}`)
                .setColor('#00bfff')
                .setTimestamp();

            const start = page * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const mapsPage = allMaps.slice(start, end);

            for (const map of mapsPage) {
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
            embed.setFooter({ text: `Page ${page + 1} / ${Math.ceil(allMaps.length / PAGE_SIZE)}` });
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
        const maxPage = Math.max(0, Math.ceil(allMaps.length / PAGE_SIZE) - 1);

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