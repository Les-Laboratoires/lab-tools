import * as discordEval from "discord-eval.ts"
import * as discord from "discord.js"
import client from "#core/client"
import env from "#core/env"
import * as tools from "#namespaces/tools"

const webhookClient =
	env.BOT_MODE !== "test"
		? new discord.WebhookClient({
				url: env.MONITORING_WEBHOOK_URL,
			})
		: null

const ERROR_COOLDOWN = 10000

const errorStacks = new Set<string>()
const errorCooldowns = new Map<string, number>()

const sendErrorWebhook = tools.debounce(async () => {
	webhookClient
		?.send({
			username: "Lab Tools - Monitoring",
			avatarURL: client.user?.avatarURL() ?? undefined,
			content: await discordEval.code.stringify({
				lang: "js",
				content: [...errorStacks].join("\n"),
			}),
		})
		.catch(console.error)
		.finally(() => {
			errorStacks.clear()
		})
}, 1000)

const recordError = (error: string) => {
	const hash = error.substring(0, 300)
	const now = Date.now()

	if (
		errorCooldowns.has(hash) &&
		errorCooldowns.get(hash)! < now + ERROR_COOLDOWN
	)
		return

	errorCooldowns.set(hash, now)
	errorStacks.add(error)

	sendErrorWebhook()
}

export function initMonitoring() {
	const originalStderrWrite = process.stderr.write

	process.stderr.write = ((
		...params: Parameters<typeof originalStderrWrite>
	): boolean => {
		if (typeof params[0] === "string") {
			recordError(params[0])
		} else {
			recordError(Buffer.from(params[0]).toString())
		}

		return originalStderrWrite(...params)
	}) as typeof originalStderrWrite

	process.on("uncaughtException", (error) => {
		recordError(error.stack || error.message)
	})

	process.on("unhandledRejection", (reason, promise) => {
		recordError(`Unhandled Rejection at: ${promise}\nReason: ${reason}`)
	})
}

export function getMonitoringStacks() {
	return { errorStacks, errorCooldowns }
}
