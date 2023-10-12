import * as app from "../app.js"

import guilds from "../tables/guild.js"

export async function prefix(guild?: app.Guild): Promise<string> {
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

export const databasePatterns = {
  tableNames: () => {
    switch (app.getDatabaseDriverName()) {
      case "sqlite3":
        return "SELECT name FROM sqlite_master WHERE type='table'"
      case "pg":
        return "SELECT table_name as name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'"
      default:
        return `SELECT table_name as name FROM information_schema.tables WHERE table_schema='${process.env.DB_DATABASE}' AND table_type='BASE TABLE'`
    }
  },
  tableInfo: (name: string) => {
    switch (app.getDatabaseDriverName()) {
      case "sqlite3":
        return `PRAGMA table_info(${name})`
      case "pg":
        return `SELECT column_name as name, data_type as type, column_default as dflt_value FROM information_schema.columns WHERE table_name='${name}'`
      default:
        return `SELECT column_name as name, data_type as type, column_default as dflt_value FROM information_schema.columns WHERE table_name='${name}'`
    }
  },
}

export function shortNumber(number: number): string {
  if (number < 1000) return number.toString()
  if (number < 1000000) return `${(number / 1000).toFixed(1)}k`
  if (number < 1000000000) return `${(number / 1000000).toFixed(1)}M`
  if (number < 1000000000000) return `${(number / 1000000000).toFixed(1)}G`
  else return `${(number / 1000000000000).toFixed(1)}T`
}
