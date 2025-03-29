import { Listener } from "#core/listener"
import { formatDuration } from "#namespaces/date"
import restart, { type Restart } from "#tables/restart"

import { logger } from "@ghom/logger"
import { filename } from "dirname-filename-esm"

const __filename = filename(import.meta)

export default new Listener({
	event: "ready",
	description: "Send restart messages",
	once: true,
	async run(client) {
		const restartMessages: Restart[] = await restart.query.select()

		logger.log("restart messages: " + restartMessages.length)

		for (const restartMessage of restartMessages) {
			const channel = await client.channels.fetch(
				restartMessage.last_channel_id,
				{ force: true },
			)

			if (channel?.isSendable()) {
				const content = `${restartMessage.content} (${formatDuration(restartMessage.created_at)})`

				if (!restartMessage.last_message_id) await channel.send(content)
				else {
					const message = await channel.messages.fetch(
						restartMessage.last_message_id,
					)

					try {
						await message.edit(content)
					} catch (error: any) {
						logger.error(error, __filename)
					}
				}
			} else {
				logger.error(
					`channel ${restartMessage.last_channel_id} is not a text channel`,
					__filename,
				)
			}
		}

		await restart.query.delete()
	},
})
