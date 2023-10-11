import * as app from "../app.js"

import messages from "../tables/message.js"
import active from "../tables/active.js"

export async function isActive(
  member: app.GuildMember,
  period = 1000 * 60 * 60 * 24 * 7,
  requiredMessageCount = 50
): Promise<boolean> {
  const user = await app.getUser(member, true)
  const guild = await app.getGuild(member.guild, true)

  const data: { messageCount: number } | undefined = await messages.query
    .where("author_id", user._id)
    .where("guild_id", guild._id)
    .where("created_timestamp", ">", Date.now() - period)
    .select({ messageCount: "count(*)" })
    .first()

  if (!data) return false

  return data.messageCount > requiredMessageCount
}

export async function updateActive(
  guild: app.Guild,
  options: {
    force: boolean
    period: number
    messageCount: number
    onLog?: (text: string) => unknown | Promise<unknown>
  }
): Promise<number> {
  const config = await app.getGuild(guild, true)

  guild.members.cache.clear()

  const members = (await guild.members.fetch())
    .filter((member) => !member.user.bot)
    .map((member) => member)

  guild.members.cache.clear()

  const activeMembers: app.GuildMember[] = []
  const inactiveMembers: app.GuildMember[] = []

  for (const member of members) {
    const isActive = await app.isActive(
      member,
      options.period,
      options.messageCount
    )

    if (isActive) activeMembers.push(member)
    else inactiveMembers.push(member)
  }

  if (options.force) {
    await active.query.delete().where("guild_id", config._id)

    if (activeMembers.length === 0)
      await active.query.insert(
        await Promise.all(
          activeMembers.map(async (member) => {
            const user = await app.getUser(member, true)

            return {
              user_id: user._id,
              guild_id: config._id,
            }
          })
        )
      )

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "WAIT")} Verification of **0**/**${
          members.length
        }** members...`
      )

    for (const member of activeMembers) {
      await member.fetch(true)

      if (!member.roles.cache.has(config.active_role_id!))
        await member.roles.add(config.active_role_id!)

      if (options.onLog)
        await options.onLog(
          `${app.emote(
            guild,
            "WAIT"
          )} Verification of **${activeMembers.indexOf(member)}**/**${
            members.length
          }** members...`
        )
    }

    for (const member of inactiveMembers) {
      await member.fetch(true)

      if (member.roles.cache.has(config.active_role_id!))
        await member.roles.remove(config.active_role_id!)

      if (options.onLog)
        await options.onLog(
          `${app.emote(guild, "WAIT")} Verification of **${
            activeMembers.length + inactiveMembers.indexOf(member)
          }**/**${members.length}** members...`
        )
    }
  } else {
    // use the cache to update only the changed members

    const activeMembersCache = await active.query.where("guild_id", config._id)

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "WAIT")} Update of **${
          activeMembers.length
        }** active members...`
      )

    for (const member of activeMembers) {
      const user = await app.getUser(member, true)

      if (!activeMembersCache.find((am) => am.user_id === user._id)) {
        await member.roles.add(config.active_role_id!)
        await active.query.insert({
          user_id: user._id,
          guild_id: config._id,
        })
      }
    }

    if (options.onLog)
      await options.onLog(
        `${app.emote(guild, "WAIT")} Update of **${
          inactiveMembers.length
        }** inactive members...`
      )

    for (const member of inactiveMembers) {
      const user = await app.getUser(member, true)

      if (activeMembersCache.find((am) => am.user_id === user._id)) {
        await member.roles.remove(config.active_role_id!)
        await active.query.delete().where({
          user_id: user._id,
          guild_id: config._id,
        })
      }
    }
  }

  if (options.onLog)
    options.onLog(
      `${app.emote(guild, "CHECK")} Found **${
        activeMembers.length
      }** active members.`
    )

  return activeMembers.length
}
