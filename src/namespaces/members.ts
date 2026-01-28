import { Query } from "@ghom/query"
import type discord from "discord.js"

const FETCH_ALL_COOLDOWN = 35_000
const FETCH_TIMEOUT = 300_000 // 5 minutes au lieu de 2 minutes par défaut
const MAX_RETRIES = 3
const RETRY_DELAY = 5_000

const fetchAllMembersQuery = new Query(
	async (guild: discord.Guild, options?: discord.FetchMembersOptions) => {
		guild.members.cache.clear()
		return guild.members.fetch({ time: FETCH_TIMEOUT, ...options })
	},
	{
		keyFn: () => "global",
		throttle: {
			interval: FETCH_ALL_COOLDOWN,
			leading: true,
			trailing: true,
		},
		retry: {
			attempts: MAX_RETRIES,
			delay: RETRY_DELAY,
		},
		timeout: FETCH_TIMEOUT,
	},
)

export async function fetchAllMembers(
	guild: discord.Guild,
	options?: discord.FetchMembersOptions,
): Promise<discord.Collection<string, discord.GuildMember>> {
	return fetchAllMembersQuery.execute(guild, options)
}
