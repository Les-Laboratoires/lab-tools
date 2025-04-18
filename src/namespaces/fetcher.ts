import type { Channel, Message } from "discord.js"

export async function fetchMessages(
	channel: Channel,
	onChunk: (chunk: Message[]) => unknown,
) {
	if (!channel.isTextBased())
		throw new Error(
			"discord-fetch-all: channel parameter is not a textual channel.",
		)

	let lastID: string | undefined

	while (true) {
		const fetchedMessages = await channel.messages.fetch({
			limit: 100,
			...(lastID && { before: lastID }),
		})

		await onChunk(Array.from(fetchedMessages.values()))

		if (fetchedMessages.size === 0) return

		lastID = fetchedMessages.lastKey()
	}
}
