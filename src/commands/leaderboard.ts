import { EmbedBuilder } from "discord.js"

import { option } from "#core/argument"
import { Command } from "#core/command"

import { activeLadder } from "#namespaces/active"
import { coinLadder } from "#namespaces/coins"
import { emote } from "#namespaces/emotes"
import { pointLadder } from "#namespaces/point"
import { ratingLadder } from "#namespaces/rating"
import { getGuild } from "#namespaces/tools"

export default new Command({
	name: "leaderboard",
	aliases: ["lb", "ladder", "top", "rank"],
	description: "Show all leaderboards",
	channelType: "guild",
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
	async run(message) {
		const guild = await getGuild(message.guild, { forceExists: true })

		const ladders = [
			ratingLadder(guild._id),
			activeLadder(guild._id),
			pointLadder,
			coinLadder,
		]

		return message.channel.send({
			embeds: [
				new EmbedBuilder().setTitle("Leaderboards").setFields(
					await Promise.all(
						ladders.map(async (ladder) => ({
							name: ladder.options.title,
							value:
								(await ladder.fetchPage({
									pageIndex: 0,
									pageLineCount: message.args.lines,
								})) || `${emote(message, "Cross")} No ladder available`,
							inline: false,
						})),
					),
				),
			],
		})
	},
})
