import * as app from "../app"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (!app.isCommandMessage(message)) return
    if (!app.isGuildMessage(message)) return

    if (message.channel.id === app.Channels.PRESENTATION) {
      if (
        message.member.roles.cache.has(app.Roles.MEMBER) ||
        message.member.roles.cache.has(app.Roles.VALIDATION) ||
        message.author.bot
      )
        return

      await message.member.roles.add(app.Roles.VALIDATION)
      await message.react(app.Emotes.APPROVED)
      await message.react(app.Emotes.DISAPPROVED)
      return
    }
  },
}

module.exports = listener
