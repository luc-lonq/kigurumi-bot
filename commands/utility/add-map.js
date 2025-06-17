const { SlashCommandBuilder } = require('@discordjs/builders');
const { getMap } = require('../../osu/get-map.js');
const { createMap } = require('../../db/map.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-map')
        .setDescription('Ajoute une map à une playlist')
        .addStringOption(option =>
            option.setName('beatmap_id')
                .setDescription('ID de la beatmap')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.',
                ephemeral: true
            });
        }

        const beatmap_id = interaction.options.getString('beatmap_id');

        const mapDetails = await getMap(beatmap_id);
        if (!mapDetails) {
            await interaction.reply(`La beatmap avec l'ID ${beatmap_id} n'existe pas.`);
            return;
        }

        createMap(mapDetails.id, mapDetails.title, mapDetails.artist, mapDetails.version);


        await interaction.reply(`La beatmap ${mapDetails.title} a été ajoutée.`);
    }
};