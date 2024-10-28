import * as app from "#app"

import { Guild } from "#tables/guild.ts"
import active from "#tables/active.ts"
import message from "#tables/message.ts"
import env from "#env"

/**
 * @param guild_id internal guild id
 * @param period period to check activity in hours
 * @param messageCount minimum message count in period to be active
 */
export async function fetchActiveMembers(
  guild_id: number,
  period: number,
  messageCount: number,
): Promise<
  {
    messageCount: number
    target: string
  }[]
> {
  return message.query
    .select("u.id as target")
    .count({ messageCount: "*" })
    .leftJoin("user as u", "message.author_id", "u._id")
    .where("guild_id", guild_id)
    .where(
      "created_at",
      ">",
      app.database.raw(`now() - interval '1 hour' * ${period}`),
    )
    .groupBy("u.id")
    .havingRaw(`count(*) >= ${messageCount}`)
    .orderByRaw('"messageCount" desc')
}

export async function updateActive(
  guild: app.Guild,
  options: {
    force: boolean
    period: number
    messageCount: number
    onLog?: (text: string) => unknown | Promise<unknown>
    guildConfig: Guild
  },
): Promise<number> {
  if (env.BOT_MODE === "development") return 0

  guild.members.cache.clear()

  const members = (await guild.members.fetch())
    .filter((member) => !member.user.bot)
    .map((member) => member)

  guild.members.cache.clear()

  const activeMembers: app.GuildMember[] = []
  const inactiveMembers: app.GuildMember[] = []

  const actives = await app.fetchActiveMembers(
    options.guildConfig._id,
    options.period,
    options.messageCount,
  )

  for (const member of members) {
    const isActive = actives.find((active) => active.target === member.id)

    if (isActive) activeMembers.push(member)
    else inactiveMembers.push(member)
  }

  if (options.force) {
    await active.query.delete().where("guild_id", options.guildConfig._id)

    if (activeMembers.length > 0)
      await active.query.insert(
        await Promise.all(
          activeMembers.map(async (member) => {
            const user = await app.getUser(member, true)

            return {
              user_id: user._id,
              guild_id: options.guildConfig._id,
            }
          }),
        ),
      )

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "Loading")} Verification of **0**/**${
          members.length
        }** members...`,
      )

    for (const member of activeMembers) {
      await member.fetch(true)

      if (!member.roles.cache.has(options.guildConfig.active_role_id!))
        await member.roles.add(options.guildConfig.active_role_id!)

      if (options.onLog)
        await options.onLog(
          `${app.emote(
            guild,
            "Loading",
          )} Verification of **${activeMembers.indexOf(member)}**/**${
            members.length
          }** members...`,
        )
    }

    for (const member of inactiveMembers) {
      await member.fetch(true)

      if (member.roles.cache.has(options.guildConfig.active_role_id!))
        await member.roles.remove(options.guildConfig.active_role_id!)

      if (options.onLog)
        await options.onLog(
          `${app.emote(guild, "Loading")} Verification of **${
            activeMembers.length + inactiveMembers.indexOf(member)
          }**/**${members.length}** members...`,
        )
    }
  } else {
    // use the cache to update only the changed members

    const activeMembersCache = await active.query.where(
      "guild_id",
      options.guildConfig._id,
    )

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "Loading")} Update of **${
          activeMembers.length
        }** active members...`,
      )

    for (const member of activeMembers) {
      const user = await app.getUser(member, true)

      if (!activeMembersCache.find((am) => am.user_id === user._id)) {
        await member.roles.add(options.guildConfig.active_role_id!)
        await active.query.insert({
          user_id: user._id,
          guild_id: options.guildConfig._id,
        })
      }
    }

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "Loading")} Update of **${
          inactiveMembers.length
        }** inactive members...`,
      )

    for (const member of inactiveMembers) {
      const user = await app.getUser(member, true)

      if (activeMembersCache.find((am) => am.user_id === user._id)) {
        await member.roles.remove(options.guildConfig.active_role_id!)
        await active.query.delete().where({
          user_id: user._id,
          guild_id: options.guildConfig._id,
        })
      }
    }
  }

  if (options.onLog)
    options.onLog(
      `${app.emote(guild, "CheckMark")} Found **${
        activeMembers.length
      }** active members.`,
    )

  return activeMembers.length
}

/**
 * @param guild_id
 * @param period in hours
 */
export async function hasActivity(
  guild_id: number,
  period: number,
): Promise<boolean> {
  return app
    .countOf(
      message.query
        .leftJoin("user", "message.author_id", "user._id")
        .where("message.guild_id", guild_id)
        .where("user.is_bot", false)
        .whereRaw(
          `extract(epoch from now()) - extract(epoch from message.created_at) < ${period} * 3600`,
        ),
    )
    .then((count) => count > 0)
}

export interface ActiveLadderLine {
  rank: number
  target: string
  messageCount: number
}

export const activeLadder = (guild_id: number) =>
  new app.Ladder<ActiveLadderLine>({
    title: "Guild's activity",
    fetchLines(options) {
      return message.query
        .select(
          app.database.raw(
            `rank() over (order by count(*) desc) as "rank", "user"."id" as "target", count(*) as "messageCount"`,
          ),
        )
        .leftJoin("user", "message.author_id", "user._id")
        .where("guild_id", guild_id)
        .andWhere("user.is_bot", false)
        .groupBy("user.id")
        .having(app.database.raw("count(*) > 0"))
        .orderBy("rank", "asc")
        .limit(options.pageLineCount)
        .offset(options.pageIndex * options.pageLineCount)
    },
    async fetchLineCount() {
      return app.countOf(
        message.query
          .leftJoin("user", "message.author_id", "user._id")
          .where("guild_id", guild_id)
          .andWhere("user.is_bot", false)
          .groupBy("user.id")
          .having(app.database.raw("count(*) > 0")),
      )
    },
    formatLine(line, index, lines) {
      return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
        String(line.messageCount),
        Math.max(...lines.map((l) => l.messageCount), 0).toString().length,
      )}\` msg - <@${line.target}>`
    },
  })

export async function launchActiveInterval(
  guild: app.OAuth2Guild | app.Guild,
  options: {
    period: number
    messageCount: number
    refreshInterval: number
  },
) {
  const config = await app.getGuild(guild, { forceExists: true })

  const intervalId = app.activeIntervalCacheId(guild)
  const interval = app.cache.get<NodeJS.Timeout>(intervalId)

  if (interval !== undefined) clearInterval(interval)

  app.cache.set(
    intervalId,
    setInterval(
      async () => {
        const realGuild = await guild.fetch()

        if (!(await app.hasActivity(config._id, options.refreshInterval)))
          return

        let found: number

        try {
          found = await app.updateActive(realGuild, {
            force: false,
            period: options.period,
            messageCount: options.messageCount,
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
      },
      options.refreshInterval * 1000 * 60 * 60,
    ),
  )
}
