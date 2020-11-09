const Discord = require("discord.js")
const utils = require("../utils")

async function guildMemberAdd(member) {
  if (member.user.bot) {
    await member.roles.add(utils.cobaye)
    await this.channels.cache.get(utils.general).send(
      new Discord.MessageEmbed()
        .setAuthor(
          `${member.user.username} est notre nouveau cobaye!`,
          member.guild.iconURL({ dynamic: true })
        )
        .setDescription(
          [
            "Merci de **copyright son prefix** dans <#633294676761247745>",
            "Si le prefix existe déjà, merci de le changer ou le bot sera kick.\n",
            "***Let's test !*** <:yay:557124850326437888>",
          ].join("\n")
        )
        .setThumbnail(
          "https://cdn.discordapp.com/emojis/772181235526533150.png"
        )
        .setImage(member.user.displayAvatarURL({ dynamic: true }))
    )
  }
}

module.exports = guildMemberAdd
