import { z } from "zod"
import { Config } from "#core/config"
import { Emotes } from "#namespaces/emotes"

export const config = new Config({
	ignoreBots: true,
	openSource: true,
	permissions: [],
	envSchema: z.object({
		OPENAI_API_KEY: z.string(),
		MONITORING_WEBHOOK_URL: z.string(),
	}),
	async getPrefix(message) {
		return import("#namespaces/tools").then((app) => app.prefix(message.guild))
	},
	client: {
		intents: [
			"Guilds",
			"GuildMembers",
			"GuildModeration",
			"GuildEmojisAndStickers",
			"GuildIntegrations",
			"GuildWebhooks",
			"GuildInvites",
			"GuildVoiceStates",
			"GuildPresences",
			"GuildMessages",
			"GuildMessageTyping",
			"GuildMessageReactions",
			"DirectMessages",
			"DirectMessageTyping",
			"DirectMessageReactions",
			"MessageContent",
		],
	},
	paginatorEmojis: {
		start: Emotes.Left,
		previous: Emotes.Minus,
		next: Emotes.Plus,
		end: Emotes.Right,
	},
	systemEmojis: {
		success: Emotes.CheckMark,
		error: Emotes.Cross,
		loading: Emotes.Loading,
	},
})

export default config.options
