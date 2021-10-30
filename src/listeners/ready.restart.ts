import * as app from "../app.js"

import restart from "../tables/restart.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Send restart messages",
  async run() {
    const restartMessages = await restart.query.select()

    for (const restartMessage of restartMessages) {
      const channel = this.channels.cache.get(restartMessage.last_channel_id)

      if (channel?.isText()) {
        if (!restartMessage.last_message_id)
          await channel.send(restartMessage.content)
        else {
          const message = await channel.messages.fetch(
            restartMessage.last_message_id
          )

          await message?.edit(restartMessage.content)
        }
      }
    }

    await restart.query.delete()
  },
}

export default listener
