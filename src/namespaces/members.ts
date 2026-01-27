import { ThrottledQuery } from "@ghom/query"
import type discord from "discord.js"

const FETCH_ALL_COOLDOWN = 35_000

const fetchAllMembersQuery = new ThrottledQuery(
	async (guild: discord.Guild, options?: discord.FetchMembersOptions) => {
		guild.members.cache.clear()
		return guild.members.fetch(options)
	},
	FETCH_ALL_COOLDOWN,
	{ leading: true, trailing: true },
)

export async function fetchAllMembers(
	guild: discord.Guild,
	options?: discord.FetchMembersOptions,
): Promise<discord.Collection<string, discord.GuildMember>> {
	return fetchAllMembersQuery.execute("global", guild, options)
}
