import * as app from "../app"

import users from "../tables/users"
import guilds from "../tables/guilds"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    await users.query.insert({ id: member.id }).onConflict("id").ignore()

    const config = await guilds.query.where("id", member.guild.id).first()

    if (!config) return

    if (member.user.bot) {
      await app.applyAutoRoles(member)

      if (config.bot_default_role_id)
        await member.roles.add(config.bot_default_role_id).catch(app.error)

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
