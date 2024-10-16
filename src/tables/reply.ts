import discord from "discord.js"
import { Table } from "#database"

export interface Reply {
  _id: number
  guild_id: number
  pattern: string | null
  channel: discord.Snowflake | "all" | null
  message: string
}

export default new Table<Reply>({
  name: "reply",
  description: "Stores the automatic replies",
  setup: (table) => {
    table.increments("_id").primary()
    table.integer("guild_id").notNullable()
    table.string("pattern")
    table.string("channel")
    table.string("message").notNullable()
  },
})
