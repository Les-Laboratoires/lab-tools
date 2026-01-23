import { Listener } from "#core/listener"

import { Emotes } from "#namespaces/emotes"
import {
	approveMember,
	disapproveMember,
	isPresentationSystemActive,
} from "#namespaces/presentation"
import { getGuild, sendLog } from "#namespaces/tools"

export default new Listener({
	event: "interactionCreate",
	description: "Handle presentation approval/disapproval via buttons",
	async run(interaction) {
		// Only handle button interactions
		if (!interaction.isButton()) return
		if (!interaction.guild || !interaction.channel) return

		const config = await getGuild(interaction.guild, { forceExists: true })

		// If presentation system is not active, skip
		if (!isPresentationSystemActive(config)) return

		// Check if interaction is in presentation channel
		if (interaction.channel.id !== config.presentation_channel_id) return

		// Get reactor and redactor members
		const reactor = await interaction.guild.members.fetch({
			user: interaction.user.id,
			force: true,
		})
		const redactor = await interaction.guild.members.fetch({
			user: interaction.message.author.id,
			force: true,
		})

		if (
			// Someone is missing
			!reactor ||
			!redactor ||
			// Reactor is a bot
			reactor.user.bot ||
			// Redactor is a bot
			redactor.user.bot ||
			// Reactor is not staff
			!reactor.roles.cache.has(config.staff_role_id!) ||
			// Redactor is already validated
			redactor.roles.cache.has(config.member_role_id!)
		)
			return

		if (interaction.customId === Emotes.Approved) {
			const presentation = await interaction.channel.messages.fetch(
				interaction.message.id,
			)

			await interaction.deferUpdate()

			await approveMember(redactor, presentation, config)
		} else if (interaction.customId === Emotes.Disapproved) {
			if (!redactor.roles.cache.has(config.member_role_id!)) {
				await sendLog(
					interaction.guild,
					`${interaction.user} disapproves **${interaction.message.author.username}**.`,
					config,
				)

				const presentation = await interaction.channel.messages.fetch(
					interaction.message.id,
				)

				await interaction.deferUpdate()

				await disapproveMember(redactor, presentation, config)
			}
		}
	},
})
