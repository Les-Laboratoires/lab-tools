import * as app from "../app.js"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  async run(_reaction, _user) {
    const reaction = await _reaction.fetch()
    const user = await _user.fetch()

    if (!app.isNormalMessage(reaction.message)) return
    if (!app.isGuildMessage(reaction.message)) return

    const config = await app.getConfig(reaction.message.guild as app.Guild)

    if (
      !config ||
      !config.presentation_channel_id ||
      !config.staff_role_id ||
      !config.member_default_role_id
    )
      return

    if (reaction.message.channel.id === config.presentation_channel_id) {
      const reactor = await reaction.message.guild.members.fetch(
        user as app.User
      )
      const redactor = await reaction.message.guild.members.fetch(
        reaction.message.author
      )

      if (
        user.bot ||
        !reactor ||
        !redactor ||
        redactor.user.bot ||
        !reactor.roles.cache.has(config.staff_role_id) ||
        redactor.roles.cache.has(config.member_default_role_id)
      )
        return

      if (reaction.emoji.id === app.Emotes.APPROVED) {
        if (reaction.message.author === user) {
          return reaction.users.remove(user)
        } else if (!redactor.roles.cache.has(config.member_default_role_id)) {
          const disapproved = reaction.message.reactions.cache.get(
            app.Emotes.DISAPPROVED
          )

          if (disapproved) await disapproved.remove()

          return app.approveMember(redactor, reaction.message.content)
        }
      } else if (reaction.emoji.id === app.Emotes.DISAPPROVED) {
        if (!redactor.roles.cache.has(config.member_default_role_id)) {
          await app.sendLog(
            reaction.message.guild,
            `${user} disapproves **${reaction.message.author.tag}**.`,
            config
          )

          await redactor.kick()
          return reaction.message.delete()
        }
      }
    }
  },
}

export default listener
