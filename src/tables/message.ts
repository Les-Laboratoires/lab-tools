import * as app from "../app.js"

export interface Message {
  author_id: number
  guild_id: number
  created_at: string
}

export default new app.Table<Message>({
  name: "message",
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
    app.addCreatedAt(table)
  },
})
