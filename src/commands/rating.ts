import { Command, flag, option, positional } from "#core/index"

import { emote } from "#namespaces/emotes"
import { ratingEmbed, ratingLadder } from "#namespaces/rating"
import { getGuild, getUser } from "#namespaces/tools"

import rating from "#tables/rating"

export default new Command({
	name: "rating",
	aliases: ["note", "rate"],
	description: "Rate a user or a bot",
	channelType: "guild",
	positional: [
		positional({
			name: "member",
			description: "The rated member",
			type: "member",
			validate: (value, message) => {
				return (
					(value !== message.member && !!value) || "You can't target yourself."
				)
			},
		}),
		positional({
			name: "rating",
			description: "Rating from 0 to 5",
			type: "number",
			validate: (rating) =>
				rating >= 0 && rating <= 5 && Number.isInteger(rating),
		}),
	],
	async run(message) {
		if (message.args.member) {
			if (message.args.rating !== null) {
				const value = message.args.rating as 0 | 1 | 2 | 3 | 4 | 5

				const fromUser = await getUser(message.author, true)
				const toUser = await getUser(message.args.member, true)
				const guild = await getGuild(message.guild, { forceExists: true })

				const pack = {
					guild_id: guild._id,
					from_id: fromUser._id,
					to_id: toUser._id,
				}

				if (await rating.query.where(pack).first()) {
					await rating.query.update({ value }).where(pack)
				} else {
					await rating.query.insert({ value, ...pack })
				}

				return message.channel.send(
					`${emote(message, "CheckMark")} Successfully rated.`,
				)
			}

			return message.channel.send({
				embeds: [await ratingEmbed(message.args.member)],
			})
		}

		return message.channel.send({
			embeds: [await ratingEmbed(message.member)],
		})
	},
	subs: [
		new Command({
			name: "leaderboard",
			description: "Show the leaderboard of Rating",
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
			flags: [
				flag({
					name: "global",
					flag: "g",
					description: "Show the global leaderboard of Rating",
				}),
			],
			run: async (message) => {
				const guild = message.args.global
					? undefined
					: await getGuild(message.guild, { forceExists: true })

				ratingLadder(guild?._id).send(message.channel, {
					pageLineCount: message.args.lines,
				})
			},
		}),
	],
})
