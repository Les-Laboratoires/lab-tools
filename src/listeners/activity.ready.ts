import * as app from "../app.js"

const intervals: Record<string, NodeJS.Timeout> = {}

let lastActiveCount = 0

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "Start an interval to update the active list",
  async run(client) {
    const guilds = await client.guilds.fetch()

    for (const [, guild] of guilds) {
      const config = await app.getGuild(guild)

      if (!config?.active_role_id) continue

      if (intervals[guild.id] !== undefined) clearInterval(intervals[guild.id])

      const interval = Number(config.active_refresh_interval)
      const period = Number(config.active_period)
      const messageCount = Number(config.active_message_count)

      intervals[guild.id] = setInterval(
        async () => {
          const realGuild = await guild.fetch()

          if (!(await app.hasActivity(config._id, interval))) return

          let found: number

          try {
            found = await app.updateActive(realGuild, {
              force: false,
              period,
              messageCount,
              guildConfig: config,
            })
          } catch (error: any) {
            await app.sendLog(
              realGuild,
              `Failed to update the active list...${app.code.stringify({
                content: error.message,
                lang: "js",
              })}`,
            )

            return
          }

          if (found > lastActiveCount) {
            await app.sendLog(
              realGuild,
              `Finished updating the active list, found **${
                found - lastActiveCount
              }** active members.`,
            )
          } else if (found < lastActiveCount) {
            await app.sendLog(
              realGuild,
              `Finished updating the active list, **${
                lastActiveCount - found
              }** members have been removed.`,
            )
          }

          lastActiveCount = found
        },
        interval * 1000 * 60 * 60,
      )
    }
  },
}

export default listener
