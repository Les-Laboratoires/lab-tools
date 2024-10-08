import * as app from "#app"

import messages, { Message } from "#tables/message.ts"

export default new app.Command({
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
      `${app.emote(message, "Loading")} Fetching messages from ${target}...`,
    )

    let found = 0

    const guild = await app.getGuild(message.guild, { forceExists: true })

    const userCache = new Map()

    const editInterval = 5000
    let lastEdit = Date.now()

    await app.fetchMessages(message.args.channel, async (chunk) => {
      found += chunk.length

      const data: Message[] = []

      for (const m of chunk) {
        if (!userCache.has(m.author.id)) {
          const user = await app.getUser(m.author, true)
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
        `${app.emote(
          message,
          "Loading",
        )} Fetching messages from ${target}... (**${found}** messages from **${
          userCache.size
        }** users)`,
      )
    })

    if (target.isTextBased()) target.messages.cache.clear()

    return feedback.edit(
      `${app.emote(
        message,
        "CheckMark",
      )} Successfully fetched **${found}** messages from **${
        userCache.size
      }** users from ${target}.`,
    )
  },
})
