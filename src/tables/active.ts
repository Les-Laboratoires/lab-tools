import * as app from "../app.js"

export interface Active {
  guild_id: number
  user_id: number
}

export default new app.Table<Active>({
  name: "active",
  migrations: {
    1: (table) => {
      // add onDelete("CASCADE") on the guild_id and user_id references
      table.dropForeign("guild_id")
      table.dropForeign("user_id")
      table
        .integer("guild_id")
        .references("_id")
        .inTable("guild")
        .onDelete("CASCADE")
        .notNullable()
      table
        .integer("user_id")
        .references("_id")
        .inTable("user")
        .onDelete("CASCADE")
        .notNullable()
    },
  },
  setup: (table) => {
    table.integer("guild_id").references("_id").inTable("guild").notNullable()
    table.integer("user_id").references("_id").inTable("user").notNullable()
  },
})
