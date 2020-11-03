const Discord = require("discord.js")
const utils = require("../utils")

/**
 * @param {module:"discord.js".MessageReaction} reaction
 * @param {module:"discord.js".User} user
 */
module.exports = async function messageReactionAdd(reaction, user) {
  if (reaction.message.channel.id === utils.presentations) {
    if (reaction.emoji.id === utils.approved) {
      const authorMember = reaction.message.guild?.members.resolve(user)
      const member = reaction.message.member
      if (reaction.message.author === user) {
        await reaction.users.remove(user)
      } else if (
        authorMember?.roles.cache.has(utils.staff) &&
        !member.roles.cache.has(utils.scientifique)
      ) {
        await member.roles.add(utils.scientifique)
        await member.roles.remove(utils.validation)
        await member.client.channels.cache
          .get(utils.general)
          ?.send(
            `Bienvenue à ${member} dans l'équipe de recherches ! <:durif:565598499459039252>`,
            {
              embed: new Discord.MessageEmbed()
                .setAuthor(
                  `Description:`,
                  reaction.message.guild.iconURL({ dynamic: true, size: 64 })
                )
                .setDescription(reaction.message.content)
                .setImage(
                  member.user.displayAvatarURL({ dynamic: true, size: 512 })
                )
                .setFooter(".bienvenue pour plus d'informations"),
            }
          )
      }
    }
  }
}
