import * as app from "#app"

export default new app.SlashCommand({
  name: "purge",
  description: "Purge messages in a channel",
  guildOnly: true,
  channelType: "guild",
  userPermissions: ["ManageMessages"],
  build: (builder) =>
    builder.addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to purge")
        .setRequired(true),
    ),
  async run(interaction) {
    const amount = interaction.options.getInteger("amount", true)

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        ephemeral: true,
        ...(await app.getSystemMessage(
          "error",
          "The amount of messages to purge must be between 1 and 100",
        )),
      })
    }

    await interaction.deferReply()

    await interaction.channel.bulkDelete(amount + 1, true)

    return interaction.editReply(
      await app.getSystemMessage(
        "success",
        `Successfully purged ${amount} messages`,
      ),
    )
  },
})
