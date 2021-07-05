import * as app from "../app"

import guilds from "../tables/guilds"
import autoRole from "../tables/autoRole"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    const config = await guilds.query.where("id", member.guild.id).first()

    if (!config) return

    if (member.user.bot) {
      const autoRoles = await autoRole.query
        .where("guild_id", member.guild.id)
        .and.where("bot", true)

      for (const roleData of autoRoles)
        await member.roles.add(roleData.role_id).catch()

      if (config.bot_default_role_id)
        await member.roles.add(config.bot_default_role_id)

      if (config.general_channel_id && config.bot_welcome_message) {
        const general = member.client.channels.cache.get(
          config.general_channel_id
        )

        if (general)
          await app.embedTemplate(
            general,
            config.bot_welcome_message,
            app.embedReplacers(member)
          )
      }
    } else if (!config.validation_role_id || !config.presentation_channel_id)
      await app.approveMember(member, undefined, config)

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
