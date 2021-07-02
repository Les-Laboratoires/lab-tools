import * as app from "../app"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async run(reaction, user) {
    if (reaction.message.channel.id === app.Channels.PRESENTATION) {
      const reactor = await reaction.message.guild?.members.fetch(
        user as app.User
      )
      const redactor = await reaction.message.guild?.members.fetch(
        reaction.message.author
      )

      if (
        user.bot ||
        !reactor ||
        !redactor ||
        redactor.user.bot ||
        !reactor.roles.cache.has(app.Roles.STAFF) ||
        redactor.roles.cache.has(app.Roles.MEMBER)
      )
        return

      if (reaction.emoji.id === app.Emotes.APPROVED) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!redactor.roles.cache.has(app.Roles.MEMBER)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.Emotes.DISAPPROVED
          )

          if (disapproved) await disapproved.remove()

          return app.approveMember(redactor, reaction.message.content)
        }
      } else if (reaction.emoji.id === app.Emotes.DISAPPROVED) {
        if (!redactor.roles.cache.has(app.Roles.MEMBER)) {
          const logChannel = reaction.message.guild?.channels.cache.get(
            app.Channels.LOG
          )

          if (logChannel && logChannel.isText())
            logChannel.send(
              `${user} disapproves **${reaction.message.author.tag}**.`
            )

          await redactor.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

module.exports = listener
