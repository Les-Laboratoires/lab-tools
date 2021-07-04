import * as app from "../app"

import guilds from "../tables/guilds"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    const config = await guilds.query.where("id", member.guild.id).first()

    if (!config) return

    if (member.user.bot) {
      if (config.bot_default_role_id)
        await member.roles.add(config.bot_default_role_id)

      if (config.general_channel_id && config.bot_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id
        )

        if (general?.isText()) {
          const guildIcon = member.guild.iconURL({ dynamic: true })

          let message = config.bot_welcome_message
            .replace(/{username}/g, member.user.username)
            .replace(/{user_tag}/g, member.user.tag)

          if (guildIcon) message = message.replace(/{guild_icon}/g, guildIcon)

          let embed
          try {
            embed = new app.MessageEmbed(JSON.parse(message))
          } catch (error) {}

          await general.send(embed ? embed : message)
        }
      }
    } else {
      if (!config.validation_role_id || !config.presentation_channel_id) {
        await app.approveMember(member, undefined, config)
      }
    }

    return app.sendLog(
      member.guild,
      `**${member.user.tag}** is a new **${
        member.user.bot ? "bot" : "member"
      }**.`,
      config
    )
  },
}

module.exports = listener
