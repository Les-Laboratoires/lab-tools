import * as app from "../app.js"

export default new app.SlashCommand({
  name: "title",
  description: "Generate a title for the thread from its content.",
  guildOnly: true,
  channelType: "thread",
  userPermissions: ["Administrator"],
  async run(interaction) {
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
        interaction.guild,
        "CHECK",
      )} The title has been changed to "${title}".`,
      ephemeral: true,
    })
  },
})
