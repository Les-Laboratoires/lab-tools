import fs from "node:fs"
import path from "node:path"

import { Command, sendCommandDetails } from "#core/command"
import database from "#core/database"
import { DynamicPaginator } from "#core/pagination"
import { formatDuration } from "#namespaces/date"
import { emote } from "#namespaces/emotes"
import restart from "#tables/restart"

export default new Command({
	name: "backup",
	description: "Manage database backups",
	channelType: "all",
	botOwnerOnly: true,
	async run(message) {
		return sendCommandDetails(message, this)
	},
	subs: [
		new Command({
			name: "create",
			description: "Create a database backup",
			aliases: ["new", "add", "save"],
			channelType: "all",
			botOwnerOnly: true,
			positional: [
				{
					name: "name",
					description: "The name of the backup",
					required: true,
					type: "string",
				},
			],
			async run(message) {
				try {
					const backups = await fs.promises.readdir(
						database.config.backups!.location!,
					)

					if (backups.includes(message.args.name)) {
						return message.reply(
							`${emote(message, "Cross")} Backup with that name already exists.`,
						)
					}
				} catch {}

				const view = await message.reply(
					`${emote(message, "Loading")} Creating backup...`,
				)

				const startAt = new Date().toISOString()

				await database.createBackup(message.args.name)

				return view.edit(
					`${emote(message, "CheckMark")} Successfully created backup (${formatDuration(startAt)})`,
				)
			},
		}),
		new Command({
			name: "restore",
			description: "Restore a database backup",
			aliases: ["load"],
			channelType: "all",
			botOwnerOnly: true,
			positional: [
				{
					name: "name",
					description: "The name of the backup",
					required: true,
					type: "string",
				},
			],
			async run(message) {
				const view = await message.reply(
					`${emote(message, "Loading")} Restoring backup...`,
				)

				await database.restoreBackup(message.args.name)

				const created_at = new Date().toISOString()

				await restart.query.insert({
					content: `${emote(message, "CheckMark")} Successfully restored the "${message.args.name}" backup and restarted the bot.`,
					last_channel_id: message.channel.id,
					last_message_id: view.id,
					created_at,
				})

				process.exit(0)
			},
		}),
		new Command({
			name: "list",
			description: "List all database backups",
			aliases: ["ls"],
			channelType: "all",
			botOwnerOnly: true,
			async run(message) {
				try {
					const backups = await fs.promises.readdir(
						database.config.backups!.location!,
					)

					if (backups.length === 0) {
						return message.reply(`${emote(message, "Cross")} No backups found.`)
					}

					new DynamicPaginator({
						target: message.channel,
						filter: (reaction, user) => user.id === message.author.id,
						fetchPageCount: () => backups.length,
						fetchPage: async (pageIndex) => {
							const name = backups[pageIndex]

							const chunks = await fs.promises.readdir(
								path.join(database.config.backups!.location!, name),
							)

							return {
								content: `**${name}**\n${chunks.map((chunk) => `- ${chunk}`).join("\n")}`,
							}
						},
					})
				} catch {
					return message.reply(`${emote(message, "Cross")} No backups found.`)
				}
			},
		}),
	],
})
