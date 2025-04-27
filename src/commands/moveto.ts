import {
	type GuildChannel,
	type Message,
	type Webhook,
	WebhookClient,
} from "discord.js"

import { Command } from "#core/command"
import { CooldownType } from "#core/util"

import { emote } from "#namespaces/emotes"
import { staffOnly } from "#namespaces/middlewares"

export default new Command({
	name: "moveto",
	description: "Move a conversation to another channel",
	channelType: "guild",
	aliases: ["move", "mt", "mv"],
	botPermissions: ["ManageWebhooks", "ManageMessages"],
	middlewares: [staffOnly],
	cooldown: {
		duration: 10000,
		type: CooldownType.ByGuild,
	},
	positional: [
		{
			name: "destination",
			description: "The destination channel",
			type: "channel",
			required: true,
		},
		{
			name: "firstMessage",
			description: "The first message of the conversation to move",
			type: "message",
			required: true,
		},
	],
	async run(message) {
		const destination = message.args.destination as GuildChannel
		const firstMessage = message.args.firstMessage as Message<true>

		try {
			await message.delete()
		} catch {}

		if (!destination.isTextBased())
			return await message.channel.send(
				`${emote(message, "Cross")} Destination channel must be a guild text channel.`,
			)

		if (!message.guild.channels.cache.has(destination.id))
			return await message.channel.send(
				`${emote(message, "Cross")} Destination channel must be in the same guild.`,
			)

		if (firstMessage.channel.id !== message.channel.id)
			return await message.channel.send(
				`${emote(message, "Cross")} First message must be in the same channel.`,
			)

		// Show view

		const view = await message.channel.send(
			`${emote(message, "Loading")} Fetching messages...`,
		)

		// Fetch the messages to move

		let messages = await message.channel.messages
			.fetch({ after: firstMessage.id, cache: false })
			.then((result) => Array.from(result.values()))

		messages.push(firstMessage)
		messages = messages.filter((m) => m.id !== view.id)

		const messageCountToDelete = messages.length

		if (messages.length === 0)
			return await view.edit(`${emote(message, "Cross")} No messages found.`)

		if (messages.length > 20) messages = messages.slice(0, 20)

		// Trigger cooldown after the validation check

		message.triggerCooldown()

		// Group the message authors

		const authors = new Set(messages.map((msg) => msg.author))

		// Prepare webhooks for message author

		await view.edit(
			`${emote(message, "Loading")} Creating webhooks for **${authors.size}** users...`,
		)

		const webhooks = new Map<
			string,
			{ webhook: Webhook; client: WebhookClient }
		>()

		for (const author of authors) {
			const webhook = await destination.createWebhook({
				name:
					message.guild.members.cache.get(author.id)?.displayName ??
					author.username,
				avatar: author.displayAvatarURL(),
			})

			if (!webhook.token) continue

			const client = new WebhookClient(webhook)

			webhooks.set(author.id, { webhook, client })
		}

		if (messages.some((m) => m.system)) {
			const webhook = await destination.createWebhook({
				name: "System",
				avatar: message.guild.iconURL(),
			})

			if (webhook.token) {
				const client = new WebhookClient(webhook)

				webhooks.set("system", { webhook, client })
			}
		}

		// Send the messages to the destination channel

		await view.edit(
			`${emote(message, "Loading")} Sending **${messages.length}** messages...`,
		)

		for (const m of messages.toReversed()) {
			const webhookObject = webhooks.get(m.author.id) ?? webhooks.get("system")

			if (!webhookObject) {
				messages.splice(messages.indexOf(m), 1)
				continue
			}

			try {
				await webhookObject.client.send({
					content: m.content,
					embeds: m.embeds,
					files: m.attachments.map((a) => a.url),
				})
			} catch {
				messages.splice(messages.indexOf(m), 1)
			}
		}

		await view.edit(
			`${emote(message, "Loading")} Deleting **${messages.length}** old messages...`,
		)

		try {
			await message.channel.bulkDelete(messages)
		} catch {}

		for (const { client, webhook } of webhooks.values()) {
			client.destroy()
			try {
				await webhook.delete()
			} catch {}
		}

		await view.edit(
			`${emote(message, "CheckMark")} Conversation moved to ${destination}${
				messages.length < messageCountToDelete
					? ` (**${messageCountToDelete - messages.length}** messages failed to move)`
					: ""
			}`,
		)
	},
})
