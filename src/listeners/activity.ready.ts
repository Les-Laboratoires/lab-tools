import * as app from "../app.js"

const intervals: Record<string, NodeJS.Timeout> = {}

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "A ready listener",
  async run(client) {
    const guilds = await client.guilds.fetch()

    for (const [, guild] of guilds) {
      const config = await app.getGuild(guild)

      if (!config?.active_role_id) continue

      if (intervals[guild.id] !== undefined) clearInterval(intervals[guild.id])

      const interval = 6 // hours
      const period = Number(config.active_period)
      const messageCount = Number(config.active_message_count)

      intervals[guild.id] = setInterval(
        async () => {
          const realGuild = await guild.fetch()

          if (!(await app.hasActivity(config._id, interval))) return

          const found = await app.updateActive(realGuild, {
            force: false,
            period,
            messageCount,
            guildConfig: config,
          })

          await app.sendLog(
            realGuild,
            `Finished updating the active list, found **${found}** active members.`,
          )
        },
        interval * 1000 * 60 * 60,
      )
    }
  },
}

export default listener
