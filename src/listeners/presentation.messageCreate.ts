import { Listener } from "#core/listener"

import { Emotes } from "#namespaces/emotes"
import { isPresentationSystemActive } from "#namespaces/presentation"
import { getGuild } from "#namespaces/tools"

export default new Listener({
	event: "messageCreate",
	description: "Handle member presentation submission",
	async run(message) {
		// Ignore bots and DMs
		if (message.author.bot) return
		if (!message.guild || !message.member) return

		const config = await getGuild(message.guild, { forceExists: true })

		// If presentation system is not active, skip
		if (!isPresentationSystemActive(config)) return

		// Check if message is in presentation channel
		if (message.channel.id !== config.presentation_channel_id) return

		await message.member.fetch(true)

		// Skip if member is already validated or is already awaiting validation
		if (
			message.member.roles.cache.has(config.member_role_id!) ||
			message.member.roles.cache.has(config.await_validation_role_id!)
		)
			return

		// Add the await validation role and reactions
		await Promise.all([
			message.member.roles.add(config.await_validation_role_id!),
			message.react(Emotes.Approved),
			message.react(Emotes.Disapproved),
		])
	},
})
