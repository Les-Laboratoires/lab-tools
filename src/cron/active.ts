import { Cron } from "#core/cron"
import client from "#core/client"
import * as util from "#core/util"
import * as tools from "#namespaces/tools"
import * as active from "#namespaces/active"
import * as discordEval from "discord-eval.ts"
import { lastActiveCountCacheId } from "#namespaces/caches"

const REFRESH_INTERVAL = 12

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new Cron({
  name: "active",
  description: "Refresh the active member list every 12 hours",
  schedule: {
    type: "hour",
    duration: REFRESH_INTERVAL,
  },
  async run() {
    const guilds = await client.guilds.fetch()

    for (const [, guild] of guilds) {
      const config = await tools.getGuild(guild)

      if (!config?.active_role_id) continue

      const period = Number(config.active_period)
      const messageCount = Number(config.active_message_count)

      const realGuild = await guild.fetch()

      if (!(await active.hasActivity(config._id, REFRESH_INTERVAL))) return

      let found: number

      try {
        found = await active.updateActive(realGuild, {
          force: false,
          period,
          messageCount,
          guildConfig: config,
        })
      } catch (error: any) {
        await tools.sendLog(
          realGuild,
          `Failed to update the active list...${await discordEval.code.stringify(
            {
              content: error.message,
              lang: "js",
            },
          )}`,
        )

        return
      }

      const cacheId = lastActiveCountCacheId(realGuild)

      const lastActiveCount = util.cache.ensure(cacheId, 0)

      if (found > lastActiveCount) {
        await tools.sendLog(
          realGuild,
          `Finished updating the active list, found **${
            found - lastActiveCount
          }** active members.`,
        )
      } else if (found < lastActiveCount) {
        await tools.sendLog(
          realGuild,
          `Finished updating the active list, **${
            lastActiveCount - found
          }** members have been removed.`,
        )
      } else {
        await tools.sendLog(
          realGuild,
          `Finished updating the active list, no changes were made.`,
        )
      }

      util.cache.set(cacheId, found)
    }
  },
})
