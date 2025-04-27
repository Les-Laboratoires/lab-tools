import * as command from "#core/command"
import * as logger from "#core/logger"
import * as tools from "#namespaces/tools"

import discord from "discord.js"
import type { Guild } from "#tables/guild"
import labs from "#tables/lab"

export const staffOnly = new command.Middleware(
	"Staff only",
	async function staffOnly(context, data) {
		if (!context.guild)
			return {
				result: "This command can only be used in a guild.",
				data,
			}

		const config = await tools.getGuild(context.guild)

		if (!config?.staff_role_id)
			logger.warn(`Staff role is not configured in ${context.guild.name}`)

		if (!context.member)
			return {
				result: "You must be a member of the guild.",
				data,
			}

		const member = await context.guild.members.fetch(context.member.user.id)

		return {
			result:
				(config?.staff_role_id &&
					member.roles.cache.has(config.staff_role_id)) ||
				context.guild.ownerId === member.id ||
				member.permissions.has("Administrator") ||
				"You must be a member of staff.",
			data,
		}
	},
)

export const hasConfigKey = (key: keyof Guild) =>
	new command.Middleware(
		`Has ${key} key`,
		async function hasConfigKey(context, data) {
			if (!context.guild)
				return {
					result: "This command can only be used in a guild.",
					data,
				}

			const config = await tools.getGuild(context.guild)

			if (!config?.[key])
				return {
					result:
						context instanceof discord.ChatInputCommandInteraction
							? `You need to setup the **${key}** property !\nUse the \`/config set ${key} <value>\` comand`
							: `You need to setup the **${key}** property !\nUse the \`${context.usedPrefix}config set ${key} <value>\` comand`,
					data,
				}

			return {
				result: true,
				data,
			}
		},
	)

export const isNotInUse = (inUse: () => boolean) =>
	new command.Middleware("Is not in use", async function isNotInUse(_, data) {
		return {
			result: !inUse() || "Command is already in use.",
			data,
		}
	})

export const labOnly = new command.Middleware(
	"Lab only",
	async function labOnly(message, data) {
		if (!message.guild)
			return {
				result: "This command can only be used in a guild.",
				data,
			}

		const config = await tools.getGuild(message.guild)

		if (!config)
			return {
				result: "This command can only be used in a lab.",
				data,
			}

		const lab = await labs.query
			.where("guild_id", config._id)
			.andWhereNot("ignored", true)
			.first()

		return {
			result: !!lab || "This command can only be used in a lab.",
			data,
		}
	},
)
