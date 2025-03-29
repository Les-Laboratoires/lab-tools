import { option } from "#core/argument"
import { Command } from "#core/command"

import guildTable from "#tables/guild"

import * as active from "#namespaces/active"
import { emote } from "#namespaces/emotes"
import * as middlewares from "#namespaces/middlewares"
import * as tools from "#namespaces/tools"

let used = false

export default new Command({
	name: "active",
	description: "Update the active list",
	channelType: "guild",
	middlewares: [
		middlewares.staffOnly,
		middlewares.hasConfigKey("active_role_id"),
		middlewares.isNotInUse(() => used),
	],
	flags: [
		{
			flag: "f",
			name: "force",
			description: "Force the update of all members",
		},
	],
	options: [
		option({
			name: "period",
			description: "The period to check (in hours)",
			type: "number",
			validate: (value) => value > 0,
			validationErrorMessage: "The period must be greater than 0.",
		}),
		option({
			name: "messageCount",
			aliases: ["count"],
			description: "The minimum message count",
			type: "number",
			validate: (value) => value > 0,
			validationErrorMessage: "The period must be greater than 0.",
		}),
	],
	async run(message) {
		used = true

		const config = await tools.getGuild(message.guild, {
			forceExists: true,
			forceFetch: true,
		})

		const waiting = await message.channel.send(
			`${emote(message, "Loading")} Fetching members...`,
		)

		if (message.args.period || message.args.messageCount) {
			await guildTable.query.where("id", message.guild.id).update({
				active_period: `${message.args.period ?? config.active_period}`,
				active_message_count: `${message.args.messageCount ?? config.active_message_count}`,
			})
		}

		await active.updateActive(message.guild, {
			force: message.args.force,
			period: message.args.period ?? +config.active_period,
			messageCount: message.args.messageCount ?? +config.active_message_count,
			onLog: (text) => waiting.edit(text),
			guildConfig: config,
		})

		used = false
	},
	subs: [
		new Command({
			name: "leaderboard",
			description: `Show the leaderboard of Activity`,
			channelType: "guild",
			aliases: ["ladder", "lb", "top", "rank"],
			options: [
				option({
					name: "lines",
					description: "Number of lines to show per page",
					type: "number",
					default: 15,
					aliases: ["line", "count"],
					validate: (value) => value > 0 && value <= 50,
				}),
			],
			run: async (message) => {
				const guild = await tools.getGuild(message.guild, { forceExists: true })

				active.activeLadder(guild._id).send(message.channel, {
					pageLineCount: message.args.lines,
				})
			},
		}),
	],
})
