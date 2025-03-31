import { ResponseCache } from "@ghom/orm"

import replyTable, { type Reply } from "#tables/reply"

export const replies = new ResponseCache(async (guildId: number) => {
	return replyTable.query.where("guild_id", guildId)
}, 600_000)

export async function addReply(options: Omit<Reply, "_id">) {
	await replyTable.query.insert(options)
	await replies.fetch(String(options.guild_id), options.guild_id)
}

export async function removeReply(replyId: number) {
	const reply = await replyTable.query
		.select("_id", "guild_id")
		.where("_id", replyId)
		.first()

	await replyTable.query.delete().where("_id", replyId)

	if (reply) await replies.fetch(String(reply.guild_id), reply.guild_id)
}
