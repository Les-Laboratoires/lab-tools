import { WebhookClient } from "discord.js"

import { Command } from "#core/command"
import { CooldownType } from "#core/util"

import { emote } from "#namespaces/emotes"

export default new Command({
	name: "fake",
	description: "Fake an user message",
	channelType: "guild",
	botPermissions: ["ManageWebhooks"],
	cooldown: {
		duration: 10000,
		type: CooldownType.ByGuild,
	},
	positional: [
		{
			name: "target",
			description: "The faked user",
			type: "user",
			required: true,
		},
	],
	rest: {
		name: "content",
		description: "The content of the faked message",
		required: true,
	},
	async run(message) {
		const user = message.args.target

		message.triggerCooldown()

		let name = user.username

		try {
			const member = await message.guild.members.fetch(user.id)

			name = member.displayName
		} catch {}

		const webhook = await message.channel.createWebhook({
			name,
			avatar: user.displayAvatarURL(),
		})

		if (webhook.token) {
			const client = new WebhookClient(webhook)
			await client.send(message.rest)
			client.destroy()
		} else {
			await message.channel.send(`${emote(message, "Cross")} Permission error`)
		}
		await message.delete().catch()
		await webhook.delete().catch()
	},
})
