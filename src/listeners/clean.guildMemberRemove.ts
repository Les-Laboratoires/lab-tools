import { Listener } from "#core/listener"
import { getGuild, sendLog } from "#namespaces/tools"
import users from "#tables/user"

export default new Listener({
	event: "guildMemberRemove",
	description: "Remove member from db",
	async run(member) {
		const { guild } = member

		const config = await getGuild(guild)

		const user = await member.client.users.fetch(member.id)

		const isMemberInOtherGuilds = member.client.guilds.cache
			.filter((g) => g.id !== guild.id)
			.some((g) => g.members.cache.has(member.id))

		if (isMemberInOtherGuilds) {
			await sendLog(guild, `\`${user.tag}\` left the guild.`, config)
		} else {
			await users.query.delete().where({ id: member.id })
			await sendLog(
				guild,
				`\`${member.user?.tag ?? member.displayName}\` left all the labs.`,
				config,
			)
		}
	},
})
