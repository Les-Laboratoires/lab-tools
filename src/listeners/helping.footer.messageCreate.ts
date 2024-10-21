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

    await app.refreshHelpingFooter(message.channel)
  },
}

export default listener
