const { SlashCommandBuilder } = require('discord.js');
const { findScoresByMap } = require('../../db/score.js');
const { findMapById, findMaps, removeMap } = require('../../db/map.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-map')
        .setDescription('Supprime une map de la base de données')
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
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.',
                ephemeral: true
            });
        }
        const mapId = interaction.options.getString('map');
        const map = await findMapById(mapId);
        if (!map) {
            return interaction.reply({
                content: `❌ La map avec l'ID **${mapId}** n'existe pas.`,
                ephemeral: true
            });
        }
        const scores = await findScoresByMap(map.id);
        if (scores.length > 0) {
            return interaction.reply({
                content: `❌ Impossible de supprimer la map **${map.title}** car elle a des scores associés.`,
                ephemeral: true
            });
        }
        await removeMap(map.id);
        await interaction.reply({
            content: `✅ La map **${map.title}** a été supprimée avec succès.`,
            ephemeral: true
        });
    }
};