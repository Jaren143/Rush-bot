const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const p3 = new db.table("Perm3");
const cl = new db.table("Color");
const config = require("../config");

module.exports = {
    name: 'buttonrole',
    usage: 'buttonrole',
    description: `Permet de faire un menu buttonrole.`,
    async execute(client, message, args) {

        if (owner.get(`owners.${message.author.id}`) || config.bot.buyer.includes(message.author.id)) {

            let color = await cl.fetch(`color_${message.guild.id}`);
            if (color == null) color = config.bot.couleur;

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            const msg = args.slice(1).join(" ");

            if (!role) return message.reply(`Usage correct: buttonrole <role> <description>`);
            if (!msg) return message.reply(`Usage correct: buttonrole <role> <description>`);
            
            // Vérifie que le rôle n'a pas de permissions dangereuses
            if (role.permissions.has(["KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_WEBHOOKS", "ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_GUILD", "MENTION_EVERYONE", "MANAGE_ROLES"])) {
                return message.reply("Le menu n'a pas pu être créé car le rôle sélectionné a des permissions **dangereuses**");
            }

            const embed = new Discord.MessageEmbed()
                .setTitle(`Choisi ton rôle`)
                .setDescription(`${msg}\n__Rôle :__ ${role}`)
                .setColor(color);

            const rolemenu = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('roles')
                        .setLabel(role.name)
                        .setStyle('SUCCESS')
                );

            try {
                const msgg = await message.channel.send({ embeds: [embed], components: [rolemenu] });

                // Enregistre l'id du message avec le rôle dans la base de données
                await db.set(`buttonrole_${msgg.id}`, role.id);
            } catch (error) {
                console.error("Erreur lors de l'envoi du message ou de l'interaction : ", error);
                return message.reply("Une erreur s'est produite lors de la création du menu.");
            }
        }
    }
};

// Gestion des interactions (ajout dans ton gestionnaire global d'interactions)
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const roleID = await db.get(`buttonrole_${interaction.message.id}`);
    const role = interaction.guild.roles.cache.get(roleID);

    if (!role) return interaction.reply({ content: 'Le rôle n\'existe plus.', ephemeral: true });

    // Vérifie si l'utilisateur a déjà ce rôle
    if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({ content: `Vous avez déjà le rôle ${role.name}.`, ephemeral: true });
    }

    try {
        // Ajoute le rôle à l'utilisateur
        await interaction.member.roles.add(role);
        await interaction.reply({ content: `Vous avez maintenant le rôle ${role.name}.`, ephemeral: true });
    } catch (error) {
        console.error("Erreur lors de l'ajout du rôle : ", error);
        await interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout du rôle.', ephemeral: true });
    }
});
