import * as app from "../app"

import users from "../tables/users"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async run(member) {
    await users.query.delete().where("id", member.id)

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
        const messages = await presentations.messages.fetch()

        let hasPresentation = false

        for (const [, message] of messages) {
          if (message.author.id === member.id) {
            hasPresentation = true

            app
              .sendLog(
                member.guild,
                `**Description**: ${app.code.stringify({
                  content: message.content,
                })}`,
                config
              )
              .catch()

            message.delete().catch()
            break
          }
        }
      }
    }
  },
}

export default listener
