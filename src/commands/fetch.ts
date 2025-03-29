import { Command } from "#core/index"

import { emote } from "#namespaces/emotes"
import { fetchMessages } from "#namespaces/fetcher"
import { getGuild, getUser } from "#namespaces/tools"

import messages, { type Message } from "#tables/message"

export default new Command({
	name: "fetch",
	description: "Fetch all messages from a channel",
	channelType: "guild",
	botOwnerOnly: true,
	positional: [
		{
			name: "channel",
			description: "The channel to fetch messages from",
			type: "channel",
			required: true,
		},
	],
	async run(message) {
		const target = message.args.channel

		const feedback = await message.channel.send(
			`${emote(message, "Loading")} Fetching messages from ${target}...`,
		)

		let found = 0

		const guild = await getGuild(message.guild, { forceExists: true })

		const userCache = new Map()

		const editInterval = 5000
		let lastEdit = Date.now()

		await fetchMessages(message.args.channel, async (chunk) => {
			found += chunk.length

			const data: Message[] = []

			for (const m of chunk) {
				if (!userCache.has(m.author.id)) {
					const user = await getUser(m.author, true)
					userCache.set(m.author.id, user)
				}

				data.push({
					author_id: userCache.get(m.author.id)!._id,
					guild_id: guild._id,
					created_at: m.createdAt.toISOString(),
				})
			}

			if (data.length > 0) await messages.query.insert(data)

			if (Date.now() < lastEdit + editInterval) return

			lastEdit = Date.now()

			await feedback.edit(
				`${emote(
					message,
					"Loading",
				)} Fetching messages from ${target}... (**${found}** messages from **${
					userCache.size
				}** users)`,
			)
		})

		if (target.isTextBased()) target.messages.cache.clear()

		return feedback.edit(
			`${emote(
				message,
				"CheckMark",
			)} Successfully fetched **${found}** messages from **${
				userCache.size
			}** users from ${target}.`,
		)
	},
})
