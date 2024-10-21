import * as app from "#app"
import helping from "#tables/helping.ts"

const listener: app.Listener<"threadDelete"> = {
  event: "threadDelete",
  description: "Clean up the helping table when a thread is deleted",
  async run(channel) {
    if (!app.cache.ensure<boolean>("turn", true)) return

    if (!channel.parent) return

    const guild = await app.getGuild(channel.guild)

    if (!guild) return
    if (channel.parent.id !== guild.help_forum_channel_id) return

    await helping.query.where("id", channel.id).delete()
  },
}

export default listener
