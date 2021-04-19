import * as app from "../app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async call(member) {
    const presentations = member.guild.channels.cache.get(app.presentations)

    const logChannel = member.guild.channels.cache.get(app.logChannel)

    if (!logChannel || !logChannel.isText()) return
      
    logChannel
      .send(
        `${member.user?.tag ?? member.displayName} vient de nous quitter!`
      )
      .catch()

    if (presentations && presentations.isText()) {
      presentations.messages.fetch().then((messages) => {
        for (const [, message] of messages) {
          if (message.author.id === member.id) {
            logChannel.send(message.content).catch()
            message.delete().catch()
            break
          }
        }
      })
    }
  },
}

module.exports = listener
