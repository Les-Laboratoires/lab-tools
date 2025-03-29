import client from "#core/client"
import { Cron } from "#core/cron"
import {
	updateGuildMessageCountTracker,
	updateGuildOnlineCountTracker,
} from "#namespaces/tracker"

/**
 * See the {@link https://ghom.gitbook.io/bot.ts/usage/create-a-cron cron guide} for more information.
 */
export default new Cron({
	name: "tracker",
	description: "Update the guild tracker every 5 minutes",
	schedule: {
		type: "minute",
		duration: 5,
	},
	async run() {
		const guilds = client.guilds.cache

		for (const guild of guilds.values()) {
			await updateGuildOnlineCountTracker(guild)
			await updateGuildMessageCountTracker(guild)
		}
	},
})
