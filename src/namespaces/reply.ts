import * as app from "#app"

import replyTable, { Reply } from "#tables/reply.ts"

export const replies = new app.ResponseCache(async (guildId: number) => {
  return replyTable.query.where("guild_id", guildId)
}, 600_000)

export async function addReply(options: Omit<Reply, "_id">) {
  await replyTable.query.insert(options)
  await replies.fetch(options.guild_id)
}

export async function removeReply(replyId: number) {
  const reply = await replyTable.query
    .select("_id", "guild_id")
    .where("_id", replyId)
    .first()

  await replyTable.query.delete().where("_id", replyId)

  if (reply) await app.replies.fetch(reply.guild_id)
}
