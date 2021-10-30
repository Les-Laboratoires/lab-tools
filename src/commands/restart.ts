import * as app from "../app.js"

import restart from "../tables/restart.js"

export default new app.Command({
  name: "restart",
  description: "Restart Lab Tool",
  channelType: "all",
  botOwnerOnly: true,
  async run(message) {
    const toEdit = await message.send(
      `${app.emote(message, "WAIT")} Restarting...`
    )

    await restart.query.insert({
      content: `${app.emote(message, "CHECK")} Restarted!`,
      last_channel_id: message.channel.id,
      last_message_id: toEdit.id,
    })

    process.exit(0)
  },
})
