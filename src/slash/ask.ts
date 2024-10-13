import * as app from "#app"

export default new app.SlashCommand({
  name: "ask",
  description: "Ask points to a member",
  channelType: "thread",
  guildOnly: true,
  async run(interaction) {
    if (interaction.user.id === interaction.channel.ownerId)
      return interaction.reply({
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

    await interaction.reply(
      await app.buildAskPointEmbed(interaction.user, target, interaction.guild),
    )

    await app.sendLog(
      interaction.guild,
      `${interaction.user} ask points to ${target.user} in ${interaction.channel}.`,
    )
  },
})
