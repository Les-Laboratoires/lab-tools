import * as app from "../app.js"

import messages from "../tables/message.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Record sent messages",
  async run(message) {
    if (!message.guild) return

    const user = await app.getUser(message.author, true)
    const guild = await app.getGuild(message.guild, true)

    await messages.query.insert({
      author_id: user._id,
      guild_id: guild._id,
    })
  },
}

export default listener
