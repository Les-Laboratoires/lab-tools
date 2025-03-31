import { Listener } from "#core/listener"

import guilds from "#tables/guild"

export default new Listener({
	event: "guildDelete",
	description: "Remove guild from db",
	async run(guild) {
		await guilds.query.delete().where("id", guild.id)
	},
})
