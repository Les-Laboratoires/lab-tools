import * as app from "../app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async run(member) {
    const presentations = member.guild.channels.cache.get(
      app.Channels.PRESENTATION
    )
    const logChannel = member.guild.channels.cache.get(app.Channels.LOG)

    if (!logChannel || !logChannel.isText()) return

    try {
      const user = await member.client.users.fetch(member.id)

      await logChannel.send(`**${user.tag}** user was removed.`)
    } catch (error) {
      await logChannel.send(
        `**${member.user?.tag ?? member.displayName}** left the guild.`
      )
    }

    if (presentations && presentations.isText()) {
      const messages = await presentations.messages.fetch()

      let hasPresentation = false

      for (const [, message] of messages) {
        if (message.author.id === member.id) {
          hasPresentation = true

          logChannel
            .send(
              `**Description**: ${app.code.stringify({
                content: message.content,
              })}`
            )
            .catch()

          message.delete().catch()
          break
        }
      }
    }
  },
}

module.exports = listener
