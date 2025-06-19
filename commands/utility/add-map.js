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
        )
       .addStringOption(option =>
            option.setName('mod')
                .setDescription('Mod de la beatmap')
                .setRequired(false)
                .addChoices(
                    { name: 'DT', value: 'DT' },
                    { name: 'HR', value: 'HR' },
                )
        ),
        
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.',
                ephemeral: true
            });
        }

        const beatmap_id = interaction.options.getString('beatmap_id');

        const mapDetails = await getMap(beatmap_id, interaction.options.getString('mod'));
        if (!mapDetails) {
            await interaction.reply(`La beatmap avec l'ID ${beatmap_id} n'existe pas.`);
            return;
        }

        createMap(mapDetails.id, mapDetails.title, mapDetails.artist, mapDetails.version, interaction.options.getString('mod') || null, mapDetails.star_rating, mapDetails.max_combo);

        let modText = interaction.options.getString('mod') ? `+${interaction.options.getString('mod')}` : '';
        await interaction.reply({
            content: `✅ La beatmap ${mapDetails.title} [${mapDetails.version}] ${modText ? `(${modText}) ` : ''}a été ajoutée avec succès.`,
            ephemeral: true
        });
    }
};