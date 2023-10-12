import * as app from "../app.js"

export interface Message extends app.Timestamps {
  author_id: number
  guild_id: number
}

export default new app.Table<Message>({
  name: "message",
  description: "Save all messages with dates",
  migrations: {
    1: (table) => {
      table.dropColumn("created_timestamp")
      table.timestamps(true, true)
    },
  },
  setup: (table) => {
    table
      .integer("author_id")
      .references("_id")
      .inTable("user")
      .onDelete("CASCADE")
      .notNullable()
    table
      .integer("guild_id")
      .references("_id")
      .inTable("guild")
      .onDelete("CASCADE")
      .notNullable()
    table.integer("created_timestamp", 15).notNullable().defaultTo(Date.now())
  },
})
