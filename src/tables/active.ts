import * as app from "../app.js"

export interface Active {
  author_id: string
  guild_id: string
  created_timestamp: number
}

export default new app.Table<Active>({
  name: "active",
  description: "Represent a message counter with date",
  setup: (table) => {
    table.string("author_id").notNullable()
    table.string("guild_id").notNullable()
    table.integer("created_timestamp", 15).notNullable().defaultTo(Date.now())
  },
})
