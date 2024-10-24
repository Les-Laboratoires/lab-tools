import * as app from "#app"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Handle messages in the help forum channels",
  async run(message) {
    if (!app.cache.ensure<boolean>("turn", true)) return

    if (message.author.bot) return
    if (!message.guild) return
    if (!message.channel.isThread()) return
    if (!message.channel.parent) return

    const guild = await app.getGuild(message.guild, { forceExists: true })

    if (message.channel.parent.id !== guild.help_forum_channel_id) return

    if (message.channel.messages.cache.size <= 2) return

    // Appeler la fonction refreshHelpingFooter ↓ 10 secondes après le dernier message (chaque message réinitialise le timer)
    // await app.refreshHelpingFooter(message.channel)

    const cacheId = `helping.footer.timer.${message.channelId}`

    const timer = app.cache.get<NodeJS.Timeout>(cacheId)

    if (timer) clearTimeout(timer)

    app.cache.set(
      cacheId,
      setTimeout(
        (channel) => {
          app.refreshHelpingFooter(channel)
          app.cache.delete(cacheId)
        },
        10_000,
        message.channel,
      ),
    )
  },
}

export default listener
