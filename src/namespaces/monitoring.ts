import * as discordEval from "discord-eval.ts"
import client from "#core/client"
import env from "#core/env"

export async function sendError(error: string) {
	const logs = client.channels.cache.get(env.MONITORING_CHANNEL)

	if (logs?.isSendable())
		return logs.send({
			content: await discordEval.code.stringify({
				lang: "js",
				content: error,
			}),
			allowedMentions: { parse: [] },
		})
}

export function initMonitoring() {
	process.on("uncaughtException", (error) =>
		sendError(error.stack || error.message).catch(console.error),
	)

	process.on("unhandledRejection", (reason, promise) =>
		sendError(`Unhandled Rejection at: ${promise}\nReason: ${reason}`).catch(
			console.error,
		),
	)

	process.on("warning", (warning) =>
		sendError(warning.stack || warning.message).catch(console.error),
	)
}
