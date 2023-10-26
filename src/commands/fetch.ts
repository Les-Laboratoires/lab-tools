import * as app from "../app.js"

import messages from "../tables/message.js"

export default new app.Command({
  name: "fetch",
  description: "The fetch command",
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
      `${app.emote(
        message,
        "WAIT"
      )} Fetching messages from ${target}... (**0**)`
    )

    let found = 0

    const guild = await app.getGuild(message.guild, true)

    const userCache = new Map()

    await app.fetchMessages(message.args.channel, {
      onChunk: async (chunk) => {
        found += chunk.length

        messages.query.insert(
          await Promise.all(
            chunk.map(async (m) => {
              if (!userCache.has(m.author.id))
                userCache.set(m.author.id, await app.getUser(m.author, true))

              return {
                id: m.id,
                author_id: userCache.get(m.author.id)!._id,
                guild_id: guild._id,
                created_at: m.createdAt.toISOString(),
              }
            })
          )
        )

        feedback.edit(
          `${app.emote(
            message,
            "WAIT"
          )} Fetching messages from ${target}... (**${found}**)`
        )
      },
    })

    if (target.isText()) target.messages.cache.clear()

    return feedback.edit(
      `${app.emote(
        message,
        "CHECK"
      )} Successfully fetched **${found}** messages from ${target}.`
    )
  },
})
