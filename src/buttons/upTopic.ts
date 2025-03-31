import discord from "discord.js"
import { Button, CooldownType } from "#all"
import { emote } from "#namespaces/emotes"
import { refreshHelpingFooter } from "#namespaces/point"
import * as tools from "#namespaces/tools"

export default new Button({
	name: "upTopic",
	description: "Up the topic in the help forum",
	guildOnly: true,
	cooldown: {
		type: CooldownType.ByChannel,
		duration: 1000 * 60 * 60, // 1 hour
	},
	builder: (builder) =>
		builder
			.setLabel("Remonter")
			.setEmoji("🆙")
			.setStyle(discord.ButtonStyle.Secondary),
	async run(interaction) {
		if (!interaction.channel?.isThread()) return

		await interaction.deferUpdate()

		const topic = interaction.channel
		const guild = await tools.getGuild(interaction.guild!, {
			forceExists: true,
		})

		if (!guild.help_forum_channel_id) return
		if (topic.parentId !== guild.help_forum_channel_id) return

		interaction.triggerCooldown()

		await interaction.followUp({
			content: `${emote(interaction, "CheckMark")} Topic upped.`,
			flags: discord.MessageFlags.Ephemeral,
		})

		await refreshHelpingFooter(topic)
	},
})
