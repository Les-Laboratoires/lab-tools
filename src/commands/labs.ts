import { positional } from "#core/argument"
import { Command, sendCommandDetails } from "#core/command"
import { CooldownType } from "#core/util"

import { emote } from "#namespaces/emotes"
import { sendLabList, updateLabsInAffiliationChannels } from "#namespaces/labs"
import { getGuild } from "#namespaces/tools"

import guild from "#tables/guild"
import lab from "#tables/lab"

export default new Command({
	name: "labs",
	aliases: ["lab", "affiliations", "affiliation"],
	description: "Get a lab invite link",
	channelType: "guild",
	positional: [
		{
			name: "name",
			description: "A part of lab name",
			type: "string",
		},
	],
	async run(message) {
		if (!message.args.name) return sendCommandDetails(message, this as any)

		const labs = await lab.query.select("guild_id", "title", "url")
		const guilds = await guild.query.select("id", "_id").where(
			"_id",
			"in",
			labs.map((lab) => lab.guild_id),
		)

		const result = guilds.filter((guild) =>
			message.client.guilds.cache
				.get(guild.id)
				?.name.toLowerCase()
				.includes(message.args.name.toLowerCase()),
		)

		if (!result)
			return message.channel.send(`${emote(message, "Cross")} No lab found`)

		const labResult = labs.find((lab) => lab.guild_id === result[0]._id)

		if (!labResult)
			return message.channel.send(`${emote(message, "Cross")} No lab found`)

		return message.channel.send(`${labResult.title} ${labResult.url}`)
	},
	subs: [
		new Command({
			name: "add",
			aliases: ["set"],
			description: "Add a lab",
			channelType: "guild",
			botOwnerOnly: true,
			positional: [
				{
					name: "url",
					description: "Lab invite url",
					type: "string",
					required: true,
				},
			],
			options: [
				{
					name: "id",
					description: "The guild id",
					type: "string",
				},
			],
			rest: {
				name: "title",
				description: "The displayed text",
				required: true,
			},
			async run(message) {
				const guild = message.args.id
					? await getGuild({ id: message.args.id })
					: await getGuild(message.guild, { forceExists: true })

				if (!guild)
					return message.channel.send(
						`${emote(message, "Cross")} Incorrect guild id`,
					)

				await lab.query
					.insert({
						guild_id: guild._id,
						url: message.args.url,
						title: message.args.title,
					})
					.onConflict("guild_id")
					.merge(["url", "title"])

				return message.channel.send(
					`${emote(message, "CheckMark")} Successfully added **${
						message.args.id
							? message.client.guilds.cache.get(message.args.id)?.name
							: message.guild.name
					}**`,
				)
			},
		}),
		new Command({
			name: "update",
			aliases: ["refresh"],
			description: "Update all affiliations",
			channelType: "guild",
			botOwnerOnly: true,
			cooldown: {
				duration: 10000,
				type: CooldownType.Global,
			},
			positional: [
				positional({
					name: "packSize",
					description: "How many labs to send per message",
					type: "number",
					validate: (value) => value > 0 && value <= 12,
					default: 10,
				}),
			],
			async run(message) {
				await updateLabsInAffiliationChannels(message, message.args.packSize)

				message.triggerCooldown()
			},
		}),
		new Command({
			name: "list",
			aliases: ["all"],
			description: "List all labs",
			channelType: "guild",
			positional: [
				{
					name: "packSize",
					description: "How many labs to send per message",
					type: "number",
					validate: (value: number) => value > 0 && value <= 12,
					default: "10",
				},
			],
			async run(message) {
				await sendLabList(message.channel, message.args.packSize)
			},
		}),
	],
})
