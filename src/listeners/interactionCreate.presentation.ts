import * as app from "../app.js"

const listener: app.Listener<"interactionCreate"> = {
  event: "interactionCreate",
  description: "A interactionCreate listener",
  async run(interaction) {
    if (!interaction.guild || !interaction.channel || !interaction.isButton())
      return

    const config = await app.getConfig(interaction.guild)

    // if config is not ready for presentation system
    if (
      !config ||
      !config.presentation_channel_id ||
      !config.staff_role_id ||
      !config.await_validation_role_id ||
      !config.member_role_id
    )
      return

    if (interaction.channel.id === config.presentation_channel_id) {
      // get reactor and redactor members
      const reactor = await interaction.guild.members.fetch({
        user: interaction.user.id,
        force: true,
      })
      const redactor = await interaction.guild.members.fetch({
        user: interaction.message.author.id,
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

      if (interaction.customId === app.Emotes.APPROVED) {
        const presentation = await interaction.channel.messages.fetch(
          interaction.message.id
        )

        await interaction.deferUpdate()

        return app.approveMember(redactor, presentation, config)
      } else if (interaction.customId === app.Emotes.DISAPPROVED) {
        if (!redactor.roles.cache.has(config.member_role_id)) {
          await app.sendLog(
            interaction.guild,
            `${interaction.user} disapproves **@${interaction.message.author.username}#${interaction.message.author.discriminator}**.`,
            config
          )

          const presentation = await interaction.channel.messages.fetch(
            interaction.message.id
          )

          await app.disapproveMember(redactor, presentation, config)
        }
      }
    }
  },
}

export default listener
