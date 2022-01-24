import * as app from "../app.js"

import users, { LabUser } from "../tables/users.js"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Delete member from db",
  async run(member) {
    const { guild } = member

    const config = await app.getConfig(guild)

    if (config?.presentation_channel_id) {
      const presentationChannel = guild.channels.cache.get(
        config.presentation_channel_id
      )

      if (presentationChannel?.isText()) {
        const labUser = await users.query.where({ id: member.id }).first()

        if (labUser) {
          if (labUser.presentation_id) {
            const presentation = await presentationChannel.messages.fetch(
              labUser.presentation_id
            )
            await presentation.delete().catch()
          }
        } else {
          const messages = await presentationChannel.messages.fetch()

          for (const [, message] of messages)
            if (message.author.id === member.id) await message.delete()
        }
      }
    }

    try {
      const user = await member.client.users.fetch(member.id)

      if (
        this.guilds.cache
          .filter((g) => g.id !== guild.id)
          .every((g) => !g.members.cache.has(member.id))
      )
        throw new Error()

      await app.sendLog(guild, `**${user.tag}** left the guild.`, config)
    } catch (error) {
      await users.query.delete().where({ id: member.id })

      await app.sendLog(
        guild,
        `**${member.user?.tag ?? member.displayName}** user was removed.`,
        config
      )
    }
  },
}

export default listener
