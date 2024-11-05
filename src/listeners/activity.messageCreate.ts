import * as app from "#app"

import messages from "#tables/message.ts"

export default new app.Listener({
  event: "messageCreate",
  description: "Record sent messages",
  async run(message) {
    if (!app.cache.ensure<boolean>("turn", true)) return
    if (!message.guild) return

    const user = await app.getUser(message.author, true)
    const guild = await app.getGuild(message.guild, { forceExists: true })

    await messages.query.insert({
      author_id: user._id,
      guild_id: guild._id,
    })
  },
})
