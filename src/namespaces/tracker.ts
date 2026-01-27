import type discord from "discord.js"

import env from "#core/env"

import message from "#tables/message"

import { fetchAllMembers } from "#namespaces/members"
import { getGuild, shortNumber } from "#namespaces/tools"

export async function updateGuildMemberCountTracker(guild: discord.Guild) {
	if (env.BOT_MODE === "development") return

	const config = await getGuild(guild)

	if (config?.member_tracker_channel_id) {
		const channel = await guild.channels.fetch(config.member_tracker_channel_id)

		if (channel) {
			await channel.setName(
				config.member_tracker_pattern.replace(
					"$n",
					shortNumber(guild.memberCount),
				),
			)
		}
	}
}

export async function updateGuildMessageCountTracker(guild: discord.Guild) {
	if (env.BOT_MODE === "development") return

	const config = await getGuild(guild)

	if (config?.message_tracker_channel_id) {
		const channel = await guild.channels.fetch(
			config.message_tracker_channel_id,
		)

		if (channel) {
			const messages = await message.count(`guild_id = ${config._id}`)

			await channel.setName(
				config.message_tracker_pattern.replace("$n", shortNumber(messages)),
			)
		}
	}
}

export async function updateGuildOnlineCountTracker(guild: discord.Guild) {
	if (env.BOT_MODE === "development") return

	const config = await getGuild(guild)

	if (config?.online_tracker_channel_id) {
		const channel = await guild.channels.fetch(config.online_tracker_channel_id)

		if (channel) {
			try {
				const members = await fetchAllMembers(guild, {
					withPresences: true,
					time: 60_000 * 15,
				})

				const onlineMembers = members.filter(
					(member) => !!member.presence && member.presence.status !== "offline",
				)

				await channel.setName(
					config.online_tracker_pattern.replace(
						"$n",
						shortNumber(onlineMembers.size),
					),
				)
			} catch (error) {
				console.error("Error fetching members with presence:", error)
			}
		}
	}
}
