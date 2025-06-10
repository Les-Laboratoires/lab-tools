import discord from "discord.js"

import { Button } from "#core/button"

import helping from "#tables/helping"
import points from "#tables/point"

import { emote } from "#namespaces/emotes"
import { refreshHelpingFooter } from "#namespaces/point"
import * as tools from "#namespaces/tools"

export default new Button<{
	targetId: string
	amount: number
}>({
	name: "givePoints",
	description: "Gives some helping points to a user",
	guildOnly: true,
	builder: (builder) => builder.setEmoji("👍"),
	async run(interaction, { targetId, amount }) {
		if (!interaction.channel?.isThread()) return

		await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral })

		const guild = await tools.getGuild(interaction.guild!, {
			forceExists: true,
		})

		if (!guild.help_forum_channel_id) return
		if (interaction.channel.parentId !== guild.help_forum_channel_id) return

		const fromId = interaction.user.id

		if (fromId === targetId)
			return await interaction.editReply({
				content: `${emote(
					interaction,
					"Cross",
				)} You can't give points to yourself.`,
			})

		const topic = interaction.channel

		if (fromId !== topic.ownerId)
			return await interaction.editReply({
				content: `${emote(interaction, "Cross")} You can't give points to a user in a topic that you don't own.`,
			})

		const fromUser = await tools.getUser({ id: fromId }, { forceExists: true })
		const toUser = await tools.getUser({ id: targetId }, { forceExists: true })

		await points.query.insert({
			from_id: fromUser._id,
			to_id: toUser._id,
			amount: +amount,
			created_at: new Date().toISOString(),
		})

		await tools.sendLog(
			interaction.guild!,
			`${interaction.user} gave **${amount}** points to ${discord.userMention(targetId)} in ${interaction.channel}.`,
		)

		await interaction.editReply({
			content: `${emote(interaction, "CheckMark")} Successfully thanked ${discord.userMention(
				targetId,
			)}`,
		})

		const target = await interaction.client.users.fetch(targetId, {
			cache: false,
			force: true,
		})

		await target.send(
			`${emote(
				interaction,
				"CheckMark",
			)} You received **${amount}** points from ${interaction.user} in ${
				interaction.channel
			}.`,
		)

		const state = await helping.query
			.where("id", interaction.channel.id)
			.first()

		await helping.query.where("id", interaction.channel.id).update({
			rewarded_helper_ids:
				state && state.rewarded_helper_ids !== ""
					? [...state.rewarded_helper_ids.split(";"), targetId].join(";")
					: targetId,
		})

		await refreshHelpingFooter(interaction.channel)
	},
})
