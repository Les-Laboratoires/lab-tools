import discord from "discord.js"

import { SlashCommand } from "#core/slash"
import { getSystemMessage } from "#core/util"

import {
	approveMember,
	isPresentationSystemActive,
} from "#namespaces/presentation"
import { getGuild } from "#namespaces/tools"

export default new SlashCommand({
	name: "approve",
	description: "Approve a member's presentation",
	guildOnly: true,
	channelType: "guild",
	userPermissions: ["ManageRoles"],
	build: (builder) =>
		builder.addUserOption((option) =>
			option
				.setName("member")
				.setDescription("The member to approve")
				.setRequired(true),
		),
	async run(interaction) {
		const targetUser = interaction.options.getUser("member", true)
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
					"This member is already validated.",
				)),
			})
		}

		await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral })

		await approveMember(member, undefined, config)

		return interaction.editReply(
			await getSystemMessage(
				"success",
				`Successfully approved **${member.user.username}**.`,
			),
		)
	},
})
