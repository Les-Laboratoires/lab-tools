import * as app from "#app"

export interface Lab {
  guild_id: number
  url: string
  title: string
  ignored: boolean
}

export default new app.Table<Lab>({
  name: "labs",
  migrations: {
    1: (table) => {
      table.unique(["guild_id"])
    },
    2: (table) => {
      table.boolean("ignored").defaultTo(false)
    },
  },
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
