import discord from "discord.js"

import { SlashCommand } from "#core/slash"
import { getSystemMessage } from "#core/util"

import { emote } from "#namespaces/emotes"
import { getGuild, sendProgress } from "#namespaces/tools"

export default new SlashCommand({
	name: "setup-presentation",
	description: "Setup permissions for the presentation system",
	guildOnly: true,
	channelType: "guild",
	userPermissions: ["Administrator"],
	build: (builder) =>
		builder.addStringOption((option) =>
			option
				.setName("categories")
				.setDescription("Comma-separated list of category IDs to restrict")
				.setRequired(true),
		),
	async run(interaction) {
		const categoriesInput = interaction.options.getString("categories", true)
		const categoryIds = categoriesInput.split(",").map((id) => id.trim())

		const config = await getGuild(interaction.guild, { forceExists: true })

		// Verify required configuration
		if (!config.presentation_channel_id) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"Missing configuration: `presentation_channel_id`. Set it with the config command first.",
				)),
			})
		}

		if (!config.await_validation_role_id) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"Missing configuration: `await_validation_role_id`. Set it with the config command first.",
				)),
			})
		}

		if (!config.member_role_id) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"Missing configuration: `member_role_id`. Set it with the config command first.",
				)),
			})
		}

		// Verify all categories exist
		const categories: discord.CategoryChannel[] = []
		for (const categoryId of categoryIds) {
			const category = interaction.guild.channels.cache.get(categoryId)
			if (!category || category.type !== discord.ChannelType.GuildCategory) {
				return interaction.reply({
					flags: discord.MessageFlags.Ephemeral,
					...(await getSystemMessage(
						"error",
						`Category not found: ${categoryId}`,
					)),
				})
			}
			categories.push(category)
		}

		await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral })

		const presentationChannel = interaction.guild.channels.cache.get(
			config.presentation_channel_id,
		)

		if (!presentationChannel || presentationChannel.isThread()) {
			return interaction.editReply(
				await getSystemMessage(
					"error",
					"Presentation channel not found or is a thread. Please verify `presentation_channel_id`.",
				),
			)
		}

		if (!("permissionOverwrites" in presentationChannel)) {
			return interaction.editReply(
				await getSystemMessage(
					"error",
					"Presentation channel does not support permission overwrites.",
				),
			)
		}

		const everyoneRole = interaction.guild.roles.everyone
		const awaitValidationRole = interaction.guild.roles.cache.get(
			config.await_validation_role_id,
		)
		const memberRole = interaction.guild.roles.cache.get(config.member_role_id)

		if (!awaitValidationRole) {
			return interaction.editReply(
				await getSystemMessage(
					"error",
					"Await validation role not found. Please verify `await_validation_role_id`.",
				),
			)
		}

		if (!memberRole) {
			return interaction.editReply(
				await getSystemMessage(
					"error",
					"Member role not found. Please verify `member_role_id`.",
				),
			)
		}

		let processedChannels = 0
		const totalChannels =
			1 + categories.reduce((acc, cat) => acc + cat.children.cache.size, 0)

		// 1. Setup presentation channel permissions
		// @everyone can view and send messages
		// await_validation role cannot send messages (after their first presentation)
		await presentationChannel.permissionOverwrites.set([
			{
				id: everyoneRole.id,
				allow: [
					discord.PermissionFlagsBits.ViewChannel,
					discord.PermissionFlagsBits.SendMessages,
					discord.PermissionFlagsBits.ReadMessageHistory,
				],
			},
			{
				id: awaitValidationRole.id,
				deny: [discord.PermissionFlagsBits.SendMessages],
			},
		])
		processedChannels++

		// 2. For each category, setup permissions on all channels
		for (const category of categories) {
			// Set category permissions
			await category.permissionOverwrites.set([
				{
					id: everyoneRole.id,
					deny: [discord.PermissionFlagsBits.ViewChannel],
				},
				{
					id: memberRole.id,
					allow: [discord.PermissionFlagsBits.ViewChannel],
				},
			])

			// Set permissions on all channels in the category
			for (const [, channel] of category.children.cache) {
				await channel.permissionOverwrites.set([
					{
						id: everyoneRole.id,
						deny: [discord.PermissionFlagsBits.ViewChannel],
					},
					{
						id: memberRole.id,
						allow: [discord.PermissionFlagsBits.ViewChannel],
					},
				])
				processedChannels++
			}
		}

		return interaction.editReply(
			await getSystemMessage(
				"success",
				`Presentation system permissions configured successfully!
- Presentation channel: ${presentationChannel}
- Categories configured: ${categories.length}
- Total channels processed: ${processedChannels}`,
			),
		)
	},
})
