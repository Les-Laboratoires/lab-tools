import discord from "discord.js"

import { SlashCommand } from "#core/slash"
import { getSystemMessage } from "#core/util"

import {
	disapproveMember,
	isPresentationSystemActive,
} from "#namespaces/presentation"
import { getGuild, sendLog } from "#namespaces/tools"

export default new SlashCommand({
	name: "disapprove",
	description: "Disapprove a member's presentation and kick them",
	guildOnly: true,
	channelType: "guild",
	userPermissions: ["ManageRoles"],
	build: (builder) =>
		builder
			.addUserOption((option) =>
				option
					.setName("member")
					.setDescription("The member to disapprove")
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName("reason")
					.setDescription("Reason for disapproval")
					.setRequired(false),
			),
	async run(interaction) {
		const targetUser = interaction.options.getUser("member", true)
		const reason =
			interaction.options.getString("reason") ?? "No reason provided"
		const member = await interaction.guild.members.fetch(targetUser.id)

		if (!member) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"Member not found in this server.",
				)),
			})
		}

		const config = await getGuild(interaction.guild, { forceExists: true })

		if (!isPresentationSystemActive(config)) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"Presentation system is not configured for this server.",
				)),
			})
		}

		// Check if member is already validated
		if (member.roles.cache.has(config.member_role_id!)) {
			return interaction.reply({
				flags: discord.MessageFlags.Ephemeral,
				...(await getSystemMessage(
					"error",
					"This member is already validated. Use /kick instead.",
				)),
			})
		}

		await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral })

		// Try to find the presentation message in the presentation channel
		let presentation: discord.Message | undefined

		if (config.presentation_channel_id) {
			const channel = interaction.guild.channels.cache.get(
				config.presentation_channel_id,
			)

			if (channel?.isTextBased()) {
				const messages = await channel.messages.fetch({ limit: 100 })
				presentation = messages.find((m) => m.author.id === member.id)
			}
		}

		if (!presentation) {
			// If no presentation found, just kick and log
			await sendLog(
				interaction.guild,
				`${interaction.user} disapproved **${member.user.username}** (no presentation found). Reason: ${reason}`,
				config,
			)

			await member.kick(`Disapproved: ${reason}`)

			return interaction.editReply(
				await getSystemMessage(
					"success",
					`Successfully disapproved and kicked **${member.user.username}** (no presentation found).`,
				),
			)
		}

		await disapproveMember(member, presentation, config)

		return interaction.editReply(
			await getSystemMessage(
				"success",
				`Successfully disapproved and kicked **${member.user.username}**.`,
			),
		)
	},
})
