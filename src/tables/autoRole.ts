import * as app from "../app.js"

/*
832615381377089546
832620331969413191
832613931893260350
824924421818023956
824924771065659402
828648602381451314
*/

export interface AutoRole {
  guild_id: string
  role_id: string
  bot: 0 | 1
}

export default new app.Table<AutoRole>({
  name: "autoRole",
  setup: (table) => {
    table
      .string("guild_id")
      .references("id")
      .inTable("guild")
      .onDelete("CASCADE")
      .notNullable()
    table.string("role_id").notNullable()
    table.boolean("bot").notNullable().defaultTo(0)
  },
})
