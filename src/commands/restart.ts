import { Command } from "#core/command"
import { emote } from "#namespaces/emotes"
import restart from "#tables/restart"

export default new Command({
	name: "restart",
	description: "Restart Lab Tool",
	channelType: "all",
	botOwnerOnly: true,
	async run(message) {
		const toEdit = await message.channel.send(
			`${emote(message, "Loading")} Restarting...`,
		)

		await restart.query.insert({
			content: `${emote(message, "CheckMark")} Successfully restarted!`,
			last_channel_id: message.channel.id,
			last_message_id: toEdit.id,
			created_at: new Date().toISOString(),
		})

		process.exit(0)
	},
})
