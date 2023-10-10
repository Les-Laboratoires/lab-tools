import * as app from "../app.js"

import messages from "../tables/message.js"

export async function isActive(
  member: app.GuildMember,
  period = 1000 * 60 * 60 * 24 * 7,
  requiredMessageCount = 50
): Promise<boolean> {
  const user = await app.getUser(member, true)
  const guild = await app.getGuild(member.guild, true)

  const data = await messages.query
    .where("author_id", user._id)
    .where("guild_id", guild._id)
    .where("created_timestamp", ">", Date.now() - period)
    .select("count(*) as messageCount")
    .first()

  if(!data) return false

  return data.messageCount > requiredMessageCount
}
