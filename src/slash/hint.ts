import * as app from "#app"

export default new app.SlashCommand({
  name: "hint",
  description: "Try to help the author of the thread by generating a hint",
  channelType: "thread",
  guildOnly: true,
  userPermissions: ["Administrator"],
  async run(interaction) {
    // Generate a hint

    const hint = await app.generateThreadHint(interaction.channel)

    // Send the hint

    await interaction.base.reply({ content: hint })

    // Feedbacks

    await app.sendLog(
      interaction.guild,
      `${interaction.base.user} generated a hint for ${interaction.channel} of **${hint.length}** characters.`,
    )
  },
})
