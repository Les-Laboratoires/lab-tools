import * as app from "../app.js"

export default new app.SlashCommand({
  name: "hint",
  description: "Try to help the author of the thread by generating a hint.",
  guildOnly: true,
  threadOnly: true,
  async run(interaction) {
    if (
      !interaction.channel ||
      !interaction.channel.isThread() ||
      !interaction.guild
    )
      return

    if (!interaction.memberPermissions?.has("Administrator"))
      return interaction.reply({
        content: `${app.emote(
          interaction,
          "DENY",
        )} You must be an admin to use this command.`,
        ephemeral: true,
      })

    // Generate a hint

    const hint = await app.generateThreadHint(interaction.channel)

    // Send the hint

    await interaction.reply({ content: hint })

    // Feedbacks

    await app.sendLog(
      interaction.guild,
      `${interaction.user} generated a hint for ${interaction.channel} of **${hint.length}** characters.`,
    )
  },
})
