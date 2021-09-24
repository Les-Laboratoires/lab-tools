import * as app from "../app.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  async run(message) {
    if (!app.isNormalMessage(message)) return
    if (!app.isGuildMessage(message)) return

    const config = await app.getConfig(message.guild)

    if (config?.project_channel_id && config?.reward_emoji_id) {
      if (config.project_channel_id === message.channel.id) {
        return message.react(config.reward_emoji_id)
      }
    }
  },
}

export default listener
