import * as app from "../app.js"

import guilds from "../tables/guild.js"

export async function prefix(guild?: app.Guild | null): Promise<string> {
  let prefix = process.env.BOT_PREFIX as string
  if (guild) {
    const guildData = await guilds.query
      .where("id", guild.id)
      .select("prefix")
      .first()
    if (guildData) {
      return guildData.prefix ?? prefix
    }
  }
  return prefix
}

export function shortNumber(number: number): string {
  if (number < 1000) return number.toString()
  if (number < 1000000) return `${(number / 1000).toFixed(1)}k`
  if (number < 1000000000) return `${(number / 1000000).toFixed(1)}M`
  if (number < 1000000000000) return `${(number / 1000000000).toFixed(1)}G`
  else return `${(number / 1000000000000).toFixed(1)}T`
}
