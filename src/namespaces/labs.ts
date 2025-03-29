import * as orm from "@ghom/orm"
import type * as discord from "discord.js"

import type * as command from "#core/command"
import { divider } from "#core/util"

import lab from "#tables/lab"

import { emote } from "#namespaces/emotes"
import * as tools from "#namespaces/tools"

const allLabsKey = "all labs"

export const allLabsCache = new orm.ResponseCache(
	async () => lab.query.select(),
	60_000,
)

/**
 * @Todo use forum channels instead...
 */
export async function updateLabsInAffiliationChannels(
	message: command.UnknownMessage,
	packSize: number,
) {
	const labs = await allLabsCache.fetch(allLabsKey)

	const pages = divider(labs, packSize)

	for (const guild of message.client.guilds.cache.values()) {
		const config = await tools.getGuild(guild)

		if (config?.affiliation_channel_id) {
			const channel = guild.channels.cache.get(config.affiliation_channel_id)

			if (channel?.isTextBased()) {
				const messages = await channel.messages.fetch()

				for (const m of messages.values()) await m.delete()

				for (const page of pages)
					await channel.send(
						page.map((lab) => `${lab.title} ${lab.url}`).join("\n"),
					)

				await message.channel.send(
					`${emote(message, "CheckMark")} Updated **${guild}** affiliations`,
				)
			}
		}
	}

	await message.channel.send(
		`${emote(message, "CheckMark")} Successfully updated all affiliations.`,
	)
}

export async function sendLabList(
	channel: discord.SendableChannels,
	packSize: number,
) {
	const labs = await allLabsCache.get(allLabsKey)

	const pages = divider(labs, packSize)

	if (pages.length === 0)
		return channel.send(`${emote(channel, "Cross")} No labs found.`)

	if (channel.isTextBased()) {
		for (const page of pages)
			await channel.send(
				page.map((lab) => `${lab.title} ${lab.url}`).join("\n"),
			)
	}
}

const ignoredCache = new orm.ResponseCache(async (id: string) => {
	return lab.query
		.where("guild_id", id)
		.first()
		.then((lab) => !!lab?.ignored)
}, 60_000)

export async function isIgnored(id: string): Promise<boolean> {
	return ignoredCache.get(id, id)
}
