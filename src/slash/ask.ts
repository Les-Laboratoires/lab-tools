import * as app from "#app"

export default new app.SlashCommand({
  name: "ask",
  description: "Ask points to a member",
  channelType: "thread",
  guildOnly: true,
  async run(interaction) {
    if (interaction.base.user.id === interaction.channel.ownerId)
      return interaction.base.reply({
        content: `${app.emote(
          interaction,
          "Cross",
        )} You can't ask points to yourself.`,
        ephemeral: true,
      })

    const target = (await interaction.channel.fetchOwner({
      force: true,
      cache: false,
    }))!

    await interaction.base.reply(
      await app.buildAskPointEmbed(
        interaction.base.user,
        target,
        interaction.guild,
      ),
    )

    await app.sendLog(
      interaction.guild,
      `${interaction.base.user} ask points to ${target.user} in ${interaction.channel}.`,
    )
  },
})
