import Discord from "discord.js"
import prettier from "prettier"

import guilds from "../tables/guilds"

export async function prefix(guild?: Discord.Guild): Promise<string> {
  let prefix = process.env.PREFIX as string
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

export function formatJSCode(code: string, options?: prettier.Options): string {
  return prettier.format(code, {
    semi: false,
    ...(options ?? {}),
  })
}
