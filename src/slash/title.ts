import * as app from "../app.js"

export default new app.SlashCommand({
  name: "title",
  description: "The title command",
  guildOnly: true,
  threadOnly: true,
  async run(interaction) {
    // Generate a title for the current topic with openai chatgpt then change the title of the thread

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

    await app.sendLog(
      interaction.guild,
      `${interaction.user} changed the title of ${interaction.channel} to "${title}".`,
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
