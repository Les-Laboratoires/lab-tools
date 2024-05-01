import * as app from "#app"

import users from "#tables/user.js"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Delete member from db",
  async run(member) {
    const { guild } = member

    const config = await app.getGuild(guild)

    try {
      const user = await member.client.users.fetch(member.id)

      if (
        member.client.guilds.cache
          .filter((g) => g.id !== guild.id)
          .every((g) => !g.members.cache.has(member.id))
      )
        throw new Error()

      await app.sendLog(guild, `${user} left the guild.`, config)
    } catch (error) {
      await users.query.delete().where({ id: member.id })

      await app.sendLog(
        guild,
        `${member.user ?? member} left all the labs.`,
        config,
      )
    }
  },
}

export default listener
