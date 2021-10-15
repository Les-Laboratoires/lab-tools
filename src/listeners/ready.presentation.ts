import * as app from "../app.js"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Fetch guilds presentations",
  once: true,
  async run() {
    for (const guild of this.guilds.cache.values()) {
      const config = await app.getConfig(guild, true)

      if (config.presentation_channel_id) {
        const channel = await guild.channels.fetch(
          config.presentation_channel_id
        )

        if (!channel)
          return app.error(
            `${guild.name} presentation_channel_id not found`,
            "ready.presentation"
          )

        if (!channel.isText())
          return app.error(
            `${guild.name} presentation_channel_id is not a TextBasedChannel`,
            "ready.presentation"
          )

        await channel.messages.fetch({ limit: 100 })
      }
    }
  },
}

export default listener
