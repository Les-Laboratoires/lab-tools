import * as app from "../app.js"

import messages from "../tables/message.js"

export async function isActive(
  member: app.GuildMember,
  period = 1000 * 60 * 60 * 24 * 7,
  messageCount = 50
): Promise<boolean> {
  // Get the user id

  const user = await app.getUser(member, true)
  const guild = await app.getGuild(member.guild, true)

  const rowsInPeriod = await messages.query
    .where("author_id", user._id)
    .where("guild_id", guild._id)
    .where("created_timestamp", ">", Date.now() - period)

  return rowsInPeriod.length > messageCount
}
