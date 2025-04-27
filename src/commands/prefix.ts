import { Command } from "#core/command"
import { prefix } from "#namespaces/tools"
import guilds from "#tables/guild"

export default new Command({
	name: "prefix",
	guildOwnerOnly: true,
	channelType: "guild",
	description: "Edit or show the bot prefix",
	positional: [
		{
			name: "prefix",
			description: "The new prefix",
			type: "string",
			validate: (value) => value.length < 10 && /^\S/.test(value),
		},
	],
	async run(message) {
		const _prefix = message.args.prefix

		if (!_prefix)
			return message.channel.send(
				`My current prefix for "**${message.guild}**" is \`${await prefix(
					message.guild,
				)}\``,
			)

		await guilds.query
			.insert({
				id: message.guild.id,
				prefix: _prefix,
			})
			.onConflict("id")
			.merge(["prefix"])

		await message.channel.send(
			`My new prefix for "**${message.guild}**" is \`${_prefix}\``,
		)
	},
})
