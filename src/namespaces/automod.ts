import * as discordEval from "discord-eval.ts"
import type discord from "discord.js"
import { emote } from "#namespaces/emotes"
import * as tools from "#namespaces/tools"
import labTable from "#tables/lab"

export async function detectAndBanSpammer(message: discord.Message) {
	if (
		message.system ||
		!message.author ||
		message.author.bot ||
		message.author.system ||
		!message.guildId
	)
		return

	const config = await tools.getGuild({ id: message.guildId })

	if (!config || !config.auto_ban_channel_id) return

	if (message.channel.id === config.auto_ban_channel_id) {
		const result = await globalBan(
			message.client.user,
			message.author,
			`Spamming in ${message.guild!.name}`,
		)

		if (config.general_channel_id) {
			const general = message.client.channels.cache.get(
				config.general_channel_id,
			)

			if (general?.isSendable()) {
				const success = result.filter(
					(result) => result.status === "fulfilled",
				).length
				const errored = result.length - success

				if (success > 0 && errored === 0) {
					await general.send(
						`${emote(message, "CheckMark")} **${
							message.author.tag
						}** detected as a spammer and banned from **${success}** labs.`,
					)
				} else if (success > 0 && errored > 0) {
					await general.send(
						`${emote(message, "CheckMark")} **${
							message.author.tag
						}** detected as a spammer and banned from **${success}** labs.\n**${errored}** labs failed to ban the user Reasons:\n${result
							.filter((result) => result.status === "rejected")
							.map((result) => `- ${result.reason}`)
							.join("\n")}`,
					)
				} else {
					await general.send(
						`${emote(message, "Cross")} **${
							message.author.tag
						}** detected as a spammer but all labs failed to ban the user.`,
					)
				}
			}
		}
	}
}

export async function globalBan(
	author: discord.PartialUser | discord.User,
	target: discord.PartialUser | discord.User,
	reason: string,
) {
	const guilds = target.client.guilds.cache.filter((guild) =>
		guild.members.me?.permissions.has("BanMembers", true),
	)

	const labs = await labTable.query
		.select("guild_id")
		.whereNot("ignored", true)
		.then((results) => results.map((result) => result.guild_id))

	return Promise.allSettled(
		guilds.map(async (guild) => {
			const config = await tools.getGuild(guild)

			if (!config || !labs.includes(config._id)) return

			const member =
				guild.members.cache.get(target.id) ||
				(await guild.members.fetch(target.id).catch(() => null))
			if (!member) return

			try {
				await guild.bans.create(target.id, {
					reason,
					// delete all messages from the user in the last 5 hours
					deleteMessageSeconds: 60 * 60 * 5,
				})

				await tools.sendLog(
					guild,
					`**${target.tag}** has been banned by **${author.tag}**.\nReason: ${reason.toLowerCase()}`,
				)
			} catch (error: any) {
				await tools.sendLog(
					guild,
					`**${target.tag}** could not be banned...${await discordEval.code.stringify(
						{
							content: error.message,
							lang: "js",
						},
					)}`,
				)

				throw error
			}
		}),
	)
}
