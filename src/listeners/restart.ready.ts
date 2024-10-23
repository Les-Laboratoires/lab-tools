import * as time from "tims"

import * as app from "#app"

import restart, { Restart } from "#tables/restart.ts"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Send restart messages",
  once: true,
  async run(client) {
    const restartMessages: Restart[] = await restart.query.select()

    app.log("restart messages: " + restartMessages.length)

    for (const restartMessage of restartMessages) {
      const channel = await client.channels.fetch(
        restartMessage.last_channel_id,
        { force: true },
      )

      if (channel?.isSendable()) {
        const content = `${restartMessage.content} (${app.formatDuration(restartMessage.created_at)})`

        if (!restartMessage.last_message_id) await channel.send(content)
        else {
          const message = await channel.messages.fetch(
            restartMessage.last_message_id,
          )

          try {
            await message.edit(content)
          } catch (error: any) {
            app.error(error, __filename)
          }
        }
      } else {
        app.error(
          `channel ${restartMessage.last_channel_id} is not a text channel`,
          __filename,
        )
      }
    }

    await restart.query.delete()
  },
}

export default listener
