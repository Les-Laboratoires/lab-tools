import * as app from "#app"

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Start an interval to update the active list",
  async run(client) {
    const guilds = await client.guilds.fetch()

    for (const [, guild] of guilds) {
      const config = await app.getGuild(guild)

      if (!config?.active_role_id) continue

      const refreshInterval = Number(config.active_refresh_interval)
      const period = Number(config.active_period)
      const messageCount = Number(config.active_message_count)

      await app.launchActiveInterval(guild, {
        refreshInterval,
        period,
        messageCount,
      })
    }
  },
}

export default listener
