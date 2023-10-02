import * as app from "../app.js"

import messages from "../tables/messages.js"
import active from "../tables/active.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Record sent messages",
  async run(message) {
    const where = {
      author_id: message.author.id,
      channel_id: message.channelId,
    }

    const existingMessages = await messages.query.select().where(where).first()

    if (existingMessages)
      return messages.query
        .update({ count: existingMessages.count + 1 })
        .where(where)

    await messages.query.insert(where)

    // active

    if (message.guildId) {
      await active.query.insert({
        author_id: message.author.id,
        guild_id: message.guildId,
      })
    }
  },
}

export default listener
