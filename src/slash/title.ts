import { SlashCommand } from "#core/slash"
import { sendLog } from "#namespaces/tools"
import { generateThreadTitle } from "#namespaces/openai"

export default new SlashCommand({
  name: "title",
  description: "Generate a title for the thread from its content",
  guildOnly: true,
  channelType: "thread",
  userPermissions: ["Administrator"],
  async run(interaction) {
    // Generate a title

    const title = await generateThreadTitle(interaction.channel)

    // Change the title

    await interaction.channel.setName(title)

    // Feedbacks

    await sendLog(
      interaction.guild,
      `${interaction.user} changed the title of ${interaction.channel} to:\n> **${title}**`,
    )

    // Close the interaction

    await interaction.deferReply()
  },
})
