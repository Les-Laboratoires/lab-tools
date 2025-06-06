import { ResponseCache } from "@ghom/orm"
import { code } from "discord-eval.ts"
import discord from "discord.js"

import client from "#core/client"
import env from "#core/env"

import autoRole from "#tables/autoRole"
import guilds, { type Guild } from "#tables/guild"
import users, { type User } from "#tables/user"

import { emote } from "#namespaces/emotes"

export async function sendLog(
	guild: Pick<discord.Guild, "id" | "channels">,
	toSend: string | discord.EmbedBuilder,
	config?: Guild,
) {
	config ??= await getGuild(guild)

	if (!config) return

	if (config.log_channel_id) {
		const logs = guild.channels.cache.get(config.log_channel_id)

		if (logs?.isTextBased())
			return typeof toSend === "string"
				? logs.send({ content: toSend, allowedMentions: { parse: [] } })
				: logs.send({ embeds: [toSend], allowedMentions: { parse: [] } })
	}
}

export function debounce<
	Fn extends (this: any, ...args: any[]) => void | Promise<void>,
>(fn: Fn, ms: number) {
	let timeout: NodeJS.Timeout | null

	return function (this: ThisParameterType<Fn>, ...args: Parameters<Fn>) {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => fn.apply(this, args), ms)
	}
}

const userCache = new ResponseCache((id: string) => {
	return users.query.where("id", id).first()
}, 600_000)

export async function getUser(user: { id: string }): Promise<User | undefined>
export async function getUser(user: { id: string }, force: true): Promise<User>
export async function getUser(user: { id: string }, force?: true) {
	const userInDb = await userCache.get(user.id, user.id)

	if (force && !userInDb) {
		await users.query
			.insert({
				id: user.id,
				is_bot: client.users.cache.get(user.id)?.bot ?? false,
			})
			.onConflict("id")
			.merge()

		return userCache.fetch(user.id, user.id)
	}

	return userInDb
}

const guildCache = new ResponseCache((id: string) => {
	return guilds.query.where("id", id).first()
}, 600_000)

export async function getGuild(guild: {
	id: string
}): Promise<Guild | undefined>
export async function getGuild(
	guild: { id: string },
	options: { forceExists: true; forceFetch?: boolean },
): Promise<Guild>
export async function getGuild(
	guild: { id: string },
	options?: { forceExists?: boolean; forceFetch: true },
): Promise<Guild | undefined>
export async function getGuild(
	guild: { id: string },
	options?: { forceExists?: boolean; forceFetch?: boolean },
): Promise<Guild | undefined> {
	if (options?.forceFetch) return guildCache.fetch(guild.id, guild.id)

	const config = await guildCache.get(guild.id, guild.id)

	if (options?.forceExists && !config) {
		await guilds.query.insert({ id: guild.id })

		return guildCache.fetch(guild.id, guild.id)
	}

	return config
}

export async function sendTemplatedEmbed(
	channel: discord.SendableChannels,
	template: string,
	replacers: { [k: string]: string },
) {
	if (!channel.isTextBased()) return

	for (const k in replacers)
		template = template.replace(new RegExp(`{${k}}`, "g"), replacers[k])

	try {
		const data: discord.EmbedData | discord.EmbedData[] = JSON.parse(template)

		const embeds = (Array.isArray(data) ? data : [data]).map((options) => {
			const embed = new discord.EmbedBuilder(options)

			if (options.thumbnail?.url) embed.setThumbnail(options.thumbnail.url)
			if (options.image?.url) embed.setImage(options.image.url)

			return embed
		})

		for (const embed of embeds) await channel.send({ embeds: [embed] })
	} catch (error: any) {
		if (error.message.includes("Invalid Form Body")) {
			return channel.send(
				`${await code.stringify({
					lang: "js",
					content: error.message,
				})} ${await code.stringify({
					lang: "json",
					content: template,
				})}`,
			)
		}
		return channel.send(template)
	}
}

export function embedReplacers(
	subject: discord.GuildMember | discord.PartialGuildMember,
) {
	return {
		user: subject.user.toString(),
		username: subject.user.username.replace(/"/g, '\\"'),
		guild_icon:
			subject.guild.iconURL() ??
			"https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png",
		displayName: subject.displayName.replace(/"/g, '\\"'),
		user_avatar: subject.user.displayAvatarURL(),
	}
}

export async function getAutoRoles(
	member: discord.GuildMember,
): Promise<string[]> {
	const guild = await getGuild(member.guild, { forceExists: true })

	return (
		await autoRole.query
			.where("guild_id", guild._id)
			.and.where("bot", Number(member.user.bot))
	).map((ar) => ar.role_id)
}

export async function applyAutoRoles(member: discord.GuildMember) {
	const autoRoles = await getAutoRoles(member)

	if (member.roles.cache.hasAll(...autoRoles) || autoRoles.length === 0) return

	await member.roles.add(autoRoles)
}

/**
 * @param message
 * @param index
 * @param total
 * @param pattern - use $% for percentage, $# for index, $$ for total
 * @param interval
 */
export async function sendProgress(
	message: discord.Message,
	index: number,
	total: number,
	pattern: string,
	interval = 10,
) {
	if (index % interval === 0) {
		await message.edit(
			`${emote(message, "Loading")} ${pattern
				.replace("$%", String(Math.round((index * 100) / total)))
				.replace("$#", String(index))
				.replace("$$", String(total))}`,
		)
	}
}

export function isJSON(value: string) {
	try {
		JSON.parse(value)
		return true
	} catch {
		return false
	}
}

export async function countOf(builder: any, column = "*"): Promise<number> {
	return builder.count({ total: column }).then((rows: any) => {
		return (rows[0]?.total ?? 0) as number
	})
}

export async function prefix(guild?: discord.Guild | null): Promise<string> {
	const prefix = env.BOT_PREFIX

	if (guild) {
		const guildData = await guilds.query
			.where("id", guild.id)
			.select("prefix")
			.first()
		if (guildData) {
			return guildData.prefix ?? prefix
		}
	}

	return prefix
}

export function shortNumber(number: number): string {
	if (number < 1000) return number.toString()

	if (number < 1000000) {
		number = number / 1000

		if (number < 100) return `${number.toFixed(1)}k`
		return `${number.toFixed(0)}k`
	}

	number = number / 1000000

	if (number < 100) return `${number.toFixed(1)}M`
	return `${number.toFixed(0)}M`
}

export function removeItem<T>(array: T[], itemToRemove: T) {
	const index = array.indexOf(itemToRemove)
	if (index !== -1) array.splice(index, 1)
}
