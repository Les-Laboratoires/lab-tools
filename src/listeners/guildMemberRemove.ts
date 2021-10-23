import * as app from "../app.js"

import users, { LabUser } from "../tables/users.js"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  description: "Delete member from db",
  async run(member) {
    const { guild } = member

    const config = await app.getConfig(guild)

    if (!config) return

    try {
      const user = await member.client.users.fetch(member.id)

      await app.sendLog(guild, `**${user.tag}** left the guild.`, config)
    } catch (error) {
      await app.sendLog(
        guild,
        `**${member.user?.tag ?? member.displayName}** user was removed.`,
        config
      )
    }

    if (config.presentation_channel_id) {
      const presentations = guild.channels.cache.get(
        config.presentation_channel_id
      )

      if (presentations?.isText()) {
        const { presentation } = (await users.query
          .where("id", member.id)
          .first()) as LabUser

        if (presentation) {
          const presentationMessage = await presentations.messages.fetch(
            presentation
          )
          await presentationMessage.delete().catch()
        }
      }
    }

    await users.query.delete().where("id", member.id)
  },
}

export default listener
