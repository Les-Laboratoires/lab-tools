import { AnyChannel, Message } from "discord.js"

export async function fetchMessages(
  channel: AnyChannel,
  onChunk: (chunk: Message[]) => unknown,
) {
  if (!channel.isText())
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
