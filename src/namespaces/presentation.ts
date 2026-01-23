import type discord from "discord.js"

import logger from "#core/logger"

import type { Guild } from "#tables/guild"
import users from "#tables/user"

import {
	embedReplacers,
	getAutoRoles,
	getGuild,
	sendLog,
	sendTemplatedEmbed,
} from "#namespaces/tools"

import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

/**
 * Check if the presentation system is active for a guild
 */
export function isPresentationSystemActive(config: Guild): boolean {
	return !!(
		config.presentation_channel_id &&
		config.await_validation_role_id &&
		config.member_role_id
	)
}

/**
 * Approve a member and give them the member role
 */
export async function approveMember(
	member: discord.GuildMember,
	presentation?: discord.Message,
	config?: Guild,
) {
	// Update user presentation data
	await users.query
		.insert({
			id: member.id,
			presentation_id: presentation?.id ?? null,
			presentation_guild_id: presentation?.guild?.id ?? null,
		})
		.onConflict("id")
		.merge(["presentation_id", "presentation_guild_id"])

	if (!config) config = await getGuild(member.guild, { forceExists: true })

	await member.fetch(true)

	const roles = await getAutoRoles(member)

	if (config.member_role_id) roles.push(config.member_role_id)

	try {
		await member.roles.set([
			...roles,
			...member.roles.cache
				.filter((role) => role.id !== config?.await_validation_role_id)
				.map((role) => role.id),
		])
	} catch (error) {
		logger.error(
			`missing permission in ${member.guild.name} for ${member.user.username}`,
			__filename,
		)
	}

	// Send welcome message
	if (config.general_channel_id && config.member_welcome_message) {
		const general = member.client.channels.cache.get(config.general_channel_id)

		if (general?.isSendable()) {
			await sendTemplatedEmbed(general, config.member_welcome_message, {
				...embedReplacers(member),
				presentation: (
					presentation?.content ?? "*This member does not have a presentation.*"
				)
					.replace(/\n/g, "\\n")
					.replace(/"/g, '\\"'),
			})
		}
	}

	await sendLog(member.guild, `${member.user} has been approved.`, config)
}

/**
 * Disapprove a member, log their presentation and kick them
 */
export async function disapproveMember(
	member: discord.GuildMember,
	presentation: discord.Message,
	config?: Guild,
) {
	// Delete user data
	await users.query.delete().where({ id: member.id })

	if (!config) config = await getGuild(member.guild, { forceExists: true })

	// Log the presentation before kicking
	if (config.log_channel_id) {
		const logChannel = member.client.channels.cache.get(config.log_channel_id)

		if (logChannel?.isSendable()) {
			await sendTemplatedEmbed(
				logChannel,
				`**Disapproved presentation from ${member.user.username}:**\n{presentation}`,
				{
					...embedReplacers(member),
					presentation: presentation.content
						.replace(/\n/g, "\\n")
						.replace(/"/g, '\\"'),
				},
			)
		}
	}

	await sendLog(
		member.guild,
		`${member.user} has been disapproved and kicked.`,
		config,
	)

	// Kick the member
	await member.kick("Presentation disapproved")

	// Delete the presentation message
	await presentation.delete().catch(() => {})
}
