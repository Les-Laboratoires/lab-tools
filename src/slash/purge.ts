import discord from "discord.js"
import { SlashCommand } from "#core/slash"
import { getSystemMessage } from "#core/util"

export default new SlashCommand({
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
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"The amount of messages to purge must be between 1 and 100",
				)),
			})
		}

		await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral })

		await interaction.channel.bulkDelete(amount, true)

		return interaction.editReply(
			await getSystemMessage(
				"success",
				`Successfully purged ${amount} messages.`,
			),
		)
	},
})
