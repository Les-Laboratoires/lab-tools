import * as app from "../app.js"

import { Guild } from "../tables/guild.js"
import messages from "../tables/message.js"
import active from "../tables/active.js"

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
  return app.orm.raw(`
    select
      count(*) as messageCount,
      user.id as target
    from message
    left join user on message.author_id = user._id
    where
      guild_id = ${guild_id}
    and
      unixepoch(datetime(created_at, 'localtime')) >
      unixepoch(datetime('now', '-${period} hours', 'localtime'))
    group by target
    having messageCount >= ${messageCount}
    order by messageCount desc
  `)
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
        `${app.emote(guild, "WAIT")} Verification of **0**/**${
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
            "WAIT",
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
          `${app.emote(guild, "WAIT")} Verification of **${
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
        `${app.emote(guild, "WAIT")} Update of **${
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
        `${app.emote(guild, "WAIT")} Update of **${
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
      `${app.emote(guild, "CHECK")} Found **${
        activeMembers.length
      }** active members.`,
    )

  return activeMembers.length
}

/**
 * @fixme
 * @param guild_id
 * @param period
 */
export async function hasActivity(
  guild_id: number,
  period: number,
): Promise<boolean> {
  return app.orm
    .raw(
      `select
        count(*) > 0 as hasActivity
      from message
      where
        guild_id = ${guild_id}
      and
        unixepoch(datetime(created_at, 'localtime')) >
        unixepoch(datetime('now', '-${period} hours', 'localtime'))`,
    )
    .then((result) => !!result[0]?.hasActivity)
}

export interface ActiveLadderLine {
  rank: number
  target: string
  messageCount: number
}

export const activeLadder = (guild_id: number) =>
  new app.Ladder<ActiveLadderLine>({
    title: "Activity",
    fetchLines(options) {
      return app.orm.raw(`
        select
            rank() over (
                order by count(*) desc
            ) as rank,
            user.id as target,
            count(*) as messageCount
        from message
        left join user on message.author_id = user._id
        where guild_id = ${guild_id}
        group by target
        having user.is_bot = 0
        order by rank asc
        limit ${options.pageLineCount}
        offset ${options.pageIndex * options.pageLineCount}
      `)
    },
    async fetchLineCount() {
      return app.orm
        .raw(
          `select count(*) from (select
            rank() over (
                order by count(*) desc
            ) as rank,
            user.id as target,
            count(*) as messageCount
          from message
          left join user on message.author_id = user._id
          where guild_id = ${guild_id}
          group by target
          having user.is_bot = 0
          order by rank asc)`,
        )
        .then((rows: any) => rows[0]?.messageCount ?? 0)
    },
    formatLine(line, index, lines) {
      return `${app.formatRank(line.rank)} avec \`${app.forceTextSize(
        String(line.messageCount),
        Math.max(...lines.map((l) => l.messageCount), 0).toString().length,
      )}\` msg - <@${line.target}>`
    },
  })
