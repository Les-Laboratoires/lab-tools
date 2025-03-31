import { Listener } from "#core/listener"
import { cache } from "#core/util"

import * as tools from "#namespaces/tools"

import messages from "#tables/message"

export default new Listener({
	event: "messageCreate",
	description: "Record sent messages",
	async run(message) {
		if (!cache.ensure<boolean>("turn", true)) return
		if (!message.guild) return

		const user = await tools.getUser(message.author, true)
		const guild = await tools.getGuild(message.guild, { forceExists: true })

		await messages.query.insert({
			author_id: user._id,
			guild_id: guild._id,
		})
	},
})
