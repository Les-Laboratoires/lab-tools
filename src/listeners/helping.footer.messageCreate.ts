import { Listener } from "#core/listener"
import { cache } from "#core/util"
import { helpingFooterCacheId } from "#namespaces/caches"
import { refreshHelpingFooter } from "#namespaces/point"
import { getGuild } from "#namespaces/tools"

export default new Listener({
	event: "messageCreate",
	description: "Handle messages in the help forum channels",
	async run(message) {
		if (!cache.ensure<boolean>("turn", true)) return

		if (message.author.bot) return
		if (!message.guild) return
		if (!message.channel.isThread()) return
		if (!message.channel.parent) return

		const guild = await getGuild(message.guild, { forceExists: true })

		if (message.channel.parent.id !== guild.help_forum_channel_id) return

		if (message.channel.messages.cache.size <= 2) return

		// Appeler la fonction refreshHelpingFooter ↓ 10 secondes après le dernier message (chaque message réinitialise le timer)
		// await app.refreshHelpingFooter(message.channel)

		const cacheId = helpingFooterCacheId(message.channel)

		const timer = cache.get<NodeJS.Timeout>(cacheId)

		if (timer) clearTimeout(timer)

		cache.set(
			cacheId,
			setTimeout(
				(channel) => {
					refreshHelpingFooter(channel)
					cache.delete(cacheId)
				},
				10_000,
				message.channel,
			),
		)
	},
})
