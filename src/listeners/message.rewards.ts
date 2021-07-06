import * as app from "../app"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (!app.isCommandMessage(message)) return
    if (!app.isGuildMessage(message)) return

    const config = await app.getConfig(message.guild)

    if (config?.project_channel_id && config?.reward_emoji_id) {
      if (config.project_channel_id === message.channel.id) {
        return message.react(config.reward_emoji_id)
      }
    }
  },
}

module.exports = listener
