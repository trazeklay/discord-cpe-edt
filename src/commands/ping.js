const { SlashCommandBuilder } = require('@discordjs/builders');

const command = {
    name: 'ping',
    description: 'Replies with pong'
}

const execute = async (interaction) => {
    await interaction.reply('Pong!');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description),
    async execute(interaction) {
        await execute(interaction);
    },
};
