import { Listener } from "#core/listener"

import { Emotes } from "#namespaces/emotes"
import {
	approveMember,
	disapproveMember,
	isPresentationSystemActive,
} from "#namespaces/presentation"
import { getGuild, sendLog } from "#namespaces/tools"

export default new Listener({
	event: "messageReactionAdd",
	description: "Handle presentation approval/disapproval via reactions",
	async run(reaction, user) {
		// Ignore bot reactions
		if (user.bot) return

		// Fetch partial if needed
		if (reaction.partial) {
			try {
				await reaction.fetch()
			} catch {
				return
			}
		}

		const message = reaction.message
		if (!message.guild || !message.author) return

		const config = await getGuild(message.guild, { forceExists: true })

		// If presentation system is not active, skip
		if (!isPresentationSystemActive(config)) return

		// Check if reaction is in presentation channel
		if (message.channel.id !== config.presentation_channel_id) return

		// Get reactor and redactor members
		const reactor = await message.guild.members.fetch({
			user: user.id,
			force: true,
		})
		const redactor = await message.guild.members.fetch({
			user: message.author.id,
			force: true,
		})

		if (
			// Someone is missing
			!reactor ||
			!redactor ||
			// Reactor is not staff
			!reactor.roles.cache.has(config.staff_role_id!) ||
			// Redactor is already validated
			redactor.roles.cache.has(config.member_role_id!)
		)
			return

		const emojiId = reaction.emoji.id

		if (emojiId === Emotes.Approved) {
			// Remove the disapproved reaction if present
			const disapproved = message.reactions.cache.get(Emotes.Disapproved)
			if (disapproved) await disapproved.remove().catch(() => {})

			// Fetch the full message
			const presentation = await message.channel.messages.fetch(message.id)

			await approveMember(redactor, presentation, config)
		} else if (emojiId === Emotes.Disapproved) {
			if (!redactor.roles.cache.has(config.member_role_id!)) {
				await sendLog(
					message.guild,
					`${user} disapproves **${message.author.username}**.`,
					config,
				)

				// Fetch the full message
				const presentation = await message.channel.messages.fetch(message.id)

				await disapproveMember(redactor, presentation, config)
			}
		}
	},
})
