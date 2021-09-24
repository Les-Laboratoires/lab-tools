import * as app from "../app.js"

import guilds from "../tables/guilds.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  async run(message) {
    if (!app.isNormalMessage(message)) return
    if (!app.isGuildMessage(message)) return

    const config = await guilds.query.where("id", message.guild.id).first()

    if (!config || !config.member_default_role_id || !config.validation_role_id)
      return

    if (message.channel.id === config.presentation_channel_id) {
      if (
        message.member.roles.cache.has(config.member_default_role_id) ||
        message.member.roles.cache.has(config.validation_role_id) ||
        message.author.bot
      )
        return

      await message.member.roles.add(config.validation_role_id)
      await message.react(app.Emotes.APPROVED)
      await message.react(app.Emotes.DISAPPROVED)
      return
    }
  },
}

export default listener
