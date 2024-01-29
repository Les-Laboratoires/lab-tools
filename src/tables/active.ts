import * as app from "../app.js"

export interface Active {
  guild_id: number
  user_id: number
  config_id: number
}

export default new app.Table<Active>({
  name: "active",
  setup: (table) => {
    table.integer("guild_id").references("_id").inTable("guild").notNullable()
    table.integer("user_id").references("_id").inTable("user").notNullable()
  },
  migrations: {
    1: (table) =>
      table
        .integer("config_id")
        .references("_id")
        .inTable("activeConfig")
        .notNullable(),
  },
})
