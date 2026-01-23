import client from "#core/client"
import { Listener } from "#core/listener"

import users from "#tables/user"

import {
	approveMember,
	isPresentationSystemActive,
} from "#namespaces/presentation"
import { getGuild } from "#namespaces/tools"

export default new Listener({
	event: "guildMemberAdd",
	description: "Auto-approve members with existing presentation",
	async run(member) {
		if (member.user.bot) return

		const config = await getGuild(member.guild, { forceExists: true })

		// If presentation system is not active, skip
		if (!isPresentationSystemActive(config)) return

		// Check if user already has a validated presentation
		const userData = await users.query.where({ id: member.id }).first()

		if (userData?.presentation_id && userData?.presentation_guild_id) {
			// Try to fetch the original presentation
			const guild = client.guilds.cache.get(userData.presentation_guild_id)

			if (guild) {
				const subConfig = await getGuild(guild, { forceExists: true })

				if (
					subConfig.await_validation_role_id &&
					subConfig.presentation_channel_id
				) {
					const channel = client.channels.cache.get(
						subConfig.presentation_channel_id,
					)

					if (channel?.isTextBased()) {
						try {
							const presentation = await channel.messages.fetch(
								userData.presentation_id,
							)

							if (presentation) {
								await approveMember(member, presentation, config)
								return
							}
						} catch {
							// Presentation message no longer exists, approve without it
							await approveMember(member, undefined, config)
							return
						}
					}
				}
			}

			// If we couldn't fetch the presentation, approve anyway
			await approveMember(member, undefined, config)
		}
	},
})
