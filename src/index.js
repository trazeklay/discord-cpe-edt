const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Create a collection for commands
client.commands = new Collection();

// Path to the commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Store command data for deployment
const commands = [];

// Dynamically set commands in the collection and prepare for deployment
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Ensure the command has a name and is valid
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a "data" or "execute" property.`);
    }
}

// Function to deploy commands
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    
    try {
        console.log('Started refreshing application (/) commands.');

        // Replace 'YOUR_GUILD_ID' with your actual guild ID for guild-based commands
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Deploy commands once the bot is ready
    await deployCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN);
