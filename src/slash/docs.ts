import { SlashCommand } from "#core/slash"
import { generateDocURLList } from "#namespaces/openai"

export default new SlashCommand({
  name: "docs",
  description: "Send doc links for the provided tags",
  guildOnly: true,
  userPermissions: ["ManageMessages"],
  build: (builder) =>
    builder.addStringOption((option) =>
      option
        .setName("tags")
        .setDescription("The tags to search for (separated by commas)")
        .setAutocomplete(true)
        .setRequired(true),
    ),
  async run(interaction) {
    await interaction.deferReply()

    const tags = interaction.options.getString("tags") as string
    const links = await generateDocURLList(tags)

    await interaction.editReply(links)
  },
})
