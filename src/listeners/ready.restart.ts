import * as time from "tims"
import { Language } from "tims/dist/languages"

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
        const content = `${restartMessage.content} (${time
          .duration(restartMessage.created_timestamp - Date.now(), {
            locale: process.env.BOT_LOCALE as Language,
            format: "ms",
            maxPartCount: 3,
          })
          .replace(/millièmes? de seconde/, "ms")
          .replace(/(\d+)/g, "**$1**")})`

        if (!restartMessage.last_message_id) await channel.send(content)
        else {
          const message = await channel.messages.fetch(
            restartMessage.last_message_id
          )

          await message?.edit(content)
        }
      }
    }

    await restart.query.delete()
  },
}

export default listener
