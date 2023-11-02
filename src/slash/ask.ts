import * as app from "../app.js"

export default new app.SlashCommand({
  name: "ask",
  description: "Ask points to a member",
  async run(interaction) {
    if (!interaction.channel || !interaction.channel.isThread())
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} This command can only be used in a thread channel.`,
        ephemeral: true,
      })

    if (!interaction.guild)
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} This command can only be used in a guild.`,
        ephemeral: true,
      })

    if (interaction.user.id === interaction.channel.ownerId)
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
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
