import { Listener } from "#core/listener"
import { cache } from "#core/util"
import { getGuild } from "#namespaces/tools"
import helping from "#tables/helping"

export default new Listener({
	event: "threadDelete",
	description: "Clean up the helping table when a thread is deleted",
	async run(channel) {
		if (!cache.ensure<boolean>("turn", true)) return

		if (!channel.parent) return

		const guild = await getGuild(channel.guild)

		if (!guild) return
		if (channel.parent.id !== guild.help_forum_channel_id) return

		await helping.query.where("id", channel.id).delete()
	},
})
