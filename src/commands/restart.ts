import * as app from "#app"

import restart from "#tables/restart.js"

export default new app.Command({
  name: "restart",
  description: "Restart Lab Tool",
  channelType: "all",
  botOwnerOnly: true,
  async run(message) {
    const toEdit = await message.channel.send(
      `${app.emote(message, "Loading")} Restarting...`,
    )

    await restart.query.insert({
      content: `${app.emote(message, "CheckMark")} Successfully restarted!`,
      last_channel_id: message.channel.id,
      last_message_id: toEdit.id,
      created_at: new Date().toISOString(),
    })

    process.exit(0)
  },
})
