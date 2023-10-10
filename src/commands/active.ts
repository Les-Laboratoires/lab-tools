import * as app from "../app.js"

import active from "../tables/active.js"

let used = false

export default new app.Command({
  name: "active",
  description: "Update the active list",
  channelType: "guild",
  middlewares: [
    app.staffOnly(),
    app.hasConfigKey("active_role_id"),
    app.isNotInUse(() => used),
  ],
  flags: [
    {
      flag: "f",
      name: "force",
      description: "Force the update of all members",
    },
  ],
  async run(message) {
    used = true

    const waiting = await message.send(
      `${app.emote(message, "WAIT")} Fetching members...`
    )

    const config = await app.getGuild(message.guild, true)

    message.guild.members.cache.clear()

    const members = (await message.guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => member)

    message.guild.members.cache.clear()

    const activeMembers: app.GuildMember[] = []
    const inactiveMembers: app.GuildMember[] = []

    for (const member of members) {
      const isActive = await app.isActive(member)

      if (isActive) activeMembers.push(member)
      else inactiveMembers.push(member)
    }

    const cacheSize = async () =>
      (await active.query.where("guild_id", config._id)).length

    if (message.args.force || (await cacheSize()) === 0) {
      await active.query.delete().where("guild_id", config._id)

      if(activeMembers.length)
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

      await waiting.edit(
        `${app.emote(message, "WAIT")} Verification of **0**/**${
          members.length
        }** members...`
      )

      for (const member of activeMembers) {
        await member.fetch(true)

        if (!member.roles.cache.has(config.active_role_id!))
          await member.roles.add(config.active_role_id!)

        await app.sendProgress(
          waiting,
          activeMembers.indexOf(member),
          members.length,
          `Verification of **$#**/**$$** members...`,
          10
        )
      }

      for (const member of inactiveMembers) {
        await member.fetch(true)

        if (member.roles.cache.has(config.active_role_id!))
          await member.roles.remove(config.active_role_id!)

        await app.sendProgress(
          waiting,
          activeMembers.length + inactiveMembers.indexOf(member),
          members.length,
          `Verification of **$#**/**$$** members...`,
          10
        )
      }
    } else {
      const activeMembersCache = await active.query.where(
        "guild_id",
        config._id
      )

      // use the cache to update only the changed members

      await waiting.edit(
        `${app.emote(message, "WAIT")} Update of ${
          activeMembers.length
        } active members...`
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

      await waiting.edit(
        `${app.emote(message, "WAIT")} Update of ${
          inactiveMembers.length
        } inactive members...`
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

    used = false

    return waiting.edit(
      `${app.emote(message, "CHECK")} Found **${
        activeMembers.length
      }** active members.`
    )
  },
})
