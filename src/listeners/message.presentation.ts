import * as app from "../app"

import guilds from "../tables/guilds"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (!app.isCommandMessage(message)) return
    if (!app.isGuildMessage(message)) return

    const config = await guilds.query.where("id", message.guild.id).first()

    if (!config || !config.member_default_role || !config.validation_role)
      return

    if (message.channel.id === config.presentation_channel_id) {
      if (
        message.member.roles.cache.has(config.member_default_role) ||
        message.member.roles.cache.has(config.validation_role) ||
        message.author.bot
      )
        return

      await message.member.roles.add(config.validation_role)
      await message.react(app.Emotes.APPROVED)
      await message.react(app.Emotes.DISAPPROVED)
      return
    }
  },
}

module.exports = listener
