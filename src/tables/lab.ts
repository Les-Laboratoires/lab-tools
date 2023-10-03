import * as app from "../app.js"

export interface Lab {
  guild_id: number
  url: string
  title: string
}

export default new app.Table<Lab>({
  name: "labs",
  description: "Represent a lab guild",
  setup: (table) => {
    table
      .integer("guild_id")
      .references("_id")
      .inTable("guild")
      .onDelete("CASCADE")
      .notNullable()
    table.string("url").notNullable()
    table.string("title").notNullable()
  },
})
