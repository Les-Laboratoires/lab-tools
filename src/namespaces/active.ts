import * as app from "../app.js"

import active from "../tables/active.js"

export async function isActive(
  member: app.GuildMember,
  period = 1000 * 60 * 60 * 24 * 7,
  messageCount = 50
): Promise<boolean> {
  const rowsInPeriod = await active.query
    .where("author_id", member.id)
    .where("guild_id", member.guild.id)
    .where("created_timestamp", ">", Date.now() - period)

  return rowsInPeriod.length > messageCount
}
