import { Table } from "@ghom/orm"

export interface AutoRole {
  guild_id: number
  role_id: string
  bot: boolean
}

export default new Table<AutoRole>({
  name: "autoRole",
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
