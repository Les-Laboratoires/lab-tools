import * as app from "../app"

export interface AutoRole {
  guild_id: string
  role_id: string
}

const table = new app.Table<AutoRole>({
  name: "autoRole",
  setup: (table) => {
    table
      .string("guild_id")
      .references("id")
      .inTable("guild")
      .onDelete("CASCADE")
      .notNullable()
    table.string("role_id").notNullable()
  },
})

export default table
