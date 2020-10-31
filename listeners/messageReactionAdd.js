const Discord = require("discord.js")
const utils = require("../utils")

/**
 * @param {module:"discord.js".MessageReaction} reaction
 * @param {module:"discord.js".User} user
 */
module.exports = async function messageReactionAdd(reaction, user) {
  if (reaction.message.channel.id === utils.presentations) {
    if (reaction.emoji.id === utils.approved) {
      if (reaction.message.author === user) {
        await reaction.users.remove(user)
      } else if (
        reaction.message.guild?.members
          .resolve(user)
          ?.roles.cache.has(utils.staff)
      ) {
        const member = reaction.message.member
        await member.roles.add(utils.scientifique)
        await member.roles.remove(utils.validation)
        await member.client.channels.cache
          .get(utils.general)
          ?.send(
            `Bienvenue à ${member} dans l'équipe de recherches ! <:Durifvoil:732347173139775529>`,
            {
              embed: new Discord.MessageEmbed()
                .setAuthor(
                  `Description:`,
                  reaction.message.guild.iconURL({ dynamic: true, size: 64 }),
                )
                .setDescription(reaction.message.content)
                .setImage(
                  member.user.displayAvatarURL({ dynamic: true, size: 512 }),
                )
                .setFooter(".bienvenue pour plus d'informations"),
            },
          )
      }
    }
  }
}
