import * as app from "../app"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    if (member.user.bot) {
      await member.roles.add(app.Roles.BOT)

      const general = member.client.channels.cache.get(app.Channels.GENERAL)

      if (general?.isText()) {
        return general.send(
          new app.MessageEmbed()
            .setAuthor(
              `${member.user.username} est notre nouveau cobaye!`,
              member.guild.iconURL({ dynamic: true }) ?? undefined
            )
            .setDescription(
              [
                "Merci de **copyright son prefix** dans <#633294676761247745>",
                "Si le prefix existe déjà, merci de le changer ou le bot sera kick.\n",
                "***Let's test !*** <:yay:557124850326437888>",
              ].join("\n")
            )
            .setThumbnail(
              `https://cdn.discordapp.com/emojis/772181235526533150.png`
            )
            .setImage(member.user.displayAvatarURL({ dynamic: true }))
        )
      }
    }
  },
}

module.exports = listener
