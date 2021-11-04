import * as app from "../app.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Handle member presentation",
  async run(message) {
    if (!app.isNormalMessage(message)) return
    if (!app.isGuildMessage(message)) return

    const config = await app.getConfig(message.guild)

    if (!config || !config.member_role_id || !config.await_validation_role_id)
      return

    if (message.channel.id === config.presentation_channel_id) {
      await message.member.fetch(true)

      if (
        message.member.roles.cache.has(config.member_role_id) ||
        message.member.roles.cache.has(config.await_validation_role_id) ||
        message.author.bot
      )
        return

      await Promise.all([
        message.member.roles.add(config.await_validation_role_id),
        message.react(app.Emotes.APPROVED),
        message.react(app.Emotes.DISAPPROVED),
      ])
    }
  },
}

export default listener
