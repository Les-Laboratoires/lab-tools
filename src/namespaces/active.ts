import type discord from "discord.js"
import database from "#core/database"
import env from "#core/env"
import { emote } from "#namespaces/emotes"
import * as ladder from "#namespaces/ladder"
import * as tools from "#namespaces/tools"
import active from "#tables/active"
import type { Guild } from "#tables/guild"
import message from "#tables/message"

/**
 * @param guild_id internal guild id
 * @param period period to check activity in hours
 * @param messageCount minimum message count in period to be active
 */
export async function fetchActiveMembers(
	guild_id: number,
	period: number,
	messageCount: number,
): Promise<
	{
		messageCount: number
		target: string
	}[]
> {
	return message.query
		.select("u.id as target")
		.count({ messageCount: "*" })
		.leftJoin("user as u", "message.author_id", "u._id")
		.where("guild_id", guild_id)
		.where(
			"created_at",
			">",
			database.raw(`now() - interval '1 hour' * ${period}`),
		)
		.groupBy("u.id")
		.havingRaw(`count(*) >= ${messageCount}`)
		.orderByRaw('"messageCount" desc')
}

export async function updateActive(
	guild: discord.Guild,
	options: {
		force: boolean
		period: number
		messageCount: number
		onLog?: (text: string) => unknown | Promise<unknown>
		guildConfig: Guild
	},
): Promise<number> {
	if (env.BOT_MODE === "development") return 0

	guild.members.cache.clear()

	const members = (await guild.members.fetch())
		.filter((member) => !member.user.bot)
		.map((member) => member)

	guild.members.cache.clear()

	const activeMembers: discord.GuildMember[] = []
	const inactiveMembers: discord.GuildMember[] = []

	const actives = await fetchActiveMembers(
		options.guildConfig._id,
		options.period,
		options.messageCount,
	)

	for (const member of members) {
		const isActive = actives.find((active) => active.target === member.id)

		if (isActive) activeMembers.push(member)
		else inactiveMembers.push(member)
	}

	if (options.force) {
		await active.query.delete().where("guild_id", options.guildConfig._id)

		if (activeMembers.length > 0)
			await active.query.insert(
				await Promise.all(
					activeMembers.map(async (member) => {
						const user = await tools.getUser(member, {
							forceExists: true,
							forceFetch: true,
						})

						return {
							user_id: user._id,
							guild_id: options.guildConfig._id,
						}
					}),
				),
			)

		if (options.onLog)
			await options.onLog(
				`${emote(guild, "Loading")} Verification of **0**/**${
					members.length
				}** members...`,
			)

		for (const member of activeMembers) {
			await member.fetch(true)

			if (!member.roles.cache.has(options.guildConfig.active_role_id!))
				await member.roles.add(options.guildConfig.active_role_id!)

			if (options.onLog)
				await options.onLog(
					`${emote(
						guild,
						"Loading",
					)} Verification of **${activeMembers.indexOf(member)}**/**${
						members.length
					}** members...`,
				)
		}

		for (const member of inactiveMembers) {
			await member.fetch(true)

			if (member.roles.cache.has(options.guildConfig.active_role_id!))
				await member.roles.remove(options.guildConfig.active_role_id!)

			if (options.onLog)
				await options.onLog(
					`${emote(guild, "Loading")} Verification of **${
						activeMembers.length + inactiveMembers.indexOf(member)
					}**/**${members.length}** members...`,
				)
		}
	} else {
		// use the cache to update only the changed members

		const activeMembersCache = await active.query.where(
			"guild_id",
			options.guildConfig._id,
		)

		if (options.onLog)
			await options.onLog(
				`${emote(guild, "Loading")} Update of **${
					activeMembers.length
				}** active members...`,
			)

		for (const member of activeMembers) {
			const user = await tools.getUser(member, { forceExists: true })

			if (!activeMembersCache.find((am) => am.user_id === user._id)) {
				await member.roles.add(options.guildConfig.active_role_id!)
				await active.query.insert({
					user_id: user._id,
					guild_id: options.guildConfig._id,
				})
			}
		}

		if (options.onLog)
			await options.onLog(
				`${emote(guild, "Loading")} Update of **${
					inactiveMembers.length
				}** inactive members...`,
			)

		for (const member of inactiveMembers) {
			const user = await tools.getUser(member, { forceExists: true })

			if (activeMembersCache.find((am) => am.user_id === user._id)) {
				await member.roles.remove(options.guildConfig.active_role_id!)
				await active.query.delete().where({
					user_id: user._id,
					guild_id: options.guildConfig._id,
				})
			}
		}
	}

	if (options.onLog)
		options.onLog(
			`${emote(guild, "CheckMark")} Found **${
				activeMembers.length
			}** active members.`,
		)

	return activeMembers.length
}

/**
 * @param guild_id
 * @param period in hours
 */
export async function hasActivity(
	guild_id: number,
	period: number,
): Promise<boolean> {
	return tools
		.countOf(
			message.query
				.leftJoin("user", "message.author_id", "user._id")
				.where("message.guild_id", guild_id)
				.where("user.is_bot", false)
				.whereRaw(
					`extract(epoch from now()) - extract(epoch from message.created_at) < ${period} * 3600`,
				),
		)
		.then((count) => count > 0)
}

export interface ActiveLadderLine {
	rank: number
	target: string
	messageCount: number
}

export const activeLadder = (guild_id: number) =>
	new ladder.Ladder<ActiveLadderLine>({
		title: "Guild's activity",
		fetchLines(options) {
			return message.query
				.select(
					database.raw(
						`rank() over (order by count(*) desc) as "rank", "user"."id" as "target", count(*) as "messageCount"`,
					),
				)
				.leftJoin("user", "message.author_id", "user._id")
				.where("guild_id", guild_id)
				.andWhere("user.is_bot", false)
				.groupBy("user.id")
				.having(database.raw("count(*) > 0"))
				.orderBy("rank", "asc")
				.limit(options.pageLineCount)
				.offset(options.pageIndex * options.pageLineCount)
		},
		async fetchLineCount() {
			return tools.countOf(
				message.query
					.leftJoin("user", "message.author_id", "user._id")
					.where("guild_id", guild_id)
					.andWhere("user.is_bot", false)
					.groupBy("user.id")
					.having(database.raw("count(*) > 0")),
			)
		},
		formatLine(line, index, lines) {
			return `${ladder.formatRank(line.rank)} avec \`${String(
				line.messageCount,
			).padEnd(
				Math.max(...lines.map((l) => l.messageCount), 0).toString().length,
			)}\` msg - <@${line.target}>`
		},
	})
