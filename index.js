const { Client, Intents, Collection, MessageActionRow, MessageButton } = require('discord.js');  // Ajout de Collection
const Discord = require("discord.js");
const config = require('./config');
const { readdirSync } = require("fs");
const db = require('quick.db');
const p = new db.table("Prefix");
const logembed = new db.table("embedlog");
ms = require("ms");
const color = config.bot.couleur;

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    restTimeOffset: 0,
    partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
});

client.login(process.env.token); // Remplace par client.login("TonToken")
client.commands = new Collection();  // Utilisation de Collection

const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./database.json",
    updateCountdownEvery: 3000,
    default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        reaction: "🎉"
    }
});

//|▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬| HANDLER |▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬|
const commandFiles = readdirSync('./moderation').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./moderation/${file}`);
    client.commands.set(command.name, command);
}

const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

//|▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬| INTERACTION BUTTON FIX |▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬|
client.on('interactionCreate', async (interaction) => {
    // Vérifie si l'interaction est un bouton
    if (!interaction.isButton()) return;

    try {
        // Vérifie si l'interaction a déjà été traitée (répondue ou différée)
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate(); // Diffère l'interaction pour éviter l'erreur 'already acknowledged'
        }

        console.log(`Bouton cliqué: ${interaction.customId}`); // Log de l'ID du bouton cliqué

        // Gère les différents boutons en fonction de leur customId
        switch (interaction.customId) {
            case 'suivant':
                // Logique pour le bouton "suivant"
                console.log("Bouton suivant cliqué");
                // Ajoute ta logique ici (par exemple, changer de message, etc.)
                break;

            case 'precedent':
                // Logique pour le bouton "précédent"
                console.log("Bouton précédent cliqué");
                // Ajoute ta logique ici
                break;

            // Si tu as d'autres boutons, ajoute des cases comme ci-dessus
            default:
                console.log('Bouton inconnu');
                break;
        }
    } catch (err) {
        console.error('Erreur interactionCreate :', err); // Log des erreurs
    }
});

//|▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬| ANTI-CRASH |▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬|
process.on("unhandledRejection", (reason, p) => {
    if (reason.code === 50007) return;
    if (reason.code == 10062) return;
    if (reason.code == 10008) return;
    if (reason.code == 50013) return;
    console.log(reason, p);
});

process.on("uncaughtException", (err, origin) => {
    console.log(err, origin);
});

process.on("multipleResolves", (type, promise, reason) => {
    console.log(type, promise, reason);
});

// Fonction pour envoyer un message avec des boutons
client.on('messageCreate', async (message) => {
    if (message.content === '!test') {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('suivant')  // Identifiant du bouton
                    .setLabel('Suivant')     // Label visible sur le bouton
                    .setStyle('PRIMARY'),    // Style du bouton
                new MessageButton()
                    .setCustomId('precedent')
                    .setLabel('Précédent')
                    .setStyle('SECONDARY')
            );

        // Envoi du message avec les boutons
        await message.channel.send({
            content: 'Cliquez sur un des boutons !',
            components: [row]
        });
    }
});

client.on('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});
