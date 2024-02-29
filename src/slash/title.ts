import * as app from "../app.js"

export default new app.SlashCommand({
  name: "title",
  description: "Generate a title for the thread from its content.",
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

    // Generate a title

    const title = await app.generateThreadTitle(interaction.channel)

    // Change the title

    await interaction.channel.setName(title)

    // Feedbacks

    await app.sendLog(
      interaction.guild,
      `${interaction.user} changed the title of ${interaction.channel} to:\n> **${title}**`,
    )

    await interaction.reply({
      content: `${app.emote(
        interaction,
        "CHECK",
      )} The title has been changed to "${title}".`,
      ephemeral: true,
    })
  },
})