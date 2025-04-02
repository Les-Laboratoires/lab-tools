import * as discordEval from "discord-eval.ts"
import * as discord from "discord.js"
import client from "#core/client"
import env from "#core/env"

const webhookClient =
	env.BOT_MODE !== "test"
		? new discord.WebhookClient({
				url: env.MONITORING_WEBHOOK_URL,
			})
		: null

const sendErrorWebhook = async (error: string) => {
	webhookClient
		?.send({
			username: "Lab Tools - Monitoring",
			avatarURL: client.user?.avatarURL() ?? undefined,
			content: await discordEval.code.stringify({
				lang: "js",
				content: error,
			}),
		})
		.catch(console.error)
}

export function initMonitoring() {
	process.on("uncaughtException", (error) =>
		sendErrorWebhook(error.stack || error.message).catch(console.error),
	)

	process.on("unhandledRejection", (reason, promise) =>
		sendErrorWebhook(
			`Unhandled Rejection at: ${promise}\nReason: ${reason}`,
		).catch(console.error),
	)

	process.on("warning", (warning) =>
		sendErrorWebhook(warning.stack || warning.message).catch(console.error),
	)
}
