import * as app from "../app.js"

export interface AutoRole {
  guild_id: number
  role_id: string
  bot: boolean
}

export default new app.Table<AutoRole>({
  name: "autoRole",
  description: "Represent auto-roles",
  setup: (table) => {
    table
      .integer("guild_id")
      .references("_id")
      .inTable("guild")
      .onDelete("CASCADE")
      .notNullable()
    table.string("role_id").notNullable()
    table.boolean("bot").notNullable().defaultTo(false)
  },
})
