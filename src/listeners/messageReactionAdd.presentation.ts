import * as app from "../app.js"

const listener: app.Listener<"messageReactionAdd"> = {
  event: "messageReactionAdd",
  description: "Welcome or kick the introduced member",
  async run(reaction, user) {
    if (!app.isNormalMessage(reaction.message)) return
    if (!app.isGuildMessage(reaction.message)) return

    const config = await app.getConfig(reaction.message.guild as app.Guild)

    // if config is not ready for presentation system
    if (
      !config ||
      !config.presentation_channel_id ||
      !config.staff_role_id ||
      !config.await_validation_role_id ||
      !config.member_role_id
    )
      return

    if (reaction.message.channel.id === config.presentation_channel_id) {
      // get reactor and redactor members
      const reactor = await reaction.message.guild.members.fetch({
        user: user.id,
        force: true,
      })
      const redactor = await reaction.message.guild.members.fetch({
        user: reaction.message.author.id,
        force: true,
      })

      if (
        // someone is a ghost
        !reactor ||
        !redactor ||
        // someone is a bot
        reactor.user.bot ||
        redactor.user.bot ||
        // reactor is not staff member
        !reactor.roles.cache.has(config.staff_role_id) ||
        // redactor is already validated
        redactor.roles.cache.has(config.member_role_id)
      )
        return

      if (reaction.emoji.id === app.Emotes.APPROVED) {
        const disapproved = reaction.message.reactions.cache.get(
          app.Emotes.DISAPPROVED
        )

        if (disapproved) await disapproved.remove()

        return app.approveMember(redactor, reaction.message, config)
      } else if (reaction.emoji.id === app.Emotes.DISAPPROVED) {
        if (!redactor.roles.cache.has(config.member_role_id)) {
          await app.sendLog(
            reaction.message.guild,
            `${user} disapproves **${reaction.message.author.tag}**.`,
            config
          )

          await app.disapproveMember(redactor, reaction.message, config)
        }
      }
    }
  },
}

export default listener
