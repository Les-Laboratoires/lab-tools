import { SlashCommand } from "#core/slash"
import { generateThreadHint } from "#namespaces/openai"
import { sendLog } from "#namespaces/tools"

export default new SlashCommand({
	name: "hint",
	description: "Try to help the author of the thread by generating a hint",
	channelType: "thread",
	guildOnly: true,
	userPermissions: ["Administrator"],
	async run(interaction) {
		// Generate a hint

		const hint = await generateThreadHint(interaction.channel)

		// Send the hint

		await interaction.reply({ content: hint })

		// Feedbacks

		await sendLog(
			interaction.guild,
			`${interaction.user} generated a hint for ${interaction.channel} of **${hint.length}** characters.`,
		)
	},
})
