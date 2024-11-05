import * as app from "#app"

const REFRESH_INTERVAL = 12

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new app.Cron({
  name: "active",
  description: "Refresh the active member list every 12 hours",
  schedule: {
    type: "hour",
    duration: REFRESH_INTERVAL,
  },
  async run() {
    const guilds = await app.client.guilds.fetch()

    for (const [, guild] of guilds) {
      const config = await app.getGuild(guild)

      if (!config?.active_role_id) continue

      const period = Number(config.active_period)
      const messageCount = Number(config.active_message_count)

      const realGuild = await guild.fetch()

      if (!(await app.hasActivity(config._id, REFRESH_INTERVAL))) return

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
          `Failed to update the active list...${await app.code.stringify({
            content: error.message,
            lang: "js",
          })}`,
        )

        return
      }

      const cacheId = app.lastActiveCountCacheId(realGuild)

      const lastActiveCount = app.cache.ensure(cacheId, 0)

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
      } else {
        await app.sendLog(
          realGuild,
          `Finished updating the active list, no changes were made.`,
        )
      }

      app.cache.set(cacheId, found)
    }
  },
})
