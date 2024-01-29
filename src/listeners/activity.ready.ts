import * as app from "../app.js"

const intervals: Record<string, NodeJS.Timeout> = {}

const listener: app.Listener<"ready"> = {
  event: "ready",
  description: "A ready listener",
  async run(client) {
    const guilds = await client.guilds.fetch()

    for (const [, guild] of guilds) {
      const guildConfig = await app.getGuild(guild)

      if (!guildConfig?.active_role_id) continue

      if (intervals[guild.id] !== undefined) clearInterval(intervals[guild.id])

      const interval = Number(guildConfig.active_refresh_interval)

      const configs = await app.getActiveConfigs(guild)

      let oldCount = 0

      intervals[guild.id] = setInterval(
        async () => {
          const realGuild = await guild.fetch()

          if (!(await app.hasActivity(guildConfig._id, interval))) return

          let found = 0

          for (const activeConfig of configs) {
            found += await app.updateActive(realGuild, {
              force: false,
              activeConfig,
              guildConfig,
            })
          }

          if (found === oldCount) return
          else oldCount = found

          await app.sendLog(realGuild, `Found **${found}** active members.`)
        },
        interval * 1000 * 60 * 60,
      )
    }
  },
}

export default listener
