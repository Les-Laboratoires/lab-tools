import discord from "discord.js"
import { Command, sendCommandDetails } from "#core/command"
import { emote } from "#namespaces/emotes"
import * as middlewares from "#namespaces/middlewares"
import * as tools from "#namespaces/tools"
import autoRole from "#tables/autoRole"

export default new Command({
	name: "autoRole",
	aliases: ["ar", "autorole"],
	description: "Manage the auto roles",
	channelType: "all",
	async run(message) {
		return sendCommandDetails(message, this)
	},
	subs: [
		new Command({
			name: "set",
			description: "Set auto role list",
			channelType: "guild",
			middlewares: [middlewares.staffOnly],
			positional: [
				{
					name: "roles",
					type: "array",
					required: true,
					description: "Role list",
				},
			],
			flags: [
				{
					name: "bot",
					aliases: ["for-bot", "bot-only"],
					description: "Is auto roles for bots",
					flag: "b",
				},
			],
			async run(message) {
				const guild = await tools.getGuild(message.guild, { forceExists: true })

				await autoRole.query.delete().where("guild_id", guild._id)
				await autoRole.query.insert(
					message.args.roles.map((roleId: string) => {
						return {
							guild_id: guild._id,
							role_id: roleId,
							bot: message.args.bot,
						}
					}),
				)

				return message.channel.send(
					`${emote(message, "CheckMark")} Auto-roles are successfully pushed.`,
				)
			},
		}),
		new Command({
			name: "add",
			description: "Add auto role",
			channelType: "guild",
			middlewares: [middlewares.staffOnly],
			positional: [
				{
					name: "role",
					type: "role",
					required: true,
					description: "Role to add",
				},
			],
			flags: [
				{
					name: "bot",
					aliases: ["for-bot", "bot-only"],
					description: "Is bot auto-role",
					flag: "b",
				},
			],
			async run(message) {
				const guild = await tools.getGuild(message.guild, { forceExists: true })

				await autoRole.query.insert({
					guild_id: guild._id,
					role_id: message.args.role.id,
					bot: message.args.bot,
				})

				return message.channel.send(
					`${emote(message, "CheckMark")} Auto-role is successfully pushed.`,
				)
			},
		}),
		new Command({
			name: "list",
			aliases: ["ls"],
			description: "List auto roles",
			channelType: "guild",
			async run(message) {
				const guild = await tools.getGuild(message.guild, { forceExists: true })

				const autoRoles = await autoRole.query.where("guild_id", guild._id)

				return message.channel.send({
					embeds: [
						new discord.EmbedBuilder()
							.setColor("Blurple")
							.setTitle("Auto-role list")
							.addFields([
								{
									name: "Member auto roles",
									value:
										autoRoles
											.filter((ar) => !ar.bot)
											.map((ar) => `<@&${ar.role_id}>`)
											.join(" ") || "No role setup here.",
								},
								{
									name: "Bot auto roles",
									value:
										autoRoles
											.filter((ar) => !!ar.bot)
											.map((ar) => `<@&${ar.role_id}>`)
											.join(" ") || "No role setup here.",
								},
							]),
					],
				})
			},
		}),
		new Command({
			name: "apply",
			description: "Apply auto-roles to member",
			middlewares: [middlewares.staffOnly],
			channelType: "guild",
			positional: [
				{
					name: "target",
					description: "Target member",
					required: true,
					type: "member",
				},
			],
			async run(message) {
				const target: discord.GuildMember = message.args.target

				await tools.applyAutoRoles(target)

				return message.channel.send(
					`${emote(
						message,
						"CheckMark",
					)} Auto-roles are successfully applied to **${
						target.user.username
					}**.`,
				)
			},
			subs: [
				new Command({
					name: "all",
					description: "Apply auto-roles to all guild members",
					aliases: ["*"],
					channelType: "guild",
					async run(message) {
						const waiting = await message.channel.send(
							`${emote(message, "Loading")} Fetching members...`,
						)

						const members = Array.from(
							(await message.guild.members.fetch()).values(),
						)

						message.guild.members.cache.clear()

						await waiting.edit(
							`${emote(message, "Loading")} Applying auto-roles to members...`,
						)

						for (const member of members) {
							await tools.applyAutoRoles(member)

							const index = members.indexOf(member)

							await tools.sendProgress(
								waiting,
								index,
								members.length,
								"Applying auto-roles to members... (`$%` %)",
							)
						}

						return message.channel.send(
							`${emote(
								message,
								"CheckMark",
							)} Auto-roles are successfully applied to **${
								members.length
							}** members.`,
						)
					},
				}),
			],
		}),
	],
})
